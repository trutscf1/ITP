# Session start, sync, handover, and recover

The two ends of every working session, the light update at every merge in between, and the repair when the end is missing. A session that uses a branch memory file (parallel sessions in git worktrees) follows [parallel.md](parallel.md) instead wherever it names a step here. Agents without this skill run the same steps from [prompts/startup.md](../templates/gam-ai-memory/prompts/startup.md), [prompts/sync.md](../templates/gam-ai-memory/prompts/sync.md), [prompts/handover.md](../templates/gam-ai-memory/prompts/handover.md), and [prompts/recover.md](../templates/gam-ai-memory/prompts/recover.md) in the project's `gam-ai-memory/`.

## The script first

Start, handover, and recover begin with `agent-memory.mjs` (SKILL.md rule 6): `node gam-ai-memory/tools/agent-memory.mjs <command>`, or the skill's `scripts/agent-memory.mjs` where the project has no copy. It never writes into an agent's memory.

- `read` prints, in this order: the Claude Code memory of this repo (`~/.claude/projects/<slug>/memory/`; `user` and `feedback` entries by name and description only, `--full` prints them whole), the headings of `~/.claude/CLAUDE.md`, the `Gemini Added Memories` of `~/.gemini/GEMINI.md`, the Codex files (`~/.codex/AGENTS.md`, its memories folder), and then the Claude Code transcripts since the reference point, condensed to prompts, pop-up rounds, plan approvals, and declined calls. A missing source is named as skipped. Options: `--since <YYYY-MM-DD>`, `--json`, `--full`.
- `detect` prints `entry: init|recover|start|report` and the reason. The reference point is the newest `SESSION_LOG.md` entry, an open sync entry included, or `AI_HANDOVER.md` when that is newer (a handover dated without a time counts as the end of that day). Work after it is a commit newer than it that is neither one of the merges the entry lists nor a change of `gam-ai-memory/` or `gam-ai-knowledge/` alone, an uncommitted change, or an ended session transcript newer than it (the running session is not counted). In a worktree with a branch file, its `updated:` is the reference point.
- `compare` lists what an agent memory names that the repo no longer has (a branch, a path, an `npm run` script), an agent memory file newer than the newest `SESSION_LOG.md` entry, and a `project` memory whose name appears in none of `CURRENT_TASK.md`, `PROJECT_STATE.md`, `KNOWN_ISSUES.md`. Whether two statements contradict in meaning is the agent's judgment from the printed facts.
- `hook` runs at every commit (`install-hook` wires it into `.git/hooks/pre-commit`): it rewrites only the block between `<!-- agent-memory:auto -->` and `<!-- /agent-memory:auto -->` in `PROJECT_STATE.md` (the branch file in a worktree with one), stages that file, prints the `compare` warnings, and never blocks the commit.

What the output holds is a source, never a home: condense it into the memory files, copy no agent memory verbatim, and keep personal facts out (SKILL.md, *Rules for every agent*, rule 6).

## Start

Run `agent-memory.mjs read` and `agent-memory.mjs compare`, then read in this order and stop reading once the task is clear:

1. `gam-ai-memory/CLAUDE.md` — the rules.
2. `gam-ai-memory/AI_HANDOVER.md` — what the last agent left.
3. `gam-ai-memory/CURRENT_TASK.md` — the task and its next action, and the position row it links.
4. `gam-ai-memory/PROJECT_STATE.md` — overall state and health.
5. `gam-ai-memory/KNOWN_ISSUES.md` — before touching an affected area.
6. On demand, through `README_AI.md`: the knowledge folder — goal, glossary, stack, decisions, tests, security, deployment, roadmap, inbox.

