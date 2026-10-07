---
doc: roadmap
format: engineering-human/2
title: Roadmap
audience: [product, developer, reviewer, agent]
---
# Roadmap

The ordered list of features this project plans to build, for everyone who wants to know what comes next and why (P-ROAD-1). It is derived from the agreed project proposal `docs/projektantrag.md`. The order follows dependencies, not dates: features whose dependencies are met run in parallel across the four owners (handles in `team/TEAM.md`). Every entry is an intention that still goes through the concept process in [MANIFEST.md](MANIFEST.md) before anyone implements it. Only the lifecycle stage of each feature is tracked here; where work currently stands is in [ROADMAP-DETAILS.md](ROADMAP-DETAILS.md).

Versions are assigned at sprint planning: one sprint = one release `v0.<sprint>.0` (`WORKFLOW.md`, "Sprints and time budget").

## Capacity

4 people × 4 h per week × 27 weeks (2026-09-30 … 2027-04-06) = 432 h at most; minus about 5 holiday weeks ≈ **350 h**, which also covers reviews, concept work, documentation, and the presentation.

Rough effort estimate (to be refined per concept): R1 61 h (issue breakdown in `concepts/scaffolding.md` §15), R2 30, R3 45, R4 40, R5 40, R6 40, R7 40, R8 15, R9 40, R10 25, R11 25, R12 60, R13 15, R14 15 — **≈ 490 h in total, about 1.4 × the capacity**. The team prioritizes the items (must / should / could) before Sprint 2 planning; items that do not fit become deviations from the proposal and are presented as such.

## Overview

*Ref* is the short name other rows and documents use for a feature (`R1`); `O1` and `O2` are the optional extensions of the project proposal, outside the mandatory scope. R14 is blocked until a server and a domain exist.

| Version | Feature | Serves | Status | Depends on | Feasibility | Owner | Ref |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0.1.0 | Scaffolding & shared contracts | G-1.S1 (self-hosting) | in progress | – | high | trutscf1 | R1 |
| – | Observability baseline | G-1 (on their own server) | concept | R1 | medium | trutscf1 | R2 |
| – | Identity: accounts, external login, MFA | G-1 (data under their control) | concept | R1 | high | tschudea07 | R3 |
| – | Design system & accessibility modes | G-1.S2 (accessibility) | concept | R1 | medium | schwaigc | R4 |
| – | Storage core: folders, resumable upload, deduplication | G-1 (store and organize files) | concept | R3 | medium | schauby1 | R5 |
| – | Web client: dashboard, file browser, preview | G-1 (organize and use files) | concept | R4, R5 | medium | schwaigc | R6 |
| – | Teams, roles, inherited permissions, quotas, audit log | G-1 (share; data under their control) | concept | R3, R5 | medium | tschudea07 | R7 |
| – | Share links with password and expiry | G-1 (share files) | concept | R7 | high | tschudea07 | R8 |
| – | Background processing: thumbnails, virus scan, OCR, scheduled jobs | G-1 (store and search files) | concept | R5 | medium | schauby1 | R9 |
| – | Full-text search | G-1 (search files) | concept | R7, R9 | medium | schauby1 | R10 |
| – | Public content: landing page, help center, changelog, legal pages | G-1.S3 (scope of the project application) | concept | R1 | high | trutscf1 | R11 |
| – | Offline mode: installable web app with sync and conflict handling | G-1 (use files offline) | concept | R6, R7 | low | trutscf1 | R12 |
| – | Load tests & operations dashboards | G-1 (on their own server) | concept | R2, R5, R9 | medium | trutscf1 | R13 |
| – | Deployment: automatic deploy on push to `main`, TLS | G-1.S1 (self-hosting) | concept | R1 | high | tschudea07 | R14 |
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
