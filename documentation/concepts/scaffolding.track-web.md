---
doc: concept
format: legacy   # pre-engineering-human section numbers; migrated on the next change (P-DOC-5, ADR-0002)
title: "Scaffolding & shared contracts"
audience: [product, developer, reviewer, agent]
id-prefix: "SCF"
---
# R1 Track: Web — Christopher Schwaiger

Plan file of one track of `scaffolding.md` (§16, Q13). **Only Christopher edits this file.** Requirements, interfaces, and examples come from [scaffolding.md](scaffolding.md); this file never restates them, it references them by ID.

## Owned paths

Nobody else changes these; a needed change here is requested as an issue for Christopher.

- unit folder `web`
- contracts folder `web`
- `STACK.md` §4

## Interfaces

Provides:

- `web` health endpoint (SCF-F-5)
- accessible status page (SCF-F-8, SCF-U-1…3, SCF-E-3)

Consumes (interface fixed in `scaffolding.md`; work is never blocked, stub until the code is merged):

- HealthReport — contracts core (#7)
- internal health paths and ports of every unit (§8); tested with stubbed responses

## Issues (Sprint 1)

- #15 `web` unit skeleton with health endpoint (3 h, W1)
- #16 accessible status page (4 h, W2)
- Free capacity ≈ 9 h: Phase 1 of R4 (design system & accessibility modes)

Every issue: feature branch → MR into `dev`, reviewed by another person (`documentation/WORKFLOW.md`).

## Plan

_Written by Christopher before the first MR._

### Module specification

Neutral pseudocode and types per `MANIFEST.md` Phase 5; each module lists `Traces to:` and `Requires:`.

### Order of work

### Test cases

Taken from `scaffolding.md` §10 and the acceptance criteria of the issues above.
