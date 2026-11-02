# CLAUDE.md

This file provides guidance to Claude Code when working in this repository. It is a pointer file: process rules live in `documentation/MANIFEST.md`, standing conventions in the `engineering-human` skill, workflows in the installed skills. Do not restate their content here — link it.

## Documentation first

This project follows the AI-first, documentation-driven process defined in `documentation/MANIFEST.md` (the concept authoring manifest). **`documentation/` is the source of truth for what this system does** — read the relevant document there before implementing or changing anything. Read `documentation/GOAL.md` (the project goal `G-1`, ≤ 200 characters — everything is derived from it and must not contradict it) and `documentation/CONTEXT.md` (the glossary) before any other document. ADRs live in `documentation/adr/`; the root `CONTEXT-MAP.md` is only a pointer.

When you build or materially change a feature, update the owning document in the same change (P-GIT-5) — never let code and concept drift.

Process documents: `documentation/WORKFLOW.md` (git/tracker binding, solo/team mode, Definition of Done), `ROADMAP.md` (ordered backlog), `ROADMAP-DETAILS.md` (single status entry point — start every session here), `next.md` (task inbox), `VERSIONING.md`.

**Team mode** [delete this paragraph in solo repos]: the engineering profile is vendored in `.claude/skills/engineering-human/` and binding for everyone. Each developer keeps `Developer handle: <handle>` and personal-scope preferences in the gitignored `CLAUDE.local.md`; session positions and inbox live in `documentation/team/<handle>/`. Roles and ownership: `documentation/team/TEAM.md`.

## Standing conventions (engineering profile)

The user's general engineering decisions — git flow, versioning, roadmap conventions, documentation quality bar, merge policy, working style — live in the **`engineering-human`** skill (`PROFILE.md`, IDs `P-…`) and are binding here. Never re-ask a question it answers. Project-specific deviations are recorded as ADRs referencing the overridden ID.

**Every grilling, planning, concept, or delivery session starts with `/engineering-human`** (P-GRILL-5, P-WS-6). Its command table — setup, grill, check, triage, wayfind, sweep, tickets, implement, review, revise, merge, release, settings — is the single routing table for the engineering flow; it is not copied here. Every question to the developer is an `AskUserQuestion` pop-up, never a chat question (P-GRILL-1). Agents merge only through it, under the merge policy in `.claude/settings.json` (P-MR-4).

## Other skills

Before each task, load the matching skill (P-WS-5). For situations outside the `/engineering-human` commands:

| Situation | Skill |
| --- | --- |
| A question needing a runnable answer | `/prototype` |
| Reading legwork against primary sources | `/research` |
| Build one behavior test-first, standalone | `/tdd` |
| Review a branch or diff without an MR | `/code-review` |
| Hard bug, flake, or regression | `/diagnosing-bugs` |
| In-progress merge/rebase conflict | `/resolving-merge-conflicts` |
| Steps only a human can perform (credentials, dashboards) | `/wizard` |
| About to call any task done | `/verification-before-completion` |

Vocabulary layers, model-invoked as needed: `/domain-modeling` (glossary + ADRs), `/codebase-design` (module/interface/seam/depth terms). Additionally, load matching technology skills for the task at hand.

**Not started directly here**: `/to-spec` (the concept document is the spec); `/grill-me`, `/grill-with-docs`, `/to-tickets`, `/implement`, `/triage`, `/wayfinder`, `/improve-codebase-architecture` — `/engineering-human` carries their work with this project's rules. `/receiving-code-review`, `/pre-release-review`, and `/privacy-by-design` are called by `revise`, `release`, and the grill flow, not started on their own.

## Project overview

Goal: see `documentation/GOAL.md` (`G-1`) — not restated here.

[1 paragraph: who uses it, license/deployment model.]

- **Backend**: [framework, version, directory]
- **Frontend**: [framework, version, directory]
- **Database**: [engine, key conventions]
- **Auth / Realtime / AI / Storage**: [as applicable]
- **Package managers**: [per directory]

Full architecture detail lives in `documentation/[architecture doc]` — do not duplicate it here.

## Commands

```bash
[dev stack up / test / lint / build commands — the handful an agent actually needs]
```

## Key architectural facts

[5–10 bullets, each a pointer into `documentation/` — a fact an agent must not guess wrong, plus the doc that owns the detail. No restatement of document content.]

## Tooling notes

[Linters, formatters, generated artifacts that must be regenerated rather than hand-edited, UI component conventions.]
