import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { contrast, labDistance, luminance, seenAs } from "./helpers/colour.ts";
import {
  root,
  rules,
  type Status,
  statuses,
  textOnBackground,
  themes,
  tokensCss,
  tokensOf,
  type Visit,
  visions,
} from "./helpers/tokens-css.ts";

const modes = visions.filter((mode) => mode !== "none");

/** The colour of a token in a visit, failing the test if the stylesheet does not set it. */
function colour(visit: Visit, token: string): string {
  const value = tokensOf(visit).get(token);
  assert.ok(value, `${JSON.stringify(visit)} sets no ${token}`);
  return value;
}

describe("DSA-AC-2.1 High contrast (DSA-T-7)", () => {
  const ways: [string, (theme: (typeof themes)[number]) => Visit][] = [
    ["the high-contrast mode", (theme) => ({ theme, contrast: "high" })],
    [
      "prefers-contrast: more of the system",
      (theme) => ({ theme, systemContrast: true }),
    ],
  ];

  for (const [way, visit] of ways) {
    for (const theme of themes) {
      for (const [text, background] of textOnBackground) {
        it(`DSA-AC-2.1 DSA-T-7 ${theme} with ${way}: ${text} on ${background} is at least 7:1`, () => {
          const foreground = colour(visit(theme), text);
          const behind = colour(visit(theme), background);
          const ratio = contrast(foreground, behind);
          assert.ok(
            ratio >= 7,
            `${foreground} on ${behind} is ${ratio.toFixed(2)}:1`,
          );
        });
      }
    }
  }

  it("DSA-AC-2.1 DSA-T-7 keeps a light interface light and a dark one dark (two palettes)", () => {
    for (const theme of themes) {
      const dark = theme === "dark" || theme === "night";
      const background = luminance(
        colour({ theme, contrast: "high" }, "--color-background"),
      );
      assert.equal(background < 0.5, dark, `${theme} high contrast`);
    }
  });

  it("DSA-AC-2.1 DSA-T-7 gives light and sepia one palette and dark and night another", () => {
    const palette = (theme: (typeof themes)[number]): string =>
      JSON.stringify(
        textOnBackground
          .flat()
          .map((token) => colour({ theme, contrast: "high" }, token)),
      );
    assert.equal(palette("light"), palette("sepia"));
    assert.equal(palette("dark"), palette("night"));
    assert.notEqual(palette("light"), palette("dark"));
  });

  it("DSA-AC-2.1 DSA-T-7 changes the colours of every theme", () => {
    for (const theme of themes) {
      assert.notEqual(
        colour({ theme, contrast: "high" }, "--color-foreground"),
        colour({ theme }, "--color-foreground"),
        `${theme} keeps its colours`,
      );
    }
  });

  it("DSA-AC-2.1 DSA-T-7 uses the same palette for the attribute and for the system preference", () => {
    for (const theme of themes) {
      assert.deepEqual(
        [...tokensOf({ theme, contrast: "high" })],
        [...tokensOf({ theme, systemContrast: true })],
        theme,
      );
    }
  });

  it("DSA-AC-2.1 DSA-T-7 draws borders in the text colour of the palette", () => {
    for (const theme of themes) {
      const visit: Visit = { theme, contrast: "high" };
      assert.ok(
        contrast(
          colour(visit, "--color-border"),
          colour(visit, "--color-background"),
        ) >= 7,
        `${theme} border`,
      );
    }
  });
});

describe("DSA-AC-2.1 DSA-AC-2.3 Contrast follows the system preference (DSA-T-7, DSA-T-9)", () => {
  it("DSA-AC-2.1 DSA-AC-2.3 DSA-T-7 DSA-T-9 reads prefers-contrast: more without any attribute set", () => {
    assert.ok(
      rules.some((rule) =>
        rule.atRules.includes("@media (prefers-contrast: more)"),
      ),
      "no @media (prefers-contrast: more) block",
    );
    for (const theme of themes) {
      assert.notEqual(
        colour({ theme, systemContrast: true }, "--color-foreground"),
        colour({ theme }, "--color-foreground"),
        theme,
      );
    }
  });
});

