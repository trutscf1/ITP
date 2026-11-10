---
doc: story
format: gam-ai-knowledge/1
title: "TPM-US-1 Teams with roles"
audience: [product, developer, reviewer, agent]
id-prefix: "TPM"
---
# TPM-US-1 Teams with roles

One user story of [Teams, roles, inherited permissions, quotas, audit log](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-14 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| TPM-US-1 | Teams with roles | member who owns a team | to create a team and invite members with roles | we can work on files together | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| TPM-AC-1.1 | Roles | A team | A member is given a role | The role is one of Owner, Admin, Editor, or Viewer, each with documented rights |
| TPM-AC-1.2 | Invitation | A team owner | They invite a person by e-mail | The person receives an invitation that expires after 7 days |
| TPM-AC-1.3 | Manage members | A team with several members | An owner or admin changes a role or removes a member | The change takes effect, and the last owner cannot be removed |
| TPM-AC-1.4 | Team root folder | A new team | It is created | The team has its own root folder |
| TPM-AC-1.5 | Server-side check | A member without the required right | They call the action directly, bypassing the interface | The server rejects it |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. A story of this weight needs more than one slice of at most 4 h (`WORKFLOW.md`, "Issues and weight"); its owner cuts them in the concept document.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | TPM-AC-1.1, TPM-AC-1.2, TPM-AC-1.3, TPM-AC-1.4, TPM-AC-1.5 | — | #51 |

- **Story issue:** #51
- **Weight:** 5
- **Depends on:** SCF-US-4 (Data model and Prisma schema, #41), IDN-US-2 (Log in and log out with rate limiting, #46)
