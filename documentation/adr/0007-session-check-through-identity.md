---
doc: adr
format: engineering-human/2
title: "Every unit checks a session by asking identity"
audience: [product, developer, reviewer, agent]
status: proposed
date: "2026-11-03"
deciders: ["tschudea07"]
overrides: []
supersedes: []
---
# ADR-0007 — Every unit checks a session by asking identity

## In plain words

When a member's browser sends a request to `web` or `storage`, that unit asks `identity` whether the session cookie is valid and gets the member back, or "no session". A logout or a password reset therefore takes effect in every unit at the same moment.

## Context

[ADR-0001](0001-five-units-behind-one-origin.md) puts five units behind one origin, so one session cookie reaches all of them, and it leaves to R3 how each unit validates that session. The Identity concept requires that a logout ends the session on the server at once ([IDN-AC-2.2] logout ends the session) and that a password reset ends every session ([IDN-AC-6.3] sessions ended). Decided in `concepts/identity.md`, Q9, on 2026-11-03.

## Decision

Every unit that needs a member asks `identity` per request through its session check (`GET /api/identity/session`, [IDN-F-37]) and treats no answer within `SESSION_CHECK_TIMEOUT_MS` as no session. We chose this because a logout and a reset must take effect at once, and because only `identity` then knows how sessions are stored.

## Consequences

- Each request to `web` or `storage` that needs a member costs one internal call to `identity`; [IDN-NF-7] bounds it to 50 ms at the 95th percentile, and R13 measures it under load.
- When `identity` is down, members appear logged out everywhere; public pages keep working ([PUB-F-33]).
- The storage format of sessions can change without touching another unit.

## Considered options

- **Short-lived signed tokens checked locally.** No internal call per request. Rejected: a logout or reset would take effect only when the token expires, which contradicts IDN-AC-2.2 and IDN-AC-6.3, and key rotation adds work.
- **Every unit reads the session store directly.** Fast. Rejected: every unit would depend on the storage format of the authentication library and need access to the session store.
