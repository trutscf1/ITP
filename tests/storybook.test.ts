import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ui = join(root, "packages/ui");
const source = join(ui, "src");

/** Component files of the design system: every `.tsx` file that is not a story. */
const components = readdirSync(source)
  .filter((file) => file.endsWith(".tsx") && !file.endsWith(".stories.tsx"))
  .map((file) => file.replace(/\.tsx$/, ""));

describe("DSA-AC-1.5 Storybook", () => {
  it("DSA-AC-1.5 the design system has at least one component", () => {
    assert.ok(components.length > 0, "no component found in packages/ui/src");
  });

  for (const component of components) {
    it(`DSA-AC-1.5 documents ${component} in a story`, () => {
      const file = join(source, `${component}.stories.tsx`);
      assert.ok(existsSync(file), `${component}.stories.tsx is missing`);
      assert.match(
        readFileSync(file, "utf8"),
        /export const \w+\s*(:\s*\w+\s*)?=/,
        `${component}.stories.tsx exports no story`,
      );
    });
  }

  it("DSA-AC-1.5 Storybook is configured and can be started and built", () => {
    const pkg = JSON.parse(readFileSync(join(ui, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    assert.match(pkg.scripts?.storybook ?? "", /storybook dev/);
    assert.match(pkg.scripts?.["build-storybook"] ?? "", /storybook build/);
    assert.ok(pkg.devDependencies?.storybook, "storybook missing");
    assert.ok(existsSync(join(ui, ".storybook/main.ts")), "main.ts missing");
  });

  it("DSA-AC-1.5 Storybook shows the stories in all four themes", () => {
    const preview = readFileSync(join(ui, ".storybook/preview.ts"), "utf8");
    assert.match(preview, /tokens\.css/);
    for (const theme of ["light", "dark", "sepia", "night"]) {
      assert.match(preview, new RegExp(`"${theme}"`));
    }
  });
});
