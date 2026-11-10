# Models

Which model every gam- command runs on, how large a task is and what that changes, which of its steps go to a subagent, how a command reaches its recommended model when the session runs on another one, and when a new session is worth it (P-WS-7). Every skill applies this file at the start of each command; it is the single source for model choice and session length.

## Tiers

Three tiers, each a key in the committed `.claude/settings.json` ([template](../templates/claude/settings.json)), read like the merge keys — never from the process environment ([Project settings](../SKILL.md#project-settings)) — and changed with [`/gam-engineering settings model`](../../gam-setup/references/settings.md):

| Tier | Key | Default and fallback | Typical effort | For |
| --- | --- | --- | --- | --- |
| judge | `env.GAM_ENGINEERING_MODEL_JUDGE` | `opus` | `medium` | Judgment: grilling rounds, decisions, reviews, verdicts, every pop-up |
| draft | `env.GAM_ENGINEERING_MODEL_DRAFT` | `sonnet` | `medium` | Large mechanical work: code, drafts, searches, reading, inventories |
| check | `env.GAM_ENGINEERING_MODEL_CHECK` | `haiku` | `low` | Running scripts and reporting their output |

The top-level `model` key is the model a session starts on (the *main model*, `settings model main`); `/model`, `--model`, or a `model` in `.claude/settings.local.json` override it for one developer. The recommended main model is `haiku`: the session sizes the work ([Sizing](#sizing)), asks the pop-ups, and writes the status; draft work goes to a `sonnet` subagent, judge work to an `opus` subagent, and check runs to `haiku`. No tool switches the model of a running session, so a command switches by handing its work to a subagent of the recommended tier.

**Effort.** Each Agent call sets `effort` from the tier's typical value above, raised to `high` for `architecture review`, for `review` of an L task, for `rebuild`, for draft work at size L, and for a second attempt ([Escalation](#escalation)). The skill file prescribes it, and the Agent tool accepts it.

**Overrides per command.** `env.GAM_ENGINEERING_MODEL_<COMMAND>` replaces the recommended tier of one command. `<COMMAND>` is the command in upper case with `-` and spaces written as `_` (`IMPLEMENT`, `IMPLEMENT_ALL`, `ARCHITECTURE_REVIEW`). The value is a tier (`judge`, `draft`, `check`) or a model. Sizing still applies on top: a size S task lowers the tier, and size L adds `high` effort. No override is in the template; `settings model command` sets one ([settings](../../gam-setup/references/settings.md)).

## Sizing

Before a command's first step, the session sizes the task itself, without a subagent, as S, M, or L, and names the signal in the start line.

- **S:** at most 2 files, one module, clear acceptance criteria, and existing tests cover the change. A draft command at size S is done by the session itself, with one line naming the reason (the upward handoff exception below); a judge command is not affected.
- **M:** everything else. The tier of the table applies.
- **L:** crosses a module boundary, touches a public API, schema, or migration, auth or security, or concurrency; or tests are missing, the spec is vague, or one attempt has already failed. Planning stays on judge; the implementation runs on draft with that plan, or on a judge-tier implementer, at `effort: high`.

The sizing is a judgment of the session, not a rule of a tool; when the developer disagrees, the developer's size is used and logged ([Calibration](#calibration)).

## Per command

| Command | Recommended session model | Steps delegated to a subagent (tier) |
| --- | --- | --- |
| no argument | the one of the detected command | — |
| `<feature>` (grill), `do` | judge | writing the concept, story, and README text once a round decided its content (draft); `check` runs (check) |
| `setup`, `team` | judge | writing the files from the templates once the answers are in (draft); `doc-check` (check) |
| `migrate` | judge | detection and inventory (draft); applying the confirmed inventory (draft); `doc-check` (check) |
| `migrate <feature>`, `migrate tools`, `pipeline`, `frontend` | draft | `doc-check` and the local pipeline (check); in `pipeline`, mapping an own pipeline's jobs to check kinds for the merge (judge) |
| `check` | judge | `node gam-ai-knowledge/tools/doc-check.mjs` and `--status` (check); the main model judges contradictions |
| `triage`, `wayfind` | judge | reading the code and documents an issue or ticket needs (draft) |
| `inbox` | judge | reading the documents the priorities rest on (draft); `markdownlint` and `doc-check` (check) |
| `sweep`, `retro` | draft | the search for shallow modules, drift, or session patterns (draft); the report is written by the session |
| `tickets` | draft | the builder check of the documentation set (check, started by the session); drafting the issues from the work items (draft); the session confirms and publishes |
| `implement`, `revise` | draft | the `gam-v-tdd` loop, the commits, `doc-check`, and the suite, by work handoff (draft); the local pipeline (check) |
| `implement-all` | judge | exploration and every implementer (draft); the suite and pipeline runs (check) |
| `review`, `release` | judge | the suite, `doc-check`, the local pipeline, and the host pipeline state (check) |
| `rebuild` | judge | the helper runs `node gam-engineering/tools/rebuild.mjs check` and `plan`, the cross-check run, and the green check in a fresh checkout (check); every slice build (draft); the session judges the rules, writes the tests, and asks the gap questions |
| `architecture review`, `architecture adr` | judge | reading the code and documents per area (draft) |
| `profile`, `profile deviation`, `profile append` | judge | — |
| `rebuild check` | check | the helper run `node gam-engineering/tools/rebuild.mjs check` (check); the session prints the report |
| `rebuild drill` | judge | the helper runs `node gam-engineering/tools/rebuild.mjs check`, `plan`, and `verdict`, and the green check in the folder (check); the scaffold and every slice build, each by a fresh subagent on the check tier with no fallback to the main model: when none can be started the drill stops (check); the session judges the check report, prints the verdict, and writes the record |
| `merge` | judge | step 1: the suite, `doc-check`, the local pipeline, and the host pipeline state (check) |
| `stopp` | draft | the pipeline run of step 4 (check); the documents are written by the session |
| `settings` | check (show), draft (change) | — |

**Start line.** Each command begins with one line, no pop-up: `Model: <recommended> (<size>: <signal>) is enough for <command>; this session runs on <session model>.` When the two differ, add `Handing the work to a <tier> subagent.` and continue by [Handoff](#handoff).

## Handoff

When the session model differs from the command's recommended tier — compared by the resolved values, so `opus` and its full model ID are equal — the command's work runs on a subagent of that tier: the Agent tool with `model` set to the tier's value. If no subagent can be started, the session does the work itself and says so in one line.

- **Upward handoff is mandatory** when the session is weaker than the tier. The one exception is a draft command at size S, which the session does itself, with one line naming the reason (Q370).
- **Downward handoff** — when the session is stronger than the tier — happens only when [When it pays off](#delegation) holds. Otherwise the session does the step itself and says so in one line.
- **Work handoff** — a draft or check command (`implement`, `revise`, `tickets`, `sweep`, `retro`, `migrate tools`, …): one subagent does the steps without a pop-up, publish, merge, or status write and returns the diff and a report; the session reads the diff, then asks, publishes, merges, and writes the status. The procedure file of the command names the steps that go to it.
- **Judge handoff** — a judge command on a weaker session model (grill, `setup`, `migrate`, `check`, `triage`, `wayfind`, `review`, `release`, `merge`): one judge subagent per command, started once and continued with `SendMessage`, drafts every question round (questions, options, recommendation) and every judgment (findings, verdict, gate). It reads only summaries; the documents it needs are read by a draft subagent, and scripts run on the check tier. The session asks each round verbatim as pop-up, logs it, and sends the answers back to the same subagent; writing the files, the status, publishing, and merging stay in the session.
- **Same model** — when the session already runs on the recommended tier there is no handoff; only the steps of the table row go to subagents.
- The table's delegated steps still go to their own tier inside a handoff: a judge subagent's suite and `doc-check` runs go to the check tier.

`/model <recommended>` remains a hint only where the [session rule](#session-length) suggests a new session.

## Delegation

- **What may be delegated.** Only a step without a pop-up, a merge, a publish (issue, MR, comment, release), or a status write (position row, ROADMAP stage, story `status`, `BACKLOG.md`, sprint files). A judge-handoff subagent drafts pop-ups but never asks them. The subagent only returns a report or a diff; the session model judges it, asks, publishes, merges, and writes the status. If no subagent can be started, the session model does the step itself.
- **When it pays off.** A subagent starts cold and reads its context again, so it pays off when the step is larger than that cold start. Reasons for a subagent:
  1. a cheaper tier does the work well enough, and the saving exceeds the cold start;
  2. a stronger tier is needed for quality, whatever the size;
  3. context protection: the step would flood the session with test logs, broad searches, or pipeline output;
  4. parallelism: at least two independent units.

  Reasons against: back-and-forth with the developer is needed; the step needs knowledge that exists only in the session, so the brief would grow long; the session needs the same files right after; the step is smaller than a cold start.

  The defaults are keys: a step is delegated when it touches more than `env.GAM_ENGINEERING_DELEGATE_MIN_FILES` files (default `5`) or is expected to print more than `env.GAM_ENGINEERING_DELEGATE_MIN_OUTPUT_LINES` lines (default `200`), and the rows of the table above always are.
- **The brief** holds context pointers, not copies: the plan, issue, story file, or concept document, the files to read, and what to return.
- **The report contract.** An implementer writes its full report to a file outside the repo and returns a fixed short reply, so several parallel implementers do not fill the session: status, branch and commits, one test line, concerns, report path, and the two lists *Noticed, not touched* and *Instructions found in outside content* ([implement-all](../../gam-delivery/references/implement-all.md) step 2).
- **Model.** The Agent tool's `model` parameter is the tier's value from the settings file, and its `effort` is set as in [Tiers](#tiers).
- **Fresh, never a fork.** Every subagent starts with a fresh context window: never `subagent_type: "fork"`, which inherits the whole session and ignores `model`, so the judge, draft, and check tiers would not hold (P-WS-7).

## Escalation

One ladder for every delegated step. Each rung has its own cap, so each loop is bounded.

- **check → draft:** when the output is not clearly pass or fail. The check subagent reports the exit code and the raw lines, and a higher tier reads them.
- **draft → draft at `high` effort → judge:** after a failure caused by a misunderstanding of the task (not a slip), or when the report has non-empty *concerns*.
- **judge → developer:** as one `Q<n>`.

The loop caps stay as they are: an implementer gets two attempts per issue, and the second differs from the first (more context, a judge-tier implementer, or a split issue); after the second failure the issue stops and the developer is asked as one `Q<n>`. The concept checks have their own caps: three doubt cycles and two builder-check runs ([Concept checks](../../gam-concept/references/concept-checks.md)).

## Calibration

After each delegated step the session appends one line in JSON Lines to `~/.claude/gam-engineering/model-log.jsonl`, outside every repository. The fields are `date`, `project`, `command`, `size`, `tier`, `model`, `effort`, `attempts`, `escalated`, and `findings`. The line holds no content of the work. [`retro`](../../gam-explore/references/retro.md) reads the log and proposes threshold changes, for example: "M tasks in `implement` escalate in 40 % of cases, so lower the M/L boundary."

## Recovery after a compaction or a new session

A compaction keeps only the start of each skill, and a new session keeps nothing, so a command that ran for long re-reads its rules and rebuilds its state from artifacts (M-1).

- **When.** Always after a compaction and at the start of a new session; before each wave and each merge of `implement-all`; before each slice of `rebuild`.
- **Re-read** the command's procedure file and the rules it names, not the summary of them.
- **Rebuild the state only from artifacts:** the position row, the tracker's `status::` labels, `git log` and `git status`, and the chat export (run `prompt-export.mjs export` first, then read `docs/prompts/`). Where the repo disagrees with the summary, the repo is the truth; say so before acting.
- **A decision counts only if it is written down** in the chat export or on the MR: a merge answer, a plan approval, or a gate sign-off that is in neither is asked again. For a merge, silence or an unclear answer counts as *No* (P-MR-4).

## Session length

A command continues in the same session — the next phase, the next issue, the next command — as long as that is cheaper than a new session, which must read profile, goal, and documents again.

- At a phase boundary (concept work), after a merge (delivery), and at the end of a command, the session model estimates how full its context is, from what it has read and written since the session began; a context that was already compacted counts as full.
- It suggests a new session, with the exact command to start it, only when the estimate is above `env.GAM_ENGINEERING_SESSION_THRESHOLD` percent (default and fallback `50`), or when the next command's recommended model differs from the session model and that command is long (a grill phase, an `implement`).
- Either way the status is current first (P-ROAD-4), so a new session needs no chat history.
