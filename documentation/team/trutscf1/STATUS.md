---
doc: status
format: engineering-human/2
title: Status of one developer
audience: [developer, agent]
handle: "trutscf1"
---
# Status — trutscf1

Session positions of one developer (P-TEAM-3). Precise enough that a fresh session — this developer's or a new owner's — can continue without chat history. The team-wide entry point is `documentation/ROADMAP-DETAILS.md`; it links here and never copies these positions.

## Current positions

| Feature | Concept document | Phase | Branch | MR | Next step |
| --- | --- | --- | --- | --- | --- |
| Scaffolding & shared contracts (R1) | [concepts/scaffolding.md](../../concepts/scaffolding.md) (legacy format) | 6, test concept | — | — | Migrate the concept with `/engineering-human migrate scaffolding`, then write the test concept |
| Scaffolding & shared contracts (R1), track Platform & cms | [concepts/scaffolding.track-platform.md](../../concepts/scaffolding.track-platform.md) | 5, architecture | — | — | Write the "Plan" section of the track file before the first MR |
| Observability baseline (R2) | [concepts/observability.md](../../concepts/observability.md) | 1, grill (draft) | — | — | Review the draft and its work items, then grill it with `/engineering-human observability` |
| Public content: landing page, help center, changelog, legal pages (R11) | [concepts/public-content.md](../../concepts/public-content.md) | 4, PM review gate (Phases 1 and 3 done 2026-10-06, Q1–Q11 and Q16–Q20; Q12–Q14 of Phase 2 open with the school management) | `concept/public-content` | — | Phase 3 is written (§11, §14, §15), committed, and pushed. Next: open the MR into `dev` for the Phase 4 gate — not opened on 2026-10-06 because `GITLAB_TOKEN` was not set in the environment (question log, Q22–Q24); the MR text is agreed (Q24) and the reviewer is `schwaigc` (Q25), because the PM approver `trutscf1` is also the author (P-MR-2). Take Q12–Q14 to the school management. Then Phase 5 (architecture) in a fresh session with `/engineering-human public-content`; the issues #78–#81 and a new issue for PUB-US-5 follow with `tickets`; tracking issue #108 |
| Offline mode: installable web app with sync and conflict handling (R12) | [concepts/offline-mode.md](../../concepts/offline-mode.md) | 1, grill (draft) | — | — | Review the draft and its work items, then grill it with `/engineering-human offline-mode` |
| Load tests & operations dashboards (R13) | [concepts/load-tests.md](../../concepts/load-tests.md) | 1, grill (draft) | — | — | Review the draft and its work items, then grill it with `/engineering-human load-tests` |

Sprint 1 (until 2026-10-26), GitLab issues: #78, #81 (shared: #38, #39, #40, #85).

## Project-wide notes

Carried over from `ROADMAP-DETAILS.md` at the switch to team mode on 2026-10-06; this developer does the project controlling.

- **Branches (2026-10-06)**: `main` exists on `origin`. `dev` holds the application scaffold pushed by `schauby1` (Next.js app in `next/`, Prisma, `docker-compose.yml`, `CHANGELOG.md`) and, since 2026-10-06, the documentation: !1 (migration, issue #86), !2 (team mode), and !3 (user stories, issue #101) were reviewed and approved by `schwaigc` and merged.
- **Team**: four members, areas per `docs/projektantrag.md`.
- **Concept phase**: R1 concept `concepts/scaffolding.md` written: requirements, decisions Q1–Q11, work split into slices S0–S6 (§15). Q12 decided; Phase 4 signed off 2026-09-29 by `trutscf1`. Open: Phase 6 test concept (worked examples 1–5 are the first cases); R1 is split into four tracks with exclusive paths (`concepts/scaffolding.md` §15, Q13): Platform & cms (`trutscf1`: #4, #5, #6, #18, #19, #21, #22), Contracts, storage & worker (`schauby1`: #7, #8, #12, #13), Identity & CI (`tschudea07`: #9, #10, #11, #17), Web (`schwaigc`: #15, #16); Sprint 2: #14, #20 (`trutscf1`). Plan files `concepts/scaffolding.track-*.md`, `STACK.md` with one section per track. Pre-existing #1, #3 have no milestone; #2 Corporate Identity was put into Sprint 1 by the team without estimate.
- **GitLab issues (2026-09-29, on request): #4–#37 deleted permanently; only #1–#3 (created by the team) remain. Issue numbers below and in `concepts/scaffolding.md` §15 / the track files refer to the deleted issues.**
- **Concept issues (deleted)** (one per roadmap item, `ready-for-human`): R2 #23, R3 #24, R4 #25 (Sprint 1), R5 #26 (Sprint 1), R6 #27, R7 #28, R8 #29, R9 #30, R10 #31, R11 #32, R12 #33, R13 #34, R14 #35, O1 #36, O2 #37 (optional, `needs-triage`, unassigned). Unscheduled ones get a sprint at Sprint 2 planning after the must/should/could prioritization.
- **Time frame**: 4 h per person per week; Sprint 1 runs 2026-09-30 … 2026-10-27 (last merge to `main` 2026-10-26); final submission 2027-04-06 (`WORKFLOW.md`). R2–R14 pre-concept.
- **R1 next step**: slice S0 (all four together) creates `STACK.md` and the module specifications; then S1–S5 in parallel.
- **GitLab user stories (2026-10-06)**: #38–#85 are the 48 user stories of the team (formerly US-01…US-48). Since 2026-10-06 each carries its new ID with the concept prefix, its story sentence, and its acceptance criteria copied from its story file in `work-items/`, and is linked to its feature issue (#87–#100). Assignee, weight, priority, and area labels are unchanged; all carry `type::story` except #85 (`type::documentation`). #1 (`type::documentation`), #2 and #3 (`type::story`) carry a type and a status label since 2026-10-06 and are linked to #85, #90, and #38.
- **Sprint 1 plan (2026-10-06)**: budget 12 h per person until the sprint end, 1 story point counted as 1 h, shared stories split evenly (4 h each). In milestone Sprint 1 with `status::ready` and time estimate = weight: shared #38, #39, #40, #85; `tschudea07` #42, #44 (11 h); `schauby1` #56, #62 (12 h); `schwaigc` #68 (9 h); `trutscf1` #78, #81 (11 h). The remaining hours go to #2 Corporate Identity (`schwaigc`, `tschudea07`; no estimate) and #1 Projektmanagement (`trutscf1`). Six of these stories had weight 5; since 2026-10-06 each is cut into two slices of at most 4 h, with the second slice as its own issue (#102–#107), as a proposal for its owner.
- **GitLab board and labels (2026-10-06)**: board "Kanban" with the columns Backlog, Ready, In Progress, Review, Done. The labels on GitLab match `WORKFLOW.md` ("Labels"). Unused leftovers, not deleted: `feature`, `bug`, `documentation`, `ready-for-agent`, `type::technical-improvement`.
- **GitLab**: milestones Sprint 1–6 + Final exist. Project settings (2026-10-06): default branch `dev`, merge method `merge`; `main` and `dev` are protected with push access for no one (`main`: merge by Maintainers, `dev`: merge by Developers and Maintainers). Still open: squash is only off by default, "delete source branch" is on, and the pipeline merge check is off (`next.md`).

## Open questions waiting for others

| Question | Waiting for (handle) | Since |
| --- | --- | --- |
| Public content Q12–Q14: operator named in the team's legal pages, lawful basis for editor accounts, review of the legal templates ([question log](../../concepts/public-content.qa-log.md)) | school management, asked by `trutscf1` | 2026-10-06 |
