---
doc: story
format: gam-ai-knowledge/1
title: "PUB-US-1 Set up the headless CMS with Strapi"
audience: [product, developer, reviewer, agent]
id-prefix: "PUB"
---
# PUB-US-1 Set up the headless CMS with Strapi

One user story of [Public content: landing page, help center, changelog, legal pages](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-41 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| PUB-US-1 | Set up the headless CMS with Strapi | content editor | to maintain content through a headless CMS | landing page, help center, and changelog can be updated without a code change | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| PUB-AC-1.1 | CMS container | The running stack | It starts | Strapi runs as a container with its own PostgreSQL database |
| PUB-AC-1.2 | Content types | A content editor in Strapi | They create content | The content types landing-page sections, help articles with categories, changelog entries, and legal pages exist |
| PUB-AC-1.3 | Editor roles | The admin panel under `/cms` with the roles administrator and editor | A person without an editor login opens the admin panel or requests content from the CMS directly | They see only the login form, and the content request is refused |
| PUB-AC-1.4 | Cached delivery | A public page whose content an editor published at 10:00:00 | A visitor opens the page at 10:01:00 or later | The page shows the published change |
| PUB-AC-1.5 | Seed content | A fresh installation whose CMS holds no content | The stack starts for the first time | Example content exists for every content type in German and English; a CMS that already holds content is not changed |
| PUB-AC-1.6 | CMS unavailable | A public page that was loaded at least once, and the `cms` unit stopped | A visitor opens the page | The page shows its last loaded version |
| PUB-AC-1.7 | Unclaimed administrator | A fresh installation in which nobody registered as administrator yet | The operator opens the status page | The row of `cms` shows `degraded` and names the check `administrator-account`; after the first administrator registered it shows `ok` |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. Cut of 2026-10-20 with the architecture chapter ([concept §16](../../concepts/public-content.md)), so that each slice fits into 4 h (`WORKFLOW.md`, "Issues and weight"); it replaces the proposal of 2026-10-06, which had two slices. The modules of each slice are in the concept, §16, *Vertical Slices Breakdown*. The owner may recut it.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — CMS runs with its content types | PUB-AC-1.1, PUB-AC-1.2, PUB-AC-1.5 | — | #78 |
| 2 — Editor roles and first administrator | PUB-AC-1.3, PUB-AC-1.7 | 1 | #107 |
| 3 — Delivery by web | PUB-AC-1.4, PUB-AC-1.6 | 2 | — |

- **Story issue:** #78
- **Weight:** 8 (slice 1: 3, slice 2: 2, slice 3: 3), re-estimated with the architecture chapter on 2026-10-20; the tracker still shows 5 and the title of #107 still names the old cut (the owner decides)
- **Depends on:** SCF-US-2 (Local development environment with Docker Compose, #39)
