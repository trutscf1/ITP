---
doc: story
format: engineering-human/2
title: "DSA-US-2 Accessibility modes"
audience: [product, developer, reviewer, agent]
id-prefix: "DSA"
---
# DSA-US-2 Accessibility modes

One user story of [Design system & accessibility modes](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-34 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| DSA-US-2 | Accessibility modes | member with a visual impairment | to activate a high-contrast, a colour-blind, and a reduced-motion mode | I can use Nimbus without restrictions | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| DSA-AC-2.1 | High contrast | A member | They activate the high-contrast mode | The interface meets the WCAG AAA contrasts |
| DSA-AC-2.2 | Colour-blind modes | A member | They activate a mode for protanopia, deuteranopia, or tritanopia | The colours adapt, and no information is conveyed by colour alone |
| DSA-AC-2.3 | Reduced motion | A member whose system sets `prefers-reduced-motion` or `prefers-contrast` | They open Nimbus | The setting is respected automatically, and a reduced-motion mode can also be switched on by hand |
| DSA-AC-2.4 | Saved settings | A member | They change an accessibility setting | It is saved in the profile and applies at once |
| DSA-AC-2.5 | Font size | A member | They raise the font size to 200 % | The layout does not break |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. A story of this weight needs more than one slice of at most 4 h (`WORKFLOW.md`, "Issues and weight"); its owner cuts them in the concept document.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | DSA-AC-2.1, DSA-AC-2.2, DSA-AC-2.3, DSA-AC-2.4, DSA-AC-2.5 | — | #71 |

- **Story issue:** #71
- **Weight:** 5
- **Depends on:** DSA-US-1 (Design system with design tokens and four themes, #68)
