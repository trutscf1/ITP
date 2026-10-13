---
doc: roadmap-details
format: engineering-human/2
title: Roadmap details
audience: [developer, reviewer, agent]
---
# Roadmap Details

Where the project stands right now, for anyone starting a work session — human or agent (P-ROAD-2). It is the single status entry point: it must be precise enough that a fresh session needs no chat history. Other documents link here and never copy this status.

## Status index (team mode)

Positions live in one STATUS file per developer (P-TEAM-3). This index only says who owns what and where to look.

| Feature | Owner | Phase | Status file |
| --- | --- | --- | --- |
| Scaffolding & shared contracts (R1) | trutscf1 | 6, test concept | [team/trutscf1/STATUS.md](team/trutscf1/STATUS.md) |
| Observability baseline (R2) | trutscf1 | 1, grill (draft from the tracker issues) | [team/trutscf1/STATUS.md](team/trutscf1/STATUS.md) |
| Identity: accounts, external login, MFA (R3) | tschudea07 | 1, grill (draft from the tracker issues) | [team/tschudea07/STATUS.md](team/tschudea07/STATUS.md) |
| Design system & accessibility modes (R4) | schwaigc | 1, grill (draft from the tracker issues) | [team/schwaigc/STATUS.md](team/schwaigc/STATUS.md) |
| Storage core: folders, resumable upload, deduplication (R5) | schauby1 | 1, grill (draft from the tracker issues) | [team/schauby1/STATUS.md](team/schauby1/STATUS.md) |
| Web client: dashboard, file browser, preview (R6) | schwaigc | 1, grill (draft from the tracker issues) | [team/schwaigc/STATUS.md](team/schwaigc/STATUS.md) |
| Teams, roles, inherited permissions, quotas, audit log (R7) | tschudea07 | 1, grill (draft from the tracker issues) | [team/tschudea07/STATUS.md](team/tschudea07/STATUS.md) |
| Share links with password and expiry (R8) | tschudea07 | 1, grill (draft from the tracker issues) | [team/tschudea07/STATUS.md](team/tschudea07/STATUS.md) |
| Background processing: thumbnails, virus scan, OCR, scheduled jobs (R9) | schauby1 | 1, grill (draft from the tracker issues) | [team/schauby1/STATUS.md](team/schauby1/STATUS.md) |
| Full-text search (R10) | schauby1 | 1, grill (draft from the tracker issues) | [team/schauby1/STATUS.md](team/schauby1/STATUS.md) |
| Public content: landing page, help center, changelog, legal pages (R11) | trutscf1 | 1, grill (draft from the tracker issues) | [team/trutscf1/STATUS.md](team/trutscf1/STATUS.md) |
| Offline mode: installable web app with sync and conflict handling (R12) | trutscf1 | 1, grill (draft from the tracker issues) | [team/trutscf1/STATUS.md](team/trutscf1/STATUS.md) |
| Load tests & operations dashboards (R13) | trutscf1 | 1, grill (draft from the tracker issues) | [team/trutscf1/STATUS.md](team/trutscf1/STATUS.md) |
| Deployment: automatic deploy on push to `main`, TLS (R14) | tschudea07 | 1, grill (draft from the tracker issues) | [team/tschudea07/STATUS.md](team/tschudea07/STATUS.md) |
| End-to-end encryption (O1) | — | — (no concept yet) | — |
| Kubernetes (k3s) operation (O2) | — | — (no concept yet) | — |

## Log

Append-only record of processed tasks; entries are marked done instead of being deleted. From 2026-10-06 on, every task starts with the author's handle.

