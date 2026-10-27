---
doc: story
format: engineering-human/2
title: "PUB-US-2 Public landing page"
audience: [product, developer, reviewer, agent]
id-prefix: "PUB"
---
# PUB-US-2 Public landing page

One user story of [Public content: landing page, help center, changelog, legal pages](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-42 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| PUB-US-2 | Public landing page | visitor | to see on a landing page what stash offers | I can decide whether to register | Should |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| PUB-AC-2.1 | Public and from the CMS | A visitor without an account | They open the landing page | The page is reachable without login and its content comes from Strapi |
| PUB-AC-2.2 | Responsive and accessible | The landing page | It is opened on a screen 320 pixels wide and checked with the automated accessibility check | It is readable without horizontal scrolling, and the check reports 0 violations |
| PUB-AC-2.3 | Licence-free media | The landing page | It shows images and icons | Each one is licence-free, and its source and licence are recorded in the CMS |
| PUB-AC-2.4 | Call to action | A visitor on the landing page | They look for the next step | A call to action leads to registration and login |
| PUB-AC-2.5 | Meta tags | The landing page | A crawler reads it | Meta and Open Graph tags are set |
| PUB-AC-2.6 | Signed-in member | A signed-in member | They open `/` | They see the dashboard instead of the landing page |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | PUB-AC-2.1, PUB-AC-2.2, PUB-AC-2.3, PUB-AC-2.4, PUB-AC-2.5, PUB-AC-2.6 | — | #79 |

- **Story issue:** #79
- **Weight:** 3
- **Depends on:** DSA-US-1 (Design system with design tokens and four themes, #68), PUB-US-1 (Set up the headless CMS with Strapi, #78), slice 3 (delivery by web)
