---
doc: story
format: engineering-human/2
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
| PUB-AC-1.3 | Editor roles | Strapi | It runs | Editor roles exist and the admin panel is not reachable publicly |
| PUB-AC-1.4 | Cached delivery | A public page | The frontend loads its content | It comes from the Strapi API with caching (ISR) |
| PUB-AC-1.5 | Seed content | A fresh local environment | The seed runs | Example content exists for local development |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. Proposed cut of 2026-10-06, made before the architecture chapter exists, so that each slice fits into 4 h (`WORKFLOW.md`, "Issues and weight"); the owner may recut it.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — CMS runs with its content types | PUB-AC-1.1, PUB-AC-1.2, PUB-AC-1.5 | — | #78 |
| 2 — Editor roles and cached delivery | PUB-AC-1.3, PUB-AC-1.4 | 1 | #107 |

- **Story issue:** #78
- **Weight:** 5 (slice 1: 3, slice 2: 2)
- **Depends on:** SCF-US-2 (Local development environment with Docker Compose, #39)
