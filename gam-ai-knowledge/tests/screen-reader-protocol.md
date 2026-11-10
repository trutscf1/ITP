---
doc: test-strategy
format: gam-ai-knowledge/1
title: "Screen reader test protocol"
audience: [developer, reviewer, agent]
---
# Screen reader test protocol

The written steps for the manual tests of the web client with the screen readers NVDA and VoiceOver, and the table in which each run is recorded. Testers follow it, and reviewers read the result table to see whether DSA-AC-3.4 (Manual tests, DSA-F-14, DSA-T-15) is met; the decision to write it as a protocol is A14 in [the concept of the design system](../concepts/design-system.md), section 16.

## How to use this protocol

1. A person runs the protocol; an agent only keeps it up to date. DSA-AC-3.4 counts as met once one run per screen reader is recorded in the table under *Results*.
2. Serve the web client of the branch under test on your machine (`pnpm --filter @stash/web dev`, port 3000) or open the deployed environment. Open it in a new private window, so that no cookie of an earlier visit sets a theme or an accessibility mode.
3. Work through the section of your screen reader step by step. Each step has an *Expect* line: the role, the name, and the state the reader has to announce. The exact words differ between readers, versions, and verbosity settings; what must be announced is the name, the role, the state, and the position in a group.
4. Mark a step as failed when the reader announces nothing, a wrong or empty name, a wrong role or state, or when focus lands somewhere other than described. Write the step (for example "NVDA, theme switcher, step 2") and what you heard into the *Findings* column.
5. Add one row to the table per run (one screen reader, one browser, one page), with the result `pass`, `pass with findings`, or `fail`. Never add a row for a run that did not happen.
6. Afterwards switch every accessibility mode you changed back off, because the browser remembers them.

## Pages and controls under test

| Page | Controls under test |
| --- | --- |
| `/` | The skip link "Skip to main content", the header (banner landmark), the theme switcher (radio group "Theme" with Light, Dark, Sepia, Night), the button "Accessibility" with its dialog "Accessibility settings" (switch "High contrast", radio group "Colour vision" with None, Protanopia, Deuteranopia, Tritanopia, switch "Reduce motion"), and the main content (one heading of level 1, the links Templates, Learning, Deploy Now, Documentation, and the image "Next.js logo") |

The file browser, its dialogs, and the upload progress are not part of this protocol yet. They belong to DSA-AC-3.3 (slice 2 of DSA-US-3) and get their steps here when they exist; every new page gets its row in this table and its steps in both sections.

## NVDA

### NVDA setup

1. Use Windows 11 with the current NVDA release and write its version down (NVDA menu, Help, About).
2. Use Firefox or Chrome in its current version, at 100 % zoom; run the protocol once per browser you record.
3. Open the speech viewer (NVDA menu, Tools, Speech viewer) so that you can copy what NVDA says into the findings.
4. Keep the default settings of NVDA: browse mode on, the default speech and verbosity. Keys used below: Tab and Shift+Tab, Enter, Space, the arrow keys, D (next landmark), H (next heading), and the elements list with NVDA+F7 (NVDA is Insert or CapsLock).
5. Open the page and wait until it has loaded. Do not click into it; start with the focus at the top.

### NVDA skip link

1. Press Tab once. Expect: "Skip to main content, link", and the link is shown in the top left corner.
2. Press Enter. Expect: NVDA announces the main landmark (or starts reading the main content), and the link disappears again.
3. Press Tab. Expect: focus goes to the first control inside the main content ("Templates, link"), not back to the header.

### NVDA header

1. Reload the page and press D once from the top. Expect: "banner landmark".
2. Press D again. Expect: "main landmark". Open the elements list (NVDA+F7), landmarks tab. Expect: exactly one banner and one main.

### NVDA theme switcher

1. Press Tab twice from the top of the page (the skip link comes first). Expect: the group name "Theme" (radio group), then "Light, radio button, checked, 1 of 4".
2. Press the right arrow key. Expect: "Dark, radio button, not checked, 2 of 4"; the theme does not change yet.
3. Press Space. Expect: "checked", and the page changes to the dark theme at once without a reload.
4. Press Tab. Expect: focus leaves the group and goes to "Accessibility, button" (the other themes are not separate tab stops).

### NVDA accessibility settings

1. Press Tab until you hear "Accessibility, button, collapsed" with the hint that it opens a dialog (it follows the theme switcher).
2. Press Enter. Expect: "Accessibility settings, dialog", then focus on the first control: "High contrast, switch, off".
3. Press Space. Expect: "on", and the page shows the high-contrast colours at once.
4. Press Tab. Expect: the group name "Colour vision" (radio group), then "None, radio button, checked, 1 of 4".
5. Press the down arrow key. Expect: "Protanopia, radio button, checked, 2 of 4"; moving in a radio group selects the option.
6. Press Tab. Expect: "Reduce motion, switch, off". Press Space. Expect: "on".
7. Press Tab. Expect: focus stays inside the dialog and moves back to "High contrast".
8. Press Escape. Expect: the dialog closes and focus returns to "Accessibility, button, collapsed".
9. Reset: open the dialog again and switch High contrast and Reduce motion off and choose None for the colour vision.

