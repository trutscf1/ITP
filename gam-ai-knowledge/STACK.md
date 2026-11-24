---
doc: stack
format: gam-ai-knowledge/1
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

Every capability of `concepts/scaffolding.md` §7, `concepts/public-content.md` §7, `concepts/observability.md` §7, `concepts/identity.md` §7, `concepts/design-system.md` §7, and `concepts/storage-core.md` §7 and where its technology stands. The index only points to the track sections; it holds no technology of its own, except the capabilities added on 2026-10-13 that no section maps yet. Their owner moves the row into the own section when the technology is chosen.

| ID | Capability | Technology | Owner |
| --- | --- | --- | --- |
| SCF-C-1 | Workspace and task runner | section 1 | `trutscf1` |
| SCF-C-2 | Schemas | section 2 | `schauby1` |
| SCF-C-3 | Web application framework | section 4 | `schwaigc` |
| SCF-C-4 | HTTP server framework | sections 2 and 3 (`storage` and `identity`: Hono) | `schauby1`, `tschudea07` |
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
| SCF-C-15 | Document database | section 2 (row STO-C-2: MongoDB, official driver) | `schauby1` |
| SCF-C-16 | Sync database | _open_ — CouchDB per the project proposal | `trutscf1` |
| SCF-C-17 | Object storage | section 2 (row STO-C-1: SeaweedFS, S3 client) | `schauby1` |
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
| STO-C-1 | Object store client | section 2 | `schauby1` |
| STO-C-2 | Document database access | section 2 | `schauby1` |
| STO-C-3 | Record store access | section 2 (uses SCF-C-19, section 3) | `schauby1` |
| STO-C-4 | Resumable upload server | section 2 | `schauby1` |
| STO-C-5 | ZIP streaming | section 2 | `schauby1` |
| STO-C-6 | Scheduled job runtime | section 2 | `schauby1` |
| STO-C-7 | Content type detection | section 2 (_open_) | `schauby1` |
| STO-C-8 | Content hash | section 2 | `schauby1` |
| STO-C-9 | Server push | section 2 | `schauby1` |
| STO-C-10 | HTTP server framework (`storage`) | section 2 | `schauby1` |
| DSA-C-1 | Design token mechanism | section 4 | `schwaigc` |
| DSA-C-2 | Accessible component primitives | section 4 | `schwaigc` |
| DSA-C-3 | Component catalogue | section 4 | `schwaigc` |
| DSA-C-4 | System preference query | section 4 | `schwaigc` |
| DSA-C-5 | Device storage on request | section 4 | `schwaigc` |
| DSA-C-6 | Colour measurement | section 4 | `schwaigc` |
| DSA-C-7 | Automated accessibility check | section 4 (builds on SCF-C-20 and SCF-C-13) | `schwaigc` |
| DSA-C-8 | Screen readers for manual tests | section 4 | `schwaigc` |

## 1. Platform — `trutscf1`

