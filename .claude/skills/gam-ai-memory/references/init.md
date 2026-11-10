# Init

Sets up the memory in a project. Run once; running it again only adds what is missing and never overwrites a filled file.

## Steps

1. **Inventory.** List what exists: `gam-ai-memory/`, the former `aigamdocs/`, root `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`, `.cursor/rules/`, `README.md`, and the knowledge folder (`gam-ai-knowledge/`, before its move `gam-engineering/documentation/` or `humanengineering/documentation/`). Detect whether the folder is a git repository.
2. **Former folder.** If `aigamdocs/` exists, run [Former folder](#former-folder) first and continue on its result.
3. **Ask one round** (pop-ups, see SKILL.md *Before anything else*):
   - Which agents work on this project — Claude Code, Codex, Copilot, Gemini CLI, Cursor (multi-select; recommend all that the developer uses).
   - Language of the memory documents (recommend the language of the existing project docs, otherwise English).
4. **Copy the templates.** Copy [../templates/gam-ai-memory/](../templates/gam-ai-memory/) to `gam-ai-memory/`, keeping files that already have content. Keep the empty folder `reports/` with a `.gitkeep`.
5. **Fill from the repo.** Fill what the repo states without guessing: `PROJECT_STATE.md` (date, branch, last commit, the build and test commands from the build files or `README.md`). Where the knowledge folder exists, link its `GOAL.md`, its position row, and its documents instead of writing their content ([gam-interop.md](gam-interop.md)). Leave a placeholder `[open]` where the repo says nothing; never invent.
6. **Write the pointer files** for the chosen agents (table below). An existing file gets the pointer line added at the top, never replaced.
7. **Finish** with a first `SESSION_LOG.md` entry (`init`) and an `AI_HANDOVER.md` that names the next step. In a git repository, commit only if the developer confirms.

## Former folder

Until 2026-10-23 the memory lived in `aigamdocs/` and also held long-term files. While `gam-ai-memory/` is missing, every command reads and writes `aigamdocs/` instead, and the first command of a session names the rename in one line.

- **In a project with the gam- skills** (a knowledge folder exists, or `gam-engineering/` does), the rename belongs to `/gam-engineering migrate` (part *Knowledge folder*): it moves the long-term files to `gam-ai-knowledge/` and then renames the folder. Name that command; do not rename here.
- **Otherwise** ask one pop-up whether to rename now: `git mv aigamdocs gam-ai-memory` (a plain move without git), then rewrite the paths in `AGENTS.md` and the pointer files. Long-term files left in the folder (`ROADMAP.md`, `DECISIONS.md`, `adr/`, `GLOSSARY.md`, `ARCHITECTURE.md`, `TODO.md`, `TEST_STRATEGY.md`, `DEPLOYMENT.md`, `SECURITY.md`, `security/`) stay where they are and are reported by **check**; moving them is `/gam-ai-knowledge init` and the developer's call.

## Pointer files

Every agent reads the same entry point, root `AGENTS.md` ([template](../templates/AGENTS.md)), which sends it to `gam-ai-memory/CLAUDE.md`. The other files only point there:

| Agent | Reads natively | What init writes |
| --- | --- | --- |
| OpenAI Codex | `AGENTS.md` | root `AGENTS.md` |
| Cursor | `AGENTS.md`, `.cursor/rules/` | root `AGENTS.md` (no extra rule file) |
| GitHub Copilot | `.github/copilot-instructions.md`, `AGENTS.md` (coding agent) | root `AGENTS.md` and `.github/copilot-instructions.md` ([template](../templates/github/copilot-instructions.md)) |
| Gemini CLI | `GEMINI.md` | root `GEMINI.md` ([template](../templates/GEMINI.md)) |
| Claude Code | `CLAUDE.md` | root `CLAUDE.md` with the line `@AGENTS.md` ([template](../templates/CLAUDE.md)); in an existing `CLAUDE.md` only that line plus one sentence |

Pointer files never repeat rules; they name `AGENTS.md` and stop. A rule that belongs to all agents goes into `gam-ai-memory/CLAUDE.md`. An existing `AGENTS.md` that already links `gam-ai-knowledge/` keeps that line; the memory line is added next to it.
