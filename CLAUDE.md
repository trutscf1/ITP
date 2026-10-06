# CLAUDE.md

This file provides guidance to Claude Code when working in this repository. It is a pointer file: school requirements live in `docs/`, process rules in `documentation/MANIFEST.md`, standing conventions in the `engineering-human` skill, workflows in the installed skills. Do not restate their content here — link it.

## Mandatory skill

**Every grilling, planning, concept, or delivery session starts with `/engineering-human`** (P-GRILL-5, P-WS-6), and every content change in this project is made under that skill. If the skill is not available in the session, stop and tell the user before changing anything.

## School requirements (`docs/`) — binding

The documents in `docs/` are the teacher's binding requirements; work that ignores them may be rejected or not graded. Read the relevant one before acting:

- `docs/anforderungen_software_projekte.md` — project rules, required stack and minimum versions, Definition of Done, grading checklist. Read before any architecture, dependency, or feature decision. Its section "alt - nicht verwenden" is obsolete.
- `docs/git_workflow_commands.md` — the git/GitLab workflow with `git` and `glab` commands (issues, branches, commits, MRs, reviews, time tracking, releases). Read before any git or GitLab action.
- `docs/security_next_js.md` — pre-commit security stack (Gitleaks, Semgrep, `pnpm audit`) and its config files. Read before setting up tooling or committing.
- `docs/projektantrag.md` — the agreed project proposal: goals, non-goals, planned technology, team areas. It is the source of `documentation/GOAL.md`; the final presentation reports every deviation from it.

**Precedence:** where `docs/` and a `PROFILE.md` decision disagree, `docs/` wins. Record each such deviation, referencing the overridden `P-…` ID, in `documentation/WORKFLOW.md` (git flow, releases, Definition of Done) or as an ADR in `documentation/adr/`.

## Documentation first

This project follows the AI-first, documentation-driven process defined in `documentation/MANIFEST.md` (the concept authoring manifest). **`documentation/` is the source of truth for what this system does** — read the relevant document there before implementing or changing anything. Read `documentation/GOAL.md` (the project goal `G-1`, ≤ 200 characters — everything is derived from it and must not contradict it) and `documentation/CONTEXT.md` (the glossary) before any other document. ADRs live in `documentation/adr/`; the root `CONTEXT-MAP.md` is only a pointer.

When you build or materially change a feature, update the owning document in the same change (P-GIT-5) — never let code and concept drift.

Process documents: `documentation/WORKFLOW.md` (git/tracker binding, mode, Definition of Done), `ROADMAP.md` (ordered backlog), `ROADMAP-DETAILS.md` (single status entry point — start every session here), `next.md` (task inbox), `VERSIONING.md`.

## Standing conventions (engineering profile)

The user's general engineering decisions — git flow, versioning, roadmap conventions, documentation quality bar, merge policy, working style — live in the **`engineering-human`** skill (`PROFILE.md`, IDs `P-…`) and are binding here, subject to the precedence rule above. Never re-ask a question it answers.

The command table of `/engineering-human` — setup, grill, check, triage, wayfind, sweep, tickets, implement, review, revise, merge, release, settings — is the single routing table for the engineering flow; it is not copied here. Every question to the developer is an `AskUserQuestion` pop-up, never a chat question (P-GRILL-1). Agents merge only through it, under the merge policy in `.claude/settings.json` (P-MR-4).

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

## Agent skills

- **Issue tracker:** GitLab, through the REST API with a personal token in `GITLAB_TOKEN` (no `glab` for agents). See `docs/agents/issue-tracker.md`.
- **Domain docs:** single-context, glossary `documentation/CONTEXT.md`, ADRs `documentation/adr/`. See `docs/agents/domain.md`.

## Project overview

Goal: see `documentation/GOAL.md` (`G-1`) — not restated here.

A self-hosted cloud storage platform with background processing (thumbnails, virus scan, OCR, full-text search) and an accessible interface with multiple themes. School project for HTL Villach, class 5BHITM, subject ITP (project 1), built by a team of four (areas in `docs/projektantrag.md`). Hosted on GitLab, mirrored to GitHub; the repository is public, so all content must be licence-free.

Planned technology (from the proposal; `documentation/STACK.md` owns the binding choices as its sections are filled in):

- **Repo**: monorepo with four areas, pnpm workspaces + Turborepo, shared contracts (zod, OpenAPI)
- **Web**: Next.js (App Router), React, Radix UI, Tailwind, TypeScript everywhere; installable offline web app
- **Data**: PostgreSQL via Prisma (users, permissions, folders), Redis (sessions, cache), BullMQ (jobs, cron), MongoDB (metadata), CouchDB (offline sync), SeaweedFS object storage
- **Auth**: Better Auth, with an own user table in a 1:1 relation to the Better Auth user table
- **Content**: Strapi headless CMS
- **Observability**: OpenTelemetry → Prometheus, Loki, Tempo, Grafana
- **Tooling / Deploy**: Biome, Docker (`docker compose up`), reverse proxy with TLS, CI/CD, Conventional Commits with a generated changelog

Minimum versions are owned by `docs/anforderungen_software_projekte.md` ("Projektanforderungen für projekte") — do not duplicate them here.

## Commands

The application is not scaffolded yet. Prescribed by `docs/`:

```bash
docker compose up             # start the full stack
pnpm run lint                 # lint (must pass before merge)
biome check                   # format + lint check
pre-commit run --all-files    # Gitleaks, Semgrep, pnpm audit
```

Available now:

```bash
node tools/doc-check.mjs                                # consistency check of documentation/
npx markdownlint-cli2 "documentation/**/*.md"           # markdown lint
```

## Tooling notes

- Prisma migrations are created only with `pnpm prisma migrate dev --name <name>`; applied migrations are never edited.
- `pnpm-lock.yaml` conflicts are resolved by `pnpm install`, never by hand.
- Secrets live in `.env` (ignored); every new variable goes into `.env.example` in the same commit.
