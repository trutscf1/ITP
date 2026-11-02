---
doc: roadmap
format: engineering-human/2
title: Roadmap
audience: [product, developer, reviewer, agent]
---
# Roadmap

The ordered list of features this project plans to build, for everyone who wants to know what comes next and why (P-ROAD-1). It is derived from the agreed project proposal `docs/projektantrag.md`. The order follows dependencies, not dates: features whose dependencies are met run in parallel across the four owners (handles in `team/TEAM.md`). Every entry is an intention that still goes through the concept process in [MANIFEST.md](MANIFEST.md) before anyone implements it. Only the lifecycle stage of each feature is tracked here; where work currently stands is in [ROADMAP-DETAILS.md](ROADMAP-DETAILS.md).

One sprint = one release `v0.<sprint>.0`, the final release is `v1.0.0` (`WORKFLOW.md`, "Sprints and time budget"). The *Version* column names the release in which a feature is complete; its stories are spread over the sprints up to that release (chapter "Milestones").

## Capacity

Project time is **Tuesday, 200 minutes per person**, not in school holidays (`WORKFLOW.md`). A review Tuesday counts half. People write and review the documents and tests; the code is generated from them (ADR-0005). Planning factor: 1 story point = 0.75 h of human work (0.5 h documents and tests, 0.25 h review); it is corrected at sprint planning.

| Sprint | Working Tuesdays (+ half review Tuesday) | Hours per person | Points per person |
| --- | --- | --- | --- |
| 1 (rest from 2026-10-20) | 10-20, 10-27 | 6.7 | 9 |
| 2 | 11-10, 11-17 (+ 11-03) | 8.3 | 11 |
| 3 | 12-01, 12-15, 12-22 (+ 11-24) | 11.7 | 15 |
| 4 | 01-19 (+ 01-12) | 5.0 | 6 |
| 5 | 02-02, 02-16 (+ 01-26) | 8.3 | 11 |
| 6 | 03-02, 03-09 (+ 02-23) | 8.3 | 11 |
| Final | 03-30 (+ 03-16) | 5.0 | 6 (closing tasks only) |

About 53 h per person, about 213 h for the team in total; this replaces the earlier estimate of 350 h, which assumed 4 h per week. Points are hours divided by 0.75, rounded down (Sprint 1: 8.9, taken as 9), so the 69 points per person are slightly less than the 71 that 53 h would give. The planned load does **not** stay within these points: it is 21 points too high in total and much too high in Sprint 2 (chapter "Milestones", "Load per person"). The cut order below and the decisions at sprint planning have to close that gap, and every cut is a deviation from the proposal that the final presentation reports.

## Overview

*Ref* is the short name other rows and documents use for a feature (`R1`); `O1` and `O2` are the optional extensions of the project proposal, outside the mandatory scope. R14 is blocked until a server and a domain exist.

| Version | Feature | Serves | Status | Depends on | Feasibility | Owner | Ref |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0.1.0 | Scaffolding & shared contracts | G-1.S1 (self-hosting) | in progress | – | high | trutscf1 | R1 |
| 0.2.0 | Observability baseline | G-1 (on their own server) | concept | R1 | medium | trutscf1 | R2 |
| 0.3.0 | Identity: accounts, external login, MFA | G-1 (data under their control) | concept | R1 | high | tschudea07 | R3 |
| 0.2.0 | Design system & accessibility modes | G-1.S2 (accessibility) | in progress | R1 | medium | schwaigc | R4 |
| 0.4.0 | Storage core: folders, resumable upload, deduplication | G-1 (store and organize files) | concept | R3 | medium | schauby1 | R5 |
| 0.5.0 | Web client: dashboard, file browser, preview | G-1 (organize and use files) | concept | R4, R5 | medium | schwaigc | R6 |
| 0.6.0 | Teams, roles, inherited permissions, quotas, audit log | G-1 (share; data under their control) | concept | R3, R5 | medium | tschudea07 | R7 |
| 0.6.0 | Share links with password and expiry | G-1 (share files) | concept | R7 | high | tschudea07 | R8 |
| 0.6.0 | Background processing: thumbnails, virus scan, OCR, scheduled jobs | G-1 (store and search files) | concept | R5 | medium | schauby1 | R9 |
| 0.6.0 | Full-text search | G-1 (search files) | concept | R7, R9 | medium | schauby1 | R10 |
| 0.4.0 | Public content: landing page, help center, changelog, legal pages | G-1.S3 (scope of the project application) | concept | R1 | high | trutscf1 | R11 |
| 0.6.0 | Offline mode: installable web app with sync and conflict handling | G-1 (use files offline) | concept | R6, R7 | low | trutscf1 | R12 |
| 0.6.0 | Load tests & operations dashboards | G-1 (on their own server) | concept | R2, R5, R9 | medium | trutscf1 | R13 |
| 0.4.0 | Deployment: automatic deploy on push to `main`, TLS | G-1.S1 (self-hosting) | concept | R1 | high | tschudea07 | R14 |
| – | End-to-end encryption | G-1 (data under their control) | idea | R5, R12 | low | — | O1 |
| – | Kubernetes (k3s) operation | G-1.S1 (self-hosting) | idea | R1 | medium | — | O2 |

