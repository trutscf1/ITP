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

One user story of [Storage core: folders, resumable upload, deduplication](epic.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-20 and brought into this form on 2026-10-06; its owner reviews the wording. On 2026-11-24 the grilling replaced the configuration file by "the configuration", added values and the keep-both name, and cut the slices ([question log](../../concepts/storage-core.qa-log.md), Q429, Q430, Q431, Q432, A8, A9, A11). Later the same day, `STO-AC-2.6` (formerly `STO-AC-4.1`) and `STO-AC-2.7` (formerly `STO-AC-3.1`) were moved here from the stories STO-US-4 and STO-US-3, because the first upload already needs the fingerprint and the resumable path (Q452, Q453).

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| STO-US-2 | Upload files | member | to upload files by file picker or drag and drop | they are stored in my own cloud | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| STO-AC-2.1 | Several files | A member in a folder | They upload several files at once | Each file shows its own progress |
| STO-AC-2.2 | Drag and drop or button | A member in a folder | They drop files onto it or use the upload button with the keyboard | The files are uploaded into the current folder |
| STO-AC-2.3 | Size and type limits | The maximum file size (5 GiB by default) and the allowed file types set in the configuration | A member uploads a file that violates them | The server rejects the file, keeps none of its bytes, and the page shows why |
| STO-AC-2.4 | Name conflict | A folder that already holds a file of the same name | A member uploads the file | They choose between replace, keep both (the new file is named `Name (2).ext`), and cancel |
| STO-AC-2.5 | Live list | A member watching a folder | An upload finishes | The file appears in the list without a reload |
| STO-AC-2.6 | Hash on upload | A file being uploaded | The upload completes | A SHA-256 hash of the content is calculated |
| STO-AC-2.7 | Chunked protocol | A member uploading a file | The upload runs | It is sent in chunks of the configured size (8 MiB by default) over a resumable upload protocol |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. Cut of 2026-11-24 from the architecture chapter of the concept (§16, A23); the interface of the story is a slice of its own in the Web track (Q432).

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — Upload API: resumable path, fingerprint, limits, name conflicts, live events, root folder and folder listing (`storage`) | STO-AC-2.3, STO-AC-2.4 (server), STO-AC-2.5 (server), STO-AC-2.6, STO-AC-2.7 (server) | STO-US-1 slice 2 | #57 |
| 2 — Upload dialog and live folder list (`web`) | STO-AC-2.1, STO-AC-2.2, STO-AC-2.3 (page), STO-AC-2.4 (dialog), STO-AC-2.5 (page), STO-AC-2.7 (page) | slice 1 | — |

- **Story issue:** #57
- **Weight:** 5
- **Depends on:** STO-US-1 (Connect the storage backend to the object storage, #56)
