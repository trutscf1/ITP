import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const overrides = ["dark", "sepia", "night"] as const;

/** Custom properties declared in the CSS block whose selector contains `selector`. */
function declaredTokens(css: string, selector: string): Set<string> {
  const blocks = css.matchAll(/([^{}]+)\{([^{}]*)\}/g);
  for (const [, selectors, body] of blocks) {
    // Only the text after the last statement or comment is the selector.
    const prelude = (selectors as string).split(/;|\*\//).pop() as string;
    if (prelude.includes(selector)) {
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

interface TailwindCompiler {
  build(candidates: string[]): string;
}

/** Compiles the token stylesheet with Tailwind CSS 4 and returns the CSS of `candidates`. */
async function buildUtilities(candidates: string[]): Promise<string> {
  const require = createRequire(join(root, "packages/ui/package.json"));
  const tailwind = require("tailwindcss") as {
    compile(
      css: string,
      options: {
        base: string;
        loadStylesheet(
          id: string,
          base: string,
        ): Promise<{ path: string; base: string; content: string }>;
      },
    ): Promise<TailwindCompiler>;
  };
  const tokens = readFileSync(join(root, "packages/ui/src/tokens.css"), "utf8");
  const compiler = await tailwind.compile(`@import "tailwindcss";\n${tokens}`, {
    base: root,
    loadStylesheet: async (id, base) => {
      const path =
        id === "tailwindcss"
          ? join(
              dirname(require.resolve("tailwindcss/package.json")),
              "index.css",
            )
          : resolve(base, id);
      return { path, base: dirname(path), content: readFileSync(path, "utf8") };
    },
  });
  return compiler.build(candidates);
}

describe("DSA-AC-1.1 Tokens do not break Tailwind utilities", () => {
  const containers = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "7xl"];

  it("DSA-AC-1.1 keeps max-w-* on the container sizes of Tailwind CSS", async () => {
    const css = await buildUtilities(containers.map((name) => `max-w-${name}`));
    assert.doesNotMatch(
      css,
      /max-width:\s*var\(--spacing-/,
      "a spacing token shadows a container size",
    );
    assert.match(css, /max-width:\s*var\(--container-md\)/);
  });

  it("DSA-AC-1.1 turns a spacing token into spacing utilities", async () => {
    const css = await buildUtilities(["p-base", "gap-tight"]);
    assert.match(css, /padding:\s*var\(--spacing-base\)/);
    assert.match(css, /gap:\s*var\(--spacing-tight\)/);
  });
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

describe("DSA-AC-1.3 Component base", () => {
  const pkg = JSON.parse(
    readFileSync(join(root, "packages/ui/package.json"), "utf8"),
  ) as Record<string, Record<string, string> | undefined>;
  const needs = { ...pkg.dependencies, ...pkg.peerDependencies };

  it("DSA-AC-1.3 builds @stash/ui on Radix UI and Tailwind CSS 4", () => {
    assert.ok(needs["radix-ui"], "radix-ui missing");
    assert.match(needs.tailwindcss ?? "", /^\^?4/);
  });

  it("DSA-AC-1.3 builds the theme switcher from a Radix primitive", () => {
    const source = readFileSync(
      join(root, "packages/ui/src/theme-switcher.tsx"),
      "utf8",
    );
    assert.match(source, /from "radix-ui"/);
  });

  it("DSA-AC-1.3 the web unit loads the tokens of @stash/ui", () => {
    const css = readFileSync(
      join(root, "apps/web/src/app/globals.css"),
      "utf8",
    );
    assert.match(css, /@import "@stash\/ui\/tokens\.css"/);
  });
});
