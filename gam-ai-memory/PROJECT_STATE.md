---
doc: project-state
format: gam-ai-memory/1
title: Project state
audience: [developer, agent]
updated: "2026-11-10"
---
# Project state

The overall state of the project, updated at every handover. The task in progress is in [CURRENT_TASK.md](CURRENT_TASK.md).

## Goal

See [GOAL.md](../gam-ai-knowledge/GOAL.md).

## What works

- [open] — see the stages in [ROADMAP.md](../gam-ai-knowledge/ROADMAP.md) and the team positions in [ROADMAP-DETAILS.md](../gam-ai-knowledge/ROADMAP-DETAILS.md).

## In progress

- See [ROADMAP-DETAILS.md](../gam-ai-knowledge/ROADMAP-DETAILS.md); the running task is [CURRENT_TASK.md](CURRENT_TASK.md).

## Health

| Check | State | As of |
| --- | --- | --- |
| Build | unknown — `pnpm run build` | 2026-11-10 |
| Tests | unknown — `pnpm test` (database tests need `TEST_DATABASE_URL`) | 2026-11-10 |
| Lint | unknown — `pnpm run lint` | 2026-11-10 |

## Repository

- **Default branch:** `dev` (releases are tagged on `main`)
- **Last release:** v0.1.0
