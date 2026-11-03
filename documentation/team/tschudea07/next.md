---
doc: inbox
format: engineering-human/2
title: Inbox
audience: [developer, agent]
handle: "tschudea07"
---
# Inbox — tschudea07

New tasks and ideas for this developer land here first, before anyone plans them (P-ROAD-3); work nobody has claimed yet goes to the issue tracker instead. Processing an entry means: move it to the log in [ROADMAP-DETAILS.md](../../ROADMAP-DETAILS.md) and, if it is a planned feature, add it to [ROADMAP.md](../../ROADMAP.md). Then delete it here.

## Open

- [2026-10-27] From `trutscf1`, concept *Observability baseline* (R2, `concepts/observability.md` §15 and §16, MR of #114, you are its reviewer): `identity` includes `TelemetryConfig` in its configuration contract, calls `startTelemetry` and writes the start log entry before it accepts requests (OBS-F-1, OBS-F-25) — slice 5 of OBS-US-1, an issue for you after `tickets`. Log attributes holding passwords, tokens, or TOTP codes are redacted by key (OBS-F-14); nothing about a person goes into telemetry (OBS-NF-2).
- [2026-11-02] From `trutscf1`, concept *Observability baseline* (R2, `concepts/observability.md` §15, after your review of !22): (1) done on 2026-11-03 as the draft story IDN-US-7 of `concepts/identity.md` (Q4, Q7) — finish it when grilling IDN-US-7; the secret keys of the login flows went to the inbox of `trutscf1`; (2) when you grill R14, run the observability profile on the deployed server, route `/observability` over HTTPS only, and remove the host port of the dashboard tool (OBS-F-24, Q35, Q36); (3) the stack tests of §17 become one CI job `stack-test` once SCF-US-5 offers a container runtime (Q39).
- [2026-10-06] Review the drafts that concern your features: the roles and success signals in `GOAL.md`, the *Serves* column in `ROADMAP.md`, and the concept drafts and work items of your features.
- [2026-10-13] From `trutscf1`, migration of `concepts/scaffolding.md`: please check what concerns your track — the new requirements for the data model `SCF-F-22` to `SCF-F-26` and `SCF-E-7` (derived from `SCF-US-4`), the pipeline requirement `SCF-F-15` (now also pushes to feature branches and an accessibility job), `SCF-NF-10` (run time), the capabilities `SCF-C-19` and `SCF-C-21`, and the acceptance tests `SCF-T-18` to `SCF-T-30`. Section numbers of the concept moved up by one from §3 on.
