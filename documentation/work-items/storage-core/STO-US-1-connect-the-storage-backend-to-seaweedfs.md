---
doc: story
format: engineering-human/2
title: "STO-US-1 Connect the storage backend to SeaweedFS"
audience: [product, developer, reviewer, agent]
id-prefix: "STO"
---
# STO-US-1 Connect the storage backend to SeaweedFS

One user story of [Storage core: folders, resumable upload, deduplication](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-19 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| STO-US-1 | Connect the storage backend to SeaweedFS | operator | a storage API that puts file content into SeaweedFS | file content is stored scalably and apart from metadata | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| STO-AC-1.1 | Object storage | The running stack with SeaweedFS as a container | The storage API stores a file | It uses the S3-compatible interface of SeaweedFS |
| STO-AC-1.2 | Separated data | A stored file | The storage API saves it | The content goes to object storage, the metadata to MongoDB, and structure and permissions to PostgreSQL |
| STO-AC-1.3 | Documented endpoints | The storage API | The OpenAPI specification is generated | Every endpoint is documented in it |
| STO-AC-1.4 | Protected endpoints | Any storage endpoint | A request arrives | Authentication and permission are checked |
| STO-AC-1.5 | Integration test | The storage API | The integration test runs | It stores, reads, and deletes a file |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. Proposed cut of 2026-10-06, made before the architecture chapter exists, so that each slice fits into 4 h (`WORKFLOW.md`, "Issues and weight"); the owner may recut it.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — Store, read, and delete through object storage | STO-AC-1.1, STO-AC-1.2, STO-AC-1.5 | — | #56 |
| 2 — Documented and protected endpoints | STO-AC-1.3, STO-AC-1.4 | 1 | #105 |

- **Story issue:** #56
- **Weight:** 5 (slice 1: 3, slice 2: 2)
- **Depends on:** SCF-US-2 (Local development environment with Docker Compose, #39), SCF-US-3 (Shared contracts with Zod and OpenAPI, #40)
