---
doc: story
format: engineering-human/2
title: "OFF-US-3 Synchronization and conflict handling"
audience: [product, developer, reviewer, agent]
id-prefix: "OFF"
---
# OFF-US-3 Synchronization and conflict handling

One user story of [Offline mode: installable web app with sync and conflict handling](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-40 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| OFF-US-3 | Synchronization and conflict handling | member | changes I made offline to be synchronized as soon as I am online again | no change is lost | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| OFF-AC-3.1 | Queue | A member who is offline | They rename, move, delete, or upload | The action is put into a queue |
| OFF-AC-3.2 | Automatic sync | Queued actions | The connection returns | They are synchronized automatically and the progress is visible |
| OFF-AC-3.3 | Conflicts | A file changed on the server in the meantime | The member's queued change is synchronized | The conflict is detected and the member chooses their own version, the server version, or keep both |
| OFF-AC-3.4 | No data loss | The documented test scenarios | They are run | No data is lost |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. A story of this weight needs more than one slice of at most 4 h (`WORKFLOW.md`, "Issues and weight"); its owner cuts them in the concept document.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | OFF-AC-3.1, OFF-AC-3.2, OFF-AC-3.3, OFF-AC-3.4 | — | #77 |

- **Story issue:** #77
- **Weight:** 8
- **Depends on:** OFF-US-2 (Make files available offline, #76)
