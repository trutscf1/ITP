---
doc: inbox
format: engineering-human/2
title: Inbox
audience: [developer, agent]
handle: "schauby1"
---
# Inbox — schauby1

New tasks and ideas for this developer land here first, before anyone plans them (P-ROAD-3); work nobody has claimed yet goes to the issue tracker instead. Processing an entry means: move it to the log in [ROADMAP-DETAILS.md](../../ROADMAP-DETAILS.md) and, if it is a planned feature, add it to [ROADMAP.md](../../ROADMAP.md). Then delete it here.

## Open

- [2026-10-27] From `trutscf1`, concept *Observability baseline* (R2, `concepts/observability.md` §15, MR of #114): (1) the job envelope in the contracts core gets the optional field `traceContext` (§8, OBS-F-15), and `storage` and `worker` call the shared package `telemetry` — this is slice 6 of OBS-US-1, an issue for you after `tickets`; (2) when you grill R5 and R9, add requirements that emit `upload.received`, `storage.capacity.used`, `storage.capacity.total` (R5) and `queue.jobs.waiting` (R9) exactly as in §8 (OBS-F-21 to OBS-F-23).
- [2026-10-06] Add `Developer handle: schauby1` to your own gitignored `CLAUDE.local.md` and read `team/TEAM.md`.
- [2026-10-06] Review the drafts that concern your features: the roles and success signals in `GOAL.md`, the *Serves* column in `ROADMAP.md`, and the concept drafts and work items of your features.
- [2026-10-13] From `trutscf1`, migration of `concepts/scaffolding.md`: please check what concerns your track — the error response `ErrorResponse { code, message }` (§8, `SCF-F-21`, assumption A15), the data services key-value store, document database, object storage, and virus scanner (`SCF-C-14`, `SCF-C-15`, `SCF-C-17`, `SCF-C-18`; move their rows from the capability index of `STACK.md` into your section when you choose the versions), and the acceptance tests `SCF-T-13` to `SCF-T-17`. Section numbers of the concept moved up by one from §3 on.
