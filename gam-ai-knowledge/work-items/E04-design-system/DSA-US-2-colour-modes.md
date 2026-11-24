---
doc: story
format: gam-ai-knowledge/1
title: "DSA-US-2 Colour modes"
audience: [product, developer, reviewer, agent]
id-prefix: "DSA"
status: in-progress
sprint: 2
---
# DSA-US-2 Colour modes

One user story of [Design system & accessibility modes](epic.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-34 ("Accessibility modes") and brought into this form on 2026-10-06. The grilling of 2026-11-17 (Q377–Q401, `concepts/design-system.md` §13) narrowed it to the colour modes and moved reduced motion and font size to [DSA-US-4](DSA-US-4-font-size-and-reduced-motion.md); its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| DSA-US-2 | Colour modes | member | to choose one colour mode: standard, high contrast, alternative colours red-green, or alternative colours blue-yellow | I can read every text and tell every status apart on screen | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| DSA-AC-2.1 | High contrast | A member in any of the four themes | They choose the colour mode "High contrast" | Every text colour reaches at least 7:1 against its background (WCAG AAA); the themes light and sepia show the light high-contrast palette, the themes dark and night the dark one |
| DSA-AC-2.2 | Alternative colours red-green | A member in the theme light or sepia (light palette) or dark or night (dark palette) | They choose the colour mode "Alternative colours red-green" | The status colours and the accent colour change to the palette of that brightness; every pair of the four status colours and the accent colour differs by at least ΔE2000 15 as seen with simulated protanopia and with simulated deuteranopia; text keeps at least 4.5:1; every status still carries a text or an icon |
| DSA-AC-2.4 | Colour mode saved | A logged-in member | They choose the colour mode "High contrast" on one device and later log in on a second device whose device storage is empty | The choice applies at once and is saved in their profile; the second device shows high contrast from the first page after login |
| DSA-AC-2.6 | Alternative colours blue-yellow | A member in the theme light or sepia (light palette) or dark or night (dark palette) | They choose the colour mode "Alternative colours blue-yellow" | The status colours and the accent colour change to the palette of that brightness; every pair of the four status colours and the accent colour differs by at least ΔE2000 15 as seen with simulated tritanopia; text keeps at least 4.5:1; every status still carries a text or an icon |
| DSA-AC-2.7 | One colour mode | A member with the colour mode "High contrast" | They choose "Alternative colours blue-yellow" | High contrast is off, blue-yellow is on, and the control shows exactly one of its five options ("Follow system" and the four colour modes) as selected |
| DSA-AC-2.8 | Appearance menu | A logged-in member on any page of the web client | They open the button "Appearance" in the header with the Enter key | The menu shows the control "Theme" with 5 options ("Follow system" and the 4 themes) and the control "Colour mode" with 5 options ("Follow system" and the 4 colour modes), each showing the stored value as selected, or "Follow system" when none is stored; a choice takes effect at once without a reload; the Escape key closes the menu and returns focus to the button; the theme switcher no longer stands in the header outside the menu |
| DSA-AC-2.9 | System preferences | A person with no stored choice, a visitor or a member, whose system prefers the dark colour scheme and more contrast | They open a page | The page shows the theme dark in the colour mode "High contrast" (dark palette); with the system preferring the light colour scheme and no more contrast it shows the theme light in the colour mode "Standard"; nothing is stored for a visitor |
| DSA-AC-2.10 | Follow system | A logged-in member with the theme sepia and the colour mode "High contrast" stored, whose system prefers the dark colour scheme and no more contrast | They choose "Follow system" under "Theme" and under "Colour mode" | Both stored values are deleted on the device and in the profile; the page shows the theme dark in the colour mode "Standard" at once; both controls show "Follow system" as selected, with the value that applies beside it |

DSA-AC-2.3 (reduced motion) and DSA-AC-2.5 (font size) of the earlier form moved to [DSA-US-4](DSA-US-4-font-size-and-reduced-motion.md) as DSA-AC-4.1, DSA-AC-4.2, and DSA-AC-4.4; their numbers are not reused.

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. The cut is in the concept document, §16; each slice fits into 4 h (`WORKFLOW.md`, "Issues and weight").

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — high contrast in the browser | DSA-AC-2.1 | — | #71 |
| 2 — alternative colours and one colour mode | DSA-AC-2.2, DSA-AC-2.6, DSA-AC-2.7 | 1 | — |
| 3 — Appearance menu and system preferences | DSA-AC-2.8, DSA-AC-2.9, DSA-AC-2.10 | 1 | — |
| 4 — colour mode in the profile | DSA-AC-2.4 | 2, IDN-US-2 (log in, #46), DSA-US-1 slice 3 (#112), L1 (school management) | #161 |

- **Story issue:** #71 (slice 1 is merged; its three colour-vision modes and its separate accessibility button are reworked by slices 2 and 3)
- **Weight:** 5 (slice 1: 1, slice 2: 2, slice 3: 1, slice 4: 1)
- **Depends on:** DSA-US-1 (Design system with design tokens and four themes, #68); slice 4 also on IDN-US-2 (Log in and log out with rate limiting) — A10, Q377 — and on the answer of the school management to the legal question L1 (Q399)
