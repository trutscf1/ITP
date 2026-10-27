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
- [2026-10-06] Add `Developer handle: tschudea07` to your own gitignored `CLAUDE.local.md` and read `team/TEAM.md`.
- [2026-10-06] Review the drafts that concern your features: the roles and success signals in `GOAL.md`, the *Serves* column in `ROADMAP.md`, and the concept drafts and work items of your features.
- [2026-10-06] From `trutscf1`, *Public content* (R11): when you grill `concepts/identity.md`, specify the notice text the provider of the bot protection prescribes (German and English) and the configuration value that hides its badge; the web client places that notice (`concepts/public-content.md` §15, PUB-F-23). Two more points for your concepts: the landing page treats a person as not signed in when the session check does not answer (PUB-F-33), and a feature that stores a new kind of personal data adds its paragraph to the privacy template (`concepts/public-content.md` §14).
- [2026-10-13] From `trutscf1`, migration of `concepts/scaffolding.md`: please check what concerns your track — the new requirements for the data model `SCF-F-22` to `SCF-F-26` and `SCF-E-7` (derived from `SCF-US-4`), the pipeline requirement `SCF-F-15` (now also pushes to feature branches and an accessibility job), `SCF-NF-10` (run time), the capabilities `SCF-C-19` and `SCF-C-21`, and the acceptance tests `SCF-T-18` to `SCF-T-30`. Section numbers of the concept moved up by one from §3 on.
