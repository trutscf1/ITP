---
doc: team
format: engineering-human/2
title: Team
audience: [developer, reviewer, agent]
---
# Team

Who works on this repo and who owns what (P-TEAM-1…5), for every team member and for agents that need a handle's role or status file. Handles are the GitLab usernames — no real names, e-mail addresses, or other personal data in this committed file. The areas come from the project proposal (`docs/projektantrag.md`, "Projektgruppe").

## Members

| Handle | Role | Status file |
| --- | --- | --- |
| trutscf1 | developer — Offline, content & observability; project controlling | [trutscf1/STATUS.md](trutscf1/STATUS.md) |
| schauby1 | developer — Storage engine & processing | [schauby1/STATUS.md](schauby1/STATUS.md) |
| schwaigc | developer — Web client & design system | [schwaigc/STATUS.md](schwaigc/STATUS.md) |
| tschudea07 | developer — Identity & sharing; CI/CD | [tschudea07/STATUS.md](tschudea07/STATUS.md) |

Each member adds `Developer handle: <handle>` to their own gitignored `CLAUDE.local.md` so the agent knows whose status file and inbox to use.

## Roles

| Role | Handle(s) | Responsibility |
| --- | --- | --- |
| PM approver | trutscf1 | Signs off the Phase 4 review gate by approving the MR |
| Profile maintainer | trutscf1 | Reviews MRs against the vendored `.claude/skills/engineering-human/` |

## Ownership rules

1. Every concept document has exactly one owner at a time; the owner is listed in the Owner column of `ROADMAP.md` (P-TEAM-4).
2. Only the owner grills and edits the concept document, its `.qa-log.md`, and its work items; everyone else comments in the MR.
3. Handing over ownership: update the Owner column, add a log entry in `ROADMAP-DETAILS.md`, and bring the previous owner's STATUS entry for that feature up to date so the new owner can continue without chat history.
4. Shared documents (`GOAL.md`, `CONTEXT.md`, `STACK.md`, `ROADMAP.md`, `WORKFLOW.md`) change only via small MRs; conflicts are resolved at merge. `STACK.md` has one section per track, edited only by that track's owner.
5. IDs created on a branch — including ADR numbers — stay provisional until merged into `dev`; on a collision the later branch renumbers its own new IDs (P-TEAM-5).
