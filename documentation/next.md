---
doc: inbox
format: engineering-human/2
title: Inbox
audience: [developer, agent]
---
# Inbox

New tasks and ideas land here first, before anyone plans them (P-ROAD-3). Processing an entry means: move it to the log in [ROADMAP-DETAILS.md](ROADMAP-DETAILS.md) and, if it is a planned feature, add it to [ROADMAP.md](ROADMAP.md). Then delete it here.

## Open

- [2026-10-06] Review and merge the migration MR !1 `concept/migrate-engineering-human` → `dev` (issue #86); a person other than the author reviews it.
- [2026-10-06] Switch to team mode with `/engineering-human team` (decided, ADR-0002). This also makes the skill available to the whole team: today it exists only in Fabian's user folder, but `CLAUDE.md` makes it mandatory for everyone.
- [2026-10-06] Team review of the drafts in `GOAL.md` (roles R-1…R-3, success signals G-1.S1…S3) and of the *Serves* column in `ROADMAP.md`; only the wording of G-1 is confirmed.
- [2026-10-06] Give the GitLab user stories US-01…US-48 (#38–#85) their work-item files, feature epics, and IDs with the concept prefix as each feature's concept is written (ADR-0002, P-TRK-2). Seven Sprint 1 stories are weighted 5 and need slices of at most 4 h.
- [2026-10-06] `.gitignore` on `dev` ignores `.env*`, which also hides `.env.example`; the Definition of Done requires that file to be committed. Decide with Yannick.
- [2026-09-29] Configure GitLab per `docs/git_workflow_commands.md` §2.3–2.6 (default branch `dev`, protected branches, squash never, "delete source branch" off, pipeline must succeed) and the GitHub mirror (§18).
- [2026-09-29] Decide on `README.md`: the school requires a setup guide and an architecture overview.
- [2026-09-29] Clarify how the pre-existing issues #1 Projektmanagement, #2 Corporate Identity, #3 Projekt Setup relate to the roadmap, and the scope and estimate of #2 (in Sprint 1, not part of R1).
- [2026-09-29] Prioritize R2–R14 as must / should / could before Sprint 2 planning (capacity ≈ 350 h vs. ≈ 490 h estimated, `ROADMAP.md` "Capacity").
- [2026-09-29] R1: each owner writes the "Plan" section of their track file (`concepts/scaffolding.track-*.md`) before their first MR.
