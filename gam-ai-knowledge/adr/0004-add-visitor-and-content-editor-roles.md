---
doc: adr
format: gam-ai-knowledge/1
title: "Add the roles visitor and content editor to the project goal"
audience: [product, developer, reviewer, agent]
status: accepted
date: "2026-10-06"
deciders: ["trutscf1"]
overrides: []
supersedes: []
---
# ADR-0004 — Add the roles visitor and content editor to the project goal

## In plain words

Two groups of people use the public part of the product without being members: visitors who read the public pages and the editor who maintains them. Both are now named as target users, so that user stories can be written for them.

## Context

`GOAL.md` listed three target-user roles: `R-1` (member), `R-2` (operator), `R-3` (link recipient). The user stories of the feature *Public content: landing page, help center, changelog, legal pages* are written for a visitor and for a content editor, and the project proposal demands a public landing page, a help center, and a changelog maintained through a headless CMS. Decided in [qa-log.md](../qa-log.md), Q12.

## Decision

`GOAL.md` gets `R-4` (visitor) and `R-5` (content editor). The goal `G-1`, the success signals, and the non-goals are unchanged. No role is added for developers: stories about the system's inner workings are written for the operator (`R-2`), who benefits from them.

## Consequences

- Re-checked descendants (P-GOAL-3): the roadmap features and the existing stories name only roles that still exist; the stories `PUB-US-1`, `PUB-US-2`, and `PUB-US-4` now name a listed role. The stories `STO-US-1` (connect the storage backend) and `BGP-US-1` (background processing) were reworded from "developer" to "operator".
- The stories of the R1 concept (scaffolding) keep "developer" and "team member": that concept is still in the legacy format and its stories are reworded when it is migrated.
