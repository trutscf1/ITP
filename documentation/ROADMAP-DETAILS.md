---
doc: roadmap-details
format: engineering-human/2
title: Roadmap details
audience: [developer, reviewer, agent]
---
# Roadmap Details

Where the project stands right now, for anyone starting a work session — human or agent (P-ROAD-2). It is the single status entry point: it must be precise enough that a fresh session needs no chat history. Other documents link here and never copy this status.

## Current positions (solo mode)

| Feature | Concept document | Phase | Branch | MR | Next step |
| --- | --- | --- | --- | --- | --- |
| Scaffolding & shared contracts (R1) | [concepts/scaffolding.md](concepts/scaffolding.md) (legacy format) | 6, test concept | — | — | Migrate the concept with `/engineering-human migrate scaffolding`, then write the test concept |
| Migration to `engineering-human` | [adr/0002-adopt-engineering-human.md](adr/0002-adopt-engineering-human.md) | — | `concept/migrate-engineering-human` | MR into `dev`, opened 2026-10-06 | Review and merge of the migration MR by a person other than the author |

Details behind the rows:

- **Branches (2026-10-06)**: `main` exists on `origin`. `dev` (created from `main`) and `concept/migrate-engineering-human` with the migration to `engineering-human` were pushed on 2026-10-06.
- **Team**: four members, areas per `docs/projektantrag.md`.
- **Concept phase**: R1 concept `concepts/scaffolding.md` written: requirements, decisions Q1–Q11, work split into slices S0–S6 (§15). Q12 decided; Phase 4 signed off 2026-09-29 by Fabian Trutschnig. Open: Phase 6 test concept (worked examples 1–5 are the first cases); R1 is split into four tracks with exclusive paths (`concepts/scaffolding.md` §15, Q13): Platform & cms (Fabian: #4, #5, #6, #18, #19, #21, #22), Contracts, storage & worker (Yannick: #7, #8, #12, #13), Identity & CI (Andreas: #9, #10, #11, #17), Web (Christopher: #15, #16); Sprint 2: #14, #20 (Fabian). Plan files `concepts/scaffolding.track-*.md`, `STACK.md` with one section per track. Pre-existing #1, #3 have no milestone; #2 Corporate Identity was put into Sprint 1 by the team without estimate.
- **GitLab issues (2026-09-29, on request): #4–#37 deleted permanently; only #1–#3 (created by the team) remain. Issue numbers below and in `concepts/scaffolding.md` §15 / the track files refer to the deleted issues.**
- **Concept issues (deleted)** (one per roadmap item, `ready-for-human`): R2 #23, R3 #24, R4 #25 (Sprint 1), R5 #26 (Sprint 1), R6 #27, R7 #28, R8 #29, R9 #30, R10 #31, R11 #32, R12 #33, R13 #34, R14 #35, O1 #36, O2 #37 (optional, `needs-triage`, unassigned). Unscheduled ones get a sprint at Sprint 2 planning after the must/should/could prioritization.
- **Time frame**: 4 h per person per week; Sprint 1 runs 2026-09-30 … 2026-10-27 (last merge to `main` 2026-10-26); final submission 2027-04-06 (`WORKFLOW.md`). R2–R14 pre-concept.
- **R1 next step**: slice S0 (all four together) creates `STACK.md` and the module specifications; then S1–S5 in parallel.
- **GitLab user stories (2026-10-06)**: #38–#85 are the user stories US-01…US-48 (created by Fabian, weight = story points, no milestone, no time estimate). Each is assigned to the person named under "Verantwortlich" in its description (Andreas 15, Yannick 12, Christopher 7, Fabian 10; US-01, US-02, US-03, US-48 to all four) and carries `type::story` (US-48: `type::documentation`), `priority::` from its description, an `area::` label, and `status::backlog` (US-01 and US-48, which have no dependencies: `status::ready`). #1–#3 have no `type::` / `status::` label yet.
- **Sprint 1 plan (2026-10-06)**: budget 12 h per person until the sprint end, 1 story point counted as 1 h, shared stories split evenly (4 h each). In milestone Sprint 1 with `status::ready` and time estimate = weight: shared US-01 #38, US-02 #39, US-03 #40, US-48 #85; Andreas US-05 #42, US-07 #44 (11 h); Yannick US-19 #56, US-25 #62 (12 h); Christopher US-31 #68 (9 h); Fabian US-41 #78, US-44 #81 (11 h). The remaining hours go to #2 Corporate Identity (Christopher, Andreas; no estimate) and #1 Projektmanagement (Fabian). Seven of these stories are above the 4 h issue limit of `WORKFLOW.md` and are not split yet.
- **GitLab board and labels (2026-10-06)**: board "Kanban" with the columns Backlog, Ready, In Progress, Review, Done. The labels on GitLab match `WORKFLOW.md` ("Labels"). Unused leftovers, not deleted: `feature`, `bug`, `documentation`, `ready-for-agent`, `type::technical-improvement`.
- **GitLab**: milestones Sprint 1–6 + Final exist. Project settings: default branch is still `main`, merge method `merge`, squash off by default, "delete source branch" on; protected branches and the pipeline merge check are not configured yet (`next.md`).

## Log

Append-only record of processed tasks; entries are marked done instead of being deleted.

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
| 2026-10-06 | Migrate the project from `engineering-profile` to `engineering-human` | Done on `concept/migrate-engineering-human`, MR into `dev` opened — `GOAL.md` (G-1 confirmed, roles and signals drafted), `MANIFEST.md` replaced (the old copy had no project-specific rule left), `CLAUDE.md`, `WORKFLOW.md`, `ROADMAP.md` (Serves, stages), `VERSIONING.md`, `CONTEXT.md`, `qa-log.md`, ADR-0002, ADR-0001 moved to `documentation/adr/`, `.claude/settings.json` (merge policy `ask`) with the status hook, `.gitlab/` templates replaced, `tools/doc-check.mjs`, markdown lint, CI job for the documentation checks; R1 concept and track files marked legacy. GitLab labels renamed to the `WORKFLOW.md` set (8 renamed, 7 created). Open: review and merge of the MR, team switch (`next.md`) |
