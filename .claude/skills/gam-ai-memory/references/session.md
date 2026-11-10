# Session start and handover

The two ends of every working session. Agents without this skill run the same steps from [prompts/startup.md](../templates/gam-ai-memory/prompts/startup.md) and [prompts/handover.md](../templates/gam-ai-memory/prompts/handover.md) in the project's `gam-ai-memory/`.

## Start

Read in this order and stop reading once the task is clear:

1. `gam-ai-memory/CLAUDE.md` — the rules.
2. `gam-ai-memory/AI_HANDOVER.md` — what the last agent left.
3. `gam-ai-memory/CURRENT_TASK.md` — the task and its next action, and the position row it links.
4. `gam-ai-memory/PROJECT_STATE.md` — overall state and health.
5. `gam-ai-memory/KNOWN_ISSUES.md` — before touching an affected area.
6. On demand, through `README_AI.md`: the knowledge folder — goal, glossary, stack, decisions, tests, security, deployment, roadmap, inbox.

Then compare the memory with the repo: current branch and last commit against `CURRENT_TASK.md` and `AI_HANDOVER.md`. If they disagree (someone worked without a handover), say so as an assumption and treat the repo as the truth.

Report in five lines: goal, current task, last handover (date, agent), open blockers, proposed next step.

## Handover

Run before the session ends, after every change that the next agent needs to know, and before the context runs out.

1. **`CURRENT_TASK.md`** — tick done steps, add new ones, set the next concrete action (a command or file to open, not "continue").
2. **`PROJECT_STATE.md`** — update the sections the session changed; set the date.
3. **`KNOWN_ISSUES.md`** — add what the session found. A new task or idea goes to the inbox of the knowledge folder (`next.md`), a decision to its `adr/`, a term to its glossary — in a gam project through the gam commands, never as a copy here.
4. **`AI_HANDOVER.md`** — overwrite it from [templates/HANDOVER_TEMPLATE.md](../templates/gam-ai-memory/templates/HANDOVER_TEMPLATE.md).
5. **`SESSION_LOG.md`** — insert one entry from [templates/SESSION_TEMPLATE.md](../templates/gam-ai-memory/templates/SESSION_TEMPLATE.md) at the top of the log.
6. **Commit** the memory together with the code it describes, if the project's rules allow a commit now; otherwise list the uncommitted files in the handover.
