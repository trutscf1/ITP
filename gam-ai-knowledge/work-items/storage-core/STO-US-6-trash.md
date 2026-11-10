---
doc: story
format: gam-ai-knowledge/1
title: "STO-US-6 Trash"
audience: [product, developer, reviewer, agent]
id-prefix: "STO"
---
# STO-US-6 Trash

One user story of [Storage core: folders, resumable upload, deduplication](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-24 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| STO-US-6 | Trash | member | to restore deleted files from a trash | accidental deletion can be undone | Should |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| STO-AC-6.1 | Delete to trash | A file or folder | A member deletes it | It is moved to the trash |
| STO-AC-6.2 | Restore | An item in the trash | A member restores it | It returns to its original place, or to the root folder if that place no longer exists |
| STO-AC-6.3 | Confirm final deletion | An item in the trash | A member deletes it for good | A confirmation dialog must be confirmed first |
| STO-AC-6.4 | Automatic purge | Trash entries older than 30 days (configurable) | The cleanup job runs | They are deleted for good |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | STO-AC-6.1, STO-AC-6.2, STO-AC-6.3, STO-AC-6.4 | — | #61 |

- **Story issue:** #61
- **Weight:** 3
- **Depends on:** STO-US-5 (Manage folders and files, #60)
