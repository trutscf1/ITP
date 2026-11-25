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

// One commit that reached feature/78-headless-cms through !77 before its review was resolved
// (e48fa5739, the scope `observability` is not in the list below). It is not rewritten, by
// decision of the developer (WORKFLOW.md "Commit messages").
const mergedBeforeReview: string[] = [
  "test(observability): prove the start entry and heartbeat of cms in the started stack [OBS-AC-1.1] [OBS-T-1]",
];

// Two commits of !69 (340f895c6, 1f4cf5d33) with an unknown scope and two requirement IDs. They
// stay as they are by decision of the developer (no history rewrite), so only these exact
// messages pass (WORKFLOW.md "Commit messages").
const trailer = "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>";
const rewriteExceptions: string[] = [
  `test(observability): add the pipeline job rule-test for the alert rule test [OBS-AC-2.3, OBS-T-33]\n\nRefs #164\n\n${trailer}`,
  `ci(observability): run the rule test of the alert rule in the job rule-test [OBS-AC-2.3, OBS-T-33]\n\nCloses #164\n\n${trailer}`,
];

// Three commits of !74 whose header is 125 to 131 characters long (limit 120). They are pushed and
// stay as they are (no history rewrite), so only these exact messages pass; later headers are checked.
const longHeaders: string[] = [
  "fix(cms): update postcss, zod and webpack-dev-middleware of the cms unit to patched releases [SCF-AC-5.2] [SCF-AC-5.3] [PUB-AC-1.1]\n\nThe dependency audit and the container scan failed on postcss 8.4.49, zod 4.4.3 and 3.25.76,\nand webpack-dev-middleware 7.4.5. Overrides move postcss and zod to the patched lines; the\ntrust exception of webpack-dev-middleware 7.4.6 replaces the downgrade override.\n\nCo-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>",
  "test(cms): prove /cms/health, the seed, the log stream and the heartbeat value in the started stack [PUB-AC-1.1] [OBS-AC-1.1]\n\nThe log check parses the Loki answer and needs a stream, the heartbeat check needs the value 1\nand asks for unit_running_ratio, the name Prometheus stores. New stack test PUB-T-1 asks the\nproxy for /cms/health and counts the seeded rows of the six content types.\n\nCo-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>",
  "test(cms): prove the unclaimed administrator in the report of the started stack and record the runs [PUB-AC-1.7] [PUB-AC-1.1]\n\nCo-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>",
];

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  plugins: [plugin],
  ignores: [
    (message) =>
      [
        ...beforeWorkflow,
        ...mergedBeforeReview,
        ...rewriteExceptions,
        ...longHeaders,
      ].includes(message.trimEnd()),
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