describe("DSA-AC-2.2 Colour-blind modes (DSA-T-8)", () => {
  const statusToken = (status: Status): string => `--color-status-${status}`;

  for (const theme of themes) {
    it(`DSA-AC-2.2 DSA-T-8 ${theme} defines the four status tokens`, () => {
      for (const status of statuses) {
        colour({ theme }, statusToken(status));
      }
    });
  }

  for (const theme of themes) {
    for (const contrastMode of [undefined, "high"] as const) {
      for (const vision of visions) {
        it(`DSA-AC-2.2 DSA-T-8 ${theme}, ${contrastMode ?? "normal"} contrast, ${vision}: every status colour is at least 3:1 on background and surface`, () => {
          const visit: Visit = { theme, contrast: contrastMode, vision };
          for (const status of statuses) {
            for (const behind of ["--color-background", "--color-surface"]) {
              const mark = colour(visit, statusToken(status));
              const ratio = contrast(mark, colour(visit, behind));
              assert.ok(
                ratio >= 3,
                `${status} ${mark} on ${behind} is ${ratio.toFixed(2)}:1`,
              );
            }
          }
        });
      }
    }
  }

  for (const theme of themes) {
    for (const vision of modes) {
      it(`DSA-AC-2.2 DSA-T-8 ${theme} with ${vision}: every status colour changes`, () => {
        for (const status of statuses) {
          assert.notEqual(
            colour({ theme, vision }, statusToken(status)),
            colour({ theme }, statusToken(status)),
            `${status} keeps its colour`,
          );
        }
      });

      it(`DSA-AC-2.2 DSA-T-8 ${theme} with ${vision}: the four status colours stay apart for that vision`, () => {
        const seen = statuses.map((status) =>
          seenAs(colour({ theme, vision }, statusToken(status)), vision),
        );
        for (let first = 0; first < seen.length; first += 1) {
          for (let second = first + 1; second < seen.length; second += 1) {
            const distance = labDistance(
              seen[first] as number[],
              seen[second] as number[],
            );
            assert.ok(
              distance >= 30,
              `${statuses[first]} and ${statuses[second]} differ by ${distance.toFixed(1)} for ${vision}`,
            );
          }
        }
      });
    }
  }

  it("DSA-AC-2.2 DSA-T-8 leaves the text colours to the theme and the contrast mode", () => {
    for (const theme of themes) {
      for (const vision of modes) {
        for (const [text, background] of textOnBackground) {
          assert.equal(
            colour({ theme, vision }, text),
            colour({ theme }, text),
          );
          assert.equal(
            colour({ theme, vision }, background),
            colour({ theme }, background),
          );
        }
      }
    }
  });
});

describe("DSA-AC-2.3 Reduced motion (DSA-T-9)", () => {
  /** The declarations that stop motion: no animation, no transition, no smooth scroll. */
  function stopsMotion(declarations: Map<string, string>): boolean {
    const stops = (name: string, value: RegExp): boolean =>
      value.test(declarations.get(name) ?? "");
    return (
      stops("animation", /^(none|0s)\b.*!important$/) &&
      stops("transition", /^(none|0s)\b.*!important$/) &&
      stops("scroll-behavior", /^auto !important$/)
    );
  }

  it("DSA-AC-2.3 DSA-T-9 stops animations and transitions under prefers-reduced-motion", () => {
    const rule = rules.find(
      (candidate) =>
        candidate.atRules.includes("@media (prefers-reduced-motion: reduce)") &&
        candidate.selectors.includes("*") &&
        stopsMotion(candidate.declarations),
    );
    assert.ok(rule, "no reduced-motion rule for all elements");
    assert.ok(rule.selectors.includes("*::before"));
    assert.ok(rule.selectors.includes("*::after"));
  });

  it("DSA-AC-2.3 DSA-T-9 stops animations and transitions when the member switches the mode on", () => {
    const rule = rules.find(
      (candidate) =>
        candidate.atRules.length === 0 &&
        candidate.selectors.includes('[data-motion="reduced"] *') &&
        stopsMotion(candidate.declarations),
    );
    assert.ok(rule, 'no [data-motion="reduced"] rule for all elements');
    assert.ok(rule.selectors.includes('[data-motion="reduced"] *::before'));
    assert.ok(rule.selectors.includes('[data-motion="reduced"] *::after'));
    assert.ok(rule.selectors.includes('[data-motion="reduced"]'));
  });

  it("DSA-AC-2.3 DSA-T-9 the member can only add the mode, never switch the system preference off", () => {
    assert.doesNotMatch(
      tokensCss,
      /\[data-motion="system"\]|no-preference/,
      "an attribute value or query that overrides the system preference",
    );
  });
});

describe("DSA-AC-2.5 Font size 200 % (DSA-T-11)", () => {
  const rem = /^-?\d*\.?\d+rem$/;

  it("DSA-AC-2.5 DSA-T-11 declares every type and spacing token in rem", () => {
    const base = rules.find((rule) => rule.selectors.includes("@theme"));
    assert.ok(base, "no @theme block");
    const sized = [...base.declarations].filter(([name]) =>
      /^--(text|spacing|radius)-/.test(name),
    );
    assert.ok(sized.length > 0, "no type or spacing token");
    for (const [name, value] of sized) {
      assert.match(value, rem, `${name} is ${value}`);
    }
  });

  it("DSA-AC-2.5 DSA-T-11 sets no font size in pixels in the token stylesheet", () => {
    assert.doesNotMatch(tokensCss, /font-size\s*:[^;}]*\bpx\b/);
    assert.doesNotMatch(tokensCss, /--text-[\w-]+\s*:[^;}]*\bpx\b/);
  });

  it("DSA-AC-2.5 DSA-T-11 sets no type or width of a component in pixels", () => {
    const source = join(root, "packages/ui/src");
    for (const file of readdirSync(source).filter((name) =>
      name.endsWith(".tsx"),
    )) {
      assert.doesNotMatch(
        readFileSync(join(source, file), "utf8"),
        /\b(?:text|w|h|min-w|min-h|max-w|max-h)-\[[^\]]*\d\s*px\]/,
        `${file} sets a size in pixels`,
      );
    }
  });
});
