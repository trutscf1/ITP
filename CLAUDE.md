# CLAUDE.md

This file provides guidance to Claude Code when working in this repository. It is a pointer file: school requirements live in `docs/`, standing conventions in the `engineering-profile` skill, workflows in the installed skills. Do not restate their content here — link it.

## Mandatory skill

**Every content change in this project MUST be made with the `engineering-profile` skill.** Load it before creating, editing, or deleting any file. This applies until the user explicitly revokes it. If the skill is not available in the session, stop and tell the user before changing anything.

## School requirements (`docs/`) — binding

The documents in `docs/` are the teacher's binding requirements; work that ignores them may be rejected or not graded. Read the relevant one before acting:

- `docs/anforderungen_software_projekte.md` — project rules, required stack and minimum versions, Definition of Done, grading checklist. Read before any architecture, dependency, or feature decision. Its section "alt - nicht verwenden" is obsolete.
- `docs/git_workflow_commands.md` — the git/GitLab workflow with `git` and `glab` commands (issues, branches, commits, MRs, reviews, time tracking, releases). Read before any git or GitLab action.
- `docs/security_next_js.md` — pre-commit security stack (Gitleaks, Semgrep, `pnpm audit`) and its config files. Read before setting up tooling or committing.
- `docs/projektantrag.md` — the agreed project proposal: goals, non-goals, planned technology, team areas. Read before scoping or planning a feature; the final presentation reports every deviation from it.

**Precedence:** where `docs/` and a `PROFILE.md` decision disagree, `docs/` wins. Record each such deviation, referencing the overridden `P-…` ID, in `documentation/WORKFLOW.md` (git flow, releases, Definition of Done) or as an ADR in `docs/adr/`.

## Documentation first

`documentation/` is the source of truth for what this system does (P-DOC-1). Read `CONTEXT.md` (the glossary, repo root, P-DOC-3) before any other document there. When you build or materially change a feature, update the owning document in the same change (P-GIT-5).

Process documents: `documentation/MANIFEST.md` (concept authoring process), `WORKFLOW.md` (binds P-GIT/P-VER to GitLab and the school rules; owns the Definition of Done), `ROADMAP.md` (ordered backlog), `ROADMAP-DETAILS.md` (single status location — start every session here), `next.md` (task inbox).

## Standing conventions (engineering profile)

The user's general engineering decisions — git flow, versioning, roadmap conventions, documentation quality bar, working style — live in the **`engineering-profile`** skill (`PROFILE.md`, IDs `P-…`) and are binding here, subject to the precedence rule above. Consult it before any grilling, planning, or design session; never re-ask a question it answers.

## Mandatory skills — do not improvise these workflows

Before each task, load the matching skill (P-WS-5). Skills marked **user** are started only by the user typing the command (`disable-model-invocation`); when the situation matches, stop and ask the user to type it instead of improvising the workflow.

| Situation | Skill | Started by |
| --- | --- | --- |
| Repo not yet configured for the flow | `/setup-matt-pocock-skills` (once) | user |
| Sharpen an idea / start a feature (MANIFEST Phase 1) | `/grill-with-docs` | user |
| Effort too big and foggy for one session | `/wayfinder` (plan only, then back to the flow) | user |
| A question needing a runnable answer | `/prototype` | Claude |
| Reading legwork against primary sources | `/research` | Claude |
| Cut an approved concept's §15 tracks into issues (Phase 7) | `/to-tickets` | user |
| Implement an issue | `/implement` (drives `/tdd`, closes with `/code-review`) | user |
| Build one behavior test-first, standalone | `/tdd` | Claude |
| Review a branch / MR / diff since a fixed point | `/code-review` | Claude |
| Hard bug, flake, or regression | `/diagnosing-bugs` | Claude |
| Raw incoming issues or external MRs | `/triage` (never for issues `/to-tickets` produced) | user |
| In-progress merge/rebase conflict | `/resolving-merge-conflicts` | Claude |
| Steps only a human can perform (credentials, dashboards) | `/wizard` | Claude |
| Codebase upkeep in a spare moment (Phase 8) | `/improve-codebase-architecture` | user |
| Hand the current session over to a fresh one | `/handoff` | user |

Vocabulary layers, model-invoked as needed: `/domain-modeling` (glossary + ADRs), `/codebase-design` (module/interface/seam/depth terms).

**Not used here**: `/to-spec` (the concept document is the spec) and `/grill-me` (use `/grill-with-docs` — same interview, with a paper trail).

## Agent skills

### Issue tracker

GitLab issues of this project, accessed through the GitLab REST API with a personal token in `GITLAB_TOKEN` (no `glab`). See `docs/agents/issue-tracker.md`.

### Triage labels

The five default roles: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` at the repo root, ADRs in `docs/adr/`. See `docs/agents/domain.md`.

## Project overview

A self-hosted cloud storage platform: users upload, organize, search, share, and use files offline; background processing (thumbnails, virus scan, OCR, full-text search); an accessible interface with multiple themes. Target users: schools, clubs, small companies that need data sovereignty. School project for HTL Villach, class 5BHITM, subject ITP (project 1), built by a team of four (areas in `docs/projektantrag.md`). Hosted on GitLab, mirrored to GitHub; the repository is public, so all content must be licence-free.

Planned technology (from the proposal; `documentation/STACK.md` takes over once roadmap item R1 creates it):

- **Repo**: monorepo with four areas, pnpm workspaces + Turborepo, shared contracts (zod, OpenAPI)
- **Web**: Next.js (App Router), React, Radix UI, Tailwind, TypeScript everywhere; installable offline web app
- **Data**: PostgreSQL via Prisma (users, permissions, folders), Redis (sessions, cache), BullMQ (jobs, cron), MongoDB (metadata), CouchDB (offline sync), SeaweedFS object storage
- **Auth**: Better Auth, with an own user table in a 1:1 relation to the Better Auth user table
- **Content**: Strapi headless CMS
- **Observability**: OpenTelemetry → Prometheus, Loki, Tempo, Grafana
- **Tooling / Deploy**: Biome, Docker (`docker compose up`), reverse proxy with TLS, CI/CD, Conventional Commits with a generated changelog

Minimum versions are owned by `docs/anforderungen_software_projekte.md` ("Projektanforderungen für projekte") — do not duplicate them here.

## Commands

Not scaffolded yet. Prescribed by `docs/`:

```bash
docker compose up             # start the full stack
pnpm run lint                 # lint (must pass before merge)
biome check                   # format + lint check
pre-commit run --all-files    # Gitleaks, Semgrep, pnpm audit
```

## Tooling notes

- Prisma migrations are created only with `pnpm prisma migrate dev --name <name>`; applied migrations are never edited.
- `pnpm-lock.yaml` conflicts are resolved by `pnpm install`, never by hand.
- Secrets live in `.env` (ignored); every new variable goes into `.env.example` in the same commit.
