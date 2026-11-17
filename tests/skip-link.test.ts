import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { root } from "./helpers/paths.ts";
import { openingTag, withoutComments } from "./helpers/source.ts";

/** A source of the web client without its comments, so a match in a comment does not count. */
function code(file: string): string {
  return withoutComments(readFileSync(join(root, file), "utf8"));
}

const layout: string = code("apps/web/src/app/layout.tsx");
const page: string = code("apps/web/src/app/page.tsx");

describe("DSA-AC-3.2 The source helpers behind the skip link test (DSA-T-13)", () => {
  it("DSA-AC-3.2 DSA-T-13 ignores a match in a comment", () => {
    const source = withoutComments(
      '// <main id="a">\n/* <main> */\nconst a = "//kept";',
    );
    assert.doesNotMatch(source, /<main/);
    assert.match(source, /"\/\/kept"/);
  });

  it("DSA-AC-3.2 DSA-T-13 finds the end of a tag with a > inside an attribute value", () => {
    const tag = openingTag(
      '<a title="a > b" href="#x" data-n={1 > 0 ? "y" : "z"}>text</a>',
      'href="#x"',
    );
    assert.equal(tag, '<a title="a > b" href="#x" data-n={1 > 0 ? "y" : "z"}>');
  });
});

describe("DSA-AC-3.2 Skip link to the main content (DSA-T-13)", () => {
  it('DSA-AC-3.2 DSA-T-13 renders a link "Skip to main content" that targets #main-content', () => {
    const tag = openingTag(layout, 'href="#main-content"');
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
    const tag = openingTag(layout, 'href="#main-content"');
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
    const tag = openingTag(layout, 'id="main-content"');
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
