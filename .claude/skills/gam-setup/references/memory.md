# Memory check

Loaded by rule 7 of [Before anything else](../../gam-engineering/SKILL.md#before-anything-else) at the first gam- command of a session, and by [setup](setup.md) and [migrate](migrate.md). The gam- skills use the standalone skill gam-ai-memory for a project's short-term memory (P-DOC-11, P-DOC-12); it lives in its own repo and is not deployed with them, so this check tells the developer when it is missing or outdated. It never installs the skill, never stops a command, and asks no question (the one exception is the user name of the chat-export hook below).

## When

- **Once per session**, at the first gam- command; later commands of the same session skip it.
- Only commands run it: the local pipeline and `doc-check` never check the skill.
- **The chat-export hook, at the same moment.** With git and `gam-engineering/tools/prompt-export.mjs` in the project, run `node gam-engineering/tools/prompt-export.mjs install-hook` without asking, as rule 1 of the section *AI chat export* in [templates/CLAUDE.md](../../gam-engineering/templates/CLAUDE.md#ai-chat-export) says (P-TEAM-6): it changes nothing when the hook is active; on `username unknown` ask one `Q<n>`; when it cannot run, name the reason and the command.

## Where the skill counts as installed

Read the first file that exists:

1. `.claude/skills/gam-ai-memory/SKILL.md` in the project — the vendored copy of a team repo, binding there (P-TEAM-1).
2. `~/.claude/skills/gam-ai-memory/SKILL.md` — the personal copy (`$CLAUDE_CONFIG_DIR/skills/` when that variable is set).

**Version mark.** The skill is *current* when its `SKILL.md` names the folder `` `gam-ai-memory/` `` (with the backticks and the slash). A `SKILL.md` without it is a version that still uses the former folder `aigamdocs/` and counts as *outdated*.

## The hint line

Print the first line whose condition holds, as one plain line before the command's own output, then continue with the command. Nothing holds → print nothing.

| Condition | Line |
| --- | --- |
| No `SKILL.md` in either place | `gam-ai-memory is not installed: git clone git@gitlab.com:htl-villach/it/teachers/gam/alltime/aiskills/gam-ai-memory.git, then run deploy_skill_wrapper.ps1 in the clone. This command continues without it.` |
| `SKILL.md` without the version mark | `gam-ai-memory is outdated (it still uses aigamdocs/): git pull in its clone, then run deploy_skill_wrapper.ps1. This command continues.` |
| The project has `aigamdocs/` and no `gam-ai-memory/` | `aigamdocs/ is the former memory folder: /gam-engineering migrate moves it to gam-ai-memory/.` |
| The project has no `gam-ai-memory/` | `This project has no short-term memory yet: run /gam-ai-memory init.` |

The two folder rows apply only to a skill that is installed and current, and are skipped during `setup`, `migrate`, and `migrate tools`, which create, complete, or move the folder themselves (next section).

## In setup and migrate

`init` only adds what is missing and never overwrites a filled file, so these commands call it whether `gam-ai-memory/` is missing or already there.

- **setup**, once `gam-ai-knowledge/` exists: if the skill is installed and current, always call the Skill tool with `gam-ai-memory` and `init` — it creates `gam-ai-memory/` or completes an existing one; its own questions are logged like every setup round. The result includes the subfolder `gam-ai-memory/plans/`, where plans live (P-DOC-7); until `init` creates it (an open step for the gam-ai-memory repo), the agent creates it at the first plan. If the skill is missing or outdated, print the hint line and finish setup without the folder; the summary names `/gam-ai-memory init` as an open step.
- **migrate** and **migrate tools**: the inventory lists *Memory folder missing or incomplete* as one row when the skill is installed and current, no `aigamdocs/` exists, and `init` would add something — `gam-ai-memory/` is missing, `gam-ai-memory/plans/` is missing, a file of the skill's `templates/gam-ai-memory/` is missing in the project, or the root `AGENTS.md` does not link `gam-ai-memory/`. The action is the same `init` call after the other parts are applied. A project with `aigamdocs/` gets the folder from part 6 ([Moving the knowledge folder](migrate-knowledge.md)); the row is then checked again on the moved folder, and `init` completes it.

Without git (P-GIT-7) the check is the same; `init` then commits nothing.
