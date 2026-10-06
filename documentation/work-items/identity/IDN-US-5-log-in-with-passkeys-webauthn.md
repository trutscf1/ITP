---
doc: story
format: engineering-human/2
title: "IDN-US-5 Log in with passkeys (WebAuthn)"
audience: [product, developer, reviewer, agent]
id-prefix: "IDN"
---
# IDN-US-5 Log in with passkeys (WebAuthn)

One user story of [Identity: accounts, external login, MFA](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-12 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| IDN-US-5 | Log in with passkeys (WebAuthn) | member | to log in with a passkey | I log in quickly, without a password, and safe from phishing | Should |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| IDN-AC-5.1 | Manage passkeys | A member in the account settings | They register, name, or delete a passkey | The passkey is added, renamed, or removed |
| IDN-AC-5.2 | Browser support | A member with a registered passkey | They log in with it in a current version of Chrome, Firefox, or Safari | The login succeeds |
| IDN-AC-5.3 | Several passkeys | A member with one passkey | They register another one | Both passkeys work for the account |
| IDN-AC-5.4 | Counts as MFA | A member with multi-factor authentication required | They log in with a passkey | The multi-factor requirement counts as fulfilled |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | IDN-AC-5.1, IDN-AC-5.2, IDN-AC-5.3, IDN-AC-5.4 | — | #49 |

- **Story issue:** #49
- **Weight:** 3
- **Depends on:** IDN-US-4 (Two-factor authentication with TOTP, #48)