Then compare the memory with the repo: current branch and last commit against `CURRENT_TASK.md` and `AI_HANDOVER.md`. If they disagree, say so as an assumption and treat the repo as the truth. If `agent-memory.mjs detect` says `recover` — work after the reference point (the newest `SESSION_LOG.md` entry, an open sync entry included, or `AI_HANDOVER.md` when that is newer) — the last session ended without a handover: say so and run [Recover](#recover) before the report. Merges that a sync entry lists are not such work. Agents without the script apply the same rule by hand.

Report in five lines: goal, current task, last handover (date, agent), open blockers, proposed next step.

## Handover

Run before the session ends, after every change that the next agent needs to know, and before the context runs out. If the context is already nearly full, or the session ended first (timeout, session limit), [Recover](#recover) writes the handover in the next session.

1. **Agent memory and transcript** — run `agent-memory.mjs read` and read the transcript of the session since the last handover and take from both what the memory needs ([transcript.md](transcript.md)). Without a transcript, work from the session as it is remembered.
2. **`CURRENT_TASK.md`** — tick done steps, add new ones, set the next concrete action (a command or file to open, not "continue").
3. **`PROJECT_STATE.md`** — update the sections the session changed; set the date.
4. **`KNOWN_ISSUES.md`** — add what the session found. A new task or idea goes to the inbox of the knowledge folder (`next.md`), a decision to its `adr/`, a term to its glossary — in a gam project through the gam commands, never as a copy here.
5. **`AI_HANDOVER.md`** — overwrite it from [templates/HANDOVER_TEMPLATE.md](../templates/gam-ai-memory/templates/HANDOVER_TEMPLATE.md).
6. **`SESSION_LOG.md`** — insert one entry from [templates/SESSION_TEMPLATE.md](../templates/gam-ai-memory/templates/SESSION_TEMPLATE.md) at the top of the log. When the newest entry is this session's open sync entry ([Sync](#sync), step 3), complete that entry instead of inserting a second one: fill its fields from steps 1 to 5 and set its *Handover* line to done.
7. **Commit** the memory together with the code it describes, if the project's rules allow a commit now; otherwise list the uncommitted files in the handover.

## Sync

The light update at every merge into the integration branch, called by the gam- skills in the working step that writes the status (gam-engineering P-DOC-13, decided as gam-engineering Q517–Q522). It keeps the running files current between handovers: `handover` stays with the end of the session. Sync itself runs no script; the commit that carries it runs the pre-commit hook of `agent-memory.mjs`, which refreshes the auto block of `PROJECT_STATE.md`. The caller says where it runs: on the work branch before a local merge, or on the integration branch after a merge on the git host. Agents without this skill run the same steps from [prompts/sync.md](../templates/gam-ai-memory/prompts/sync.md). On a work branch with a branch file in use, **sync** writes nothing and says so ([parallel.md](parallel.md)).

1. **`CURRENT_TASK.md`** — tick the steps the merge finished, set the next concrete action from the *Next step* cell of the linked position row, set `updated:`. When the merge finished the task, the goal names the next task of the position table, or `none` with a link to the inbox (`next.md`).
2. **`PROJECT_STATE.md`** — update the sections the merge changed (what works, in progress, health from the pipeline result of this merge), set `updated:`.
3. **`SESSION_LOG.md`** — if the newest entry is this session's (same date, agent, and model, and not closed by a handover: its *Handover* line says `open`), add one line to its *Merges* list: branch, one sentence, link to the log row in `ROADMAP-DETAILS.md`. Otherwise insert a new entry from [templates/SESSION_TEMPLATE.md](../templates/gam-ai-memory/templates/SESSION_TEMPLATE.md) with that line and `open` in its *Handover* line; the fields a handover fills stay `—`.
4. **Never** read a transcript, write `AI_HANDOVER.md`, copy the position, the log, or the inbox, or commit on its own: the files join the caller's commit.

## Recover

Writes the handover of a session that ended without one. Any agent can run it, also a different one than the agent of the lost session; agents without this skill use [prompts/recover.md](../templates/gam-ai-memory/prompts/recover.md).

1. **Agent memory and transcript** — run `agent-memory.mjs read`: it prints the agents' memories and the Claude Code transcripts since the reference point, the same reference point `detect` used. Where the project has `gam-engineering/tools/session-recover.mjs`, run `node gam-engineering/tools/session-recover.mjs` too and read the report it names: the lost session's subagents with their briefs and reports, its open last step, and its background commands, which the export does not hold. Then load the sessions newer than `AI_HANDOVER.md` and read them cheaply ([transcript.md](transcript.md)).
2. **Repo** — `git status`, and `git log` since the last handover. If the transcript and the repo disagree, the repo is the truth.
3. **Handover** — run steps 2 to 7 of [Handover](#handover). Mark the handover and the session entry `recovered from transcript by <agent and model>` and name the agent and model of the lost session.
4. **Doubt** — what the transcript does not show for certain goes into the handover as an open question, not as a fact.

Without any transcript, recover from git alone and say so in the handover.
