---
doc: story
format: engineering-human/2
title: "IDN-US-2 Log in and log out with rate limiting"
audience: [product, developer, reviewer, agent]
id-prefix: "IDN"
---
# IDN-US-2 Log in and log out with rate limiting

One user story of [Identity: accounts, external login, MFA](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-09 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| IDN-US-2 | Log in and log out with rate limiting | registered member | to log in and log out securely | my files are reachable only by me | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| IDN-AC-2.1 | Password login | A verified account | The member enters e-mail address and password | They are logged in through Better Auth (≥ 1.76) |
| IDN-AC-2.2 | Server-side sessions | A logged-in member whose session is stored in Redis | They log out | The session is invalidated on the server |
| IDN-AC-2.3 | Rate limiting | An IP address or an account | 5 failed login attempts happen within one minute | That IP address or account is locked temporarily |
| IDN-AC-2.4 | Protected routes | A person who is not logged in | They open a protected route secured by `proxy.ts` | They are redirected to the login page |
| IDN-AC-2.5 | Generic error | The login form | A person enters wrong credentials | A generic error message appears |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | IDN-AC-2.1, IDN-AC-2.2, IDN-AC-2.3, IDN-AC-2.4, IDN-AC-2.5 | — | #46 |

- **Story issue:** #46
- **Weight:** 3
- **Depends on:** IDN-US-1 (Register by e-mail, #45)
