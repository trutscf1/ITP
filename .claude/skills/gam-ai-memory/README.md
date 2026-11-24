# gam-ai-memory

A short-term project memory that every AI agent can read and write: Claude Code, OpenAI Codex, GitHub Copilot, Gemini CLI, and Cursor. It lives in the project's `gam-ai-memory/` folder as plain Markdown and holds only the running work: current task, handover, session log, project state, known issues. Any agent can continue another agent's work without chat history. The long-term knowledge — goal, roadmap, decisions, glossary, stack, tests, deployment, security, inbox — lives in `gam-ai-knowledge/` (skill gam-ai-knowledge) and is linked, never copied. The premise: the skill takes as much as possible from the memory each agent already keeps, and does it with a script wherever a script can (`agent-memory.mjs`). The rules are in [SKILL.md](SKILL.md); this README adds none.

## How it works

- **One entry point for all agents.** The root `AGENTS.md` sends every agent to `gam-ai-memory/CLAUDE.md`, which holds the rules for all agents. Codex and Cursor read `AGENTS.md` themselves. Copilot, Gemini CLI, and Claude Code get a one-line pointer file each ([references/init.md](references/init.md#pointer-files)).
- **Agent memory first, by script.** `agent-memory.mjs` (copied by `init` to `gam-ai-memory/tools/`, so agents without the skill run it too) reads what Claude Code (`~/.claude/projects/<slug>/memory/`, `CLAUDE_CONFIG_DIR` honoured), Gemini CLI, and Codex keep about the project and prints the Claude Code transcripts since the last session entry. `read` prints it, `detect` decides the entry point of `/gam-ai-memory` without an argument, `compare` reports where an agent memory contradicts the project memory (a branch, path, or script that no longer exists, a newer agent memory file, a project memory without a counterpart), `install-hook` wires the pre-commit hook, and `hook` rewrites only the marked auto block of `PROJECT_STATE.md` at every commit and prints warnings; it never blocks and never writes into an agent's memory ([references/session.md](references/session.md#the-script-first)).
- **Start and handover.** A session starts by reading the handover and the current task, and ends by writing them ([references/session.md](references/session.md)). Agents without the skill paste `gam-ai-memory/prompts/startup.md`, `sync.md`, and `handover.md`.
- **Sync at every merge.** The gam- skills run the light `/gam-ai-memory sync` at every merge into the integration branch (gam-engineering P-DOC-13): it ticks the finished steps and sets the next action in `CURRENT_TASK.md`, updates `PROJECT_STATE.md`, and adds one line to the session's entry in `SESSION_LOG.md`. It reads no transcript, never writes `AI_HANDOVER.md`, and never commits; the files join the commit of the merge. The full `handover` stays with `stopp` and completes the session's entry ([references/session.md](references/session.md#sync)).
- **Transcript as a source.** The handover reads the session transcript where it is available, through the project's chat export `prompt-export.mjs` of gam-engineering, so decisions, unanswered questions, and declined actions are not lost. A session that ended without a handover (timeout, session limit) is repaired in the next session by **recover**, with any agent and at the cost of the condensed export instead of a full context ([references/transcript.md](references/transcript.md)).
- **Parallel sessions.** When several agents work at once, each in its own git worktree (Orca, gam-engineering's `implement-all`), each session keeps its task and handover in its own `gam-ai-memory/branches/<branch-slug>.md`; the shared files change only on the integration branch, and the merging session folds the branch file into the session log and deletes it ([references/parallel.md](references/parallel.md)).
- **Reviews any agent can run.** Code and architecture review prompts write their reports to `gam-ai-memory/reports/` ([references/review.md](references/review.md)).
- **Former folder.** Projects set up before 2026-10-23 have `aigamdocs/`; every command reads it while `gam-ai-memory/` is missing and names the rename ([references/init.md](references/init.md#former-folder)).

## Commands

| Command | What it does |
| --- | --- |
| `/gam-ai-memory` | Runs `agent-memory.mjs detect` and continues: init, recover, start, or report the current task; a sync entry in `SESSION_LOG.md` counts as current, so a memory kept up to date by sync does not run recover |
| `/gam-ai-memory init` | Creates `gam-ai-memory/`, `AGENTS.md`, and the pointer files |
| `/gam-ai-memory start` | Runs `agent-memory.mjs read`, loads the memory, and reports goal, task, handover, blockers, next step |
| `/gam-ai-memory sync` | Light update at a merge: task, state, and one line in the session's log entry; no transcript, no handover, no commit. Called by the gam- skills at every merge into the integration branch |
| `/gam-ai-memory handover` | Writes task, state, known issues, handover, and session log (completing the session's sync entry), from `agent-memory.mjs read` and the session transcript where available |
| `/gam-ai-memory recover` | Writes the missing handover of a session that ended without one, from `agent-memory.mjs read`, its transcript, and git |
| `/gam-ai-memory review [code \| architecture] [<scope>]` | Agent-neutral review into `gam-ai-memory/reports/` |
| `/gam-ai-memory check` | Reports gaps, stale state (also a memory behind the last merge), broken links, long-term files left in the memory folder, what `agent-memory.mjs compare` finds, and an outdated script copy |

## Files a project gets

| File | Template |
| --- | --- |
| `gam-ai-memory/` (rules, map, the five short-term files, prompts including `sync.md`, handover and session templates, `reports/`) | [templates/gam-ai-memory/](templates/gam-ai-memory/) |
| `gam-ai-memory/tools/agent-memory.mjs` (and the pre-commit hook line) | [scripts/agent-memory.mjs](scripts/agent-memory.mjs) |
| `AGENTS.md` | [templates/AGENTS.md](templates/AGENTS.md) |
| `CLAUDE.md` (or one line in an existing one) | [templates/CLAUDE.md](templates/CLAUDE.md) |
| `GEMINI.md` | [templates/GEMINI.md](templates/GEMINI.md) |
| `.github/copilot-instructions.md` | [templates/github/copilot-instructions.md](templates/github/copilot-instructions.md) |

## With the gam- skills

The skill runs on its own or next to the gam- skills. The status position, the log of finished work, and the inbox stay in `gam-ai-knowledge/`, written by the gam commands; `CURRENT_TASK.md` links the position row instead of copying it. The gam- skills check at their first command whether this skill is installed and current (its `SKILL.md` names the folder `gam-ai-memory/`), and `/gam-engineering setup` and `migrate` run `/gam-ai-memory init` when the folder is missing. At every merge into the integration branch they run `/gam-ai-memory sync`, and at `stopp` the full `handover` (gam-engineering P-DOC-13, decided as gam-engineering Q517–Q522); their `doc-check --status` reports `MEMORY` when the memory is behind the last merge. Details: [references/gam-interop.md](references/gam-interop.md).

## Status

| Date | State |
| --- | --- |
| 2026-10-22 | Skill created with `aigamdocs/` as the source of the documents it shared with gam-engineering. |
| 2026-10-23 | Short-term only (gam-engineering ADR-0006): folder `gam-ai-memory/`, `aigamdocs/` read during the transition, long-term templates removed, knowledge linked from `gam-ai-knowledge/`. |
| 2026-11-11 | Handover reads the session transcript through the chat export; new command `recover` for sessions that ended without a handover. |
| 2026-11-12 | One memory file per work branch for parallel sessions in git worktrees (Orca, gam-engineering P-WS-13, Q472 there); `check` names leftover branch files. |
| 2026-11-15 | New command `sync`: the light update the gam- skills run at every merge into the integration branch, one session entry in `SESSION_LOG.md` collecting a line per merge (gam-engineering P-DOC-13, Q517–Q522 there). |
| 2026-11-16 | `recover` reads the report of gam-engineering's `session-recover.mjs` first where the project has it: subagents, the open last step, and background commands of the lost session (gam-engineering Q529). |
| 2026-11-16 | Agent memory first, by script: `scripts/agent-memory.mjs` (`read`, `detect`, `compare`, `hook`, `install-hook`) reads the memories of Claude Code, Gemini CLI, and Codex and the Claude Code transcripts; the no-argument entry point is decided by `detect` and counts a sync entry as current (fixes `recover` after merges with sync); pre-commit hook keeps an auto block in `PROJECT_STATE.md`; question rounds are recorded through the chat export where the project has one; `templates/AGENTS.md` names `prompts/sync.md` (Q444–Q453). |
| 2026-11-18 | The hook line goes to the active `pre-commit` hook (`.git/hooks/` or the `core.hooksPath` folder); in a committed hook folder such as gam-engineering's `.githooks/` it reaches every clone and is skipped where the script is missing (gam-engineering QC0002). |

## Repository

- `templates/` and `scripts/agent-memory.mjs` are the product; the root `gam-ai-memory/`, `gam-ai-knowledge/`, `AGENTS.md`, and `tests/` are this repo's own memory, knowledge, and tests and do not ship (`.deployignore`). Test the script with `node --test tests/agent-memory.test.mjs`.
- Install: `git clone git@gitlab.com:htl-villach/it/teachers/gam/alltime/aiskills/gam-ai-memory.git`, then run `./deploy_skill_wrapper.sh` in the clone (Windows: double-click `deploy_skill_wrapper.cmd`; both run `deploy-skill.mjs` of the installed gam-engineering skill, so they need Node and that skill, and a git repository; `gam-ai-knowledge/` with `qa-log.md` never ships).
- Decisions on the design of this skill: [qa-log.md](gam-ai-knowledge/qa-log.md).
