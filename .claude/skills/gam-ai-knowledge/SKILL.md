---
name: gam-ai-knowledge
description: Long-term knowledge of a project in the folder gam-ai-knowledge/ — goal, workflow, roadmap and status, concepts, work items, ADRs, glossary, stack, tests, deployment, security, Q&A logs, inbox — with fixed document formats, read and write rules, and the checker doc-check, for every AI agent and the other gam- skills. Use when /gam-ai-knowledge init sets the folder up, when /gam-ai-knowledge check checks it, or whenever an agent reads or writes a document in gam-ai-knowledge/.
---

# gam-ai-knowledge

Everything a project should still know in a year lives in `gam-ai-knowledge/`, readable by every AI agent (Claude Code, Codex, Copilot, Gemini CLI, Cursor), at the repo root; this skill owns that folder: what it holds, the format of each document, who writes it, and the checker (P-DOC-11). It is knowledge, not process — how a feature is grilled, built, merged, or released stays in the other gam- skills ([gam-engineering](../gam-engineering/SKILL.md) and the skills it routes to), which read and write the folder by the rules below. What only matters for the running task belongs to a short-term memory such as `gam-ai-memory/`, never here.

## Commands

| Invocation | Procedure |
| --- | --- |
| `/gam-ai-knowledge init` | [references/init.md](references/init.md): create `gam-ai-knowledge/` with every document, the checker, and the `AGENTS.md` pointer |
| `/gam-ai-knowledge check` | [references/check.md](references/check.md): run the checker and report; changes nothing |

