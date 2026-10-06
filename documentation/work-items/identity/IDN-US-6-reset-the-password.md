---
doc: story
format: engineering-human/2
title: "IDN-US-6 Reset the password"
audience: [product, developer, reviewer, agent]
id-prefix: "IDN"
---
# IDN-US-6 Reset the password

One user story of [Identity: accounts, external login, MFA](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-13 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| IDN-US-6 | Reset the password | member who forgot their password | to set a new password by e-mail | I get access to my account again | Should |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| IDN-AC-6.1 | Limited link | A member who requested a reset | They receive the link | The link is valid for 30 minutes and can be used once |
| IDN-AC-6.2 | Same password rules | The reset form | The member sets a new password | The same password rules as at registration apply |
| IDN-AC-6.3 | Sessions ended | A member with active sessions | The password is reset | All existing sessions are ended |
| IDN-AC-6.4 | Identical answer | The reset request form | A person enters any e-mail address | The answer is identical whether the address exists or not |
| IDN-AC-6.5 | Protected endpoint | The reset endpoint | Requests arrive | The endpoint is rate-limited and protected by captcha |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | IDN-AC-6.1, IDN-AC-6.2, IDN-AC-6.3, IDN-AC-6.4, IDN-AC-6.5 | — | #50 |

- **Story issue:** #50
- **Weight:** 2
- **Depends on:** IDN-US-1 (Register by e-mail, #45)
