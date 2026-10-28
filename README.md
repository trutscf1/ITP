# Self-hosted cloud storage platform

A cloud storage platform that schools, clubs, and small companies run on their own server: upload, organize, search, and share files, and use them offline. School project of HTL Villach, class 5BHITM, subject ITP (project 1), built by a team of four.

The project goal, its target users, and its non-goals are in [documentation/GOAL.md](documentation/GOAL.md).

## Status

Early scaffold. What exists today:

- a pnpm and Turborepo workspace with the five units in `apps/` and the shared packages in `packages/`; the Next.js application is the `web` unit in `apps/web/` (App Router, React, Tailwind CSS, Biome, Prisma), the other units are empty
- a `docker-compose.yml` that starts PostgreSQL 18, Redis, MongoDB, CouchDB, SeaweedFS, ClamAV, Mailpit, a Caddy reverse proxy, and the `web` unit; the other four units join when their code runs
- the project documentation in `documentation/`

Everything else in the architecture below is planned. The current state of every feature is in [documentation/ROADMAP.md](documentation/ROADMAP.md) and [documentation/ROADMAP-DETAILS.md](documentation/ROADMAP-DETAILS.md).

## Quick start

Requirements: Docker with Docker Compose, Node.js 24 LTS, and pnpm.

```bash
# 1. configuration: copy the example and set your own values
cp .env.example .env

# 2. start the stack (data services, mail catcher, reverse proxy, web)
docker compose up -d

# 3. start the web application
pnpm install
pnpm --filter @stash/web dev
```

The stack serves the web application at <http://localhost:8080> (`PROXY_PORT`) and catches all e-mail in Mailpit at <http://localhost:8025>. The first start takes a few minutes. All settings come from `.env`; OAuth and captcha are off there, so the stack starts offline once the images are present. For hot reload, run step 3 against `docker compose up -d postgres` with the line `DATABASE_URL=postgresql://stash:change-me@localhost:5432/stash_db` in `apps/web/.env` (user, password, port, and database as in `.env`, host `localhost`).

Checks:

```bash
pnpm run lint                                  # Biome check of every package, through Turborepo
pnpm run typecheck                             # TypeScript check of every package
pnpm run build                                 # build of every package
pnpm test                                      # tests of every package, including the acceptance tests of the repository
pnpm dev                                       # the dev task of every package (watch mode), through Turborepo
node tools/doc-check.mjs documentation          # consistency check of the documentation
npx markdownlint-cli2 "documentation/**/*.md"   # markdown lint
```

## Start without internet access

The school requires that the application starts locally without internet access. What that needs today:

1. Prepare once while online: `docker compose pull` (PostgreSQL and MongoDB images) and `pnpm install` (fills the local pnpm store).
2. Afterwards, offline: `docker compose up -d`, `pnpm install --offline`, then start the web application as in the quick start.
3. Settings that decide whether a feature may use the internet live in `.env` and are never hard-coded. Features that need the internet (login with GitHub, Google, or Microsoft, bot protection) must be switchable off there; they arrive with the identity feature (R3, [ROADMAP.md](documentation/ROADMAP.md)).

Known gap: the starter layout loads its fonts through `next/font/google`, which fetches them at build time. A build without internet fails until the fonts are bundled locally.

## Architecture overview

The target architecture is five separately running units behind one reverse proxy, one per area of the team ([ADR-0001](documentation/adr/0001-five-units-behind-one-origin.md)). The browser reaches `web`, `identity`, `storage`, and `cms` under one origin; `worker` is internal.

```mermaid
flowchart LR
  browser([Browser / installable web app]) --> proxy[Reverse proxy]
  proxy --> web[web: web client]
  proxy --> identity[identity: accounts, teams, permissions]
  proxy --> storage[storage: files and folders]
  proxy --> cms[cms: public content]
  storage --> worker[worker: thumbnails, virus scan, OCR, search index]
  identity --> pg[(PostgreSQL)]
  storage --> pg
  storage --> mongo[(MongoDB)]
  storage --> objects[(Object storage)]
  identity --> redis[(Redis)]
  worker --> redis
  worker --> mongo
  worker --> objects
  web --> couch[(CouchDB: offline sync)]
```

| Area | Unit | Planned content |
| --- | --- | --- |
| Identity & sharing | `identity` | registration, login, multi-factor authentication, teams, roles, permissions, share links, quotas, audit log |
| Storage engine & processing | `storage`, `worker` | storage API, resumable uploads, deduplication, thumbnails, virus scan, text recognition, search |
| Web client & design system | `web` | file browser, preview, themes, accessibility modes |
| Offline, content & observability | `cms` | installable offline web app, landing page, help center, changelog, metrics, logs, traces |

The planned technology is listed in the project proposal ([docs/projektantrag.md](docs/projektantrag.md)); binding choices and versions are recorded in [documentation/STACK.md](documentation/STACK.md) as they are made. The units share their data shapes through one contracts package.

## Data model

Draft of the relational schema, derived from the project proposal (`docs/projektantrag.md`). Table names are plural, as the SQL style guide of the school demands. The binding diagram, created in Vertabelo, and the Prisma schema come with the story *Data model and Prisma schema* (`SCF-US-4`, [documentation/work-items/scaffolding/](documentation/work-items/scaffolding/)); they replace this draft. The application's own `users` table is in a 1:1 relation to the table of the authentication library.

