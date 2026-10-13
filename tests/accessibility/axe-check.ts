// Accessibility check of the running web client with axe (SCF-AC-5.2, SCF-AC-5.3).
// Waits until the web client answers, opens every page of `pages`, runs axe, and exits with 1
// if the server does not come up, a page does not load, or a page has a violation of impact
// "critical". The pages of the design system (R4, DSA-AC-3.5) are added to `pages`.
// Usage: BASE_URL=http://localhost:3000 node tests/accessibility/axe-check.ts
import AxeBuilder from "@axe-core/playwright";
import { type Browser, chromium } from "playwright";

const pages: string[] = ["/"];
const baseUrl: string = process.env.BASE_URL ?? "http://localhost:3000";
const startTimeoutMs: number = Number(process.env.START_TIMEOUT_MS ?? 60000);

async function waitForServer(): Promise<void> {
  const deadline: number = Date.now() + startTimeoutMs;
  while (Date.now() < deadline) {
    try {
      await fetch(baseUrl);
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw new Error(`${baseUrl} did not answer within ${startTimeoutMs} ms`);
}

await waitForServer();
const browser: Browser = await chromium.launch();
let critical: number = 0;
try {
  const context = await browser.newContext();
  for (const path of pages) {
    const page = await context.newPage();
    const response = await page.goto(new URL(path, baseUrl).toString());
    if (!response?.ok()) {
      throw new Error(`${path} answered with HTTP ${response?.status()}`);
    }
    const { violations } = await new AxeBuilder({ page }).analyze();
    for (const violation of violations) {
      console.log(
        `${path}: ${violation.impact ?? "unknown"} ${violation.id} — ${violation.help} (${violation.nodes.length} element(s))`,
      );
      if (violation.impact === "critical") critical += 1;
    }
    await page.close();
  }
} finally {
  await browser.close();
}

console.log(
  `axe: ${pages.length} page(s) checked, ${critical} critical violation(s)`,
);
process.exitCode = critical > 0 ? 1 : 0;
