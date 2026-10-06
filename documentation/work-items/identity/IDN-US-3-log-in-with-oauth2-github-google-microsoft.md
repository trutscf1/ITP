---
doc: story
format: engineering-human/2
title: "IDN-US-3 Log in with OAuth2 (GitHub, Google, Microsoft)"
audience: [product, developer, reviewer, agent]
id-prefix: "IDN"
---
# IDN-US-3 Log in with OAuth2 (GitHub, Google, Microsoft)

One user story of [Identity: accounts, external login, MFA](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-10 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| IDN-US-3 | Log in with OAuth2 (GitHub, Google, Microsoft) | member | to log in with my existing GitHub, Google, or Microsoft account | I do not have to manage one more password | Should |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| IDN-AC-3.1 | Provider buttons | The login page | It is shown | A login button is visible for each of the three providers that is configured in `.env`, and for no other |
| IDN-AC-3.2 | Account on first login | A person without an account | They log in through an OAuth provider for the first time | The account is created together with its own `users` row |
| IDN-AC-3.3 | Link and unlink | A member in the account settings | They link an OAuth provider to their existing account or unlink it | The link is created or removed |
| IDN-AC-3.4 | Cancelled login | A person at the provider's page | They cancel the login | The login page shows an understandable message |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | IDN-AC-3.1, IDN-AC-3.2, IDN-AC-3.3, IDN-AC-3.4 | — | #47 |

- **Story issue:** #47
- **Weight:** 3
- **Depends on:** IDN-US-2 (Log in and log out with rate limiting, #46)
