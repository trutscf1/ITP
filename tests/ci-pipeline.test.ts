import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

type Rule = { if?: string; when?: string };
type Cache = { key?: string | { files?: string[] }; paths?: string[] };
type Job = {
  image?: string;
  script?: string[];
  cache?: Cache[];
  rules?: unknown;
  only?: unknown;
  except?: unknown;
};
type CiConfig = {
  workflow?: { rules?: Rule[] };
  default?: { timeout?: string };
  stages?: string[];
};
type CiVariables = Record<string, string | undefined>;

function readCi(): CiConfig {
  return parse(readFileSync(join(root, ".gitlab-ci.yml"), "utf8")) as CiConfig;
}

function readJob(name: string): Job {
  const job = (readCi() as Record<string, Job | undefined>)[name];
  assert.ok(job, `job ${name} missing`);
  return job;
}

// Evaluates the GitLab CI/CD rule expressions this repo uses: `$VAR` and `$VAR == "x"`,
// joined by `&&`.
function evaluate(expression: string, variables: CiVariables): boolean {
  return expression.split("&&").every((term) => {
    const match = term.trim().match(/^\$(\w+)(?:\s*==\s*"([^"]*)")?$/);
    assert.ok(match, `unsupported rule expression: ${term.trim()}`);
    const [, name, literal] = match;
    const value = variables[name as string];
    if (literal !== undefined) return value === literal;
    return value !== undefined && value !== "";
  });
}

function pipelineRuns(variables: CiVariables): boolean {
  const rules = readCi().workflow?.rules;
  assert.ok(rules, "workflow:rules missing");
  for (const rule of rules) {
    if (rule.if === undefined || evaluate(rule.if, variables)) {
      return rule.when !== "never";
    }
  }
  return false;
}

function push(branch: string, openMergeRequest = false): CiVariables {
  return {
    CI_PIPELINE_SOURCE: "push",
    CI_COMMIT_BRANCH: branch,
    CI_OPEN_MERGE_REQUESTS: openMergeRequest ? "group/project!1" : undefined,
  };
}

const checks = [
  ["lint", "pnpm run lint"],
  ["typecheck", "pnpm run typecheck"],
  ["test", "pnpm test"],
  ["build", "pnpm run build"],
] as const;

describe("SCF-AC-5.1 Pipeline triggers", () => {
  for (const branch of ["feature/42-ci-pipeline", "dev", "main"]) {
    it(`SCF-AC-5.1 runs the pipeline on a push to ${branch}`, () => {
      assert.equal(pipelineRuns(push(branch)), true);
    });
  }

  it("SCF-AC-5.1 runs one pipeline, not two, for a push to a branch with an open merge request", () => {
    assert.equal(pipelineRuns(push("feature/42-ci-pipeline", true)), false);
  });

  for (const [name, command] of checks) {
    it(`SCF-AC-5.1 runs the job ${name} in every pipeline`, () => {
      const job = readJob(name);
      assert.equal(job.rules, undefined, `job ${name} sets rules`);
      assert.equal(job.only, undefined, `job ${name} sets only`);
      assert.equal(job.except, undefined, `job ${name} sets except`);
      assert.ok(
        job.script?.includes(command),
        `${name} does not run ${command}`,
      );
    });
  }
});

function minutes(duration: string): number {
  const match = duration.match(/^(\d+)\s*(?:m|min|minutes?)$/);
  assert.ok(match, `unsupported duration: ${duration}`);
  return Number.parseInt(match[1] as string, 10);
}

describe("SCF-AC-5.4 Run time", () => {
  it("SCF-AC-5.4 stops every job after at most 10 minutes", () => {
    const timeout = readCi().default?.timeout;
    assert.ok(timeout, "default:timeout missing");
    assert.ok(minutes(timeout) <= 10);
  });

  it("SCF-AC-5.4 runs all checks in parallel in one stage", () => {
    assert.deepEqual(readCi().stages, ["test"]);
  });

  it("SCF-AC-5.4 caches the pnpm store by lockfile and the Turborepo cache", () => {
    const caches = readJob(".pnpm").cache ?? [];
    const store = caches.find((cache) => cache.paths?.includes(".pnpm-store"));
    assert.ok(store, "pnpm store not cached");
    assert.deepEqual(store.key, { files: ["pnpm-lock.yaml"] });
    assert.ok(
      caches.some((cache) => cache.paths?.includes(".turbo/cache")),
      "Turborepo cache not cached",
    );
  });
});

describe("SCF-AC-5.5 Visible status", () => {
  it("SCF-AC-5.5 runs the checks as a merge request pipeline, whose status the merge request shows", () => {
    assert.equal(
      pipelineRuns({ CI_PIPELINE_SOURCE: "merge_request_event" }),
      true,
    );
  });
});

describe("SCF-AC-1.4 Pinned versions in CI", () => {
  it("SCF-AC-1.4 runs the pipeline on the Node.js version of .tool-versions", () => {
    const toolVersions = readFileSync(join(root, ".tool-versions"), "utf8");
    const pinned = toolVersions.match(/^nodejs\s+(\S+)$/m)?.[1];
    assert.ok(pinned, "nodejs entry missing");
    assert.equal(readJob(".pnpm").image, `node:${pinned}-alpine`);
  });
});
