---
doc: story
format: gam-ai-knowledge/1
title: "DSA-US-4 Font size and reduced motion"
audience: [product, developer, reviewer, agent]
id-prefix: "DSA"
status: backlog
sprint: ""
---
# DSA-US-4 Font size and reduced motion

One user story of [Design system & accessibility modes](epic.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was cut out of the earlier DSA-US-2 by the grilling of 2026-11-17 (Q387, `concepts/design-system.md` §13; rounds Q377–Q401); its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| DSA-US-4 | Font size and reduced motion | member | to choose a font size and to stop all animation | I can read comfortably and the interface does not move | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| DSA-AC-4.1 | System reduced motion | A person with no stored choice whose system prefers reduced motion | They open a page | No animation and no transition runs on the page |
| DSA-AC-4.2 | Reduced motion by hand | A logged-in member whose system sets no motion preference | They switch on "Reduced motion" in the Appearance menu | At once no animation and no transition runs, and it stays so after a reload; switching it off deletes the stored value |
| DSA-AC-4.3 | Font size | A logged-in member | They choose "Small", "Normal", or "Large" in the Appearance menu | The text size changes at once to 87.5 %, 100 %, or 125 % of the base size (14 px, 16 px, or 20 px at a base size of 16 px); "Normal" deletes the stored font size |
| DSA-AC-4.4 | Zoom 200 % | Any page of the web client at the font size "Normal" in a window 1280 px wide | The browser text size is raised to 200 % (root font size 32 px) | No content overlaps other content, no content is cut off, and no horizontal scroll bar appears |
| DSA-AC-4.5 | Font size and reduced motion saved | A logged-in member | They choose "Large" and switch on "Reduced motion" on one device and later log in on a second device whose device storage is empty | The choices apply at once and are saved in their profile; the second device shows "Large" with no animation running from the first page after login |
| DSA-AC-4.6 | Reset to the system | A logged-in member with the theme sepia, the colour mode "High contrast", the font size "Large", and "Reduced motion" on stored, whose system sets no preference | They choose "Follow system" under "Theme" and "Colour mode", "Normal" under "Font size", and switch "Reduced motion" off | All four stored values are deleted on the device and the member's profile record is deleted; the page shows the theme light, the colour mode "Standard", the base size, and moving content, and the menu shows the four controls at their reset values |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. The cut is in the concept document, §16; each slice fits into 4 h (`WORKFLOW.md`, "Issues and weight").

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — reduced motion in the menu | DSA-AC-4.1, DSA-AC-4.2 | DSA-US-2 slice 3 (Appearance menu) | — |
| 2 — font size | DSA-AC-4.3, DSA-AC-4.4 | DSA-US-2 slice 3 (Appearance menu) | — |
| 3 — font size and reduced motion in the profile | DSA-AC-4.5, DSA-AC-4.6 | 1, 2, IDN-US-2 (log in, #46), DSA-US-1 slice 3 (#112), L1 (school management) | — |

- **Story issue:** — (filled in by `/gam-engineering tickets`)
- **Weight:** 3 (slice 1: 1, slice 2: 1, slice 3: 1)
- **Depends on:** DSA-US-1 (Design system with design tokens and four themes, #68); slice 3 also on IDN-US-2 (Log in and log out with rate limiting) — A10, Q377 — and on the answer of the school management to the legal question L1 (Q399)

<!-- status: backlog → ready (issue published) → in-progress → review → done (reached the integration branch: dev, or main in branch model trunk). sprint: the number n of milestone `Sprint <n>` once planned. Every change is mirrored in ../BACKLOG.md and ../sprints/sprint-<n>.md in the same step (P-DOC-8). -->
