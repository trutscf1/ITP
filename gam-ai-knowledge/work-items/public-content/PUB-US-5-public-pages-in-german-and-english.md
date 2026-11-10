---
doc: story
format: gam-ai-knowledge/1
title: "PUB-US-5 Public pages in German and English"
audience: [product, developer, reviewer, agent]
id-prefix: "PUB"
---
# PUB-US-5 Public pages in German and English

One user story of [Public content: landing page, help center, changelog, legal pages](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was added in the grilling of 2026-10-06 ([question log](../../concepts/public-content.qa-log.md), Q4, Q7, Q9).

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| PUB-US-5 | Public pages in German and English | visitor | to read the public pages in German or in English | I understand them in the language I read better | Should |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| PUB-AC-5.1 | Language in the address | The landing page in German and English | A visitor opens `/de` or `/en` and then uses the language switch | The page is shown in the language of the address, and the switch opens the same page in the other language |
| PUB-AC-5.2 | First visit | A visitor whose browser prefers English | They open `/` | They land on `/en`; a browser that prefers neither German nor English lands on `/de` |
| PUB-AC-5.3 | Missing translation | A help article that exists only in German | A visitor opens it under `/en` | The German text is shown with the note "This page is not available in English." |
| PUB-AC-5.4 | Maintained per language | A content editor with an entry in German and English | They change and publish the English version | The English page shows the change and the German page is unchanged |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | PUB-AC-5.1, PUB-AC-5.2, PUB-AC-5.3, PUB-AC-5.4 | — | — |

- **Story issue:** — (created with `/engineering-human tickets public-content`)
- **Weight:** 3, estimated with the architecture chapter on 2026-10-20
- **Depends on:** PUB-US-1 (Set up the headless CMS with Strapi, #78), slice 3 (delivery by web)
