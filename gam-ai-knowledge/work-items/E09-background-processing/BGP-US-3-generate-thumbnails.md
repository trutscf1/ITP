---
doc: story
format: gam-ai-knowledge/1
title: "BGP-US-3 Generate thumbnails"
audience: [product, developer, reviewer, agent]
id-prefix: "BGP"
status: backlog
sprint: 6
---
# BGP-US-3 Generate thumbnails

One user story of [Background processing: thumbnails, virus scan, OCR, scheduled jobs](epic.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-28 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| BGP-US-3 | Generate thumbnails | member | to see thumbnails of my images, PDFs, and videos | I recognize files faster | Should |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| BGP-AC-3.1 | Supported formats | A JPG, PNG, WebP, GIF, PDF, or video file | It is processed | Thumbnails in two sizes are created (first page for PDF, still image for video) |
| BGP-AC-3.2 | Generated in the worker | A file to be processed | The thumbnail job runs in the worker | The thumbnails are stored in object storage |
| BGP-AC-3.3 | Placeholder icon | A file without a thumbnail yet | A member sees it in the list | An icon matching the file type is shown |
| BGP-AC-3.4 | Caching | A thumbnail | It is delivered | The response carries cache headers |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | BGP-AC-3.1, BGP-AC-3.2, BGP-AC-3.3, BGP-AC-3.4 | — | #65 |

- **Story issue:** #65
- **Weight:** 3
- **Depends on:** BGP-US-1 (Background processing with a job queue, #63)
