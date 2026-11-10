import assert from "node:assert/strict";
import { describe, it } from "node:test";
import * as a11y from "../packages/ui/src/accessibility.ts";

type Settings = a11y.AccessibilitySettings;

/** A stand-in for `document.documentElement`: only the dataset is used. */
function fakeRoot(): { dataset: Record<string, string | undefined> } {
  return { dataset: {} };
}

/** Every combination of the three settings. */
const combinations: Settings[] = [];
for (const contrast of ["system", "high"] as const) {
  for (const colourVision of [
    "none",
    "protanopia",
    "deuteranopia",
    "tritanopia",
  ] as const) {
    for (const motion of ["system", "reduced"] as const) {
      combinations.push({ contrast, colourVision, motion });
    }
  }
}

/** The value of the cookie that `accessibilityCookie` returns. */
function cookieValue(settings: Settings): string {
  const [pair] = a11y.accessibilityCookie(settings).split(";");
  return (pair as string).slice(`${a11y.accessibilityCookieName}=`.length);
}

describe("DSA-AC-2.4 Settings remembered in the browser (DSA-T-17)", () => {
  it("DSA-AC-2.4 DSA-T-17 follows the system and shows no colour-blind mode by default", () => {
    assert.deepEqual(a11y.defaultAccessibility, {
      contrast: "system",
      colourVision: "none",
      motion: "system",
    });
  });

  it("DSA-AC-2.4 DSA-T-17 knows the allowed values of each setting", () => {
    assert.ok(a11y.isContrast("high") && a11y.isContrast("system"));
    assert.ok(!a11y.isContrast("low") && !a11y.isContrast(undefined));
    assert.ok(a11y.isColourVision("protanopia"));
    assert.ok(a11y.isColourVision("deuteranopia"));
    assert.ok(a11y.isColourVision("tritanopia"));
    assert.ok(a11y.isColourVision("none"));
    assert.ok(!a11y.isColourVision("achromatopsia"));
    assert.ok(a11y.isMotion("reduced") && a11y.isMotion("system"));
    assert.ok(!a11y.isMotion("none") && !a11y.isMotion(1));
  });

  it("DSA-AC-2.4 DSA-T-17 writes one cookie for a year on the whole site", () => {
    assert.equal(a11y.accessibilityCookieName, "stash-a11y");
    const cookie = a11y.accessibilityCookie(a11y.defaultAccessibility);
    assert.match(
      cookie,
      /^stash-a11y=[^;]+; Path=\/; Max-Age=31536000; SameSite=Lax$/,
    );
  });

  it("DSA-AC-2.4 DSA-T-17 writes a value of cookie characters only (RFC 6265)", () => {
    for (const settings of combinations) {
      assert.match(
        cookieValue(settings),
        /^[\x21\x23-\x2B\x2D-\x3A\x3C-\x5B\x5D-\x7E]+$/,
        JSON.stringify(settings),
      );
    }
  });

  for (const settings of combinations) {
    it(`DSA-AC-2.4 DSA-T-17 returns ${JSON.stringify(settings)} from the cookie it wrote`, () => {
      const header = `theme=sepia; ${a11y.accessibilityCookie(settings).split(";")[0]}; other=1`;
      assert.deepEqual(a11y.readAccessibilityCookie(header), settings);
    });
  }

  it("DSA-AC-2.4 DSA-T-17 falls back to the defaults for a missing cookie", () => {
    assert.deepEqual(
      a11y.readAccessibilityCookie(undefined),
      a11y.defaultAccessibility,
    );
    assert.deepEqual(
      a11y.readAccessibilityCookie(""),
      a11y.defaultAccessibility,
    );
    assert.deepEqual(
      a11y.readAccessibilityCookie("stash-theme=dark; session=abc"),
      a11y.defaultAccessibility,
    );
  });

  it("DSA-AC-2.4 DSA-T-17 falls back to the defaults for an unreadable cookie", () => {
    for (const value of ["neon", "contrast", "::", "high.none.system", "💥"]) {
      assert.deepEqual(
        a11y.readAccessibilityCookie(`stash-a11y=${value}`),
        a11y.defaultAccessibility,
        value,
      );
    }
  });

  it("DSA-AC-2.4 DSA-T-17 keeps the known parts and defaults the unknown ones", () => {
    const header =
      "stash-a11y=contrast:high.vision:neon.motion:wobble; stash-theme=dark";
    assert.deepEqual(a11y.readAccessibilityCookie(header), {
      contrast: "high",
      colourVision: "none",
      motion: "system",
    });
    assert.deepEqual(
      a11y.readAccessibilityCookie("stash-a11y=motion:reduced"),
      { contrast: "system", colourVision: "none", motion: "reduced" },
    );
  });

  it("DSA-AC-2.4 DSA-T-17 does not mistake a cookie of another name for its own", () => {
    assert.deepEqual(
      a11y.readAccessibilityCookie("x-stash-a11y=contrast:high"),
      a11y.defaultAccessibility,
    );
  });

  it("DSA-AC-2.4 DSA-T-17 applies the settings on the root element at once", () => {
    const root = fakeRoot();
    a11y.applyAccessibility(root, {
      contrast: "high",
      colourVision: "deuteranopia",
      motion: "reduced",
    });
    assert.equal(root.dataset.contrast, "high");
    assert.equal(root.dataset.colourVision, "deuteranopia");
    assert.equal(root.dataset.motion, "reduced");
  });

  it("DSA-AC-2.4 DSA-T-17 removes the attribute of a setting that goes back to its default", () => {
    const root = fakeRoot();
    a11y.applyAccessibility(root, {
      contrast: "high",
      colourVision: "protanopia",
      motion: "reduced",
    });
    a11y.applyAccessibility(root, a11y.defaultAccessibility);
    assert.deepEqual(Object.keys(root.dataset), []);
  });

  it("DSA-AC-2.4 DSA-T-17 leaves the theme on the root element alone", () => {
    const root = fakeRoot();
    root.dataset.theme = "night";
    a11y.applyAccessibility(root, {
      contrast: "high",
      colourVision: "none",
      motion: "system",
    });
    assert.equal(root.dataset.theme, "night");
  });

  it("DSA-AC-2.4 DSA-T-17 renders the same attributes on the server as it applies in the browser", () => {
    for (const settings of combinations) {
      const root = fakeRoot();
      a11y.applyAccessibility(root, settings);
      const expected: Record<string, string> = {};
      if (root.dataset.contrast)
        expected["data-contrast"] = root.dataset.contrast;
      if (root.dataset.colourVision)
        expected["data-colour-vision"] = root.dataset.colourVision;
      if (root.dataset.motion) expected["data-motion"] = root.dataset.motion;
      assert.deepEqual(
        a11y.accessibilityAttributes(settings),
        expected,
        JSON.stringify(settings),
      );
    }
  });
});

