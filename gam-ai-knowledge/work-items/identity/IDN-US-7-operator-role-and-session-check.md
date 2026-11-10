---
doc: story
format: gam-ai-knowledge/1
title: "IDN-US-7 Operator role and session check"
audience: [product, developer, reviewer, agent]
id-prefix: "IDN"
---
# IDN-US-7 Operator role and session check

One user story of [Identity: accounts, external login, MFA](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). Added on 2026-11-03 as a draft at the request of the Observability concept ([OBS-F-27]; [question log](../../concepts/identity.qa-log.md), Q4, Q7); it is grilled before Sprint 3.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| IDN-US-7 | Operator role and session check | operator | to open the operations dashboards with my stash login | only operators see the operations data | Should |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| IDN-AC-7.1 | Role from the configuration | The configured list of operator addresses holds `ops@example.org` | The confirmed account `ops@example.org` and another account log in | Only the first has the operator role |
| IDN-AC-7.2 | Check for the reverse proxy | A request with an operator session, one with a member session, and one without a session | The reverse proxy asks `identity` | The answers are "allowed" with the login name, "forbidden", and "no session" |

## Slices

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story (`tschudea07`) | IDN-AC-7.1, IDN-AC-7.2 | IDN-US-2 | — |

- **Story issue:** — (cut with `tickets` after grilling)
- **Weight:** 2
- **Depends on:** IDN-US-2 (Log in and log out with rate limiting, #46)
