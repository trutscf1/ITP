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
| Runtime & language | _open_ | | |
| SCF-C-1 workspace & task runner | _open_ | | |
| Shared lint / format / type configuration | _open_ | | |
| SCF-C-13 unit test runner (shared) | _open_ | | |
| SCF-C-7 container runtime & stack | _open_ | | |
| SCF-C-6 reverse proxy | _open_ | | |
| SCF-C-8 relational database | _open_ | | |
| SCF-C-5 content management system | _open_ | | |
| SCF-C-12 changelog draft generator | _open_ | | |

Module mapping (folder layout), configuration & secrets, build/run commands: _open_.

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
