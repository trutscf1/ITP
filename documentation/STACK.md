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

Every capability of `concepts/scaffolding.md` §7 and where its technology stands. The index only points to the track sections; it holds no technology of its own, except the capabilities added on 2026-10-13 that no section maps yet. Their owner moves the row into the own section when the technology is chosen.

| ID | Capability | Technology | Owner |
| --- | --- | --- | --- |
| SCF-C-1 | Workspace and task runner | section 1 | `trutscf1` |
| SCF-C-2 | Schemas | section 2 | `schauby1` |
| SCF-C-3 | Web application framework | section 4 | `schwaigc` |
| SCF-C-4 | HTTP server framework | sections 2 and 3 | `schauby1`, `tschudea07` |
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
| SCF-C-20 | Accessibility checker | _open_ — axe per `SCF-AC-5.2` | `schwaigc` |
| SCF-C-21 | Data model diagram tool | _open_ — Vertabelo per `SCF-AC-4.1` | `tschudea07` |

## 1. Platform — `trutscf1`

| Capability | Technology | Version constraint | Notes |
| --- | --- | --- | --- |
| Runtime & language | Node.js, TypeScript (strict, no `any`) | Node.js 24 LTS ≥ 24.14.0 (`.tool-versions`, `engines`); TypeScript 5 | School minimum (`docs/anforderungen_software_projekte.md`). Set by #38 (SCF-US-1). |
| SCF-C-1 workspace & task runner | pnpm workspaces, Turborepo | pnpm 10 (`packageManager`); Turborepo 2 | One lockfile at the root; tasks `lint`, `typecheck`, `build` run through `turbo run`. Set by #38. |
| Shared lint / format / type configuration | Biome (lint, format); shared TypeScript base config | Biome 2.4; `@stash/config` | `biome.json` at the root, generated Prisma files excluded; `packages/config/tsconfig.base.json` with `strict`. Set by #38. |
| SCF-C-13 unit test runner (shared) | Node.js test runner (`node --test`), TypeScript by type stripping | Node.js 24 | Provisional, for the acceptance tests of #38 (`tests/`); the owner may replace it. Browser end-to-end runner: section 4. |
| SCF-C-7 container runtime & stack | _open_ | | |
| SCF-C-6 reverse proxy | _open_ | | |
| SCF-C-8 relational database | _open_ | | |
| SCF-C-5 content management system | _open_ | | |
| SCF-C-12 changelog draft generator | _open_ | | |

Module mapping (folder layout), set by #38:

| Path | Package | Role |
| --- | --- | --- |
| `apps/web` | `@stash/web` | Unit `web` (Next.js app) |
| `apps/identity`, `apps/storage`, `apps/worker`, `apps/cms` | `@stash/<unit>` | The other four units; empty until their issues |
| `packages/contracts`, `packages/ui`, `packages/config` | `@stash/<name>` | Shared packages; `config` holds the TypeScript base config |
| `tests/` | – | Acceptance tests that run at the repository root |

Build/run commands (root): `pnpm install`, `pnpm run lint`, `pnpm run typecheck`, `pnpm run build`, `pnpm test`. Configuration & secrets: _open_.

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
| SCF-C-9 CI service | GitLab CI | – | Q4 |
| SCF-C-10 secret scanner, code scanner, dependency auditor, container image scanner | _open_ | | start from `docs/security_next_js.md` |
| SCF-C-11 commit message linter | _open_ | | |

## 4. Web — `schwaigc`

| Capability | Technology | Version constraint | Notes |
| --- | --- | --- | --- |
| SCF-C-3 web application framework | _open_ | | |
| SCF-C-13 browser end-to-end test runner | _open_ | | |

## 5. Stack ADRs

Technology choices with lock-in are recorded in `documentation/adr/`.
