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
1. Run "node gam-ai-memory/tools/agent-memory.mjs read": it prints what the agents already remember about this project and the Claude Code transcripts since the last session entry. Read the transcript of this session if you can: for tools other than Claude Code, if gam-engineering/tools/prompt-export.mjs or scripts/prompt-export.mjs exists, run it with "node <path> export" and read the files under docs/prompts/ that are newer than gam-ai-memory/AI_HANDOVER.md. Take from it the developer's decisions, unanswered questions, and declined actions. Otherwise work from what you remember. Never paste transcript text.
On a work branch in a git worktree, or when gam-ai-memory/branches/<branch with / as -> .md exists: overwrite only that branch file from gam-ai-memory/templates/BRANCH_TEMPLATE.md and skip steps 2 to 6 (rule 9 of gam-ai-memory/CLAUDE.md).
2. gam-ai-memory/CURRENT_TASK.md: tick done steps, add new ones, set one concrete next action (a command or file, not "continue").
3. gam-ai-memory/PROJECT_STATE.md: update what this session changed, set the date.
4. gam-ai-memory/KNOWN_ISSUES.md: add what you found. New tasks go to the inbox gam-ai-knowledge/next.md, decisions to gam-ai-knowledge/adr/, terms to gam-ai-knowledge/CONTEXT.md, never as a copy in gam-ai-memory/.
5. Overwrite gam-ai-memory/AI_HANDOVER.md from gam-ai-memory/templates/HANDOVER_TEMPLATE.md.
6. Insert one entry at the top of gam-ai-memory/SESSION_LOG.md from gam-ai-memory/templates/SESSION_TEMPLATE.md. If the newest entry is this session's open sync entry (same date, agent, and model, "Handover: open"), complete that entry instead: fill its fields and set "Handover" to done.
7. Name yourself (agent and model) in both. No secrets. Lint-clean Markdown.
8. List uncommitted files; commit only if the project's rules allow it now.
```

If the session ends before this is done (timeout, session limit), the next session writes the handover from the transcript with [recover.md](recover.md).