| Capability | Technology | Version constraint | Notes |
| --- | --- | --- | --- |
| Runtime & language | Node.js, TypeScript (strict, no `any`) | Node.js 24 LTS ≥ 24.14.0 (`.tool-versions`, `engines`); TypeScript 5 | School minimum (`docs/anforderungen_software_projekte.md`). Set by #38 (SCF-US-1). |
| SCF-C-1 workspace & task runner | pnpm workspaces, Turborepo | pnpm 10 (`packageManager`); Turborepo 2 | One lockfile at the root; every unit and package provides the tasks `dev`, `build`, `lint`, `typecheck`, `test` (SCF-F-12), and each runs across the workspace through `turbo run`. Set by #38 and #102. |
| Shared lint / format / type configuration | Biome (lint, format); shared TypeScript base config | Biome 2.4; `@stash/config` | `biome.json` at the root, generated Prisma files excluded, `noExplicitAny` set to `error`; `packages/config/tsconfig.base.json` with `strict`, extended by every unit including `web`. Set by #38 and #102. |
| SCF-C-13 unit test runner (shared) | Node.js test runner (`node --test`), TypeScript by type stripping | Node.js 24 | Provisional, for the acceptance tests (`tests/`, the workspace package `@stash/tests`) and the unit tests of every package; the owner may replace it. Browser end-to-end runner: section 4. |
| SCF-C-7 container runtime & stack | Docker, Docker Compose | Compose v2; images pinned to a tag (`postgres:18-alpine`, `redis:8.8-alpine`, `mongo:8.0`, `couchdb:3.5`, `chrislusf/seaweedfs:4.55`, `clamav/clamav:1.5`, `axllent/mailpit:v1.33`, `caddy:2.11-alpine`; the observability profile adds `prom/prometheus:v3.15.1`, `grafana/grafana:13.2.6`, and builds the configuration check, the collector, Loki, and Tempo from `docker/observability/*.Dockerfile` on `node:24.14-alpine` (Alpine packages upgraded, npm removed), `otel/opentelemetry-collector-contrib:0.165.0`, `grafana/loki:3.7.10`, and `grafana/tempo:2.10.10`, each with the static tool `busybox:1.38.0-musl` for its health check); each image except PostgreSQL pinned to a minor version (PostgreSQL to the major version the school requirements name; the images of the observability profile to the exact version, [OBS-F-5]) | SCF-US-2. `docker-compose.yml`: every setting from `.env` (documented in `.env.example`, secrets as `${NAME:?…}` without a default), a health check per service, `depends_on` with `service_healthy`, except a one-shot container (`restart: "no"`, such as `db-migrate`), which has no health check and whose dependents wait with `service_completed_successfully` (SCF-AC-2.4, SCF-F-20); data services published on `127.0.0.1` only. `web` is built from `docker/web.Dockerfile` (Node.js as in `.tool-versions`), a temporary stop-gap that M9 of the track plan Web replaces with `apps/web/Dockerfile`; its health check requests `/` until `/health` exists. Mailpit replaces outgoing e-mail; OAuth and captcha are off by default (SCF-NF-2); ClamAV starts with the definitions of its image (`CLAMAV_NO_FRESHCLAMD`) and runs as `linux/amd64`, emulated on ARM machines, because its image exists for amd64 only (#148). The tests are `tests/docker-compose.test.ts`. |
| SCF-C-6 reverse proxy | Caddy | `caddy:2.11-alpine` | One origin on `PROXY_PORT`, plain HTTP (TLS with R14: the automatic HTTPS of Caddy with a certificate from Let's Encrypt, HTTP-01 challenge, and the redirect from HTTP to HTTPS of DEP-F-2; the school's optional Traefik is not used, deviation in `WORKFLOW.md`, Q265); routes in `docker/Caddyfile`, only `/` to `web` until the other units run; `/proxy-health` is answered by the proxy for its health check. |
| SCF-C-8 relational database | PostgreSQL | 18 (`postgres:18-alpine`) | Data in the volume `postgres-data` mounted at `/var/lib/postgresql` (PostgreSQL 18 layout). Prisma is set up by SCF-US-4. |
| SCF-C-5 content management system | _open_ | | |
| SCF-C-12 changelog draft generator | _open_ | | |
| OBS-C-1 instrumentation library | Own code in `packages/telemetry` on the Node.js standard library (`AsyncLocalStorage` for the active span, `fetch` for the export): the W3C Trace Context format, spans and metrics kept in memory, and the OTLP protocol over HTTP with JSON bodies for metrics, logs, and traces; no OpenTelemetry SDK package | no runtime dependency; the protocol is OTLP 1.x (the collector of OBS-C-2 receives it on port 4318) | Package `@stash/telemetry` (`packages/telemetry`, `concepts/observability.md` §16, M1–M5). Neutral attribute names of §8 map to the semantic conventions: `route` → `http.route`, `method` → `http.request.method`, `status code` → `http.response.status_code`, `unit` → resource `service.name`, `version` → resource `service.version`, `peer unit` → `server.address` of the called unit, `queue` → `messaging.destination.name`, `job name` → `messaging.operation.name`, `job id` → `messaging.message.id`, `error type` → `error.type`. Metric names of §8 are kept; the metric store shows them with `_` instead of `.`. Default `TELEMETRY_ENDPOINT`: `http://collector:4318`. Confirmed in slice 2 of OBS-US-1 (#154) with one change: the OpenTelemetry SDK is not used, because its logs packages are still experimental (`WORKFLOW.md` Definition of Done item 18), its exporters keep their own queues instead of the bounded buffer of OBS-E-1, and every package would pass the supply-chain rules of `pnpm-workspace.yaml`; the encoder of the protocol is about 150 lines (`src/otlp.ts`); recorded in [ADR-0009](adr/0009-units-encode-otlp-themselves.md). Unit tests use `node --test` with a recording sink, a fixed clock, and a stub exporter (SCF-C-13). The framework glue of each unit (what calls `http.serve`) is the unit's M11. |
| OBS-C-2 telemetry collector | OpenTelemetry Collector Contrib (receiver `otlp`; processors `attributes`, `transform`, `redaction`, `batch`, `memory_limiter`; exporters to the three stores) | Collector Contrib ≥ 0.120, exact image tag pinned in the stack definition | Container `collector` in profile `observability`, internal network only. Memory limit 192 MB. Slice 1 of OBS-US-1. |
| OBS-C-3 metric store | Prometheus with its OTLP receiver; alert rules as Prometheus rule files rendered by the configuration step; offline rule test with `promtool test rules` | Prometheus 3.x, exact image tag pinned | Retention by `--storage.tsdb.retention.time` from `OBS_METRICS_RETENTION_DAYS`. Memory limit 384 MB. Alert rules are data-source managed and read-only in Grafana. The rules count requests as the exact counter difference over 5 minutes (not `increase()`, which extrapolates); the rendered file is `alert-rules.yml` (`concepts/observability.md` §16, M9). |
| OBS-C-4 log store | Grafana Loki with OTLP ingestion; labels `service_name` and `level` | Loki 3.x, exact image tag pinned | Retention by the compactor from `OBS_LOGS_RETENTION_DAYS`. Memory limit 320 MB. |
| OBS-C-5 trace store | Grafana Tempo with OTLP ingestion | Tempo 2.x, exact image tag pinned | Block retention from `OBS_TRACES_RETENTION_DAYS`. Memory limit 256 MB. |
| OBS-C-6 dashboard tool | Grafana with file provisioning of data sources and dashboards, served from the sub-path `/observability`, authentication by proxy header (`auth.proxy`) | Grafana ≥ 12, `grafana/grafana:13.2.6` (exact tag, pinned in `docker-compose.yml`) | Settings for OBS-F-9 (`allowUiUpdates: false`), OBS-F-10 and OBS-F-27 (`auth.proxy` with the header of OBS-C-7; `auth.anonymous` with role Viewer only while OBS-F-24 binds the port to `127.0.0.1`; `disable_login_form`, `users.allow_sign_up` off), OBS-NF-1 (`analytics.reporting_enabled`, `check_for_updates` off, no plugins). Links of OBS-F-7: Loki derived fields `traceId` and `trace_id` (the stack stores `trace_id`) → Tempo, Tempo trace-to-logs → Loki. Memory limit 256 MB; configuration step (`node:24.14-alpine`) 64 MB — 1472 MB in total (OBS-NF-8). The images of the profile are scanned by `container-scan` (#149, SCF-NF-6). |
| OBS-C-7 session check in the reverse proxy | Caddy `forward_auth` to the session check of `identity` | `caddy:2.11-alpine` (SCF-C-6) | For OBS-F-27: header `X-Stash-Operator`, removed from every incoming request; active with TLS (R14). The address in `identity` is set by R3. |

Module mapping (folder layout), set by #38:

| Path | Package | Role |
| --- | --- | --- |
| `apps/web` | `@stash/web` | Unit `web` (Next.js app) |
| `apps/identity`, `apps/storage`, `apps/worker`, `apps/cms` | `@stash/<unit>` | The other four units; empty until their issues |
| `packages/contracts`, `packages/ui`, `packages/config`, `packages/db`, `packages/telemetry` | `@stash/<name>` | Shared packages; `config` holds the TypeScript base config, `db` the relational schema, migrations, and seed (#41), `telemetry` the start call, logger, redaction, job trace, and export buffer of every unit (#154) |
| `tests/` | `@stash/tests` | Acceptance tests that run at the repository root |

Build/run commands (root): `pnpm install`, `pnpm dev`, `pnpm run lint`, `pnpm run typecheck`, `pnpm run build`, `pnpm test`. Configuration & secrets: _open_.

## 2. Contracts, storage & worker — `schauby1`

| Capability | Technology | Version constraint | Notes |
| --- | --- | --- | --- |
| SCF-C-2 schemas & OpenAPI generation | Zod, `@asteasolutions/zod-to-openapi` | Zod 4.6.7, zod-to-openapi 8.5.0, both pinned exactly (the lockfile and `package.json` agree); OpenAPI 3.1 | Package `packages/contracts` (`@stash/contracts`; SCF-AC-3.1 still says `@nimbus/contracts`, a correction listed in `concepts/scaffolding.track-web.md`). One schema file per contract (`health.ts`, `errors.ts`), each exporting `<name>Schema` and its inferred type; every schema file imports `z` from `zod.ts`, which adds `.openapi()`. Source files import with `.ts` extensions, and `tsc` rewrites them for `dist/`. `pnpm --filter @stash/contracts openapi:generate [file]` writes the description, by default to `packages/contracts/dist/openapi.json` (not committed); `build` writes the same file, so it exists wherever the package is built. That default is the one `web` reads through `OPENAPI_FILE` (track Web, M6). Errors: `errorReplies` holds status and body per code of the concept §8, and `toErrorResponse(error)` maps a Zod failure to `validation-failed` and anything else to `internal-error`. Units import schemas from the package and do not depend on Zod themselves. Set by #40 (SCF-US-3). |
| SCF-C-4 HTTP server framework (`storage`), STO-C-10 | Hono on Node.js, like `identity` | `hono` 4, newest version older than 7 days | Q422 of `concepts/storage-core.qa-log.md`. Request bodies are checked by the contracts of SCF-C-2; the streaming helpers of Hono serve the downloads. Set by: planned (R5 concept). |
| STO-C-1 object store client; SCF-C-17 | `@aws-sdk/client-s3` against the S3 interface of SeaweedFS (the container of the local stack), path-style addressing | `@aws-sdk/client-s3` newest version older than 7 days; SeaweedFS as in `docker-compose.yml` | Q423. Streams of unknown length use multipart writes; reads use ranges. The object store is published on `127.0.0.1` for development only (STO-F-37). Used and total bytes (STO-F-46) are not part of the S3 interface: an adapter behind the object-store port reads them from the status interface of the SeaweedFS master on the internal network (port 9333, the one the health check of `docker-compose.yml` uses), address in `OBJECT_STORE_STATUS_URL` (Q454); which fields of its answer give used and total is settled in the slice that builds STO-F-46. Set by: planned (R5 concept). |
| STO-C-2 document database access; SCF-C-15 | MongoDB through its official driver `mongodb`; the shape of a document is checked by a Zod contract of `packages/contracts` (module `storage`), no object-document mapper | `mongodb` newest version older than 7 days; MongoDB 8 as in `docker-compose.yml` | Q424. Collection `file_metadata`, key `_id` = the content object's ID (concept §8). Set by: planned (R5 concept). |
| STO-C-3 record store access; SCF-C-19 | Prisma ORM 8 in `packages/db`, as the row "Database access layer" in section 3 | as the row "Database access layer" | A5. Row locks and the transactions of the storage core use the statements the access layer offers for them. The migration of the concept §15 follows the procedure of that row. Set by: planned (R5 concept). |
| STO-C-4 resumable upload server | `@tus/server` with `@tus/s3-store`, mounted in the Hono server of `storage` | `@tus/server` and `@tus/s3-store` newest versions older than 7 days | Q433. The store writes into the object store through the client of STO-C-1; the upload ID is a random uuid made by `storage` and is the object key. The upload resources live in the object store next to the bytes. Set by: planned (R5 concept). |
| STO-C-5 ZIP streaming | `archiver`, entries stored without compression (`store: true`), ZIP64 | `archiver` newest version older than 7 days | Q440. Each file is added as a stream, so the archive is never held in memory. Set by: planned (R5 concept). |
| STO-C-6 scheduled job runtime; SCF-C-14 | BullMQ with repeatable jobs and one attempt per run (a failed run is not retried before the next interval), started in `apps/worker` on the key-value store (Redis) | `bullmq` newest version older than 7 days; Redis as in `docker-compose.yml` | Q435. The jobs `cleanup-uploads`, `cleanup-orphans`, and `purge-trash` call the storage core of `packages/storage-core`. The processors of R9 reuse the runtime. The row SCF-C-14 in the capability index stays open until `identity` and `worker` have set their Redis rows. Set by: planned (R5 concept). |
| STO-C-7 content type detection | _open_ | | A library that detects a media type from leading bytes is chosen by the owner in slice 1 of STO-US-2 and written here with its version; the extension table is a data file of `packages/storage-core`. Not decided in the grill (Q430 fixes only the rule). |
| STO-C-8 content hash | SHA-256 through `node:crypto` of Node.js | Node.js 24 | No package: the algorithm is from the platform (`G-1.N5`). Set by: planned (R5 concept). |
| STO-C-9 server push | Server-sent events through the streaming helper of Hono | `hono` as above | Q431. Set by: planned (R5 concept). |
| `worker` runtime | Node.js 24 as the other units; job runtime: row STO-C-6 | Node.js 24 | The processors of R9 are still open. |

Type mapping (neutral type → concrete type) and error mapping (`E-x` → concrete representation): _open_.

### Names

Technology names the stack introduces, one row per track section, for the rebuild's stack-neutrality check (RB-F-31). _Names_ lists the technology names each section introduces, each in backticks and separated by commas; no concept document contains one of these names. Filled from the rows of the sections 1 to 4 (assumption A1 of the migration to skill version 1.6.0).

| Section | Names |
| --- | --- |
| 1. Platform | `Node.js`, `TypeScript`, `pnpm`, `Turborepo`, `Biome`, `Docker`, `Docker Compose`, `Caddy`, `PostgreSQL`, `Prisma`, `OpenTelemetry Collector`, `Prometheus`, `Loki`, `Tempo`, `Grafana` |
| 2. Contracts, storage & worker | `Zod`, `zod-to-openapi`, `OpenAPI` |
| 3. Identity & CI | `Hono`, `Better Auth`, `Argon2id`, `nodemailer`, `Mailpit`, `Redis`, `Cloudflare Turnstile`, `GitLab CI`, `Gitleaks`, `Semgrep`, `Trivy`, `SonarQube`, `axe`, `commitlint`, `Vertabelo` |
| 4. Web | `Next.js`, `React`, `Tailwind CSS`, `Radix UI`, `Storybook`, `Playwright`, `Geist`, `NVDA`, `VoiceOver` |

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
| SCF-C-21 data model diagram tool | Vertabelo (Redgate) | – | Prescribed by `docs/anforderungen_software_projekte.md`. The text form in `concepts/scaffolding.md` §8 is binding until the export `gam-ai-knowledge/images/er-diagram.png` is embedded (human step). Set by #41. |
| SCF-C-9 CI service | GitLab CI | – | Q4. `.gitlab-ci.yml`: one pipeline per change (merge request pipeline while an MR is open, otherwise branch pipeline); lint, typecheck, test, build in parallel on the `node` image of the version in `.tool-versions`; 10-minute job timeout; pnpm store cached by lockfile, Turborepo cache per job, shared by all branches (SCF-US-5) |
| SCF-C-10 secret scanner, code scanner, dependency auditor, container image scanner | Gitleaks, Semgrep, `pnpm audit`, Trivy | Gitleaks 8.30.0, Semgrep 1.148.0, Trivy 0.69.3 | From `docs/security_next_js.md`: `.gitleaks.toml`, `.semgrep.yml` (registry rule sets passed with `--config`, `.claude/` ignored), `.pre-commit-config.yaml` locally and the same files in CI. Single secret-scan findings that are no secrets go into `.gitleaksignore` by fingerprint, each with its reason. `pnpm audit --prod --audit-level=high`. Trivy scans every image of `docker-compose.yml` in every profile with `--ignore-unfixed`: the job `container-scan` runs on Docker 29.9.2 with a Docker daemon of the same version, builds the images the stack builds under the project name `stash`, and scans them together with the pulled images (#149); accepted findings in `.trivyignore` for every image and in `.trivyignore.d/<service>` for the image of that service only, each with reason and expiry (SCF-US-5). Renewal rule (#171, #172): when an exception expires, every image first moves to the newest tag of its pinned version that fixes its findings (a pulled image with `docker compose pull`, a built one with `build --pull`, then the scan as in the job); only what no published image fixes goes into the exception files again, with a new reason and an expiry at the end of the sprint (now 2027-01-11, end of Sprint 3) |
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
| DSA-F-2 theme switching and memory | `data-theme` on `<html>`, set from the theme control inside the Appearance menu (DSA-U-1, `packages/ui/src/theme-switcher.tsx` becomes its theme control); device value: today the cookie `stash-theme` (one year, `SameSite=Lax`) read by the root layout, to be replaced by the cookie `stash-appearance` (row DSA-C-5) | – | `packages/ui/src/theme.ts`; the profile takes over with DSA-F-16 and wins after sign-in (DSA-F-22). The control is shown only to logged-in members, so a visitor gets no cookie (PUB-NF-3, DSA-NF-14). Changed by the concept of 2026-11-17: planned, set by the slices of DSA-US-2. Set by #68. |
| DSA-F-3 component primitives | Radix UI (`radix-ui`) styled with Tailwind CSS | `radix-ui` 1.6.7, React 19 | First component: the theme switcher (toggle group). Set by #68. |
| DSA-F-4 contrast check | The test computes the WCAG contrast ratio of every text and background colour pair of each theme from `tokens.css` (`tests/contrast.test.ts`) | Node.js 24 | Pairs: foreground, muted, and accent on background and surface; accent-foreground on accent. Set by #106. |
| DSA-F-5 component documentation | Storybook with the React and Vite framework (`packages/ui/.storybook`), Tailwind CSS through `@tailwindcss/vite`, one `*.stories.tsx` file per component, a toolbar item for the four themes | `storybook` 10.6, `@storybook/react-vite` 10.6, Vite 8 | `pnpm --filter @stash/ui run storybook` (port 6006) and `build-storybook`; telemetry is switched off. Set by #106. |
| DSA-F-6 high contrast | Two palettes in `packages/ui/src/tokens.css`: a light one for light and sepia, a dark one for dark and night, switched on by `data-contrast="high"` and, without any attribute, by `@media (prefers-contrast: more)` | Tailwind CSS 4 | Every text pair of `tests/contrast.test.ts` reaches 7:1 (WCAG AAA) in both palettes and in the media block (`tests/accessibility-tokens.test.ts`, DSA-T-7). The palettes replace only the seven colour tokens of the themes. Set by #71. |
| DSA-F-7 colour-blind modes | Status tokens `--color-status-success`, `-warning`, `-danger`, `-info` in every theme; `data-colour-vision` (`protanopia`, `deuteranopia`, `tritanopia`) replaces them with a light and a dark palette per mode; the component `StatusBadge` (`packages/ui/src/status-badge.tsx`) shows every status as an inline SVG icon that differs per status plus text | Tailwind CSS 4, React 19 | The status colours are non-text marks: each reaches 3:1 on background and surface (WCAG 1.4.11) in every theme, contrast, and vision combination, and the four colours stay apart (CIE Lab distance of at least 30) for the vision they serve, simulated with the matrices of Machado et al. 2009 inside the test (DSA-T-8). No library for the simulation. Set by #71. Replaced by the concept of 2026-11-17 (DSA-F-7, DSA-F-18, DSA-F-19, DSA-NF-2): two modes in place of three, a CIEDE2000 value of at least 15 in place of the CIE Lab distance of 30; see the row "DSA-F-6, DSA-F-7, DSA-F-18, DSA-F-19 colour mode". |
| DSA-F-8 reduced motion | A rule on all elements and their pseudo-elements that sets `animation: none`, `transition: none`, and `scroll-behavior: auto`, under `@media (prefers-reduced-motion: reduce)` and under `data-motion="reduced"` | – | The member can only add the mode, never switch the system preference off. The browser check `tests/accessibility/axe-check.ts` looks for running animations under both (DSA-T-9). Set by #71. Planned change (DSA-F-8, DSA-F-21): the value comes from the Appearance menu and the stored values instead of `stash-a11y`; the rule itself stays. |
| DSA-F-10 font size | Every type, spacing, and radius token in `rem`; no own font-size setting, the browser's font size and zoom scale the layout | – | `tests/accessibility-tokens.test.ts` checks the tokens and the component sources; `tests/accessibility/axe-check.ts` sets the root font size to 200 % on every page and looks for horizontal scroll at 1280 px and for content wider than its box (DSA-T-11). Set by #71. Replaced by the concept of 2026-11-17: DSA-F-10 is the 200 % zoom check only; the three font sizes are the row "DSA-F-20 font sizes". |
| DSA-F-11 keyboard operation | One global rule `:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px }` in `@layer base` of `packages/ui/src/tokens.css`, so a utility can still adjust it; no positive `tabIndex` in `apps/` or `packages/`; the tab order is the source order | – | The accent colour reaches 3:1 on background and surface in every theme and contrast mode, with the attribute and with `prefers-contrast: more` (WCAG 2.4.7, 1.4.11), and no source removes an outline (`tests/keyboard-focus.test.ts`, DSA-T-12). The browser check `tests/accessibility/axe-check.ts` presses Tab from the top of each page, compares the stops with the focusable elements in source order, requires an outline or a box-shadow that is not transparent on each, checks that a Tab after the last stop leaves the page (or loops inside the non-modal popover), and does the same inside the accessibility popover opened by keyboard; a toggle group or radio group is one stop. Set by #72. |
| DSA-F-12 skip link | An anchor `<a href="#main-content">Skip to main content</a>` as the first element of `<body>` in `apps/web/src/app/layout.tsx`, hidden with the Tailwind classes `sr-only` and shown with `focus:not-sr-only focus:absolute focus:left-base focus:top-base` when it has focus; the layout wraps every page in `<main id="main-content" tabIndex={-1}>`, and a page holds no `<main>` | Tailwind CSS 4, Next.js (App Router) | `tests/skip-link.test.ts` reads the layout and the page source (DSA-T-13); the browser check proves that the first Tab focuses the link in the top corner, that Enter moves focus to `#main-content`, and that the page has exactly one main landmark. Set by #72. |
| DSA-F-14 manual screen-reader tests | A protocol with steps per control and a result table in `gam-ai-knowledge/tests/screen-reader-protocol.md` (`doc: test-strategy`): NVDA with Firefox or Chrome on Windows, VoiceOver with Safari on macOS | NVDA, VoiceOver (current releases) | `tests/screen-reader-protocol.test.ts` checks that both sections, their steps and expected announcements, and the empty result table exist (DSA-T-15); the runs are done by a person and recorded in the table. Set by #72. |
| DSA-F-15 automated axe check | `tests/accessibility/axe-check.ts` runs axe with `@axe-core/playwright` on every page in each of the four themes, with and without high contrast (cookies `stash-theme` and `stash-a11y` set in a fresh browser context), the popover closed and open, and fails on a violation of impact `critical` | `@axe-core/playwright` 4.13, Playwright 1.63 | The check confirms that the page shows the theme and contrast it was set to, so no combination passes unseen; every failure message names its criterion (DSA-AC-3.5); `tests/accessibility-check.test.ts` asserts the coverage (DSA-T-16); the CI job `accessibility` runs it against the built web client. Set by #72. Planned change (DSA-F-15, Q385): 0 violations of every impact in 16 combinations, see the row "DSA-C-7 automated accessibility check". |
| DSA-F-17 settings remembered in the browser | `data-contrast`, `data-colour-vision`, and `data-motion` on `<html>`; one cookie `stash-a11y` (value `contrast:<c>.vision:<v>.motion:<m>`, one year, `Path=/`, `SameSite=Lax`, cookie characters only) read by the root layout; the component `AccessibilitySettings` (Radix popover with two switches and a radio group) applies a change at once and writes the cookie | `radix-ui` 1.6.7, React 19 | `packages/ui/src/accessibility.ts`, `accessibility-settings.tsx`; an unknown or missing part of the cookie falls back to its default. The profile takes over with DSA-F-9. Set by #71. Replaced by the concept of 2026-11-17 (DSA-F-17, DSA-NF-10): one cookie `stash-appearance` for the four values, see the row "DSA-C-5 device storage on request". |
| DSA-C-1 design token mechanism; DSA-F-1 | CSS custom properties in a Tailwind CSS `@theme` block (the row DSA-F-1 design tokens above); the selection of the colour tokens is `[data-theme]`, then `[data-colour-mode]` combined with `[data-theme]` for the light or dark palette | Tailwind CSS 4 | Planned (R4 concept). Set by: planned (R4 concept). |
| DSA-F-6, DSA-F-7, DSA-F-18, DSA-F-19 colour mode | The attribute `data-colour-mode` on `<html>` with the values `standard`, `high-contrast`, `alternative-red-green`, and `alternative-blue-yellow`; the 6 palettes of the three non-standard modes are `[data-colour-mode="…"]` rules, each with a light variant and a dark variant (`[data-colour-mode="…"][data-theme="dark"]` and `"night"`); without a stored value `@media (prefers-contrast: more)` selects `high-contrast` | Tailwind CSS 4 | Replaces `data-contrast` and `data-colour-vision`. The existing high-contrast palettes in `packages/ui/src/tokens.css` stay; the alternative-colours palettes are new and must pass DSA-NF-1 to DSA-NF-5. Set by: planned (R4 concept). |
| DSA-F-20 font sizes | The attribute `data-font-size` on `<html>` with `small`, `normal`, `large`; the stylesheet sets the root font size to `87.5%`, `100%`, and `125%`; every type, spacing, and radius token stays in `rem` | – | Planned (R4 concept). Set by: planned (R4 concept). |
| DSA-F-8, DSA-F-21 reduced motion and system preferences | `data-motion="reduced"` on `<html>` for the value; `@media (prefers-reduced-motion: reduce)` for the system preference; the rule that sets `animation: none`, `transition: none`, and `scroll-behavior: auto` stays | – | Planned (R4 concept). Set by: planned (R4 concept). |
| DSA-C-2 accessible component primitives | Radix UI (`radix-ui`): a non-modal popover for the Appearance menu holding a toggle group (theme), a radio group (colour mode), a toggle group (font size), and a switch (reduced motion) | `radix-ui` 1.6.7, React 19 | Planned (R4 concept); the theme control exists (`theme-switcher.tsx`). Set by: planned (R4 concept). |
| DSA-C-3 component catalogue | Storybook with the React and Vite framework (the row DSA-F-5 component documentation above); one story file per component, also for the Appearance menu and the status announcer | `storybook` 10.6, `@storybook/react-vite` 10.6 | Set by: planned (R4 concept). |
| DSA-C-4 system preference query | The media queries `prefers-color-scheme`, `prefers-contrast`, and `prefers-reduced-motion` in the stylesheet; `window.matchMedia` in the Appearance menu to show the value that applies | – | Set by: planned (R4 concept). |
| DSA-C-5 device storage on request | One cookie `stash-appearance` (value `theme:<t>.colour:<c>.size:<s>.motion:<m>`, one year, `Path=/`, `SameSite=Lax`, cookie characters only) read by the root layout through `headers()`; set only for a logged-in member, holding the chosen values only (a reset kind is left out), and deleted by every page drawn without a valid session (logout, expiry, password reset); replaces `stash-theme` and `stash-a11y` | Next.js (App Router) | The name has no word that points to a condition (DSA-NF-10). Each part is read on its own, so an unknown part is absent (DSA-E-1). `packages/ui/src/accessibility.ts` and `theme.ts` merge into one helper module. Set by: planned (R4 concept). |
| DSA-C-6 colour measurement | `tests/helpers/colour.ts`: WCAG contrast (exists), own implementation of CIEDE2000, and the Machado et al. 2009 matrices at severity 1.0 for protanopia, deuteranopia, and tritanopia (exists); no library | Node.js 24 | Replaces the CIE76 distance of `labDistance` for DSA-NF-2 and DSA-NF-3. Set by: planned (R4 concept). |
| DSA-C-7 automated accessibility check | `tests/accessibility/axe-check.ts` with `@axe-core/playwright` 4.13 and Playwright 1.63: all rules, the run fails on a violation of any impact (the `critical` filter is removed); 4 themes × 4 colour modes through the cookie `stash-appearance` of a logged-in test member, the Appearance menu closed and open; as a visitor without a session on every public page and the share-link page with the media emulation of the colour scheme (light, dark) and of the contrast preference (`more`, `no-preference`), 4 combinations | `@axe-core/playwright` 4.13, Playwright 1.63 | Planned change of the row DSA-F-15 (Q385). `tests/accessibility-check.test.ts` asserts the 16 combinations. Set by: planned (R4 concept). |
| DSA-C-8 screen readers for manual tests | NVDA with Firefox or Chrome on Windows, VoiceOver with Safari on macOS; the protocol `gam-ai-knowledge/tests/screen-reader-protocol.md` (the row DSA-F-14 above) | NVDA, VoiceOver (current releases) | Set by: planned (R4 concept). |
| Design-system tests | Node.js test runner on the token stylesheet, the theme and accessibility helpers, the components, and the package wiring (`tests/design-system.test.ts`, `tests/theme.test.ts`, `tests/accessibility-settings.test.ts`, `tests/accessibility-tokens.test.ts`, `tests/accessibility-components.test.ts`) | Node.js 24, TypeScript 5 | `tests/helpers/tokens-css.ts` parses the stylesheet and resolves the cascade of a visit (theme, contrast, colour vision, system contrast). Node.js does not run `.tsx`, so `tests/helpers/ui-build.ts` compiles `packages/ui` with `tsc` into a temporary folder in `packages/ui/node_modules/.cache` and renders the components with `react-dom/server`. Rendering in a browser is left to SCF-C-13. |

### Path patterns

Every file the project tracks is one of four kinds (RB-F-1, RB-F-2). Patterns are git pathspec globs: `*` matches within one path segment, `**` across any number of segments; `<module>` stands for the name a concept document gives a module in its §16. Filled from the tracked files (assumption A2); whether the `<module>` names equal the folder names is open (TODO Q1).

| Kind | Pattern | Notes |
| --- | --- | --- |
| keep | `apps/web/public/**` | Static images of the web unit (`next.svg`, `vercel.svg`) |
| keep | `apps/web/src/app/favicon.ico` | Binary icon |
| keep | `docs/**` | The teacher's binding documents and the exported AI chats |
| keep | `AGENTS.md`, `CHANGELOG.md`, `CLAUDE.local.md.example`, `apps/*/README.md` | Agent entry point, generated changelog, example of the personal file, unit readme |
| keep | `apps/*/.gitignore`, `packages/*/.gitignore`, `packages/db/.gitattributes` | Git ignore and attribute lists of a unit or package |
| keep | `pnpm-lock.yaml` | Written by pnpm, never by hand |
| keep | `packages/db/migrations/**` | Applied Prisma migrations are never edited (§3) |
| module | `apps/<module>/src/**` | Source of one unit |
| module | `packages/<module>/src/**` | Source of one shared package |
| module | `packages/ui/.storybook/*` | Storybook set-up of the `ui` package |
| module | `scripts/*.ts` | Root scripts (`changelog`, `sonar`) |
| test | `tests/**` | Acceptance and helper files at the repository root |
| test | `apps/*/src/**/*.test.ts` | Unit tests of a unit |
| test | `packages/*/src/**/*.test.ts` | Unit tests of a package |
| stack | `**/package.json`, `pnpm-workspace.yaml`, `turbo.json`, `biome.json`, `**/tsconfig*.json`, `commitlint.config.ts`, `.tool-versions` | Package manifests and tool configuration |
| stack | `docker-compose.yml`, `docker/**`, `packages/db/Dockerfile` | Container files and the configuration of the containers |
| stack | `.pre-commit-config.yaml`, `.semgrep.yml`, `.trivyignore`, `.semgrepignore`, `sonar-project.properties`, `.env.example`, `.env.sonar.example` | Scanner and environment configuration |
| stack | `apps/web/next.config.ts`, `apps/web/postcss.config.mjs`, `packages/db/prisma.config.ts` | Framework configuration |

### Stack files

One row per tracked stack file. Filled from the tracked files (assumption A3): JSON files carry their content minified; a row whose _Content_ is a TODO still needs the full content copied from the tracked file (open question Q2). The lock file `pnpm-lock.yaml` is no stack file.

| Path | Purpose | Content |
| --- | --- | --- |
| `.env.example` | Documented environment variables (names, defaults) | TODO: full content (file is tracked; copy it into this cell or a fenced block below) |
| `.env.sonar.example` | Documented SonarQube variables | TODO: full content (file is tracked; copy it into this cell or a fenced block below) |
| `.pre-commit-config.yaml` | pre-commit hooks | TODO: full content (file is tracked; copy it into this cell or a fenced block below) |
| `.semgrep.yml` | Semgrep rules | TODO: full content (file is tracked; copy it into this cell or a fenced block below) |
| `.semgrepignore` | Paths Semgrep skips | TODO: full content (file is tracked; copy it into this cell or a fenced block below) |
| `.tool-versions` | Pinned Node.js version | `nodejs 24.14.0` |
| `.trivyignore` | Trivy ignore list | TODO: full content (file is tracked; copy it into this cell or a fenced block below) |
| `apps/cms/package.json` | Package manifest of `@stash/cms` | `{"name":"@stash/cms","version":"0.1.0","private":true,"type":"module","main":"dist/index.js","types":"dist/index.d.ts","scripts":{"dev":"tsc -p tsconfig.build.json --watch --preserveWatchOutput","build":"tsc -p tsconfig.build.json","start":"node dist/main.js","lint":"biome check .","typecheck":"tsc --noEmit","test":"node --test \"src/**/*.test.ts\""},"dependencies":{"@stash/telemetry":"workspace:*"},"devDependencies":{"@stash/config":"workspace:*","@types/node":"^24"}}` |
| `apps/cms/tsconfig.build.json` | TypeScript configuration | `{"extends":"./tsconfig.json","compilerOptions":{"noEmit":false},"exclude":["src/**/*.test.ts"]}` |
| `apps/cms/tsconfig.json` | TypeScript configuration | `{"extends":"@stash/config/tsconfig.base.json","compilerOptions":{"outDir":"dist","rootDir":"src","types":["node"],"allowImportingTsExtensions":true,"rewriteRelativeImportExtensions":true,"noEmit":true},"include":["src"]}` |
| `apps/identity/package.json` | Package manifest of `@stash/identity` | `{"name":"@stash/identity","version":"0.1.0","private":true,"type":"module","main":"dist/index.js","types":"dist/index.d.ts","scripts":{"dev":"tsc --watch --preserveWatchOutput","build":"tsc","lint":"biome check .","typecheck":"tsc --noEmit","test":"node --test"},"devDependencies":{"@stash/config":"workspace:*"}}` |
| `apps/identity/tsconfig.json` | TypeScript configuration | `{"extends":"@stash/config/tsconfig.base.json","compilerOptions":{"outDir":"dist","rootDir":"src"},"include":["src"]}` |
| `apps/storage/package.json` | Package manifest of `@stash/storage` | `{"name":"@stash/storage","version":"0.1.0","private":true,"type":"module","main":"dist/index.js","types":"dist/index.d.ts","scripts":{"dev":"tsc --watch --preserveWatchOutput","build":"tsc","lint":"biome check .","typecheck":"tsc --noEmit","test":"node --test"},"devDependencies":{"@stash/config":"workspace:*"}}` |
| `apps/storage/tsconfig.json` | TypeScript configuration | `{"extends":"@stash/config/tsconfig.base.json","compilerOptions":{"outDir":"dist","rootDir":"src"},"include":["src"]}` |
| `apps/web/next.config.ts` | Next.js configuration | TODO: full content (file is tracked; copy it into this cell or a fenced block below) |
| `apps/web/package.json` | Package manifest of `@stash/web` | `{"name":"@stash/web","type":"module","version":"0.1.0","private":true,"scripts":{"dev":"next dev","build":"next build","start":"next start","lint":"biome check .","format":"biome format --write","typecheck":"next typegen && tsc --noEmit","test":"node --test \"src/**/*.test.ts\""},"dependencies":{"@stash/contracts":"workspace:*","@stash/ui":"workspace:*","next":"16.4.2","react":"19.2.8","react-dom":"19.2.8"},"devDependencies":{"@stash/config":"workspace:*","@tailwindcss/postcss":"^4","@types/node":"^24","@types/react":"^19","@types/react-dom":"^19","tailwindcss":"^4"}}` |
| `apps/web/postcss.config.mjs` | PostCSS configuration (Tailwind CSS) | TODO: full content (file is tracked; copy it into this cell or a fenced block below) |
| `apps/web/tsconfig.json` | TypeScript configuration | `{"extends":"@stash/config/tsconfig.base.json","compilerOptions":{"lib":["dom","dom.iterable","esnext"],"allowJs":true,"noEmit":true,"module":"preserve","moduleResolution":"bundler","resolveJsonModule":true,"isolatedModules":true,"jsx":"react-jsx","incremental":true,"plugins":[{"name":"next"}],"paths":{"@/*":["./src/*"]},"types":["node"],"declaration":false,"allowImportingTsExtensions":true,"erasableSyntaxOnly":true},"include":["next-env.d.ts","**/*.ts","**/*.tsx",".next/types/**/*.ts",".next/dev/types/**/*.ts","**/*.mts"],"exclude":["node_modules"]}` |
| `apps/worker/package.json` | Package manifest of `@stash/worker` | `{"name":"@stash/worker","version":"0.1.0","private":true,"type":"module","main":"dist/index.js","types":"dist/index.d.ts","scripts":{"dev":"tsc --watch --preserveWatchOutput","build":"tsc","lint":"biome check .","typecheck":"tsc --noEmit","test":"node --test"},"devDependencies":{"@stash/config":"workspace:*"}}` |
| `apps/worker/tsconfig.json` | TypeScript configuration | `{"extends":"@stash/config/tsconfig.base.json","compilerOptions":{"outDir":"dist","rootDir":"src"},"include":["src"]}` |
| `biome.json` | Biome lint and format configuration | `{"$schema":"https://biomejs.dev/schemas/2.4.2/schema.json","vcs":{"enabled":true,"clientKind":"git","useIgnoreFile":true},"files":{"ignoreUnknown":true,"includes":["**","!node_modules","!.next","!dist","!build","!.claude","!gam-ai-knowledge/tools","!gam-engineering","!gam-ai-memory","!**/src/prisma/contract.d.ts","!**/src/prisma/contract.json","!**/migrations"]},"formatter":{"enabled":true,"indentStyle":"space","indentWidth":2,"lineEnding":"lf"},"css":{"parser":{"tailwindDirectives":true}},"linter":{"enabled":true,"rules":{"recommended":true,"suspicious":{"noExplicitAny":"error"}},"domains":{"next":"recommended","react":"recommended"}},"assist":{"actions":{"source":{"organizeImports":"on"}}}}` |
| `commitlint.config.ts` | commitlint rules (Conventional Commits) | TODO: full content (file is tracked; copy it into this cell or a fenced block below) |
| `docker-compose.yml` | The local stack: all containers | TODO: full content (file is tracked; copy it into this cell or a fenced block below) |
| `docker/Caddyfile` | Reverse proxy configuration | TODO: full content (file is tracked; copy it into this cell or a fenced block below) |
| `docker/compose.offline-check.yml` | Observability stack configuration | TODO: full content (file is tracked; copy it into this cell or a fenced block below) |
| `docker/observability/alert-rules.template.yml` | Observability stack configuration | TODO: full content (file is tracked; copy it into this cell or a fenced block below) |
| `docker/observability/check-config.ts` | Check script of the observability configuration | TODO: full content (file is tracked; copy it into this cell or a fenced block below) |
| `docker/observability/collector.Dockerfile` | Container image definition | TODO: full content (file is tracked; copy it into this cell or a fenced block below) |
| `docker/observability/collector.yaml` | Observability stack configuration | TODO: full content (file is tracked; copy it into this cell or a fenced block below) |
| `docker/observability/grafana/dashboards/operations-overview.json` | Observability stack configuration | TODO: full content (file is tracked; copy it into this cell or a fenced block below) |
| `docker/observability/grafana/provisioning/dashboards/dashboards.yaml` | Observability stack configuration | TODO: full content (file is tracked; copy it into this cell or a fenced block below) |
| `docker/observability/grafana/provisioning/datasources/datasources.yaml` | Observability stack configuration | TODO: full content (file is tracked; copy it into this cell or a fenced block below) |
| `docker/observability/loki.Dockerfile` | Container image definition | TODO: full content (file is tracked; copy it into this cell or a fenced block below) |
| `docker/observability/loki.yaml` | Observability stack configuration | TODO: full content (file is tracked; copy it into this cell or a fenced block below) |
| `docker/observability/obs-config.Dockerfile` | Container image definition | TODO: full content (file is tracked; copy it into this cell or a fenced block below) |
| `docker/observability/prometheus.yml` | Observability stack configuration | TODO: full content (file is tracked; copy it into this cell or a fenced block below) |
| `docker/observability/tempo.Dockerfile` | Container image definition | TODO: full content (file is tracked; copy it into this cell or a fenced block below) |
| `docker/observability/tempo.template.yaml` | Observability stack configuration | TODO: full content (file is tracked; copy it into this cell or a fenced block below) |
| `docker/web.Dockerfile` | Container image definition | TODO: full content (file is tracked; copy it into this cell or a fenced block below) |
| `package.json` | Root package: workspace scripts through Turborepo | `{"name":"stash","private":true,"type":"module","packageManager":"pnpm@10.34.6","engines":{"node":">=24.14.0"},"scripts":{"dev":"turbo run dev","lint":"turbo run lint","typecheck":"turbo run typecheck","test":"turbo run test","build":"turbo run build","test:accessibility":"node tests/accessibility/axe-check.ts","changelog:draft":"node scripts/changelog.ts draft","sonar":"node scripts/sonar.ts","db:migrate":"pnpm --filter @stash/db run migrate","db:seed":"pnpm --filter @stash/db run seed"},"devDependencies":{"@axe-core/playwright":"^4.13.0","@biomejs/biome":"2.4.2","@commitlint/cli":"^21.2.3","@commitlint/config-conventional":"^21.2.3","@commitlint/lint":"^21.2.3","@commitlint/load":"^21.2.3","@commitlint/types":"^21.2.3","playwright":"1.63.0","turbo":"^2.11.7","typescript":"^5","yaml":"^2.9.1"}}` |
| `packages/config/package.json` | Package manifest of `@stash/config` | `{"name":"@stash/config","version":"0.1.0","private":true,"type":"module","files":["tsconfig.base.json"],"scripts":{"dev":"node -e \"console.log('nothing to watch')\"","build":"node -e \"console.log('nothing to build')\"","lint":"biome check .","typecheck":"node -e \"console.log('nothing to check')\"","test":"node -e \"console.log('nothing to test')\""}}` |
| `packages/config/tsconfig.base.json` | TypeScript configuration | `{"$schema":"https://json.schemastore.org/tsconfig","compilerOptions":{"target":"ES2023","module":"NodeNext","moduleResolution":"NodeNext","lib":["ES2023"],"strict":true,"declaration":true,"skipLibCheck":true,"esModuleInterop":true,"forceConsistentCasingInFileNames":true}}` |
| `packages/contracts/package.json` | Package manifest of `@stash/contracts` | `{"name":"@stash/contracts","version":"0.1.0","private":true,"type":"module","main":"dist/index.js","types":"dist/index.d.ts","exports":{".":{"types":"./dist/index.d.ts","default":"./dist/index.js"},"./web":{"types":"./dist/web/config.d.ts","default":"./dist/web/config.js"}},"scripts":{"lint":"biome check .","typecheck":"tsc --noEmit","build":"tsc && node src/generate-openapi.ts","dev":"tsc --watch --preserveWatchOutput","test":"node --test","openapi:generate":"node src/generate-openapi.ts"},"dependencies":{"@asteasolutions/zod-to-openapi":"8.5.0","zod":"4.6.7"},"devDependencies":{"@stash/config":"workspace:*","@types/node":"^24"}}` |
| `packages/contracts/tsconfig.json` | TypeScript configuration | `{"extends":"@stash/config/tsconfig.base.json","compilerOptions":{"outDir":"dist","rootDir":"src","types":["node"],"allowImportingTsExtensions":true,"rewriteRelativeImportExtensions":true},"include":["src"]}` |
| `packages/db/Dockerfile` | Image that runs the database migrations | TODO: full content (file is tracked; copy it into this cell or a fenced block below) |
| `packages/db/package.json` | Package manifest of `@stash/db` | `{"name":"@stash/db","version":"0.1.0","private":true,"type":"module","exports":{".":"./src/prisma/db.ts","./seed":"./src/seed.ts","./seed-data":"./src/seed-data.ts"},"scripts":{"lint":"biome check .","typecheck":"tsc --noEmit","build":"node -e \"console.log('nothing to build')\"","dev":"node -e \"console.log('nothing to run')\"","test":"node --test \"src/**/*.test.ts\"","contract:emit":"prisma contract emit","migration:plan":"prisma migration plan --name","migrate":"prisma db migrate --show && prisma db migrate","seed":"node src/seed.ts"},"dependencies":{"@prisma/orm-postgres":"8.0.0-rc.20","dotenv":"^18.0.4","pg":"8.22.0"},"devDependencies":{"@prisma/cli-engine":"0.9.0","@stash/config":"workspace:*","@types/node":"^24","@types/pg":"8.20.4","prisma":"8.0.0-rc.27"}}` |
| `packages/db/prisma.config.ts` | Prisma configuration | TODO: full content (file is tracked; copy it into this cell or a fenced block below) |
| `packages/db/tsconfig.json` | TypeScript configuration | `{"extends":"@stash/config/tsconfig.base.json","compilerOptions":{"noEmit":true,"declaration":false,"resolveJsonModule":true,"allowImportingTsExtensions":true,"rewriteRelativeImportExtensions":false,"types":["node"]},"include":["src","prisma.config.ts"]}` |
| `packages/telemetry/package.json` | Package manifest of `@stash/telemetry` | `{"name":"@stash/telemetry","version":"0.1.0","private":true,"type":"module","main":"dist/index.js","types":"dist/index.d.ts","exports":{".":{"types":"./dist/index.d.ts","default":"./dist/index.js"}},"files":["dist"],"scripts":{"dev":"tsc -p tsconfig.build.json --watch --preserveWatchOutput","build":"tsc -p tsconfig.build.json","lint":"biome check .","typecheck":"tsc --noEmit","test":"node --test \"src/**/*.test.ts\""},"devDependencies":{"@stash/config":"workspace:*","@types/node":"^24"}}` |
| `packages/telemetry/tsconfig.build.json` | TypeScript configuration | `{"extends":"./tsconfig.json","compilerOptions":{"noEmit":false},"exclude":["src/**/*.test.ts","src/test-support"]}` |
| `packages/telemetry/tsconfig.json` | TypeScript configuration | `{"extends":"@stash/config/tsconfig.base.json","compilerOptions":{"outDir":"dist","rootDir":"src","types":["node"],"allowImportingTsExtensions":true,"rewriteRelativeImportExtensions":true,"noEmit":true},"include":["src"]}` |
| `packages/ui/.storybook/main.ts` | Storybook configuration | TODO: full content (file is tracked; copy it into this cell or a fenced block below) |
| `packages/ui/.storybook/preview.ts` | Storybook configuration | TODO: full content (file is tracked; copy it into this cell or a fenced block below) |
| `packages/ui/.storybook/storybook.css` | Storybook configuration | TODO: full content (file is tracked; copy it into this cell or a fenced block below) |
| `packages/ui/package.json` | Package manifest of `@stash/ui` | `{"name":"@stash/ui","version":"0.1.0","private":true,"type":"module","main":"dist/index.js","types":"dist/index.d.ts","exports":{".":{"types":"./dist/index.d.ts","default":"./dist/index.js"},"./tokens.css":"./src/tokens.css"},"scripts":{"lint":"biome check .","typecheck":"tsc --noEmit","build":"tsc","dev":"tsc --watch --preserveWatchOutput","test":"node --test","storybook":"storybook dev -p 6006","build-storybook":"storybook build"},"dependencies":{"radix-ui":"1.6.7"},"peerDependencies":{"react":"^19.2.0","tailwindcss":"^4"},"devDependencies":{"@stash/config":"workspace:*","@storybook/react-vite":"10.6.1","@tailwindcss/vite":"4.3.3","@types/react":"^19","@types/react-dom":"^19.3.0","react":"19.2.8","react-dom":"19.2.8","storybook":"10.6.1","tailwindcss":"^4","vite":"8.3.3"}}` |
| `packages/ui/tsconfig.json` | TypeScript configuration | `{"extends":"@stash/config/tsconfig.base.json","compilerOptions":{"outDir":"dist","rootDir":"src","jsx":"react-jsx","lib":["ES2023","DOM"]},"include":["src"]}` |
| `pnpm-workspace.yaml` | pnpm workspace, supply-chain settings, and overrides | TODO: full content (file is tracked; copy it into this cell or a fenced block below) |
| `sonar-project.properties` | SonarQube scanner settings | TODO: full content (file is tracked; copy it into this cell or a fenced block below) |
| `tests/package.json` | Package manifest of `@stash/tests` | `{"name":"@stash/tests","version":"0.1.0","private":true,"type":"module","scripts":{"dev":"node --test --watch \"**/*.test.ts\"","build":"node -e \"console.log('nothing to build')\"","lint":"biome check .","typecheck":"tsc --noEmit","test":"node --test \"**/*.test.ts\""},"devDependencies":{"@stash/config":"workspace:*","@stash/db":"workspace:*","@types/node":"^24","@types/pg":"8.20.4","pg":"8.22.0"}}` |
| `tests/tsconfig.json` | TypeScript configuration | `{"extends":"@stash/config/tsconfig.base.json","compilerOptions":{"noEmit":true,"allowImportingTsExtensions":true,"types":["node"]},"include":["**/*.ts"]}` |
| `turbo.json` | Turborepo tasks | `{"$schema":"https://turborepo.dev/schema.json","tasks":{"dev":{"cache":false,"persistent":true},"lint":{},"test":{"cache":false,"dependsOn":["^build"],"passThroughEnv":["TEST_DATABASE_URL"]},"typecheck":{"dependsOn":["^build"]},"build":{"dependsOn":["^build"],"outputs":["dist/**",".next/**","!.next/cache/**"]}},"agentGuidance":false}` |

## 5. Stack ADRs

Technology choices with lock-in are recorded in `gam-ai-knowledge/adr/`.

## 10. Technology Skills

The installed skills that `/gam-engineering implement` and `review` load for this stack (P-DES-7). Keep one skill per situation; two skills covering the same framework rules stay out. _Loaded by_ is `implement`, `review`, or `gam-frontend (<situation>)`: the interface skills run through `gam-frontend`, which `implement` and `review` call for every change to an interface. The project has a web interface (Next.js, React, Radix UI, Tailwind CSS); the rows follow when `/gam-engineering frontend` has run.

| Situation | Skill | Loaded by |
| --- | --- | --- |
| _open_ — filled by `/gam-engineering frontend` | _open_ | _open_ |

## 11. Storage mapping & migration state

How the records of the concepts are stored, and how far the migrations have run. Filled from `packages/db` (assumption A4): the record names are the model names of the contract `packages/db/src/prisma/contract.prisma`; the other stores of the project proposal (Redis, MongoDB, CouchDB, SeaweedFS) hold no tracked layout yet (TODO Q3).

### Stored names

| Record | Store | Physical name | Indexes |
| --- | --- | --- | --- |
| AuthUser | PostgreSQL | `auth_users` | — |
| AuthSession | PostgreSQL | `auth_sessions` | `user_id` |
| AuthAccount | PostgreSQL | `auth_accounts` | `user_id` |
| AuthVerification | PostgreSQL | `auth_verifications` | `identifier` |
| User | PostgreSQL | `users` | — |
| Team | PostgreSQL | `teams` | — |
| TeamMember | PostgreSQL | `team_members` | `user_id` |
| Folder | PostgreSQL | `folders` | `team_id` |
| FolderPermission | PostgreSQL | `folder_permissions` | — |

### Migrations

| Migration files | Heads procedure | Migration state |
| --- | --- | --- |
| `packages/db/migrations/app/*/migration.json`, `packages/db/migrations/app/*/migration.ts`, `packages/db/migrations/app/*/ops.json`, `packages/db/migrations/snapshots/*/contract.json`, `packages/db/migrations/snapshots/*/contract.d.ts` | List the folder names under `packages/db/migrations/app`; the last name in sort order is the head | `20261102T1544_create_relational_schema` |
