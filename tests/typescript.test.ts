import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Biome's start script, run with Node.js: a `.bin` shim does not start without a shell on Windows. */
const biome = createRequire(join(root, "package.json")).resolve(
  "@biomejs/biome/bin/biome",
);

/** Every folder of the workspace that has a `package.json`: `apps/*` and `packages/*`. */
const workspaces = ["apps", "packages"].flatMap((group) =>
  readdirSync(join(root, group), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `${group}/${entry.name}`)
    .filter((path) => {
      try {
        readFileSync(join(root, path, "package.json"));
        return true;
      } catch {
        return false;
      }
    }),
);

interface Tsconfig {
  extends?: string;
  compilerOptions?: { strict?: boolean };
}

/** Whether `strict` is on once the `extends` chain of a tsconfig is resolved. */
function isStrict(file: string): boolean {
  const config = JSON.parse(readFileSync(file, "utf8")) as Tsconfig;
  if (config.compilerOptions?.strict !== undefined) {
    return config.compilerOptions.strict;
  }
  const parent = config.extends;
  if (!parent) return false;
  const next = parent.startsWith("@stash/config/")
    ? join(root, "packages/config", parent.slice("@stash/config/".length))
    : join(dirname(file), parent);
  return isStrict(next);
}

describe("SCF-AC-1.2 Strict TypeScript", () => {
  it("SCF-AC-1.2 finds the apps and packages of the workspace", () => {
    assert.ok(workspaces.length >= 8, `found only ${workspaces.join(", ")}`);
  });

  for (const path of workspaces) {
    if (path === "packages/config") continue; // holds the base config, no code
    it(`SCF-AC-1.2 compiles ${path} in strict mode`, () => {
      assert.ok(isStrict(join(root, path, "tsconfig.json")));
    });

    it(`SCF-AC-1.2 lets lint of ${path} report an error for any`, () => {
      const probe = join(root, path, "any-probe.ts");
      writeFileSync(probe, "export const value: any = 1;\n");
      try {
        const result = spawnSync(process.execPath, [biome, "check", "."], {
          cwd: join(root, path),
          encoding: "utf8",
        });
        assert.notEqual(result.status, 0, "biome check passed on any");
        assert.match(result.stdout + result.stderr, /noExplicitAny/);
      } finally {
        rmSync(probe, { force: true });
      }
    });
  }

  it("SCF-AC-1.2 the web unit takes its TypeScript settings from the shared config", () => {
    const config = JSON.parse(
      readFileSync(join(root, "apps/web/tsconfig.json"), "utf8"),
    ) as Tsconfig;
    assert.equal(config.extends, "@stash/config/tsconfig.base.json");
  });
});
