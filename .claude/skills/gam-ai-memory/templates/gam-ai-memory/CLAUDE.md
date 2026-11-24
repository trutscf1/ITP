---
doc: rules
format: gam-ai-memory/1
title: Rules for all AI agents
audience: [agent]
---
# Rules for all AI agents

This file is read first by every agent that works on this project — Claude Code, Codex, Copilot, Gemini CLI, Cursor — despite its name. The root `AGENTS.md` and each agent's pointer file send you here.

This folder is the short-term memory: the running work only. What the project should still know later — goal, roadmap, decisions, glossary, stack, tests, deployment, security, inbox — lives in the knowledge folder `gam-ai-knowledge/`, linked from [README_AI.md](README_AI.md).

## Reading order

1. This file.
2. [AI_HANDOVER.md](AI_HANDOVER.md) — what the last agent left for you.
3. [CURRENT_TASK.md](CURRENT_TASK.md) — the task and its next action.
4. [PROJECT_STATE.md](PROJECT_STATE.md) — overall state and health.
5. [KNOWN_ISSUES.md](KNOWN_ISSUES.md) — before touching an affected area.
6. On demand, via [README_AI.md](README_AI.md): the knowledge folder.

If the repo (branch, last commit) disagrees with the handover, the repo is the truth; say so before you act.

## Rules

1. **No chat memory.** Before the session ends, write what the next agent needs into this folder ([prompts/handover.md](prompts/handover.md)). The session transcript is a source for the handover, not a replacement; if a session ended without one, write it from the transcript ([prompts/recover.md](prompts/recover.md)).
2. **One home per fact.** Status lives only in `CURRENT_TASK.md` and `PROJECT_STATE.md`; long-term facts live in the knowledge folder; other files link there and never copy.
3. **Write for a stranger.** Full paths, branch names, commands, IDs, dates as `YYYY-MM-DD`.
4. **Append, do not rewrite history.** `SESSION_LOG.md` only grows; a session adds lines only to its own open entry.
5. **Name yourself.** Handover and log entries name the agent and model.
6. **No secrets** or personal data in this folder.
7. **Markdown is lint-clean.**
8. **Use the project's words** from the glossary of the knowledge folder (`gam-ai-knowledge/CONTEXT.md`), where it exists.
9. **Parallel sessions.** On a work branch in a linked git worktree (`git rev-parse --git-dir` differs from `--git-common-dir`), or when `branches/<branch-slug>.md` exists (branch name with `/` as `-`), read and write only that branch file, from [templates/BRANCH_TEMPLATE.md](templates/BRANCH_TEMPLATE.md), instead of `AI_HANDOVER.md`, `CURRENT_TASK.md`, `PROJECT_STATE.md`, `SESSION_LOG.md`, and `KNOWN_ISSUES.md`. The session that merges the branch folds the file into `SESSION_LOG.md` and `KNOWN_ISSUES.md`, updates the shared files, and deletes it.
10. **Agent memory first, by script:** before reading or writing the memory, run `agent-memory.mjs`; what a script can read or derive is never asked or reconstructed by hand. The script is `gam-ai-memory/tools/agent-memory.mjs`: `read` prints what Claude Code, Gemini CLI, and Codex keep about this project and the Claude Code transcripts since the last session entry, `detect` names the entry point (`init`, `recover`, `start`, `report`), `compare` lists where an agent memory contradicts this folder. It never writes into an agent's memory, and what it prints is condensed into this folder, never copied verbatim. A pre-commit hook (`install-hook`) keeps the block `<!-- agent-memory:auto -->` of `PROJECT_STATE.md` current.

## Project-specific rules

- [Language of the documents, files never to touch, commands that need confirmation, …]