### NVDA main content

1. Reload the page and press H. Expect: "heading level 1, To get started, edit the page.tsx file".
2. Press H again. Expect: no further heading (NVDA wraps to the first one or says there is none).
3. Press Down arrow from the heading to read the page. Expect: the image is read as "Next.js logo, graphic", the paragraph is read as text, and the links are read as "Templates, link", "Learning, link", "Vercel logomark Deploy Now, link", and "Documentation, link".
4. Press Tab from the top through the whole page. Expect: skip link, Theme group, Accessibility button, Templates, Learning, Deploy Now, Documentation, in this order, each with a visible focus indicator.

## VoiceOver

### VoiceOver setup

1. Use macOS with VoiceOver switched on with Command+F5, and write down the macOS version (Apple menu, About This Mac). VoiceOver is part of macOS, so its version is the macOS version.
2. Use Safari in its current version at 100 % zoom. In Safari, Settings, Advanced, switch on "Press Tab to highlight each item on a webpage"; otherwise Tab skips links.
3. Keep the default settings of VoiceOver. Keys used below: VO is Control+Option; VO+Right Arrow and VO+Left Arrow move through the page; VO+Space activates; Tab and Shift+Tab, the arrow keys, Escape; VO+U opens the rotor, whose Landmarks, Headings, and Links lists are used below.
4. Open the page, wait until it has loaded, and move the VoiceOver cursor to the top of the page with VO+Fn+Left Arrow (or reload the page). Do not click into it.

### VoiceOver skip link

1. Press Tab once. Expect: "Skip to main content, link", and the link is shown in the top left corner.
2. Press VO+Space (or Enter). Expect: VoiceOver moves to the main content and announces "main" (the landmark), and the link disappears again.
3. Press Tab. Expect: focus goes to the first control inside the main content ("Templates, link"), not back to the header.

### VoiceOver header

1. Open the rotor with VO+U and go to the Landmarks list with the arrow keys. Expect: exactly two entries, "banner" and "main".
2. Close the rotor with Escape, reload the page, and press VO+Right Arrow until you reach the header. Expect: VoiceOver announces entering the "banner" landmark.

### VoiceOver theme switcher

1. Press Tab twice from the top of the page. Expect: the group name "Theme" (radio group), then "Light, selected, radio button, 1 of 4".
2. Press the right arrow key. Expect: focus moves to "Dark, radio button, 2 of 4", not selected; the theme does not change yet.
3. Press VO+Space (or Space). Expect: "selected", and the page changes to the dark theme at once without a reload.
4. Press Tab. Expect: focus leaves the group and goes to "Accessibility, button" (the other themes are not separate tab stops).

### VoiceOver accessibility settings

1. Press Tab until you hear "Accessibility, collapsed, button" with the information that it opens a dialog (it follows the theme switcher).
2. Press VO+Space. Expect: "Accessibility settings, dialog", then focus on the first control: "High contrast, switch, off".
3. Press VO+Space. Expect: "on", and the page shows the high-contrast colours at once.
4. Press Tab. Expect: the group name "Colour vision" (radio group), then "None, selected, radio button, 1 of 4".
5. Press the down arrow key. Expect: "Protanopia, selected, radio button, 2 of 4"; moving in a radio group selects the option.
6. Press Tab. Expect: "Reduce motion, switch, off". Press VO+Space. Expect: "on".
7. Press Tab. Expect: focus stays inside the dialog and moves back to "High contrast".
8. Press Escape. Expect: the dialog closes and focus returns to "Accessibility, button, collapsed".
9. Reset: open the dialog again and switch High contrast and Reduce motion off and choose None for the colour vision.

### VoiceOver main content

1. Reload the page, open the rotor with VO+U, and go to the Headings list. Expect: exactly one entry, "To get started, edit the page.tsx file", heading level 1.
2. Go to the Links list. Expect: the links "Templates", "Learning", "Vercel logomark Deploy Now", and "Documentation", and the skip link.
3. Close the rotor and press VO+Right Arrow from the heading to read the page. Expect: the image is read as "Next.js logo, image", the paragraph is read as text, and the links are read as "link" with their names.
4. Press Tab from the top through the whole page. Expect: skip link, Theme group, Accessibility button, Templates, Learning, Deploy Now, Documentation, in this order, each with a visible focus indicator.

## Results

One row per run. Leave the table empty until a person has run the protocol; the empty table is the open state of DSA-AC-3.4.

| Date | Tester handle | Screen reader and version | Browser | Result | Findings |
| --- | --- | --- | --- | --- | --- |
