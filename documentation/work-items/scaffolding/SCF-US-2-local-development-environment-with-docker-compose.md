---
doc: story
format: engineering-human/2
title: "SCF-US-2 Local development environment with Docker Compose"
audience: [product, developer, reviewer, agent]
id-prefix: "SCF"
---
# SCF-US-2 Local development environment with Docker Compose

One user story of [Scaffolding & shared contracts](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-02 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| SCF-US-2 | Local development environment with Docker Compose | developer | to start all services locally with a single `docker compose up` | I can develop without manual setup and without internet access | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| SCF-AC-2.1 | One start command | A machine with Docker and the images present | A developer runs `docker compose up` | PostgreSQL 18 (`postgres:18-alpine`), Redis, MongoDB, CouchDB, SeaweedFS, Strapi, ClamAV, and all apps start |
| SCF-AC-2.2 | Configuration by environment | The repository | A developer configures the stack | Every setting comes from `.env`, `.env.example` documents every variable, and the repository holds no secret |
| SCF-AC-2.3 | Start without internet | A machine without internet access | The stack starts | The application starts completely, and the external services (OAuth, captcha, e-mail) are switched off by `.env` or replaced locally (for example Mailpit) |
| SCF-AC-2.4 | Health checks | The running stack | A container starts | Every container has a health check and each app waits for the services it depends on |
| SCF-AC-2.5 | Clean images | The images the stack uses | A Trivy scan runs on them | No image has a known vulnerability of severity high or critical |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. Proposed cut of 2026-10-06, made before the architecture chapter exists, so that each slice fits into 4 h (`WORKFLOW.md`, "Issues and weight"); the owner may recut it.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — Stack starts with one command | SCF-AC-2.1, SCF-AC-2.2, SCF-AC-2.4 | — | #39 |
| 2 — Offline start and image scan | SCF-AC-2.3, SCF-AC-2.5 | 1 | #103 |

- **Story issue:** #39
- **Weight:** 5 (slice 1: 3, slice 2: 2)
- **Depends on:** SCF-US-1 (Set up the monorepo, #38)
