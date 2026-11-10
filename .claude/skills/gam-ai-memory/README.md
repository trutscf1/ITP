# gam-ai-memory

A short-term project memory that every AI agent can read and write: Claude Code, OpenAI Codex, GitHub Copilot, Gemini CLI, and Cursor. It lives in the project's `gam-ai-memory/` folder as plain Markdown and holds only the running work: current task, handover, session log, project state, known issues. Any agent can continue another agent's work without chat history. The long-term knowledge — goal, roadmap, decisions, glossary, stack, tests, deployment, security, inbox — lives in `gam-ai-knowledge/` (skill gam-ai-knowledge) and is linked, never copied. The rules are in [SKILL.md](SKILL.md); this README adds none.

## How it works

- **One entry point for all agents.** The root `AGENTS.md` sends every agent to `gam-ai-memory/CLAUDE.md`, which holds the rules for all agents. Codex and Cursor read `AGENTS.md` themselves. Copilot, Gemini CLI, and Claude Code get a one-line pointer file each ([references/init.md](references/init.md#pointer-files)).
- **Start and handover.** A session starts by reading the handover and the current task, and ends by writing them ([references/session.md](references/session.md)). Agents without the skill paste `gam-ai-memory/prompts/startup.md` and `handover.md`.
- **Reviews any agent can run.** Code and architecture review prompts write their reports to `gam-ai-memory/reports/` ([references/review.md](references/review.md)).
- **Former folder.** Projects set up before 2026-10-23 have `aigamdocs/`; every command reads it while `gam-ai-memory/` is missing and names the rename ([references/init.md](references/init.md#former-folder)).

## Commands

| Command | What it does |
| --- | --- |
| `/gam-ai-memory` | Detects the state and continues: init, start, or report the current task |
| `/gam-ai-memory init` | Creates `gam-ai-memory/`, `AGENTS.md`, and the pointer files |
| `/gam-ai-memory start` | Loads the memory and reports goal, task, handover, blockers, next step |
| `/gam-ai-memory handover` | Writes task, state, known issues, handover, and session log |
| `/gam-ai-memory review [code \| architecture] [<scope>]` | Agent-neutral review into `gam-ai-memory/reports/` |
| `/gam-ai-memory check` | Reports gaps, stale state, broken links, and long-term files left in the memory folder |

## Files a project gets

| File | Template |
| --- | --- |
| `gam-ai-memory/` (rules, map, the five short-term files, prompts, handover and session templates, `reports/`) | [templates/gam-ai-memory/](templates/gam-ai-memory/) |
| `AGENTS.md` | [templates/AGENTS.md](templates/AGENTS.md) |
| `CLAUDE.md` (or one line in an existing one) | [templates/CLAUDE.md](templates/CLAUDE.md) |
| `GEMINI.md` | [templates/GEMINI.md](templates/GEMINI.md) |
| `.github/copilot-instructions.md` | [templates/github/copilot-instructions.md](templates/github/copilot-instructions.md) |

## With the gam- skills

The skill runs on its own or next to the gam- skills. The status position, the log of finished work, and the inbox stay in `gam-ai-knowledge/`, written by the gam commands; `CURRENT_TASK.md` links the position row instead of copying it. The gam- skills check at their first command whether this skill is installed and current (its `SKILL.md` names the folder `gam-ai-memory/`), and `/gam-engineering setup` and `migrate` run `/gam-ai-memory init` when the folder is missing. Details: [references/gam-interop.md](references/gam-interop.md).

## Status

| Date | State |
| --- | --- |
| 2026-10-22 | Skill created with `aigamdocs/` as the source of the documents it shared with gam-engineering. |
| 2026-10-23 | Short-term only (gam-engineering ADR-0006): folder `gam-ai-memory/`, `aigamdocs/` read during the transition, long-term templates removed, knowledge linked from `gam-ai-knowledge/`. |

## Repository

- `templates/` is the product; the root `gam-ai-memory/` and `AGENTS.md` are this repo's own memory and do not ship (`.deployignore`).
- Install: `git clone git@gitlab.com:htl-villach/it/teachers/gam/alltime/aiskills/gam-ai-memory.git`, then run `deploy_skill_wrapper.ps1` in the clone (needs a git repository; `qa-log.md` never ships).
- Decisions on the design of this skill: [qa-log.md](qa-log.md).
