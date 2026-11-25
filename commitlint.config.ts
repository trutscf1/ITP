// Commit message format of gam-ai-knowledge/WORKFLOW.md "Commit messages" (SCF-F-13, SCF-AC-6.1):
// Conventional Commits 1.0.0 with the types of @commitlint/config-conventional (the same list as
// WORKFLOW.md), a scope from the list below when one fits, a requirement ID in brackets at the
// end of the subject or [no-req], and a BREAKING CHANGE footer for every "!".
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
    "breaking-change-footer": ({ header, body, footer }) => [
      !/^\w+(\([\w-]+\))?!:/.test(header ?? "") ||
        /^BREAKING[ -]CHANGE: /m.test(`${body ?? ""}\n${footer ?? ""}`),
      'a "!" needs a "BREAKING CHANGE: <what>" footer',
    ],
  },
};

// The three commits on dev from before the workflow (WORKFLOW.md "Commit messages"). They cannot
// be rewritten, so only these exact messages pass; every other message is still checked.
const beforeWorkflow: string[] = [
  "setup",
  "feat: added prisma",
  "added mongoDB to docker stack",
];

// Two commits of !69 (340f895c6, 1f4cf5d33) with an unknown scope and two requirement IDs. They
// stay as they are by decision of the developer (no history rewrite), so only these exact
// messages pass (WORKFLOW.md "Commit messages").
const trailer = "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>";
const rewriteExceptions: string[] = [
  `test(observability): add the pipeline job rule-test for the alert rule test [OBS-AC-2.3, OBS-T-33]\n\nRefs #164\n\n${trailer}`,
  `ci(observability): run the rule test of the alert rule in the job rule-test [OBS-AC-2.3, OBS-T-33]\n\nCloses #164\n\n${trailer}`,
];

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  plugins: [plugin],
  ignores: [
    (message) =>
      beforeWorkflow.includes(message.trimEnd()) ||
      rewriteExceptions.includes(message.trimEnd()),
  ],
  rules: {
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
        "db",
        "telemetry",
        "deps",
        "ci",
        "repo",
      ],
    ],
    "header-max-length": [RuleConfigSeverity.Error, "always", 120],
    "subject-requirement-id": [RuleConfigSeverity.Error, "always"],
    "breaking-change-footer": [RuleConfigSeverity.Error, "always"],
  },
};

export default config;
