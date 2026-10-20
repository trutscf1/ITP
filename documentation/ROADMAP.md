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
| Final | 03-30 (+ 03-16) | 5.0 | 0 (closing tasks only) |

About 53 h per person, about 213 h for the team in total; this replaces the earlier estimate of 350 h, which assumed 4 h per week. The planned load stays within the points per sprint (chapter "Milestones"); if it does not fit, the cut order below applies and every cut is a deviation from the proposal that the final presentation reports.

## Overview

*Ref* is the short name other rows and documents use for a feature (`R1`); `O1` and `O2` are the optional extensions of the project proposal, outside the mandatory scope. R14 is blocked until a server and a domain exist.

| Version | Feature | Serves | Status | Depends on | Feasibility | Owner | Ref |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0.1.0 | Scaffolding & shared contracts | G-1.S1 (self-hosting) | in progress | – | high | trutscf1 | R1 |
| 0.2.0 | Observability baseline | G-1 (on their own server) | concept | R1 | medium | trutscf1 | R2 |
| 0.3.0 | Identity: accounts, external login, MFA | G-1 (data under their control) | concept | R1 | high | tschudea07 | R3 |
| 0.2.0 | Design system & accessibility modes | G-1.S2 (accessibility) | concept | R1 | medium | schwaigc | R4 |
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
| Sprint 2 | `v0.2.0` | Register and log in; folders and upload; telemetry visible; accessibility modes | carried over from Sprint 1 (Q38): `schauby1` STO-US-1 (#56, #105), `trutscf1` PUB-US-1, -4 (#78, #81, #107), `schwaigc` DSA-US-1 slice 3 (#112), SCF-US-7 slice (#109), Corporate Identity (#2), concepts R4 and R5; `tschudea07` IDN-US-1, -2, -6 (#45, #46, #50); `schauby1` STO-US-2, -5 (#57, #60); `schwaigc` DSA-US-2, -3 (#71, #72); `trutscf1` OBS-US-1, -2 (#82, #83) and the `AC-TEST` rule of `doc-check` | IDN-US-1 |
| Sprint 3 | `v0.3.0` | Login complete (OAuth, TOTP, passkeys); teams with roles; resumable large uploads, trash, download; file browser; account settings; installable app; landing page | `tschudea07` IDN-US-3, -4, -5, TPM-US-1 (#47, #48, #49, #51); `schauby1` STO-US-3, -6, -7 (#58, #61, #62); `schwaigc` WEB-US-1, -3 (#69, #73); `trutscf1` PUB-US-2, OFF-US-1 (#79, #75), concept R12 with the conflict rules | STO-US-3 |
| Sprint 4 | `v0.4.0` | Deduplication; file preview; help center and changelog; deployment if server and domain exist (otherwise TPM-US-3 and -4 move here) | `tschudea07` DEP-US-1 (#43); `schauby1` STO-US-4 (#59); `schwaigc` WEB-US-2 (#70); `trutscf1` PUB-US-3 (#80), concept R13 | STO-US-4 |
| Sprint 5 | `v0.5.0` | Inherited permissions and quotas; job queue and text recognition; files available offline; end-to-end tests; accessibility audit | `tschudea07` TPM-US-2, -3 (#52, #54); `schauby1` BGP-US-1, -4 (#63, #66); `schwaigc` WEB-US-4 (#74), accessibility audit of themes × modes; `trutscf1` OFF-US-2 (#76) | TPM-US-2 |
| Sprint 6 | `v0.6.0` | Share links; audit log; virus scan and thumbnails; full-text search; offline sync with conflicts; load tests | `tschudea07` SHR-US-1, TPM-US-4 (#53, #55); `schauby1` BGP-US-2, -3, SRC-US-1 (#64, #65, #67); `schwaigc` polish and offline UI states; `trutscf1` OFF-US-3, LDT-US-1 (#77, #84) | SHR-US-1 |
| Final | `v1.0.0` | No new features. Submission state of `main`, final presentation | Closing tasks for all four: slides (`schwaigc`), report of deviations from the proposal (`trutscf1`), demo script (`tschudea07`), whole-project regeneration probe (`schauby1`), freeze and release (all) | whole project |

Load per person in points (planned / capacity): `trutscf1` 7 / 9, 11 / 11, 9 / 15, 5 / 6, 8 / 11, 11 / 11; `tschudea07` 5 / 9, 10 / 11, 14 / 15, 5 / 6, 11 / 11, 8 / 11; `schauby1` 5 / 9, 10 / 11, 14 / 15, 5 / 6, 10 / 11, 11 / 11; `schwaigc` 7 / 9, 10 / 11, 13 / 15, 5 / 6, 10 / 11, 8 / 11 (Sprint 1 to 6, in order).

Since Q38 (2026-10-20) Sprint 1 keeps only what is begun or under review plus the R1 core; the carried-over stories put Sprint 2 about 16 points over its capacity, so the cut order below applies from Sprint 2 on.

**Cut order** if capacity runs out: LDT-US-1 → BGP-US-3 → OFF-US-3 → WEB-US-3. Dependencies are respected: R3, R4 → R5 → R6; R3, R5 → R7 → R8; R5 → R9; R7, R9 → R10; R6, R7 → R12; R2, R5, R9 → R13.
