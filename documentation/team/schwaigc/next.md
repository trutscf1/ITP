---
doc: inbox
format: engineering-human/2
title: Inbox
audience: [developer, agent]
handle: "schwaigc"
---
# Inbox — schwaigc

New tasks and ideas for this developer land here first, before anyone plans them (P-ROAD-3); work nobody has claimed yet goes to the issue tracker instead. Processing an entry means: move it to the log in [ROADMAP-DETAILS.md](../../ROADMAP-DETAILS.md) and, if it is a planned feature, add it to [ROADMAP.md](../../ROADMAP.md). Then delete it here.

## Open

- [2026-10-27] From `trutscf1`, concept *Observability baseline* (R2, `concepts/observability.md` §15 and §16, MR of #114): `web` includes `TelemetryConfig` in its configuration contract, calls `startTelemetry` and writes the start log entry before it accepts requests (OBS-F-1, OBS-F-25) — slice 4 of OBS-US-1, an issue for you after `tickets`. Requests to `/health` stay out of telemetry (OBS-F-12).
- [2026-10-06] Review the drafts that concern your features: the roles and success signals in `GOAL.md`, the *Serves* column in `ROADMAP.md`, and the concept drafts and work items of your features.
- [2026-10-07] From `trutscf1`: !4 is merged. Record your implementation time for #38 with `/spend` (Definition of Done 14; none was recorded at the merge), add the points deferred from the review to #102, and rebase !5 on `dev`.
- [2026-10-20] R4 (`design-system.md`): state that the theme switcher is shown only to signed-in members and that a person without a session gets the default theme and no cookie (Q65, PUB-NF-3 of `public-content.md`, review of !18).
