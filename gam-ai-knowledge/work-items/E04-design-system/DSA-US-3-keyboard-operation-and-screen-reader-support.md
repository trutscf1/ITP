---
doc: story
format: gam-ai-knowledge/1
title: "DSA-US-3 Keyboard operation and screen reader support"
audience: [product, developer, reviewer, agent]
id-prefix: "DSA"
status: ready
sprint: 2
---
# DSA-US-3 Keyboard operation and screen reader support

One user story of [Design system & accessibility modes](epic.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-35 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| DSA-US-3 | Keyboard operation and screen reader support | member who is blind | to operate every function with keyboard and screen reader | I can use Nimbus on my own | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| DSA-AC-3.1 | No mouse needed | A member using only the keyboard | They use any function | It is reachable with a visible focus indicator and a logical tab order |
| DSA-AC-3.2 | Skip link | A member using the keyboard | They open a page | A skip link leads to the main content |
| DSA-AC-3.3 | ARIA | A member using a screen reader | They use the file browser, a dialog, or the upload progress | ARIA roles and labels describe them, with live regions for the progress |
| DSA-AC-3.4 | Manual tests | The project documentation | A reader looks up the accessibility tests | Manual tests with NVDA and VoiceOver are documented |
| DSA-AC-3.5 | Automated check | The web client | The automated axe check runs | It reports no critical violation |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. A story of this weight needs more than one slice of at most 4 h (`WORKFLOW.md`, "Issues and weight"); its owner cuts them in the concept document.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | DSA-AC-3.1, DSA-AC-3.2, DSA-AC-3.3, DSA-AC-3.4, DSA-AC-3.5 | — | #72 |

- **Story issue:** #72
- **Weight:** 5
- **Depends on:** WEB-US-1 (File browser, #69)
