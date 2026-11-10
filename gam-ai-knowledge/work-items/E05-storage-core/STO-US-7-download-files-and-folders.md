---
doc: story
format: gam-ai-knowledge/1
title: "STO-US-7 Download files and folders"
audience: [product, developer, reviewer, agent]
id-prefix: "STO"
status: ready
sprint: 3
---
# STO-US-7 Download files and folders

One user story of [Storage core: folders, resumable upload, deduplication](epic.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-25 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| STO-US-7 | Download files and folders | member | to download single files or whole folders | I can use them locally | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| STO-AC-7.1 | Single file | A stored file | A member downloads it | It is delivered with the correct file name and MIME type |
| STO-AC-7.2 | Folder as ZIP | A folder or a selection of several items | A member downloads it | It is streamed as a ZIP archive without holding the whole archive in memory |
| STO-AC-7.3 | Range requests | A stored file | A client sends an HTTP range request | The requested range is delivered |
| STO-AC-7.4 | Permission check | Any download | It is requested | The permission is checked for that download |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | STO-AC-7.1, STO-AC-7.2, STO-AC-7.3, STO-AC-7.4 | — | #62 |

- **Story issue:** #62
- **Weight:** 3
- **Depends on:** STO-US-1 (Connect the storage backend to the object storage, #56)
