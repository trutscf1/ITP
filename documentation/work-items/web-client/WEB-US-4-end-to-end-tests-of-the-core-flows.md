---
doc: story
format: engineering-human/2
title: "WEB-US-4 End-to-end tests of the core flows"
audience: [product, developer, reviewer, agent]
id-prefix: "WEB"
---
# WEB-US-4 End-to-end tests of the core flows

One user story of [Web client: dashboard, file browser, preview](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-37 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| WEB-US-4 | End-to-end tests of the core flows | team member | automated end-to-end tests of the most important flows | regressions are found before a release | Should |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| WEB-AC-4.1 | Covered flows | The Playwright test suite | It runs | It covers registration and login, upload, creating a folder, sharing by link, and search |
| WEB-AC-4.2 | Runs in CI | A pipeline run | The end-to-end tests run | They run against the Docker Compose environment |
| WEB-AC-4.3 | Browsers | The end-to-end tests | They run | They run in Chromium, Firefox, and WebKit and in a mobile viewport size |
| WEB-AC-4.4 | Accessibility | The end-to-end tests | They run | An axe accessibility check is part of them |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. A story of this weight needs more than one slice of at most 4 h (`WORKFLOW.md`, "Issues and weight"); its owner cuts them in the concept document.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | WEB-AC-4.1, WEB-AC-4.2, WEB-AC-4.3, WEB-AC-4.4 | — | #74 |

- **Story issue:** #74
- **Weight:** 5
- **Depends on:** SCF-US-5 (CI pipeline with quality and security checks, #42), WEB-US-1 (File browser, #69)
