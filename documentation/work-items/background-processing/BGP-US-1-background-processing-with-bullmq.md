---
doc: story
format: engineering-human/2
title: "BGP-US-1 Background processing with BullMQ"
audience: [product, developer, reviewer, agent]
id-prefix: "BGP"
---
# BGP-US-1 Background processing with BullMQ

One user story of [Background processing: thumbnails, virus scan, OCR, scheduled jobs](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-26 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| BGP-US-1 | Background processing with BullMQ | operator | a job queue for background tasks | costly processing such as thumbnails or virus scans is decoupled from the upload | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| BGP-AC-1.1 | Worker service | The running stack | It starts | BullMQ with Redis and a worker service in its own container are running |
| BGP-AC-1.2 | Processing chain | A file | Its upload succeeds | The chain virus scan → thumbnail → OCR → indexing starts |
| BGP-AC-1.3 | Retries | A job that fails | It is retried with backoff | After at most 3 attempts it is marked as failed |
| BGP-AC-1.4 | Processing status | A file being processed | A client asks the API | The processing status of the file is returned |
| BGP-AC-1.5 | Scheduled jobs | The recurring jobs (cleanup, expiry of links and trash) | The worker starts | They are registered in one central place |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. A story of this weight needs more than one slice of at most 4 h (`WORKFLOW.md`, "Issues and weight"); its owner cuts them in the concept document.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | BGP-AC-1.1, BGP-AC-1.2, BGP-AC-1.3, BGP-AC-1.4, BGP-AC-1.5 | — | #63 |

- **Story issue:** #63
- **Weight:** 5
- **Depends on:** STO-US-2 (Upload files, #57)
