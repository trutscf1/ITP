import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { root } from "./helpers/paths.ts";
import { withoutComments } from "./helpers/source.ts";

/** The browser check without its comments, so a match in a comment does not count. */
const check: string = withoutComments(
  readFileSync(join(root, "tests/accessibility/axe-check.ts"), "utf8"),
);

describe("DSA-AC-3.5 The axe check covers every theme and contrast mode (DSA-T-16)", () => {
  it("DSA-AC-3.5 DSA-T-16 takes the themes and the cookies from the design system instead of listing them again", () => {
    assert.match(
      check,
      /import\s*\{[^}]*\bthemes\b[^}]*\}\s*from\s*"[^"]*packages\/ui\/src\/theme\.ts"/,
    );
    assert.match(
      check,
      /import\s*\{[^}]*\baccessibilityCookie\b[^}]*\}\s*from\s*"[^"]*packages\/ui\/src\/accessibility\.ts"/,
    );
    assert.match(check, /\bthemeCookieName\b/);
    assert.match(check, /\baccessibilityCookieName\b/);
  });

  it("DSA-AC-3.5 DSA-T-16 runs axe for every page, every theme, and both contrast modes, and confirms the page shows them", () => {
    assert.match(
      check,
      /for \(const path of pages\)[\s\S]*for \(const theme of themes\)/,
    );
    assert.match(check, /addCookies/);
    assert.match(check, /dataset\.theme/);
    assert.match(check, /dataset\.contrast/);
    assert.match(check, /AxeBuilder/);
  });

  it("DSA-AC-3.5 DSA-T-16 fails the run on a critical violation and names DSA-AC-3.5", () => {
    assert.match(check, /impact === "critical"/);
    assert.match(check, /\[DSA-AC-3\.5[^\]]*\]/);
    assert.match(check, /process\.exitCode = critical > 0/);
  });
});

describe("DSA-AC-3.1 The keyboard walk is a browser check (DSA-T-12)", () => {
  it("DSA-AC-3.1 DSA-T-12 presses Tab through every page and compares with the source order of the focusable elements", () => {
    assert.match(check, /keyboard\.press\("Tab"\)/);
    assert.match(check, /focusableInSourceOrder/);
    assert.match(check, /DSA-AC-3\.1 DSA-T-12/);
  });

  it("DSA-AC-3.1 DSA-T-12 fails when a composite widget takes more than one tab stop or the walk reaches an unexpected stop", () => {
    assert.match(check, /more Tab stops than/);
    assert.match(check, /Tab stop \$\{/);
  });

  it("DSA-AC-3.1 DSA-T-12 requires a visible focus indicator on every focused element", () => {
    assert.match(check, /outlineStyle/);
    assert.match(check, /outlineWidth/);
    assert.match(check, /outlineColor/);
    assert.match(check, /boxShadow/);
    assert.match(check, /transparent/i);
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
