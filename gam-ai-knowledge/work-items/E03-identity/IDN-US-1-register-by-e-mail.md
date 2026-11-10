---
doc: story
format: gam-ai-knowledge/1
title: "IDN-US-1 Register by e-mail"
audience: [product, developer, reviewer, agent]
id-prefix: "IDN"
status: ready
sprint: 2
---
# IDN-US-1 Register by e-mail

One user story of [Identity: accounts, external login, MFA](epic.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-08 and brought into this form on 2026-10-06. On 2026-11-03 the grilling replaced the technology names by neutral ones, named the product stash, and added `IDN-AC-1.7` to `IDN-AC-1.9` ([question log](../../concepts/identity.qa-log.md), Q2, Q5, A1, A5, A6, A14, A15).

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| IDN-US-1 | Register by e-mail | member | to register with my display name, my e-mail address, and a password | I can store my files in stash | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| IDN-AC-1.1 | Shared validation | The registration form | A person submits an empty name, a name of 101 characters, or the e-mail address `ada@example` | The page shows the error next to the field before sending, and the server refuses the same input with `validation-failed` and stores nothing |
| IDN-AC-1.2 | Password rules | The registration form | A person enters `kurz123`, `password1234`, or `Drei-blaue-Wolken-7` | The first two are refused (fewer than 12 characters; among the 10,000 most common passwords), the third is accepted, and the strength bar shows `Weak`, `Weak`, and `Strong` |
| IDN-AC-1.3 | Password hashing | A successful registration | The account is stored | The password is stored only as a memory-hard hash and appears in no table, log entry, or response |
| IDN-AC-1.4 | E-mail confirmation | A new registration | The person logs in before and after opening the link of the confirmation e-mail | Before: "Please confirm your e-mail address first."; the link works once within 24 hours; after: the login succeeds |
| IDN-AC-1.5 | Bot check | The bot check switched on, then switched off in the configuration | A registration is sent without a passing bot check | Switched on, it is refused with `bot-check-failed`; switched off, no bot check is shown and the registration is accepted |
| IDN-AC-1.6 | No account disclosure | An address with a confirmed account, one with an unconfirmed account, and a new one | A person registers with each | Every answer is "Check your mailbox."; the confirmed address gets a notice e-mail without a link, the other two get a confirmation link |
| IDN-AC-1.7 | Registration closed | The operator closed the registration in the configuration | A person opens the registration page and sends a registration | The page says "Registration is closed."; the server refuses with `registration-closed`; login and reset still work |
| IDN-AC-1.8 | Unconfirmed accounts removed | An account not confirmed for more than 7 days | The hourly clean-up has run | The account and its data are gone, and the address can register again |
| IDN-AC-1.9 | Registration throttled | One IP address | It sends 6 registrations within one minute | The 6th is refused with `too-many-requests` |

## Slices

The vertical slices that deliver this story (concept §16, Q13). Slice 1 is delivered by the story issue itself; slice 2 becomes a child issue of it with `/gam-engineering tickets identity`.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — registration API, confirmation, clean-up, `identity` in the local stack (`tschudea07`) | IDN-AC-1.1 (server), IDN-AC-1.2 (server), IDN-AC-1.3, IDN-AC-1.4, IDN-AC-1.5, IDN-AC-1.6, IDN-AC-1.7 (server), IDN-AC-1.8, IDN-AC-1.9 | new error codes in `scaffolding.md` §8 (`trutscf1`) | #45 |
| 2 — registration page and confirmation result (`schwaigc`) | IDN-AC-1.1 (page), IDN-AC-1.2 (strength bar), IDN-AC-1.7 (page) | slice 1 | — |

- **Story issue:** #45
- **Weight:** 5
- **Depends on:** SCF-US-3 (Shared contracts with Zod and OpenAPI, #40), SCF-US-4 (Data model and relational schema, #41)
