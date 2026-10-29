---
doc: adr
format: engineering-human/2
title: "Generate the code of each sprint from the documents, tests first"
audience: [product, developer, reviewer, agent]
status: accepted
date: "2026-10-20"
deciders: ["trutscf1"]
overrides: []
supersedes: []
---
# ADR-0005 — Generate the code of each sprint from the documents, tests first

## In plain words

In every sprint the team first writes and reviews the documents of the sprint's features, including the tests. When the documents are ready, the code is generated from them, tests before code. A rehearsal per sprint proves that a feature can be rebuilt from its documents alone.

## Context

The team can work on Tuesday for 200 minutes and not in school holidays, about 53 h per person for the whole project. Writing every line by hand does not fit; the goal is a project that can be generated completely from its Markdown documents. Decided in [qa-log.md](../qa-log.md), Q191 to Q193.

## Decision

- Each milestone follows the sprint cycle in `WORKFLOW.md`: concept `ready` (phases 1–6 including §17), code generated per story with the failing test commit first, review by another person, release MR, regeneration probe.
- Test first is part of the Definition of Done (`WORKFLOW.md`, items 15 and 16): the test commit carrying the `AC` ID comes before the first code commit, and every acceptance criterion is covered by a test with its ID. No CI check of the commit order (Q192).
- Per sprint one feature is regenerated in an empty worktree from its concept document and tests only; the final milestone repeats this for the whole project (Q193).

## Consequences

- Gaps found by a probe are fixed in the documents first, then the code is regenerated.
- The capacity and milestone planning counts human hours for documents, tests, and review, not for typing code (`ROADMAP.md`, "Capacity").
- Hard to reverse once the documents are the only source: hand-edited code that is not reflected in the documents is concept drift and is fixed in the documents first (P-GIT-5).
