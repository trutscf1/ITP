---
doc: stack
format: engineering-human/2
title: Stack document
audience: [developer, agent]
---
# Stack Document

The single place where technology lives, for developers and agents turning the stack-neutral concept documents into code (P-DES-4). It names technology freely but holds no requirement, business rule, or behavior — those belong in a concept document.

## 0. In Plain Words

The system is planned as one repository written in TypeScript, with five separately running units behind a reverse proxy and a relational database, all started together in containers. The project proposal (`docs/projektantrag.md`) names the planned technology, and the school sets minimum versions. Most concrete choices are still open: each track's owner fills in their section below before their first merge request.

## Sections per track

The single place where technology and version constraints live (`MANIFEST.md`, "The Stack Document"). **Split into one section per track** (`concepts/scaffolding.md` §16, Q13): only the section's owner edits it. Minimum versions required by the school: `docs/anforderungen_software_projekte.md` ("Projektanforderungen für projekte"); technology agreed in the proposal: `docs/projektantrag.md`.

Every row traces to the capability IDs (`SCF-C-x`, later other prefixes) that demand it.

## Capability index

Every capability of `concepts/scaffolding.md` §7, `concepts/public-content.md` §7, `concepts/observability.md` §7, and `concepts/identity.md` §7 and where its technology stands. The index only points to the track sections; it holds no technology of its own, except the capabilities added on 2026-10-13 that no section maps yet. Their owner moves the row into the own section when the technology is chosen.

| ID | Capability | Technology | Owner |
| --- | --- | --- | --- |
| SCF-C-1 | Workspace and task runner | section 1 | `trutscf1` |
| SCF-C-2 | Schemas | section 2 | `schauby1` |
| SCF-C-3 | Web application framework | section 4 | `schwaigc` |
| SCF-C-4 | HTTP server framework | sections 2 and 3 (`identity`: Hono) | `schauby1`, `tschudea07` |
| SCF-C-5 | Content management system | section 1 | `trutscf1` |
| SCF-C-6 | Reverse proxy | section 1 | `trutscf1` |
| SCF-C-7 | Container runtime | section 1 | `trutscf1` |
| SCF-C-8 | Relational database | section 1 | `trutscf1` |
| SCF-C-9 | CI service | section 3 | `tschudea07` |
| SCF-C-10 | Scanners | section 3 | `tschudea07` |
| SCF-C-11 | Commit message linter | section 3 | `tschudea07` |
| SCF-C-12 | Changelog draft generator | section 1 | `trutscf1` |
| SCF-C-13 | Test runners | sections 1 and 4 | `trutscf1`, `schwaigc` |
| SCF-C-14 | Key-value store | _open_ — Redis per the project proposal | `schauby1` |
| SCF-C-15 | Document database | _open_ — MongoDB per the project proposal | `schauby1` |
| SCF-C-16 | Sync database | _open_ — CouchDB per the project proposal | `trutscf1` |
| SCF-C-17 | Object storage | _open_ — SeaweedFS per the project proposal | `schauby1` |
| SCF-C-18 | Virus scanner | _open_ — ClamAV per `SCF-AC-2.1` | `schauby1` |
| SCF-C-19 | Database access layer | section 3 (row "Database access layer") | `tschudea07` |
| SCF-C-20 | Accessibility checker | section 3 (row "Accessibility check in CI") | `tschudea07` |
| SCF-C-21 | Data model diagram tool | section 3 (row "Data model diagram tool") | `tschudea07` |
| PUB-C-1 | Localized content management | to be chosen by the owner; builds on SCF-C-5 (section 1) | `trutscf1` |
| PUB-C-2 | Password hashing | to be chosen by the owner | `trutscf1` |
| PUB-C-3 | Safe rich text rendering | to be chosen by the owner | `trutscf1` |
| PUB-C-4 | Accessibility check of public pages | section 3 (SCF-C-20, row "Accessibility check in CI"); the pages are added by the owner of `web` | `tschudea07` |
| OBS-C-1 | Instrumentation library | section 1 | `trutscf1` |
| OBS-C-2 | Telemetry collector | section 1 | `trutscf1` |
| OBS-C-3 | Metric store | section 1 | `trutscf1` |
| OBS-C-4 | Log store | section 1 | `trutscf1` |
| OBS-C-5 | Trace store | section 1 | `trutscf1` |
| OBS-C-6 | Dashboard tool | section 1 | `trutscf1` |
| OBS-C-7 | Session check in the reverse proxy | section 1 | `trutscf1` |
| IDN-C-1 | Authentication library | section 3 | `tschudea07` |
| IDN-C-2 | Password hash | section 3 | `tschudea07` |
| IDN-C-3 | Shared schema library | section 3 | `tschudea07` |
| IDN-C-4 | Form library | section 3 | `tschudea07` |
| IDN-C-5 | Bot check | section 3 | `tschudea07` |
| IDN-C-6 | Session store | section 3 | `tschudea07` |
| IDN-C-7 | HTTP server framework (`identity`) | section 3 | `tschudea07` |
| IDN-C-8 | E-mail delivery | section 3 | `tschudea07` |

