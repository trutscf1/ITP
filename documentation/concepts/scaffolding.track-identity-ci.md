---
doc: concept
format: legacy   # pre-engineering-human section numbers; migrated on the next change (P-DOC-5, ADR-0002)
title: "Scaffolding & shared contracts"
audience: [product, developer, reviewer, agent]
id-prefix: "SCF"
---
# R1 Track: Identity & CI — Andreas Tschuden

Plan file of one track of `scaffolding.md` (§15, Q13). **Only Andreas edits this file.** Requirements, interfaces, and examples come from [scaffolding.md](scaffolding.md); this file never restates them, it references them by ID.

## Owned paths

Nobody else changes these; a needed change here is requested as an issue for Andreas.

- unit folder `identity`
- contracts folder `identity`
- CI definition
- hook configuration (pre-commit, commit-msg) and scanner configuration
- `STACK.md` §3

## Interfaces

Provides:

- `identity` health endpoint with essential database check (SCF-F-5…7)
- CI pipeline with all jobs of SCF-F-15, running the root tasks
- local hooks (SCF-F-13, SCF-F-14)

Consumes (interface fixed in `scaffolding.md`; work is never blocked, stub until the code is merged):

- HealthReport and configuration helper — contracts core (#7)
- root task names (SCF-F-12) — workspace root (#6)
- relational database of the local stack (#18); until then any local instance configured by environment

## Issues (Sprint 1)

- #9 CI pipeline: lint, typecheck, test, build, commit-message check (4 h, W1)
- #10 `identity` unit with health endpoint and database check (4 h, W2)
- #11 CI security jobs (4 h, W3)
- #17 pre-commit and commit-msg hooks (3 h, W3)

Every issue: feature branch → MR into `dev`, reviewed by another person (`documentation/WORKFLOW.md`).

## Plan

_Written by Andreas before the first MR._

### Module specification

Neutral pseudocode and types per `MANIFEST.md` Phase 5; each module lists `Traces to:` and `Requires:`.

### Order of work

### Test cases

Taken from `scaffolding.md` §9 and the acceptance criteria of the issues above.
