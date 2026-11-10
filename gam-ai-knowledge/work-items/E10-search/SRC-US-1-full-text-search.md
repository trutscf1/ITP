---
doc: story
format: gam-ai-knowledge/1
title: "SRC-US-1 Full-text search"
audience: [product, developer, reviewer, agent]
id-prefix: "SRC"
status: backlog
sprint: 6
---
# SRC-US-1 Full-text search

One user story of [Full-text search](epic.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-30 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| SRC-US-1 | Full-text search | member | to search for file names and file content | I find files quickly without clicking through folders | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| SRC-AC-1.1 | Search scope | Stored files | A member searches for a term | File names, metadata, and extracted text (PDF, DOCX, TXT, OCR results) are searched |
| SRC-AC-1.2 | Filters | A search result | A member filters by file type, change date, or folder | The result is narrowed accordingly |
| SRC-AC-1.3 | Permission filter | Files the member may not read | The member searches | The result holds only files the member has read permission for |
| SRC-AC-1.4 | Speed | 10,000 stored files | A member searches | The result is there in under 1 second |
| SRC-AC-1.5 | Highlighting | A search result | It is shown | The search term is highlighted in it |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. A story of this weight needs more than one slice of at most 4 h (`WORKFLOW.md`, "Issues and weight"); its owner cuts them in the concept document.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | SRC-AC-1.1, SRC-AC-1.2, SRC-AC-1.3, SRC-AC-1.4, SRC-AC-1.5 | — | #67 |

- **Story issue:** #67
- **Weight:** 5
- **Depends on:** BGP-US-4 (Text recognition (OCR), #66)
