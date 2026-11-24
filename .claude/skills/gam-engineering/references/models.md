# Models

Which model every gam- command runs on, how large a task is and what that changes, which of its steps go to a subagent, how a command reaches its recommended model when the session runs on another one, and when a new session is worth it (P-WS-7). Every skill applies this file at the start of each command; it is the single source for model choice and session length.

## Tiers

Three tiers and a plan key, each a key in the committed `.claude/settings.json` ([template](../templates/claude/settings.json)), read like the merge keys — never from the process environment, but a developer may override them in `.claude/settings.local.json` ([Project settings](../SKILL.md#project-settings), P-TEAM-2) — and changed with [`/gam-engineering settings model`](../../gam-setup/references/settings.md):

| Tier | Key | Default and fallback | Typical effort | For |
| --- | --- | --- | --- | --- |
| judge | `env.GAM_ENGINEERING_MODEL_JUDGE` | `opus` | `medium` | Judgment: grilling rounds, decisions, reviews, verdicts, every pop-up |
| draft | `env.GAM_ENGINEERING_MODEL_DRAFT` | `sonnet` | `medium` | Large mechanical work: code, drafts, searches, reading, inventories |
| check | `env.GAM_ENGINEERING_MODEL_CHECK` | `haiku` | `low` | Running scripts and reporting their output |
| plan | `env.GAM_ENGINEERING_MODEL_PLAN` | the judge value | the judge's | The skills' own planning steps: writing a plan, drafting a grill round |

**Value form.** A value is `<model>` or `<model>:<effort>` (`opus:low`, `gpt-6.2-sol:medium`); the model is a Claude alias (`opus`, `sonnet`, `haiku`), or a full model ID of any agent; a per-command override may also name a tier. Without `:<effort>` the typical effort of the tier applies. The form holds for the tiers, the per-command overrides, and the plan key alike. The plan key is named in the start line of a command that plans (`Plan model: <value>`); where an agent has no effort lever, the `:<effort>` part is ignored and the start line says so once ([Agents](#agents)).

The top-level `model` key is the model a session starts on (the *main model*, `settings model main`); `/model`, `--model`, or a `model` in `.claude/settings.local.json` override it for one developer. The recommended main model is `haiku`: the session sizes the work ([Sizing](#sizing)), asks the pop-ups, and writes the status; draft work goes to a `sonnet` subagent, judge work to an `opus` subagent, and check runs to `haiku`. No tool switches the model of a running session, so a command switches by handing its work to a subagent of the recommended tier.

**Effort.** Each Agent call sets `effort` from the `:<effort>` of the value when it has one, else from the tier's typical value above, raised to `high` for `architecture review`, for `review` of an L task, for `rebuild`, for draft work at size L, and for a second attempt ([Escalation](#escalation)). An explicit `:<effort>` is raised by one step at size L (`low` to `medium`, `medium` to `high`, a higher one stays) instead of straight to `high`, and the second attempt is `high` (2026-11-22). The skill file prescribes it, and the Agent tool accepts it.

**Overrides per command.** `env.GAM_ENGINEERING_MODEL_<COMMAND>` replaces the recommended tier of one command. `<COMMAND>` is the command in upper case with `-` and spaces written as `_` (`IMPLEMENT`, `IMPLEMENT_ALL`, `ARCHITECTURE_REVIEW`). The value is a tier (`judge`, `draft`, `check`) or a model, with an optional `:<effort>`. For another agent the key carries its suffix, `GAM_ENGINEERING_MODEL_<COMMAND>_<AGENT>` ([Agents](#agents)). Sizing still applies on top: a size S task lowers the tier, and size L raises the effort ([Sizing](#sizing)). No override is in the template; `settings model command` sets one ([settings](../../gam-setup/references/settings.md)).

## Agents

The tiers are written for Claude Code. Another agent that reads the skills (Codex, GitHub Copilot in VS Code or the CLI, Gemini or Antigravity) gets its own keys and defaults (QA0066, QA0069):

- **Suffix.** `GAM_ENGINEERING_MODEL_<TIER>_<AGENT>` and `GAM_ENGINEERING_MODEL_<COMMAND>_<AGENT>`, and the plan key `GAM_ENGINEERING_MODEL_PLAN_<AGENT>`, with `<AGENT>` in `CODEX`, `COPILOT`, `ANTIGRAVITY`. Claude Code uses the keys without suffix. Every `GAM_ENGINEERING_MODEL_` key, with or without suffix, is personal (P-TEAM-2): a committed value is the project's default, and `.claude/settings.local.json` overrides it for one developer.
- **Alias.** A key with `GEMINI` is read as `ANTIGRAVITY`; when both exist, `ANTIGRAVITY` wins (QA0073).
- **Which agent.** Each agent knows which agent it is and reads the keys of its own suffix. `CLAUDECODE`, `COPILOT_CLI` or `COPILOT_AGENT_SESSION_ID`, and `GEMINI_CLI` are only hints; Codex has no documented variable.
- **Fallback.** Another agent whose suffixed key is missing uses its default in the table below, never the unsuffixed (Claude) key.
- **No effort lever.** Copilot in VS Code (custom agents) and Gemini or Antigravity have none: the `:<effort>` part is ignored and the start line says so once (QA0074). The Copilot CLI passes it as `--reasoning-effort`.
- **Plan key.** `GAM_ENGINEERING_MODEL_PLAN[_<AGENT>]` is the model of the skills' own planning steps. Its default is the judge value of that agent. The agent's own plan mode has its own lever, which the skills never write ([settings](../../gam-setup/references/settings.md): `settings model plan` shows it): `opusplan` in Claude Code, `plan_mode_reasoning_effort` in Codex, `planModel` in the Copilot CLI, `chat.planAgent.defaultModel` in VS Code (ends February 2027).

Defaults per agent, dated 2026-11-22. A model id marked *unverified* was not checked against the vendor's model list; check it before relying on it.

| Tier | Claude Code | Codex | Copilot | Antigravity |
| --- | --- | --- | --- | --- |
| judge | `opus:medium` | `gpt-6.2-sol:medium` (unverified) | `claude-opus-5-5:medium` | `gemini-3-pro` (unverified, no effort) |
| draft | `sonnet:medium` | `gpt-6.2-sol:low` (unverified) | `claude-sonnet-5-5:medium` | `gemini-3-flash` (unverified, no effort) |
| check | `haiku:low` | `gpt-6.2-mini:low` (unverified) | `claude-haiku-5-5:low` | `gemini-3-flash` (unverified, no effort) |
| plan | the judge value | the judge value | the judge value | the judge value |
| implementer | `opus:low` | the draft value | `claude-opus-5-5:low` | the draft value |

## Implementer

The implementer of `implement`, `revise`, and `implement-all` runs on `opus:low` by default on Claude Code and Copilot (QA0071, 2026-11-22; Copilot in VS Code drops the effort, see [Agents](#agents)). Codex and Antigravity keep their draft value until a measurement exists. Reason, measured by Anthropic on a SWE-bench Pro subset: Opus `low` solves as much as Sonnet `high` at about the same cost per solved task, and Sonnet `medium` solves about 7 points fewer; Opus `low` with failed tasks re-run at `high` reaches about 97 % at about 60 % of the cost of everything at `high` ([pricing](https://platform.claude.com/docs/en/about-claude/pricing), [cost and intelligence](https://platform.claude.com/docs/en/about-claude/models/optimizing-for-cost-and-intelligence)).

- **Retry.** The failure signal is a red test after the first attempt (`gam-v-tdd` gives one), whatever its cause; the second attempt runs the same model at `high` ([Escalation](#escalation)). There is no third attempt: after it, the issue stops and the developer is asked.
- **Rest stays.** Other draft work (drafts, searches, reading) stays on the draft tier; `review` stays on judge, because Opus `low` finds far fewer defects than at `medium`.
- **Changing it.** For `implement` and `revise`, the per-command key `GAM_ENGINEERING_MODEL_IMPLEMENT` or `_REVISE` is the implementer value; the implementers of `implement-all` use the `_IMPLEMENT` value, since `_IMPLEMENT_ALL` sets that command's session tier. `settings model command` writes them.

## Sizing

Before a command's first step, the session sizes the task itself, without a subagent, as S, M, or L, and names the signal in the start line.

- **S:** at most 2 files, one module, clear acceptance criteria, and existing tests cover the change. A draft command at size S is done by the session itself, with one line naming the reason (the upward handoff exception below); a judge command is not affected.
- **M:** everything else. The tier of the table applies.
- **L:** crosses a module boundary, touches a public API, schema, or migration, auth or security, or concurrency; or tests are missing, the spec is vague, or one attempt has already failed. Planning stays on judge; the implementation runs on the [implementer value](#implementer) (other draft work on draft) with that plan, its effort raised as [Tiers](#tiers) says (`opus:low` runs at `medium`); a second attempt always runs at `high`.

The sizing is a judgment of the session, not a rule of a tool; when the developer disagrees, the developer's size is used and logged ([Calibration](#calibration)).

## Per command

| Command | Recommended session model | Steps delegated to a subagent (tier) |
| --- | --- | --- |
| no argument | the one of the detected command | — |
| `<feature>` (grill), `do` | judge | writing the concept, story, and README text once a round decided its content (draft); `check` runs (check) |
| `setup`, `team` | judge | writing the files from the templates once the answers are in (draft); `doc-check` (check) |
| `migrate` | judge | detection and inventory (draft); applying the confirmed inventory (draft); `doc-check` (check) |
| `migrate <feature>`, `migrate tools`, `pipeline`, `frontend` | draft | `doc-check` and the local pipeline (check); in `pipeline`, mapping an own pipeline's jobs to check kinds for the merge (judge) |
| `ui` | draft | building through the owning skill (draft); in `review`, the judgment of the findings stays in the session; called from `implement` or `review`, it runs inside that command's row |
| `check` | judge | `node gam-ai-knowledge/tools/doc-check.mjs` and `--status` (check); the main model judges contradictions |
| `triage`, `wayfind` | judge | reading the code and documents an issue or ticket needs (draft) |
| `inbox` | judge | reading the documents the priorities rest on (draft); `markdownlint` and `doc-check` (check) |
| `sweep`, `retro` | draft | the search for shallow modules, drift, or session patterns (draft); in `sweep`, the run of `node gam-engineering/tools/parallel-check.mjs` (check); the report is written by the session |
| `tickets` | draft | the builder check of the documentation set (check, started by the session); drafting the issues from the work items (draft); the session confirms and publishes |
| `implement`, `revise` | the [implementer value](#implementer) | the `gam-v-tdd` loop, the commits, `doc-check`, and the suite, by work handoff on the implementer value (`opus:low` by default, [Implementer](#implementer)); the local pipeline (check) |
| `implement-all` | judge | exploration (draft); every implementer on the implementer value (`opus:low` by default, [Implementer](#implementer)); the suite and pipeline runs (check) |
| `review`, `release` | judge | the suite, `doc-check`, the local pipeline, and the host pipeline state (check) |
| `rebuild` | judge | the helper runs `node gam-engineering/tools/rebuild.mjs check` and `plan`, the cross-check run, and the green check in a fresh checkout (check); every slice build (draft); the session judges the rules, writes the tests, and asks the gap questions |
| `architecture review`, `architecture adr` | judge | reading the code and documents per area (draft); in `architecture review`, the run of `node gam-engineering/tools/parallel-check.mjs` for the area *Parallel work* (check) |
| `profile`, `profile deviation`, `profile append` | judge | — |
| `rebuild check` | check | the helper run `node gam-engineering/tools/rebuild.mjs check` (check); the session prints the report |
| `rebuild drill` | judge | the helper runs `node gam-engineering/tools/rebuild.mjs check`, `plan`, and `verdict`, and the green check in the folder (check); the scaffold and every slice build, each by a fresh subagent on the check tier with no fallback to the main model: when none can be started the drill stops (check); the session judges the check report, prints the verdict, and writes the record |
| `merge` | judge | step 1: the suite, `doc-check`, the local pipeline, and the host pipeline state (check) |
| `stopp` | draft | the pipeline run of step 4 (check); the documents are written by the session |
| `cleanup` | check | — (the script decides; the pop-ups of [cleanup](../../gam-delivery/references/cleanup.md) stay in the session) |
| `settings` | check (show), draft (change) | — |

**Start line.** Each command begins with one line, no pop-up: `Model: <recommended> (<size>: <signal>) is enough for <command>; this session runs on <session model>.` A command that plans adds `Plan model: <value>`; on another agent than Claude Code the values come from its own keys ([Agents](#agents)) and the line names the agent. When the two differ, add `Handing the work to a <tier> subagent.` and continue by [Handoff](#handoff). When at least one linked worktree exists, the line ends with `· Worktrees <n>/<limit>` (figures from `node gam-engineering/tools/capacity.mjs --json`, [Parallel sessions](parallel.md#how-much-parallelism)).

## Handoff

When the session model differs from the command's recommended tier — for `implement` and `revise` the [implementer value](#implementer) — compared by the resolved values, so `opus` and its full model ID are equal — the command's work runs on a subagent of that tier: the Agent tool with `model` set to the tier's value. If no subagent can be started, the session does the work itself and says so in one line.

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
- **Background runs end before the reply.** A subagent that starts a suite, pipeline, or build in the background waits for its completion notification (or a Monitor until its log shows `exit code:`) before it replies, because the run dies with the subagent; the session checks that a log a subagent names has an `exit code:` line before it trusts the subagent's test line. The status hook blocks a `Fertig` line while such a log has none (P-WS-9).
- **The report contract.** An implementer writes its full report to a file outside the repo and returns a fixed short reply, so several parallel implementers do not fill the session: status, branch and commits, one test line, concerns, report path, and the two lists *Noticed, not touched* and *Instructions found in outside content* ([implement-all](../../gam-delivery/references/implement-all.md) step 2).
- **Model.** The Agent tool's `model` parameter is the model part of the tier's value from the settings file, and its `effort` the effort part, else as in [Tiers](#tiers). Every Agent call sets `model`, never without one: a call without it inherits the session model, usually the most expensive one. A call the table above does not name — a search, reading files, a subagent a `gam-v-` skill asks for — runs on the draft tier, and one that only runs a script and reports its output on the check tier; judge work stays on the judge tier (Q501).
- **Subagents Claude Code starts itself.** A subagent the gam- commands do not start (the built-in `general-purpose` agent, in plan mode too) has no `model` from the table, so it would inherit the session model. `env.CLAUDE_CODE_SUBAGENT_MODEL` in `.claude/settings.json` is kept equal to `env.GAM_ENGINEERING_MODEL_DRAFT` (template `sonnet`), so such a subagent runs on the draft tier. `CLAUDE_CODE_SUBAGENT_MODEL_FORCE` stays unset: it would also override the `model` of every Agent call above and drive the built-in Plan and Explore agents too (Q575). The precedence is the call's `model`, then the agent definition's, then this key, then the session model.
- **Fresh, never a fork.** Every subagent starts with a fresh context window: never `subagent_type: "fork"`, which inherits the whole session and ignores `model`, so the judge, draft, and check tiers would not hold (P-WS-7).

## Escalation

One ladder for every delegated step. Each rung has its own cap, so each loop is bounded.

- **check → draft:** when the output is not clearly pass or fail. The check subagent reports the exit code and the raw lines, and a higher tier reads them.
- **draft → draft at `high` effort → judge:** after a failure caused by a misunderstanding of the task (not a slip), or when the report has non-empty *concerns*.
- **implementer → implementer at `high`:** after any red test of the first attempt ([Implementer](#implementer)); it already runs on the judge model, so the next rung is the developer.
- **judge → developer:** as one `Q<n>`.

The loop caps stay as they are: an implementer gets two attempts per issue, and the second differs from the first (more context, the implementer at `high`, or a split issue); after the second failure the issue stops and the developer is asked as one `Q<n>`. The concept checks have their own caps: three doubt cycles and two builder-check runs ([Concept checks](../../gam-concept/references/concept-checks.md)).

## Calibration

After each delegated step the session appends one line in JSON Lines to `~/.claude/gam-engineering/model-log.jsonl`, outside every repository. The fields are `date`, `project`, `command`, `size`, `tier`, `model`, `effort`, `attempts`, `escalated`, `findings`, and `agent` (`claude`, `codex`, `copilot`, `antigravity`). The line holds no content of the work. [`retro`](../../gam-explore/references/retro.md) reads the log and proposes threshold changes, for example: "M tasks in `implement` escalate in 40 % of cases, so lower the M/L boundary."

## Recovery after a compaction or a new session

A compaction keeps only the start of each skill, and a new session keeps nothing, so a command that ran for long re-reads its rules and rebuilds its state from artifacts (M-1).

- **When.** Always after a compaction and at the start of a new session; before each wave and each merge of `implement-all`; before each slice of `rebuild`.
- **Re-read** the command's procedure file and the rules it names, not the summary of them.
- **Rebuild the state only from artifacts:** on a work branch, its branch memory file `gam-ai-memory/branches/<branch-slug>.md` first ([Parallel sessions](parallel.md)), then the position row, the tracker's `status::` labels, `git log` and `git status`, and the chat export (run `prompt-export.mjs export` first, then read `docs/prompts/`); for a session that ended without a handover, also run `node gam-engineering/tools/session-recover.mjs` and read its report, which holds the subagents and the open last step that the export lacks. Where the repo disagrees with the summary, the repo is the truth; say so before acting.
- **A decision counts only if it is written down** in the chat export or on the MR: a merge answer, a plan approval, or a gate sign-off that is in neither is asked again. For a merge, silence or an unclear answer counts as *No* (P-MR-4).

## Session length

A command continues in the same session — the next phase, the next issue, the next command — as long as that is cheaper than a new session, which must read profile, goal, and documents again.

- At a phase boundary (concept work), after a merge (delivery), and at the end of a command, the session model estimates how full its context is, from what it has read and written since the session began; a context that was already compacted counts as full.
- It suggests a new session, with the exact command to start it, only when the estimate is above `env.GAM_ENGINEERING_SESSION_THRESHOLD` percent (default and fallback `50`), or when the next command's recommended model differs from the session model and that command is long (a grill phase, an `implement`).
- **Task switch.** At the end of a command, when the next command belongs to another task (another plan, feature, or inbox entry), the session suggests `/clear` whatever the estimate says, in one line before the run status, with the exact command to start the next task: the old task's context would be paid again on every turn of the new one. The next command of the same task continues in the session as above (Q502).
- **Session age.** The hook `limit-guard.mjs` says once when the session has run longer than `env.GAM_ENGINEERING_SESSION_MAX_HOURS` hours (default `4`, `0` turns it off): the session finishes the current step, then saves with [`stopp`](../../gam-delivery/references/stopp.md) and continues in a new session (P-WS-12, Q503).
- **Compact before a pause.** The hook `compact-hint.mjs` (Stop) tells the developer to run `/compact` once the context use reaches `env.GAM_ENGINEERING_SESSION_THRESHOLD` percent (default `50`) and again at every further 10-point step; after a compaction (context below the last step) it starts over. `limit-statusline.mjs` hands it the percentage. After a pause longer than the cache lifetime (1 hour on a subscription, else 5 minutes) the next turn pays for the whole context uncached, and `/compact` is cheapest while the cache is warm, so the hint says to compact before stepping away. It never blocks, and `env.GAM_ENGINEERING_LIMIT_GUARD` `off` silences it (P-WS-12, Q576, Q578, Q579).
- **Skills in the listing.** Every installed skill's description goes into every request. The SessionStart hook `skill-trim.mjs` sets `user-invocable-only` in the git-ignored `.claude/settings.local.json` for every skill of `~/.claude/skills/` the project does not need (hidden from Claude, still in the `/` menu): needed are every `gam-*`, the skills named in `STACK.md` §10, the project's `.claude/skills/`, and `env.GAM_ENGINEERING_SKILLS_KEEP` (comma list). It adds missing names and never changes another entry, except that a skill needed again later (newly in §10 or the keep list) loses its `user-invocable-only` entry; `env.GAM_ENGINEERING_SKILL_TRIM` `off` stops it. Enabled plugins are not trimmed; the hook names them once with their skill count and recommends `/plugin` and `/skill-doctor` (P-WS-7, Q573, Q574, Q577, Q580).
- In each case the status is current first (P-ROAD-4), so a new session needs no chat history.
