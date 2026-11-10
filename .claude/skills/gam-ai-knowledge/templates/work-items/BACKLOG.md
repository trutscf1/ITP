---
doc: backlog
format: gam-ai-knowledge/1
title: Product backlog
audience: [product, developer, reviewer, agent]
---
# Product backlog

Every user story that is not done yet, across all epics, in the order it will be built. Read it to see what comes next; ROADMAP.md orders the epics, this file orders their stories (P-DOC-8).

The story files are the source: their `status` and `sprint` fields decide what stands here, and a row is updated in the same step as its story file. A story leaves the table when it reaches the integration branch (`done`; `dev`, or `main` in branch model trunk).

| # | Story | Epic | Status | Sprint | Weight | Issue |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | [[DOC]-US-[n] [Title]](E[nn]-[feature]/[DOC]-US-[n]-[slug].md) | E[nn] [Feature name] | [backlog \| ready \| in-progress \| review] | [n or —] | [1 \| 2 \| 3 \| 5 \| 8] | [#n or —] |
