---
doc: prompt
format: gam-ai-memory/1
title: Startup prompt
audience: [agent, developer]
---
# Startup prompt

Paste this into any agent at the start of a session (Claude Code with the skill: `/gam-ai-memory start`).

```text
You continue work on this project. Do not rely on any earlier chat.
1. Read gam-ai-memory/CLAUDE.md and follow its rules. Then run "node gam-ai-memory/tools/agent-memory.mjs read" (what the agents already remember about this project) and "node gam-ai-memory/tools/agent-memory.mjs detect" (its "entry:" line says whether to run recover first); never ask or reconstruct by hand what these print.
2. Read gam-ai-memory/AI_HANDOVER.md, gam-ai-memory/CURRENT_TASK.md, gam-ai-memory/PROJECT_STATE.md, gam-ai-memory/KNOWN_ISSUES.md in this order. On a work branch in a git worktree, or when gam-ai-memory/branches/<branch with / as -> .md exists, read that branch file instead of the first two (rule 9 of gam-ai-memory/CLAUDE.md).
3. Compare them with the repo: current branch, last commit, uncommitted changes. If they disagree, the repo is the truth — say so. The reference point is the newest entry of gam-ai-memory/SESSION_LOG.md, an open sync entry included, or gam-ai-memory/AI_HANDOVER.md when that is newer. If there are commits newer than it that are not one of the merges that entry lists (and not changes of gam-ai-memory/ or gam-ai-knowledge/ alone), uncommitted changes, or an ended session transcript newer than it, the last session ended without a handover ("entry: recover"): say so and run gam-ai-memory/prompts/recover.md first. Merges that a sync entry lists are not such work.
4. Report in five lines: goal, current task, last handover (date, agent), open blockers, proposed next step.
5. Wait for confirmation before changing anything.
```
