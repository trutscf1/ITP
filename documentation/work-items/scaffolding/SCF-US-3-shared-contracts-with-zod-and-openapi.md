---
doc: story
format: engineering-human/2
title: "SCF-US-3 Shared contracts with Zod and OpenAPI"
audience: [product, developer, reviewer, agent]
id-prefix: "SCF"
---
# SCF-US-3 Shared contracts with Zod and OpenAPI

One user story of [Scaffolding & shared contracts](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-03 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| SCF-US-3 | Shared contracts with Zod and OpenAPI | developer | to define API contracts and validation rules once in a shared package | client and server validate with the same rules and contract breaks show up early | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| SCF-AC-3.1 | Contracts package | The package `@nimbus/contracts` | A developer adds a request or response | Its Zod schema (Zod ≥ 4) lives in a file of its own in that package |
| SCF-AC-3.2 | Same schema on both sides | A form in the client and its API endpoint on the server | Both validate input | They import the same schema |
| SCF-AC-3.3 | Generated OpenAPI | The contracts package | The OpenAPI specification is generated with `zod-to-openapi` | It is served at `/api/docs` |
| SCF-AC-3.4 | Uniform error format | Any API endpoint | A request fails | The error response follows one common format without internal details (no stack trace, no SQL) |
| SCF-AC-3.5 | Breaking change fails | A schema change that breaks a consumer | The typecheck runs | The typecheck fails |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | SCF-AC-3.1, SCF-AC-3.2, SCF-AC-3.3, SCF-AC-3.4, SCF-AC-3.5 | — | #40 |

- **Story issue:** #40
- **Weight:** 3
- **Depends on:** SCF-US-1 (Set up the monorepo, #38)
