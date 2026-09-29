---
status: accepted
---

# Five runnable units behind one reverse-proxy origin

The system is split into five separately running units — `web`, `identity`, `storage`, `worker`, `cms` — one per owner area of the team, and the browser reaches `web`, `identity`, `storage`, and `cms` directly through one reverse proxy under a single origin, routed by path prefix; `worker` is internal only. We chose this because the project proposal demands a distributed architecture with four separate areas, because one unit per owner lets four people work in parallel without editing each other's code, and because large uploads must not pass through `web` (decided in R1, `documentation/concepts/scaffolding.md` Q1 and Q9, 2026-09-29).

## Considered Options

- **Fewer units: authentication and permissions inside `web`.** Simplest wiring, since the auth library integrates directly with the web framework. Rejected: `identity` code would live in the web client owner's unit, which recreates the merge conflicts the split is meant to avoid, and the proposal's distributed architecture would shrink to storage + CMS.
- **`web` as the only browser-facing unit (backend-for-frontend).** One public API surface. Rejected: every upload and download would be proxied through `web`, doubling traffic for large files and making resumable uploads depend on `web`.

## Consequences

- The session cookie is valid for all units because they share one origin; every unit must validate the session itself. How (token check against `identity` or locally verifiable tokens) is decided in R3.
- Units communicate only through the shared contracts package; since all units are released together, internal APIs are not versioned and a contract change updates every consumer in the same MR.
- Every new unit costs a container, a health endpoint, a proxy route, and CI jobs, so adding a sixth unit needs a new ADR.
