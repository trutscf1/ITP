---
doc: adr
format: gam-ai-knowledge/1
title: "Five runnable units behind one reverse-proxy origin"
audience: [product, developer, reviewer, agent]
status: accepted
date: "2026-09-29"
deciders: ["trutscf1"]
overrides: []
supersedes: []
---
# ADR-0001 — Five runnable units behind one reverse-proxy origin

## In plain words

The system consists of five separately running parts, one per area of the team, and the browser reaches four of them under one address. This lets four people work in parallel and keeps large uploads away from the web client.

## Context

The project proposal demands a distributed architecture with four separate areas, and four people must be able to work without editing each other's code. Decided in R1, `documentation/concepts/scaffolding.md` Q1 and Q9, 2026-09-29.

## Decision

The system is split into five separately running units — `web`, `identity`, `storage`, `worker`, `cms` — one per owner area of the team, and the browser reaches `web`, `identity`, `storage`, and `cms` directly through one reverse proxy under a single origin, routed by path prefix; `worker` is internal only. We chose this because the project proposal demands a distributed architecture with four separate areas, because one unit per owner lets four people work in parallel without editing each other's code, and because large uploads must not pass through `web`.

## Consequences

- The session cookie is valid for all units because they share one origin; every unit must validate the session itself. How (token check against `identity` or locally verifiable tokens) is decided in R3.
- Units communicate only through the shared contracts package; since all units are released together, internal APIs are not versioned and a contract change updates every consumer in the same MR.
- Every new unit costs a container, a health endpoint, a proxy route, and CI jobs, so adding a sixth unit needs a new ADR.

## Considered options

- **Fewer units: authentication and permissions inside `web`.** Simplest wiring, since the auth library integrates directly with the web framework. Rejected: `identity` code would live in the web client owner's unit, which recreates the merge conflicts the split is meant to avoid, and the proposal's distributed architecture would shrink to storage + CMS.
- **`web` as the only browser-facing unit (backend-for-frontend).** One public API surface. Rejected: every upload and download would be proxied through `web`, doubling traffic for large files and making resumable uploads depend on `web`.
