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

- [2026-10-06] Revoke the two project access tokens used until 2026-10-06 (Project → Settings → Access tokens). The other three team members each create an own personal access token (`docs/agents/issue-tracker.md`, "Access").
- [2026-10-06] Review and merge the migration MR !1 `concept/migrate-engineering-human` → `dev` (issue #86); a person other than the author reviews it.
- [2026-10-06] Team review of the drafts in `GOAL.md` (roles R-1…R-3, success signals G-1.S1…S3) and of the *Serves* column in `ROADMAP.md`; only the wording of G-1 is confirmed.
- [2026-10-06] Promote the feature issues #87–#100 to group epics (`/promote`); needs a membership in the group, which `trutscf1` does not have — ask the teacher or a group owner.
- [2026-09-29] Set the merge settings per `docs/git_workflow_commands.md` §2.3 (squash never, "delete source branch" off, pipeline must succeed, discussions resolved) and the GitHub mirror (§18). Not chosen on 2026-10-06 (`qa-log.md`, Q14); the default branch is already `dev`.
- [2026-10-06] Owners review what was proposed for them on 2026-10-06: the cut of the six Sprint 1 stories into two slices each (#102–#107), the labels of #1–#3, the scope and estimate of #2 Corporate Identity, and the `README.md`.
- [2026-10-06] `next/.gitignore` also ignores `.env*`; the application reads `DATABASE_URL`, which has no example file yet. Add `next/.env.example` with the first change to the application's configuration.
- [2026-09-29] Prioritize R2–R14 as must / should / could before Sprint 2 planning (capacity ≈ 350 h vs. ≈ 490 h estimated, `ROADMAP.md` "Capacity").
- [2026-09-29] R1: each owner writes the "Plan" section of their track file (`concepts/scaffolding.track-*.md`) before their first MR.
