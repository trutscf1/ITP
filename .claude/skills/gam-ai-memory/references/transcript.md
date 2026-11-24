# Session transcript as a source

Every AI tool keeps a transcript of its sessions on the developer's machine. **handover** reads it so that the handover does not depend on what the agent still remembers, and **recover** reads it to write a handover for a session that ended without one ([session.md](session.md)). The transcript is a source, never a home: the memory holds the condensed result and links the transcript.

## Get the transcript

Claude Code first, through the script: `node gam-ai-memory/tools/agent-memory.mjs read` (the skill's `scripts/agent-memory.mjs` where the project has no copy) prints the Claude Code transcripts of this folder since the reference point, condensed to prompts, pop-up rounds, plan approvals, and declined calls, without tool output; `--since <YYYY-MM-DD>` and `--full` change the range and the cut. It finds the folder `~/.claude/projects/<slug>/` under both drive-letter spellings and honours `CLAUDE_CONFIG_DIR`. The project's chat export below stays the source for the tools other than Claude Code, and a Claude Code session the script cannot find.

For **recover**, where the project has `gam-engineering/tools/session-recover.mjs` (gam-engineering, Q523–Q529 there), run `node gam-engineering/tools/session-recover.mjs` first: it reads the newest Claude Code session of this folder and writes a report to the temp folder with the dialog, every subagent (brief, final report or last steps), the open last tool call, and the background commands without a reported end, and prints its path. `--session <id>` picks another session, `--list` lists them. Read that report, then the export below.

Use the project's chat export, first match wins:

1. `gam-engineering/tools/prompt-export.mjs`
2. `scripts/prompt-export.mjs`

It is a Node script without dependencies that reads the transcripts of all tools (Claude Code, Codex, Gemini CLI, Copilot, Cursor, and others) for this folder, whichever agent runs it. In a linked git worktree it exports only that worktree's sessions; the main folder also exports those of worktrees that no longer exist ([parallel.md](parallel.md)).

- **With the export:** run `node <path> export` (without `--stage`), then read the day files under `docs/prompts/<handle>/<tool>/<YYYY-MM-DD>.md` that changed since the date of `AI_HANDOVER.md`. If the export is switched off or fails, continue without a transcript and say so in the handover.
- **Without the export:** `agent-memory.mjs read` covers Claude Code; read another tool's transcript only where you know its location. Claude Code keeps one file per session in `~/.claude/projects/<repo path, every non-alphanumeric character as ->/<session id>.jsonl`, one JSON event per line. Use the lines with `type` `user` or `assistant` (text in `message.content`) and skip lines with `isSidechain` or `isMeta`. Pop-ups are in `toolUseResult.questions` and `toolUseResult.answers`, an approved plan in `toolUseResult.plan`, a declined tool call in a `tool_result` with `is_error` whose text gives the reason after `the user said:`. Old files are cleaned up by the tool, so only recent sessions are there.
- **No transcript:** write the handover from the session as before; **recover** then works from git alone.

The full table of tools, locations, and formats is in gam-engineering's `templates/prompt-export-student-prompt.md`; this file does not copy it.

## Read it cheaply

1. Read the export, not the raw transcript: the export holds prompts, answers, question rounds, and interactions, but no tool output.
2. Read only what is newer than `AI_HANDOVER.md`.
3. In a long day file, read the section headings and the question rounds first, then from the end backwards, and stop as soon as the state and the next step are clear.
4. When the context is nearly full, do not force a handover in that session: end it and run **recover** in a fresh session, with any agent. That costs the condensed export instead of the whole context.

## What goes where

| From the transcript | Goes to |
| --- | --- |
| Pop-up answers and approved plans | `**Decided:**` in the session entry; a lasting decision also to `adr/` of the knowledge folder |
| Questions without an answer | *Open questions for the developer* in `AI_HANDOVER.md` |
| Declined tool calls and their reasons | *Watch out* in `AI_HANDOVER.md` |
| Model of the session | the agent line of handover and session entry |
| Path of the day file, or the session ID | `**Transcript:**` in the session entry |

## Limits

- Condense; never paste transcript text into the memory.
- No secrets or personal data, even if the transcript holds them.
- If the transcript and the repo disagree, the repo is the truth.
- What the transcript does not show for certain becomes an open question, not a fact.
