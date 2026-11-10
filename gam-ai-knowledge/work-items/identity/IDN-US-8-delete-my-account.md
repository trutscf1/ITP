---
doc: story
format: gam-ai-knowledge/1
title: "IDN-US-8 Delete my account"
audience: [product, developer, reviewer, agent]
id-prefix: "IDN"
---
# IDN-US-8 Delete my account

One user story of [Identity: accounts, external login, MFA](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). Added on 2026-11-03 as a draft for the right to deletion ([question log](../../concepts/identity.qa-log.md), Q6); it is grilled before Sprint 3.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| IDN-US-8 | Delete my account | member | to delete my account and my data | nothing about me stays in stash | Should |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| IDN-AC-8.1 | Confirmed by password | A logged-in member in the account settings | The member deletes the account with the current password | The account, its `users` row, its sessions, and its credentials are gone, and the member is logged out |
| IDN-AC-8.2 | Files deleted | A deleted account that owned files | The deletion is done | `storage` has deleted the member's files and folders that no team owns |

## Slices

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story (`tschudea07`) | IDN-AC-8.1, IDN-AC-8.2 | IDN-US-2; an event of R5 that deletes files | — |

- **Story issue:** — (cut with `tickets` after grilling)
- **Weight:** 3
- **Depends on:** IDN-US-2 (Log in and log out with rate limiting, #46), storage core (R5)