| Date | Task | Result |
| --- | --- | --- |
| 2026-09-29 | Create `CLAUDE.md` binding the `engineering-profile` skill and `docs/` | Done — `CLAUDE.md` from the profile template |
| 2026-09-29 | Set up `documentation/` per the profile's new-project setup | Done — `MANIFEST.md`, `WORKFLOW.md`, `ROADMAP.md`, `ROADMAP-DETAILS.md`, `next.md`. Not done: `/setup-matt-pocock-skills` (skill not installed); `VERSIONING.md` (no project-specific notes beyond P-VER, release steps are in `WORKFLOW.md`) |
| 2026-09-29 | Process the project proposal (team of four) | Done — proposal stored as `docs/projektantrag.md`; `ROADMAP.md` R1–R13, O1–O2; `WORKFLOW.md` binds Conventional Commits and the team; `CLAUDE.md` project overview. Open: CI host, PM gate (see `next.md`) |
| 2026-09-29 | R1 Phase 1 grilling and work split | Done — `concepts/scaffolding.md` + Q&A log; `WORKFLOW.md`: commit format (Conventional Commits 1.0.0), changelog (Keep a Changelog 1.1.0), GitLab CI and its deviation from the proposal; `ROADMAP.md`: R14 Deployment |
| 2026-09-29 | R1 Phase 4 sign-off and issues | Sign-off done, Q12 decided as recommended. Issues: script for setup issue + S0–S6 prepared; not run (`glab` not installed, usernames and sprint dates unknown) |
| 2026-09-29 | Time budget and sprint calendar | Done — `WORKFLOW.md`: sprint calendar, 4 h/week, issues ≤ 4 h; R1 cut into issues I0–I18 with rebalanced owners; `ROADMAP.md`: capacity section (scope ≈ 1.4 × capacity). `glab` uninstalled at the user's request |
| 2026-09-29 | Create Sprint 1 in GitLab | Done — via REST API with a project access token: 3 labels, 7 milestones, 19 issues #4–#22 with assignee, weight, time estimate, milestone Sprint 1 |
| 2026-09-29 | R1 system diagram and first ADR | Done — mermaid system overview in `concepts/scaffolding.md` §15 (render-checked); `docs/adr/0001-five-units-behind-one-origin.md` (Q1 + Q9) |
| 2026-09-29 | R1 complete separation per person | Done — concept §15 rewritten into four tracks (Q13); plan file per track; `STACK.md` skeleton with owner sections; `WORKFLOW.md` track rule; GitLab: #5, #6, #21, #22 re-cut to Fabian, #17 to Andreas, #14 to Fabian, #14/#20 to Sprint 2, all R1 descriptions name their track and separate same-track dependencies from cross-track interfaces |
| 2026-09-29 | Engineering-flow skills | Correction: all skills of `MANIFEST.md` are installed in the user's skill folder; `/grill-with-docs`, `/to-tickets`, `/implement`, `/setup-matt-pocock-skills`, `/triage`, `/wayfinder`, `/improve-codebase-architecture`, `/handoff` are user-started (`disable-model-invocation`), so they were not visible to the model. `CLAUDE.md` skill table restored with a "Started by" column |
| 2026-09-29 | MANIFEST Phase 0: `/setup-matt-pocock-skills` | Done — `docs/agents/issue-tracker.md` (GitLab via REST API, token in `GITLAB_TOKEN`, no `glab`), `docs/agents/triage-labels.md` (default five roles), `docs/agents/domain.md` (single-context, `CONTEXT.md` at the repo root); `## Agent skills` block in `CLAUDE.md`; `CONTEXT.md` location aligned to P-DOC-3 in `CLAUDE.md`, `MANIFEST.md`, `concepts/scaffolding.md` |
| 2026-09-29 | Triage labels and concept issues | Done — 5 triage labels created; #1–#3 `needs-triage`, R1 issues `ready-for-agent` except #4, #5, #22 `ready-for-human`; concept issues #23–#37 created (weight 3, owner per roadmap) |
| 2026-10-06 | Labels, Kanban board, and assignment of the user stories | Done — via REST API: 20 labels from `.gitlab/workflows/labels.md`; the existing board "Development" renamed to "Kanban" with five status columns; US-01…US-48 (#38–#85) assigned and labelled. `WORKFLOW.md` "Issues" now binds the `type::` / `status::` labels and the board. Open: sprint milestones and time estimates for the user stories; labels for #1–#3 |
| 2026-10-06 | Plan Sprint 1 with 12 h per person | Done — 11 user stories in milestone Sprint 1 (43 h of 48 h), `status::ready`, time estimate set; selection by dependency order and priority, see "Current positions" |
| 2026-09-29 | Delete GitLab issues | On request: #4–#37 deleted permanently (HTTP 204); #1–#3 could not be deleted with the project token (HTTP 403, created by team members). Labels and milestones kept |
| 2026-10-06 | Migrate the project from `engineering-profile` to `engineering-human` | Done on `concept/migrate-engineering-human`, MR !1 into `dev` (issue #86) — `GOAL.md` (G-1 confirmed, roles and signals drafted), `MANIFEST.md` replaced (the old copy had no project-specific rule left), `CLAUDE.md`, `WORKFLOW.md`, `ROADMAP.md` (Serves, stages), `VERSIONING.md`, `CONTEXT.md`, `qa-log.md`, ADR-0002, ADR-0001 moved to `documentation/adr/`, `.claude/settings.json` (merge policy `ask`) with the status hook, `.gitlab/` templates replaced, `tools/doc-check.mjs`, markdown lint, CI job for the documentation checks; R1 concept and track files marked legacy. GitLab labels renamed to the `WORKFLOW.md` set (8 renamed, 7 created). Open: review and merge of the MR, team switch (`next.md`) |
| 2026-10-06 | `trutscf1` — switch the project to team mode | Done on `chore/team-mode` — skill vendored in `.claude/skills/engineering-human/`, `team/TEAM.md`, one `STATUS.md` and one inbox per developer, positions moved out of this file, shared `next.md` removed, Owner column in `ROADMAP.md`, ADR-0003. `main` on GitLab: already protected (push and merge for Maintainers only); tightening push to "no one" needs a Maintainer |
| 2026-10-06 | `trutscf1` — bring the 48 user stories of the tracker into the repository | Done on `concept/user-story-work-items` — one work-item folder per roadmap feature with `feature.md` and 48 story files (English, Given/When/Then, new IDs with the concept prefix); 13 concept drafts with feature goal and one requirement per acceptance criterion, stage `concept` in `ROADMAP.md`. On GitLab the issues #38–#85 carry the new IDs, story, and criteria. Open: every owner reviews and grills their drafts |
| 2026-10-06 | `trutscf1` — resolve the contradictions and the open inbox items | Done on `concept/user-story-work-items` — stories aligned with the R1 concept and `WORKFLOW.md` (five units in SCF-US-1, GitLab CI in SCF-US-5, changelog draft in the release MR in SCF-US-6); roles `R-4` (visitor) and `R-5` (content editor) in `GOAL.md` with ADR-0004, two stories reworded to the operator; six Sprint 1 stories cut into two slices each (#102–#107); #1–#3 labelled and linked; `README.md` with quick start and architecture overview; `.env.example` added and no longer ignored. Refused for the agent's token (HTTP 403), left in the inbox of `trutscf1`: project settings, branch protection, group epics |
| 2026-10-06 | `trutscf1` — switch the agent to a personal access token and protect the branches | Done — the token acts as `trutscf1` (Maintainer); `main`: push for no one, merge by Maintainers; `dev`: push for no one, merge by Developers and Maintainers. Not chosen: merge settings, epics (`qa-log.md`, Q14) |
| 2026-10-13 | `schwaigc` — implement #102 (SCF-US-1 slice 2, strict typing and quick start) | Done on `feature/102-strict-typing-and-quick-start` — Biome reports `any` as an error (it was only a warning), the web unit extends the shared TypeScript config and types against Node.js 24, every unit and package provides `dev`, `build`, `lint`, `typecheck`, `test` and the root runs each through Turborepo (SCF-F-12), the acceptance tests are the workspace package `@stash/tests`; the quick start of the README was already complete and is now guarded by a test (SCF-AC-1.5). Open for `trutscf1`: `scaffolding.md` has no requirement for SCF-AC-1.2 and SCF-AC-1.5 yet (`team/trutscf1/next.md`) |
| 2026-10-13 | `tschudea07` — work through the CI track: #42, #104, #44 (SCF-US-5, SCF-US-6) | Done on three stacked branches, MRs !8 (#42), !11 (#104), and the MR of #44, each with a green pipeline; merge order !8 → !11 → #44, each needs a review by another person. Pipeline: lint, typecheck, tests, build, axe, `pnpm audit`, Trivy, Gitleaks, Semgrep, commit messages; release on SemVer tags. Decisions Q22–Q33 in `qa-log.md`. Side effects: Next.js 16.3.8 (high SSRF), pnpm supply-chain settings, `.trivyignore` expiring 2026-11-23, `CHANGELOG.md` cleaned. Comment on !5: committed `.next` build output. Open: "Pipeline must succeed" needs a Maintainer; every developer runs `pre-commit install` |
