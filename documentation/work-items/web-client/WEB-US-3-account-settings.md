---
doc: story
format: engineering-human/2
title: "WEB-US-3 Account settings"
audience: [product, developer, reviewer, agent]
id-prefix: "WEB"
---
# WEB-US-3 Account settings

One user story of [Web client: dashboard, file browser, preview](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-36 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| WEB-US-3 | Account settings | member | to manage profile, security, and appearance in one place | I can look after my account myself | Should |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| WEB-AC-3.1 | Sections | A member | They open the account settings | They find the sections profile (name, avatar), security (password, MFA, passkeys), appearance (theme, accessibility), and linked accounts |
| WEB-AC-3.2 | Sessions | A member with several active sessions | They open the session list | Every session is listed and can be ended on its own |
| WEB-AC-3.3 | Delete account | A member | They delete their account and confirm it | The account and all its data are deleted (GDPR) |
| WEB-AC-3.4 | Form validation | Any form in the settings | A member submits it | It is validated with the shared Zod schemas |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. A story of this weight needs more than one slice of at most 4 h (`WORKFLOW.md`, "Issues and weight"); its owner cuts them in the concept document.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | WEB-AC-3.1, WEB-AC-3.2, WEB-AC-3.3, WEB-AC-3.4 | — | #73 |

- **Story issue:** #73
- **Weight:** 5
- **Depends on:** IDN-US-4 (Two-factor authentication with TOTP, #48), DSA-US-1 (Design system with design tokens and four themes, #68)
