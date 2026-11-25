# Knowledge folder and gam-engineering

How the short-term memory shares a project with the long-term knowledge in `gam-ai-knowledge/` and with the gam- skills, without two homes for one fact. Decided in gam-engineering's ADR-0006 (2026-10-22), which replaced the earlier plan of this skill's Q4 to make the memory the source of roadmap, decisions, glossary, and stack.

## Who owns what

| Fact | Home | The memory |
| --- | --- | --- |
| Current task, handover, session log, project state, known issues | `gam-ai-memory/` | owns it |
| One work branch's task and handover while sessions run in parallel worktrees | `gam-ai-memory/branches/<branch-slug>.md` | owns it ([parallel.md](parallel.md)); gam-engineering's `detect` and recovery read it first (P-WS-13) |
| Status position (feature, phase, branch, MR, next step) | `gam-ai-knowledge/ROADMAP-DETAILS.md` (team mode: the developer's `STATUS.md`) | `CURRENT_TASK.md` links the row and adds the steps of the task |
| Log of finished work | the log of `ROADMAP-DETAILS.md` | `SESSION_LOG.md` logs sessions and links the log rows they wrote |
| Inbox | `gam-ai-knowledge/next.md` | links it; never keeps its own todo list |
| Chat transcripts | the tools' own stores; exported to `docs/prompts/` by gam-engineering's `prompt-export.mjs` | reads them for handover and recover (Claude Code through `agent-memory.mjs read`, the other tools through the export), links the day file, never copies text ([transcript.md](transcript.md)) |
| What each agent keeps about the project (Claude Code auto memory, Gemini CLI, Codex) | the agents' own stores; never written by this skill | read by `agent-memory.mjs read`, compared with the memory by `compare`; a fact worth keeping is condensed into the memory by the agent, never copied verbatim ([session.md](session.md#the-script-first)) |
| Goal, roadmap, decisions, glossary, stack, tests, deployment, security, concepts, work items, Q&A log | `gam-ai-knowledge/` | `README_AI.md` links them |

The knowledge folder is `gam-ai-knowledge/`; before its move it is `gam-engineering/documentation/` or `humanengineering/documentation/`, read there like the gam- skills do. Without any knowledge folder, the memory holds only its own files, and a long-term fact waits for `/gam-ai-knowledge init`.

## Running next to the gam- skills

- The gam- skills write the status position, the log, and the inbox at every merge and phase boundary; the memory never writes them. A handover only links what the gam commands wrote.
- The gam- skills run **sync** at every merge into the integration branch and **handover** at `stopp` (gam-engineering P-DOC-13, decided as gam-engineering Q517–Q522); `sync` reads no transcript and never writes `AI_HANDOVER.md` ([session.md](session.md#sync)).
- **review** does not replace `/gam-engineering review <MR>` or `sweep` ([review.md](review.md)).
- **Parallel sessions** (gam-engineering P-WS-13): a session on a work branch in its own worktree writes only its branch file and leaves the position, the log, and the inbox to the merge; the merging session folds the branch file in ([parallel.md](parallel.md#at-the-merge)).
- The gam- skills check at their first command whether this skill is installed and current and whether `gam-ai-memory/` exists; `/gam-engineering setup` and `migrate` run **init** when the folder is missing.

## Check

Report, change nothing without confirmation:

- Memory files that are empty or still hold only template placeholders.
- A memory behind the last merge, by the criterion of gam-engineering's `doc-check --status` (error `MEMORY`, P-DOC-13; the exact rule is the `MEMORY` row of the rule table in the project's `gam-ai-knowledge/MANIFEST.md`). In short: *M* is the newest merge commit on the first-parent line of the integration branch that changes a file outside `gam-ai-memory/` and `docs/prompts/`; the memory is current when a commit since *M*, on the integration branch or on the checked-out work branch ahead of it, changes `SESSION_LOG.md`, and `updated:` of `CURRENT_TASK.md` and of `PROJECT_STATE.md` is not before the earlier of the two dates, that of *M* and that of this commit. Without a merge commit nothing is reported; with `SESSION_LOG.md` untracked or git-ignored, compare `updated:` of both files with the date of the newest log row of `ROADMAP-DETAILS.md`. Name `/gam-ai-memory sync` as the repair.
- `AI_HANDOVER.md` older than the last commit that changed code.
- Run `node gam-ai-memory/tools/agent-memory.mjs compare` (the skill's `scripts/agent-memory.mjs` without a copy) and report every finding: a branch, path, or `npm run` script that an agent memory names and the repo no longer has; an agent memory file newer than the newest `SESSION_LOG.md` entry; a `project` memory without a counterpart in `CURRENT_TASK.md`, `PROJECT_STATE.md`, or `KNOWN_ISSUES.md`.
- An outdated or missing script copy: `gam-ai-memory/tools/agent-memory.mjs` absent, or its `agent-memory-version:` line (first lines) lower than that of the skill's `scripts/agent-memory.mjs`, or the same version with different content. Also an active `pre-commit` hook (`.git/hooks/`, or the folder `core.hooksPath` names) without the `# agent-memory:hook` line (repair: `agent-memory.mjs install-hook`).
- Links in the memory folder that do not resolve; pointer files that do not reach `AGENTS.md`.
- Secrets or personal data patterns in the memory folder (tokens, passwords, e-mail addresses beyond handles).
- The former folder `aigamdocs/` in use, and every long-term file still in the memory folder: `ROADMAP.md`, `DECISIONS.md`, `adr/`, `GLOSSARY.md`, `ARCHITECTURE.md`, `TODO.md`, `TEST_STRATEGY.md`, `DEPLOYMENT.md`, `SECURITY.md`, `security/`. Name the command that moves them: `/gam-engineering migrate` in a gam project, otherwise `/gam-ai-knowledge init`.
- A `CURRENT_TASK.md` that copies the position row instead of linking it.
- Branch files in `branches/` whose branch is merged or no longer exists (`git branch --list <branch>`, `git branch --merged`): left over after a merge that did not fold them in.

Write the result to `gam-ai-memory/reports/YYYY-MM-DD-memory-check.md` and summarize it in chat.
