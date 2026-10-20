---
doc: story
format: engineering-human/2
title: "SCF-US-4 Data model and Prisma schema"
audience: [product, developer, reviewer, agent]
id-prefix: "SCF"
---
# SCF-US-4 Data model and Prisma schema

One user story of [Scaffolding & shared contracts](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-04 and brought into this form on 2026-10-06; its owner reviews the wording.

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
| SCF-AC-4.5 | Migrations at start | A container of the stack | It starts | `prisma migrate deploy` finishes without errors |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. A story of this weight needs more than one slice of at most 4 h (`WORKFLOW.md`, "Issues and weight"); its owner cuts them in the concept document.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | SCF-AC-4.1, SCF-AC-4.2, SCF-AC-4.3, SCF-AC-4.4, SCF-AC-4.5 | — | #41 |

- **Story issue:** #41
- **Weight:** 5
- **Depends on:** SCF-US-2 (Local development environment with Docker Compose, #39)
