---
doc: story
format: gam-ai-knowledge/1
title: "STO-US-4 Deduplication by file hash"
audience: [product, developer, reviewer, agent]
id-prefix: "STO"
status: backlog
sprint: 4
---
# STO-US-4 Deduplication by file hash

One user story of [Storage core: folders, resumable upload, deduplication](epic.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-22 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| STO-US-4 | Deduplication by file hash | operator | identical files to be stored physically only once | storage space is saved | Should |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| STO-AC-4.1 | Hash on upload | A file being uploaded | The upload completes | A SHA-256 hash of the content is calculated |
| STO-AC-4.2 | Reference instead of copy | A stored file with a given hash | A file with the same hash is uploaded | Only a reference is created and no second object is stored |
| STO-AC-4.3 | Reference counting | An object referenced by several files | One of the files is deleted | The object is kept until no reference points to it |
| STO-AC-4.4 | Invisible to members | Two members who uploaded identical files | Either of them uses their file | Deduplication is not visible and permissions stay separate per file |
| STO-AC-4.5 | Tested counting | The reference counting | The unit tests run | They cover it |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. A story of this weight needs more than one slice of at most 4 h (`WORKFLOW.md`, "Issues and weight"); its owner cuts them in the concept document.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | STO-AC-4.1, STO-AC-4.2, STO-AC-4.3, STO-AC-4.4, STO-AC-4.5 | — | #59 |

- **Story issue:** #59
- **Weight:** 5
- **Depends on:** STO-US-3 (Chunked upload with resume, #58)
