---
doc: story
format: gam-ai-knowledge/1
title: "SHR-US-1 Share links with password and expiry"
audience: [product, developer, reviewer, agent]
id-prefix: "SHR"
status: backlog
sprint: 6
---
# SHR-US-1 Share links with password and expiry

One user story of [Share links with password and expiry](epic.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-16 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| SHR-US-1 | Share links with password and expiry | member | to share files and folders through a link with a password and an expiry date | people without an account can reach them safely | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| SHR-AC-1.1 | Unguessable token | A file or folder | A member creates a share link | The link holds a random token of at least 128 bits |
| SHR-AC-1.2 | Password and expiry | A member creating a share link | They set a password or an expiry date | The password is stored as an Argon2id hash and the link stops working after the expiry date |
| SHR-AC-1.3 | Permission choice | A member creating a share link | They choose the permission | The link allows either viewing only or viewing and downloading |
| SHR-AC-1.4 | Invalid link | An expired or revoked share link | A link recipient opens it | An understandable error page is shown |
| SHR-AC-1.5 | Own links | A member with share links | They open the overview of their links | All their links are listed and each can be revoked |
| SHR-AC-1.6 | Rate-limited password | A password-protected share link | Wrong passwords are entered repeatedly | The password prompt is rate-limited |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. A story of this weight needs more than one slice of at most 4 h (`WORKFLOW.md`, "Issues and weight"); its owner cuts them in the concept document.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | SHR-AC-1.1, SHR-AC-1.2, SHR-AC-1.3, SHR-AC-1.4, SHR-AC-1.5, SHR-AC-1.6 | — | #53 |

- **Story issue:** #53
- **Weight:** 5
- **Depends on:** TPM-US-2 (Inherited folder permissions, #52), STO-US-2 (Upload files, #57)