describe("DSA-AC-2.1 DSA-AC-2.2 DSA-AC-2.3 Each mode is a data attribute of the root element (DSA-T-17)", () => {
  it("DSA-AC-2.1 DSA-T-17 sets data-contrast for the high-contrast mode", () => {
    assert.deepEqual(
      a11y.accessibilityAttributes({
        ...a11y.defaultAccessibility,
        contrast: "high",
      }),
      { "data-contrast": "high" },
    );
  });

  it("DSA-AC-2.2 DSA-T-17 sets data-colour-vision for each colour-blind mode", () => {
    for (const mode of ["protanopia", "deuteranopia", "tritanopia"] as const) {
      assert.deepEqual(
        a11y.accessibilityAttributes({
          ...a11y.defaultAccessibility,
          colourVision: mode,
        }),
        { "data-colour-vision": mode },
      );
    }
  });

  it("DSA-AC-2.3 DSA-T-17 sets data-motion for the hand-set reduced-motion mode", () => {
    assert.deepEqual(
      a11y.accessibilityAttributes({
        ...a11y.defaultAccessibility,
        motion: "reduced",
      }),
      { "data-motion": "reduced" },
    );
  });

  it("DSA-AC-2.3 DSA-T-17 sets no attribute while the settings follow the system", () => {
    assert.deepEqual(
      a11y.accessibilityAttributes(a11y.defaultAccessibility),
      {},
    );
  });
});
