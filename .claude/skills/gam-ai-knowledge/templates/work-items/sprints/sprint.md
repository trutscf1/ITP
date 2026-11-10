---
doc: sprint
format: gam-ai-knowledge/1
title: "Sprint [n]"
audience: [product, developer, reviewer, agent]
sprint: [n]
---
# Sprint [n]

The sprint backlog of milestone `Sprint [n]`: the stories planned into this sprint and how far each has come. It stays as the record of the sprint after it ends (P-DOC-8). Save it as `sprints/sprint-[n].md`.

- **Goal:** [one sentence — required in `goal` mode]
- **Dates:** [start – end in `dated` and `fixed` mode; delete the line in `goal` mode]
- **Milestone:** `Sprint [n]` (in `goal` mode `Sprint [n] — [goal]`)

## Stories

Every story whose `sprint` field is [n], in the order of the product backlog. A story carried over to the next sprint moves to that file, and its `sprint` field follows.

| Story | Epic | Status | Weight | Issue |
| --- | --- | --- | --- | --- |
| [[DOC]-US-[n] [Title]](../E[nn]-[feature]/[DOC]-US-[n]-[slug].md) | E[nn] [Feature name] | [ready \| in-progress \| review \| done] | [1 \| 2 \| 3 \| 5 \| 8] | [#n] |
