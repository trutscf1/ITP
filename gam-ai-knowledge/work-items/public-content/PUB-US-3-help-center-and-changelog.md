---
doc: story
format: gam-ai-knowledge/1
title: "PUB-US-3 Help center and changelog"
audience: [product, developer, reviewer, agent]
id-prefix: "PUB"
---
# PUB-US-3 Help center and changelog

One user story of [Public content: landing page, help center, changelog, legal pages](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-43 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| PUB-US-3 | Help center and changelog | member | a searchable help center and a changelog | I can answer questions myself and notice what is new | Should |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| PUB-AC-3.1 | Help articles | The help center | A member opens it | The help articles are grouped by category and can be searched |
| PUB-AC-3.2 | Changelog page | The changelog page | A member opens it | The releases are shown newest first, each with version, date, title, and text |
| PUB-AC-3.3 | Contextual help | A member inside the app | They follow a help link | It leads to the article assigned to the place they came from; if no article is assigned, to the start page of the help center |
| PUB-AC-3.4 | Public | A person without an account | They open the help center or the changelog | Both are reachable |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | PUB-AC-3.1, PUB-AC-3.2, PUB-AC-3.3, PUB-AC-3.4 | — | #80 |

- **Story issue:** #80
- **Weight:** 3
- **Depends on:** PUB-US-1 (Set up the headless CMS with Strapi, #78), slice 3 (delivery by web)
