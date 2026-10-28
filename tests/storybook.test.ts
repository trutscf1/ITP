import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
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

  it("DSA-AC-1.5 Storybook shows the stories in every theme of the design system", () => {
    const preview = readFileSync(join(ui, ".storybook/preview.ts"), "utf8");
    const styles = readFileSync(join(ui, ".storybook/storybook.css"), "utf8");
    assert.match(
      preview,
      /import \{[^}]*\bthemes\b[^}]*\} from "\.\.\/src\/theme"/,
    );
    assert.match(preview, /applyTheme\(/);
    assert.match(styles, /@import "\.\.\/src\/tokens\.css"/);
  });

  it("DSA-AC-1.5 Storybook builds and lists a story for every component", () => {
    const require = createRequire(join(ui, "package.json"));
    const packageFile = require.resolve("storybook/package.json");
    const manifest = JSON.parse(readFileSync(packageFile, "utf8")) as {
      bin: string | Record<string, string>;
    };
    const bin =
      typeof manifest.bin === "string" ? manifest.bin : manifest.bin.storybook;
    const output = mkdtempSync(join(tmpdir(), "storybook-"));
    try {
      const build = spawnSync(
        process.execPath,
        [
          join(dirname(packageFile), bin as string),
          "build",
          "--output-dir",
          output,
        ],
        {
          cwd: ui,
          encoding: "utf8",
          timeout: 120_000,
          env: { ...process.env, STORYBOOK_DISABLE_TELEMETRY: "1" },
        },
      );
      assert.equal(build.status, 0, build.stdout + build.stderr);
      const index = JSON.parse(
        readFileSync(join(output, "index.json"), "utf8"),
      ) as { entries: Record<string, { type: string; importPath: string }> };
      const stories = Object.values(index.entries).filter(
        (entry) => entry.type === "story",
      );
      for (const component of components) {
        assert.ok(
          stories.some((entry) =>
            entry.importPath.endsWith(`/${component}.stories.tsx`),
          ),
          `Storybook lists no story for ${component}`,
        );
      }
    } finally {
      rmSync(output, { recursive: true, force: true });
    }
  });
});
