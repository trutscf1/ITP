// Accessibility check of the running web client with axe (SCF-AC-5.2, SCF-AC-5.3).
// Waits until the web client answers, opens every page of `pages`, runs axe, and exits with 1
// if the server does not come up, a page does not load, or a page has a violation of impact
// "critical". The pages of the design system (R4, DSA-AC-3.5) are added to `pages`.
// It also checks the accessibility modes of the design system in the browser on every page, and
// every failure names the criterion it belongs to:
//   - axe and the 200 % check also run with the accessibility popover open;
//   - 200 % root font size at 1280 px: no horizontal scroll, no content wider than its box, no
//     text cut off by overflow hidden or clip (DSA-AC-2.5, DSA-T-11);
//   - no animation or transition under prefers-reduced-motion and under data-motion="reduced"
//     (DSA-AC-2.3, DSA-T-9);
//   - with prefers-contrast: more emulated, <body> shows the high-contrast palette read from
//     tokens.css (DSA-AC-2.3, DSA-AC-2.1, DSA-T-7);
//   - switching high contrast on in the popover sets data-contrast at once and survives a reload
//     (DSA-AC-2.4, DSA-F-17, DSA-T-17).
// Usage: BASE_URL=http://localhost:3000 node tests/accessibility/axe-check.ts
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import { readFileSync } from "node:fs";
import { AxeBuilder } from "@axe-core/playwright";
import {
  type Browser,
  type BrowserContext,
  chromium,
  type Page,
} from "playwright";

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

/** What sticks out of its box at the moment: content wider than its box, and text that overflow hides. */
async function brokenLayout(
  page: Page,
): Promise<{ wider: string[]; cutOff: string[] }> {
  return page.evaluate((): { wider: string[]; cutOff: string[] } => {
    const wider: string[] = [];
    const cutOff: string[] = [];
    for (const element of document.querySelectorAll("body *")) {
      const style: CSSStyleDeclaration = getComputedStyle(element);
      // Boxes of 1 px are hidden for sighted users on purpose (screen-reader-only text).
      if (
        style.display === "inline" ||
        element.clientWidth <= 1 ||
        element.clientHeight <= 1
      ) {
        continue;
      }
      const label: string = `${element.tagName.toLowerCase()} "${(element.textContent ?? "").trim().slice(0, 20)}"`;
      const hides: boolean = ["hidden", "clip"].some(
        (value: string): boolean =>
          style.overflowX === value || style.overflowY === value,
      );
      const tooWide: boolean = element.scrollWidth > element.clientWidth + 1;
      const tooHigh: boolean = element.scrollHeight > element.clientHeight + 1;
      if (!hides && style.overflowX === "visible" && tooWide) wider.push(label);
      if (hides && (tooWide || tooHigh) && (element.textContent ?? "").trim()) {
        cutOff.push(label);
      }
    }
    return { wider, cutOff };
  });
}

/** Opens the popover of the accessibility settings by its button. */
async function openSettings(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Accessibility" }).click();
  await page.getByRole("dialog", { name: "Accessibility settings" }).waitFor();
}

/** `data-contrast` of the root element. */
async function contrastAttribute(page: Page): Promise<string | undefined> {
  return page.evaluate(
    (): string | undefined => document.documentElement.dataset.contrast,
  );
}

/** `#rrggbb` as the `rgb(r, g, b)` that getComputedStyle returns. */
function asRgb(hex: string): string {
  const [r, g, b] = [1, 3, 5].map((start: number): number =>
    Number.parseInt(hex.slice(start, start + 2), 16),
  );
  return `rgb(${r}, ${g}, ${b})`;
}

/** Background and text colour of the light high-contrast palette, read from the token stylesheet. */
function highContrastPalette(): { background: string; foreground: string } {
  const css: string = readFileSync(
    new URL("../../packages/ui/src/tokens.css", import.meta.url),
    "utf8",
  );
  const block: string =
    css.match(/\[data-contrast="high"\]\s*\{([^}]*)\}/)?.[1] ?? "";
  const colour = (token: string): string => {
    const hex: string | undefined = block.match(
      new RegExp(`${token}:\\s*(#[0-9a-fA-F]{6})`),
    )?.[1];
    if (!hex)
      throw new Error(`tokens.css has no ${token} in [data-contrast="high"]`);
    return asRgb(hex);
  };
  return {
    background: colour("--color-background"),
    foreground: colour("--color-foreground"),
  };
}

let critical: number = 0;
let failures: number = 0;
/** Reports a failed check of an accessibility mode, with the criterion it belongs to. */
function fail(path: string, criterion: string, message: string): void {
  console.log(`${path}: [${criterion}] ${message}`);
  failures += 1;
}

