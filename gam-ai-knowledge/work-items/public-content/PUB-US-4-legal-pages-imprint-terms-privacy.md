---
doc: story
format: gam-ai-knowledge/1
title: "PUB-US-4 Legal pages (imprint, terms, privacy)"
audience: [product, developer, reviewer, agent]
id-prefix: "PUB"
---
# PUB-US-4 Legal pages (imprint, terms, privacy)

One user story of [Public content: landing page, help center, changelog, legal pages](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-44 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| PUB-US-4 | Legal pages (imprint, terms, privacy) | visitor | to open imprint, terms, and privacy policy without logging in | I can inform myself about the operator and the data processing | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| PUB-AC-4.1 | Footer links | A person without an account | They use the footer | Imprint, terms, and privacy policy are reachable |
| PUB-AC-4.2 | Privacy content | The privacy policy | A reader opens it | It names all processed data and all services in use (for example captcha, OAuth providers) |
| PUB-AC-4.3 | Captcha notice | A page on which bot protection is switched on and its badge is hidden | A person opens it | The prescribed notice text is visible; with bot protection switched off, no notice is shown |
| PUB-AC-4.4 | Maintained in the CMS | A content editor | They change a legal page in the CMS | The change appears on the public page |
| PUB-AC-4.5 | Built-in legal text | A fresh installation whose CMS was never reachable | A person opens a legal page | The page shows the legal text built into the product |
| PUB-AC-4.6 | Legal templates | A fresh installation whose legal pages no editor has changed | A person opens a legal page | The text has marked placeholders for the operator's data, and its first sentence says that it is a template the operator has not filled in yet |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | PUB-AC-4.1, PUB-AC-4.2, PUB-AC-4.3, PUB-AC-4.4, PUB-AC-4.5, PUB-AC-4.6 | — | #81 |

- **Story issue:** #81
- **Weight:** 3, re-estimated with the architecture chapter on 2026-10-20 (the three legal templates and the privacy paragraphs are written text, [concept §8](../../concepts/public-content.md)); the tracker still shows 2 (the owner decides)
- **Depends on:** PUB-US-1 (Set up the headless CMS with Strapi, #78), slice 3 (delivery by web)
