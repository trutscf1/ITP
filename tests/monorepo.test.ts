import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const units = ["web", "identity", "storage", "worker", "cms"] as const;
const packages = ["contracts", "ui", "config"] as const;

function readJson(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as Record<
    string,
    unknown
  >;
}

function atLeast(actual: string, minimum: string): boolean {
  const parse = (v: string): number[] =>
    v
      .replace(/^[^\d]*/, "")
      .split(".")
      .map((n) => Number.parseInt(n, 10) || 0);
  const a = parse(actual);
  const m = parse(minimum);
  for (let i = 0; i < 3; i++) {
    if ((a[i] ?? 0) !== (m[i] ?? 0)) return (a[i] ?? 0) > (m[i] ?? 0);
  }
  return true;
}

describe("SCF-AC-1.1 Workspace layout", () => {
  it("SCF-AC-1.1 lists apps/* and packages/* in one pnpm workspace", () => {
    const workspace = readFileSync(join(root, "pnpm-workspace.yaml"), "utf8");
    assert.match(workspace, /apps\/\*/);
    assert.match(workspace, /packages\/\*/);
  });

  for (const unit of units) {
    it(`SCF-AC-1.1 has the unit apps/${unit}`, () => {
      const pkg = readJson(`apps/${unit}/package.json`);
      assert.equal(pkg.name, `@stash/${unit}`);
    });
  }

  for (const name of packages) {
    it(`SCF-AC-1.1 has the package packages/${name}`, () => {
      const pkg = readJson(`packages/${name}/package.json`);
      assert.equal(pkg.name, `@stash/${name}`);
    });
  }

  it("SCF-AC-1.1 runs the workspace with Turborepo", () => {
    assert.ok(existsSync(join(root, "turbo.json")));
    const pkg = readJson("package.json");
    const devDependencies = pkg.devDependencies as Record<string, string>;
    assert.ok(devDependencies.turbo);
  });
});

describe("SCF-AC-1.3 Root tasks", () => {
  for (const task of ["dev", "lint", "typecheck", "test", "build"] as const) {
    it(`SCF-AC-1.3 runs ${task} through Turborepo`, () => {
      const scripts = readJson("package.json").scripts as Record<
        string,
        string
      >;
      assert.equal(scripts[task], `turbo run ${task}`);
    });
  }
});

describe("SCF-AC-1.3 Tasks of every unit and package (SCF-F-12)", () => {
  const folders = [
    ...units.map((name) => `apps/${name}`),
    ...packages.map((name) => `packages/${name}`),
    "tests",
  ];

  for (const folder of folders) {
    for (const task of ["dev", "build", "lint", "typecheck", "test"] as const) {
      it(`SCF-AC-1.3 ${folder} provides the task ${task}`, () => {
        const scripts = readJson(`${folder}/package.json`).scripts as Record<
          string,
          string
        >;
        assert.ok(scripts[task], `${folder} has no ${task} script`);
      });
    }
  }

  it("SCF-AC-1.3 the acceptance tests are a workspace package", () => {
    const workspace = readFileSync(join(root, "pnpm-workspace.yaml"), "utf8");
    assert.match(workspace, /^\s*- tests$/m);
  });

  it("SCF-AC-1.3 runs dev as a persistent Turborepo task", () => {
    const tasks = readJson("turbo.json").tasks as Record<
      string,
      { persistent?: boolean; cache?: boolean }
    >;
    assert.equal(tasks.dev?.persistent, true);
    assert.equal(tasks.dev?.cache, false);
    assert.ok(tasks.test, "turbo.json has no test task");
  });
});

describe("SCF-AC-1.4 Pinned versions", () => {
  it("SCF-AC-1.4 pins Node.js 24 LTS (>= 24.14.0) in .tool-versions", () => {
    const toolVersions = readFileSync(join(root, ".tool-versions"), "utf8");
    const match = toolVersions.match(/^nodejs\s+(\S+)$/m);
    assert.ok(match, "nodejs entry missing");
    assert.ok(atLeast(match[1] as string, "24.14.0"));
    assert.ok((match[1] as string).startsWith("24."));
  });

  it("SCF-AC-1.4 requires Node.js >= 24.14.0 in engines", () => {
    const engines = readJson("package.json").engines as Record<string, string>;
    assert.equal(engines.node, ">=24.14.0");
  });

  it("SCF-AC-1.4 uses Next.js >= 16.3 and React >= 19.2 in the web unit", () => {
    const dependencies = readJson("apps/web/package.json")
      .dependencies as Record<string, string>;
    assert.ok(atLeast(dependencies.next as string, "16.3.0"));
    assert.ok(atLeast(dependencies.react as string, "19.2.0"));
  });

  it("SCF-AC-1.4 types the web unit against Node.js 24", () => {
    const devDependencies = readJson("apps/web/package.json")
      .devDependencies as Record<string, string>;
    assert.match(devDependencies["@types/node"] as string, /^\^?24/);
  });
});
