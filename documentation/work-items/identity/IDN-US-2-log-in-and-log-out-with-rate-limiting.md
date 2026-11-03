---
doc: story
format: engineering-human/2
title: "IDN-US-2 Log in and log out with rate limiting"
audience: [product, developer, reviewer, agent]
id-prefix: "IDN"
---
# IDN-US-2 Log in and log out with rate limiting

One user story of [Identity: accounts, external login, MFA](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-09 and brought into this form on 2026-10-06. On 2026-11-03 the grilling replaced the technology names by neutral ones, fixed the lock (Q8), and added `IDN-AC-2.6` ([question log](../../concepts/identity.qa-log.md), A1, A8, Q8, Q9).

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| IDN-US-2 | Log in and log out with rate limiting | member | to log in and log out securely | my files are reachable only by me | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| IDN-AC-2.1 | Password login | A confirmed account | The member enters the right e-mail address and password | The member is logged in, with a session cookie that scripts in the page cannot read |
| IDN-AC-2.2 | Logout ends the session | A logged-in member | The member logs out | The session is ended on the server at once, and every unit refuses the old cookie |
| IDN-AC-2.3 | Lock after failed logins | One IP address and one account | 5 failed logins happen within one minute | The IP address and, separately, the password login of the account are locked for 15 minutes; a password reset of the account still works |
| IDN-AC-2.4 | Protected pages | A person who is not logged in | The person opens `/files/team-a` | The person is redirected to the login page and, after logging in, back to `/files/team-a` |
| IDN-AC-2.5 | Generic error | The login form | A person enters an unknown e-mail address, or a known one with a wrong password | Both get the same message "E-mail address or password is wrong." |
| IDN-AC-2.6 | Session lifetime | A member logged in on 2026-11-03 at 10:00 | The member uses stash on 2026-11-05 at 09:00 and then not for 7 days | The session is renewed until 2026-11-12 at 09:00 and ends then |

## Slices

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — login, logout, session check, locks (`tschudea07`) | IDN-AC-2.1, IDN-AC-2.2, IDN-AC-2.3, IDN-AC-2.5 (server), IDN-AC-2.6 | IDN-US-1 slice 1 | #46 |
| 2 — login page, logout button, route guard (`schwaigc`) | IDN-AC-2.4, IDN-AC-2.5 (page) | slice 1 | — |

- **Story issue:** #46
- **Weight:** 3
- **Depends on:** IDN-US-1 (Register by e-mail, #45)
