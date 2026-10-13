---
doc: concept
format: legacy   # pre-engineering-human section numbers; migrated on the next change (P-DOC-5, ADR-0002)
title: "Scaffolding & shared contracts"
audience: [product, developer, reviewer, agent]
id-prefix: "SCF"
---
# R1 Track: Contracts, storage & worker — Yannick Schaub

Plan file of one track of `scaffolding.md` (§16, Q13). **Only Yannick edits this file.** Requirements, interfaces, and examples come from [scaffolding.md](scaffolding.md); this file never restates them, it references them by ID.

## Owned paths

Nobody else changes these; a needed change here is requested as an issue for Yannick.

- contracts package core: health shape, configuration helper, OpenAPI generation
- unit folders `storage` and `worker`
- contracts folders `storage` and `worker`
- `STACK.md` §2

## Interfaces

Provides:

- contracts core: HealthReport, DependencyCheck, configuration helper with SCF-E-1 output — first MR in W1 (#7)
- OpenAPI generation command (SCF-F-10)
- `storage` health endpoint (SCF-F-5)
- `worker` internal health endpoint, no proxy route (SCF-F-4, SCF-F-5)

Consumes (interface fixed in `scaffolding.md`; work is never blocked, stub until the code is merged):

- root task names (SCF-F-12) — workspace root (#6)

## Issues (Sprint 1)

- #7 contracts core: HealthReport, configuration helper (4 h, W1)
- #8 OpenAPI generation command (2 h, W2)
- #12 `storage` unit with health endpoint (3 h, W2)
- #13 `worker` unit with internal health endpoint (3 h, W3)
- Free capacity ≈ 4 h: Phase 1 of R5 (storage core)

Every issue: feature branch → MR into `dev`, reviewed by another person (`documentation/WORKFLOW.md`).

## Plan

_Written by Yannick before the first MR._

### Module specification

Neutral pseudocode and types per `MANIFEST.md` Phase 5; each module lists `Traces to:` and `Requires:`.

### Order of work

### Test cases

Taken from `scaffolding.md` §10 and the acceptance criteria of the issues above.
