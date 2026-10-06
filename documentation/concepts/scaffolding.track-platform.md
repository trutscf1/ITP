---
doc: concept
format: legacy   # pre-engineering-human section numbers; migrated on the next change (P-DOC-5, ADR-0002)
title: "Scaffolding & shared contracts"
audience: [product, developer, reviewer, agent]
id-prefix: "SCF"
---
# R1 Track: Platform & cms — Fabian Trutschnig

Plan file of one track of `scaffolding.md` (§15, Q13). **Only Fabian edits this file.** Requirements, interfaces, and examples come from [scaffolding.md](scaffolding.md); this file never restates them, it references them by ID.

## Owned paths

Nobody else changes these; a needed change here is requested as an issue for Fabian.

- repository root configuration: workspace, root tasks, shared lint / format / type configuration, ignore and attribute files
- `CHANGELOG.md`
- container stack definition
- reverse proxy configuration
- unit folder `cms`
- contracts folder `cms`
- `STACK.md` §1

## Interfaces

Provides:

- workspace root with the root tasks `dev`, `build`, `lint`, `typecheck`, `test` (SCF-F-12) — first MR in W1 (#6)
- local stack: one command starts all five units, reverse proxy, relational database (SCF-F-2)
- proxy routes exactly as in the routing table (§7, SCF-F-4)
- `cms` health endpoint (SCF-F-5)
- release `dev` → `main` once per sprint

Consumes (interface fixed in `scaffolding.md`; work is never blocked, stub until the code is merged):

- HealthReport and configuration helper (§7, SCF-F-11) — code from the contracts core (#7)
- each unit's container build in its unit folder, answering `/health` on the port of §7

## Issues (Sprint 1)

- #4 set up project documentation and agent guidance (1 h, W1)
- #5 `STACK.md` platform section (1 h, W1)
- #6 workspace root, shared tooling config, `CHANGELOG.md` skeleton (3 h, W1)
- #18 local container stack and reverse proxy routing (4 h, W2)
- #19 `cms` unit with health endpoint (4 h, W3)
- #21 proxy routing test for all health paths (2 h, W4)
- #22 integration check and release v0.1.0 (2 h, W4)
- Sprint 2: #20 native dev command (2 h), #14 changelog draft command (2 h)

Every issue: feature branch → MR into `dev`, reviewed by another person (`documentation/WORKFLOW.md`).

## Plan

_Written by Fabian before the first MR._

### Module specification

Neutral pseudocode and types per `MANIFEST.md` Phase 5; each module lists `Traces to:` and `Requires:`.

### Order of work

### Test cases

Taken from `scaffolding.md` §9 and the acceptance criteria of the issues above.
