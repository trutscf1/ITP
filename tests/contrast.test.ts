import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(root, "packages/ui/src/tokens.css"), "utf8");

const themes = ["light", "dark", "sepia", "night"] as const;

/** Colour tokens (`--color-*: #rrggbb`) of the CSS block whose selector contains `selector`. */
function colourTokens(selector: string): Map<string, string> {
  const tokens = new Map<string, string>();
  for (const [, selectors, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    // Only the text after the last statement or comment is the selector.
    const prelude = (selectors as string).split(/;|\*\//).pop() as string;
    if (!prelude.includes(selector)) continue;
    for (const [, name, value] of (body as string).matchAll(
      /(--color-[\w-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;/g,
    )) {
      tokens.set(name as string, value as string);
    }
  }
  return tokens;
}

/** The colour tokens of a theme: light is the base, the others override it. */
function themeColours(theme: (typeof themes)[number]): Map<string, string> {
  const base = colourTokens("@theme");
  return theme === "light"
    ? base
    : new Map([...base, ...colourTokens(`[data-theme="${theme}"]`)]);
}

/** WCAG 2.x relative luminance of an `#rrggbb` colour. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((start) => {
    const channel = Number.parseInt(hex.slice(start, start + 2), 16) / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio of two colours, from 1 to 21. */
function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [
    number,
    number,
  ];
  return (light + 0.05) / (dark + 0.05);
}

/** Every text colour paired with each background it is drawn on in the components. */
const textOnBackground = [
  ["--color-foreground", "--color-background"],
  ["--color-foreground", "--color-surface"],
  ["--color-muted", "--color-background"],
  ["--color-muted", "--color-surface"],
  ["--color-accent", "--color-background"],
  ["--color-accent", "--color-surface"],
  ["--color-accent-foreground", "--color-accent"],
] as const;

describe("DSA-AC-1.4 Contrast", () => {
  it("DSA-AC-1.4 measures the contrast of a known pair", () => {
    assert.equal(contrast("#000000", "#ffffff").toFixed(1), "21.0");
    assert.equal(contrast("#777777", "#ffffff").toFixed(2), "4.48");
  });

  for (const theme of themes) {
    const colours = themeColours(theme);
    for (const [text, background] of textOnBackground) {
      it(`DSA-AC-1.4 ${theme}: ${text} on ${background} is at least 4.5:1`, () => {
        const foreground = colours.get(text);
        const surface = colours.get(background);
        assert.ok(
          foreground && surface,
          `${theme} misses ${text} or ${background}`,
        );
        const ratio = contrast(foreground, surface);
        assert.ok(
          ratio >= 4.5,
          `${foreground} on ${surface} is ${ratio.toFixed(2)}:1`,
        );
      });
    }
  }
});
