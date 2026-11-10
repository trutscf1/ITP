import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  contrast,
  textOnBackground,
  themes,
  tokensOf,
} from "./helpers/tokens-css.ts";

/** The colour tokens of a theme as the browser resolves them without any accessibility mode. */
function themeColours(theme: (typeof themes)[number]): Map<string, string> {
  return tokensOf({ theme });
}

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
