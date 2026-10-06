---
doc: story
format: engineering-human/2
title: "TPM-US-4 Audit log"
audience: [product, developer, reviewer, agent]
id-prefix: "TPM"
---
# TPM-US-4 Audit log

One user story of [Teams, roles, inherited permissions, quotas, audit log](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-18 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| TPM-US-4 | Audit log | member who administers a team | to see who did which action and when | security incidents and operating mistakes can be cleared up | Should |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| TPM-AC-4.1 | Logged actions | A team | A member logs in, uploads, downloads, deletes, shares, or changes permissions | The action is written to the audit log |
| TPM-AC-4.2 | Entry content | An audit log entry | It is written | It holds time, member, action, affected resource, and IP address |
| TPM-AC-4.3 | Team log | A team admin | They open the team's audit log | They see the entries and can filter them by member, action, and period |
| TPM-AC-4.4 | Immutable entries | An audit log entry | Anyone tries to change or delete it through the application | The application offers no way to do so |
| TPM-AC-4.5 | Retention | Entries older than the configurable retention period | The cleanup job runs | They are removed |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | TPM-AC-4.1, TPM-AC-4.2, TPM-AC-4.3, TPM-AC-4.4, TPM-AC-4.5 | — | #55 |

- **Story issue:** #55
- **Weight:** 3
- **Depends on:** TPM-US-1 (Teams with roles, #51)
