---
doc: story
format: gam-ai-knowledge/1
title: "SCF-US-8 Units reachable and visible"
audience: [product, developer, reviewer, agent]
id-prefix: "SCF"
---
# SCF-US-8 Units reachable and visible

One user story of [Scaffolding & shared contracts](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was added on 2026-10-13 with the migration of the concept: the status page, the health reports, and the routing through the reverse proxy had requirements but no story (concept §13, Q14). Its criteria come from the worked examples 1, 2, and 7 of the concept.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| SCF-US-8 | Units reachable and visible | operator | to reach every unit under one address and to see on a status page whether each one is healthy | I notice at once when a part of the system is not working | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| SCF-AC-8.1 | One origin | The running local stack | A browser requests `/health`, `/api/identity/health`, `/api/storage/health`, and `/cms/health` at the one address of the reverse proxy | Each request is answered by the health report of `web`, `identity`, `storage`, and `cms`; no path reaches `worker` |
| SCF-AC-8.2 | Health report | The `identity` unit whose database answers in 40 ms | Its health endpoint is requested | The report names the unit, its version, the status `ok`, and the check `relational-database` as essential and `ok` |
| SCF-AC-8.3 | Failed dependency | The `identity` unit whose database does not answer within 1000 ms | Its health endpoint is requested | The report shows the check `relational-database` as `down` and the status `down` |
| SCF-AC-8.4 | Status page | The running local stack with `storage` stopped | The operator opens the status page | It shows one row per unit with its name and its status as text; `storage` shows `down` and the other four rows show their own status |
| SCF-AC-8.5 | Accessible status page | The status page | A person uses it with the keyboard only or with a screen reader | Every row is read with its column headers, and no status is shown by colour alone |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. Proposed cut of 2026-10-13; the issues and weights follow with `/engineering-human tickets`.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — Health reports under one origin | SCF-AC-8.1, SCF-AC-8.2, SCF-AC-8.3 | — | — |
| 2 — Status page | SCF-AC-8.4, SCF-AC-8.5 | 1 | — |

- **Story issue:** — (not created yet)
- **Weight:** not estimated yet
- **Depends on:** SCF-US-2 (Local development environment with Docker Compose, #39), SCF-US-3 (Shared contracts with Zod and OpenAPI, #40)
