---
doc: concept
format: gam-ai-knowledge/1
title: "Design system & accessibility modes"
audience: [product, developer, reviewer, agent]
id-prefix: "DSA"
serves: "G-1.S2"
---
# Design system & accessibility modes Concept

The specification of roadmap feature R4, for its owner, its reviewers, and the agents that will implement it. **This is a first draft made on 2026-10-06 from the team's tracker issues, before any grilling:** it holds the feature goal, the link to the user stories, and one requirement per acceptance criterion. Its owner (schwaigc) sharpens it with `/gam-engineering design-system`.

## 0. Synthesis Context

Path A (frontloaded). Phase 1 (grill) has not started; nothing in this document is approved.

Open before Phase 4: the requirements below repeat their acceptance criterion one to one and still name technology, which belongs in `STACK.md` (P-DES-4); user interaction, non-functional, and capability requirements, the data model, error conditions, worked examples, architecture, and the test concept (§5–§17) are not written yet.

## 1. Purpose & Goal Trace

**Feature goal:** Members choose a theme and accessibility modes and operate everything by keyboard and screen reader, so that everyone can use the product.

**Serves:** `G-1.S2` in [GOAL.md](../GOAL.md), as stated in the *Serves* column of [ROADMAP.md](../ROADMAP.md).

## 3. User Stories & Acceptance Criteria

The user stories and their acceptance criteria are the work items in [work-items/E04-design-system/](../work-items/E04-design-system/epic.md); they are not repeated here (P-DOC-6).

## 4. Functional Requirements

Draft, derived one to one from the acceptance criteria.

| ID | Title | Requirement | Derives from |
| --- | --- | --- | --- |
| DSA-F-1 | Central tokens | Given the package `@stash/ui`, when a developer needs a colour, spacing, or type value, the system MUST ensure that the design tokens are defined centrally there. | DSA-AC-1.1 (Central tokens) |
| DSA-F-2 | Four themes | Given a member, when they switch between the four themes light, dark, sepia, and night, the system MUST ensure that the theme changes without a reload and that the browser remembers the choice for the next visit. | DSA-AC-1.2 (Four themes) |
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
| DSA-F-16 | Theme in the profile | Given a signed-in member, when they choose a theme, the system MUST save the choice in their profile so that it applies on every device they sign in on. | DSA-AC-1.6 (Theme in the profile) |
| DSA-F-17 | Settings remembered in the browser | Given a member, when they change an accessibility setting, the system MUST apply it at once without a reload and the browser MUST remember it for the next visit, until the profile takes over with DSA-F-9. | DSA-AC-2.4 (Saved settings) |

## 16. Design for Testability

Draft for DSA-US-2, written on 2026-11-10 when its owner chose to cut the story before the grilling (`qa-log.md`, Q340). Every decision below is an assumption the grilling of this concept may change.

### Slices of DSA-US-2

| Slice | Requirements | Issue | Blocked by |
| --- | --- | --- | --- |
| 1 — modes in the browser | DSA-F-6, DSA-F-7, DSA-F-8, DSA-F-10, DSA-F-17 (DSA-AC-2.1, 2.2, 2.3, 2.5; DSA-AC-2.4 up to the browser) | #71 | — |
| 2 — settings in the profile | DSA-F-9 (DSA-AC-2.4) | #161, cut with slice 3 of DSA-US-1 (#112) | the profile of IDN-US-2 (#46), #112 |

### Decisions of slice 1 (assumptions)

