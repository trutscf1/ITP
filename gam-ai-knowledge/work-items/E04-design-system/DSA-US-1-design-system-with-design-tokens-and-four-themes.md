---
doc: story
format: gam-ai-knowledge/1
title: "DSA-US-1 Design system with design tokens and four themes"
audience: [product, developer, reviewer, agent]
id-prefix: "DSA"
status: done
sprint: ""
---
# DSA-US-1 Design system with design tokens and four themes

One user story of [Design system & accessibility modes](epic.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-31 and brought into this form on 2026-10-06; its owner reviews the wording. On 2026-11-17 the grilling of the concept (Q377–Q401, A9, A13, A15) replaced the technology names in DSA-AC-1.1, DSA-AC-1.3, and DSA-AC-1.5 by neutral words, made DSA-AC-1.2 and DSA-AC-1.6 match the rule that device values live only while a session exists, and changed the *so that* (Q401); the behaviour of the story stays. Slice 3 waits for the answer of the school management to the legal question L1 (Q399).

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| DSA-US-1 | Design system with design tokens and four themes | member | to choose between several interface themes | I can read stash comfortably in my lighting and for long sessions | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| DSA-AC-1.1 | Central tokens | The shared UI package | A developer needs a colour, spacing, or type value | The design tokens are defined centrally there |
| DSA-AC-1.2 | Four themes | A member | They switch between the four themes light, dark, sepia, and night | The theme changes without a reload and the browser remembers the choice for the member at the next visit with a session |
| DSA-AC-1.3 | Component base | A component of the design system | A developer builds it | It is based on the project's component library and design tokens |
| DSA-AC-1.4 | Contrast | Any of the four themes | Text is shown | It meets the WCAG AA contrast of at least 4.5:1 |
| DSA-AC-1.5 | Component catalogue | A component of the design system | A developer opens the component catalogue | The component is documented there |
| DSA-AC-1.6 | Theme in the profile | A logged-in member who chose the theme sepia on one device | They log in on a second device whose device storage is empty | The choice is saved in their profile and the second device shows sepia from the first page after login |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. Proposed cut of 2026-10-06, made before the architecture chapter exists, so that each slice fits into 4 h (`WORKFLOW.md`, "Issues and weight"); the owner may recut it.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — Tokens and themes | DSA-AC-1.1, DSA-AC-1.2, DSA-AC-1.3 | — | #68 |
| 2 — Contrast and component catalogue | DSA-AC-1.4, DSA-AC-1.5 | 1 | #106 |
| 3 — Theme in the profile | DSA-AC-1.6 | 1, IDN-US-2 (log in, #46), L1 (school management) | #112 |

- **Story issue:** #68
- **Weight:** 6 (slice 1: 3, slice 2: 2, slice 3: 1)
- **Depends on:** SCF-US-1 (Set up the monorepo, #38); slice 3 also on IDN-US-2 (Log in and log out with rate limiting)
