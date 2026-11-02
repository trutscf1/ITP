---
doc: story
format: engineering-human/2
title: "SCF-US-7 Project documentation and Definition of Done"
audience: [product, developer, reviewer, agent]
id-prefix: "SCF"
---
# SCF-US-7 Project documentation and Definition of Done

One user story of [Scaffolding & shared contracts](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-48 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| SCF-US-7 | Project documentation and Definition of Done | teacher or new team member | a complete project documentation | I can follow the architecture, the setup, and the way the project works | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| SCF-AC-7.1 | Architecture overview | The project documentation | A reader opens the architecture overview | It shows a diagram of the four areas and all databases |
| SCF-AC-7.2 | Setup guide | The project documentation | A reader looks for the setup | It holds a setup guide (local and offline) and notes on operation and deployment |
| SCF-AC-7.3 | Definition of Done | The project documentation | A team member looks up the Definition of Done | It is defined there and binding |
| SCF-AC-7.4 | ER diagram included | The project documentation | A reader opens the data model | The ER diagram is embedded |
| SCF-AC-7.5 | Licence notes | The project documentation | A reader checks the licences | It lists licence notes for all used content and dependencies |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — Documentation in the README | SCF-AC-7.1, SCF-AC-7.2, SCF-AC-7.3, SCF-AC-7.5; embeds a draft ER diagram | — | #85 |
| 2 — ER diagram from Vertabelo | SCF-AC-7.4 | SCF-US-4 slice 2 (the Vertabelo export, #SLICE2) | #109 |

- **Story issue:** #85
- **Weight:** 3 (slice 1: 2, slice 2: 1)
- **Depends on:** none for slice 1; SCF-US-4 slice 2 (ER diagram in Vertabelo, #SLICE2) for slice 2
