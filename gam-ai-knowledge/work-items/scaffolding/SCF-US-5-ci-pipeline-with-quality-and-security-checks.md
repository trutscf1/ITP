---
doc: story
format: gam-ai-knowledge/1
title: "SCF-US-5 CI pipeline with quality and security checks"
audience: [product, developer, reviewer, agent]
id-prefix: "SCF"
---
# SCF-US-5 CI pipeline with quality and security checks

One user story of [Scaffolding & shared contracts](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-05 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| SCF-US-5 | CI pipeline with quality and security checks | team member | every merge request to be checked automatically | faulty or insecure code is not merged into `dev` | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| SCF-AC-5.1 | Pipeline triggers | A change on a feature branch, on `dev`, or on `main` | The change is pushed | The GitLab CI pipeline runs |
| SCF-AC-5.2 | Pipeline steps | A pipeline run | It executes | It runs Biome check, typecheck, unit tests, accessibility checks (axe), `pnpm audit`, and a container scan (Trivy) |
| SCF-AC-5.3 | Failing conditions | A pipeline run | A lint error, a failed test, or a vulnerability of severity high or critical that has a fix occurs, unless it is an accepted exception with a written reason and an expiry date | The pipeline fails |
| SCF-AC-5.4 | Run time | A pipeline run with the Turborepo cache | It finishes | It took less than 10 minutes |
| SCF-AC-5.5 | Visible status | An open merge request | A reviewer opens it | The pipeline status is visible before the merge |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. Proposed cut of 2026-10-06, made before the architecture chapter exists, so that each slice fits into 4 h (`WORKFLOW.md`, "Issues and weight"); the owner may recut it.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — Pipeline runs and shows its status | SCF-AC-5.1, SCF-AC-5.4, SCF-AC-5.5 | — | #42 |
| 2 — Check steps and failing conditions | SCF-AC-5.2, SCF-AC-5.3 | 1 | #104 |

- **Story issue:** #42
- **Weight:** 5 (slice 1: 2, slice 2: 3)
- **Depends on:** SCF-US-1 (Set up the monorepo, #38)
