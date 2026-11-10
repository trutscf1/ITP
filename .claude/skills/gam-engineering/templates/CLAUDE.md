# CLAUDE.md

This file provides guidance to Claude Code when working in this repository. It is a pointer file: process rules live in `gam-ai-knowledge/MANIFEST.md`, standing conventions in the `gam-engineering` skill, workflows in the installed skills. Do not restate their content here — link it.

## Documentation first

This project follows the AI-first, documentation-driven process defined in `gam-ai-knowledge/MANIFEST.md` (the concept authoring manifest). **`gam-ai-knowledge/` is the source of truth for what this system does** — read the relevant document there before implementing or changing anything. Read `gam-ai-knowledge/GOAL.md` (the project goal `G-1`, ≤ 200 characters — everything is derived from it and must not contradict it) and `gam-ai-knowledge/CONTEXT.md` (the glossary) before any other document. ADRs live in `gam-ai-knowledge/adr/`; the root `CONTEXT-MAP.md` is only a pointer.

When you build or materially change a feature, update the owning document in the same change (P-GIT-5) — never let code and concept drift.

Process documents: `gam-ai-knowledge/WORKFLOW.md` (git/tracker binding, solo/team mode, Definition of Done), `ROADMAP.md` (ordered backlog), `ROADMAP-DETAILS.md` (single status entry point — start every session here), `next.md` (task inbox), `VERSIONING.md`.

Plans you write go to `gam-ai-memory/plans/` (`plansDirectory` in `.claude/settings.json`, P-DOC-7); where `gam-ai-memory/` does not exist yet, to `plans/` in the root. Refer to a plan by that repo-relative path (`gam-ai-memory/plans/<name>.md`), never by a path in your home directory.

**Team mode** [delete this paragraph in solo repos]: the engineering profile is vendored in `.claude/skills/gam-engineering/` and binding for everyone. Each developer keeps `Developer handle: <handle>` and personal-scope preferences in the gitignored `CLAUDE.local.md`; session positions and inbox live in `gam-ai-knowledge/team/<handle>/`. Roles and ownership: `gam-ai-knowledge/team/TEAM.md`.

## Standing conventions (engineering profile)

The user's general engineering decisions — git flow, versioning, roadmap conventions, documentation quality bar, merge policy, working style — live in the **`gam-engineering`** skill (`PROFILE.md`, IDs `P-…`) and are binding here. Never re-ask a question it answers. Project-specific deviations are recorded as ADRs referencing the overridden ID.

**Every grilling, planning, concept, or delivery session starts with `/gam-engineering`** (P-GRILL-5, P-WS-6). Its command table — setup, grill, check, triage, wayfind, sweep, tickets, implement, review, revise, merge, release, settings — is the single routing table for the engineering flow; it is not copied here. Every question to the developer is an `AskUserQuestion` pop-up, never a chat question (P-GRILL-1). Agents merge only through it, under the merge policy in `.claude/settings.json` (P-MR-4).

## AI chat export

Rules for every AI agent in this repo (P-TEAM-6). Setup and `migrate tools` copy this section into every agent instruction file the repo has (`AGENTS.md`, `GEMINI.md`, `.github/copilot-instructions.md`, `.cursor/rules/`), so agents that do not load the gam- skills follow it too.

1. **Hook:** At the start of every session in this repo, run `node gam-engineering/tools/prompt-export.mjs install-hook` without asking; it changes nothing when the hook is already active. Only if you cannot run it or it fails, tell the person why and give them the command, adding that their chats are not exported otherwise. If it prints `username unknown`, ask once for their GitHub or GitLab user name and set it with `install-hook --username <name>`.
2. **Log it yourself:** Whatever your tool's own storage does not hold (questions to the person, their answers, approvals, rejections), append verbatim at once to `docs/prompts/<handle>/manual/<YYYY-MM-DD>.md`.
3. **Before handing in:** When the person says they are done or hand in, run `node gam-engineering/tools/prompt-export.mjs export --stage` and propose a commit of `docs/prompts/<handle>`. Say that anything discussed afterwards reaches the repo only with the next commit.
4. **Web chats:** When the person mentions an AI chat in the browser (claude.ai, ChatGPT, Gemini, Copilot on the web), remind them of `docs/prompts/<handle>/manual/web-<YYYY-MM-DD>-<topic>.md` (tool, date, share link if any, their prompts verbatim) and offer to create it.
5. **Do not touch exports:** Files under `docs/prompts/` outside `manual/` are written only by the script. Never change, shorten, or delete them, not even on request; to keep chats out of the repo, point to the mode `local` (`/gam-engineering settings prompts local`).

