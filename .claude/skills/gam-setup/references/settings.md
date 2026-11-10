# Settings

Loaded by `/gam-engineering settings [ask | auto | <key> <value>]` (skill `gam-setup`). It shows or changes the project's merge and model settings in `.claude/settings.json`, keeping the safeguards in step. It runs only when the developer invokes it — an agent never loosens a setting on its own initiative.

| Invocation | Effect |
| --- | --- |
| `settings` | Show the branch model (P-GIT-9), the effective values (after the team-mode and fallback rules of P-MR-4 and P-MR-5), the main model, the three tiers, and the session threshold ([Models](../../gam-engineering/references/models.md)), whether the merge guard and the status hook are present, the flow (`quick` or `full`), the plans folder (`plansDirectory`, P-DOC-7), whether commits and MRs credit the AI (`attribution`, P-GIT-8), and any instruction in `~/.claude/CLAUDE.md` that would override them. Changes nothing. |
| `settings auto` | Preset *fully automatic* (solo mode only): `GAM_ENGINEERING_MERGE=auto`, `GAM_ENGINEERING_RELEASE_MERGE=auto`, merge guard removed; approval count and status hook unchanged. In team mode it refuses and offers `merge approved` instead. |
| `settings ask` | Preset *safe default*: `GAM_ENGINEERING_MERGE=ask`, `GAM_ENGINEERING_RELEASE_MERGE=ask`, merge guard restored. |
| `settings merge <ask \| approved \| auto>` | Set the merge policy; the merge guard is added for `ask` and removed otherwise. |
| `settings approvals <n>` | Set the approval count for `approved` (positive integer). |
| `settings branches <dev \| trunk>` | Switch the branch model (P-GIT-9): branches, MR targets, merge guard, and ROADMAP stage as [references/branches.md](../../gam-engineering/references/branches.md) says. Without git it refuses. |
| `settings release <ask \| auto>` | Set the release merge (P-MR-5). `auto` is refused in team mode, like `settings auto`. If the merge policy stays `ask`, say that the merge guard will still prompt at the release merge (P-MR-6). |
| `settings hook <on \| off>` | Add or remove the status hook (`hooks.Stop` and `gam-engineering/tools/status-reminder.mjs`). |
| `settings coauthor <on \| off>` | Whether commits and MRs credit the AI (P-GIT-8). `off` sets `attribution` to `{ "commit": "", "pr": "" }`; `on` removes the key, so Claude Code adds its `Co-Authored-By` trailer and *Generated with Claude Code* line. |
| `settings flow <full \| quick>` | Set `env.GAM_ENGINEERING_FLOW` (P-FLOW-1, [Quick mode](../../gam-engineering/references/quick.md)). `quick` is the plan flow with the slim pipeline (P-PIPE-3); the confirmation names what is no longer asked or run (concept, stories, issues, every check but the short test). `full` restores the standard flow. |
| `settings plans <on \| off>` | Add `plansDirectory: "./gam-ai-memory/plans"` or remove the key (P-DOC-7). `off` is a deviation from P-DOC-7 and is recorded as one (contract point 4). |
| `settings model <main \| judge \| draft \| check> <model>` | Set the main model a session starts on (top-level `model`) or a tier (`env.GAM_ENGINEERING_MODEL_JUDGE`, `env.GAM_ENGINEERING_MODEL_DRAFT`, `env.GAM_ENGINEERING_MODEL_CHECK`), see [Models](../../gam-engineering/references/models.md). `<model>` is `opus`, `sonnet`, `haiku`, or a full model ID; anything else is refused. `default` removes the key, so the main model falls back to each developer's own choice and a tier to its default. Setting `main` or `judge` below `opus` names the commands that recommend the judge tier (grill, setup, migrate, check, review, release, merge). The confirmation says that `/model` in a session still overrides `main` for that developer, and that judge commands then run by judge handoff ([Models: Handoff](../../gam-engineering/references/models.md#handoff)). |
| `settings delegate <files \| output> <n>` | Set `env.GAM_ENGINEERING_DELEGATE_MIN_FILES` (default `5`) or `env.GAM_ENGINEERING_DELEGATE_MIN_OUTPUT_LINES` (default `200`), the sizes above which a step goes to a subagent ([Models: Delegation](../../gam-engineering/references/models.md#delegation)); a positive integer, `default` removes the key. |
| `settings model command <command> <tier \| model \| default>` | Set `env.GAM_ENGINEERING_MODEL_<COMMAND>`, a tier (`judge`, `draft`, `check`) or a model that replaces the recommended tier of one command (`<command>` in upper case, `-` and spaces as `_`, e.g. `IMPLEMENT`); `default` removes the key ([Models: Tiers](../../gam-engineering/references/models.md#tiers)). |
| `settings logs <n>` | Set `env.GAM_ENGINEERING_LOG_KEEP`, the number of script logs kept in `claude-script-logs/` of the temp folder before the oldest are deleted (P-WS-11); a positive integer, `default` removes the key (30). |
| `settings kind <student \| other>` | Set `env.GAM_ENGINEERING_PROJECT_KIND`, which decides the recommended chat export (P-TEAM-6). |
| `settings prompts <commit \| local>` | Set `env.GAM_ENGINEERING_PROMPT_EXPORT` (P-TEAM-6). Both copy `prompt-export.mjs` when missing and run its `install-hook`; `local` adds `/docs/prompts/` to `.gitignore` and removes the custom check `check-growth` from `pipeline.json`, `commit` records it. Already committed exports stay. `off` is refused: the export is the record of the question rounds (P-GRILL-2); a project that cannot use it records a deviation (`profile deviation P-TEAM-6`). |
| `settings session <percent>` | Set `env.GAM_ENGINEERING_SESSION_THRESHOLD`, the context fill above which a new session is suggested ([Models: Session length](../../gam-engineering/references/models.md#session-length)); an integer from 10 to 90, `default` removes the key (50). |

Steps for every change:

1. Show the change as *key — old → new*, including the safeguards it adds or removes, and confirm it with an `AskUserQuestion` pop-up (*Apply* / *Cancel*); a loosening change (towards `approved` or `auto`, guard or hook removed) also names what will no longer be asked.
2. Edit `.claude/settings.json` without touching any other key, and `WORKFLOW.md` only if a pointer to the changed keys is missing — it never holds the values.
3. Ship it like any change: on the current work branch, or on a new `chore/settings-<slug>` branch from `dev` with an MR (P-GIT-2). The MR merges under the policy currently on `dev`, not the new one. Without git the edit is the whole change, and the merge keys have no effect until the folder is a git repository (P-GIT-7).
4. Add a log entry in `ROADMAP-DETAILS.md` (P-ROAD-2).

## Safeguards

The settings template carries two technical safeguards; this table is their single description, and the README links here:

| Safeguard | What it does | When it is present |
| --- | --- | --- |
| Merge guard (`permissions.ask`, P-MR-6) | Six rules — `git merge`, `glab mr merge`, `gh pr merge`, each for Bash and PowerShell — make Claude Code itself prompt before a merge command, as a backstop if an agent skips the pop-up | Only under merge policy `ask` |
| Status hook (`hooks.Stop`) | Runs `gam-engineering/tools/status-reminder.mjs` ([template](../../gam-engineering/templates/gam-engineering/tools/status-reminder.mjs)) with Node at the end of each turn. It passes when the newest merge on the integration branch (`dev` or `origin/dev`; `main` or `origin/main` in branch model `trunk`) touched `ROADMAP-DETAILS.md` or a `STATUS.md`, when a later commit on that branch or on `HEAD` did, or when one of them is modified in the working tree, or when every commit the merge brought in ends in `[no-req]` (a pure chore); otherwise it blocks the stop once and asks for the P-ROAD-4 update. If `gam-ai-knowledge/` is outside git, it compares the file time with the merge time | Always. Needs Node; the second stop always passes |

Open-work hook (`hooks.Stop`, P-GIT-11): runs `gam-engineering/tools/open-work-reminder.mjs` ([template](../../gam-engineering/templates/gam-engineering/tools/open-work-reminder.mjs)) at the end of each turn. It blocks the stop once per state when the working tree has changes, commits are not pushed, or a work branch is not merged into the integration branch (not under merge policy `auto`, which merges without a pop-up), and asks the agent to check what else is open and to ask with a pop-up; `settings hook off` removes it together with the status hook.

Under `ask`, the merge guard prompts in addition to the P-MR-4 pop-up; the pop-up is the decision and the permission prompt only confirms it.
