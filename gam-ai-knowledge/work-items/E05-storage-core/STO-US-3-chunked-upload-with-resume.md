---
doc: story
format: gam-ai-knowledge/1
title: "STO-US-3 Chunked upload with resume"
audience: [product, developer, reviewer, agent]
id-prefix: "STO"
status: backlog
sprint: 3
---
# STO-US-3 Chunked upload with resume

One user story of [Storage core: folders, resumable upload, deduplication](epic.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-21 and brought into this form on 2026-10-06; its owner reviews the wording. On 2026-11-24 the grilling replaced the protocol name by a neutral description, added the defaults, and cut the slices ([question log](../../concepts/storage-core.qa-log.md), Q429, Q433, Q435, A11, A12, A23). Later the same day `STO-AC-3.1` moved to STO-US-2 as `STO-AC-2.7`; the numbers 3.2 to 3.5 stay (Q453).

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| STO-US-3 | Chunked upload with resume | member with an unstable connection | large uploads to continue where they stopped after an interruption | I do not have to upload everything again | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| STO-AC-3.2 | Resume | An upload in progress | The connection drops or the page is reloaded | The upload continues where it stopped |
| STO-AC-3.3 | Pause | An upload in progress | The member pauses and later resumes it | The upload continues from the paused position |
| STO-AC-3.4 | Large files | A file of 5 GiB and the default limits | A member uploads it, also with one interruption in the middle | The upload completes, the stored file is identical, and the test run is documented |
| STO-AC-3.5 | Cleanup | An upload that was not completed for 24 hours (configurable) | The cleanup job runs | The unfinished upload and its bytes are removed |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. Cut of 2026-11-24 from the architecture chapter of the concept (§16, A23); the interface of the story is a slice of its own in the Web track (Q432).

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — Resume on the API: offset, large files (`storage`) | STO-AC-3.2 (server), STO-AC-3.3 (server), STO-AC-3.4 | STO-US-2 slice 1 | #58 |
| 2 — Pause, resume, and continue after a reload (`web`) | STO-AC-3.2 (page), STO-AC-3.3 (page) | slice 1; STO-US-2 slice 2 | — |
| 3 — Clean-up jobs in `worker`: unfinished uploads and the clean-up net (`worker`) | STO-AC-3.5 | slice 1 | — |

- **Story issue:** #58
- **Weight:** 8
- **Depends on:** STO-US-2 (Upload files, #57)
