// Accessibility check of the running web client with axe (SCF-AC-5.2, SCF-AC-5.3).
// Opens every page of `pages`, runs axe, and exits with 1 if any page has a violation of impact
// "critical". The pages of the design system (R4, DSA-AC-3.5) are added to `pages`.
// Usage: BASE_URL=http://localhost:3000 node tests/accessibility/axe-check.ts
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";

const pages: string[] = ["/"];
const baseUrl: string = process.env.BASE_URL ?? "http://localhost:3000";

const browser = await chromium.launch();
let critical = 0;
try {
  const context = await browser.newContext();
  for (const path of pages) {
    const page = await context.newPage();
    await page.goto(new URL(path, baseUrl).toString());
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
