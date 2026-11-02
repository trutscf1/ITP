# engineering-human

A Claude Code skill that carries one developer's standing engineering decisions from project to project and runs the documentation-first workflow built on them: goal first, concept documents readable by humans and AI, user stories and acceptance criteria in a work-item tree mirrored by parent and child issues, MRs with a binding Definition of Done, and status that is current the moment work reaches `dev`.

This README is the user-facing view of the skill: how it works, every setting you can change, the commands, and open suggestions. It adds no rule of its own — the rules live in [SKILL.md](SKILL.md) and [PROFILE.md](PROFILE.md), cited here by ID.

## How it works

### The idea

Grilling sessions keep re-asking questions that were answered in earlier projects: which git flow, how releases are versioned, where the roadmap lives. [PROFILE.md](PROFILE.md) records those answers once, each with a stable ID (`P-GIT-1`, `P-MR-4`, …). Every session reads the profile first, states the decisions it applies by ID, and asks only what is new about this project (contract points 1–3 in SKILL.md). Every question comes as a numbered pop-up with the recommendation first, never as a chat question (P-GRILL-1); at the start of a session the skill offers once to write "every session starts with `/engineering-human`" into the project's `CLAUDE.md` or `CLAUDE.local.md` (SKILL.md, *Before anything else*).

Four principles shape everything the skill produces:

1. **Goal first** — every project starts with one goal of at most 200 characters in `documentation/GOAL.md`; everything else derives from it and must not contradict it (P-GOAL).
2. **Readable by humans and AI** — stories, acceptance criteria, and requirements are written once in a form both can read; machine-only content gets a plain-language summary (P-HUM).
3. **Traceable workflow** — user stories and acceptance criteria live in a work-item tree in `documentation/work-items/` (feature → story → slice, P-DOC-6), mirrored one to one by parent and child issues — on GitLab Premium/Ultimate, which the skill detects itself, as a group epic with native child items (P-TRK-4); every story is an issue, every change an MR checked against the acceptance criteria and the Definition of Done, merged as the project's merge policy allows (P-TRK, P-MR).
4. **Solo or team** — in a team, the skill is vendored into the repo and per-person documents are split per developer (P-TEAM).

### The derivation chain

Every item names its parent, top-down: project goal → roadmap feature → feature goal → feature work item → user story → acceptance criterion → requirement → module → test (P-GOAL-2). `/engineering-human check` walks this chain and reports orphans, contradictions, coverage gaps, and stale status. Its mechanical part is a script, `tools/doc-check.mjs`, that checks every document against the manifest's *Machine-Readable Contract* (frontmatter, ID grammar, table schemas); with `--status` it also compares the ROADMAP stages and position rows with the merges and release tags in git. The CI job runs it with `--status` and the markdown lint on every MR.

### The phases

A feature moves through the phases of the concept authoring manifest ([templates/concept_authoring_manifest.md](templates/concept_authoring_manifest.md)):

| Phase | What happens | Command |
| --- | --- | --- |
| 0 | Repo setup: goal, mode, git host, merge policy and safeguards, process documents, stack document | `/engineering-human setup` |
| 1–3 | Grill the feature, resolve questions, check interactions with existing artifacts | `/engineering-human <feature>` |
| 4 | Product-manager review gate | — (a person signs off) |
| 5–6 | Architecture, vertical slices, test concept | `/engineering-human <feature>` |
| 7 | Tickets, implementation, review, answering review threads, merge | `tickets`, `implement`, `review`, `revise`, `merge` |
| — | Release `dev` → `main` | `release` |
| 8 | Architectural rescue and drift sweep | `sweep`, `check` |
| — | Raw incoming issues; efforts too foggy for one session | `triage`, `wayfind` |

The delivery commands call the generic skills `/tdd`, `/code-review`, `/verification-before-completion` (proof of every acceptance criterion before "done"), `/receiving-code-review` (`revise`), and `/pre-release-review` (`release`), and add the profile's obligations: issue format, requirement IDs in commits, MR template, Definition of Done, merge policy, and status update (P-WS-6). The grill flow calls `/privacy-by-design` when a feature handles personal data, and offers `/doubt-driven-development` as an adversarial check before the Phase 4 gate. The procedures of `/to-tickets`, `/implement`, `/setup-matt-pocock-skills`, `/triage`, `/wayfinder`, and `/improve-codebase-architecture` are built in under [references/](references/), because the model cannot invoke those skills.

