import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { relative } from "node:path";
import { describe, it } from "node:test";
import { contrast } from "./helpers/colour.ts";
import { root, sourceFiles, unitSourceFolders } from "./helpers/paths.ts";
import { withoutComments } from "./helpers/source.ts";
import { rules, themes, tokensOf, type Visit } from "./helpers/tokens-css.ts";

/** The contrast settings a visit can have: none, set by hand, or asked for by the system. */
const contrastModes: [string, Partial<Visit>][] = [
  ["normal contrast", {}],
  ["high contrast", { contrast: "high" }],
  ["prefers-contrast: more", { systemContrast: true }],
];

/** The global focus rule: a style rule for `:focus-visible`. */
const focusRule = rules.find((rule) =>
  rule.selectors.includes(":focus-visible"),
);

/** The colour of a token in a visit, failing the test if the stylesheet does not set it. */
function colour(visit: Visit, token: string): string {
  const value = tokensOf(visit).get(token);
  assert.ok(value, `${JSON.stringify(visit)} sets no ${token}`);
  return value;
}

describe("DSA-AC-3.1 One focus indicator for every control (DSA-T-12)", () => {
  it("DSA-AC-3.1 DSA-T-12 defines one global :focus-visible rule in the token stylesheet", () => {
    assert.ok(focusRule, "tokens.css has no :focus-visible rule");
  });

  it("DSA-AC-3.1 DSA-T-12 puts the rule in @layer base, so Tailwind utilities can still adjust it", () => {
    assert.ok(focusRule, "tokens.css has no :focus-visible rule");
    assert.deepEqual(focusRule.atRules, ["@layer base"]);
  });

  it("DSA-AC-3.1 DSA-T-12 draws a 2 px solid outline in the accent colour with a 2 px offset", () => {
    assert.ok(focusRule, "tokens.css has no :focus-visible rule");
    assert.equal(
      focusRule.declarations.get("outline"),
      "2px solid var(--color-accent)",
    );
    assert.equal(focusRule.declarations.get("outline-offset"), "2px");
  });

  for (const theme of themes) {
    for (const [name, mode] of contrastModes) {
      it(`DSA-AC-3.1 DSA-T-12 ${theme} with ${name}: the focus outline is at least 3:1 on background and surface`, () => {
        const visit: Visit = { theme, ...mode };
        const outline = colour(visit, "--color-accent");
        for (const behind of ["--color-background", "--color-surface"]) {
          const ratio = contrast(outline, colour(visit, behind));
          assert.ok(
            ratio >= 3,
            `${outline} on ${behind} is ${ratio.toFixed(2)}:1`,
          );
        }
      });
    }
  }
});

/** Source files of the apps and packages (builds and dependencies left out). */
const sources: string[] = unitSourceFolders().flatMap(
  (folder: string): string[] => sourceFiles(folder, /\.(tsx?|jsx?|css|mdx)$/),
);

/** The source of a file without its comments, so a match in a comment does not count. */
function code(file: string): string {
  return withoutComments(readFileSync(file, "utf8"));
}

/** A tabindex above zero in JSX, HTML, or an object: `tabIndex={2}`, `tabindex="3"`, `tabIndex: 1`. */
const positiveTabIndex = /tabindex\s*[=:]\s*\{?\s*["']?\s*[1-9]/i;

describe("DSA-AC-3.1 The tab order is the reading order (DSA-T-12)", () => {
  it("DSA-AC-3.1 DSA-T-12 looks at the sources of the apps and packages", () => {
    assert.ok(sources.length > 0, "no source file found");
    assert.ok(
      sources.some((file) => file.endsWith("layout.tsx")),
      "the web layout is not among the sources",
    );
  });

  it("DSA-AC-3.1 DSA-T-12 recognises a positive tabIndex (so the next test cannot pass for nothing)", () => {
    for (const bad of [
      "tabIndex={2}",
      'tabindex="3"',
      "tabIndex: 1",
      "tabIndex={ 5 }",
    ]) {
      assert.match(bad, positiveTabIndex, bad);
    }
    for (const good of [
      "tabIndex={0}",
      "tabIndex={-1}",
      'tabindex="-1"',
      "tabIndex: 0",
    ]) {
      assert.doesNotMatch(good, positiveTabIndex, good);
    }
  });

  it("DSA-AC-3.1 DSA-T-12 sets no positive tabIndex in apps/ or packages/", () => {
    const offenders = sources.filter((file) =>
      positiveTabIndex.test(code(file)),
    );
    assert.deepEqual(
      offenders.map((file) => relative(root, file)),
      [],
    );
  });

  it("DSA-AC-3.1 DSA-T-12 removes no outline without an equal replacement", () => {
    const removes = /outline-(none|hidden|0)\b|outline\s*:\s*(none|0)\b/;
    const offenders = sources.filter((file) => removes.test(code(file)));
    assert.deepEqual(
      offenders.map((file) => relative(root, file)),
      [],
    );
  });
});
