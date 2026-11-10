---
doc: story
format: gam-ai-knowledge/1
title: "TPM-US-2 Inherited folder permissions"
audience: [product, developer, reviewer, agent]
id-prefix: "TPM"
---
# TPM-US-2 Inherited folder permissions

One user story of [Teams, roles, inherited permissions, quotas, audit log](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-15 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| TPM-US-2 | Inherited folder permissions | member who administers a team | to grant permissions on folders that subfolders and files inherit | sensitive areas can be restricted on purpose | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| TPM-AC-2.1 | Permission levels | A folder | A team admin grants a permission | Read, write, or manage can be granted per folder to single members or to roles |
| TPM-AC-2.2 | Inheritance | A folder with a granted permission | A member opens a subfolder | The subfolder inherits the permission, unless the inheritance is overridden for that folder |
| TPM-AC-2.3 | Effective permission | A member and a folder | A team admin opens the folder's permissions | The member's effective permission is shown |
| TPM-AC-2.4 | Central check | Any storage endpoint | A request arrives | The endpoint uses the one central permission check |
| TPM-AC-2.5 | Tested rules | The permission check | The unit tests run | They cover inheritance and overriding |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. A story of this weight needs more than one slice of at most 4 h (`WORKFLOW.md`, "Issues and weight"); its owner cuts them in the concept document.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | TPM-AC-2.1, TPM-AC-2.2, TPM-AC-2.3, TPM-AC-2.4, TPM-AC-2.5 | — | #52 |

- **Story issue:** #52
- **Weight:** 8
- **Depends on:** TPM-US-1 (Teams with roles, #51)
