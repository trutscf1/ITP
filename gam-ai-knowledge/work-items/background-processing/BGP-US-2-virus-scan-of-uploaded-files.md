---
doc: story
format: gam-ai-knowledge/1
title: "BGP-US-2 Virus scan of uploaded files"
audience: [product, developer, reviewer, agent]
id-prefix: "BGP"
---
# BGP-US-2 Virus scan of uploaded files

One user story of [Background processing: thumbnails, virus scan, OCR, scheduled jobs](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-27 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| BGP-US-2 | Virus scan of uploaded files | member | uploaded files to be checked for malware | my team and I are protected from infected files | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| BGP-AC-2.1 | Scan every file | A new file | It is uploaded | It is scanned with ClamAV |
| BGP-AC-2.2 | Quarantine | A file found infected | The scan finishes | The file is put into quarantine and can be neither downloaded nor shared |
| BGP-AC-2.3 | Visible notice | A quarantined file | A member sees it in the list | A clear notice is shown on that file |
| BGP-AC-2.4 | Definitions | The virus definitions | The system is online | They update automatically, and offline the scan uses the existing definitions |
| BGP-AC-2.5 | EICAR test | The EICAR test file | It is uploaded | It is detected as infected |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | BGP-AC-2.1, BGP-AC-2.2, BGP-AC-2.3, BGP-AC-2.4, BGP-AC-2.5 | — | #64 |

- **Story issue:** #64
- **Weight:** 3
- **Depends on:** BGP-US-1 (Background processing with BullMQ, #63)
