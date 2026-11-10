---
doc: team
format: gam-ai-knowledge/1
title: Team
audience: [developer, reviewer, agent]
---
# Team

Who works on this repo and who owns what (P-TEAM-1…5), for every team member and for agents that need a handle's role or status file. Use pseudonymous handles (e.g. the git username) only — no real names, e-mail addresses, or other personal data in this committed file.

## Members

| Handle | Role | Status file |
| --- | --- | --- |
| [handle] | [developer / PM approver / reviewer] | [[handle]/STATUS.md]([handle]/STATUS.md) |

Each member adds `Developer handle: <handle>` to their own gitignored `CLAUDE.local.md` so the agent knows whose status file and inbox to use.

## Roles

| Role | Handle(s) | Responsibility |
| --- | --- | --- |
| PM approver | [handle] | Signs off the Phase 4 review gate by approving the MR |
| Profile maintainer | [handle] | Reviews MRs against the vendored `.claude/skills/gam-engineering/` |

## Ownership rules

1. Every concept document has exactly one owner at a time; the owner is listed in the Owner column of `ROADMAP.md` (P-TEAM-4).
2. Only the owner grills and edits the concept document; everyone else comments in the MR.
3. Handing over ownership: update the Owner column, add a log entry in `ROADMAP-DETAILS.md`, and bring the previous owner's STATUS entry for that feature up to date so the new owner can continue without chat history.
4. Shared documents (`GOAL.md`, `CONTEXT.md`, `STACK.md`, `ROADMAP.md`, `WORKFLOW.md`) change only via small MRs; conflicts are resolved at merge.
5. IDs created on a branch — including ADR numbers — stay provisional until merged into the integration branch (`dev`, or `main` in branch model trunk); on a collision the later branch renumbers its own new IDs (P-TEAM-5).
