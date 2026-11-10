// Accessibility check of the running web client with axe (SCF-AC-5.2, SCF-AC-5.3).
// Waits until the web client answers, opens every page of `pages`, runs axe, and exits with 1
// if the server does not come up, a page does not load, or a page has a violation of impact
// "critical". The pages of the design system (R4, DSA-AC-3.5) are added to `pages`.
// It also checks the accessibility modes of the design system in the browser on every page: no
// horizontal scroll at 1280 px with the root font size at 200 % (DSA-AC-2.5, DSA-T-11) and no
// animation or transition under prefers-reduced-motion and under data-motion="reduced"
// (DSA-AC-2.3, DSA-T-9).
// Usage: BASE_URL=http://localhost:3000 node tests/accessibility/axe-check.ts
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import { AxeBuilder } from "@axe-core/playwright";
import { type Browser, chromium, type Page } from "playwright";

const pages: string[] = ["/"];
const baseUrl: string = process.env.BASE_URL ?? "http://localhost:3000";
const startTimeoutMs: number = Number(process.env.START_TIMEOUT_MS ?? 60000);

async function waitForServer(): Promise<void> {
  const deadline: number = Date.now() + startTimeoutMs;
  while (Date.now() < deadline) {
    try {
      // baseUrl comes from the pipeline configuration, never from user input.
      await fetch(baseUrl); // nosemgrep: nextjs-ssrf-fetch
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw new Error(`${baseUrl} did not answer within ${startTimeoutMs} ms`);
}

/** Loads `path` in `page` and fails if the server does not answer with success. */
async function open(page: Page, path: string): Promise<void> {
  const response = await page.goto(new URL(path, baseUrl).toString());
  if (!response?.ok()) {
    throw new Error(`${path} answered with HTTP ${response?.status()}`);
  }
}

/** The elements (and pseudo-elements) of the page that still run a transition or animation. */
async function movingElements(page: Page): Promise<string[]> {
  return page.evaluate((): string[] => {
    const isStopped = (durations: string): boolean =>
      durations.split(",").every((duration: string): boolean => {
        const value: number = Number.parseFloat(duration);
        const milliseconds: number = duration.trim().endsWith("ms")
          ? value
          : value * 1000;
        return Number.isNaN(milliseconds) || milliseconds <= 1;
      });
    const found: string[] = [];
    for (const element of document.querySelectorAll("*")) {
      for (const pseudo of [null, "::before", "::after"]) {
        const style: CSSStyleDeclaration = getComputedStyle(element, pseudo);
        if (
          !isStopped(style.transitionDuration) ||
          !isStopped(style.animationDuration)
        ) {
          found.push(`${element.tagName.toLowerCase()}${pseudo ?? ""}`);
        }
      }
    }
    return found;
  });
}

/** Elements whose content sticks out of their own box, which is how a fixed width breaks at 200 %. */
async function overflowingElements(page: Page): Promise<string[]> {
  return page.evaluate((): string[] =>
    [...document.querySelectorAll("body *")]
      .filter((element: Element): boolean => {
        const style: CSSStyleDeclaration = getComputedStyle(element);
        return (
          style.display !== "inline" &&
          style.overflowX === "visible" &&
          element.clientWidth > 0 &&
          element.scrollWidth > element.clientWidth + 1
        );
      })
      .map((element: Element): string => {
        const text: string = (element.textContent ?? "").trim().slice(0, 20);
        return `${element.tagName.toLowerCase()} "${text}"`;
      }),
  );
}

await waitForServer();
const browser: Browser = await chromium.launch();
let critical: number = 0;
let failures: number = 0;
/** Reports a failed check of an accessibility mode. */
function fail(path: string, message: string): void {
  console.log(`${path}: ${message}`);
  failures += 1;
}
try {
  const context = await browser.newContext();
  for (const path of pages) {
    const page = await context.newPage();
    await open(page, path);
    const { violations } = await new AxeBuilder({ page }).analyze();
    for (const violation of violations) {
      console.log(
        `${path}: ${violation.impact ?? "unknown"} ${violation.id} — ${violation.help} (${violation.nodes.length} element(s))`,
      );
      if (violation.impact === "critical") critical += 1;
    }
    await page.close();
  }

  // Font size 200 % (DSA-AC-2.5): the root font size doubles, the layout stays within 1280 px.
  for (const path of pages) {
    const page = await context.newPage();
    await page.setViewportSize({ width: 1280, height: 800 });
    await open(page, path);
    await page.evaluate((): void => {
      document.documentElement.style.fontSize = "200%";
    });
    const { scrollWidth, clientWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    if (scrollWidth > clientWidth) {
      fail(
        path,
        `horizontal scroll at 200 % font size (${scrollWidth} px wide in ${clientWidth} px)`,
      );
    }
    const cutOff = await overflowingElements(page);
    if (cutOff.length > 0) {
      fail(
        path,
        `content wider than its box at 200 % font size (${cutOff.join(", ")})`,
      );
    }
    await page.close();
  }

  // Reduced motion (DSA-AC-2.3): by the system preference and by the mode the member sets by hand.
  const reduced = await browser.newContext({ reducedMotion: "reduce" });
  for (const [context_, how] of [
    [reduced, "prefers-reduced-motion"],
    [context, 'data-motion="reduced"'],
  ] as const) {
    for (const path of pages) {
      const page = await context_.newPage();
      await open(page, path);
      if (how.startsWith("data-motion")) {
        await page.evaluate((): void => {
          document.documentElement.dataset.motion = "reduced";
        });
      }
      const moving = await movingElements(page);
      if (moving.length > 0) {
        fail(
          path,
          `${how}: ${moving.length} element(s) still animate or transition (${[...new Set(moving)].join(", ")})`,
        );
      }
      await page.close();
    }
  }
  await reduced.close();
} finally {
  await browser.close();
}

console.log(
  `axe: ${pages.length} page(s) checked, ${critical} critical violation(s), ${failures} failed mode check(s)`,
);
process.exitCode = critical > 0 || failures > 0 ? 1 : 0;