- **A1 — Modes sit beside the theme.** The accessibility settings are three independent values next to the theme: *contrast* (`system` or `high`), *colour vision* (`none`, `protanopia`, `deuteranopia`, `tritanopia`), and *motion* (`system` or `reduced`). `system` follows `prefers-contrast: more` and `prefers-reduced-motion: reduce` of the operating system automatically; the member can only add a mode by hand, never switch the system preference off.
- **A2 — High contrast has two palettes.** Light and sepia switch to a light high-contrast palette, dark and night to a dark one, so the member keeps a light or dark interface.
- **A3 — Colour vision changes the status colours.** Information-bearing colour lives only in status tokens (`success`, `warning`, `danger`, `info`); each colour-vision mode replaces them with a palette that stays distinguishable for that vision. A status is never shown by colour alone: the status badge always carries an icon and a text, the colour only marks it.
- **A4 — Reduced motion stops animations and transitions** on the whole page, both under the system preference and under the hand-set mode.
- **A5 — Font size follows the browser.** No own font-size setting: every type and spacing token is in `rem`, so the browser's font size and zoom scale the layout; at 200 % no content is cut off and no horizontal scroll appears at 1280 px.
- **A6 — Memory like the theme.** The settings are kept in one cookie read by the root layout, which renders them as attributes on `<html>`, so the first paint is right; slice 2 moves them into the profile.
- **A7 — One cookie, keyed value.** The cookie `stash-a11y` holds `contrast:<value>.vision:<value>.motion:<value>`, built only from characters RFC 6265 allows. The reader takes every part on its own, so an unknown or missing part falls back to its default and the others stay. The settings type is named `AccessibilityModes`, because `AccessibilitySettings` is the component that shows it.
- **A8 — Status colours are marks, measured as marks.** Each status colour reaches 3:1 against background and surface (WCAG 1.4.11) in every theme, contrast, and vision combination, because it is never the text. "Distinguishable for that vision" means a CIE Lab distance of at least 30 between every two of the four colours in the simulation of that vision (Machado et al. 2009, severity 1.0, computed inside the test). The high-contrast palettes change only the seven text and surface colour tokens, never the status colours.
- **A9 — The settings sit behind one button.** The controls open from a labelled button "Accessibility" in the header, next to the theme switcher, as a popover. A switch that is off means `system`, so the member never has to switch an operating-system preference off to follow it.
- **A10 — Components are tested from a build.** Node.js does not run `.tsx`, so the component tests compile `packages/ui` with `tsc` into a temporary folder and render the result with `react-dom/server`; the pure helpers and the stylesheet are tested directly.

### Modules and seams

| Module | Responsibility | Seam the tests use |
| --- | --- | --- |
| `@stash/ui` accessibility helpers | The settings type and defaults, reading and writing the cookie (unknown values fall back to the default), applying the settings as attributes on the root element | Pure functions, tested with plain objects, like the theme helpers |
| `@stash/ui` token stylesheet | The high-contrast palettes, the status tokens per colour-vision mode, the reduced-motion rule | The stylesheet text, measured by the contrast test |
| `@stash/ui` accessibility settings and status badge | The controls for the three settings (Radix primitives) and the badge with icon and text | Rendered with `react-dom/server`; one story each in Storybook |
| `web` root layout | Reads the cookie and renders the attributes on `<html>`, shows the controls next to the theme switcher | The running web client, checked in the accessibility job of CI |

### Slices of DSA-US-3

Cut on 2026-11-10, when its owner chose to build what does not wait for the file browser (Q277 of the chat session `844a9ca5`, confirmed by Q349). Every decision below is an assumption the grilling of this concept may change.

| Slice | Requirements | Issue | Blocked by |
| --- | --- | --- | --- |
| 1 — keyboard, skip link, checks | DSA-F-11, DSA-F-12, DSA-F-14, DSA-F-15 (DSA-AC-3.1, 3.2, 3.4, 3.5 for the pages and controls that exist) | #72 | — |
| 2 — screen reader for files | DSA-F-13 (DSA-AC-3.3); DSA-AC-3.1 and 3.5 for the new screens | #163 | the file browser of WEB-US-1 (#69) and the upload |

### Decisions of slice 1 of DSA-US-3 (assumptions)