## 1. Platform — `trutscf1`

| Capability | Technology | Version constraint | Notes |
| --- | --- | --- | --- |
| Runtime & language | Node.js, TypeScript (strict, no `any`) | Node.js 24 LTS ≥ 24.14.0 (`.tool-versions`, `engines`); TypeScript 5 | School minimum (`docs/anforderungen_software_projekte.md`). Set by #38 (SCF-US-1). |
| SCF-C-1 workspace & task runner | pnpm workspaces, Turborepo | pnpm 10 (`packageManager`); Turborepo 2 | One lockfile at the root; every unit and package provides the tasks `dev`, `build`, `lint`, `typecheck`, `test` (SCF-F-12), and each runs across the workspace through `turbo run`. Set by #38 and #102. |
| Shared lint / format / type configuration | Biome (lint, format); shared TypeScript base config | Biome 2.4; `@stash/config` | `biome.json` at the root, generated Prisma files excluded, `noExplicitAny` set to `error`; `packages/config/tsconfig.base.json` with `strict`, extended by every unit including `web`. Set by #38 and #102. |
| SCF-C-13 unit test runner (shared) | Node.js test runner (`node --test`), TypeScript by type stripping | Node.js 24 | Provisional, for the acceptance tests (`tests/`, the workspace package `@stash/tests`) and the unit tests of every package; the owner may replace it. Browser end-to-end runner: section 4. |
| SCF-C-7 container runtime & stack | Docker, Docker Compose | Compose v2; images pinned to a tag (`postgres:18-alpine`, `redis:8.8-alpine`, `mongo:8.0`, `couchdb:3.5`, `chrislusf/seaweedfs:4.51`, `clamav/clamav:1.5`, `axllent/mailpit:v1.32`, `caddy:2.11-alpine`); each image except PostgreSQL pinned to a minor version (PostgreSQL to the major version the school requirements name) | SCF-US-2. `docker-compose.yml`: every setting from `.env` (documented in `.env.example`, secrets as `${NAME:?…}` without a default), a health check per service, `depends_on` with `service_healthy`, except a one-shot container (`restart: "no"`, such as `db-migrate`), which has no health check and whose dependents wait with `service_completed_successfully` (SCF-AC-2.4, SCF-F-20); data services published on `127.0.0.1` only. `web` is built from `docker/web.Dockerfile` (Node.js as in `.tool-versions`), a temporary stop-gap that M9 of the track plan Web replaces with `apps/web/Dockerfile`; its health check requests `/` until `/health` exists. Mailpit replaces outgoing e-mail; OAuth and captcha are off by default (SCF-NF-2); ClamAV starts with the definitions of its image (`CLAMAV_NO_FRESHCLAMD`) and runs as `linux/amd64`, emulated on ARM machines, because its image exists for amd64 only (#148). The tests are `tests/docker-compose.test.ts`. |
| SCF-C-6 reverse proxy | Caddy | `caddy:2.11-alpine` | One origin on `PROXY_PORT`, plain HTTP (TLS with R14: the automatic HTTPS of Caddy with a certificate from Let's Encrypt, HTTP-01 challenge, and the redirect from HTTP to HTTPS of DEP-F-2; the school's optional Traefik is not used, deviation in `WORKFLOW.md`, Q265); routes in `docker/Caddyfile`, only `/` to `web` until the other units run; `/proxy-health` is answered by the proxy for its health check. |
| SCF-C-8 relational database | PostgreSQL | 18 (`postgres:18-alpine`) | Data in the volume `postgres-data` mounted at `/var/lib/postgresql` (PostgreSQL 18 layout). Prisma is set up by SCF-US-4. |
| SCF-C-5 content management system | _open_ | | |
| SCF-C-12 changelog draft generator | _open_ | | |
| OBS-C-1 instrumentation library | OpenTelemetry SDK for Node.js with the HTTP instrumentation; W3C Trace Context propagator; OTLP over HTTP exporters for metrics, logs, and traces | OpenTelemetry JS 2.x (stable packages) and the matching experimental packages; exact versions pinned in `packages/telemetry` | Package `@stash/telemetry` (`packages/telemetry`, `concepts/observability.md` §16, M1–M5). Neutral attribute names of §8 map to the semantic conventions: `route` → `http.route`, `method` → `http.request.method`, `status code` → `http.response.status_code`, `unit` → resource `service.name`, `version` → resource `service.version`, `peer unit` → `server.address` of the called unit, `queue` → `messaging.destination.name`, `job name` → `messaging.operation.name`, `job id` → `messaging.message.id`, `error type` → `error.type`. Metric names of §8 are kept; the metric store shows them with `_` instead of `.`. Default `TELEMETRY_ENDPOINT`: `http://collector:4318`. To be confirmed in slice 2 of OBS-US-1. |
| OBS-C-2 telemetry collector | OpenTelemetry Collector Contrib (receiver `otlp`; processors `attributes`, `transform`, `redaction`, `batch`, `memory_limiter`; exporters to the three stores) | Collector Contrib ≥ 0.120, exact image tag pinned in the stack definition | Container `collector` in profile `observability`, internal network only. Memory limit 192 MB. Slice 1 of OBS-US-1. |
| OBS-C-3 metric store | Prometheus with its OTLP receiver; alert rules as Prometheus rule files rendered by the configuration step; offline rule test with `promtool test rules` | Prometheus 3.x, exact image tag pinned | Retention by `--storage.tsdb.retention.time` from `OBS_METRICS_RETENTION_DAYS`. Memory limit 384 MB. Alert rules are data-source managed and read-only in Grafana. |
| OBS-C-4 log store | Grafana Loki with OTLP ingestion; labels `service_name` and `level` | Loki 3.x, exact image tag pinned | Retention by the compactor from `OBS_LOGS_RETENTION_DAYS`. Memory limit 320 MB. |
| OBS-C-5 trace store | Grafana Tempo with OTLP ingestion | Tempo 2.x, exact image tag pinned | Block retention from `OBS_TRACES_RETENTION_DAYS`. Memory limit 256 MB. |
| OBS-C-6 dashboard tool | Grafana with file provisioning of data sources and dashboards, served from the sub-path `/observability`, authentication by proxy header (`auth.proxy`) | Grafana ≥ 12, exact image tag pinned in slice 1 of OBS-US-1 | Settings for OBS-F-9 (`allowUiUpdates: false`), OBS-F-10 and OBS-F-27 (`auth.proxy` with the header of OBS-C-7; `auth.anonymous` with role Viewer only while OBS-F-24 binds the port to `127.0.0.1`; `disable_login_form`, `users.allow_sign_up` off), OBS-NF-1 (`analytics.reporting_enabled`, `check_for_updates` off, no plugins). Links of OBS-F-7: Loki derived field `traceId` → Tempo, Tempo trace-to-logs → Loki. Memory limit 256 MB; configuration step (`node:24-alpine`) 64 MB — 1472 MB in total (OBS-NF-8). The images of the profile are scanned by `container-scan` (#149, SCF-NF-6). |
| OBS-C-7 session check in the reverse proxy | Caddy `forward_auth` to the session check of `identity` | `caddy:2.11-alpine` (SCF-C-6) | For OBS-F-27: header `X-Stash-Operator`, removed from every incoming request; active with TLS (R14). The address in `identity` is set by R3. |

Module mapping (folder layout), set by #38:

| Path | Package | Role |
| --- | --- | --- |
| `apps/web` | `@stash/web` | Unit `web` (Next.js app) |
| `apps/identity`, `apps/storage`, `apps/worker`, `apps/cms` | `@stash/<unit>` | The other four units; empty until their issues |
| `packages/contracts`, `packages/ui`, `packages/config`, `packages/db` | `@stash/<name>` | Shared packages; `config` holds the TypeScript base config, `db` the relational schema, migrations, and seed (#41) |
| `tests/` | `@stash/tests` | Acceptance tests that run at the repository root |

Build/run commands (root): `pnpm install`, `pnpm dev`, `pnpm run lint`, `pnpm run typecheck`, `pnpm run build`, `pnpm test`. Configuration & secrets: _open_.

## 2. Contracts, storage & worker — `schauby1`

| Capability | Technology | Version constraint | Notes |
| --- | --- | --- | --- |
| SCF-C-2 schemas & OpenAPI generation | Zod, `@asteasolutions/zod-to-openapi` | Zod 4.6.7, zod-to-openapi 8.5.0, both pinned exactly (the lockfile and `package.json` agree); OpenAPI 3.1 | Package `packages/contracts` (`@stash/contracts`; SCF-AC-3.1 still says `@nimbus/contracts`, a correction listed in `concepts/scaffolding.track-web.md`). One schema file per contract (`health.ts`, `errors.ts`), each exporting `<name>Schema` and its inferred type; every schema file imports `z` from `zod.ts`, which adds `.openapi()`. Source files import with `.ts` extensions, and `tsc` rewrites them for `dist/`. `pnpm --filter @stash/contracts openapi:generate [file]` writes the description, by default to `packages/contracts/dist/openapi.json` (not committed); `build` writes the same file, so it exists wherever the package is built. That default is the one `web` reads through `OPENAPI_FILE` (track Web, M6). Errors: `errorReplies` holds status and body per code of the concept §8, and `toErrorResponse(error)` maps a Zod failure to `validation-failed` and anything else to `internal-error`. Units import schemas from the package and do not depend on Zod themselves. Set by #40 (SCF-US-3). |
| SCF-C-4 HTTP server framework (`storage`) | _open_ | | |
| `worker` runtime | _open_ | | |

Type mapping (neutral type → concrete type) and error mapping (`E-x` → concrete representation): _open_.

## 3. Identity & CI — `tschudea07`

| Capability | Technology | Version constraint | Notes |
| --- | --- | --- | --- |
| SCF-C-4 HTTP server framework (`identity`), IDN-C-7 | Hono on Node.js | `hono` 4, newest version older than 7 days | Q11 of `concepts/identity.qa-log.md`. Set by #115. |
| IDN-C-1 authentication library | Better Auth with its email-and-password flow, e-mail verification, password reset, and secondary storage for sessions; tables mapped onto `auth_users`, `auth_accounts`, `auth_verifications` (SCF-C-19) | `better-auth` ≥ 1.76 (school requirement) | Sessions only in the session store (IDN-C-6), `auth_sessions` stays empty ([ADR-0007](adr/0007-session-check-through-identity.md)). Set by #115. |
| IDN-C-2 password hash | Argon2id through the package `@node-rs/argon2`, plugged into Better Auth's password hashing | OWASP parameters: memory 19 MiB, 2 iterations, parallelism 1 | School requirement: Argon2id or bcrypt. Set by #115. |
| IDN-C-3 shared schema library | Zod in `packages/contracts` (module `identity`), with the common-password list as a data file there | Zod of SCF-C-2 | The same rules in the browser and in `identity` (school requirement). Set by #115. |
| IDN-C-4 form library | TanStack Form or React Hook Form, chosen by the owner of `web` in slice 2 of IDN-US-1 | – | School requirement names both. |
| IDN-C-5 bot check | Cloudflare Turnstile, visible managed widget, verified server-side through its siteverify address | – | Q10. Off with `CAPTCHA_ENABLED=false`; no notice text needed for a visible widget (A16, PUB-F-23). Set by #115. |
| IDN-C-6 session store, throttle counters | Redis of the local stack (`redis:8.8-alpine`) | Redis 8 | Keys of `concepts/identity.md` §8. Set by #115. |
| IDN-C-8 e-mail delivery | SMTP with `nodemailer`; locally `mailpit` | – | Set by #115. |
| SCF-C-19 database access layer (package `db`, used by every unit with the relational database) | Prisma ORM 8 with its PostgreSQL target; contract in Prisma Schema Language `packages/db/src/prisma/contract.prisma`, migrations in `packages/db/migrations/app`; `pg` for the seed and the database tests | `prisma` 8.0.0-rc.27, `@prisma/orm-postgres` 8.0.0-rc.20, `@prisma/cli-engine` 0.9.0, exact — the newest release candidates that share one toolchain version and are seven days old ([ADR-0006](adr/0006-prisma-8-release-candidate.md)); `pg` 8.22.0 | School minimum Prisma ≥ 8; no stable 8.0.0 exists yet (ADR-0006). Create a migration with the package scripts of `packages/db`, the one way to run the schema commands: `contract:emit`, then `migration:plan <snake_slug>` (offline, no database needed); a hand-made step (the trigger of SCF-F-24) is added to the planned `migration.ts` and written with `node migrations/app/<dir>/migration.ts`. Apply: `pnpm db:migrate` (the script `migrate`: `prisma db migrate --show && prisma db migrate`, one transaction); container `db-migrate` from `packages/db/Dockerfile`. Seed: `pnpm db:seed`. Time columns are `TimestamptzString` (text on read), because the `Temporal` codec needs Node.js ≥ 26.8. Auth library tables: model and field names mapped to `auth_users`, `auth_sessions`, `auth_accounts`, `auth_verifications` in snake_case by its configuration (identity concept). Database tests: `TEST_DATABASE_URL`, passed through by Turborepo; CI job `test` has a `postgres:18-alpine` service. Set by #41 (`trutscf1`, A21). |
| SCF-C-21 data model diagram tool | Vertabelo (Redgate) | – | Prescribed by `docs/anforderungen_software_projekte.md`. The text form in `concepts/scaffolding.md` §8 is binding until the export `documentation/images/er-diagram.png` is embedded (human step). Set by #41. |
| SCF-C-9 CI service | GitLab CI | – | Q4. `.gitlab-ci.yml`: one pipeline per change (merge request pipeline while an MR is open, otherwise branch pipeline); lint, typecheck, test, build in parallel on the `node` image of the version in `.tool-versions`; 10-minute job timeout; pnpm store cached by lockfile, Turborepo cache per job, shared by all branches (SCF-US-5) |
| SCF-C-10 secret scanner, code scanner, dependency auditor, container image scanner | Gitleaks, Semgrep, `pnpm audit`, Trivy | Gitleaks 8.30.0, Semgrep 1.148.0, Trivy 0.69.3 | From `docs/security_next_js.md`: `.gitleaks.toml`, `.semgrep.yml` (registry rule sets passed with `--config`, `.claude/` ignored), `.pre-commit-config.yaml` locally and the same files in CI. Single secret-scan findings that are no secrets go into `.gitleaksignore` by fingerprint, each with its reason. `pnpm audit --prod --audit-level=high`. Trivy scans every image of `docker-compose.yml` with `--ignore-unfixed`; accepted upstream findings in `.trivyignore`, each with reason and expiry (SCF-US-5) |
| Code quality scan (local, beside SCF-C-10) | SonarQube Community Build, the server shared by every project on the developer's computer (Docker network `sonarqube-shared`, `127.0.0.1:9000`), kept outside this repository; scanner container `sonarsource/sonar-scanner-cli` | Scanner image `12.3.0.4285_8.1.0`, exact — the newest tag that is seven days old | `sonar-project.properties` (project key `stash`, test files and generated files excluded from the sources); `pnpm sonar` (`scripts/sonar.ts`) runs the scanner and waits for the quality gate; token `SONAR_TOKEN` in the ignored `.env.sonar` (copy of `.env.sonar.example`). No CI job, because the server answers only on localhost; no coverage report yet (`../qa-log.md`, Q259–Q262). Set by #153. |
| Accessibility check in CI | axe with Playwright | Playwright 1.63.0 (pinned; equals the CI image tag), `@axe-core/playwright` | `tests/accessibility/axe-check.ts` against the built web client; fails on a critical violation. Pages are added there with R4 (`../qa-log.md`, Q27) |
| SCF-C-11 commit message linter | commitlint | `@commitlint/cli` 21 | `commitlint.config.ts`: Conventional Commits, scope list and requirement ID of `WORKFLOW.md`; commit-msg hook through `.pre-commit-config.yaml`, CI job `commit-messages`. Changelog draft and release notes: `scripts/changelog.ts` (`pnpm run changelog:draft`); CI jobs `release-notes` and `release` (GitLab CLI image 1.74.0) publish the GitLab Release on a SemVer tag (SCF-US-6) |

## 4. Web — `schwaigc`

| Capability | Technology | Version constraint | Notes |
| --- | --- | --- | --- |
| SCF-C-3 web application framework | Next.js with the App Router and React; server-side route handlers for `/health` and `/api/docs`, the status page rendered on the server for every request (see the row _Rendering_ below) | Next.js ≥ 16.3 (pinned 16.4.2; 16.4.1 or higher fixes GHSA-2464-fhr4-w9xw, GHSA-673q-mjm6-r5xr, GHSA-p3m5-59mp-jv5r), React ≥ 19.2 (pinned 19.2.8) | Minimum versions by the school (`docs/anforderungen_software_projekte.md`), checked by SCF-T-4. Plan: `concepts/scaffolding.track-web.md`. Set by #113. |
| SCF-C-13 browser end-to-end test runner | Playwright (Chromium) | `playwright` 1.63.0, exact; the CI image tag `mcr.microsoft.com/playwright:v1.63.0-noble` matches it | Already used at the root by the accessibility check (`tests/accessibility/axe-check.ts`, with `@axe-core/playwright`); the end-to-end tests of R6 (WEB-US-4) use the same version. Set by #113. |
| Unit test runner of `web` | Node.js test runner (`node --test`) with type stripping, the shared runner of section 1; test files `apps/web/src/**/*.test.ts` without JSX | Node.js 24 | Components under test are written with React `createElement` in `.ts` files and rendered with `react-dom/server`. Plan: `concepts/scaffolding.track-web.md`. Set by #113. |
| Rendering of `/health`, `/status`, `/api/docs` | Dynamic on every request: each handler first awaits `connection()` from `next/server` (imported as `next/server.js`, because `node --test` resolves no import without an extension), so `next build` prerenders none of them and never calls another unit | Next.js ≥ 16.3 | Checked by W-19 (prerender manifest). Set by #113. |
| Start command of `web` | `apps/web/scripts/start.ts`, run by Node.js with type stripping: checks the configuration, then starts Next.js (`dev`) or the standalone server (`start`) | Node.js 24 | Next.js alone rejects or ignores an invalid `PORT` without the output of SCF-E-1 (`../qa-log.md`, Q54). Set by #113. |
| Font of `web` | Geist from the package `geist`, served as local files by `next/font/local` | `geist` exact, newest version older than 7 days (1.7.2 on 2026-10-20); SIL OFL 1.1 | No request to the internet at build or run time (SCF-NF-1, Q55). Set by #113. |
| Container image of `web` | `apps/web/Dockerfile`, two stages on `node:24-alpine`, Next.js standalone output, user `node`, `HEALTHCHECK` on `/health` | `node:24-alpine` (Node.js ≥ 24.14) | Base image named by `docs/anforderungen_software_projekte.md`. Set by #113. |
| DSA-F-1 design tokens | CSS custom properties in a Tailwind CSS `@theme` block (`packages/ui/src/tokens.css`, exported as `@stash/ui/tokens.css`) | Tailwind CSS 4 | The `@theme` values are the light theme; spacing tokens are named `tight`, `snug`, `base`, `roomy`, `loose` because Tailwind CSS 4 would let `xs` to `xl` replace the container sizes of `max-w-*` (tested in `tests/design-system.test.ts`); dark, sepia, and night override the colour tokens on `[data-theme]`. Set by #68. |
| DSA-F-2 theme switching and memory | `data-theme` on `<html>`, cookie `stash-theme` (one year, `SameSite=Lax`) read by the root layout | – | `packages/ui/src/theme.ts`; the profile takes over with DSA-F-16. Set by #68. |
| DSA-F-3 component primitives | Radix UI (`radix-ui`) styled with Tailwind CSS | `radix-ui` 1.6.7, React 19 | First component: the theme switcher (toggle group). Set by #68. |
| DSA-F-4 contrast check | The test computes the WCAG contrast ratio of every text and background colour pair of each theme from `tokens.css` (`tests/contrast.test.ts`) | Node.js 24 | Pairs: foreground, muted, and accent on background and surface; accent-foreground on accent. Set by #106. |
| DSA-F-5 component documentation | Storybook with the React and Vite framework (`packages/ui/.storybook`), Tailwind CSS through `@tailwindcss/vite`, one `*.stories.tsx` file per component, a toolbar item for the four themes | `storybook` 10.6, `@storybook/react-vite` 10.6, Vite 8 | `pnpm --filter @stash/ui run storybook` (port 6006) and `build-storybook`; telemetry is switched off. Set by #106. |
| Design-system tests | Node.js test runner on the token stylesheet, the theme helpers, and the package wiring (`tests/design-system.test.ts`, `tests/theme.test.ts`) | Node.js 24 | Rendering in a browser is left to SCF-C-13. |

## 5. Stack ADRs

Technology choices with lock-in are recorded in `documentation/adr/`.
