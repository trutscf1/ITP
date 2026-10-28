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

Every capability of `concepts/scaffolding.md` §7 and `concepts/public-content.md` §7 and where its technology stands. The index only points to the track sections; it holds no technology of its own, except the capabilities added on 2026-10-13 that no section maps yet. Their owner moves the row into the own section when the technology is chosen.

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
| SCF-C-20 | Accessibility checker | section 3 (row "Accessibility check in CI") | `tschudea07` |
| SCF-C-21 | Data model diagram tool | _open_ — Vertabelo per `SCF-AC-4.1` | `tschudea07` |
| PUB-C-1 | Localized content management | to be chosen by the owner; builds on SCF-C-5 (section 1) | `trutscf1` |
| PUB-C-2 | Password hashing | to be chosen by the owner | `trutscf1` |
| PUB-C-3 | Safe rich text rendering | to be chosen by the owner | `trutscf1` |
| PUB-C-4 | Accessibility check of public pages | section 3 (SCF-C-20, row "Accessibility check in CI"); the pages are added by the owner of `web` | `tschudea07` |

## 1. Platform — `trutscf1`

| Capability | Technology | Version constraint | Notes |
| --- | --- | --- | --- |
| Runtime & language | Node.js, TypeScript (strict, no `any`) | Node.js 24 LTS ≥ 24.14.0 (`.tool-versions`, `engines`); TypeScript 5 | School minimum (`docs/anforderungen_software_projekte.md`). Set by #38 (SCF-US-1). |
| SCF-C-1 workspace & task runner | pnpm workspaces, Turborepo | pnpm 10 (`packageManager`); Turborepo 2 | One lockfile at the root; every unit and package provides the tasks `dev`, `build`, `lint`, `typecheck`, `test` (SCF-F-12), and each runs across the workspace through `turbo run`. Set by #38 and #102. |
| Shared lint / format / type configuration | Biome (lint, format); shared TypeScript base config | Biome 2.4; `@stash/config` | `biome.json` at the root, generated Prisma files excluded, `noExplicitAny` set to `error`; `packages/config/tsconfig.base.json` with `strict`, extended by every unit including `web`. Set by #38 and #102. |
| SCF-C-13 unit test runner (shared) | Node.js test runner (`node --test`), TypeScript by type stripping | Node.js 24 | Provisional, for the acceptance tests (`tests/`, the workspace package `@stash/tests`) and the unit tests of every package; the owner may replace it. Browser end-to-end runner: section 4. |
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
| SCF-C-3 web application framework | Next.js with the App Router and React; server-side route handlers for `/health` and `/api/docs`, the status page rendered on the server for every request (see the row _Rendering_ below) | Next.js ≥ 16.3 (pinned 16.4.2; 16.4.1 or higher fixes GHSA-2464-fhr4-w9xw, GHSA-673q-mjm6-r5xr, GHSA-p3m5-59mp-jv5r), React ≥ 19.2 (pinned 19.2.8) | Minimum versions by the school (`docs/anforderungen_software_projekte.md`), checked by SCF-T-4. Plan: `concepts/scaffolding.track-web.md`. Set by #113. |
| SCF-C-13 browser end-to-end test runner | Playwright (Chromium) | `playwright` 1.63.0, exact; the CI image tag `mcr.microsoft.com/playwright:v1.63.0-noble` matches it | Already used at the root by the accessibility check (`tests/accessibility/axe-check.ts`, with `@axe-core/playwright`); the end-to-end tests of R6 (WEB-US-4) use the same version. Set by #113. |
| Unit test runner of `web` | Node.js test runner (`node --test`) with type stripping, the shared runner of section 1; test files `apps/web/src/**/*.test.ts` without JSX | Node.js 24 | Components under test are written with React `createElement` in `.ts` files and rendered with `react-dom/server`. Plan: `concepts/scaffolding.track-web.md`. Set by #113. |
| Rendering of `/health`, `/status`, `/api/docs` | Dynamic on every request: each handler first awaits `connection()` from `next/server`, so `next build` prerenders none of them and never calls another unit | Next.js ≥ 16.3 | Checked by W-19 (prerender manifest). Set by #113. |
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
