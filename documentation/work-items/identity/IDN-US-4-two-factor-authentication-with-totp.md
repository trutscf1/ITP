---
doc: story
format: engineering-human/2
title: "IDN-US-4 Two-factor authentication with TOTP"
audience: [product, developer, reviewer, agent]
id-prefix: "IDN"
---
# IDN-US-4 Two-factor authentication with TOTP

One user story of [Identity: accounts, external login, MFA](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-11 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| IDN-US-4 | Two-factor authentication with TOTP | security-conscious member | to activate a second factor with an authenticator app | my account stays protected even if my password is stolen | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| IDN-AC-4.1 | Activation | A member in the security settings | They scan the QR code and enter a valid code | TOTP is activated |
| IDN-AC-4.2 | Code at login | A member with TOTP activated | They log in with their password | The TOTP code is requested |
| IDN-AC-4.3 | Backup codes | A member activating TOTP | The activation succeeds | 10 single-use backup codes are generated and shown exactly once |
| IDN-AC-4.4 | Deactivation | A member with TOTP activated | They deactivate it | Their password and a current code are required |
| IDN-AC-4.5 | Encrypted secrets | An activated TOTP | Its secret is stored | The secret is stored encrypted, with a key from the configuration |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | IDN-AC-4.1, IDN-AC-4.2, IDN-AC-4.3, IDN-AC-4.4, IDN-AC-4.5 | — | #48 |

- **Story issue:** #48
- **Weight:** 3
- **Depends on:** IDN-US-2 (Log in and log out with rate limiting, #46)
