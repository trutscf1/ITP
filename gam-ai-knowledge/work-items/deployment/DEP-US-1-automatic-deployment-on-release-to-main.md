---
doc: story
format: gam-ai-knowledge/1
title: "DEP-US-1 Automatic deployment on release to main"
audience: [product, developer, reviewer, agent]
id-prefix: "DEP"
---
# DEP-US-1 Automatic deployment on release to main

One user story of [Deployment: automatic deploy on push to `main`, TLS](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-06 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| DEP-US-1 | Automatic deployment on release to main | operator | every release merge to `main` to be deployed to the server automatically | a runnable, tested version is always online | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| DEP-AC-1.1 | Deploy on merge | A release merge to `main` | The pipeline runs | It builds the Docker images, pushes them to a registry, and deploys them to the Hetzner server |
| DEP-AC-1.2 | TLS and redirect | The deployed system behind its reverse proxy with a certificate from Let's Encrypt (HTTP-01 challenge) | A browser requests a page over HTTP | The request is redirected to HTTPS |
| DEP-AC-1.3 | Secrets outside the code | The deployment | It needs a secret | The secret comes only from pipeline secrets or from `.env` on the server, never from the code |
| DEP-AC-1.4 | Failed deployment | A running version on the server | A deployment fails | The previous version keeps running |
| DEP-AC-1.5 | Documented procedure | The project documentation | A team member looks up the deployment | The deployment procedure is described there |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. A story of this weight needs more than one slice of at most 4 h (`WORKFLOW.md`, "Issues and weight"); its owner cuts them in the concept document.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | DEP-AC-1.1, DEP-AC-1.2, DEP-AC-1.3, DEP-AC-1.4, DEP-AC-1.5 | — | #43 |

- **Story issue:** #43
- **Weight:** 5
- **Depends on:** SCF-US-5 (CI pipeline with quality and security checks, #42)
