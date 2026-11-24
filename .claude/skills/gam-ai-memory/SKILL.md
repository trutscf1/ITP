---
name: gam-ai-memory
description: Agent-neutral short-term project memory in gam-ai-memory/ that Claude Code, Codex, Copilot, Gemini CLI, and Cursor all read and write, so any agent continues another's work without chat history. Holds only the running work — current task, handover, session log, project state, known issues, and one memory file per work branch for parallel sessions in git worktrees — and links the long-term knowledge in gam-ai-knowledge/. Sets up the folder, AGENTS.md, and each agent's pointer file (init), loads the state (start), updates task, state, and log at a merge (sync), writes the handover from the session transcript (handover), recovers a handover lost to a timeout or session limit (recover), runs agent-neutral reviews (review), and checks for gaps, stale state, and long-term files left in it (check). Reads, by script, the memory each agent already keeps (Claude Code, Gemini CLI, Codex) and the Claude Code transcripts, and reports where they contradict this memory. Reads the former folder aigamdocs/. Use when the developer runs /gam-ai-memory, asks to hand over or resume work across agents, sessions, or worktrees, or AGENTS.md points to gam-ai-memory/ or aigamdocs/.
---

# gam-ai-memory

A short-term project memory every AI agent can use. It lives in the project's `gam-ai-memory/` folder as plain Markdown, so it needs no skill support from the agent reading it: Claude Code loads this skill, the other agents follow `AGENTS.md`. What the project should still know later — goal, roadmap, decisions, glossary, stack, tests, deployment, security, inbox — is long-term knowledge and lives in `gam-ai-knowledge/` (skill gam-ai-knowledge); this memory links it and never copies it.

## Before anything else

