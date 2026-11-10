---
doc: concept
format: gam-ai-knowledge/1
title: "Deployment: automatic deploy on push to main, TLS"
audience: [product, developer, reviewer, agent]
id-prefix: "DEP"
serves: "G-1.S1"
---
# Deployment: automatic deploy on push to `main`, TLS Concept

The specification of roadmap feature R14, for its owner, its reviewers, and the agents that will implement it. **This is a first draft made on 2026-10-06 from the team's tracker issues, before any grilling:** it holds the feature goal, the link to the user stories, and one requirement per acceptance criterion. Its owner (tschudea07) sharpens it with `/engineering-human deployment`.

## 0. Synthesis Context

Path A (frontloaded). Phase 1 (grill) has not started; nothing in this document is approved.

Open before Phase 4: the requirements below repeat their acceptance criterion one to one and still name technology, which belongs in `STACK.md` (P-DES-4); user interaction, non-functional, and capability requirements, the data model, error conditions, worked examples, architecture, and the test concept (§5–§17) are not written yet.

## 1. Purpose & Goal Trace

**Feature goal:** Every release reaches the team's own server automatically and is served over HTTPS, so that a tested version is always online.

**Serves:** `G-1.S1` in [GOAL.md](../GOAL.md), as stated in the *Serves* column of [ROADMAP.md](../ROADMAP.md).

## 3. User Stories & Acceptance Criteria

The user stories and their acceptance criteria are the work items in [work-items/deployment/](../work-items/deployment/feature.md); they are not repeated here (P-DOC-6).

## 4. Functional Requirements

Draft, derived one to one from the acceptance criteria.

| ID | Title | Requirement | Derives from |
| --- | --- | --- | --- |
| DEP-F-1 | Deploy on merge | Given a release merge to `main`, when the pipeline runs, the system MUST ensure that it builds the Docker images, pushes them to a registry, and deploys them to the Hetzner server. | DEP-AC-1.1 (Deploy on merge) |
| DEP-F-2 | TLS and redirect | Given the deployed system behind its reverse proxy with a certificate from Let's Encrypt (HTTP-01 challenge), when a browser requests a page over HTTP, the system MUST ensure that the request is redirected to HTTPS. | DEP-AC-1.2 (TLS and redirect) |
| DEP-F-3 | Secrets outside the code | Given the deployment, when it needs a secret, the system MUST ensure that the secret comes only from pipeline secrets or from `.env` on the server, never from the code. | DEP-AC-1.3 (Secrets outside the code) |
| DEP-F-4 | Failed deployment | Given a running version on the server, when a deployment fails, the system MUST ensure that the previous version keeps running. | DEP-AC-1.4 (Failed deployment) |
| DEP-F-5 | Documented procedure | Given the project documentation, when a team member looks up the deployment, the system MUST ensure that the deployment procedure is described there. | DEP-AC-1.5 (Documented procedure) |
