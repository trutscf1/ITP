---
doc: story
format: gam-ai-knowledge/1
title: "STO-US-2 Upload files"
audience: [product, developer, reviewer, agent]
id-prefix: "STO"
status: ready
sprint: 2
---
# STO-US-2 Upload files

One user story of [Storage core: folders, resumable upload, deduplication](epic.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-20 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| STO-US-2 | Upload files | member | to upload files by file picker or drag and drop | they are stored in my own cloud | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| STO-AC-2.1 | Several files | A member in a folder | They upload several files at once | Each file shows its own progress |
| STO-AC-2.2 | Drag and drop or button | A member in a folder | They drop files onto it or use the upload button with the keyboard | The files are uploaded into the current folder |
| STO-AC-2.3 | Size and type limits | The maximum file size and the allowed file types from `.env` | A member uploads a file that violates them | The server rejects the file |
| STO-AC-2.4 | Name conflict | A folder that already holds a file of the same name | A member uploads the file | They choose between replace, keep both, and cancel |
| STO-AC-2.5 | Live list | A member watching a folder | An upload finishes | The file appears in the list without a reload |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. A story of this weight needs more than one slice of at most 4 h (`WORKFLOW.md`, "Issues and weight"); its owner cuts them in the concept document.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | STO-AC-2.1, STO-AC-2.2, STO-AC-2.3, STO-AC-2.4, STO-AC-2.5 | — | #57 |

- **Story issue:** #57
- **Weight:** 5
- **Depends on:** STO-US-1 (Connect the storage backend to the object storage, #56)