1. **Every question to the developer is a pop-up** of the agent’s question tool (`AskUserQuestion` in Claude Code, `askQuestions` in Copilot in VS Code, `ask_user` in the Copilot CLI), never a chat question, numbered `Q<n> - <title>: <question>?`, with 2–4 options, the recommended one first and marked as recommended. Where the project has the AI chat export (`gam-engineering/tools/prompt-export.mjs`, or its own `scripts/prompt-export.mjs`), the export records every round and the number comes from `node <path> next-q`; no Q&A file is written. Without the export, each answered round is appended verbatim to the project's Q&A log: `gam-ai-knowledge/qa-log.md` where the knowledge folder exists, otherwise `qa-log.md` in the project root; numbering continues from the highest `Q<n>` in that file. Agents without a pop-up tool ask in chat with the same numbering and format, wait for the answer, and carry on.
2. **Find the memory folder.** It is `gam-ai-memory/`. While only the former `aigamdocs/` exists, read and write that folder instead (transition) and name the rename once per session ([references/init.md](references/init.md#former-folder)). If neither exists, the entry point is **init**.
3. **Read `gam-ai-memory/CLAUDE.md` first** — it holds the rules for all agents in this project, despite its name.
4. **Find the session's own file.** On a work branch in a linked git worktree (`git rev-parse --git-dir` differs from `--git-common-dir`), or when `gam-ai-memory/branches/<branch-slug>.md` exists, the session reads and writes that branch file instead of the shared task and handover files ([references/parallel.md](references/parallel.md)).
5. **Find the knowledge folder.** If `gam-ai-knowledge/` exists (or, before its move, `gam-engineering/documentation/` or `humanengineering/documentation/`), it holds the long-term knowledge; in a project that also runs the gam- skills, apply [references/gam-interop.md](references/gam-interop.md) before writing.
6. **Agent memory first, by script: before reading or writing the memory, run `agent-memory.mjs`; what a script can read or derive is never asked or reconstructed by hand.** The script is `gam-ai-memory/tools/agent-memory.mjs` (the copy `init` made); where the project has none, the skill's own `scripts/agent-memory.mjs`. It reads what Claude Code, Gemini CLI, and Codex keep about this project, never writes into an agent's memory, and is the source for `start`, `handover`, and `recover` ([references/session.md](references/session.md)).

## Commands

| Invocation | What happens | Procedure |
| --- | --- | --- |
| `/gam-ai-memory` (no argument) | Run `node gam-ai-memory/tools/agent-memory.mjs detect` (the skill's `scripts/agent-memory.mjs` where the project has no copy) and follow its `entry:` line: `init` → **init**; `recover` → **recover**, then **start**; `start` → **start**; `report` → state the current task from `CURRENT_TASK.md` and ask what to do. The rule behind it, for agents without the script: no memory folder → **init**; work after the reference point → **recover**; otherwise **start**. The reference point is the newest `SESSION_LOG.md` entry, an open sync entry included, or `AI_HANDOVER.md` when that is newer (a handover dated without a time counts as the end of that day); work is a commit newer than it that is not one of the merges the entry lists and not a change of the memory or knowledge folder alone, an uncommitted change, or an ended session transcript newer than it. On a work branch with a branch file in use ([parallel.md](references/parallel.md)), the branch file's `updated:` is the reference point, and only this worktree's transcripts count. State the detected entry point as an assumption before acting. | — |
| `/gam-ai-memory init` | Create `gam-ai-memory/` from [templates/gam-ai-memory/](templates/gam-ai-memory/), the root `AGENTS.md`, and the pointer files for the chosen agents; fill what the repo already tells (branch, last commit, health). | [references/init.md](references/init.md) |
| `/gam-ai-memory start` | Run `agent-memory.mjs read`, then load the memory in the fixed reading order and report the state in five lines: goal, current task, last handover, open blockers, next step. | [references/session.md](references/session.md#start) |
| `/gam-ai-memory sync` | Light update at a merge into the integration branch, run by the gam- skills (gam-engineering P-DOC-13): tick the finished steps and set the next action in `CURRENT_TASK.md`, update `PROJECT_STATE.md`, add one line to the session's entry in `SESSION_LOG.md`. Reads no transcript, never writes `AI_HANDOVER.md`, never commits; writes nothing on a work branch with a branch file in use. | [references/session.md](references/session.md#sync) |
| `/gam-ai-memory handover` | End the session: run `agent-memory.mjs read`, read the session transcript where available, update `CURRENT_TASK.md`, `PROJECT_STATE.md`, `KNOWN_ISSUES.md` as needed, overwrite `AI_HANDOVER.md`, append one `SESSION_LOG.md` entry (or complete the session's open sync entry). | [references/session.md](references/session.md#handover) |
| `/gam-ai-memory recover` | Write the handover of a session that ended without one (timeout, session limit, crash) from `agent-memory.mjs read`, its transcript, and git, with any agent; cheaper than forcing a handover in a full context. | [references/session.md](references/session.md#recover) |
| `/gam-ai-memory review [code \| architecture] [<scope>]` | Run the agent-neutral review prompt from `gam-ai-memory/prompts/` and write the report to `gam-ai-memory/reports/`. | [references/review.md](references/review.md) |
| `/gam-ai-memory check` | Report empty or stale memory files, a memory behind the last merge, a handover older than the last commit, broken links, every long-term file still left in the memory folder, what `agent-memory.mjs compare` finds in the agents' memories, and an outdated copy of the script. Change nothing without confirmation. | [references/gam-interop.md](references/gam-interop.md#check) |

## The memory

`gam-ai-memory/` is the project's short-term memory; [templates/gam-ai-memory/](templates/gam-ai-memory/) is only the starting point. Each fact has exactly one home:

| File | Holds | Changes |
| --- | --- | --- |
| `CLAUDE.md` | Rules for all agents: reading order, write rules, language, what never to touch | rarely |
| `README_AI.md` | Map of the memory and links into the knowledge folder | when a file is added |
| `PROJECT_STATE.md` | Overall state: what works, what is in progress, health of build and tests; ends with the block `<!-- agent-memory:auto -->` that the pre-commit hook rewrites (date, branch, base commit, commits since the reference point, agent memory files) | every sync and handover, and every commit (the block) |
| `CURRENT_TASK.md` | The one task being worked on: done/open steps, next concrete action; links the position row where the knowledge folder has one | every sync and handover |
| `AI_HANDOVER.md` | Message from the last agent to the next one; overwritten each time | every handover |
| `SESSION_LOG.md` | Append-only log of sessions, newest first; one entry per session, collecting a line per merge | every sync and handover |
| `KNOWN_ISSUES.md` | Known bugs, limits, workarounds | when found or fixed |
| `branches/<branch-slug>.md` | One work branch's task, baseline, handover, and what its merge must write, while sessions run in parallel worktrees; folded into `SESSION_LOG.md` and deleted at the merge | every handover on that branch |
| `prompts/` | Agent-neutral prompts: startup, sync, handover, recover, code review, architecture review | rarely |
| `templates/` | Templates for the handover and session entries | rarely |
| `reports/` | Review and check reports, `YYYY-MM-DD-<kind>.md` | per review |
| `tools/agent-memory.mjs` | The project's copy of the skill's `scripts/agent-memory.mjs`, so agents without the skill run it too; wired into the active `pre-commit` hook (`.git/hooks/` or the `core.hooksPath` folder) by `install-hook` | `init`, and when `check` reports it outdated |

Everything else belongs to the knowledge folder: goal, roadmap and status position, inbox (`next.md`), decisions (`adr/`), glossary (`CONTEXT.md`), stack, `TEST_STRATEGY.md`, `DEPLOYMENT.md`, `SECURITY.md`. A project without `gam-ai-knowledge/` creates it with `/gam-ai-knowledge init` when it needs one of them.

## Rules for every agent

These rules are also written into `gam-ai-memory/CLAUDE.md`, so agents without this skill follow them:

1. **No chat memory.** Anything the next agent needs is written to `gam-ai-memory/` before the session ends; a session that changed code ends with **handover**. The session transcript is a source for the handover, not a replacement; a session that ended without one is repaired with **recover**.
2. **One home per fact.** Status lives in `CURRENT_TASK.md` and `PROJECT_STATE.md` only; long-term facts live in the knowledge folder; every other file links there instead of copying it.
3. **Write for a stranger.** Every entry is understandable without the conversation: full paths, branch names, command lines, IDs, dates as `YYYY-MM-DD`.
4. **Append, do not rewrite history.** `SESSION_LOG.md` only grows; a session adds lines only to its own open entry.
5. **Name the agent.** Handover and session entries name the agent and model that wrote them (for example `Claude Code / Opus`, `Codex`, `Copilot`, `Gemini CLI`, `Cursor`).
6. **No secrets.** Tokens, passwords, and personal data never enter the memory.
7. **Markdown is lint-clean** (markdownlint, the repo's `.markdownlint.jsonc` if present).
8. **Parallel sessions.** A session on a work branch in its own git worktree writes only its branch file `branches/<branch-slug>.md`; the shared files change on the integration branch and at the merge ([references/parallel.md](references/parallel.md)).

## Where the rules live

| Topic | Single source |
| --- | --- |
| Which file holds what | [The memory](#the-memory) above |
| Setup, pointer files per agent, the former folder | [references/init.md](references/init.md) |
| Reading order, handover steps, sync steps, recover | [references/session.md](references/session.md) |
| Reading the agents' own memories, detecting the entry point, the pre-commit hook | [scripts/agent-memory.mjs](scripts/agent-memory.mjs) (the header lists the subcommands), [references/session.md](references/session.md), [references/init.md](references/init.md) |
| Parallel sessions in git worktrees, branch memory files | [references/parallel.md](references/parallel.md) |
| Session transcript: where to get it, how to read it cheaply, what goes where | [references/transcript.md](references/transcript.md) |
| Reviews | [references/review.md](references/review.md) |
| Knowledge folder, gam-engineering, when the gam- skills run sync and handover, check | [references/gam-interop.md](references/gam-interop.md) |
| User-facing overview | [README.md](README.md) |
