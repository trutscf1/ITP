---
doc: concept
format: engineering-human/2
title: "Design system & accessibility modes"
audience: [product, developer, reviewer, agent]
id-prefix: "DSA"
serves: "G-1.S2"
---
# Design system & accessibility modes Concept

The specification of roadmap feature R4, for its owner, its reviewers, and the agents that will implement it. **This is a first draft made on 2026-10-06 from the team's tracker issues, before any grilling:** it holds the feature goal, the link to the user stories, and one requirement per acceptance criterion. Its owner (schwaigc) sharpens it with `/engineering-human design-system`.

## 0. Synthesis Context

Path A (frontloaded). Phase 1 (grill) has not started; nothing in this document is approved.

Open before Phase 4: the requirements below repeat their acceptance criterion one to one and still name technology, which belongs in `STACK.md` (P-DES-4); user interaction, non-functional, and capability requirements, the data model, error conditions, worked examples, architecture, and the test concept (§5–§17) are not written yet.

## 1. Purpose & Goal Trace

**Feature goal:** Members choose a theme and accessibility modes and operate everything by keyboard and screen reader, so that everyone can use the product.

**Serves:** `G-1.S2` in [GOAL.md](../GOAL.md), as stated in the *Serves* column of [ROADMAP.md](../ROADMAP.md).

## 3. User Stories & Acceptance Criteria

The user stories and their acceptance criteria are the work items in [work-items/design-system/](../work-items/design-system/feature.md); they are not repeated here (P-DOC-6).

## 4. Functional Requirements

Draft, derived one to one from the acceptance criteria.

| ID | Title | Requirement | Derives from |
| --- | --- | --- | --- |
| DSA-F-1 | Central tokens | Given the package `@nimbus/ui`, when a developer needs a colour, spacing, or type value, the system MUST ensure that the design tokens are defined centrally there. | DSA-AC-1.1 (Central tokens) |
| DSA-F-2 | Four themes | Given a member, when they switch between the four themes including light and dark, the system MUST ensure that the theme changes without a reload and the choice is saved in the profile. | DSA-AC-1.2 (Four themes) |
| DSA-F-3 | Component base | Given a component of the design system, when a developer builds it, the system MUST ensure that it is based on Radix UI and Tailwind CSS 4. | DSA-AC-1.3 (Component base) |
| DSA-F-4 | Contrast | Given any of the four themes, when text is shown, the system MUST ensure that it meets the WCAG AA contrast of at least 4.5:1. | DSA-AC-1.4 (Contrast) |
| DSA-F-5 | Storybook | Given a component of the design system, when a developer opens Storybook, the system MUST ensure that the component is documented there. | DSA-AC-1.5 (Storybook) |
| DSA-F-6 | High contrast | Given a member, when they activate the high-contrast mode, the system MUST ensure that the interface meets the WCAG AAA contrasts. | DSA-AC-2.1 (High contrast) |
| DSA-F-7 | Colour-blind modes | Given a member, when they activate a mode for protanopia, deuteranopia, or tritanopia, the system MUST ensure that the colours adapt, and no information is conveyed by colour alone. | DSA-AC-2.2 (Colour-blind modes) |
| DSA-F-8 | Reduced motion | Given a member whose system sets `prefers-reduced-motion` or `prefers-contrast`, when they open Nimbus, the system MUST ensure that the setting is respected automatically, and a reduced-motion mode can also be switched on by hand. | DSA-AC-2.3 (Reduced motion) |
| DSA-F-9 | Saved settings | Given a member, when they change an accessibility setting, the system MUST ensure that it is saved in the profile and applies at once. | DSA-AC-2.4 (Saved settings) |
| DSA-F-10 | Font size | Given a member, when they raise the font size to 200 %, the system MUST ensure that the layout does not break. | DSA-AC-2.5 (Font size) |
| DSA-F-11 | No mouse needed | Given a member using only the keyboard, when they use any function, the system MUST ensure that it is reachable with a visible focus indicator and a logical tab order. | DSA-AC-3.1 (No mouse needed) |
| DSA-F-12 | Skip link | Given a member using the keyboard, when they open a page, the system MUST ensure that a skip link leads to the main content. | DSA-AC-3.2 (Skip link) |
| DSA-F-13 | ARIA | Given a member using a screen reader, when they use the file browser, a dialog, or the upload progress, the system MUST ensure that ARIA roles and labels describe them, with live regions for the progress. | DSA-AC-3.3 (ARIA) |
| DSA-F-14 | Manual tests | Given the project documentation, when a reader looks up the accessibility tests, the system MUST ensure that manual tests with NVDA and VoiceOver are documented. | DSA-AC-3.4 (Manual tests) |
| DSA-F-15 | Automated check | Given the web client, when the automated axe check runs, the system MUST ensure that it reports no critical violation. | DSA-AC-3.5 (Automated check) |
