---
name: gam-engineering
description: The user's standing engineering decisions (PROFILE.md — goal first, git flow, versioning, roadmap, documentation readable by humans and AI, quality bar, merge policy, solo vs. team) and the router of the documentation-first workflow built on them. Consult PROFILE.md before any grilling, planning, design, or project-setup session so already-answered questions are never asked again. Invoke as /gam-engineering without argument to detect where the project stands and continue, or with a command, which it hands to the owning skill — gam-setup (setup, settings, team, migrate), gam-concept (grill a feature, do, check), gam-delivery (tickets, implement, implement-all, review, revise, merge, release), gam-explore (triage, wayfind, sweep, retro), gam-rebuild (rebuild, check, drill), gam-architecture-review (architecture review, adr), gam-profile (profile). Holds the shared rules, templates, and README that the other gam- skills read.
---

# gam-engineering

The core of the gam- process skills: the shared rules every session applies, the state detection, and the routing table that hands each command to its owning skill.

## Before anything else

Nine rules apply from the first message of every session that loads this skill, before any other step:

1. **Every question to the developer is a pop-up** (`AskUserQuestion`), never a chat question — in every mode, from grilling rounds to a plain yes/no confirmation. The format is defined in [Asking the developer](#asking-the-developer).
2. **Offer to make this skill the standing first step of the project.** Unless the project's `CLAUDE.md` already says that every session starts with `/gam-engineering` (or the former `/humanengineering`, P-DOC-10), ask once, as a pop-up, whether to write that into the project's CLAUDE.md. Options: **In CLAUDE.md** (committed; recommended), **In CLAUDE.local.md** (personal; must be in `.gitignore`, P-TEAM-2), **No** (change nothing; do not ask again this session). If yes, add one line next to the existing routing rule, or create the file from [templates/CLAUDE.md](templates/CLAUDE.md): `Every grilling, planning, concept, or delivery session starts with /gam-engineering (P-GRILL-5, P-WS-6).` A `CLAUDE.md` edit ships like any other change (P-GIT-2).
3. **Check whether the project folder is a git repository**. If it is not, every git step named in this skill is replaced as [Projects without git](references/no-git.md) says (P-GIT-7). If it is, read the branch model `env.GAM_ENGINEERING_BRANCHES` from the committed `.claude/settings.json` (P-GIT-9): under `trunk` there is no `dev`, every `dev` this skill names as target or integration branch means `main`, and the release and stage steps change as [references/branches.md](references/branches.md) lists.
4. **Name the model, then delegate by it.** Start each command with the one-line recommendation of [Models](references/models.md#per-command); the suite, `doc-check`, pipeline, and inventory steps of its row go to a subagent of that tier, never run in the session; on another session model the work goes to a subagent of that tier ([Handoff](references/models.md#handoff), P-WS-7).
5. **Read the inbox first** (`next.md`, in team mode the developer's own): urgent entries come before the next step, and a hand edit is never overwritten ([gam-ai-knowledge: Inbox](../gam-ai-knowledge/SKILL.md#inbox), P-ROAD-3).
6. **Ask the flow.** When the committed `.claude/settings.json` has no `env.GAM_ENGINEERING_FLOW`, ask the entry question of [Quick mode](references/quick.md) once. Under `quick`, the plan flow and slim pipeline of that file apply (P-FLOW-1, P-PIPE-3).
7. **Check gam-ai-memory once.** At the first command of the session, check the skill and the folder as [Memory check](../gam-setup/references/memory.md) says: at most one hint line (P-DOC-12). Once per machine also the [external skills](references/skill-deps.md).
8. **End every message with the run status** (P-WS-9): `⏳🟡 **Läuft noch:** <what> ⚠️ nicht schließen` or `✅🟢 **Fertig – nichts läuft mehr**`.
9. **Log every script run in full** (P-WS-11): full output to a rotated temp `.log`, linked by absolute path.

**[PROFILE.md](PROFILE.md) holds the standing decisions** (the cross-project memory), each with a stable ID (`P-GIT-1`, `P-ROAD-2`, …). A grilling that respects the profile only asks what is genuinely new about *this* project.

The four principles behind every document: [references/principles.md](references/principles.md).

## Command: `/gam-engineering`

**Every session starts here** (P-GRILL-5, P-WS-6): grilling, planning, concept work, setup, migration, and delivery all begin with `/gam-engineering`. If a session starts any other way — including `/grill-with-docs`, `/grill-me`, `/gam-v-grilling`, `/to-tickets`, or `/implement` — switch to the matching subcommand before the first question or change. The argument picks the entry point:

| Invocation | Skill | What happens |
| --- | --- | --- |
| `/gam-engineering` (no argument) | `gam-engineering` | Detect the state of the repo and continue from there, first match wins ([Detect the state](references/detect.md)): migrate, setup, rebuild, implement, review, merge, or grill. State the detected entry point as an assumption `A<n>` before acting. |
| `/gam-engineering setup` | `gam-setup` | Run [New project setup](../gam-setup/references/setup.md), starting with the project-goal question. |
| `/gam-engineering <feature or idea>` | `gam-concept` | **Grill** that feature into a concept document ([Grill](../gam-concept/SKILL.md#grill)). |
| `/gam-engineering do <feature>` | `gam-concept` | **Pull a planned ROADMAP feature forward** to the next version and start grilling it at once, reusing its feature note and any pre-concept answers ([Do](../gam-concept/references/do.md)). |
| `/gam-engineering check` | `gam-concept` | Run the **consistency check** ([manifest: The Derivation Chain](../gam-ai-knowledge/templates/concept_authoring_manifest.md#the-derivation-chain)) over the documentation set and report orphans, contradictions, and stale status; change nothing without confirmation. |
| `/gam-engineering team` | `gam-setup` | Run the [solo → team migration](../gam-setup/references/team.md). |
| `/gam-engineering migrate` | `gam-setup` | Bring a project from any older state onto the current one in one change ([Migrating a project](../gam-setup/references/migrate.md)). |
| `/gam-engineering migrate <feature>` | `gam-setup` | Migrate one legacy concept document to the current format ([references/migrate-concept.md](../gam-setup/references/migrate-concept.md)). |
| `/gam-engineering migrate tools` | `gam-setup` | The same migration limited to the old layout and the tooling: add what is missing, update outdated copies. `tools` is a reserved argument. |
| `/gam-engineering migrate stealth` | `gam-setup` | Move a project to stealth mode after a confirmation pop-up: sibling target, copy, ignore, unindex, push `chore/stealth-migrate` ([migrate-stealth](../gam-setup/references/migrate-stealth.md)). |
| `/gam-engineering pipeline` | `gam-setup` | Decide where the pipeline runs (`host`, `local`, `both`, `none`) and which checks; record them in `gam-engineering/pipeline.json` ([Pipeline](../gam-setup/references/pipeline.md), P-PIPE). |
| `/gam-engineering frontend` | `gam-setup` | Technology skills, interface audit, and color-theme gaps, grilled as one feature ([Frontend](../gam-setup/references/frontend.md), P-DES-7…9). |
| `/gam-engineering triage [<issue>]` | `gam-explore` | Triage raw incoming issues and MRs into fix issues or inbox entries ([references/triage.md](../gam-explore/references/triage.md)). |
| `/gam-engineering inbox` | `gam-explore` | Summarize, structure, and prioritize the inbox ([references/inbox.md](../gam-explore/references/inbox.md)). |
| `/gam-engineering wayfind <effort \| map>` (alias `wayfinder`) | `gam-explore` | Chart an effort too big and foggy for one session as a map of decision tickets, or work the next ticket of a map ([references/wayfind.md](../gam-explore/references/wayfind.md)). |
| `/gam-engineering sweep [<area>]` | `gam-explore` | Manifest Phase 8: find shallow modules and drift between documents and code, report them as HTML ([references/sweep.md](../gam-explore/references/sweep.md)). |
| `/gam-engineering retro [<session>]` | `gam-explore` | Look back at a session and propose environment changes: checks, pointers, steering files ([references/retro.md](../gam-explore/references/retro.md)). |
| `/gam-engineering tickets <feature>` | `gam-delivery` | Cut the approved concept's user stories into issues ([Delivery: tickets](../gam-delivery/references/tickets.md)). |
| `/gam-engineering implement <issue>` | `gam-delivery` | Implement one issue end to end: branch, TDD, MR, then the merge step ([Delivery: implement](../gam-delivery/references/implement.md)). |
| `/gam-engineering implement-all <feature>` | `gam-delivery` | Build all ready issues of the feature in parallel implementer subagents, one MR per issue, merged one at a time ([Delivery: implement-all](../gam-delivery/references/implement-all.md)). |
| `/gam-engineering review <MR>` | `gam-delivery` | Review an MR against its acceptance criteria and the Definition of Done ([Delivery: review](../gam-delivery/references/review.md)). |
| `/gam-engineering revise <MR>` | `gam-delivery` | Work through the review threads on an MR the agent authored: verify each point, reply, fix ([Delivery: revise](../gam-delivery/references/revise.md)). |
| `/gam-engineering merge <MR>` | `gam-delivery` | Merge an MR under the project's merge policy and bring the status up to date ([Delivery: merge](../gam-delivery/references/merge.md)). |
| `/gam-engineering release [<version>]` | `gam-delivery` | Release `dev` → `main` (in branch model `trunk`: tag `main`): release MR, tag, release notes, status ([Delivery: release](../gam-delivery/references/release.md)); without a version, the agent derives it (P-VER-2). |
| `/gam-engineering stopp` | `gam-delivery` | End the session by saving its state in the project: documents, `wip/` branch for unfinished code, merge under the policy, next command ([Delivery: stopp](../gam-delivery/references/stopp.md), P-WS-8). |
| `/gam-engineering rebuild [check \| drill]` | `gam-rebuild` | Rebuild the code from the documentation; `check` lists what still blocks a rebuild, `drill` proves it in a throwaway copy, both only on their own command ([gam-rebuild](../gam-rebuild/SKILL.md)). |
| `/gam-engineering architecture [review \| adr]` | `gam-architecture-review` | Score the architecture with evidence on 100 points, or write ADRs for decisions the code embodies ([gam-architecture-review](../gam-architecture-review/SKILL.md), P-ARCH). |
| `/gam-engineering profile [deviation \| append]` | `gam-profile` | Show the profile, record a deviation, or append a durable answer ([gam-profile](../gam-profile/SKILL.md)). |
| `/gam-engineering settings [ask \| auto \| <key> <value>]` | `gam-setup` | Show or change the merge, model, and plans-folder settings; `settings auto` switches a solo project to fully automatic merges and releases ([Settings](../gam-setup/references/settings.md)). |

**Routing.** This skill decides the entry point; the work is done by the skill in the *Skill* column. For every row except the first, call the Skill tool with that skill and pass the invocation's arguments unchanged (`gam-delivery` with `implement 12`). For the first row, state the detected entry point as an assumption, then route the same way. Each other skill can also be invoked directly (`/gam-delivery implement 12`); it first applies [Before anything else](#before-anything-else), [Asking the developer](#asking-the-developer), and [The contract](#the-contract) of this file, which it reads as its shared rules. Shared files live only here: [PROFILE.md](PROFILE.md), [README.md](README.md), [templates/](templates/), and [references/branches.md](references/branches.md), [references/no-git.md](references/no-git.md). The knowledge templates, the manifest template, and the checker live in [gam-ai-knowledge](../gam-ai-knowledge/SKILL.md) (`../gam-ai-knowledge/templates/…`, P-DOC-11). All nine gam- skills are installed side by side.

## Asking the developer

These rules apply to **every** question addressed to the developer, in every mode (grill, setup, check, team, migrate, triage, wayfind, sweep, settings, and the delivery commands), including confirmations such as "Deviations for this project?" or "wait for confirmation". They are the single definition of the question format that P-GRILL-1 refers to:

1. **Pop-up, numbered.** Every question is an `AskUserQuestion` pop-up, never a chat message. Each question gets its own number `Q<n>`, written at the start of the pop-up question text (`Q<n> - <title>: <question>?`), and a header of at most 12 characters.
2. **Options, recommendation, none, Other.** The options are the viable choices (2–4, each with a short description), then **None of these** (if the tool allows only 4: 3 choices); the recommended one comes first and carries `(Recommended)` in its label. The pop-up adds the free-text *Other* itself. Choices that may combine use `multiSelect`.
3. **Rounds.** Each round asks the complete currently answerable frontier; defer only questions blocked by unanswered prerequisites. One pop-up call holds up to four questions, so a larger frontier is sent as several calls in a row, without work in between. A stated assumption (`A<n>`, P-GRILL-4) is not a question; if the developer rejects it, it becomes a `Q<n>` of the next round.
4. **Recorded.** The AI chat export is the record of every round, answers verbatim (P-GRILL-2, P-TEAM-6): the hook writes the session with its pop-ups to `docs/prompts/`; no Q&A file is written. Numbers come from `node gam-engineering/tools/prompt-export.mjs next-q` (one counter, archived `qa-log.md` files included). An interaction a tool's export misses (README, *AI chat export*) goes verbatim to `docs/prompts/<handle>/manual/<date>.md`.
5. **Merge decisions use fixed options.** The one exception to rules 1–3: whether to merge is a pop-up with the fixed options defined in P-MR-4, not with options of the agent's choosing. Where P-MR-4 or P-MR-5 asks, it is that pop-up; where they do not ask, no question is asked at all. The answer is still logged per rule 4.

## Models

Model, delegation, and session length (P-WS-7): [references/models.md](references/models.md), applied by rule 4 of [Before anything else](#before-anything-else).

## Project settings

Read the committed `.claude/settings.json` itself, never the process environment; the merge rules are P-MR-4, P-MR-5, and P-MR-6. Reading, fallbacks, and the transition from former names: [references/settings-and-skills.md](references/settings-and-skills.md#project-settings).

## Built-in procedures

The generic skills `/to-tickets`, `/implement`, `/triage`, `/wayfinder`, `/retro` and their kin cannot be invoked by the model; their procedures are built into the gam- skills. Which skills the Skill tool may call: [references/settings-and-skills.md](references/settings-and-skills.md#built-in-procedures).

## The contract

1. **Read PROFILE.md before the first question** of any grilling, planning, or design session. In a team repo, read the repo's copy (`.claude/skills/gam-engineering/PROFILE.md`), not a personal one (P-TEAM-1).
2. **Read the project goal next** (`gam-ai-knowledge/GOAL.md`). If it does not exist, defining it is the first question of the session — before any feature, story, or requirement (P-GOAL-1).
3. **Never ask a question PROFILE.md already answers.** Instead, state the applied decisions by ID in one confirmation line ([example](../gam-profile/SKILL.md#stating-applied-decisions)).
4. **Deviations** go in the project, never in PROFILE.md ([gam-profile](../gam-profile/SKILL.md#deviations)).
5. **Durable answers** are appended to PROFILE.md after a test ([gam-profile](../gam-profile/SKILL.md#appending-durable-answers)).
6. **One home per fact** ([gam-profile](../gam-profile/SKILL.md#no-duplication)).
7. **Keep status current at every merge, phase boundary, and release** (P-ROAD-4): the `ROADMAP-DETAILS.md` position (or the developer's `STATUS.md`) and the `ROADMAP.md` stage reflect the work the moment it reaches `dev`, and before any session ends. Never leave this to the next session; the repo cannot show the omission if `gam-ai-knowledge/` is outside git.
8. **Merge only through the merge policy** (P-MR-4, P-MR-5): every merge an agent performs goes through [Delivery: merge](../gam-delivery/references/merge.md) or [release](../gam-delivery/references/release.md), never a bare `git merge` or host merge button.
9. **Plans go to `gam-ai-memory/plans/`** (P-DOC-7): every plan the agent writes is saved in `gam-ai-memory/plans/` (created if missing; `plans/` in the root while `gam-ai-memory/` is missing), and every reference to it names that repo-relative path, never one in the home directory. If `.claude/settings.json` lacks `plansDirectory`, save the plan there and offer to add the key with [`/gam-engineering settings`](../gam-setup/references/settings.md).

## Where the rules live

Each rule has one source; the table of topics and sources is [references/rules-map.md](references/rules-map.md). In a project, read the project's copy `gam-ai-knowledge/MANIFEST.md`.
