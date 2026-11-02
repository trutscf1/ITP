---
doc: story
format: engineering-human/2
title: "IDN-US-1 Register by e-mail"
audience: [product, developer, reviewer, agent]
id-prefix: "IDN"
---
# IDN-US-1 Register by e-mail

One user story of [Identity: accounts, external login, MFA](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-08 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| IDN-US-1 | Register by e-mail | new member | to register with my e-mail address and a password | I can store my files in Nimbus | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| IDN-AC-1.1 | Shared validation | The registration form (TanStack Form or React Hook Form) | A person submits it | Client and server validate the input with the same Zod rules |
| IDN-AC-1.2 | Password rules | The registration form | A person enters a password | A password shorter than 12 characters or on a list of common passwords is rejected, and a strength indicator is shown |
| IDN-AC-1.3 | Password hashing | A successful registration | The account is stored | The password is hashed with Argon2id |
| IDN-AC-1.4 | E-mail verification | A newly registered account | The person registers | They receive a confirmation e-mail with a time-limited link, and login is possible only after verification |
| IDN-AC-1.5 | Captcha | The registration endpoint | A registration is submitted | The captcha (Cloudflare Turnstile or reCAPTCHA v3) is checked on the server, unless it is switched off by `.env` for offline operation |
| IDN-AC-1.6 | No account disclosure | An e-mail address that is already registered | A person registers with it | The error message does not reveal whether the address is registered |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. A story of this weight needs more than one slice of at most 4 h (`WORKFLOW.md`, "Issues and weight"); its owner cuts them in the concept document.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | IDN-AC-1.1, IDN-AC-1.2, IDN-AC-1.3, IDN-AC-1.4, IDN-AC-1.5, IDN-AC-1.6 | — | #45 |

- **Story issue:** #45
- **Weight:** 5
- **Depends on:** SCF-US-3 (Shared contracts with Zod and OpenAPI, #40), SCF-US-4 (Data model and Prisma schema, #41)
