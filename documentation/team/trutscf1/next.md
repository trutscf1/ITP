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

- [2026-10-06] Review and merge the migration MR !1 `concept/migrate-engineering-human` → `dev` (issue #86); a person other than the author reviews it.
- [2026-10-06] Team review of the drafts in `GOAL.md` (roles R-1…R-3, success signals G-1.S1…S3) and of the *Serves* column in `ROADMAP.md`; only the wording of G-1 is confirmed.
- [2026-10-06] Promote the feature issues #87–#100 to group epics (`/promote`, needs rights on the group) and set push access on `main` to "no one" (Settings → Repository → Protected branches; needs the Maintainer role). Today `main` allows push and merge for Maintainers.
- [2026-10-06] Seven Sprint 1 stories are weighted 5 and need slices of at most 4 h; each owner cuts them in the concept.
- [2026-10-06] The story SCF-US-1 (set up the monorepo) names the apps `web`, `storage-api`, `worker`, `cms`, while the R1 concept requires the five units `web`, `identity`, `storage`, `worker`, `cms` (SCF-F-1); SCF-US-5 names GitHub Actions, while `WORKFLOW.md` binds GitLab CI. Resolve both when the R1 concept is migrated.
- [2026-10-06] Five stories name a role that is not in `GOAL.md` (developer, content editor, visitor); decide whether `GOAL.md` gets more roles (needs an ADR) or the stories are reworded.
- [2026-10-06] `.gitignore` on `dev` ignores `.env*`, which also hides `.env.example`; the Definition of Done requires that file to be committed. Decide with `schauby1`.
- [2026-09-29] Configure GitLab per `docs/git_workflow_commands.md` §2.3–2.6 (default branch `dev`, protected branches, squash never, "delete source branch" off, pipeline must succeed) and the GitHub mirror (§18).
- [2026-09-29] Decide on `README.md`: the school requires a setup guide and an architecture overview.
- [2026-09-29] Clarify how the pre-existing issues #1 Projektmanagement, #2 Corporate Identity, #3 Projekt Setup relate to the roadmap, and the scope and estimate of #2 (in Sprint 1, not part of R1).
- [2026-09-29] Prioritize R2–R14 as must / should / could before Sprint 2 planning (capacity ≈ 350 h vs. ≈ 490 h estimated, `ROADMAP.md` "Capacity").
- [2026-09-29] R1: each owner writes the "Plan" section of their track file (`concepts/scaffolding.track-*.md`) before their first MR.
