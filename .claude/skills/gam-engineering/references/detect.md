# Detect the state

The no-argument entry of [`/gam-engineering`](../SKILL.md#command-gam-engineering): the first match wins, and the agent states the result as an assumption `A<n>` before acting.

1. Signs of the predecessor skill or of the layout before 2026-10-14 (rows 1 and 2 of [Migrating a project](../../gam-setup/references/migrate.md), step 1) → **migrate**.
2. Signs of a former name `humanengineering` or `engineering-human` (row 3), documents outside `gam-ai-knowledge/` (row 6), or agent files in `docs/agents/` (row 8) → offer **migrate** once as a `Q<n>`, then continue with the rows below on the old paths (P-DOC-10, P-DOC-11, P-DOC-7).
3. No `gam-ai-knowledge/GOAL.md` (nor, before the move, `gam-engineering/documentation/GOAL.md` or the former `humanengineering/documentation/GOAL.md`) → **setup**.
4. An unmerged `rebuild/` branch (`git branch --list "rebuild/*" --no-merged <integration branch>`) → **rebuild**, which resumes it.
5. A position row (in `ROADMAP-DETAILS.md` or the developer's `STATUS.md`) in Phase 7 → its next step: **implement** the next unblocked issue, **review** or **merge** its open MR.
6. A position in Phases 1–6 → **grill** that concept further.
7. Otherwise → **grill** the oldest inbox item; when the first breadth-first round shows open decisions that do not fit one session, switch to **wayfind** for it ([Wayfinding](../../gam-explore/references/wayfind.md), Q408).
