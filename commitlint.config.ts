// Commit message format of documentation/WORKFLOW.md "Commit messages" (SCF-F-13, SCF-AC-6.1):
// Conventional Commits 1.0.0, a scope from the list below (optional), and at least one
// requirement ID in brackets at the end of the subject, or [no-req] for pure chores.
import type { Plugin, UserConfig } from "@commitlint/types";
import { RuleConfigSeverity } from "@commitlint/types";

const requirementId: RegExp =
  /(\[[A-Z]+-[A-Z]+-[0-9]+(\.[0-9]+)?\]|\[no-req\])$/;

const plugin: Plugin = {
  rules: {
    "subject-requirement-id": ({ subject }) => [
      requirementId.test(subject ?? ""),
      "the subject must end with a requirement ID such as [SCF-F-5] or with [no-req]",
    ],
  },
};

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  plugins: [plugin],
  rules: {
    "type-enum": [
      RuleConfigSeverity.Error,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "test",
        "refactor",
        "perf",
        "style",
        "build",
        "ci",
        "chore",
        "revert",
      ],
    ],
    "scope-enum": [
      RuleConfigSeverity.Error,
      "always",
      [
        "web",
        "identity",
        "storage",
        "worker",
        "cms",
        "contracts",
        "ui",
        "config",
        "deps",
        "ci",
        "repo",
      ],
    ],
    "header-max-length": [RuleConfigSeverity.Error, "always", 120],
    "subject-requirement-id": [RuleConfigSeverity.Error, "always"],
  },
};

export default config;