- **A11 — One main landmark, one skip link.** The root layout renders a skip link "Skip to main content" as the first focusable element and wraps every page in one `<main id="main-content" tabindex="-1">`; a page holds no `<main>` of its own. The link is hidden until it gets focus and then shown in the top corner.
- **A12 — One focus indicator for everything.** A global `:focus-visible` outline of 2 px in the accent colour with a 2 px offset, defined once in the token stylesheet, so every control has the same visible focus; it reaches 3:1 against background and surface in every theme and contrast mode (WCAG 2.4.7, 1.4.11). No control removes the outline without an equal replacement.
- **A13 — Tab order is reading order.** No positive `tabIndex` anywhere; the order of the controls follows the source order, header before main content.
- **A14 — The manual tests are a protocol in the repository.** The NVDA (Windows, Firefox or Chrome) and VoiceOver (macOS, Safari) runs follow a written protocol with steps per page and control and a result table (date, tester handle, screen reader and version, browser, result, findings). The agent writes the protocol; the runs are done by a person, and DSA-AC-3.4 counts as met once one run per screen reader is recorded.
- **A15 — axe in every theme and contrast mode.** The automated check runs axe on every page in each of the four themes, with and without high contrast, and fails on a critical violation.
- **A16 — The keyboard walk is a browser check.** In the running web client, Tab from the top of each page reaches every control in source order, each with a visible focus indicator, and the first Tab plus Enter moves focus to the main content.
- **A17 — The protocol is a document of its own.** The screen-reader protocol is `gam-ai-knowledge/tests/screen-reader-protocol.md` with `doc: test-strategy`, a type the checker `doc-check.mjs` knows and `MANIFEST.md` lists in its documentation-set table (folder `tests/`) and its frontmatter table. It is not a section of this concept, because its result table grows with every run while the concept stays stack-neutral and stable. The protocol keeps one table for all runs, so a reviewer sees both screen readers at once; an empty table is the open state of DSA-AC-3.4, and every row that exists has an ISO date, a tester handle, a reader of NVDA or VoiceOver with a version, a browser, and a result of `pass`, `pass with findings`, or `fail`.
- **A18 — The skip link is a plain anchor in the root layout.** It is page structure of the web client, not a reusable control, so it is not a component of `@stash/ui` and has no story. Because the root layout is an async server component that Node.js cannot render without Next.js, the Node test reads its source; the browser check proves the behaviour.
- **A19 — A composite widget is one tab stop.** The keyboard walk counts a toggle group or radio group (roving focus) as one stop, because Tab enters it once and the arrow keys move inside it. The walk also opens the accessibility popover by keyboard (Enter on its button) and checks that its controls are reached in source order with a visible focus indicator, and that Escape returns focus to the button. The popover is non-modal (a Radix popover without a focus trap): Tab loops inside it while it is open, and nothing else is hidden from the reader. The walk covers the pages in the list `pages` of the check; today that is `/`.

## 17. Test Concept & TDD Contract

Draft. DSA-T-1 to DSA-T-5, DSA-T-7, DSA-T-8, DSA-T-12, DSA-T-13, DSA-T-15, DSA-T-16, DSA-T-17, and the stylesheet parts of DSA-T-9 and DSA-T-11 exist and run with `pnpm test` (`tests/design-system.test.ts`, `tests/theme.test.ts`, `tests/contrast.test.ts`, `tests/storybook.test.ts`, `tests/accessibility-settings.test.ts`, `tests/accessibility-tokens.test.ts`, `tests/accessibility-components.test.ts`, and for slice 1 of DSA-US-3 `tests/keyboard-focus.test.ts` for DSA-T-12, `tests/skip-link.test.ts` for DSA-T-13, `tests/screen-reader-protocol.test.ts` for DSA-T-15 on the protocol `tests/screen-reader-protocol.md`, `tests/accessibility-check.test.ts` for DSA-T-16; seams agreed in `qa-log.md`, Q75; Storybook itself is built with `pnpm --filter @stash/ui run build-storybook`); the browser parts are in the accessibility check `tests/accessibility/axe-check.ts`, which the CI job `accessibility` runs against the built web client (`pnpm run test:accessibility`) and which also runs axe and the 200 % check with the settings popover open: DSA-T-7 and DSA-T-9 (with `prefers-contrast: more` emulated, `<body>` shows the high-contrast palette; no running animation under `prefers-reduced-motion` and under `data-motion="reduced"`), DSA-T-11 (200 % root font size, no horizontal scroll at 1280 px, no content wider than its box, no text cut off by `overflow`), DSA-T-17 (the high-contrast switch sets `data-contrast` at once and keeps it after a reload), DSA-T-16 (axe on every page in each of the four themes, with and without high contrast, the popover closed and open, set through the cookies `stash-theme` and `stash-a11y`), and the keyboard walk of DSA-T-12 and DSA-T-13 (the first Tab focuses the skip link and Enter moves focus to `#main-content`; Tab from the top reaches every focusable control in source order, each with a visible focus indicator, in the page and in the popover opened by keyboard); the manual runs of DSA-T-15 are recorded by a person in the protocol and none is recorded yet; every other row is a planned test that its slice writes first and that the grilling of this concept may sharpen. Each test name carries the `AC` ID it covers (`STACK.md` §6).

