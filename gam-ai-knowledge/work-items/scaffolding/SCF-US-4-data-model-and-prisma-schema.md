---
doc: story
format: gam-ai-knowledge/1
title: "SCF-US-4 Data model and Prisma schema"
audience: [product, developer, reviewer, agent]
id-prefix: "SCF"
---
# SCF-US-4 Data model and Prisma schema

One user story of [Scaffolding & shared contracts](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-04 and brought into this form on 2026-10-06; its owner reviews the wording. On 2026-10-27 the command of `SCF-AC-4.5` was changed to its Prisma 8 name (`scaffolding.qa-log.md`, Q26). On 2026-11-02 the story was cut into two slices: the Vertabelo diagram (SCF-AC-4.1) is a human step and its own slice (`qa-log.md`, Q213).

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| SCF-US-4 | Data model and Prisma schema | operator | a documented relational data model with versioned migrations | users, teams, permissions, and folders are stored consistently | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| SCF-AC-4.1 | ER diagram | The project documentation | A reader opens the data model | It shows the ER diagram created in Vertabelo, with plural table names as the SQL style guide demands |
| SCF-AC-4.2 | Schema matches diagram | The Prisma schema (Prisma ≥ 8) | A developer compares it with the ER diagram | The schema maps the diagram and its migrations are versioned in the repository |
| SCF-AC-4.3 | Own users table | The relational schema | A user is created | An own `users` table holds a row in a 1:1 relation to the Better Auth user table |
| SCF-AC-4.4 | Seed data | A fresh local database | The seed script runs | Test data (user, team, folder) exists for local development |
| SCF-AC-4.5 | Migrations at start | A container of the stack | It starts | `prisma db migrate` (in Prisma 8 the successor of `prisma migrate deploy`) finishes without errors |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. A story of this weight needs more than one slice of at most 4 h (`WORKFLOW.md`, "Issues and weight"); its owner cuts them in the concept document.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — Schema, migrations, seed, migrating at start | SCF-AC-4.2, SCF-AC-4.3, SCF-AC-4.4, SCF-AC-4.5 | — | #41 |
| 2 — ER diagram in Vertabelo | SCF-AC-4.1 (human step: draw the diagram of `scaffolding.md` §8 in Vertabelo, export it, embed it) | slice 1 | #151 |

- **Story issue:** #41
- **Weight:** 5 (slice 1: 4, slice 2: 1)
- **Depends on:** SCF-US-2 (Local development environment with Docker Compose, #39)
