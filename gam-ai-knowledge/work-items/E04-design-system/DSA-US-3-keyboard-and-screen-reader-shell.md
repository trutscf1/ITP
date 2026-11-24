---
doc: story
format: gam-ai-knowledge/1
title: "DSA-US-3 Keyboard and screen reader shell"
audience: [product, developer, reviewer, agent]
id-prefix: "DSA"
status: in-progress
sprint: 3
---
# DSA-US-3 Keyboard and screen reader shell

One user story of [Design system & accessibility modes](epic.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-35 ("Keyboard operation and screen reader support") and brought into this form on 2026-10-06. The grilling of 2026-11-17 (Q384, Q385, Q386, Q398, `concepts/design-system.md` §13; rounds Q377–Q401) reduced it to the shell every page shares; the rules each screen must meet are the cross-cutting `DSA-NF` requirements of the concept, which the screen concepts link. Its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| DSA-US-3 | Keyboard and screen reader shell | member | every page to give me a skip link, a visible focus indicator, landmarks, and spoken status messages, and the Appearance menu to work with the keyboard and a screen reader | I can use the shell and the Appearance menu of stash on my own, and every screen that follows the shared rules is usable the same way | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| DSA-AC-3.1 | No mouse needed | A member using only the keyboard on any page | They press the Tab key from the top of the page | Every control is reached in reading order, each with a visible focus indicator (an outline of 2 px that reaches at least 3:1 against its surroundings) |
| DSA-AC-3.2 | Skip link | A member using the keyboard | They open any page, press the Tab key once, and then the Enter key | The link "Skip to main content" has focus and is shown, and focus moves to the main content |
| DSA-AC-3.4 | Manual tests | The project documentation | A reader looks up the accessibility tests | Manual tests with two common screen readers, one per desktop platform, are documented with steps and a result table, and one run per screen reader is recorded with date and result |
| DSA-AC-3.5 | Automated check | The web client as a logged-in member in each of the four themes combined with each of the four colour modes, and as a visitor on every public page and on the share-link page with the system colour scheme light and dark, each with and without the system contrast preference "more" | The automated accessibility check runs | It reports 0 violations of any severity on every page, and the pipeline fails otherwise |
| DSA-AC-3.6 | Landmarks | Any page of the web client | A screen reader lists the landmarks of the page | Exactly one banner landmark (the header) and exactly one main landmark exist, and the main landmark holds the content of the page |
| DSA-AC-3.7 | Status announcer | Any page of the web client | A part of the interface reports the status message "Upload finished", and later the error message "Upload failed" | A screen reader announces "Upload finished" after its current speech and "Upload failed" at once, both without moving focus, and neither message is a stop in the tab order |

DSA-AC-3.3 (names, roles, and live regions for the file browser, a dialog, and the upload progress) was removed from this story on 2026-11-17 (Q384): it moves to the stories of the R6 web client, [`concepts/web-client.md`](../../concepts/web-client.md), which owns those screens; its number is not reused. The slice #163 of the earlier cut ("screen reader for files") moves with it and is no longer a slice of this story.

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. The cut is in the concept document, §16; each slice fits into 4 h (`WORKFLOW.md`, "Issues and weight").

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — keyboard, skip link, checks | DSA-AC-3.1, DSA-AC-3.2, DSA-AC-3.4, DSA-AC-3.5 up to critical violations in the four themes with and without high contrast | — | #72 |
| 2 — landmarks and status announcer | DSA-AC-3.6, DSA-AC-3.7 | 1 | — |
| 3 — zero violations in every colour mode | DSA-AC-3.5 for 0 violations of any severity in 16 combinations and in the 4 visitor combinations | 2, DSA-US-2 slice 2 (alternative colours) | — |

- **Story issue:** #72
- **Weight:** 5 (slice 1: 3, slice 2: 1, slice 3: 1)
- **Depends on:** DSA-US-1 (Design system with design tokens and four themes, #68) — A10, Q377
