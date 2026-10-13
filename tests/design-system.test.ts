import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const overrides = ["dark", "sepia", "night"] as const;

/** Custom properties declared in the CSS block whose selector contains `selector`. */
function declaredTokens(css: string, selector: string): Set<string> {
  const blocks = css.matchAll(/([^{}]+)\{([^{}]*)\}/g);
  for (const [, selectors, body] of blocks) {
    if ((selectors as string).includes(selector)) {
      return new Set(
        [...(body as string).matchAll(/(--[\w-]+)\s*:/g)].map(
          (m) => m[1] as string,
        ),
      );
    }
  }
  return new Set();
}

describe("DSA-AC-1.1 Central tokens", () => {
  const css = readFileSync(join(root, "packages/ui/src/tokens.css"), "utf8");
  const base = declaredTokens(css, "@theme");

  for (const kind of ["color", "spacing", "text"] as const) {
    it(`DSA-AC-1.1 defines ${kind} tokens in @stash/ui`, () => {
      assert.ok(
        [...base].some((name) => name.startsWith(`--${kind}-`)),
        `no --${kind}-* token in @theme`,
      );
    });
  }
});

describe("DSA-AC-1.2 Four themes", () => {
  const css = readFileSync(join(root, "packages/ui/src/tokens.css"), "utf8");
  const colours = [...declaredTokens(css, "@theme")].filter((name) =>
    name.startsWith("--color-"),
  );

  it("DSA-AC-1.2 the light theme is the base of the tokens", () => {
    assert.match(css, /\[data-theme="light"\]/);
    assert.ok(colours.length > 0, "no colour tokens in @theme");
  });

  for (const theme of overrides) {
    it(`DSA-AC-1.2 the ${theme} theme sets every colour token`, () => {
      const set = declaredTokens(css, `[data-theme="${theme}"]`);
      assert.deepEqual(
        colours.filter((name) => !set.has(name)),
        [],
        `${theme} misses colour tokens`,
      );
    });
  }
});
