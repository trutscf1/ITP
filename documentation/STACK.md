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
| DSA-F-1 design tokens | CSS custom properties in a Tailwind CSS `@theme` block (`packages/ui/src/tokens.css`, exported as `@stash/ui/tokens.css`) | Tailwind CSS 4 | The `@theme` values are the light theme; dark, sepia, and night override the colour tokens on `[data-theme]`. Set by #68. |
| DSA-F-2 theme switching and memory | `data-theme` on `<html>`, cookie `stash-theme` (one year, `SameSite=Lax`) read by the root layout | – | `packages/ui/src/theme.ts`; the profile takes over with DSA-F-16. Set by #68. |
| DSA-F-3 component primitives | Radix UI (`radix-ui`) styled with Tailwind CSS | `radix-ui` 1.6.7, React 19 | First component: the theme switcher (toggle group). Set by #68. |
| Design-system tests | Node.js test runner on the token stylesheet, the theme helpers, and the package wiring (`tests/design-system.test.ts`, `tests/theme.test.ts`) | Node.js 24 | Rendering in a browser is left to SCF-C-13. |

## 5. Stack ADRs

Technology choices with lock-in are recorded in `documentation/adr/`.
