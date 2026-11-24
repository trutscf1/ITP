# Project settings and built-in procedures

Linked from the sections *Project settings* and *Built-in procedures* of [the core](../SKILL.md); moved here so the core stays within the size the compaction keeps (M-2).

## Project settings

The merge rules are P-MR-4 (merge policy and approvals), P-MR-5 (release merge), and P-MR-6 (merge guard); this section only says how to read them, and `gam-delivery` how to apply them. Read the committed `.claude/settings.json` itself ([template](../templates/claude/settings.json)) — never the process environment, which may hold personal values. Only the personal keys of P-TEAM-2 may come from the git-ignored `.claude/settings.local.json`, which overrides them for one developer; `node gam-engineering/tools/project-settings.mjs show` lists both layers. Apply the fallbacks and team-mode rules of those IDs to get the effective values. **Footprint `minimal`** (`env.GAM_ENGINEERING_FOOTPRINT`, read on disk by `node gam-engineering/tools/footprint.mjs show`): `.claude/settings.json` is git-ignored, so the file on disk is the project's settings and takes the place of the committed one everywhere this skill says "committed" (P-MR-4, added 2026-11-21); a change to it is an edit on disk, with no MR. **Transition (P-DOC-10, P-DOC-11).** A project not yet renamed or moved still has former key prefixes and former paths: read them as [Former names and paths](former-names.md) says, and offer `/gam-engineering migrate` once per session. Changing a value is a normal MR on that file, made with [`/gam-engineering settings`](../../gam-setup/references/settings.md); `WORKFLOW.md` names the keys but never copies their values.

## First step

Rule 2 of [Before anything else](../SKILL.md#before-anything-else): when the project's `CLAUDE.md` does not yet say that every session starts with `/gam-engineering` (or the former `/humanengineering`, P-DOC-10), ask once, as a pop-up, whether to write that into the project's CLAUDE.md. Options: **In CLAUDE.md** (committed; recommended), **In CLAUDE.local.md** (personal; must be in `.gitignore`, P-TEAM-2), **No** (change nothing; do not ask again this session). If yes, add one line next to the existing routing rule, or create the file from [templates/CLAUDE.md](../templates/CLAUDE.md): `Every grilling, planning, concept, or delivery session starts with /gam-engineering (P-GRILL-5, P-WS-6).` A `CLAUDE.md` edit ships like any other change (P-GIT-2).

## Built-in procedures

The generic skills `/to-tickets`, `/implement`, `/implement-spec`, `/setup-matt-pocock-skills`, `/triage`, `/wayfinder`, `/improve-codebase-architecture`, and `/retro` cannot be invoked by the model (`disable-model-invocation`). Their procedures are therefore built into the gam- skills, already adapted to the profile, as `references/` files of the skill that owns the command; a command loads only its own file. Only model-invocable skills are called with the Skill tool: `gam-v-grilling`, `gam-v-domain-modeling`, `gam-v-codebase-design`, `gam-v-tdd`, `gam-v-code-review`, `gam-v-verification-before-completion`, `gam-v-receiving-code-review`, `gam-v-pre-release-review`, `gam-v-privacy-by-design`, `gam-v-doubt-driven-development`, `gam-v-pr`, `gam-v-research`, `gam-v-prototype`, `gam-v-diagnosing-bugs`, `gam-v-wizard`, `gam-ai-memory`, and, for maintaining the skills themselves, `gam-v-writing-for-agents` and `gam-v-skill-check`. `implement` and `review` also call the technology skills the project's `STACK.md` §10 binds (P-DES-7). Where they differ from this profile, the overrides in [gam-delivery](../../gam-delivery/SKILL.md#overrides-for-the-delivery-skills) and the other gam- skills take precedence.

## Question tools

The pop-up of [Asking the developer](../SKILL.md#asking-the-developer) rule 1 (P-GRILL-1) is shown by the question tool of the agent that runs the session:

| Agent | Question tool |
| --- | --- |
| Claude Code | `AskUserQuestion` |
| GitHub Copilot in VS Code (agent mode) | `askQuestions` (`#vscode/askQuestions`, the question carousel); enabled in the tool picker |
| GitHub Copilot CLI | `ask_user` (off under `--no-ask-user` or `askUser: false`) |
| T3 Code, Orca, and other tools that drive an agent | the tool of the agent they drive (Claude Code in T3 Code: `AskUserQuestion`, measured 2026-11-19, QA0023); in T3 Code, text the question refers to goes out first through `send_to_user`, and each option description stays one line, since a long pop-up can hide T3's *Submit* button ([Parallel sessions: T3 Code](parallel.md#t3-code)) |
| Any other agent | its own tool that asks the person with options |

**Without a question tool** (Copilot in Ask or Edit mode, the tool switched off), the question goes into the chat in the same format: `Q<n> - <title>: <question>?`, numbered options with the recommendation first and *None of these* last, and one line naming the tool that would show it as a pop-up. The agent waits for the answer, logs question and answer verbatim in `docs/prompts/<handle>/manual/<date>.md` ([Recording](#recording)), and carries on; it never stops work only because the pop-up is missing.

## Recording

The detail of rule 4 of [Asking the developer](../SKILL.md#asking-the-developer) (QC0011). The AI chat export is the record of every round, answers verbatim (P-GRILL-2, P-TEAM-6): the hook writes the session with its pop-ups to `docs/prompts/`; no Q&A file is written. Numbers come from `node gam-engineering/tools/prompt-export.mjs next-q`: the checkout's letter and four digits, one counter per letter, e.g. `QA0012` in the main folder and `QB0007` in a linked worktree (P-GRILL-2); `Q<n>` in these files means that number. An interaction a tool's export misses (README, *AI chat export*) goes verbatim to `docs/prompts/<handle>/manual/<date>.md`; so does every question asked in the chat under rule 1 of that list, with its answer.

## Recommendation basis

The recommended option of a pop-up ([Asking the developer](../SKILL.md#asking-the-developer) rule 2, P-GRILL-1) is chosen in about four of five answers, so it acts as an anchor; the developer sees what it rests on. The description of the recommended option starts with its basis, one of three kinds:

| Kind | Label at the start of the description |
| --- | --- |
| A rule or a project value | `Regel P-…`, `Projektwert …` |
| A measured fact: a script output or a count | `Gemessen: …` |
| The agent's judgment, with the trade-off named | `Einschätzung: …` |

A question of pure taste still carries a recommendation, with the basis `Einschätzung: …` (QB0004, QB0005). A pop-up in another language uses the same labels in that language.
