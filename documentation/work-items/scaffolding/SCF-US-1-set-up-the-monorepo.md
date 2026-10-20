---
doc: story
format: engineering-human/2
title: "SCF-US-1 Set up the monorepo"
audience: [product, developer, reviewer, agent]
id-prefix: "SCF"
---
# SCF-US-1 Set up the monorepo

One user story of [Scaffolding & shared contracts](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-01 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| SCF-US-1 | Set up the monorepo | operator | a uniformly set up monorepo with pnpm and Turborepo | all four areas build, lint, and test the same way, so the system I run is built reproducibly | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| SCF-AC-1.1 | Workspace layout | A fresh clone of the repository | A developer lists the workspace packages | The five units `web`, `identity`, `storage`, `worker`, `cms` and the packages `contracts`, `ui`, `config` exist in one pnpm workspace run by Turborepo |
| SCF-AC-1.2 | Strict TypeScript | Any package of the workspace | `pnpm run lint` runs on code that uses `any` | TypeScript runs in strict mode and the Biome rule `noExplicitAny` reports an error |
| SCF-AC-1.3 | Root tasks | The repository on `dev` | `pnpm run lint` (Biome check), `pnpm run typecheck`, and `pnpm run build` run through Turborepo | All three finish without errors |
| SCF-AC-1.4 | Pinned versions | The repository root | A developer reads `.tool-versions` and `engines` | Node.js 24 LTS (≥ 24.14.0) is set there, and Next.js is ≥ 16.3 and React ≥ 19.2 |
| SCF-AC-1.5 | Quick start | A new developer with the README | They follow it | It contains a short guide to start the project |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. Proposed cut of 2026-10-06, made before the architecture chapter exists, so that each slice fits into 4 h (`WORKFLOW.md`, "Issues and weight"); the owner may recut it.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — Workspace and root tasks | SCF-AC-1.1, SCF-AC-1.3, SCF-AC-1.4 | — | #38 |
| 2 — Strict typing and quick start | SCF-AC-1.2, SCF-AC-1.5 | 1 | #102 |

- **Story issue:** #38
- **Weight:** 5 (slice 1: 3, slice 2: 2)
- **Depends on:** none
