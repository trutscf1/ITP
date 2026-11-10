---
doc: prompt
format: gam-ai-memory/1
title: Handover prompt
audience: [agent, developer]
---
# Handover prompt

Paste this into any agent before the session ends (Claude Code with the skill: `/gam-ai-memory handover`).

```text
End this session so that another agent can continue without this chat.
1. gam-ai-memory/CURRENT_TASK.md: tick done steps, add new ones, set one concrete next action (a command or file, not "continue").
2. gam-ai-memory/PROJECT_STATE.md: update what this session changed, set the date.
3. gam-ai-memory/KNOWN_ISSUES.md: add what you found. New tasks go to the inbox gam-ai-knowledge/next.md, decisions to gam-ai-knowledge/adr/, terms to gam-ai-knowledge/CONTEXT.md, never as a copy in gam-ai-memory/.
4. Overwrite gam-ai-memory/AI_HANDOVER.md from gam-ai-memory/templates/HANDOVER_TEMPLATE.md.
5. Insert one entry at the top of gam-ai-memory/SESSION_LOG.md from gam-ai-memory/templates/SESSION_TEMPLATE.md.
6. Name yourself (agent and model) in both. No secrets. Lint-clean Markdown.
7. List uncommitted files; commit only if the project's rules allow it now.
```
