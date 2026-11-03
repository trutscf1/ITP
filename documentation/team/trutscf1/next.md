---
doc: inbox
format: engineering-human/2
title: Inbox
audience: [developer, agent]
handle: "trutscf1"
---
# Inbox — trutscf1

New tasks and ideas for this developer land here first, before anyone plans them (P-ROAD-3); work nobody has claimed yet goes to the issue tracker instead. Processing an entry means: move it to the log in [ROADMAP-DETAILS.md](../../ROADMAP-DETAILS.md) and, if it is a planned feature, add it to [ROADMAP.md](../../ROADMAP.md). Then delete it here.

## Open

- [2026-11-03] From `tschudea07`, concept *Identity* (R3, `concepts/identity.md` §15): (1) add the error codes `bot-check-failed`, `too-many-requests`, `invalid-credentials`, `address-not-confirmed`, `registration-closed`, `link-invalid`, `no-session` with their statuses and messages (identity §8) to `ErrorResponse` in `scaffolding.md` §8 — needed before slice 1 of IDN-US-1 (#45) is merged; (2) add `botToken`, `confirmationToken`, `resetToken` to the secret key list of `observability.md` §8 ([IDN-NF-4]); (3) name the periods of [IDN-F-31], [IDN-NF-2], [IDN-NF-3] in the privacy template paragraphs of [PUB-F-22]. The bot check runs as a visible widget, so [PUB-F-23] shows no notice (A16); `SESSION_CHECK_TIMEOUT_MS` defaults to 1000 ms.

- [2026-11-02] Check what of two branches recorded in `dev` without their changes (round 54, Q256, Q257) is still missing. `concept/migrate-scaffolding`: five concept commits pushed after !13 was merged, never reviewed — `d2a36fe1e` (configuration parameters with type, default, range, boundary behavior, SCF-F-11), `a380a24c1` (neutral signatures, error code catalogue, seed shapes, SCF-F-21), `7e3c34b8e` (scans before a commit, SCF-F-14), `dbe2379a3` (CI test constraints, SCF-NF-10), `25b37dae9` (story wording, superseded by ADR-0004). `feature/40-contracts-zod-openapi`: the regeneration probe #127 (!25, `e2702e0fa`, `4e3d49ab1`, `bf7b1e033`) never reached `dev`; #127 is still open. Take over what is still valid in a new MR.
- [2026-10-27] Concept *Observability baseline* (R2) §15: in the MR of OBS-US-1 slice 1 add the removal of the trace headers to the routing table of `concepts/scaffolding.md` §8 (SCF-F-4), and in the MR of OBS-US-2 slice 5 the row `/observability` with its session check (changed on 2026-11-02); in the MR of slice 2 add the package `telemetry` to SCF-F-18, SCF-T-1, the §16 module tree, and `tests/monorepo.test.ts`; in the MR of OBS-US-2 slice 5 add the operator role and login name of `identity` to PUB-F-22 (privacy template) in `concepts/public-content.md`.
- [2026-10-06] Revoke the two project access tokens used until 2026-10-06 (Project → Settings → Access tokens). The other three team members each create an own personal access token (`docs/agents/issue-tracker.md`, "Access").
- [2026-10-06] Team review of the drafts in `GOAL.md` (roles R-1…R-3, success signals G-1.S1…S3) and of the *Serves* column in `ROADMAP.md`; only the wording of G-1 is confirmed.
- [2026-10-06] Promote the feature issues #87–#100 to group epics (`/promote`); needs a membership in the group, which `trutscf1` does not have — ask the teacher or a group owner.
- [2026-10-06] Owners review what was proposed for them on 2026-10-06: the cut of the six Sprint 1 stories into two slices each (#102–#107), the labels of #1–#3, the scope and estimate of #2 Corporate Identity, and the `README.md`.
- [2026-10-06] In the MR that delivers PUB-US-3 (help center and changelog): add the release step "a content editor writes and publishes the changelog entry in the team's installation" to `WORKFLOW.md`, "Releases" (`concepts/public-content.md` §15, Q19).
- [2026-09-29] R1: each owner writes the "Plan" section of their track file (`concepts/scaffolding.track-*.md`) before their first MR.
- [2026-10-13] After !6 (public content) is merged: update its references to `scaffolding.md` §7 to §8, and mark the two changes of its §15 that the migration carried out (`SCF-NF-1`, `SCF-F-8`, `SCF-U-1`) as done.