*Serves* names the part of the project goal in [GOAL.md](GOAL.md) this feature advances. A feature that serves no part of the goal does not belong here (P-GOAL-2).

*Status* is one of these stages (P-ROAD-1) and is updated at every phase boundary, merge, and release (P-ROAD-4):

| Stage | Meaning |
| --- | --- |
| idea | Listed, no concept document yet |
| concept | Concept document in Phases 1–6 |
| ready | Concept approved, issues cut, nothing merged yet |
| in progress | At least one issue being implemented or merged, not all |
| in dev | All stories merged into `dev`, not yet released |
| released | Part of a release tag on `main` |

## Feature notes

**R1 — Scaffolding & shared contracts** (shared). Monorepo with the four areas, shared contract package for request/response schemas and the generated API description, one-command local start, CI with lint and tests, pre-commit security hooks (`docs/security_next_js.md`), ER diagram for the relational schema. Creates `documentation/STACK.md`. Risk: many services in the local stack; the app must still start without internet access (school rule).

**R2 — Observability baseline** (`trutscf1`). Metrics, logs, and traces from every service into one dashboard stack, set up early so every later feature is instrumented from its first slice. Risk: four extra operational services.

**R3 — Identity** (`tschudea07`). Registration and login by e-mail, external login via GitHub, Google, Microsoft, MFA via TOTP and passkeys. Own user table 1:1 with the auth library's table, rate limiting, bot protection, secure password hashing (school rules). Risk: external login and bot protection need internet, so both must be switchable off by configuration for offline start.

**R4 — Design system & accessibility modes** (`schwaigc`). Design tokens with four UI systems; screen reader support, keyboard operation, high contrast, color-blind modes, reduced motion (WCAG). Risk: themes × modes form a large test matrix; automated accessibility checks in CI are required.

**R5 — Storage core** (`schauby1`). Folder structure, upload/download, chunked upload resumable after connection loss, deduplication by content hash. Risk: deduplication needs reference counting so a delete never removes content still referenced elsewhere.

**R6 — Web client** (`schwaigc`). Dashboard, file browser, file preview; end-to-end tests.

**R7 — Teams & permissions** (`tschudea07`). Teams with roles, folder permissions inherited down the tree, storage quotas, audit log. Risk: inheritance rules (override, revoke, move between folders) need worked examples before implementation.

**R8 — Share links** (`tschudea07`). Public links with optional password and expiry date.

**R9 — Background processing** (`schauby1`). Thumbnails, virus scan, OCR, scheduled jobs through a job queue. Risk: each processor is a separate heavy service; CI mocks them at the capability boundary (MANIFEST Phase 6).

**R10 — Full-text search** (`schauby1`). Search over file names, metadata, and OCR text; results respect R7 permissions.

**R11 — Public content** (`trutscf1`). Landing page, help center, changelog maintained in a headless CMS; legal pages (Impressum, AGB, Datenschutz) reachable without login (school rule).

**R12 — Offline mode** (`trutscf1`). Installable web app, offline availability of selected files, sync and conflict handling. Highest risk in the mandatory scope: the conflict rules must be fixed in the concept document before any code (e.g. which version wins, how a conflicting copy is named).

**R13 — Load tests** (`trutscf1`). Load tests against upload, download, and search; findings visible in the R2 dashboards.

**R14 — Deployment** (`tschudea07`, CI/CD). Automatic deployment of the whole stack on push to `main` to the team's own server, TLS through the reverse proxy (school requirement, `docs/anforderungen_software_projekte.md`). Blocked until server and domain exist.

## Milestones

What must be finished when each milestone ends. A milestone is one sprint and one GitLab milestone; the text below is copied into the milestone description on GitLab. Due dates and review dates are in `WORKFLOW.md`. The cycle is the same every sprint (`WORKFLOW.md`, "Sprint cycle"): concept `ready`, tests first, code generated from the documents, review, release MR, regeneration probe.

**Exit criteria for every milestone:**

- All listed stories are `status::done`; each acceptance criterion is shown by a passing test carrying its `AC` ID.
- The concept documents of the listed features are `ready` (phases 1–6 incl. §17) and the issues are cut before code is generated.
- The pipeline on `dev` is green and `node tools/doc-check.mjs` reports nothing new.
- The release MR is merged by the due date, the tag is set, `CHANGELOG.md` lists the closed stories.
- The regeneration probe of the sprint is done and logged in `ROADMAP-DETAILS.md`.
- Status is current (`ROADMAP.md`, `team/<handle>/STATUS.md`).

