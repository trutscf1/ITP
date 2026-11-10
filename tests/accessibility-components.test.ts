import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { after, before, describe, it } from "node:test";
import { root, statuses } from "./helpers/tokens-css.ts";
import { type BuiltUi, buildUi } from "./helpers/ui-build.ts";

let ui: BuiltUi;

before(async () => {
  ui = await buildUi();
});

after(() => {
  ui?.remove();
});

const labels = {
  success: "Uploaded",
  warning: "Scan pending",
  danger: "Upload failed",
  info: "Queued",
} as const;

/** The first `<svg …>…</svg>` of a markup string. */
function icon(markup: string): string {
  const match = markup.match(/<svg[\s\S]*?<\/svg>/);
  assert.ok(match, `no inline svg in ${markup}`);
  return match[0];
}

describe("DSA-AC-2.2 Status badge shows more than colour (DSA-T-8)", () => {
  for (const status of statuses) {
    it(`DSA-AC-2.2 DSA-T-8 ${status}: shows the text and an icon hidden from screen readers`, () => {
      const markup = ui.render("StatusBadge", {
        status,
        label: labels[status],
      });
      assert.match(markup, new RegExp(`>${labels[status]}<`));
      assert.match(icon(markup), /^<svg\b[^>]*\baria-hidden="true"/);
      assert.match(markup, new RegExp(`status-${status}`), "no status colour");
    });
  }

  it("DSA-AC-2.2 DSA-T-8 draws a different icon for every status", () => {
    const icons = statuses.map((status) =>
      icon(ui.render("StatusBadge", { status, label: labels[status] })),
    );
    assert.equal(new Set(icons).size, statuses.length);
  });

  it("DSA-AC-2.2 DSA-T-8 keeps the text in the text colour and uses the status colour for the mark only", () => {
    for (const status of statuses) {
      const markup = ui.render("StatusBadge", {
        status,
        label: labels[status],
      });
      const text = markup.match(new RegExp(`<[^>]*>${labels[status]}<`));
      assert.ok(text, "text element not found");
      assert.doesNotMatch(text[0], /text-status-/);
    }
  });
});

describe("DSA-AC-2.4 Accessibility controls (DSA-T-17)", () => {
  const off = {
    contrast: "system",
    colourVision: "none",
    motion: "system",
  } as const;

  it("DSA-AC-2.1 DSA-T-17 offers the high-contrast mode as a labelled switch", () => {
    const highOff = ui.render("AccessibilityControls", {
      settings: off,
      onChange() {},
    });
    assert.match(highOff, /role="switch"[^>]*aria-checked="false"/);
    assert.match(highOff, /High contrast/);
    const on = ui.render("AccessibilityControls", {
      settings: { ...off, contrast: "high" },
      onChange() {},
    });
    assert.match(on, /role="switch"[^>]*aria-checked="true"[^>]*/);
  });

  it("DSA-AC-2.2 DSA-T-17 offers the colour vision as a radio group with a labelled option each", () => {
    const markup = ui.render("AccessibilityControls", {
      settings: { ...off, colourVision: "deuteranopia" },
      onChange() {},
    });
    assert.match(markup, /role="radiogroup"/);
    assert.equal((markup.match(/role="radio"/g) ?? []).length, 4);
    for (const name of ["None", "Protanopia", "Deuteranopia", "Tritanopia"]) {
      assert.match(markup, new RegExp(`>${name}<`));
    }
    assert.match(
      markup,
      /role="radio"[^>]*aria-checked="true"[^>]*value="deuteranopia"|value="deuteranopia"[^>]*aria-checked="true"/,
    );
  });

  it("DSA-AC-2.3 DSA-T-17 offers reduced motion as a labelled switch", () => {
    const markup = ui.render("AccessibilityControls", {
      settings: { ...off, motion: "reduced" },
      onChange() {},
    });
    assert.match(markup, /Reduce motion/);
    assert.equal((markup.match(/role="switch"/g) ?? []).length, 2);
    assert.match(markup, /aria-checked="true"/);
  });

  it("DSA-AC-2.4 DSA-T-17 names every control by a label and nothing by colour or icon alone", () => {
    const markup = ui.render("AccessibilityControls", {
      settings: off,
      onChange() {},
    });
    const controls = markup.match(/<button\b[^>]*>/g) ?? [];
    assert.equal(controls.length, 6);
    for (const control of controls) {
      assert.match(control, /\bid="[^"]+"/, control);
    }
    assert.equal((markup.match(/<label\b[^>]*\bfor="/g) ?? []).length, 6);
  });

  it("DSA-AC-2.4 DSA-T-17 shows the settings behind one labelled button that starts closed", () => {
    const markup = ui.render("AccessibilitySettings", {
      initialSettings: off,
    });
    assert.match(markup, /<button\b[^>]*aria-expanded="false"/);
    assert.match(markup, /<button\b[^>]*aria-haspopup="dialog"/);
    assert.match(markup, /Accessibility/);
  });

  it("DSA-AC-2.4 DSA-T-17 builds the controls from Radix primitives and exports every new module", () => {
    const source = join(root, "packages/ui/src");
    assert.match(
      readFileSync(join(source, "accessibility-settings.tsx"), "utf8"),
      /from "radix-ui"/,
    );
    const index = readFileSync(join(source, "index.ts"), "utf8");
    for (const name of [
      "accessibility",
      "accessibility-settings",
      "status-badge",
    ]) {
      assert.match(index, new RegExp(`from "\\./${name}\\.js"`));
    }
  });

  it("DSA-AC-2.4 DSA-T-17 applies a change at once and writes the cookie", () => {
    const text = readFileSync(
      join(root, "packages/ui/src/accessibility-settings.tsx"),
      "utf8",
    );
    assert.match(text, /applyAccessibility\(document\.documentElement/);
    assert.match(text, /accessibilityCookie\(/);
  });
});
