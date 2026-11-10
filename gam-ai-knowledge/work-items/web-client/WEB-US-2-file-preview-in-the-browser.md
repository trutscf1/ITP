---
doc: story
format: gam-ai-knowledge/1
title: "WEB-US-2 File preview in the browser"
audience: [product, developer, reviewer, agent]
id-prefix: "WEB"
---
# WEB-US-2 File preview in the browser

One user story of [Web client: dashboard, file browser, preview](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-33 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| WEB-US-2 | File preview in the browser | member | to view files directly in the browser | I do not have to download them first | Should |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| WEB-AC-2.1 | Supported formats | An image, PDF, text or Markdown, audio, or video file | A member opens it | A preview is shown |
| WEB-AC-2.2 | Arrow keys | An open preview | A member presses the left or right arrow key | The previous or next file is shown |
| WEB-AC-2.3 | Unsupported formats | A file in a format without preview | A member opens it | The file information and a download button are shown |
| WEB-AC-2.4 | Focus and Escape | An open preview dialog | A member tabs through it or presses Escape | The focus stays inside the dialog, and Escape closes it |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. A story of this weight needs more than one slice of at most 4 h (`WORKFLOW.md`, "Issues and weight"); its owner cuts them in the concept document.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | WEB-AC-2.1, WEB-AC-2.2, WEB-AC-2.3, WEB-AC-2.4 | — | #70 |

- **Story issue:** #70
- **Weight:** 5
- **Depends on:** BGP-US-3 (Generate thumbnails, #65), WEB-US-1 (File browser, #69)
