---
doc: adr
format: engineering-human/2
title: "Adopt engineering-human; legacy concept documents migrate on touch"
audience: [product, developer, reviewer, agent]
status: accepted
date: "2026-10-06"
deciders: ["trutscf1"]
overrides: []
supersedes: []
---
# ADR-0002 — Adopt engineering-human; legacy concept documents migrate on touch

## In plain words

The project now follows the `engineering-human` skill instead of its predecessor `engineering-profile`. Every session starts with `/engineering-human`, the project has one written goal, and user stories live as files next to the concept documents. Documents written in the old format stay valid and are converted the next time someone changes them.

## Context

The project was set up on 2026-09-29 with `engineering-profile`. Its successor adds a project goal (P-GOAL-1…3), documents readable by people and agents alike (P-HUM-1…4), a work-item tree for user stories (P-DOC-6), a merge policy (P-MR-4…6), and status discipline (P-ROAD-4). Every `P-…` ID kept its number and meaning. The decisions of the migration are in [qa-log.md](../qa-log.md), Q1–Q6.

## Decision

1. `engineering-human` replaces `engineering-profile` as the binding profile (Q1, Q2).
2. The project goal `G-1` is the one in [GOAL.md](../GOAL.md) (Q3).
3. The merge policy is `ask`, with 1 approval and release merge `ask`, in `.claude/settings.json` (Q5).
4. The issue and merge-request templates of the skill replace the earlier ones in `.gitlab/`, and the labels follow `WORKFLOW.md` (Q6).
5. Legacy concept documents are migrated on touch (P-DOC-5). Legacy at the time of this decision:
   - `concepts/scaffolding.md`
   - `concepts/scaffolding.track-platform.md`
   - `concepts/scaffolding.track-storage.md`
   - `concepts/scaffolding.track-identity-ci.md`
   - `concepts/scaffolding.track-web.md`
6. The project runs in team mode (Q4); the switch is a separate change (`/engineering-human team`).

## Consequences

- The glossary and the ADRs moved to `documentation/CONTEXT.md` and `documentation/adr/` (P-DOC-2); `docs/` keeps only the school requirements and the agent configuration.
- The user stories US-01…US-48 that exist as GitLab issues #38–#85 have no work-item file yet. Each one gets its story file, its ID with the concept's prefix, and its feature issue when the concept of its feature is written or migrated (P-TRK-2).
- Issue weight follows P-TRK-3 (relative effort 1, 2, 3, 5, 8) instead of "weight = hours"; the hours are the issue's time estimate (`WORKFLOW.md`, "Tracker").
- The school requirements in `docs/` still win over the profile; the existing deviation from P-GIT-2 (branches are kept) stays as recorded in `WORKFLOW.md`.
