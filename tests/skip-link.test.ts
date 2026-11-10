import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { root } from "./helpers/tokens-css.ts";

const layout: string = readFileSync(
  join(root, "apps/web/src/app/layout.tsx"),
  "utf8",
);
const page: string = readFileSync(
  join(root, "apps/web/src/app/page.tsx"),
  "utf8",
);

/** The opening tag that contains `needle`, from its `<` to its `>` (the sources have no `>` inside attributes). */
function tagWith(source: string, needle: string): string {
  const at = source.indexOf(needle);
  assert.ok(at >= 0, `${needle} not found`);
  const start = source.lastIndexOf("<", at);
  return source.slice(start, source.indexOf(">", at) + 1);
}

describe("DSA-AC-3.2 Skip link to the main content (DSA-T-13)", () => {
  it('DSA-AC-3.2 DSA-T-13 renders a link "Skip to main content" that targets #main-content', () => {
    const tag = tagWith(layout, 'href="#main-content"');
    assert.match(tag, /^<a\b/, "the skip link is not an anchor");
    assert.match(layout, /Skip to main content/);
  });

  it("DSA-AC-3.2 DSA-T-13 puts the skip link first in the body, before the header and the page", () => {
    const skip = layout.indexOf('href="#main-content"');
    const body = layout.indexOf("<body");
    assert.ok(body >= 0 && skip > body, "the skip link is not inside <body>");
    for (const later of [
      "<header",
      "<ThemeSwitcher",
      "<AccessibilitySettings",
      "{children}",
    ]) {
      const at = layout.indexOf(later);
      assert.ok(at > skip, `${later} comes before the skip link`);
    }
    const between = layout.slice(body, layout.lastIndexOf("<a", skip));
    assert.doesNotMatch(
      between,
      /<(a|button|input|select|textarea)\b/,
      "a focusable element comes first",
    );
  });

  it("DSA-AC-3.2 DSA-T-13 hides the skip link until it has focus and then shows it in the top corner", () => {
    const tag = tagWith(layout, 'href="#main-content"');
    assert.match(tag, /\bsr-only\b/);
    assert.match(tag, /focus:not-sr-only/);
    assert.match(tag, /focus:absolute/);
    assert.match(tag, /focus:top-/);
    assert.match(tag, /focus:left-/);
  });

  it('DSA-AC-3.2 DSA-T-13 wraps the page in one <main id="main-content" tabIndex={-1}>', () => {
    assert.equal(
      (layout.match(/<main\b/g) ?? []).length,
      1,
      "not exactly one <main>",
    );
    const tag = tagWith(layout, 'id="main-content"');
    assert.match(tag, /^<main\b/);
    assert.match(tag, /tabIndex=\{-1\}/);
    const open = layout.indexOf(tag);
    const close = layout.indexOf("</main>");
    const children = layout.indexOf("{children}");
    assert.ok(
      open < children && children < close,
      "{children} is not inside <main>",
    );
  });

  it("DSA-AC-3.2 DSA-T-13 keeps no <main> in the page, so the page has one main landmark", () => {
    assert.doesNotMatch(page, /<main\b/);
  });
});
