import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

type Rule = { if?: string; when?: string };
type CiConfig = {
  workflow?: { rules?: Rule[] };
  [key: string]: unknown;
};

function readCi(): CiConfig {
  return parse(readFileSync(join(root, ".gitlab-ci.yml"), "utf8")) as CiConfig;
}

// Evaluates the subset of GitLab CI/CD rule expressions this repo uses:
// `$VAR`, `$VAR == "x"`, `$VAR != "x"`, joined by `&&` and `||` without parentheses.
function evaluate(
  expression: string,
  variables: Record<string, string | undefined>,
): boolean {
  return expression.split("||").some((any) =>
    any.split("&&").every((term) => {
      const match = term.trim().match(/^\$(\w+)(?:\s*(==|!=)\s*"([^"]*)")?$/);
      assert.ok(match, `unsupported rule expression: ${term.trim()}`);
      const [, name, operator, literal] = match;
      const value = variables[name as string];
      if (operator === "==") return value === literal;
      if (operator === "!=") return value !== literal;
      return value !== undefined && value !== "";
    }),
  );
}

function pipelineRuns(variables: Record<string, string | undefined>): boolean {
  const rules = readCi().workflow?.rules;
  assert.ok(rules, "workflow:rules missing");
  for (const rule of rules) {
    if (rule.if === undefined || evaluate(rule.if, variables)) {
      return rule.when !== "never";
    }
  }
  return false;
}

function push(branch: string, openMergeRequest = false) {
  return {
    CI_PIPELINE_SOURCE: "push",
    CI_COMMIT_BRANCH: branch,
    CI_OPEN_MERGE_REQUESTS: openMergeRequest ? "group/project!1" : undefined,
  };
}

describe("SCF-AC-5.1 Pipeline triggers", () => {
  for (const branch of ["feature/42-ci-pipeline", "dev", "main"]) {
    it(`SCF-AC-5.1 runs the pipeline on a push to ${branch}`, () => {
      assert.equal(pipelineRuns(push(branch)), true);
    });
  }

  it("SCF-AC-5.1 runs the pipeline for a merge request", () => {
    assert.equal(
      pipelineRuns({ CI_PIPELINE_SOURCE: "merge_request_event" }),
      true,
    );
  });

  it("SCF-AC-5.1 runs one pipeline, not two, for a push to a branch with an open merge request", () => {
    assert.equal(pipelineRuns(push("feature/42-ci-pipeline", true)), false);
  });

  for (const [job, command] of [
    ["lint", "pnpm run lint"],
    ["typecheck", "pnpm run typecheck"],
    ["test", "pnpm test"],
    ["build", "pnpm run build"],
  ] as const) {
    it(`SCF-AC-5.1 runs the job ${job} in every pipeline`, () => {
      const definition = readCi()[job] as Record<string, unknown> | undefined;
      assert.ok(definition, `job ${job} missing`);
      for (const key of ["rules", "only", "except"]) {
        assert.equal(definition[key], undefined, `job ${job} sets ${key}`);
      }
      assert.ok(
        (definition.script as string[]).includes(command),
        `job ${job} does not run ${command}`,
      );
    });
  }
});

function minutes(duration: string): number {
  const match = duration.match(/^(\d+)\s*(m|min|minutes?|h|hours?)$/);
  assert.ok(match, `unsupported duration: ${duration}`);
  const value = Number.parseInt(match[1] as string, 10);
  return (match[2] as string).startsWith("h") ? value * 60 : value;
}

describe("SCF-AC-5.4 Run time", () => {
  it("SCF-AC-5.4 stops every job after at most 10 minutes", () => {
    const fallback = readCi().default as { timeout?: string } | undefined;
    assert.ok(fallback?.timeout, "default:timeout missing");
    assert.ok(minutes(fallback.timeout) <= 10);
  });

  it("SCF-AC-5.4 runs all checks in parallel in one stage", () => {
    const stages = readCi().stages as string[];
    assert.deepEqual(stages, ["test"]);
  });

  it("SCF-AC-5.4 caches the pnpm store by lockfile and the Turborepo cache", () => {
    const template = readCi()[".pnpm"] as {
      cache?: { key?: { files?: string[] } | string; paths?: string[] }[];
    };
    const caches = template.cache ?? [];
    const store = caches.find((c) => c.paths?.includes(".pnpm-store"));
    assert.ok(store, "pnpm store not cached");
    assert.deepEqual((store.key as { files?: string[] }).files, [
      "pnpm-lock.yaml",
    ]);
    assert.ok(
      caches.some((c) => c.paths?.includes(".turbo/cache")),
      "Turborepo cache not cached",
    );
  });
});

describe("SCF-AC-5.5 Visible status", () => {
  it("SCF-AC-5.5 runs the checks as a merge request pipeline, whose status the merge request shows", () => {
    const event = { CI_PIPELINE_SOURCE: "merge_request_event" };
    assert.equal(pipelineRuns(event), true);
    assert.equal(pipelineRuns(push("feature/42-ci-pipeline", true)), false);
  });
});
