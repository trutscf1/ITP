---
doc: template
format: gam-ai-memory/1
title: Branch memory file
audience: [agent]
---
# Branch memory file

The memory of one work branch while other sessions work in parallel git worktrees (rule *Parallel sessions* in [CLAUDE.md](../CLAUDE.md)). Copy the block below to `gam-ai-memory/branches/<branch-slug>.md` (the branch name with every `/` as `-`, e.g. `feature-12-login.md`) and fill it; every handover on the branch overwrites the file. At the merge it is folded into `SESSION_LOG.md` and deleted.

```markdown
---
doc: branch-memory
format: gam-ai-memory/1
branch: "[branch]"
date: "[YYYY-MM-DD HH:MM]"
agent: "[Claude Code / Opus | Codex | Copilot | Gemini CLI | Cursor — with model]"
---
# [branch]

Written by [agent] on [YYYY-MM-DD]. [this session | recovered from the transcript of the session of (agent and model) | recovered from git alone]

## Task

[Issue, plan, or story this branch builds, with its link; done and open steps as a checklist.]

## State

- **Worktree:** [folder path]; **setup:** [worktree number printed by `worktree-setup.mjs` / "no setup script"]
- **Baseline:** [integration branch] at [short hash] when the branch started: [clean and short test green / red — with command]
- **Head:** [short hash]; **uncommitted:** [files or "none"]
- **Build / tests:** [green / red / not run — with command]

## Next step

[One concrete action: the command to run or the file to open, and why.]

## For the merge

- **Status:** [what the merging session writes into the position and log of the knowledge folder]
- **Inbox:** [new tasks and ideas for `next.md`, or "none"]
- **Known issues:** [entries for `KNOWN_ISSUES.md`, or "none"]

## Watch out

- [Traps, half-done changes, declined actions and why — or "none"]

## Open questions for the developer

- [Question — or "none"]
```
