# Knowledge folder and gam-engineering

How the short-term memory shares a project with the long-term knowledge in `gam-ai-knowledge/` and with the gam- skills, without two homes for one fact. Decided in gam-engineering's ADR-0006 (2026-10-22), which replaced the earlier plan of this skill's Q4 to make the memory the source of roadmap, decisions, glossary, and stack.

## Who owns what

| Fact | Home | The memory |
| --- | --- | --- |
| Current task, handover, session log, project state, known issues | `gam-ai-memory/` | owns it |
| Status position (feature, phase, branch, MR, next step) | `gam-ai-knowledge/ROADMAP-DETAILS.md` (team mode: the developer's `STATUS.md`) | `CURRENT_TASK.md` links the row and adds the steps of the task |
| Log of finished work | the log of `ROADMAP-DETAILS.md` | `SESSION_LOG.md` logs sessions and links the log rows they wrote |
| Inbox | `gam-ai-knowledge/next.md` | links it; never keeps its own todo list |
| Goal, roadmap, decisions, glossary, stack, tests, deployment, security, concepts, work items, Q&A log | `gam-ai-knowledge/` | `README_AI.md` links them |

The knowledge folder is `gam-ai-knowledge/`; before its move it is `gam-engineering/documentation/` or `humanengineering/documentation/`, read there like the gam- skills do. Without any knowledge folder, the memory holds only its own files, and a long-term fact waits for `/gam-ai-knowledge init`.

## Running next to the gam- skills

- The gam- skills write the status position, the log, and the inbox at every merge and phase boundary; the memory never writes them. A handover only links what the gam commands wrote.
- **review** does not replace `/gam-engineering review <MR>` or `sweep` ([review.md](review.md)).
- The gam- skills check at their first command whether this skill is installed and current and whether `gam-ai-memory/` exists; `/gam-engineering setup` and `migrate` run **init** when the folder is missing.

## Check

Report, change nothing without confirmation:

- Memory files that are empty or still hold only template placeholders.
- `CURRENT_TASK.md` or `AI_HANDOVER.md` older than the last commit that changed code.
- Links in the memory folder that do not resolve; pointer files that do not reach `AGENTS.md`.
- Secrets or personal data patterns in the memory folder (tokens, passwords, e-mail addresses beyond handles).
- The former folder `aigamdocs/` in use, and every long-term file still in the memory folder: `ROADMAP.md`, `DECISIONS.md`, `adr/`, `GLOSSARY.md`, `ARCHITECTURE.md`, `TODO.md`, `TEST_STRATEGY.md`, `DEPLOYMENT.md`, `SECURITY.md`, `security/`. Name the command that moves them: `/gam-engineering migrate` in a gam project, otherwise `/gam-ai-knowledge init`.
- A `CURRENT_TASK.md` that copies the position row instead of linking it.

Write the result to `gam-ai-memory/reports/YYYY-MM-DD-memory-check.md` and summarize it in chat.
