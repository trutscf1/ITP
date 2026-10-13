import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import lint from "@commitlint/lint";
import load from "@commitlint/load";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

async function check(message: string): Promise<boolean> {
  const config = await load({}, { cwd: root });
  const result = await lint(message, config.rules, {
    plugins: config.plugins,
    parserOpts: config.parserPreset?.parserOpts as Record<string, unknown>,
  });
  return result.valid;
}

// Example 4 of documentation/concepts/scaffolding.md §9 and WORKFLOW.md "Commit messages".
describe("SCF-AC-6.1 Commit check", () => {
  it("SCF-AC-6.1 accepts a feature with unit scope, requirement ID, and issue footer", async () => {
    assert.equal(
      await check("feat(storage): add health endpoint [SCF-F-5]\n\nRefs: #14"),
      true,
    );
  });

  it("SCF-AC-6.1 accepts a breaking change with its footer", async () => {
    assert.equal(
      await check(
        "fix(web)!: rename status route [SCF-F-8]\n\nBREAKING CHANGE: status page moved to /status",
      ),
      true,
    );
  });

  it("SCF-AC-6.1 accepts a chore without a requirement as [no-req]", async () => {
    assert.equal(
      await check("chore(deps): update dependencies [no-req]"),
      true,
    );
  });

  it("SCF-AC-6.1 rejects a message without a type", async () => {
    assert.equal(await check("Added health endpoint"), false);
  });

  it("SCF-AC-6.1 rejects a scope that is not a unit, package, deps, ci, or repo", async () => {
    assert.equal(
      await check("feat(backend): add health endpoint [SCF-F-5]"),
      false,
    );
  });

  it("SCF-AC-6.1 rejects a subject without a requirement ID or [no-req]", async () => {
    assert.equal(await check("feat(storage): add health endpoint"), false);
  });

  it("SCF-AC-6.1 rejects a subject that starts with a capital letter", async () => {
    assert.equal(
      await check("feat(storage): Add health endpoint [SCF-F-5]"),
      false,
    );
  });
});

describe("SCF-AC-6.1 Breaking changes", () => {
  it("SCF-AC-6.1 rejects a breaking change marker without its BREAKING CHANGE footer", async () => {
    assert.equal(
      await check("fix(web)!: rename status route [SCF-F-8]"),
      false,
    );
  });

  it("SCF-AC-6.1 accepts a commit without scope when no single scope fits", async () => {
    assert.equal(await check("ci: add a job [SCF-F-15]"), true);
  });
});
