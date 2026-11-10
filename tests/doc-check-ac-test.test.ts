import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

// Rule AC-TEST of gam-ai-knowledge/tools/doc-check.mjs (#138, WORKFLOW.md "Definition of Done" item 1,
// MANIFEST.md "What the script checks"): every acceptance criterion needs a test whose name
// carries its AC ID. Each case builds a small repository in a temporary folder: one feature
// "Alpha" (prefix ALP) with one story, two criteria, and two slices (#11 delivers ALP-AC-1.1,
// #12 delivers ALP-AC-1.2), plus the test files the case needs.

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const docCheck = join(repo, "gam-ai-knowledge", "tools", "doc-check.mjs");
const scratch = mkdtempSync(join(tmpdir(), "doc-check-ac-test-"));

after(() => rmSync(scratch, { recursive: true, force: true }));

interface Finding {
  severity: "error" | "warning";
  code: string;
  file: string;
  line: number;
  id: string;
  message: string;
}

interface Fixture {
  stage: string;
  files?: Record<string, string>;
  untested?: string[];
}

interface Run {
  status: number | null;
  stdout: string;
  acTest: Finding[];
}

const frontmatter = (fields: string): string =>
  `---\n${fields}\nformat: gam-ai-knowledge/1\naudience: [developer]\n---\n`;

function writeFiles(dir: string, files: Record<string, string>): void {
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), content);
  }
}

function documentation({
  stage,
  untested = [],
}: Fixture): Record<string, string> {
  const untestedTable = untested.length
    ? `\n| ID | Reason |\n| --- | --- |\n${untested.map((id) => `| ${id} | checked by hand |`).join("\n")}\n`
    : "";
  return {
    "gam-ai-knowledge/GOAL.md": `${frontmatter("doc: goal\ntitle: Project goal")}# Goal\n`,
    "gam-ai-knowledge/ROADMAP.md": `${frontmatter("doc: roadmap\ntitle: Roadmap")}# Roadmap

| Version | Feature | Serves | Status | Depends on | Feasibility |
| --- | --- | --- | --- | --- | --- |
| – | Alpha | G-1 | ${stage} | – | high |
`,
    "gam-ai-knowledge/concepts/alpha.md": `${frontmatter('doc: concept\ntitle: Alpha\nid-prefix: "ALP"\nserves: G-1')}# Alpha

| ID | Title | Requirement | Derives from |
| --- | --- | --- | --- |
| ALP-F-1 | First | The system MUST do the first thing. | ALP-AC-1.1 |
| ALP-F-2 | Second | The system MUST do the second thing. | ALP-AC-1.2 |

| ID | Title | Covers | Given | When | Then |
| --- | --- | --- | --- | --- | --- |
| ALP-T-1 | Both | ALP-AC-1.1, ALP-AC-1.2, ALP-F-1, ALP-F-2 | a | b | c |
${untestedTable}`,
    "gam-ai-knowledge/work-items/alpha/feature.md": `${frontmatter('doc: feature\ntitle: Alpha\nid-prefix: "ALP"\nconcept: "alpha.md"')}# Alpha

- [ALP-US-1](ALP-US-1-one.md)
`,
    "gam-ai-knowledge/work-items/alpha/ALP-US-1-one.md": `${frontmatter('doc: story\ntitle: "ALP-US-1 One"\nid-prefix: "ALP"')}# ALP-US-1 One

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| ALP-US-1 | One | developer | one thing | it works | Must |

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| ALP-AC-1.1 | First | a | b | c |
| ALP-AC-1.2 | Second | a | b | c |

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — first | ALP-AC-1.1 | — | #11 |
| 2 — second | ALP-AC-1.2 | 1 | #12 |
`,
  };
}

/** A test file that names ALP-AC-1.1 only, so ALP-AC-1.2 is the criterion without a test. */
const firstOnly: Record<string, string> = {
  "tests/alpha.test.ts": `describe("ALP-AC-1.1 First", () => {\n  it("works", () => {});\n});\n`,
};

let runs = 0;

/** Runs doc-check on a fresh copy of the fixture; with `--json` the AC-TEST findings are parsed. */
function check(fixture: Fixture, ...options: string[]): Run {
  const dir = join(scratch, `case-${++runs}`);
  writeFiles(dir, {
    ...documentation(fixture),
    ...(fixture.files ?? firstOnly),
  });
  const result = spawnSync(
    process.execPath,
    [docCheck, "gam-ai-knowledge", ...options],
    {
      cwd: dir,
      encoding: "utf8",
    },
  );
  const findings = options.includes("--json")
    ? (JSON.parse(result.stdout) as { findings: Finding[] }).findings
    : [];
  return {
    status: result.status,
    stdout: result.stdout,
    acTest: findings.filter((f) => f.code === "AC-TEST"),
  };
}

const checkJson = (fixture: Fixture, ...options: string[]): Run =>
  check(fixture, "--json", ...options);

const ids = (findings: Finding[], severity: Finding["severity"]): string[] =>
  findings
    .filter((f) => f.severity === severity)
    .map((f) => f.id)
    .sort();