/** Runs axe on the page and counts the violations of impact "critical". */
async function runAxe(page: Page, path: string, state: string): Promise<void> {
  const { violations } = await new AxeBuilder({ page }).analyze();
  for (const violation of violations) {
    console.log(
      `${path} (${state}): ${violation.impact ?? "unknown"} ${violation.id} — ${violation.help} (${violation.nodes.length} element(s))`,
    );
    if (violation.impact === "critical") critical += 1;
  }
}

await waitForServer();
const browser: Browser = await chromium.launch();
try {
  const context: BrowserContext = await browser.newContext();

  // axe, with the accessibility popover closed and open (DSA-AC-3.5 for the new controls).
  for (const path of pages) {
    for (const withPopover of [false, true]) {
      const page = await context.newPage();
      await open(page, path);
      if (withPopover) await openSettings(page);
      await runAxe(page, path, withPopover ? "popover open" : "popover closed");
      await page.close();
    }
  }

  // Font size 200 % (DSA-AC-2.5, DSA-T-11): the root font size doubles, the layout stays within 1280 px.
  for (const path of pages) {
    for (const withPopover of [false, true]) {
      const state: string = withPopover ? "popover open" : "popover closed";
      const criterion = "DSA-AC-2.5 DSA-T-11";
      const page = await context.newPage();
      await page.setViewportSize({ width: 1280, height: 800 });
      await open(page, path);
      await page.evaluate((): void => {
        document.documentElement.style.fontSize = "200%";
      });
      if (withPopover) await openSettings(page);
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      if (scrollWidth > clientWidth) {
        fail(
          path,
          criterion,
          `horizontal scroll at 200 % font size, ${state} (${scrollWidth} px wide in ${clientWidth} px)`,
        );
      }
      const { wider, cutOff } = await brokenLayout(page);
      if (wider.length > 0) {
        fail(
          path,
          criterion,
          `content wider than its box at 200 % font size, ${state} (${wider.join(", ")})`,
        );
      }
      if (cutOff.length > 0) {
        fail(
          path,
          criterion,
          `text cut off at 200 % font size, ${state} (${cutOff.join(", ")})`,
        );
      }
      await page.close();
    }
  }

  // Reduced motion (DSA-AC-2.3, DSA-T-9): by the system preference and by the mode the member sets by hand.
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
          "DSA-AC-2.3 DSA-T-9",
          `${how}: ${moving.length} element(s) still animate or transition (${[...new Set(moving)].join(", ")})`,
        );
      }
      await page.close();
    }
  }
  await reduced.close();

  // Contrast of the system (DSA-AC-2.3, DSA-AC-2.1, DSA-T-7): prefers-contrast: more without any attribute.
  const palette = highContrastPalette();
  for (const path of pages) {
    const page = await context.newPage();
    await page.emulateMedia({ contrast: "more" });
    await open(page, path);
    const seen = await page.evaluate(() => {
      const style: CSSStyleDeclaration = getComputedStyle(document.body);
      return { background: style.backgroundColor, foreground: style.color };
    });
    if (
      seen.background !== palette.background ||
      seen.foreground !== palette.foreground
    ) {
      fail(
        path,
        "DSA-AC-2.3 DSA-AC-2.1 DSA-T-7",
        `prefers-contrast: more: body is ${seen.foreground} on ${seen.background}, not the high-contrast ${palette.foreground} on ${palette.background}`,
      );
    }
    await page.close();
  }

  // Settings remembered in the browser (DSA-AC-2.4, DSA-F-17, DSA-T-17): own context, own cookies.
  const member = await browser.newContext();
  for (const path of pages) {
    const criterion = "DSA-AC-2.4 DSA-F-17 DSA-T-17";
    const page = await member.newPage();
    try {
      await open(page, path);
      await openSettings(page);
      await page.getByRole("switch", { name: "High contrast" }).click();
      if ((await contrastAttribute(page)) !== "high") {
        fail(
          path,
          criterion,
          "high contrast does not set data-contrast at once",
        );
      }
      await page.reload();
      if ((await contrastAttribute(page)) !== "high") {
        fail(path, criterion, "data-contrast is gone after a reload");
      }
      // Reset through the same control, so the next run starts from the defaults.
      await openSettings(page);
      await page.getByRole("switch", { name: "High contrast" }).click();
      if ((await contrastAttribute(page)) !== undefined) {
        fail(
          path,
          criterion,
          "switching high contrast off keeps data-contrast",
        );
      }
    } catch (error) {
      fail(
        path,
        criterion,
        `the settings could not be operated: ${String(error)}`,
      );
    }
    await page.close();
  }
  await member.close();
} finally {
  await browser.close();
}

console.log(
  `axe: ${pages.length} page(s) checked, ${critical} critical violation(s), ${failures} failed mode check(s)`,
);
process.exitCode = critical > 0 || failures > 0 ? 1 : 0;
