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
1. Read gam-ai-memory/CLAUDE.md and follow its rules.
2. Read gam-ai-memory/AI_HANDOVER.md, gam-ai-memory/CURRENT_TASK.md, gam-ai-memory/PROJECT_STATE.md, gam-ai-memory/KNOWN_ISSUES.md in this order.
3. Compare them with the repo: current branch, last commit, uncommitted changes. If they disagree, the repo is the truth — say so.
4. Report in five lines: goal, current task, last handover (date, agent), open blockers, proposed next step.
5. Wait for confirmation before changing anything.
```
