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
| SCF-US-2 | Local development environment with Docker Compose | operator | to start all services locally with a single `docker compose up` | I can run the system without manual setup and without internet access | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| SCF-AC-2.1 | One start command | A machine with Docker and the images present | A developer runs `docker compose up` | PostgreSQL 18 (`postgres:18-alpine`), Redis, MongoDB, CouchDB, SeaweedFS, Strapi, ClamAV, and all apps start |
| SCF-AC-2.2 | Configuration by environment | The repository | A developer configures the stack | Every setting comes from `.env`, `.env.example` documents every variable, and the repository holds no secret |
| SCF-AC-2.3 | Start without internet | A machine without internet access | The stack starts | The application starts completely, and the external services (OAuth, captcha, e-mail) are switched off by `.env` or replaced locally (for example Mailpit) |
| SCF-AC-2.4 | Health checks | The running stack | A container starts | Every long-running container has a health check, each app waits for the services it depends on, and a one-shot container (`restart: "no"`) is waited for until it completed successfully |
| SCF-AC-2.5 | Clean images | The images the stack uses | A Trivy scan runs on them | No image has a known vulnerability of severity high or critical that has a fix, except an accepted exception with a written reason and an expiry date |
| SCF-AC-2.6 | Invalid configuration | A unit started with `PORT=abc` | It starts | It exits with a non-zero code and prints the name of the variable and the reason, never its value, and accepts no request |
| SCF-AC-2.7 | Native start | The reverse proxy and the data services running in the local stack | A developer runs the second start command | All units start outside containers and reload when their code changes |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. Recut on 2026-10-13 with the migration of the concept: four units are not runnable yet, so `SCF-AC-2.1` (one start command) is met only when the last unit has joined the stack (`qa-log.md`, Q35; concept §13, A11). Slices 3 and 4 get their issues and weights with `/engineering-human tickets`.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — Data services, reverse proxy, and `web` start with one command | SCF-AC-2.2, SCF-AC-2.4 (SCF-AC-2.1 for the services that run today) | — | #39 |
| 2 — Offline start and image scan | SCF-AC-2.3, SCF-AC-2.5 | 1 | #103 |
| 3 — All units in the stack | SCF-AC-2.1 (complete) | 1, and the issue that makes each unit runnable | — |
| 4 — Configuration check and native start | SCF-AC-2.6, SCF-AC-2.7 | 1 | — |

**Offline check (SCF-T-8, slice 2).** Run on 2026-10-28 by `schwaigc` with `docker/compose.offline-check.yml` (internal networks, no host ports, `--pull never --no-build`, `.env.example` unchanged): all nine services (postgres, redis, mongodb, couchdb, seaweedfs, clamav, mailpit, web, proxy) became healthy within 20 s; `web` reached neither a host name nor an IP address on the internet; `OAUTH_ENABLED` and `CAPTCHA_ENABLED` were `false`, e-mail went to `mailpit`, ClamAV ran without `freshclam`; through the proxy `/` answered 200 and `/api/docs` the API description. Two findings: `clamav/clamav:1.5` has no `arm64` image, so on ARM machines the check ran with `platform: linux/amd64` (#148); the `web` image needs the build of the workspace packages of !29. Repeated on 2026-10-29 with the probes written in the file header (step 3), the `web` image of !29, and `platform: linux/amd64` taken from `docker-compose.yml` of !33 instead of a local override: same result. The check covers the nine services of today; slice 3 runs it again once `identity`, `storage`, `worker`, and `cms` join the stack.

**Temporary `web` image.** Slice 1 builds `web` from `docker/web.Dockerfile`, a stop-gap accepted in the review of !17 so that `docker compose up` starts `web` before its owner's build exists. It ships the whole repository with its development dependencies and is not meant for a deployment; nobody builds on it. M9 (container build) of the [track plan Web](../../concepts/scaffolding.track-web.md) replaces it with `apps/web/Dockerfile` in slice 1 of SCF-US-8, deletes the stop-gap, and moves the health check of `web` from `/` to `/health`.

- **Story issue:** #39
- **Weight:** 5 (slice 1: 3, slice 2: 2; slices 3 and 4 not estimated yet)
- **Depends on:** SCF-US-1 (Set up the monorepo, #38)
