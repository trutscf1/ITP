# Roadmap

Ordered backlog of pre-concept feature intentions (P-ROAD-1), derived from the agreed project proposal `docs/projektantrag.md`. Order encodes dependencies, not dates: features whose dependencies are met run in parallel across the four owners. Every entry goes through the phases in [MANIFEST.md](MANIFEST.md) before implementation. Status lives in [ROADMAP-DETAILS.md](ROADMAP-DETAILS.md).

Versions are assigned at sprint planning: one sprint = one release `v0.<sprint>.0` (`WORKFLOW.md`, "Sprints and time budget").

## Capacity

4 people × 4 h per week × 27 weeks (2026-09-30 … 2027-04-06) = 432 h at most; minus about 5 holiday weeks ≈ **350 h**, which also covers reviews, concept work, documentation, and the presentation.

Rough effort estimate (to be refined per concept): R1 61 h (issue breakdown in `concepts/scaffolding.md` §15), R2 30, R3 45, R4 40, R5 40, R6 40, R7 40, R8 15, R9 40, R10 25, R11 25, R12 60, R13 15, R14 15 — **≈ 490 h in total, about 1.4 × the capacity**. The team prioritizes the items (must / should / could) before Sprint 2 planning; items that do not fit become deviations from the proposal and are presented as such.

| # | Version | Feature | Status | Depends on | Feasibility |
| --- | --- | --- | --- | --- | --- |
| R1 | 0.1.0 | Scaffolding & shared contracts | concept (`concepts/scaffolding.md`) | – | High |
| R2 | – | Observability baseline | pre-concept | R1 | Medium |
| R3 | – | Identity: accounts, external login, MFA | pre-concept | R1 | High |
| R4 | – | Design system & accessibility modes | pre-concept | R1 | Medium |
| R5 | – | Storage core: folders, resumable upload, deduplication | pre-concept | R3 | Medium |
| R6 | – | Web client: dashboard, file browser, preview | pre-concept | R4, R5 | Medium |
| R7 | – | Teams, roles, inherited permissions, quotas, audit log | pre-concept | R3, R5 | Medium |
| R8 | – | Share links with password and expiry | pre-concept | R7 | High |
| R9 | – | Background processing: thumbnails, virus scan, OCR, scheduled jobs | pre-concept | R5 | Medium |
| R10 | – | Full-text search | pre-concept | R7, R9 | Medium |
| R11 | – | Public content: landing page, help center, changelog, legal pages | pre-concept | R1 | High |
| R12 | – | Offline mode: installable web app with sync and conflict handling | pre-concept | R6, R7 | Low |
| R13 | – | Load tests & operations dashboards | pre-concept | R2, R5, R9 | Medium |
| R14 | – | Deployment: automatic deploy on push to `main`, TLS | pre-concept, blocked: no server and domain | R1 | High |
| O1 | – | *Optional:* end-to-end encryption | out of mandatory scope | R5, R12 | Low |
| O2 | – | *Optional:* Kubernetes (k3s) operation | out of mandatory scope | R1 | Medium |

## Feature notes

**R1 — Scaffolding & shared contracts** (shared). Monorepo with the four areas, shared contract package for request/response schemas and the generated API description, one-command local start, CI with lint and tests, pre-commit security hooks (`docs/security_next_js.md`), ER diagram for the relational schema. Creates `documentation/STACK.md`. Risk: many services in the local stack; the app must still start without internet access (school rule).

**R2 — Observability baseline** (Fabian). Metrics, logs, and traces from every service into one dashboard stack, set up early so every later feature is instrumented from its first slice. Risk: four extra operational services.

**R3 — Identity** (Andreas). Registration and login by e-mail, external login via GitHub, Google, Microsoft, MFA via TOTP and passkeys. Own user table 1:1 with the auth library's table, rate limiting, bot protection, secure password hashing (school rules). Risk: external login and bot protection need internet, so both must be switchable off by configuration for offline start.

**R4 — Design system & accessibility modes** (Christopher). Design tokens with four UI systems; screen reader support, keyboard operation, high contrast, color-blind modes, reduced motion (WCAG). Risk: themes × modes form a large test matrix; automated accessibility checks in CI are required.

**R5 — Storage core** (Yannick). Folder structure, upload/download, chunked upload resumable after connection loss, deduplication by content hash. Risk: deduplication needs reference counting so a delete never removes content still referenced elsewhere.

**R6 — Web client** (Christopher). Dashboard, file browser, file preview; end-to-end tests.

**R7 — Teams & permissions** (Andreas). Teams with roles, folder permissions inherited down the tree, storage quotas, audit log. Risk: inheritance rules (override, revoke, move between folders) need worked examples before implementation.

**R8 — Share links** (Andreas). Public links with optional password and expiry date.

**R9 — Background processing** (Yannick). Thumbnails, virus scan, OCR, scheduled jobs through a job queue. Risk: each processor is a separate heavy service; CI mocks them at the capability boundary (MANIFEST Phase 6).

**R10 — Full-text search** (Yannick). Search over file names, metadata, and OCR text; results respect R7 permissions.

**R11 — Public content** (Fabian). Landing page, help center, changelog maintained in a headless CMS; legal pages (Impressum, AGB, Datenschutz) reachable without login (school rule).

**R12 — Offline mode** (Fabian). Installable web app, offline availability of selected files, sync and conflict handling. Highest risk in the mandatory scope: the conflict rules must be fixed in the concept document before any code (e.g. which version wins, how a conflicting copy is named).

**R13 — Load tests** (Fabian). Load tests against upload, download, and search; findings visible in the R2 dashboards.

**R14 — Deployment** (Andreas, CI/CD). Automatic deployment of the whole stack on push to `main` to the team's own server, TLS through the reverse proxy (school requirement, `docs/anforderungen_software_projekte.md`). Blocked until server and domain exist.
