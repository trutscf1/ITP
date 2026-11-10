---
doc: story
format: gam-ai-knowledge/1
title: "OFF-US-2 Make files available offline"
audience: [product, developer, reviewer, agent]
id-prefix: "OFF"
---
# OFF-US-2 Make files available offline

One user story of [Offline mode: installable web app with sync and conflict handling](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-39 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| OFF-US-2 | Make files available offline | member | to make selected files and folders available offline | I can reach them without an internet connection | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| OFF-AC-2.1 | Mark for offline | A file or folder | A member chooses "available offline" | It is marked as available offline |
| OFF-AC-2.2 | Local storage | A file marked for offline | It is synchronized | Its content is stored in the browser (Cache Storage or IndexedDB) and its metadata is replicated through CouchDB and PouchDB |
| OFF-AC-2.3 | Open offline | A file marked for offline on a device without a network | A member opens it | It can be opened and viewed |
| OFF-AC-2.4 | Usage and removal | A member with files marked for offline | They open the offline overview | The used offline storage is shown and each mark can be removed |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. A story of this weight needs more than one slice of at most 4 h (`WORKFLOW.md`, "Issues and weight"); its owner cuts them in the concept document.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | OFF-AC-2.1, OFF-AC-2.2, OFF-AC-2.3, OFF-AC-2.4 | — | #76 |

- **Story issue:** #76
- **Weight:** 8
- **Depends on:** OFF-US-1 (Installable web app (PWA), #75)
