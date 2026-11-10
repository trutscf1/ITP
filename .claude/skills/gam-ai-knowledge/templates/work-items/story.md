---
doc: story
format: gam-ai-knowledge/1
title: "[DOC]-US-[n] [Title]"
audience: [product, developer, reviewer, agent]
id-prefix: "[DOC]"
status: backlog
sprint: ""
---
# [DOC]-US-[n] [Title]

One user story of [[Feature name]](epic.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2).

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| [DOC]-US-[n] | [Title] | [role from GOAL.md] | [capability] | [benefit] | [Must \| Should \| Could] |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| [DOC]-AC-[n].1 | [title] | [state with values] | [action] | [observable outcome with values] |

## Slices

The vertical slices that deliver this story, as designed in the concept document §16. One slice is delivered by the story issue itself; every further slice is a child issue of it.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| [1 — slice title from §16] | [DOC]-AC-[n].1 | — | [#n — the story issue] |

- **Story issue:** [#n — filled in by `/gam-engineering tickets`]
- **Weight:** [1, 2, 3, 5, or 8] — above 8: split the story here first (P-TRK-3)
- **Depends on:** — [or `[DOC]-US-[n] — reason, A[n] or Q[n]`: a dependency kept in the INVEST check (P-QB-3)]

<!-- status: backlog → ready (issue published) → in-progress → review → done (reached the integration branch: dev, or main in branch model trunk). sprint: the number n of milestone `Sprint <n>` once planned. Add `shipped: "v<x.y.z>"` only if this story shipped in another release than its epic. Every change is mirrored in ../BACKLOG.md and ../sprints/sprint-<n>.md in the same step (P-DOC-8). -->
