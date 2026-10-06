---
doc: story
format: engineering-human/2
title: "STO-US-3 Chunked upload with resume"
audience: [product, developer, reviewer, agent]
id-prefix: "STO"
---
# STO-US-3 Chunked upload with resume

One user story of [Storage core: folders, resumable upload, deduplication](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-21 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| STO-US-3 | Chunked upload with resume | member with an unstable connection | large uploads to continue where they stopped after an interruption | I do not have to upload everything again | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| STO-AC-3.1 | Chunked protocol | A member uploading a file | The upload runs | It is sent in chunks over the tus protocol with a configurable chunk size |
| STO-AC-3.2 | Resume | An upload in progress | The connection drops or the page is reloaded | The upload continues where it stopped |
| STO-AC-3.3 | Pause | An upload in progress | The member pauses and later resumes it | The upload continues from the paused position |
| STO-AC-3.4 | Large files | A file of 5 GB | A member uploads it | The upload completes reliably, and the test is documented |
| STO-AC-3.5 | Cleanup | An upload that was not completed for 24 hours | The cleanup job runs | The unfinished upload is removed |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. A story of this weight needs more than one slice of at most 4 h (`WORKFLOW.md`, "Issues and weight"); its owner cuts them in the concept document.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | STO-AC-3.1, STO-AC-3.2, STO-AC-3.3, STO-AC-3.4, STO-AC-3.5 | — | #58 |

- **Story issue:** #58
- **Weight:** 8
- **Depends on:** STO-US-2 (Upload files, #57)