```mermaid
erDiagram
  auth_users ||--|| users : "1:1"
  users ||--o{ team_members : joins
  teams ||--o{ team_members : has
  users ||--o{ folders : owns
  folders ||--o{ folders : "parent of"
  folders ||--o{ files : contains
  folders ||--o{ folder_permissions : "is granted by"
  teams ||--o{ folder_permissions : receives
  users ||--o{ folder_permissions : receives
  users ||--o{ share_links : creates
  files ||--o{ share_links : "is shared by"
  folders ||--o{ share_links : "is shared by"
  users ||--o| storage_quotas : has
  users ||--o{ audit_logs : causes
```

## Operation and deployment

What exists today and what is planned (`documentation/ROADMAP.md`, R14 *Deployment*):

| Topic | Today | Planned |
| --- | --- | --- |
| Start | `docker compose up -d` starts PostgreSQL and MongoDB; the web application is started by hand | One command starts every unit, the reverse proxy, and the databases |
| Configuration | Variables in `.env` (copy of `.env.example`, never committed) | The same, for every unit |
| Data | Named Docker volumes `postgres-data`, `postgres-etc`, `mongo-data`, and `mongo-config` | Backup and restore notes with the deployment |
| Deployment | None | The GitLab CI pipeline deploys the whole stack to the team's own server when `main` is updated, TLS terminated by the reverse proxy |
| Monitoring | None | Metrics, logs, and traces in Prometheus, Loki, Tempo, and Grafana (R2) |

Releases are tagged `v<version>` on `main` and published as GitLab Releases; the rules are in [documentation/WORKFLOW.md](documentation/WORKFLOW.md), section *Releases*.

## Documentation

| Where | What |
| --- | --- |
| [documentation/GOAL.md](documentation/GOAL.md) | Project goal, target users, success signals, non-goals |
| [documentation/ROADMAP.md](documentation/ROADMAP.md) | Features in dependency order, with owner and stage |
| [documentation/concepts/](documentation/concepts/) | One concept document per feature |
| [documentation/work-items/](documentation/work-items/) | User stories with their acceptance criteria |
| [documentation/adr/](documentation/adr/) | Decision records |
| [documentation/WORKFLOW.md](documentation/WORKFLOW.md) | Branches, commits, merge requests, Definition of Done, releases |
| [documentation/team/TEAM.md](documentation/team/TEAM.md) | Team members, roles, ownership |
| [docs/](docs/) | The school's binding requirements and the project proposal |

## Definition of Done

The Definition of Done is binding for every issue and merge request: [documentation/WORKFLOW.md](documentation/WORKFLOW.md), section *Definition of Done*. It is kept only there so that it cannot drift; a merge request is merged only when every item holds.

## Working on the project

Every change starts with an issue, happens on its own branch, and reaches `dev` through a merge request reviewed by another person; `main` only receives releases. The rules are in [documentation/WORKFLOW.md](documentation/WORKFLOW.md), the commands in [docs/git_workflow_commands.md](docs/git_workflow_commands.md). Sessions with Claude Code start with `/engineering-human` ([CLAUDE.md](CLAUDE.md)).

## Licence notes

The repository is public, so all content must be licence-free. Licences of what the project uses today (the licence of a dependency is the one it declares; check again when a version changes):

| Component | Licence | Use |
| --- | --- | --- |
| Next.js, React, Tailwind CSS (`@tailwindcss/postcss`, `@tailwindcss/vite`) | MIT | web application; `@tailwindcss/vite` builds the styles of Storybook |
| Radix UI (`radix-ui`) | MIT | accessible primitives of the design system (`@stash/ui`) |
| Storybook (`storybook`, `@storybook/react-vite`), Vite | MIT | component documentation of the design system (`packages/ui`) |
| Zod, zod-to-openapi (`@asteasolutions/zod-to-openapi`) | MIT | shared contracts and the generated API description (`packages/contracts`) |
| dotenv | BSD-2-Clause | reads the `.env` file in the web application |
| Prisma | Apache-2.0 | database access |
| TypeScript | Apache-2.0 | language |
| Biome | MIT or Apache-2.0 | lint and format |
| pnpm, Turborepo | MIT | package manager and task runner |
| commitlint | MIT | checks commit messages |
| yaml | ISC | reads the CI configuration in tests and scripts |
| Playwright | Apache-2.0 | browser tests |
| `@axe-core/playwright` | MPL-2.0 | accessibility tests |
| PostgreSQL 18 (Docker image) | PostgreSQL Licence | relational database, runs as a container |
| MongoDB 8.0 (Docker image) | SSPL | metadata database, runs as a container; not part of the delivered source |
| Redis 8.8 (Docker image) | RSALv2, SSPLv1, or AGPLv3, at the user's choice | sessions and cache, runs as a container |
| CouchDB 3.5 (Docker image) | Apache-2.0 | offline sync database, runs as a container |
| SeaweedFS 4.51 (Docker image) | Apache-2.0 | object storage, runs as a container |
| ClamAV 1.5 (Docker image) | GPL-2.0 | virus scanner, runs as a container; not part of the delivered source |
| Mailpit 1.32 (Docker image) | MIT | catches all outgoing e-mail of the local stack |
| Caddy 2.11 (Docker image) | Apache-2.0 | reverse proxy of the local stack |
| Geist and Geist Mono fonts | SIL Open Font Licence 1.1 | loaded by the starter layout |
| `next.svg` and `vercel.svg` in `apps/web/public/` | logos of Vercel (third party), shipped with the Next.js starter | **to be replaced** by own assets before the final submission; `file.svg`, `globe.svg`, and `window.svg` of the starter are unused and to be deleted |

Open points: MongoDB's SSPL is not an OSI-approved licence, so the team decides whether the proposal's choice stays (issue #110); third-party content added later is entered here when it is added.
