---
doc: prompt
format: gam-ai-memory/1
title: Recover prompt
audience: [agent, developer]
---
# Recover prompt

Paste this into any agent when the last session ended without a handover — timeout, session or token limit, crash (Claude Code with the skill: `/gam-ai-memory recover`). The agent may be a different one than the agent of the lost session.

```text
The last session on this project ended without a handover. Write it now from the session transcript.
1. Read gam-ai-memory/CLAUDE.md and gam-ai-memory/AI_HANDOVER.md (on a work branch in a git worktree, or when its branch file gam-ai-memory/branches/<branch with / as -> .md exists: that branch file, rule 9); note its date. Use only transcripts of this folder.
2. Get the transcript: run "node gam-ai-memory/tools/agent-memory.mjs read" first (the agents' own memories and the Claude Code transcripts since the reference point, the newest SESSION_LOG.md entry or the handover when that is newer). Then, if gam-engineering/tools/session-recover.mjs exists, run "node gam-engineering/tools/session-recover.mjs" first and read the report it names (subagents, open last step, background commands). Then, if gam-engineering/tools/prompt-export.mjs or scripts/prompt-export.mjs exists, run it with "node <path> export" and read the files under docs/prompts/ that are newer than the handover. Otherwise work from what "read" printed and from git alone.
3. Read cheaply: only what is newer than the handover; headings and question rounds first, then from the end backwards; stop when the state and the next step are clear.
4. Compare with the repo: git status, and git log since the handover. If they disagree with the transcript, the repo is the truth.
5. Run the handover steps of gam-ai-memory/prompts/handover.md from step 2 on. Mark the handover and the session entry "recovered from transcript by <you: agent and model>" and name the agent and model of the lost session.
6. Put decisions of the developer into the session entry, unanswered questions and declined actions into the handover. What the transcript does not show for certain is an open question, not a fact.
7. Never paste transcript text. No secrets. Lint-clean Markdown.
```
