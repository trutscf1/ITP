---
doc: prompt
format: gam-ai-memory/1
title: Sync prompt
audience: [agent, developer]
---
# Sync prompt

Run this at every merge into the integration branch, in the same working step that writes the project's status, so the memory never falls behind the merges (Claude Code with the skill: `/gam-ai-memory sync`). It is the light update between handovers: the full [handover.md](handover.md) stays with the end of the session.

```text
Bring the running memory up to date for this merge: on the work branch before a local merge, or on the integration branch after a merge on the git host. Read no transcript. Do not commit on your own: the files join the commit that carries the status of the merge.
On a work branch in a git worktree, or when gam-ai-memory/branches/<branch with / as -> .md exists: write nothing and say so (rule 9 of gam-ai-memory/CLAUDE.md).
1. gam-ai-memory/CURRENT_TASK.md: tick the steps the merge finished, set one concrete next action from the "Next step" cell of the position row it links, set updated: to today. If the merge finished the task, set the goal to the next task of the position table, or to "none" with a link to the inbox gam-ai-knowledge/next.md.
2. gam-ai-memory/PROJECT_STATE.md: update the sections the merge changed (what works, in progress, health from the pipeline result of this merge), set updated: to today.
3. gam-ai-memory/SESSION_LOG.md: if the newest entry is this session's (same date, agent, and model, and its "Handover" line says open), add one line to its "Merges" list: branch, one sentence, link to the log row in gam-ai-knowledge/ROADMAP-DETAILS.md. Otherwise insert a new entry at the top from gam-ai-memory/templates/SESSION_TEMPLATE.md with that line and "Handover: open — sync only"; leave the other fields as "—".
4. Never: read a transcript, write gam-ai-memory/AI_HANDOVER.md, copy the position, the log, or the inbox into the memory, or commit on your own.
5. Name yourself (agent and model) in the entry. No secrets. Lint-clean Markdown.
```

The session ends with [handover.md](handover.md), which completes the entry this prompt opened.
