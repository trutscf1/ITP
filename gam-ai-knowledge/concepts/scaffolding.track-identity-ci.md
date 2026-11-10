---
doc: concept
format: legacy   # pre-engineering-human section numbers; migrated on the next change (P-DOC-5, ADR-0002)
title: "Scaffolding & shared contracts"
audience: [product, developer, reviewer, agent]
id-prefix: "SCF"
---
# R1 Track: Identity & CI — Andreas Tschuden

Plan file of one track of `scaffolding.md` (§16, Q13). **Only Andreas edits this file.** Requirements, interfaces, and examples come from [scaffolding.md](scaffolding.md); this file never restates them, it references them by ID.

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

The issues #9, #10, #11, #17 of the first cut were deleted on 2026-09-29; the CI part of this track is now tracked by the story issues of SCF-US-5 and SCF-US-6 ([work items](../work-items/scaffolding/feature.md)):

- #42 SCF-US-5 slice 1 — pipeline runs and shows its status (SCF-AC-5.1, 5.4, 5.5)
- #104 SCF-US-5 slice 2 — check steps and failing conditions (SCF-AC-5.2, 5.3)
- #44 SCF-US-6 — Conventional Commits check and changelog draft (SCF-AC-6.1…6.3)

The `identity` unit with its health endpoint has no issue yet; it follows with the Identity concept (R3).

Every issue: feature branch → MR into `dev`, reviewed by another person (`gam-ai-knowledge/WORKFLOW.md`).

## Plan

_Written by Andreas before the first MR._

### Module specification

The CI part has no runtime modules: it is configuration. Its parts and what they trace to:

- `.gitlab-ci.yml` — workflow rules (one pipeline per change) and the check jobs. Traces to: SCF-F-15, SCF-AC-5.1…5.5. Requires: root tasks (SCF-F-12), `pnpm-lock.yaml`, `.tool-versions`.
- `.gitlab/ci/docs.yml` — documentation checks, included unchanged.
- Local hooks and scanner configuration — SCF-F-13, SCF-F-14, with #44 and #104.

### Order of work

1. #42: workflow rules, lint/typecheck/test/build jobs, caches, 10-minute timeout.
2. #104: security jobs (secret scan, code scan, `pnpm audit`, Trivy) and the failing thresholds.
3. #44: commit-message check (hook and CI job) and the changelog draft command.

### Test cases

The configuration is tested statically in `tests/ci-pipeline.test.ts` (seam agreed in `../qa-log.md`, Q23): the workflow rules are evaluated for pushes to a feature branch, `dev`, and `main`, and for merge request events; job definitions, caches, and the timeout are read from the file. Run time and the status on the MR are shown by a real pipeline run, linked in the MR.
