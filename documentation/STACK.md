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

The single place where technology and version constraints live (`MANIFEST.md`, "The Stack Document"). **Split into one section per track** (`concepts/scaffolding.md` §15, Q13): only the section's owner edits it. Minimum versions required by the school: `docs/anforderungen_software_projekte.md` ("Projektanforderungen für projekte"); technology agreed in the proposal: `docs/projektantrag.md`.

Every row traces to the capability IDs (`SCF-C-x`, later other prefixes) that demand it.

## 1. Platform — `trutscf1`

| Capability | Technology | Version constraint | Notes |
| --- | --- | --- | --- |
| Runtime & language | Node.js, TypeScript (strict, no `any`) | Node.js 24 LTS ≥ 24.14.0 (`.tool-versions`, `engines`); TypeScript 5 | School minimum (`docs/anforderungen_software_projekte.md`). Set by #38 (SCF-US-1). |
| SCF-C-1 workspace & task runner | pnpm workspaces, Turborepo | pnpm 10 (`packageManager`); Turborepo 2 | One lockfile at the root; every unit and package provides the tasks `dev`, `build`, `lint`, `typecheck`, `test` (SCF-F-12), and each runs across the workspace through `turbo run`. Set by #38 and #102. |
| Shared lint / format / type configuration | Biome (lint, format); shared TypeScript base config | Biome 2.4; `@stash/config` | `biome.json` at the root, generated Prisma files excluded, `noExplicitAny` set to `error`; `packages/config/tsconfig.base.json` with `strict`, extended by every unit including `web`. Set by #38 and #102. |
| SCF-C-13 unit test runner (shared) | Node.js test runner (`node --test`), TypeScript by type stripping | Node.js 24 | Provisional, for the acceptance tests (`tests/`, the workspace package `@stash/tests`) and the unit tests of every package; the owner may replace it. Browser end-to-end runner: section 4. |
| SCF-C-7 container runtime & stack | Docker, Docker Compose | Compose v2; images pinned to a tag (`postgres:18-alpine`, `redis:8-alpine`, `mongo:8.0`, `couchdb:3.5`, `chrislusf/seaweedfs:4.05`, `clamav/clamav:1.5`, `axllent/mailpit:v1.27`, `caddy:2-alpine`) | SCF-US-2. `docker-compose.yml`: every setting from `.env` (documented in `.env.example`, secrets as `${NAME:?…}` without a default), a health check per service, `depends_on` with `service_healthy`; data services published on `127.0.0.1` only. `web` is built from `docker/web.Dockerfile` (Node.js as in `.tool-versions`). Mailpit replaces outgoing e-mail; OAuth and captcha are off by default (SCF-NF-2); ClamAV starts with the definitions of its image (`CLAMAV_NO_FRESHCLAMD`). The tests are `tests/docker-compose.test.ts`. |
| SCF-C-6 reverse proxy | Caddy | `caddy:2-alpine` | One origin on `PROXY_PORT`, plain HTTP (TLS with R14); routes in `docker/Caddyfile`, only `/` to `web` until the other units run; `/proxy-health` is answered by the proxy for its health check. |
| SCF-C-8 relational database | PostgreSQL | 18 (`postgres:18-alpine`) | Data in the volume `postgres-data` mounted at `/var/lib/postgresql` (PostgreSQL 18 layout). Prisma is set up by SCF-US-4. |
| SCF-C-5 content management system | _open_ | | |
| SCF-C-12 changelog draft generator | _open_ | | |

Module mapping (folder layout), set by #38:

| Path | Package | Role |
| --- | --- | --- |
| `apps/web` | `@stash/web` | Unit `web` (Next.js app) |
| `apps/identity`, `apps/storage`, `apps/worker`, `apps/cms` | `@stash/<unit>` | The other four units; empty until their issues |
| `packages/contracts`, `packages/ui`, `packages/config` | `@stash/<name>` | Shared packages; `config` holds the TypeScript base config |
| `tests/` | `@stash/tests` | Acceptance tests that run at the repository root |

Build/run commands (root): `pnpm install`, `pnpm dev`, `pnpm run lint`, `pnpm run typecheck`, `pnpm run build`, `pnpm test`. Configuration & secrets: _open_.

## 2. Contracts, storage & worker — `schauby1`

| Capability | Technology | Version constraint | Notes |
| --- | --- | --- | --- |
| SCF-C-2 schemas & OpenAPI generation | _open_ | | |
| SCF-C-4 HTTP server framework (`storage`) | _open_ | | |
| `worker` runtime | _open_ | | |

Type mapping (neutral type → concrete type) and error mapping (`E-x` → concrete representation): _open_.

## 3. Identity & CI — `tschudea07`

| Capability | Technology | Version constraint | Notes |
| --- | --- | --- | --- |
| SCF-C-4 HTTP server framework (`identity`) | _open_ | | |
| Database access layer (`identity`) | _open_ | | |
| SCF-C-9 CI service | GitLab CI | – | Q4. `.gitlab-ci.yml`: one pipeline per change (merge request pipeline while an MR is open, otherwise branch pipeline); lint, typecheck, test, build in parallel on the `node` image of the version in `.tool-versions`; 10-minute job timeout; pnpm store cached by lockfile, Turborepo cache per job, shared by all branches (SCF-US-5) |
| SCF-C-10 secret scanner, code scanner, dependency auditor, container image scanner | Gitleaks, Semgrep, `pnpm audit`, Trivy | Gitleaks 8.30.0, Semgrep 1.148.0, Trivy 0.69.3 | From `docs/security_next_js.md`: `.gitleaks.toml`, `.semgrep.yml` (registry rule sets passed with `--config`, `.claude/` ignored), `.pre-commit-config.yaml` locally and the same files in CI. `pnpm audit --prod --audit-level=high`. Trivy scans every image of `docker-compose.yml` with `--ignore-unfixed`; accepted upstream findings in `.trivyignore`, each with reason and expiry (SCF-US-5) |
| Accessibility check in CI | axe with Playwright | Playwright 1.63.0 (pinned; equals the CI image tag), `@axe-core/playwright` | `tests/accessibility/axe-check.ts` against the built web client; fails on a critical violation. Pages are added there with R4 (`../qa-log.md`, Q27) |
| SCF-C-11 commit message linter | commitlint | `@commitlint/cli` 21 | `commitlint.config.ts`: Conventional Commits, scope list and requirement ID of `WORKFLOW.md`; commit-msg hook through `.pre-commit-config.yaml`, CI job `commit-messages`. Changelog draft and release notes: `scripts/changelog.ts` (`pnpm run changelog:draft`); CI jobs `release-notes` and `release` (GitLab CLI image 1.74.0) publish the GitLab Release on a SemVer tag (SCF-US-6) |

## 4. Web — `schwaigc`

| Capability | Technology | Version constraint | Notes |
| --- | --- | --- | --- |
| SCF-C-3 web application framework | _open_ | | |
| SCF-C-13 browser end-to-end test runner | _open_ | | |

## 5. Stack ADRs

Technology choices with lock-in are recorded in `documentation/adr/`.
