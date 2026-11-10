---
doc: story
format: gam-ai-knowledge/1
title: "TPM-US-3 Storage quotas"
audience: [product, developer, reviewer, agent]
id-prefix: "TPM"
status: backlog
sprint: 4
---
# TPM-US-3 Storage quotas

One user story of [Teams, roles, inherited permissions, quotas, audit log](epic.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-17 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| TPM-US-3 | Storage quotas | member who administers a team | to set storage quotas per member and per team | the space on the server is shared fairly | Should |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| TPM-AC-3.1 | Configurable quota | A member or a team | A team admin sets a quota | The quota applies, and without one the default from `.env` applies |
| TPM-AC-3.2 | Upload over quota | A member whose upload would exceed the quota | They start the upload | It is rejected before the upload with a clear message |
| TPM-AC-3.3 | Usage display | A member or team with stored files | They open the storage overview | The current usage is shown as a progress bar |
| TPM-AC-3.4 | Deduplicated files | The project documentation | A reader looks up quotas | It documents how deduplicated files are counted |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | TPM-AC-3.1, TPM-AC-3.2, TPM-AC-3.3, TPM-AC-3.4 | — | #54 |

- **Story issue:** #54
- **Weight:** 3
- **Depends on:** TPM-US-1 (Teams with roles, #51), STO-US-2 (Upload files, #57)