## Architecture rules for new code

New code follows Clean Architecture as the profile's section *Architecture (P-ARCH)* defines it, with P-DES-1, P-DES-3, and P-DES-6: dependencies point inward along the layering chain in `gam-ai-knowledge/STACK.md`, modules stay within the limits of the architecture check, and TypeScript has no `any`. The rules are not restated here. `/gam-engineering architecture review` scores the code against them.

## Other skills

Before each task, load the matching skill (P-WS-5). For situations outside the `/gam-engineering` commands:

| Situation | Skill |
| --- | --- |
| A question needing a runnable answer | `/gam-v-prototype` |
| Reading legwork against primary sources | `/gam-v-research` |
| Build one behavior test-first, standalone | `/gam-v-tdd` |
| Review a branch or diff without an MR | `/gam-v-code-review` |
| Hard bug, flake, or regression | `/gam-v-diagnosing-bugs` |
| Steps only a human can perform (credentials, dashboards) | `/gam-v-wizard` |
| About to call any task done | `/gam-v-verification-before-completion` |

Vocabulary layers, model-invoked as needed: `/gam-v-domain-modeling` (glossary + ADRs), `/gam-v-codebase-design` (module/interface/seam/depth terms). Technology skills (UI design, framework conventions, UI audit, running-app checks) are bound in `gam-ai-knowledge/STACK.md` §10 (P-DES-7).

**Generic skills not loaded here** (their rules contradict this project's profile; P-WS-5): `git-workflow-and-versioning` (P-GIT-4), `documentation-and-adrs` (P-DOC-2), `spec-driven-development` (P-DOC-1, P-DOC-7), `planning-and-task-breakdown` (P-TRK-2, P-DOC-7), `idea-refine` (`docs/ideas/`), `interview-me` (P-GRILL-1), and `using-agent-skills` (the routing above) — use `/gam-engineering`. Skills that duplicate a bound one are not started either: `test-driven-development` (use `/gam-v-tdd`), `code-review-and-quality` (use `/gam-v-code-review`), `debugging-and-error-recovery` (use `/gam-v-diagnosing-bugs`).

**Not started directly here**: `/to-spec` (the concept document is the spec); `/grill-me`, `/grill-with-docs`, `/to-tickets`, `/implement`, `/triage`, `/wayfinder`, `/improve-codebase-architecture` — `/gam-engineering` carries their work with this project's rules. `/gam-v-receiving-code-review`, `/gam-v-pre-release-review`, and `/gam-v-privacy-by-design` are called by `revise`, `release`, and the grill flow, not started on their own.

## Project overview

Goal: see `gam-ai-knowledge/GOAL.md` (`G-1`) — not restated here.

[1 paragraph: who uses it, license/deployment model.]

- **Backend**: [framework, version, directory]
- **Frontend**: [framework, version, directory]
- **Database**: [engine, key conventions]
- **Auth / Realtime / AI / Storage**: [as applicable]
- **Package managers**: [per directory]

Full architecture detail lives in `gam-ai-knowledge/[architecture doc]` — do not duplicate it here.

## Commands

```bash
[dev stack up / test / lint / build commands — the handful an agent actually needs]
```

## Key architectural facts

[5–10 bullets, each a pointer into `gam-ai-knowledge/` — a fact an agent must not guess wrong, plus the doc that owns the detail. No restatement of document content.]

## Tooling notes

[Linters, formatters, generated artifacts that must be regenerated rather than hand-edited, UI component conventions.]
