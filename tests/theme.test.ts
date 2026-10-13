import assert from "node:assert/strict";
import { describe, it } from "node:test";
import * as theme from "../packages/ui/src/theme.ts";

describe("DSA-AC-1.2 Switching and remembering the theme", () => {

  it("DSA-AC-1.2 offers exactly the four themes, light first", () => {
    assert.deepEqual(theme.themes, ["light", "dark", "sepia", "night"]);
  });

  it("DSA-AC-1.2 reads the remembered theme from the cookie header", () => {
    assert.equal(
      theme.readThemeCookie("session=abc; stash-theme=sepia; other=1"),
      "sepia",
    );
  });

  it("DSA-AC-1.2 falls back to light for a missing or unknown cookie", () => {
    assert.equal(theme.readThemeCookie(undefined), "light");
    assert.equal(theme.readThemeCookie("stash-theme=neon"), "light");
  });

  it("DSA-AC-1.2 remembers the choice for a year on the whole site", () => {
    assert.equal(
      theme.themeCookie("night"),
      "stash-theme=night; Path=/; Max-Age=31536000; SameSite=Lax",
    );
  });

  it("DSA-AC-1.2 switches the theme on the root element without a reload", () => {
    const element = { dataset: {} as Record<string, string> };
    theme.applyTheme(element, "dark");
    assert.equal(element.dataset.theme, "dark");
  });
});