### What a project gets

| File | Job |
| --- | --- |
| `documentation/GOAL.md` | The project goal `G-1`, target users, success signals, non-goals |
| `documentation/MANIFEST.md` | The project's copy of the concept authoring manifest |
| `documentation/WORKFLOW.md` | Project values: mode, labels, sprints, Definition of Done, releases |
| `documentation/ROADMAP.md` | Ordered backlog with the lifecycle stage of each feature |
| `documentation/ROADMAP-DETAILS.md` | Where work stands right now, plus the log of processed tasks |
| `documentation/next.md` | Inbox for new tasks (per developer in team mode) |
| `documentation/VERSIONING.md` | Project-specific versioning rules |
| `documentation/STACK.md` | The only place technology is named: languages, capability mapping, commands |
| `documentation/concepts/<feature>.md` | One concept document per feature, with its `.qa-log.md` transcript |
| `documentation/work-items/<feature>/` | The feature's work items: `feature.md` (parent, stories in priority order) and one file per user story with its acceptance criteria and slices — the single source the issues copy (P-DOC-6) |
| `documentation/CONTEXT.md`, `documentation/adr/` | Glossary and decision records; the root `CONTEXT-MAP.md` points to them |
| `documentation/qa-log.md` | Verbatim log of every question round outside concept work |
| `tools/doc-check.mjs` | The contract check: IDs, references, coverage, stages, frontmatter, and with `--status` the status against git (Node, no dependencies) |
| `.markdownlint.jsonc` | Markdown lint rules for `documentation/` |
| `.gitlab/ci/docs.yml` or `.github/workflows/docs.yml` | CI job that runs the markdown lint and `tools/doc-check.mjs --status` on every MR (full history and tags) |
| `.gitlab/` or `.github/` | Issue templates (feature, user story, bug) and the MR or PR template, for the host in use |
| `.claude/settings.json` | Merge policy, approval count, merge guard, status hook |
| `.claude/hooks/status-reminder.mjs` | The status hook script (Node) |
| `docs/agents/issue-tracker.md`, `docs/agents/domain.md` | Tracker commands and domain-doc layout, read by `/code-review`, `/tdd`, and `/domain-modeling` |
| `CLAUDE.md` | Pointer file for agents working in the repo |

### Status discipline

