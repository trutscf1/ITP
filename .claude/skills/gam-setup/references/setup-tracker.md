# Tracker setup procedure

Loaded by setup step 5 and by migration. It replaces the generic `/setup-matt-pocock-skills` skill, which the model cannot invoke; the procedure is adapted from mattpocock/skills (see README, *Credits*). It writes the per-repo files that the callable skills `gam-v-code-review`, `gam-v-tdd`, and `gam-v-domain-modeling` read: `gam-engineering/agents/issue-tracker.md` and `gam-engineering/agents/domain.md`, already pointing to `gam-ai-knowledge/` (P-DOC-2).

## 1. Explore (read-only)

- `git remote -v`: GitHub, GitLab (`gitlab.com` or a self-hosted host), or no remote. In a folder without git ([Projects without git](../../gam-engineering/references/no-git.md)) the tracker is local markdown and question 1 below is skipped.
- `CLAUDE.md` / `AGENTS.md` at the root, and whether either already has an `## Agent skills` section.
- `gam-engineering/agents/`: earlier output of this procedure or of `/setup-matt-pocock-skills`.
- Monorepo signals (`pnpm-workspace.yaml`, `workspaces` in `package.json`, `packages/*/src`). Without them the layout is single-context (P-DOC-3).

## 2. Ask

One `Q<n>` per open point, recommendation first, skipped when exploration already settled it:

1. **Tracker host** — GitLab (`glab`), GitHub (`gh`), or local markdown (solo repos without a remote). Recommend what `git remote` shows.
On GitHub or GitLab, add the missing remote with `git remote add origin <url>`, then check the host with `gh repo view` / `glab repo view`: it must print the project. If the host stays unreachable (no login, wrong URL, no access), stop and name the reason.

2. **Layout** — single-context unless monorepo signals exist; then list each context for the root `CONTEXT-MAP.md`.

On GitLab, determine the tier instead of asking for it: run the *Tier check* of [templates/agents/issue-tracker-gitlab.md](../../gam-engineering/templates/agents/issue-tracker-gitlab.md) (P-TRK-4) and ask only if it is inconclusive. The result goes into *Host tier* in `WORKFLOW.md` and decides whether features become group epics with native child items.

External PRs/MRs as a triage surface stay **off**; the flag in `issue-tracker.md` can be changed later.

## 3. Draft and confirm

Show the drafts as one `Q<n>` and let the developer edit them:

- `gam-engineering/agents/issue-tracker.md` from [templates/agents/issue-tracker-gitlab.md](../../gam-engineering/templates/agents/issue-tracker-gitlab.md), [issue-tracker-github.md](../../gam-engineering/templates/agents/issue-tracker-github.md), or [issue-tracker-local.md](../../gam-engineering/templates/agents/issue-tracker-local.md).
- `gam-engineering/agents/domain.md` from [templates/agents/domain.md](../../gam-engineering/templates/agents/domain.md).
- The `## Agent skills` block for `CLAUDE.md`:

```markdown
## Agent skills

- **Issue tracker:** [GitLab | GitHub | local markdown]. See `gam-engineering/agents/issue-tracker.md`.
- **Domain docs:** single-context, glossary `gam-ai-knowledge/CONTEXT.md`, ADRs `gam-ai-knowledge/adr/`. See `gam-engineering/agents/domain.md`.
```

## 4. Write

- Edit `CLAUDE.md` (it exists after setup step 4). Never create `AGENTS.md` next to it. If an `## Agent skills` block exists, update it in place.
- Write the two files under `gam-engineering/agents/`. They are agent configuration, not documentation, so they stay outside `gam-ai-knowledge/`.
- On GitHub or GitLab, create every label `WORKFLOW.md` binds that the tracker still lacks (`gh label create` / `glab label create`), so later commands apply existing labels instead of failing or creating near-duplicates.
- Tell the developer which skills now read these files and that they may edit them directly later.
