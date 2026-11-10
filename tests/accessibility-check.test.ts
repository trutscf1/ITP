import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { root } from "./helpers/tokens-css.ts";

const check: string = readFileSync(
  join(root, "tests/accessibility/axe-check.ts"),
  "utf8",
);

describe("DSA-AC-3.5 The axe check covers every theme and contrast mode (DSA-T-16)", () => {
  it("DSA-AC-3.5 DSA-T-16 lists the four themes", () => {
    const list = check.match(/const themes[^=]*=\s*\[([^\]]*)\]/)?.[1] ?? "";
    for (const theme of ["light", "dark", "sepia", "night"]) {
      assert.match(
        list,
        new RegExp(`"${theme}"`),
        `${theme} is not in the list`,
      );
    }
  });

  it("DSA-AC-3.5 DSA-T-16 runs axe for every page in every theme, with and without high contrast", () => {
    assert.match(check, /for \(const theme of themes\)/);
    assert.match(check, /for \(const high of \[false, true\]\)/);
    assert.match(check, /stash-theme/);
    assert.match(check, /stash-a11y/);
    assert.match(check, /contrast:high\.vision:none\.motion:system/);
  });

  it("DSA-AC-3.5 DSA-T-16 fails on a critical violation and names DSA-AC-3.5", () => {
    assert.match(check, /impact === "critical"/);
    assert.match(check, /DSA-AC-3\.5/);
    assert.match(check, /process\.exitCode = critical > 0/);
  });
});

describe("DSA-AC-3.1 The keyboard walk is a browser check (DSA-T-12)", () => {
  it("DSA-AC-3.1 DSA-T-12 presses Tab through every page and compares with the source order of the focusable elements", () => {
    assert.match(check, /keyboard\.press\("Tab"\)/);
    assert.match(check, /focusableInSourceOrder/);
    assert.match(check, /DSA-AC-3\.1 DSA-T-12/);
  });

  it("DSA-AC-3.1 DSA-T-12 requires a visible focus indicator on every focused element", () => {
    assert.match(check, /outlineStyle/);
    assert.match(check, /outlineWidth/);
    assert.match(check, /boxShadow/);
    assert.match(check, /no visible focus indicator/);
  });
});

describe("DSA-AC-3.2 The skip link is the first stop of the keyboard walk (DSA-T-13)", () => {
  it("DSA-AC-3.2 DSA-T-13 focuses the skip link with the first Tab and moves focus to #main-content with Enter", () => {
    assert.match(check, /Skip to main content/);
    assert.match(check, /keyboard\.press\("Enter"\)/);
    assert.match(check, /main-content/);
    assert.match(check, /DSA-AC-3\.2 DSA-T-13/);
  });
});
