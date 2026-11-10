---
name: gam-ai-memory
description: Agent-neutral short-term project memory in gam-ai-memory/ that Claude Code, OpenAI Codex, GitHub Copilot, Gemini CLI, and Cursor all read and write, so any agent can continue another agent's work without chat history. It holds only the state of the running work — current task, handover, session log, project state, known issues — and links the long-term knowledge in gam-ai-knowledge/ instead of copying it. Sets up gam-ai-memory/ with AGENTS.md and the pointer files each agent loads (init), loads the state at the start of a session (start), writes the handover and the session log at the end (handover), runs agent-neutral code and architecture reviews into gam-ai-memory/reports/ (review), and checks the memory for gaps, stale state, and long-term files left in it (check). Reads the former folder aigamdocs/ while gam-ai-memory/ is missing. Use when the developer runs /gam-ai-memory, asks to hand over or resume work across agents or sessions, or a repo has AGENTS.md pointing to gam-ai-memory/ or aigamdocs/.
---

# gam-ai-memory

A short-term project memory every AI agent can use. It lives in the project's `gam-ai-memory/` folder as plain Markdown, so it needs no skill support from the agent reading it: Claude Code loads this skill, the other agents follow `AGENTS.md`. What the project should still know later — goal, roadmap, decisions, glossary, stack, tests, deployment, security, inbox — is long-term knowledge and lives in `gam-ai-knowledge/` (skill gam-ai-knowledge); this memory links it and never copies it.

## Before anything else

1. **Every question to the developer is a pop-up** (`AskUserQuestion`), never a chat question, numbered `Q<n> - <title>: <question>?`, with 2–4 options, the recommended one first and marked as recommended. Each answered round is appended verbatim to the project's Q&A log: `gam-ai-knowledge/qa-log.md` where the knowledge folder exists, otherwise `qa-log.md` in the project root; numbering continues from the highest `Q<n>` in that file. Agents without a pop-up tool ask in chat with the same numbering.
2. **Find the memory folder.** It is `gam-ai-memory/`. While only the former `aigamdocs/` exists, read and write that folder instead (transition) and name the rename once per session ([references/init.md](references/init.md#former-folder)). If neither exists, the entry point is **init**.
3. **Read `gam-ai-memory/CLAUDE.md` first** — it holds the rules for all agents in this project, despite its name.
4. **Find the knowledge folder.** If `gam-ai-knowledge/` exists (or, before its move, `gam-engineering/documentation/` or `humanengineering/documentation/`), it holds the long-term knowledge; in a project that also runs the gam- skills, apply [references/gam-interop.md](references/gam-interop.md) before writing.

## Commands

| Invocation | What happens | Procedure |
| --- | --- | --- |
| `/gam-ai-memory` (no argument) | Detect and continue, first match wins: no memory folder → **init**; `AI_HANDOVER.md` newer than the last `SESSION_LOG.md` entry or the session just began → **start**; otherwise state the current task from `CURRENT_TASK.md` and ask what to do. State the detected entry point as an assumption before acting. | — |
| `/gam-ai-memory init` | Create `gam-ai-memory/` from [templates/gam-ai-memory/](templates/gam-ai-memory/), the root `AGENTS.md`, and the pointer files for the chosen agents; fill what the repo already tells (branch, last commit, health). | [references/init.md](references/init.md) |
| `/gam-ai-memory start` | Load the memory in the fixed reading order and report the state in five lines: goal, current task, last handover, open blockers, next step. | [references/session.md](references/session.md#start) |
| `/gam-ai-memory handover` | End the session: update `CURRENT_TASK.md`, `PROJECT_STATE.md`, `KNOWN_ISSUES.md` as needed, overwrite `AI_HANDOVER.md`, append one `SESSION_LOG.md` entry. | [references/session.md](references/session.md#handover) |
| `/gam-ai-memory review [code \| architecture] [<scope>]` | Run the agent-neutral review prompt from `gam-ai-memory/prompts/` and write the report to `gam-ai-memory/reports/`. | [references/review.md](references/review.md) |
| `/gam-ai-memory check` | Report empty or stale memory files, broken links, a handover older than the last commit, and every long-term file still left in the memory folder. Change nothing without confirmation. | [references/gam-interop.md](references/gam-interop.md#check) |

## The memory

`gam-ai-memory/` is the project's short-term memory; [templates/gam-ai-memory/](templates/gam-ai-memory/) is only the starting point. Each fact has exactly one home:

| File | Holds | Changes |
| --- | --- | --- |
| `CLAUDE.md` | Rules for all agents: reading order, write rules, language, what never to touch | rarely |
| `README_AI.md` | Map of the memory and links into the knowledge folder | when a file is added |
| `PROJECT_STATE.md` | Overall state: what works, what is in progress, health of build and tests | every handover |
| `CURRENT_TASK.md` | The one task being worked on: done/open steps, next concrete action; links the position row where the knowledge folder has one | every handover |
| `AI_HANDOVER.md` | Message from the last agent to the next one; overwritten each time | every handover |
| `SESSION_LOG.md` | Append-only log of sessions, newest first | every handover |
| `KNOWN_ISSUES.md` | Known bugs, limits, workarounds | when found or fixed |
| `prompts/` | Agent-neutral prompts: startup, handover, code review, architecture review | rarely |
| `templates/` | Templates for the handover and session entries | rarely |
| `reports/` | Review and check reports, `YYYY-MM-DD-<kind>.md` | per review |

Everything else belongs to the knowledge folder: goal, roadmap and status position, inbox (`next.md`), decisions (`adr/`), glossary (`CONTEXT.md`), stack, `TEST_STRATEGY.md`, `DEPLOYMENT.md`, `SECURITY.md`. A project without `gam-ai-knowledge/` creates it with `/gam-ai-knowledge init` when it needs one of them.

## Rules for every agent

These rules are also written into `gam-ai-memory/CLAUDE.md`, so agents without this skill follow them:

1. **No chat memory.** Anything the next agent needs is written to `gam-ai-memory/` before the session ends; a session that changed code ends with **handover**.
2. **One home per fact.** Status lives in `CURRENT_TASK.md` and `PROJECT_STATE.md` only; long-term facts live in the knowledge folder; every other file links there instead of copying it.
3. **Write for a stranger.** Every entry is understandable without the conversation: full paths, branch names, command lines, IDs, dates as `YYYY-MM-DD`.
4. **Append, do not rewrite history.** `SESSION_LOG.md` only grows.
5. **Name the agent.** Handover and session entries name the agent and model that wrote them (for example `Claude Code / Opus`, `Codex`, `Copilot`, `Gemini CLI`, `Cursor`).
6. **No secrets.** Tokens, passwords, and personal data never enter the memory.
7. **Markdown is lint-clean** (markdownlint, the repo's `.markdownlint.jsonc` if present).

## Where the rules live

| Topic | Single source |
| --- | --- |
| Which file holds what | [The memory](#the-memory) above |
| Setup, pointer files per agent, the former folder | [references/init.md](references/init.md) |
| Reading order, handover steps | [references/session.md](references/session.md) |
| Reviews | [references/review.md](references/review.md) |
| Knowledge folder, gam-engineering, check | [references/gam-interop.md](references/gam-interop.md) |
| User-facing overview | [README.md](README.md) |