Both work in a project without the other gam- skills. Every question is a numbered pop-up as in [Asking the developer](../gam-engineering/SKILL.md#asking-the-developer), recorded by the AI chat export in `docs/prompts/` (P-GRILL-2).

## What the folder holds

| Document | Template | Written by |
| --- | --- | --- |
| `GOAL.md` — the project goal `G-1` (P-GOAL-1) | [GOAL.md](templates/GOAL.md) | `init` or setup; changed only by a recorded decision |
| `CONTEXT.md` — the glossary (P-DOC-2) | [CONTEXT.md](templates/CONTEXT.md) | the grill flow (`/gam-v-domain-modeling`) |
| `adr/NNNN-slug.md` — decision records (P-DOC-2) | [adr.md](templates/adr.md) | the grill flow |
| `MANIFEST.md` — the project's copy of the concept authoring manifest | [concept_authoring_manifest.md](templates/concept_authoring_manifest.md) | `init`; refreshed by `migrate tools` |
| `ROADMAP.md`, `ROADMAP-DETAILS.md` — backlog with stages, and the status entry point (P-ROAD-1…4) | [ROADMAP.md](templates/ROADMAP.md), [ROADMAP-DETAILS.md](templates/ROADMAP-DETAILS.md) | every command that changes a position, phase, merge, or release |
| `next.md` — the inbox (P-ROAD-3) | [next.md](templates/next.md) | the developer by hand at any time, and the agent ([Inbox](#inbox)) |
| `concepts/<feature>.md` (an older `.qa-log.md` stays as archive) | the manifest's concept structure | the grill flow |
| `work-items/` — epics, stories, backlogs (P-DOC-6, P-DOC-8) | [work-items/](templates/work-items/) | the grill flow, `tickets`, `merge` |
| `WORKFLOW.md`, `VERSIONING.md` | [WORKFLOW.md](templates/WORKFLOW.md), [VERSIONING.md](templates/VERSIONING.md) | setup and settings |
| `STACK.md`, `TEST_STRATEGY.md`, `DEPLOYMENT.md`, `SECURITY.md` | [STACK.md](templates/STACK.md), [TEST_STRATEGY.md](templates/TEST_STRATEGY.md), [DEPLOYMENT.md](templates/DEPLOYMENT.md), [SECURITY.md](templates/SECURITY.md) | the architecture phase and every change to them |
| `test-data/` — invented golden dumps and contract examples the tests read, one folder per feature | [test-data/README.md](templates/test-data/README.md) | the architecture and test phases, and every change to stored data or an external contract |
| `qa-log.md` — archive of the question rounds before the chat export (P-GRILL-2); no longer written | [qa-log.md](templates/qa-log.md) | every skill that asks |
| `team/TEAM.md`, `team/<handle>/STATUS.md` and `next.md` — team mode (P-TEAM-3) | [TEAM.md](templates/TEAM.md), [STATUS.md](templates/STATUS.md) | `/gam-engineering team` |
| `tools/doc-check.mjs` — the checker | [gam-ai-knowledge/tools/doc-check.mjs](templates/gam-ai-knowledge/tools/doc-check.mjs) | `init`; refreshed by `migrate tools` |

## Format

Every document starts with the frontmatter of the manifest's [Machine-Readable Contract](templates/concept_authoring_manifest.md#machine-readable-contract) and carries `format: gam-ai-knowledge/1`. The former values `gam-engineering/2`, `humanengineering/2`, and `engineering-human/2` mean the same format; the checker accepts them with a warning inside `gam-ai-knowledge/`, and `/gam-engineering migrate` rewrites them. Markdown follows the project's `.markdownlint.jsonc`.

## Reading

1. Read `GOAL.md`, then `CONTEXT.md`, before any other document; the project's `MANIFEST.md` governs every document form.
2. `ROADMAP-DETAILS.md` (or the developer's `team/<handle>/STATUS.md`) says where the work stands; start a session there.
3. **Transition (P-DOC-10, P-DOC-11).** In a project not yet moved, the folder is `gam-engineering/documentation/` (or the former `humanengineering/documentation/`): read every `gam-ai-knowledge/…` path the gam- skills name there while `gam-ai-knowledge/` is missing — except `gam-ai-knowledge/tools/`, which is `gam-engineering/tools/` (or `humanengineering/tools/`) before the move — and, when gam-engineering is installed, offer `/gam-engineering migrate` once per session. Change no file for the move without the developer's confirmation.

## Writing

- Each fact has one place, a document named above; other folders, short-term memories, and agent files link to it.
- The position row of a feature stays in `ROADMAP-DETAILS.md`; a short-term memory holds only the working steps of the running task and links that row.
- **Team mode** (`WORKFLOW.md` says *team*, the handle from `Developer handle: <handle>` in `CLAUDE.local.md`, P-TEAM-3): the developer's position rows go to `team/<handle>/STATUS.md`, and `ROADMAP-DETAILS.md` holds only the index row — feature, owner handle, phase, link to that file; the developer's inbox entries go to `team/<handle>/next.md`. No shared `next.md` exists.
- Write a document only by the process that owns it (*Written by*); code and documents change in the same change (P-GIT-5).
- After every write, the checker must report no error: `node gam-ai-knowledge/tools/doc-check.mjs`.

## Inbox

`next.md` (in team mode the developer's `team/<handle>/next.md`) is written by the developer by hand at any time, and by the agent (P-ROAD-3). It has two sections, `## Urgent` above `## Open`.

1. **Read it first.** Every start of a gam- skill command reads the inbox before anything else of the command. Without an argument, every entry under `## Urgent` is handled before the position's next step. With an argument, before any other step, the urgent entries are named in one `Q<n>` pop-up with the options **Handle first** (recommended) and **After the command**.
2. **Urgent goes under `## Urgent`.** An entry the agent records as urgent goes under that heading; when it is missing, create it directly above `## Open`.
3. **Done is logged and deleted in one step.** When an entry is handled, add one row to the log of `ROADMAP-DETAILS.md` — the date of the day, the entry's text, the outcome — and delete the entry from the inbox in the same working step.
4. **A hand edit is never lost.** Read the inbox again right before every edit, and change only the lines of the processed entry; never write the file back from an earlier read.
5. **Structure on request.** `/gam-engineering inbox` ([procedure](../gam-explore/references/inbox.md)) summarizes, structures, and prioritizes the entries in the shape of the [template](templates/next.md), keeping every fact. Priorities are proposals the developer may change by hand.
