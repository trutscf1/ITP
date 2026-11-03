import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const units = ["web", "identity", "storage", "worker", "cms"] as const;
const packages = ["contracts", "ui", "config", "telemetry"] as const;

function readJson(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as Record<
    string,
    unknown
  >;
}

/** The five tasks every unit, package, and the repository root provide (SCF-F-12). */
const tasks = ["dev", "build", "lint", "typecheck", "test"] as const;

function scriptsOf(folder: string): Record<string, string> {
  return readJson(`${folder}/package.json`).scripts as Record<string, string>;
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
  for (const task of tasks) {
    it(`SCF-AC-1.3 runs ${task} through Turborepo`, () => {
      assert.equal(scriptsOf(".")[task], `turbo run ${task}`);
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
    for (const task of tasks) {
      it(`SCF-AC-1.3 ${folder} provides the task ${task}`, () => {
        assert.ok(scriptsOf(folder)[task], `${folder} has no ${task} script`);
      });
    }
  }

  it("SCF-AC-1.3 the acceptance tests are a workspace package", () => {
    const workspace = readFileSync(join(root, "pnpm-workspace.yaml"), "utf8");
    assert.match(workspace, /^\s*- tests$/m);
  });

  it("SCF-AC-1.3 runs dev as a persistent Turborepo task", () => {
    const turbo = readJson("turbo.json").tasks as Record<
      string,
      { persistent?: boolean; cache?: boolean }
    >;
    assert.equal(turbo.dev?.persistent, true);
    assert.equal(turbo.dev?.cache, false);
    assert.ok(turbo.test, "turbo.json has no test task");
  });

  it("SCF-AC-1.3 never serves a cached result of the test task", () => {
    // The acceptance tests read files outside their package (README.md, biome.json, other
    // packages), which Turborepo does not know as inputs: a cache hit could report a stale pass.
    const turbo = readJson("turbo.json").tasks as Record<
      string,
      { cache?: boolean }
    >;
    assert.equal(turbo.test?.cache, false);
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

/** The body of the "## Quick start" section of a README, with LF or CRLF line ends. */
function quickStart(readme: string): string | undefined {
  return readme.match(/^## Quick start\r?\n([\s\S]*?)(?=^## )/m)?.[1];
}

describe("SCF-AC-1.5 Quick start", () => {
  const readme = readFileSync(join(root, "README.md"), "utf8");
  const section = quickStart(readme);

  it("SCF-AC-1.5 has a Quick start section in the README", () => {
    assert.ok(section, "no '## Quick start' section");
  });

  it("SCF-AC-1.5 finds the section when the README has Windows line ends", () => {
    assert.equal(
      quickStart(readme.replace(/\r?\n/g, "\r\n"))?.replace(/\r\n/g, "\n"),
      section,
    );
  });

  it("SCF-AC-1.5 keeps line ends the same on every system", () => {
    const attributes = readFileSync(join(root, ".gitattributes"), "utf8");
    assert.match(attributes, /^\* text=auto eol=lf$/m);
  });

  it("SCF-AC-1.5 the guide names the steps to start the project", () => {
    assert.match(section ?? "", /cp \.env\.example \.env/);
    assert.match(section ?? "", /docker compose up/);
    assert.match(section ?? "", /pnpm install/);
    assert.match(section ?? "", /pnpm --filter @stash\/web dev/);
  });

  it("SCF-AC-1.5 the guide is short (at most 30 lines)", () => {
    assert.ok((section ?? "").trim().split(/\r?\n/).length <= 30);
  });

  it("SCF-AC-1.5 the commands of the guide exist", () => {
    assert.ok(existsSync(join(root, ".env.example")));
    assert.ok(existsSync(join(root, "docker-compose.yml")));
    assert.ok(scriptsOf("apps/web").dev);
  });
});
