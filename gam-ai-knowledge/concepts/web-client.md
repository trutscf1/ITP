---
doc: concept
format: gam-ai-knowledge/1
title: "Web client: dashboard, file browser, preview"
audience: [product, developer, reviewer, agent]
id-prefix: "WEB"
serves: "G-1"
---
# Web client: dashboard, file browser, preview Concept

The specification of roadmap feature R6, for its owner, its reviewers, and the agents that will implement it. **This is a first draft made on 2026-10-06 from the team's tracker issues, before any grilling:** it holds the feature goal, the link to the user stories, and one requirement per acceptance criterion. Its owner (schwaigc) sharpens it with `/gam-engineering web-client`.

## 0. Synthesis Context

Path A (frontloaded). Phase 1 (grill) has not started; nothing in this document is approved.

Open before Phase 4: the requirements below repeat their acceptance criterion one to one and still name technology, which belongs in `STACK.md` (P-DES-4); user interaction, non-functional, and capability requirements, the data model, error conditions, worked examples, architecture, and the test concept (§5–§17) are not written yet.

## 1. Purpose & Goal Trace

**Feature goal:** Members browse, preview, and manage their files and their account in one clear web client that works from a 360 px screen up.

**Serves:** `G-1` in [GOAL.md](../GOAL.md), as stated in the *Serves* column of [ROADMAP.md](../ROADMAP.md).

## 3. User Stories & Acceptance Criteria

The user stories and their acceptance criteria are the work items in [work-items/E06-web-client/](../work-items/E06-web-client/epic.md); they are not repeated here (P-DOC-6).

## 4. Functional Requirements

Draft, derived one to one from the acceptance criteria.

| ID | Title | Requirement | Derives from |
| --- | --- | --- | --- |
| WEB-F-1 | Views and sorting | Given a member in a folder, when they switch between list and grid view or sort by name, size, or date, the system MUST ensure that the view changes accordingly. | WEB-AC-1.1 (Views and sorting) |
| WEB-F-2 | Bulk actions | Given a member with several items selected, when they choose move, delete, download, or share, the system MUST ensure that the action applies to all selected items. | WEB-AC-1.2 (Bulk actions) |
| WEB-F-3 | Context menu | Given a file in the list, when a member opens its context menu, also with the keyboard, the system MUST ensure that the menu with the file's actions opens. | WEB-AC-1.3 (Context menu) |
| WEB-F-4 | Small screens | Given a screen 360 px wide, when a member uses the file browser, the system MUST ensure that every function can be operated. | WEB-AC-1.4 (Small screens) |
| WEB-F-5 | States | Given a folder that is loading, empty, or failed to load, when a member opens it, the system MUST ensure that the state is shown in an understandable way. | WEB-AC-1.5 (States) |
| WEB-F-6 | Supported formats | Given an image, PDF, text or Markdown, audio, or video file, when a member opens it, the system MUST ensure that a preview is shown. | WEB-AC-2.1 (Supported formats) |
| WEB-F-7 | Arrow keys | Given an open preview, when a member presses the left or right arrow key, the system MUST ensure that the previous or next file is shown. | WEB-AC-2.2 (Arrow keys) |
| WEB-F-8 | Unsupported formats | Given a file in a format without preview, when a member opens it, the system MUST ensure that the file information and a download button are shown. | WEB-AC-2.3 (Unsupported formats) |
| WEB-F-9 | Focus and Escape | Given an open preview dialog, when a member tabs through it or presses Escape, the system MUST ensure that the focus stays inside the dialog, and Escape closes it. | WEB-AC-2.4 (Focus and Escape) |
| WEB-F-10 | Sections | Given a member, when they open the account settings, the system MUST ensure that they find the sections profile (name, avatar), security (password, MFA, passkeys), appearance (theme, accessibility), and linked accounts. | WEB-AC-3.1 (Sections) |
| WEB-F-11 | Sessions | Given a member with several active sessions, when they open the session list, the system MUST ensure that every session is listed and can be ended on its own. | WEB-AC-3.2 (Sessions) |
| WEB-F-12 | Delete account | Given a member, when they delete their account and confirm it, the system MUST ensure that the account and all its data are deleted (GDPR). | WEB-AC-3.3 (Delete account) |
| WEB-F-13 | Form validation | Given any form in the settings, when a member submits it, the system MUST ensure that it is validated with the shared Zod schemas. | WEB-AC-3.4 (Form validation) |
| WEB-F-14 | Covered flows | Given the Playwright test suite, when it runs, the system MUST ensure that it covers registration and login, upload, creating a folder, sharing by link, and search. | WEB-AC-4.1 (Covered flows) |
| WEB-F-15 | Runs in CI | Given a pipeline run, when the end-to-end tests run, the system MUST ensure that they run against the Docker Compose environment. | WEB-AC-4.2 (Runs in CI) |
| WEB-F-16 | Browsers | Given the end-to-end tests, when they run, the system MUST ensure that they run in Chromium, Firefox, and WebKit and in a mobile viewport size. | WEB-AC-4.3 (Browsers) |
| WEB-F-17 | Accessibility | Given the end-to-end tests, when they run, the system MUST ensure that an axe accessibility check is part of them. | WEB-AC-4.4 (Accessibility) |
