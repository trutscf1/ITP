---
doc: story
format: gam-ai-knowledge/1
title: "OFF-US-2 Make files available offline"
audience: [product, developer, reviewer, agent]
id-prefix: "OFF"
status: backlog
sprint: 5
---
# OFF-US-2 Make files available offline

One user story of [Offline mode: installable web app with sync and conflict handling](epic.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-39 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| OFF-US-2 | Make files available offline | member | to make selected files and folders available offline | I can reach them without an internet connection | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| OFF-AC-2.1 | Mark for offline | A file or folder | A member chooses "available offline" | It is marked as available offline; for a folder, everything inside it is marked |
| OFF-AC-2.2 | Local storage | A file marked for offline | It is synchronized | Its content is stored on the device and its metadata is replicated to it |
| OFF-AC-2.3 | Open offline | A file marked for offline on a device without a network | A member opens it | It can be opened and viewed |
| OFF-AC-2.4 | Usage and removal | A member with files marked for offline | They open the offline overview | The used offline storage is shown and each mark can be removed |
| OFF-AC-2.5 | Storage limit | A device whose offline storage would exceed the limit set by the operator | A member marks a file or folder | The marking is refused with a message that names the limit, and nothing of it is stored |
| OFF-AC-2.6 | Sign-out clears the device | A member with files marked for offline and changes not yet synchronized | They sign out | They are warned first how many changes are not synchronized; after the sign-out the offline content and metadata of their account are gone from the device |
| OFF-AC-2.7 | Folder marks follow the folder | A folder marked for offline | A file is added to it on the server | The file is made available offline at the next synchronization |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. A story of this weight needs more than one slice of at most 4 h (`WORKFLOW.md`, "Issues and weight"); its owner cuts them in the concept document.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — mark, store, and open files and folders (`trutscf1`) | OFF-AC-2.1, OFF-AC-2.2, OFF-AC-2.3, OFF-AC-2.7 | OFF-US-1 | #76 |
| 2 — offline overview and storage limit (`trutscf1`) | OFF-AC-2.4, OFF-AC-2.5 | slice 1 | — |
| 3 — sign-out clears the device (`trutscf1`) | OFF-AC-2.6 | slice 1; the logout of IDN-US-2 | — |

- **Story issue:** #76
- **Weight:** 8 (slice 1: 4, slice 2: 2, slice 3: 2)
- **Depends on:** OFF-US-1 (Installable web app (PWA), #75)
