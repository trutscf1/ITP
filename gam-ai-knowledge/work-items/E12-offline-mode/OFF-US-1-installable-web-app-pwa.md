---
doc: story
format: gam-ai-knowledge/1
title: "OFF-US-1 Installable web app (PWA)"
audience: [product, developer, reviewer, agent]
id-prefix: "OFF"
status: backlog
sprint: 4
---
# OFF-US-1 Installable web app (PWA)

One user story of [Offline mode: installable web app with sync and conflict handling](epic.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-38 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| OFF-US-1 | Installable web app (PWA) | member | to install Nimbus as an app on my phone and desktop | I reach it quickly without going through the browser | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| OFF-AC-1.1 | Manifest | The web client | A browser reads the web app manifest | It holds name, icons, and theme colour |
| OFF-AC-1.2 | Start without network | An installed app whose service worker cached the app shell | A member starts it without a network | The app starts |
| OFF-AC-1.3 | Installation | A member | They install the app in Chrome or Edge, or through "Add to Home Screen" on iOS | The installation works |
| OFF-AC-1.4 | Offline status | A member whose device is offline | They look at the interface | The offline status is shown |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | OFF-AC-1.1, OFF-AC-1.2, OFF-AC-1.3, OFF-AC-1.4 | — | #75 |

- **Story issue:** #75
- **Weight:** 3
- **Depends on:** WEB-US-1 (File browser, #69)
