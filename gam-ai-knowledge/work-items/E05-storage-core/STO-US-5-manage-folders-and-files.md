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

One user story of [Storage core: folders, resumable upload, deduplication](epic.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-23 and brought into this form on 2026-10-06; its owner reviews the wording. On 2026-11-24 the grilling replaced the schema library and the permission wording by neutral ones (only the owner until R7) and cut the slices ([question log](../../concepts/storage-core.qa-log.md), Q420, Q437, A6, A8, A13, A14, A15, A23).

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| STO-US-5 | Manage folders and files | member | to create folders and to rename, move, and copy files and folders | my data stays well organized | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| STO-AC-5.1 | Nested folders | A member in any folder | They create a folder inside it | Folders can be nested to any depth |
| STO-AC-5.2 | Rename, move, copy | A file or folder | A member renames, moves (also by drag and drop), or copies it | The change is applied |
| STO-AC-5.3 | Name validation | A name with a forbidden character or over the maximum length of 255 characters | A member enters it | The shared contract rejects it, on the page before sending and on the server |
| STO-AC-5.4 | Permissions respected | A folder of one member, its owner | Another member tries one of these actions there | The action is refused as if the folder did not exist |
| STO-AC-5.5 | Breadcrumb | A member inside nested folders | They look at the page | A breadcrumb navigation shows the current path |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. Cut of 2026-11-24 from the architecture chapter of the concept (§16, A23); the interface of the story is a slice of its own in the Web track (Q432).

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — Folders, rename, move, copy, name rules, owner only (`storage`) | STO-AC-5.1, STO-AC-5.2 (server), STO-AC-5.3 (server), STO-AC-5.4 | STO-US-1 slice 2; STO-US-2 slice 1 (folder listing) | #60 |
| 2 — Folder actions and breadcrumb in the file browser (`web`) | STO-AC-5.2 (page, also by drag and drop), STO-AC-5.3 (page), STO-AC-5.5 | slice 1 | — |

- **Story issue:** #60
- **Weight:** 5
- **Depends on:** STO-US-1 (Connect the storage backend to the object storage, #56)