| Milestone | Release | Result for users | Stories by owner (GitLab issues) | Probe feature |
| --- | --- | --- | --- | --- |
| Sprint 1 | `v0.1.0` | Foundation of what is already under review: `docker compose up` starts all five units; CI with quality and security checks; shared contracts; data model; design tokens; documentation and Definition of Done. R1 complete | R1 complete, SCF-US-1…8 (shared #38–#40, #85, #103; `tschudea07` #41); `schwaigc` DSA-US-1 (#68, #106); concept R1 and the Web track (#111, #113); `trutscf1` concept Public content (#108) | R1, contracts (SCF-US-3) |
| Sprint 2 | `v0.2.0` | Register and log in; folders and upload; telemetry visible; accessibility modes | carried over from Sprint 1 (Q195): `schauby1` STO-US-1 (#56, #105), `trutscf1` PUB-US-1, -4 (#78, #81, #107), concepts R4 (`schwaigc`, #116) and R5 (`schauby1`, #117); `tschudea07` IDN-US-1, -2, -6 (#45, #46, #50); `schauby1` STO-US-2, -5 (#57, #60); `schwaigc` DSA-US-2, -3 (#71, #72); `trutscf1` OBS-US-1, -2 (#82, #83) and the `AC-TEST` rule of `doc-check` | IDN-US-1 |
| Sprint 3 | `v0.3.0` | Login complete (OAuth, TOTP, passkeys); teams with roles; resumable large uploads, trash, download; file browser; account settings; landing page; help center and changelog | `tschudea07` IDN-US-3, -4, -5, TPM-US-1 (#47, #48, #49, #51); `schauby1` STO-US-3, -6, -7 (#58, #61, #62); `schwaigc` WEB-US-1, -3 (#69, #73), SCF-US-7 slice 2 ER diagram (#109) and Corporate Identity (#2, with `tschudea07`), both carried over from Sprint 1; `trutscf1` PUB-US-2, -3 (#79, #80), concept R12 with the conflict rules | STO-US-3 |
| Sprint 4 | `v0.4.0` | Deduplication; file preview; installable app; storage quotas (stand-in for the deployment, which is blocked until server and domain exist) | `tschudea07` concept R14 (#125), TPM-US-3 (#54) as stand-in for DEP-US-1 (#43, blocked); `schauby1` concept R9 (#121), STO-US-4 (#59); `schwaigc` WEB-US-2 (#70); `trutscf1` OFF-US-1 (#75) | STO-US-4 |
| Sprint 5 | `v0.5.0` | Inherited permissions; job queue and text recognition; files available offline; theme saved in the profile; end-to-end tests; accessibility audit | `tschudea07` TPM-US-2 (#52); `schauby1` BGP-US-1, -4 (#63, #66); `schwaigc` WEB-US-4 (#74), DSA-US-1 slice 3 (#112), accessibility audit of themes × modes; `trutscf1` OFF-US-2 (#76), concept R13 (#124) | TPM-US-2 |
| Sprint 6 | `v0.6.0` | Share links; audit log; virus scan and thumbnails; full-text search; offline sync with conflicts; load tests | `tschudea07` SHR-US-1, TPM-US-4 (#53, #55); `schauby1` BGP-US-2, -3, SRC-US-1 (#64, #65, #67); `schwaigc` polish and offline UI states; `trutscf1` OFF-US-3, LDT-US-1 (#77, #84) | SHR-US-1 |
| Final | `v1.0.0` | No new features. Submission state of `main`, final presentation | Closing tasks for all four: slides (`schwaigc`, #142), report of deviations from the proposal (`trutscf1`, #143), demo script (`tschudea07`, #144), whole-project regeneration probe (`schauby1`, #145), freeze and release (all, #146). The presentation must contain what `docs/anforderungen_software_projekte.md` ("Präsentation") requires: the agreed goals and every deviation; hours per person in relation to what was achieved (from the GitLab time tracking, in the report #143); the share in percent each person contributed to the result (report #143, agreed by all four); a résumé; the database model (the ER diagram of #109, in the slides #142); a live presentation of the product (#144). Every person speaks at most 10 minutes; the slides are timed to 4 × 10 minutes and rehearsed once in the last working lesson (#142, #146) | whole project |

Order of the stories: the code of a sprint is generated at its end, so a story that builds on another story is planned in a later sprint than that story. Hence DSA-US-1 slice 3 "Theme in the profile" (#112) follows WEB-US-3 account settings (#73) in Sprint 5, and OFF-US-1 (#75, installable app) follows WEB-US-1 and TPM-US-1 in Sprint 4. Still open: STO-US-2 and STO-US-5 need a login (IDN-US-1, -2), and all are in Sprint 2; the concept of R5 (#117) must settle how the storage tests get a user.

Sprint 4 has one working Tuesday (2027-01-19, 5 h, 6 points per person, 24 for the team) and the row above lists what fits: release and probe (4 points) and the concepts R9 and R14 take 10 of the 24 before any story starts. **DEP-US-1 (#43, 5 points) is blocked** until the team has a server and a domain (R14); it stays in Sprint 4 only if both exist at Sprint 4 planning. Fallback: TPM-US-3 quotas (#54, 3 points, builds on TPM-US-1 of Sprint 3) is done in its place, and DEP-US-1 moves to the first sprint after the server exists. If the server exists, `tschudea07` has 8 of 6 points. Even with the fallback `schauby1` (8 of 6) and `schwaigc` (7 of 6) are over capacity in Sprint 4; STO-US-4 and WEB-US-2 are sliced to what fits at sprint planning.

Concept, release, and probe issues of every sprint (#114–#125 concepts, #126–#137 releases and probes) are not listed in the rows above, except where a concept moved; they are planned in the sprint of their GitLab milestone and count in the load below.

**Load per person** in points (planned / capacity), Sprint 1 to 6 and Final, as of 2026-10-20 with the order of the rows above; the Sprint 2 and Sprint 3 cells of `schwaigc` recounted on 2026-11-02, because #109 is in Sprint 3 on GitLab (review of !21). Counted are the weights of all open GitLab issues of the milestone, including concept, release, probe, and closing issues; an issue with several assignees (the shared stories #39, #40, #85, #103 and #146) is split evenly; unweighted issues (#2, #3, epics) and closed issues are not counted. A story that is only waiting for review still counts in full, so Sprint 1 is slightly overstated.

| Person | Sprint 1 | Sprint 2 | Sprint 3 | Sprint 4 | Sprint 5 | Sprint 6 | Final | Total |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `trutscf1` | 10.5 / 9 | 21 / 11 | 9 / 15 | 5 / 6 | 11 / 11 | 13 / 11 | 3.5 / 6 | 73 / 69 |
| `tschudea07` | 7.5 / 9 | 15 / 11 | 19 / 15 | 6 / 6 | 13 / 11 | 8 / 11 | 3.5 / 6 | 72 / 69 |
| `schauby1` | 4.5 / 9 | 18 / 11 | 16 / 15 | 8 / 6 | 15 / 11 | 11 / 11 | 5.5 / 6 | 78 / 69 |
| `schwaigc` | 8.5 / 9 | 15 / 11 | 17 / 15 | 7 / 6 | 11 / 11 | 10 / 11 | 5.5 / 6 | 74 / 69 |

**The plan is over capacity.** The team plans 297 points against 276 (4 × 69), 21 points or 8 % too much. Sprint 2 is the worst: 69 points against 44, so every person is over (`trutscf1` by 10, `schauby1` by 7, `schwaigc` by 4, `tschudea07` by 4), mostly because the stories carried over from Sprint 1 (Q195) and the four concepts R2 to R5 land there. Also over: Sprint 1 (`trutscf1` by 1.5), Sprint 3 (`tschudea07` by 4, `schwaigc` by 2, `schauby1` by 1), Sprint 4 (`schauby1` by 2, `schwaigc` by 1), Sprint 5 (`schauby1` by 4, `tschudea07` by 2), and Sprint 6 (`trutscf1` by 2). The cut order below removes 19 points at most (LDT-US-1, BGP-US-3, OFF-US-3, WEB-US-3) and helps only Sprints 3 and 6; the overload of Sprints 2 and 5 has to be decided at sprint planning, by moving a story to a later sprint or by cutting its slices, and every such cut is reported as a deviation from the proposal.

**The overload of Sprint 2 is decided at Sprint 2 planning**, in the review of Sprint 1 on 2026-11-03 (`WORKFLOW.md`, "Sprints"); until then the GitLab milestones stay as they are. The rule is Q198: a story moves to a later sprint rather than being cut. One option on the table: `schwaigc` offered to move DSA-US-3 (#72, R4 slice work) to Sprint 3 (review of !15, 2026-10-20), which lowers the Sprint 2 load of `schwaigc` but adds to Sprint 3, where `schwaigc` is already 2 points over.

**Cut order** if capacity runs out: LDT-US-1 → BGP-US-3 → OFF-US-3 → WEB-US-3. Dependencies are respected: R3, R4 → R5 → R6; R3, R5 → R7 → R8; R5 → R9; R7, R9 → R10; R6, R7 → R12; R2, R5, R9 → R13.