describe("doc-check AC-TEST: severity follows the stage of the feature", () => {
  it("reports nothing while the feature is an idea, a concept, or ready", () => {
    for (const stage of ["concept", "ready"]) {
      assert.deepEqual(
        checkJson({ stage, files: {} }).acTest,
        [],
        `stage ${stage}`,
      );
    }
  });

  it("warns about a criterion without a test while the feature is in progress", () => {
    const run = checkJson({ stage: "in progress" });
    assert.deepEqual(ids(run.acTest, "warning"), ["ALP-AC-1.2"]);
    assert.deepEqual(ids(run.acTest, "error"), []);
    assert.equal(run.status, 0);
  });

  it("fails on a criterion without a test once the feature is in dev or released", () => {
    for (const stage of ["in dev", "released"]) {
      const run = checkJson({ stage });
      assert.deepEqual(
        ids(run.acTest, "error"),
        ["ALP-AC-1.2"],
        `stage ${stage}`,
      );
      assert.equal(run.status, 1, `stage ${stage}`);
    }
  });

  it("names the rule, the story file, and the criterion in the text output", () => {
    const run = check({ stage: "in dev" });
    assert.equal(run.status, 1);
    assert.match(
      run.stdout,
      /^ERROR\s+AC-TEST\s+documentation\/work-items\/alpha\/ALP-US-1-one\.md:\d+\s+ALP-AC-1\.2 — /m,
    );
  });
});

describe("doc-check AC-TEST: the merge request's slice must be tested", () => {
  it("fails on a criterion the merge request's slice delivers", () => {
    const run = checkJson(
      { stage: "in progress" },
      "--pending-branch",
      "feature/12-second",
    );
    assert.deepEqual(ids(run.acTest, "error"), ["ALP-AC-1.2"]);
    assert.equal(run.status, 1);
  });

  it("only warns about a criterion that another slice delivers", () => {
    const run = checkJson(
      { stage: "in progress" },
      "--pending-branch",
      "fix/11-first",
    );
    assert.deepEqual(ids(run.acTest, "error"), []);
    assert.deepEqual(ids(run.acTest, "warning"), ["ALP-AC-1.2"]);
  });

  it("passes when the slice's criteria all have tests", () => {
    const files = {
      "tests/alpha.test.ts": `describe("ALP-AC-1.1 First", () => {});\nit("ALP-AC-1.2 second", () => {});\n`,
    };
    const run = checkJson(
      { stage: "ready", files },
      "--pending-branch",
      "feature/12-second",
    );
    assert.deepEqual(run.acTest, []);
    assert.equal(run.status, 0);
  });
});

describe("doc-check AC-TEST: an untested justification lowers the error to a warning", () => {
  it("warns instead of failing when §17 justifies the criterion", () => {
    const run = checkJson({ stage: "in dev", untested: ["ALP-AC-1.2"] });
    assert.deepEqual(ids(run.acTest, "error"), []);
    assert.deepEqual(ids(run.acTest, "warning"), ["ALP-AC-1.2"]);
    assert.equal(run.status, 0);
  });
});

describe("doc-check AC-TEST: what counts as a test name", () => {
  const covered = (files: Record<string, string>): boolean =>
    !checkJson({ stage: "in dev", files }).acTest.some(
      (f) => f.id === "ALP-AC-1.2",
    );

  it("counts describe, it, test, suite, test.describe, and .only in test and spec files", () => {
    const names = [
      'describe("ALP-AC-1.2 second", () => {});',
      "it('checks ALP-AC-1.2', () => {});",
      "test(`ALP-AC-1.2 second`, () => {});",
      'suite("ALP-AC-1.2", () => {});',
      'test.describe("ALP-AC-1.2 second", () => {});',
      'it.only("ALP-AC-1.2 second", () => {});',
    ];
    for (const name of names) {
      assert.ok(covered({ "tests/b.test.ts": name }), name);
    }
  });

  it("finds test files in tests/, apps/, and packages/ with every script extension", () => {
    const paths = [
      "tests/e2e/b.spec.ts",
      "apps/web/src/b.test.tsx",
      "packages/contracts/src/b.test.mjs",
      "apps/storage/test/b.spec.js",
    ];
    for (const path of paths) {
      assert.ok(covered({ [path]: 'it("ALP-AC-1.2", () => {});' }), path);
    }
  });

  it("ignores skipped tests, comments, other calls, and longer IDs", () => {
    const names = [
      'it.skip("ALP-AC-1.2 second", () => {});',
      'it.todo("ALP-AC-1.2 second");',
      '// it("ALP-AC-1.2 second", () => {});',
      'console.log("ALP-AC-1.2");',
      'it("ALP-AC-1.20 other", () => {});',
    ];
    for (const name of names) {
      assert.ok(!covered({ "tests/b.test.ts": name }), name);
    }
  });

  it("ignores files that are no test files and folders such as node_modules", () => {
    const paths = [
      "tests/helper.ts",
      "apps/web/node_modules/x/b.test.ts",
      "apps/web/.next/b.test.js",
      "apps/web/dist/b.test.js",
      "docs/b.test.ts",
    ];
    for (const path of paths) {
      assert.ok(!covered({ [path]: 'it("ALP-AC-1.2", () => {});' }), path);
    }
  });
});
