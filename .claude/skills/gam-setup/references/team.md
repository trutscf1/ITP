# Switching solo → team

Loaded by `/gam-engineering team` (skill `gam-setup`).

The procedure behind `/gam-engineering team` (the resulting layout is described in the manifest's Team Mode chapter). Team mode needs git: in a folder without it, say so and stop (P-GIT-7).

1. Copy this skill folder to `.claude/skills/gam-engineering/` in the repo and commit it.
2. Create `gam-ai-knowledge/team/TEAM.md` from [templates/TEAM.md](../../gam-ai-knowledge/templates/TEAM.md), one row per developer handle.
3. For each developer, create `gam-ai-knowledge/team/<handle>/STATUS.md` ([templates/STATUS.md](../../gam-ai-knowledge/templates/STATUS.md)) and `gam-ai-knowledge/team/<handle>/next.md` ([templates/next.md](../../gam-ai-knowledge/templates/next.md)), with `handle` set; never a `team/` folder outside `gam-ai-knowledge/` (P-TEAM-3).
4. Move the current session positions from `ROADMAP-DETAILS.md` into the owner's `STATUS.md`; leave the log in place and turn the positions section into the index (feature, owner, phase, link to the `STATUS.md`).
5. Move open items of `next.md` into the owner's `next.md` or the issue tracker; delete the shared `next.md`.
6. Add the Owner column to ROADMAP.md and `CLAUDE.local.md` to `.gitignore`.
7. Set the mode in `WORKFLOW.md` to team. If the merge policy in `.claude/settings.json` is `auto`, it now acts as `approved` (P-MR-4): change the value to `approved` in the same MR, remove the merge guard if still present (P-MR-6), and require `GAM_ENGINEERING_APPROVALS` approvals on the host where the tier allows it (P-TRK-1). In branch model `trunk`, offer the switch to `dev` as a `Q<n>` (recommended, not forced, P-GIT-9); on *yes* run it as [references/branches.md](../../gam-engineering/references/branches.md) says. A release key `auto` acts as `ask` in team mode (P-MR-5): set it to `ask` in the same MR.
