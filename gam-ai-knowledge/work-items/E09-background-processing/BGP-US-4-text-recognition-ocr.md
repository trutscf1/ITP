---
doc: story
format: gam-ai-knowledge/1
title: "BGP-US-4 Text recognition (OCR)"
audience: [product, developer, reviewer, agent]
id-prefix: "BGP"
status: backlog
sprint: 5
---
# BGP-US-4 Text recognition (OCR)

One user story of [Background processing: thumbnails, virus scan, OCR, scheduled jobs](epic.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-29 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| BGP-US-4 | Text recognition (OCR) | member | text in scanned documents and images to be recognized | I can find these files through search as well | Should |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| BGP-AC-4.1 | Languages and formats | An image or a scanned PDF in German or English | It is processed | Tesseract recognizes its text |
| BGP-AC-4.2 | Stored text | A file with recognized text | OCR finishes | The text is stored with the file in MongoDB |
| BGP-AC-4.3 | Local only | A file to be processed | OCR runs | It runs completely locally, without an external service |
| BGP-AC-4.4 | Size limit | A file above the configurable size limit | It is processed | OCR is skipped for it |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. A story of this weight needs more than one slice of at most 4 h (`WORKFLOW.md`, "Issues and weight"); its owner cuts them in the concept document.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | BGP-AC-4.1, BGP-AC-4.2, BGP-AC-4.3, BGP-AC-4.4 | — | #66 |

- **Story issue:** #66
- **Weight:** 5
- **Depends on:** BGP-US-1 (Background processing with BullMQ, #63)
