---
doc: story
format: gam-ai-knowledge/1
title: "WEB-US-1 File browser"
audience: [product, developer, reviewer, agent]
id-prefix: "WEB"
---
# WEB-US-1 File browser

One user story of [Web client: dashboard, file browser, preview](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-32 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| WEB-US-1 | File browser | member | to browse my files in a clear list or grid view | I quickly find and work on what I need | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| WEB-AC-1.1 | Views and sorting | A member in a folder | They switch between list and grid view or sort by name, size, or date | The view changes accordingly |
| WEB-AC-1.2 | Bulk actions | A member with several items selected | They choose move, delete, download, or share | The action applies to all selected items |
| WEB-AC-1.3 | Context menu | A file in the list | A member opens its context menu, also with the keyboard | The menu with the file's actions opens |
| WEB-AC-1.4 | Small screens | A screen 360 px wide | A member uses the file browser | Every function can be operated |
| WEB-AC-1.5 | States | A folder that is loading, empty, or failed to load | A member opens it | The state is shown in an understandable way |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. A story of this weight needs more than one slice of at most 4 h (`WORKFLOW.md`, "Issues and weight"); its owner cuts them in the concept document.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | WEB-AC-1.1, WEB-AC-1.2, WEB-AC-1.3, WEB-AC-1.4, WEB-AC-1.5 | — | #69 |

- **Story issue:** #69
- **Weight:** 8
- **Depends on:** STO-US-5 (Manage folders and files, #60), DSA-US-1 (Design system with design tokens and four themes, #68)
