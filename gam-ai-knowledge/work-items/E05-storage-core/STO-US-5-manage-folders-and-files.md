---
doc: story
format: gam-ai-knowledge/1
title: "STO-US-5 Manage folders and files"
audience: [product, developer, reviewer, agent]
id-prefix: "STO"
status: ready
sprint: 3
---
# STO-US-5 Manage folders and files

One user story of [Storage core: folders, resumable upload, deduplication](epic.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-23 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| STO-US-5 | Manage folders and files | member | to create folders and to rename, move, and copy files and folders | my data stays well organized | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| STO-AC-5.1 | Nested folders | A member in any folder | They create a folder inside it | Folders can be nested to any depth |
| STO-AC-5.2 | Rename, move, copy | A file or folder | A member renames, moves (also by drag and drop), or copies it | The change is applied |
| STO-AC-5.3 | Name validation | A name with a forbidden character or over the maximum length | A member enters it | The shared Zod schema rejects it |
| STO-AC-5.4 | Permissions respected | A member without write permission on a folder | They try one of these actions there | The action is rejected |
| STO-AC-5.5 | Breadcrumb | A member inside nested folders | They look at the page | A breadcrumb navigation shows the current path |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. A story of this weight needs more than one slice of at most 4 h (`WORKFLOW.md`, "Issues and weight"); its owner cuts them in the concept document.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | STO-AC-5.1, STO-AC-5.2, STO-AC-5.3, STO-AC-5.4, STO-AC-5.5 | — | #60 |

- **Story issue:** #60
- **Weight:** 5
- **Depends on:** STO-US-1 (Connect the storage backend to SeaweedFS, #56)
