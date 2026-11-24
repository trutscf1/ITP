---
doc: story
format: gam-ai-knowledge/1
title: "STO-US-6 Trash"
audience: [product, developer, reviewer, agent]
id-prefix: "STO"
status: backlog
sprint: 3
---
# STO-US-6 Trash

One user story of [Storage core: folders, resumable upload, deduplication](epic.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-24 and brought into this form on 2026-10-06; its owner reviews the wording. On 2026-11-24 the grilling added the restore with a name conflict and the entry of a deleted folder and cut the slices ([question log](../../concepts/storage-core.qa-log.md), Q435, Q438, Q439, A7, A15, A17, A23).

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| STO-US-6 | Trash | member | to restore deleted files from a trash | accidental deletion can be undone | Should |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| STO-AC-6.1 | Delete to trash | A file or folder | A member deletes it | It is moved to the trash |
| STO-AC-6.2 | Restore | An item in the trash | A member restores it | It returns to its original place, or to the root folder if that place no longer exists; if the name is taken there, the member chooses to keep both or cancel (a file can also be replaced) |
| STO-AC-6.3 | Confirm final deletion | An item in the trash | A member deletes it for good | A confirmation dialog must be confirmed first |
| STO-AC-6.4 | Automatic purge | Trash entries older than 30 days (configurable) | The cleanup job runs | They are deleted for good |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. Cut of 2026-11-24 from the architecture chapter of the concept (§16, A23).

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — Trash, restore, and delete for good (`storage`) | STO-AC-6.1, STO-AC-6.2 (server) | STO-US-5 slice 1 | #61 |
| 2 — Trash page, restore dialog, and confirmation (`web`) | STO-AC-6.1 (page), STO-AC-6.2 (page), STO-AC-6.3 | slice 1; STO-US-5 slice 2 | — |
| 3 — Scheduled purge in `worker` (`worker`) | STO-AC-6.4 | slice 1; STO-US-3 slice 3 (job runtime) | — |

- **Story issue:** #61
- **Weight:** 3
- **Depends on:** STO-US-5 (Manage folders and files, #60)
