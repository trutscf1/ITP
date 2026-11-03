---
doc: story
format: engineering-human/2
title: "IDN-US-6 Reset the password"
audience: [product, developer, reviewer, agent]
id-prefix: "IDN"
---
# IDN-US-6 Reset the password

One user story of [Identity: accounts, external login, MFA](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-13 and brought into this form on 2026-10-06. On 2026-11-03 the grilling made the criteria concrete and added `IDN-AC-6.6` ([question log](../../concepts/identity.qa-log.md), A9).

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| IDN-US-6 | Reset the password | member who forgot their password | to set a new password by e-mail | I get access to my account again | Should |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| IDN-AC-6.1 | Limited link | A member who requested a reset | The member opens the link after 31 minutes, or a second time | The link is refused as "invalid or expired"; within 30 minutes it works once |
| IDN-AC-6.2 | Same password rules | The new-password form | The member enters `password1234` | It is refused like at registration, and the link can still be used |
| IDN-AC-6.3 | Sessions ended | A member logged in on two devices | The password is reset | Both sessions are ended, and the login page says "Your password was changed. Please log in again." |
| IDN-AC-6.4 | Identical answer | The reset request form | A person enters a registered and an unknown address | Both get "Check your mailbox."; only the registered address gets an e-mail |
| IDN-AC-6.5 | Protected endpoint | The reset request | It is sent without a passing bot check, or for the 6th time within one minute from one IP address | It is refused with `bot-check-failed` or `too-many-requests` |
| IDN-AC-6.6 | Reset confirms the address | An account that was never confirmed | Its password is reset with the link | The member can log in without a separate confirmation |

## Slices

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — reset request and new password (`tschudea07`) | IDN-AC-6.1, IDN-AC-6.2 (server), IDN-AC-6.3, IDN-AC-6.4, IDN-AC-6.5, IDN-AC-6.6 | IDN-US-2 slice 1 | #50 |
| 2 — forgot-password and new-password pages (`schwaigc`) | IDN-AC-6.2 (page), IDN-AC-6.3 (message) | slice 1 | — |

- **Story issue:** #50
- **Weight:** 2
- **Depends on:** IDN-US-1 (Register by e-mail, #45), IDN-US-2 (Log in and log out with rate limiting, #46)