### Acceptance Tests

| ID | Title | Covers | Given | When | Then |
| --- | --- | --- | --- | --- | --- |
| DSA-T-1 | Central tokens | DSA-AC-1.1, DSA-F-1 | The token stylesheet of `@stash/ui` | The test reads its base block | It declares colour, spacing, and type tokens |
| DSA-T-2 | Four themes switch and are remembered | DSA-AC-1.2, DSA-F-2 | The token stylesheet and the theme helpers | Each of dark, sepia, and night is checked, a theme is applied, and the cookie is written and read | Every theme sets every colour token, the root element carries the new theme, and an unknown or missing cookie falls back to light |
| DSA-T-3 | Component base | DSA-AC-1.3, DSA-F-3 | The package `@stash/ui` and the web unit | The test reads their manifests and sources | `@stash/ui` depends on Radix UI and Tailwind CSS 4, the theme switcher uses a Radix primitive, and the web unit loads the tokens |
| DSA-T-4 | Contrast in every theme | DSA-AC-1.4, DSA-F-4 | Each of the four themes | Every text colour is measured against its background | The contrast ratio is at least 4.5:1 |
| DSA-T-5 | Components in Storybook | DSA-AC-1.5, DSA-F-5 | Every exported component of `@stash/ui` | Storybook is built | Each component has at least one story |
| DSA-T-6 | Theme in the profile | DSA-AC-1.6, DSA-F-16 | A signed-in member with theme sepia | They sign in on a second device | The second device shows sepia |
| DSA-T-7 | High contrast | DSA-AC-2.1, DSA-F-6 | The high-contrast mode | Every text colour is measured against its background | The contrast ratio is at least 7:1 |
| DSA-T-8 | Colour-blind modes | DSA-AC-2.2, DSA-F-7 | Each colour-blind mode | A status is shown | Its colours change and it also carries a text or icon |
| DSA-T-9 | Reduced motion | DSA-AC-2.3, DSA-F-8 | A system that sets `prefers-reduced-motion` | The web client opens, and later the member switches the mode on by hand | No animation runs in either case |
| DSA-T-10 | Saved accessibility settings | DSA-AC-2.4, DSA-F-9 | A signed-in member | They change an accessibility setting and reload | The setting applies at once and is still set after the reload |
| DSA-T-11 | Font size 200 % | DSA-AC-2.5, DSA-F-10 | Every page of the web client | The root font size is doubled | No content overlaps or is cut off and no horizontal scroll appears at 1280 px |
| DSA-T-17 | Settings remembered in the browser | DSA-AC-2.4, DSA-F-17 | The accessibility helpers | A setting is applied, and the cookie is written and read | The root element carries the setting at once, the cookie returns it, and an unknown or missing cookie falls back to the defaults |
| DSA-T-12 | Keyboard only | DSA-AC-3.1, DSA-F-11 | Every page of the web client | It is walked through with Tab | Every control is reached in reading order with a visible focus indicator |
| DSA-T-13 | Skip link | DSA-AC-3.2, DSA-F-12 | Any page | The first Tab is pressed and Enter follows | Focus moves to the main content |
| DSA-T-14 | ARIA roles and live regions | DSA-AC-3.3, DSA-F-13 | The file browser, a dialog, and an upload in progress | The accessibility tree is read | Each has its role and label, and the progress is announced through a live region |
| DSA-T-15 | Manual screen-reader tests | DSA-AC-3.4, DSA-F-14 | The project documentation | A reader looks for the accessibility tests | NVDA and VoiceOver test runs with date and result are documented |
| DSA-T-16 | Automated axe check | DSA-AC-3.5, DSA-F-15 | Every page of the web client in each theme | The axe check runs in CI | It reports no critical violation |
