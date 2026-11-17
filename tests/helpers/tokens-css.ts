import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** The root of the repository. */
export const root: string = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

/** The token stylesheet of `@stash/ui`. */
export const tokensCss: string = readFileSync(
  join(root, "packages/ui/src/tokens.css"),
  "utf8",
);

export const themes = ["light", "dark", "sepia", "night"] as const;
export type Theme = (typeof themes)[number];

export const visions = [
  "none",
  "protanopia",
  "deuteranopia",
  "tritanopia",
] as const;
export type Vision = (typeof visions)[number];

export const statuses = ["success", "warning", "danger", "info"] as const;
export type Status = (typeof statuses)[number];

/** One style rule of the stylesheet with the at-rules (`@media …`) around it. */
export interface CssRule {
  atRules: string[];
  selectors: string[];
  declarations: Map<string, string>;
  /** Position in the stylesheet, later rules win a tie in specificity. */
  order: number;
}

/** Splits `text` at the commas that are not inside parentheses. */
function splitTopLevel(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of text) {
    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;
    if (char === "," && depth === 0) {
      parts.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  parts.push(current);
  return parts.map((part) => part.replace(/\s+/g, " ").trim()).filter(Boolean);
}

/** Style rules of a stylesheet; `@media`, `@supports`, and `@layer` blocks are walked into. */
export function parseCss(source: string): CssRule[] {
  const css = source.replace(/\/\*[\s\S]*?\*\//g, "");
  const rules: CssRule[] = [];
  const containers: string[] = [];
  let prelude = "";
  let index = 0;
  while (index < css.length) {
    const char = css[index] as string;
    if (char === ";") {
      prelude = "";
    } else if (char === "}") {
      containers.pop();
      prelude = "";
    } else if (char === "{") {
      const head = prelude.replace(/\s+/g, " ").trim();
      if (/^@(media|supports|layer)\b/.test(head)) {
        containers.push(head);
      } else {
        const end = css.indexOf("}", index);
        const declarations = new Map<string, string>();
        for (const statement of css.slice(index + 1, end).split(";")) {
          const colon = statement.indexOf(":");
          if (colon < 0) continue;
          declarations.set(
            statement.slice(0, colon).trim(),
            statement
              .slice(colon + 1)
              .replace(/\s+/g, " ")
              .trim(),
          );
        }
        rules.push({
          atRules: [...containers],
          selectors: splitTopLevel(head),
          declarations,
          order: rules.length,
        });
        index = end;
      }
      prelude = "";
    } else {
      prelude += char;
    }
    index += 1;
  }
  return rules;
}

export const rules: CssRule[] = parseCss(tokensCss);

/** The settings of one visit that decide which rules of the stylesheet apply. */
export interface Visit {
  theme: Theme;
  /** `data-contrast="high"`, set by hand. */
  contrast?: "high";
  /** `data-colour-vision`, set by hand. */
  vision?: Vision;
  /** The operating system sets `prefers-contrast: more`. */
  systemContrast?: boolean;
}

/** Specificity (attribute and pseudo-class selectors) of a selector made of `:root` and `[data-…="…"]`, or null. */
function matches(selector: string, visit: Visit): number | null {
  if (selector === "@theme") return 0;
  const attributes: Record<string, string | undefined> = {
    "data-theme": visit.theme,
    "data-contrast": visit.contrast,
    "data-colour-vision":
      visit.vision && visit.vision !== "none" ? visit.vision : undefined,
  };
  let rest = selector;
  let specificity = 0;
  if (rest.startsWith(":root")) {
    rest = rest.slice(":root".length);
    specificity += 1;
  }
  for (const [, name, value] of rest.matchAll(/\[([\w-]+)="([^"]*)"\]/g)) {
    if (attributes[name as string] !== value) return null;
    specificity += 1;
  }
  const leftover = rest.replace(/\[([\w-]+)="([^"]*)"\]/g, "");
  return leftover === "" ? specificity : null;
}

function mediaApplies(atRules: string[], visit: Visit): boolean {
  return atRules.every((atRule) =>
    atRule === "@media (prefers-contrast: more)"
      ? visit.systemContrast === true
      : false,
  );
}

/** The value of every custom property after the cascade of the visit; only rules this test understands count. */
export function tokensOf(visit: Visit): Map<string, string> {
  const winners = new Map<string, { value: string; rank: number }>();
  for (const rule of rules) {
    if (rule.atRules.length > 0 && !mediaApplies(rule.atRules, visit)) continue;
    let best: number | null = null;
    for (const selector of rule.selectors) {
      const specificity = matches(selector, visit);
      if (specificity !== null && (best === null || specificity > best)) {
        best = specificity;
      }
    }
    if (best === null) continue;
    const rank = best * 100_000 + rule.order;
    for (const [name, value] of rule.declarations) {
      if (!name.startsWith("--")) continue;
      const current = winners.get(name);
      if (!current || rank > current.rank) winners.set(name, { value, rank });
    }
  }
  return new Map([...winners].map(([name, { value }]) => [name, value]));
}

/** Every text colour paired with each background it is drawn on in the components. */
export const textOnBackground = [
  ["--color-foreground", "--color-background"],
  ["--color-foreground", "--color-surface"],
  ["--color-muted", "--color-background"],
  ["--color-muted", "--color-surface"],
  ["--color-accent", "--color-background"],
  ["--color-accent", "--color-surface"],
  ["--color-accent-foreground", "--color-accent"],
] as const;