Status is updated the moment work reaches `dev`, not in the next session (P-ROAD-4): every merge, phase boundary, and release updates the position in `ROADMAP-DETAILS.md` (or the developer's `STATUS.md`) and the stage in `ROADMAP.md` (`idea`, `concept`, `ready`, `in progress`, `in dev`, `released`), and closes the issue. The MR carries the status for the state after the merge, so a reviewer sees it. A `Stop` hook checks at the end of every turn whether the newest merge on `dev` left the status files untouched and, if so, sends the agent back once to update them. In CI, `tools/doc-check.mjs --status` fails every MR whose ROADMAP stage or position rows do not match the merged stories and release tags in git; whether issues are closed is checked by `/engineering-human check` with the host's command line.

## Commands

| Command | What it does |
| --- | --- |
| `/engineering-human` | Detects the repo state and continues: migrate, setup, or grill the next item |
| `/engineering-human setup` | New project setup, starting with the project goal |
| `/engineering-human <feature>` | Grills a feature into a concept document |
| `/engineering-human check` | Consistency check: goal chain and status |
| `/engineering-human team` | Switches a repo from solo to team mode |
| `/engineering-human migrate [<feature>]` | Migrates a project or one document from the predecessor skill `engineering-profile` |
| `/engineering-human triage [<issue>]` | Triages raw incoming issues: bugs become fix issues, requests go to the inbox |
| `/engineering-human wayfind <effort \| map>` | Charts a foggy multi-session effort as a map of decision tickets, or works its next ticket |
| `/engineering-human sweep [<area>]` | Phase 8: finds shallow modules and drift between documents and code |
| `/engineering-human tickets <feature>` | Turns the work-item tree into issues: feature issue, story issues as its children, slice issues below; writes the issue numbers back |
| `/engineering-human implement <issue>` | Branch, TDD, MR, then the merge step |
| `/engineering-human review <MR>` | Reviews an MR against acceptance criteria and Definition of Done |
| `/engineering-human revise <MR>` | Works through the review threads on the agent's own MR: verify, reply, fix |
| `/engineering-human merge <MR>` | Merges under the merge policy and updates the status |
| `/engineering-human release [<version>]` | Read-only pre-release review, release MR `dev` → `main`, tag, release notes; without a version the agent derives it |
| `/engineering-human settings` | Shows the effective merge settings and safeguards |
| `/engineering-human settings auto` | Fully automatic merges and releases (solo mode only) |
| `/engineering-human settings ask` | Back to the safe default: pop-up for every merge and release |
| `/engineering-human settings <key> <value>` | Changes one value: `merge`, `approvals`, `release`, `hook` |

## Settings you can change

*Scope* says who a setting binds: **project** settings are committed and bind everyone on the repo, **personal** settings apply to one developer, **all projects** settings change the profile itself.

| Setting | Where | Values | Default | Scope | Rule |
| --- | --- | --- | --- | --- | --- |
| Merge policy | `.claude/settings.json`, `env.ENGINEERING_HUMAN_MERGE` | `ask`, `approved`, `auto` | `ask` | project | P-MR-4 |
| Approvals needed under `approved` | `.claude/settings.json`, `env.ENGINEERING_HUMAN_APPROVALS` | positive integer | `1` | project | P-MR-4 |
| Release merge `dev` → `main` | `.claude/settings.json`, `env.ENGINEERING_HUMAN_RELEASE_MERGE` | `ask`, `auto` (solo only) | `ask` | project | P-MR-5, P-VER-2 |
| Merge guard | `.claude/settings.json`, `permissions.ask` (six merge rules) | present under `ask`, removed under `approved` / `auto` | present | project | P-MR-6 |
| Status hook | `.claude/settings.json`, `hooks.Stop`, plus `.claude/hooks/status-reminder.mjs` | `on`, `off` (`/engineering-human settings hook`) | on | project | P-ROAD-4 |
| Mode | `documentation/WORKFLOW.md`, *Mode* | `solo`, `team` (switch with `/engineering-human team`) | asked at setup | project | P-TEAM-1…5 |
| Time tracking | `documentation/WORKFLOW.md`, *Time tracking* | `off`, `on for humans` | asked at setup | project | P-TIME-1 |
| Git host and tracker | `documentation/WORKFLOW.md`, *Git host / tracker* | GitLab or GitHub, project URL | asked at setup | project | P-TRK-1 |
| Where the weight lives (GitHub) | `documentation/WORKFLOW.md`, *Templates* | issue description or Projects number field | issue description | project | P-TRK-1, P-TRK-3 |
| Project labels | `documentation/WORKFLOW.md`, *Labels* | additional labels | `type::…`, `status::…` | project | P-TRK-1 |
| Sprint length | `documentation/WORKFLOW.md`, *Sprints* | number of weeks | — | project | P-TRK-1 |
| Extra Definition of Done items | `documentation/WORKFLOW.md`, DoD item 10 | any checkable item | none | project | P-MR-3 |
| Who may merge into `main` | `documentation/WORKFLOW.md`, *Branches*, and the host's branch protection | a role | — | project | P-GIT-1 |
| Versioning rules | `documentation/VERSIONING.md` | phase, data disposable before 1.0, public contracts, release cadence | — | project | P-VER-1…3 |
| Host settings | GitLab or GitHub project settings (set up via `/wizard`) | protected `main`/`dev`, merge commits only, required approvals (matching `ENGINEERING_HUMAN_APPROVALS`) | protected, merge commits only | project | P-GIT-1, P-GIT-3 |
| Deviation from a standing decision | an ADR or `documentation/WORKFLOW.md`, naming the overridden ID | any | none | project | contract point 4 |
| Developer handle | `CLAUDE.local.md` (gitignored), `Developer handle: <handle>` | pseudonymous handle | — | personal (team mode) | P-TEAM-2 |
| Personal-scope preferences | `CLAUDE.local.md` | overrides of entries marked *(personal scope)*: numbered pop-up questions (P-GRILL-1), fresh-session suggestion (P-GRILL-3) | as in the profile | personal | P-TEAM-2 |
| Global personal instructions | `~/.claude/CLAUDE.md` | free text | — | personal | — |
| Standing decisions | [PROFILE.md](PROFILE.md) — edited in place with a date; in a team repo via MR on the vendored copy | any | — | all projects | Maintenance in SKILL.md |

### Merge policy in short

Whether an agent may merge on its own is a project setting in the committed `.claude/settings.json` ([template](templates/claude/settings.json)); only that file counts, never `settings.local.json` or personal settings. The rules are P-MR-4 (merge policy), P-MR-5 (release merge), and P-MR-6 (merge guard) in [PROFILE.md](PROFILE.md); in every policy the agent merges only when the acceptance criteria and the Definition of Done are met and the pipeline is green (P-MR-3).

| You want | Set | Result |
| --- | --- | --- |
| To decide every merge yourself (default) | `/engineering-human settings ask` | A pop-up before every merge and every release |
| Merges after a human approval on GitLab or GitHub | `/engineering-human settings merge approved` | The agent merges once enough people other than the author approved |
| Fully automatic, solo projects only | `/engineering-human settings auto` | The agent merges after its own recorded review and releases without asking; a MAJOR version is still confirmed |

Every change is confirmed with a pop-up and shipped as a normal MR, which still merges under the old policy. A personal instruction such as "never merge on your own" in `~/.claude/CLAUDE.md` overrides `approved` and `auto`.

The two technical safeguards — the merge guard and the status hook — are described once in SKILL.md, [Merge policy](SKILL.md#merge-policy).

## Suggestions

Proposed improvements that are **not implemented yet**. An implemented suggestion moves into the sections above; a rejected one is removed.

| ID | Suggestion | Why |
| --- | --- | --- |
| S-7 | Offer EARS sentence patterns as an optional form for requirements: `WHEN <trigger> THE SYSTEM SHALL <response>`, `WHILE <state> …`, `IF <unwanted condition> THEN …` | Fixed patterns make requirements easier to check and harder to write vaguely; they fit the MUST/MUST NOT form of the concept document and need no tool |
| S-8 | Add Vale as a prose linter to the CI job, with our own plain-language rules for German and English (sentence length, filler words, passive voice, undefined abbreviations) | Checks P-HUM readability mechanically, as markdownlint already checks the form |

Implemented so far: S-1 (merge guard), S-2 (status hook), S-3 (CI job with markdown lint, contract check, and status check against git), S-4 (`STACK.md` template), S-5 (approval count), S-6 (GitHub templates).

## Files

| File | Purpose |
| --- | --- |
| [SKILL.md](SKILL.md) | The skill itself: commands, contract, setup, migration, delivery flows |
| [PROFILE.md](PROFILE.md) | The standing decisions, each with a stable ID |
| [references/](references/) | Built-in procedures, each loaded only by its command: tickets, implement, tracker setup, triage, wayfinding, sweep |
| [templates/](templates/) | Starting points for a project: manifest, process documents, `STACK.md`, glossary, ADR and question-log templates, GitLab and GitHub templates, `claude/settings.json` and `claude/hooks/` |
| [templates/tools/](templates/tools/), [templates/ci/](templates/ci/), [templates/.markdownlint.jsonc](templates/.markdownlint.jsonc) | The documentation checks a project gets: contract check script, CI jobs for GitLab and GitHub, lint rules |
| [README.md](README.md) | This overview |

## Credits

The procedures in [references/](references/) and the tracker files in [templates/agents/](templates/agents/) are adapted from Matt Pocock's skills (`to-tickets`, `implement`, `setup-matt-pocock-skills`, `triage`, `wayfinder`, `improve-codebase-architecture`), rewritten for this profile: one issue per user story, `documentation/` layout, merge policy, and status discipline. The interview engine (`grilling`, `domain-modeling`), `tdd`, `code-review`, `codebase-design`, `verification-before-completion`, `receiving-code-review`, `pre-release-review`, `privacy-by-design`, and `doubt-driven-development` are called as installed skills; `writing-for-agents` and `skill-check` check this skill itself after every change (Maintenance in SKILL.md).

## Keeping this README current

Every change to SKILL.md, PROFILE.md, or `templates/` that adds, changes, or removes a command, a setting, a default, a generated file, or a described behavior updates this README in the same commit (Maintenance in SKILL.md). A contradiction between this README and SKILL.md or PROFILE.md is a defect: the rule files win, and the README is fixed.

## Deploying

The repo is the single source of truth. `./deploy_skill_wrapper.ps1` copies it to `~/.claude/skills/engineering-human/` and overwrites the installed copy; `-WhatIf` shows what would change. Never edit the installed copy directly — the next deploy removes those edits.
