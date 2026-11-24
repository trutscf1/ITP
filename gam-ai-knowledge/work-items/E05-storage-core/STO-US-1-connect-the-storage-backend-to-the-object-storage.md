---
doc: story
format: gam-ai-knowledge/1
title: "STO-US-1 Connect the storage backend to the object storage"
audience: [product, developer, reviewer, agent]
id-prefix: "STO"
status: ready
sprint: 2
---
# STO-US-1 Connect the storage backend to the object storage

One user story of [Storage core: folders, resumable upload, deduplication](epic.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-19 and brought into this form on 2026-10-06; its owner reviews the wording. On 2026-11-24 the grilling replaced the product names by neutral ones, reworded `STO-AC-1.5` as behaviour, and cut the slices ([question log](../../concepts/storage-core.qa-log.md), Q418, Q419, Q420, A6, A23). On 2026-11-24, after the draft review, the dependency on IDN-US-2 and the meaning of `STO-AC-1.5` after the trash exists were fixed (A24, A25).

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| STO-US-1 | Connect the storage backend to the object storage | operator | a storage API that puts file content into an object store | file content is stored scalably and apart from the facts about it | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| STO-AC-1.1 | Object storage | The local stack with its object store running as a container | The storage API stores a file | The bytes of the file are in the object store, and no copy of them stays on the disk of the `storage` container |
| STO-AC-1.2 | Separated data | A stored file | The storage API saves it | The content goes to the object store, the facts derived from the content to the metadata store, and name, folder, owner, and size to the record store; each fact is in exactly one of them |
| STO-AC-1.3 | Documented endpoints | The storage API | The machine-readable interface description is generated | Every endpoint is documented in it |
| STO-AC-1.4 | Protected endpoints | Any storage endpoint except the health endpoint | A request arrives | The session is checked, and the item must belong to the member of the session; otherwise the request is refused |
| STO-AC-1.5 | Delete removes everything | A stored file | Its owner deletes it through the storage API | Its content object, metadata, and record are gone |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. Cut of 2026-11-24 from the architecture chapter of the concept (§16, A23), so that each slice fits into 4 h (`WORKFLOW.md`, "Issues and weight").

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — Store, read, and delete through the three stores; `storage` in the local stack, with a stub for the session check (`storage`) | STO-AC-1.1, STO-AC-1.2, STO-AC-1.5 | the new error codes in `scaffolding.md` §8 and the migration of the record store (§15 of the concept) | #56 |
| 2 — Documented and protected endpoints, with the real session check of `identity` (`storage`) | STO-AC-1.3, STO-AC-1.4 | 1; IDN-US-2 (the session check endpoint) | #105 |

- **Story issue:** #56
- **Weight:** 5 (slice 1: 3, slice 2: 2)
- **Depends on:** SCF-US-2 (Local development environment with Docker Compose, #39), SCF-US-3 (Shared contracts with Zod and OpenAPI, #40), IDN-US-2 (Log in and log out with rate limiting, #46: the session check)
