# Parallel sessions

How several agent sessions work on one repository at the same time, each in its own git worktree (P-WS-13): the Orca app (one agent per workspace), Claude Code sessions started in worktrees, and `implement-all` (implementer subagents in worktrees the session creates, [Worktrees for subagents](#worktrees-for-subagents), Orca workers under `runner orca`, or T3 threads under `runner t3`). Loaded by [detect](detect.md), [quick](quick.md), [models](models.md#recovery-after-a-compaction-or-a-new-session), and the delivery commands that name it.

## When to run sessions in parallel

Only for independent work (superpowers *dispatching-parallel-agents*):

- **Independent.** Each session's issue or plan can be understood and finished without the others. Two items that change the same module, a shared migration sequence, a lock file upgrade, or a generated file are built one after the other, in one session or in a later wave. `node gam-engineering/tools/parallel-check.mjs` measures from the git history which program files force that serial work, and `architecture review` judges it as the area *Parallel work* (P-ARCH-5).
- **One branch, one worktree, one session.** Git lets a branch be checked out in only one worktree. A session works only on the branch of its worktree, never switches it, and never edits another worktree's files.
- **Baseline first** (SP-8). At its start a session checks that its tree is clean and the project's short test is green on the tip it started from, and writes that tip's hash into its branch memory file. A red baseline stops the session and is reported; it is never fixed inside the session's issue.

## How much parallelism

Asked as one `Q<n>` pop-up before parallel work starts (`implement-all`, Q477); the answer holds for that run:

| Option | Implementers at once | Which issues run together |
| --- | --- | --- |
| **Sinnvoll** (recommended) | At most three | Only independent ones (the rules above); dependent or overlapping issues wait for a later wave |
| **Maximal** | Every ready issue of the frontier at once, each wave again | Also issues that touch the same files; their conflicts are resolved one merge at a time (SP-14), and the description warns that this uses the most of the usage limit (P-WS-12) |
| **Keine** | One | One issue after the other in frontier order, still each in its own worktree and with its own merge |

**Capacity cap (Q555–Q560).** The computer limits the choice: `gam-engineering/tools/capacity.mjs` works out `limit = max(1, min(cores / 2, free RAM / 2 GB, free disk / (size of the dependency folders + 1 GB)))` from the CPU cores, the free RAM, and the free disk space of the folder that holds the worktrees (running Node or build processes are not counted), and **Sinnvoll** and **Maximal** are cut to it; the pop-up names the number and the reason (`cpu`, `ram`, `disk`, or `setting`). The personal key `GAM_ENGINEERING_MAX_PARALLEL` (P-TEAM-2, `settings local`, `.claude/settings.local.json`) is `auto` (default, computed) or a number that replaces the computed limit, also above it; an invalid value counts as `auto` with a warning. The limit counts all linked worktrees of the repository: a wave starts `min(choice, limit − linked worktrees of other sessions)` implementers, at least one, so a full machine builds one issue after the other instead of none. `worktree-setup.mjs` prints a warning and continues when the new worktree exceeds the limit. In a session opened by hand (Orca, T3 Code, Claude Code in a worktree), check `node gam-ai-knowledge/tools/doc-check.mjs --status` (line `Worktrees: <n> of max <limit> (<reason>)`) before opening another worktree; above the limit, finish or remove one first.

## Worktrees for subagents

When a command gives a subagent its own worktree (`implement-all` under runner `agent`), the session creates that worktree itself. The Agent tool's `isolation: "worktree"` is never used (Q485): the harness refuses the worktree it just made when the session's path and git's path are spelled differently (seen on Windows: session under `c:\…`, git reports `C:/…`), and leaves it behind locked.

1. **Create.** From the main folder: `git worktree add ../<project>-wt-<name> -b <branch> <integration branch>`. The worktree is a sibling folder of the main folder; `<project>` is the main folder's name and `<name>` the issue ID or plan name. For a branch that already exists (a second attempt), leave out `-b`: `git worktree add ../<project>-wt-<name> <branch>`.
2. **Set the worktree up.** From the worktree: `node gam-engineering/tools/worktree-setup.mjs`. Each path `.worktreeinclude` lists that exists in the main folder is copied to the same relative path in the worktree (lines starting with `#` and empty lines are skipped, a file that is already there is kept); then the script does what [Ports, data, and tests in a worktree](#ports-data-and-tests-in-a-worktree) says: ports, database suffix, install, workspace file. A failing step exits with 1 and names the step; the subagent is not started, and the session reports the issue as blocked.
3. **Start the subagent** with the Agent tool, without `isolation`. The brief names the absolute path of the worktree as the only folder it works in. The subagent starts in the session's folder, so the brief also says: begin every shell command with `cd <worktree> &&` (or use `git -C <worktree>`), pass the file tools absolute paths under the worktree, and never edit the main folder.
4. **Check first.** The subagent's first step is `git -C <worktree> rev-parse --show-toplevel` and `git -C <worktree> branch --show-current`. When they do not print the worktree and the branch of the brief, it stops and reports.

The session removes these worktrees as [Cleanup](#cleanup) says.

## What a session writes

The shared status files have one writer at a time, so a session on a work branch writes them only when its branch is merged:

| File | On a work branch | At the merge |
| --- | --- | --- |
| `gam-ai-memory/branches/<branch-slug>.md` (`/` → `-`) | Position, next step, baseline tip, open questions, inbox requests; the session's own memory | Folded into `SESSION_LOG.md` and deleted |
| `ROADMAP-DETAILS.md` position and log, `ROADMAP.md` stage | Not touched | Written by the merging session, in the merge commit's MR or right after it (P-ROAD-4) |
| `next.md` | Not touched; new entries go to the branch memory file and the MR | Copied in by the merging session (P-ROAD-3) |
| `gam-ai-memory/CURRENT_TASK.md`, `PROJECT_STATE.md`, `SESSION_LOG.md` | Not touched (`sync` writes nothing while a branch file is in use) | Written by `sync` in the merging session, after it folded the branch file in (P-DOC-13) |
| `gam-ai-memory/AI_HANDOVER.md` | Not touched | Written by `handover` on the integration branch |
| Concept documents, plans, `STACK.md` | Only the ones its own issue or plan owns (P-GIT-5) | Merged with the branch |

The status hook (`status-reminder.mjs`) asks for the status only in the folder that holds the integration branch and in the session whose branch was just merged, never in a parallel session.

## Merging

Every session may merge its own branch under the merge policy (P-MR-4) through [merge](../../gam-delivery/references/merge.md), from its own worktree. `merge.mjs` never switches branches in the caller's folder:

- It merges in the worktree that holds the integration branch (`dev`, or `main` under `trunk`), which must be clean, or, when none holds it, in a temporary worktree it removes again.
- One merge or release runs at a time: the lock `gam-merge.lock` in the common git folder (`git rev-parse --git-common-dir`). A second merge stops with *Another merge is running*; wait and run again. A lock older than 30 minutes, or one whose process is gone, is taken over.
- The branch must contain the integration tip (SP-14). After another session merged, merge the integration branch into the own branch, rerun the pipeline, and merge then.
- A work branch still checked out in a worktree is kept locally; the worktree is removed as [Cleanup](#cleanup) says, then the branch. The branch on `origin` is deleted.

## Cleanup

- A session removes only its own worktrees, once their branch is merged (QA0004, QA0005): the worktree it runs in on a work branch, the worktrees it created for subagents, and the Orca workers it started. Never another session's, never one whose branch is not merged, and never with `--force`. When `git worktree remove` refuses, list the untracked files and ask one `Q<n>` (commit them to the branch, move them into the main folder, or delete them) (SP-9). The only exception is `rebuild`, which removes its own detached `gam-rebuild-*` checkouts with `--force` after checking the path (Q476).
- A worktree of [Worktrees for subagents](#worktrees-for-subagents) is removed once its branch is merged: `git worktree remove ../<project>-wt-<name>`, then `git branch -d <branch>`, because the merge keeps a local branch that a worktree still holds. `-d` refuses a branch with unmerged commits; never `-D` without the developer's word.
- A worktree the harness created and then refused (a folder `.claude/worktrees/agent-…`, locked, on a branch `worktree-agent-…`) is left over from a run that still used the harness isolation. `git worktree list --porcelain` shows its `locked` line with the reason; when the reason names a process that still runs, the worktree stays. Otherwise, when `git -C <folder> status --porcelain` prints nothing: `git worktree unlock <folder>`, `git worktree remove <folder>`, and `git branch -d worktree-agent-…`. With changes in it, or when `-d` refuses, ask the `Q<n>` of the first bullet.
- **The own worktree** is removed by the session that runs in it, as the last step of [merge](../../gam-delivery/references/merge.md) (QA0004). First `git -C <worktree> status --porcelain` must print nothing (ignored files such as `node_modules/` or a copied `.env.local` do not count); otherwise the worktree stays and the `Q<n>` of the first bullet is asked (QA0006). Then, from the worktree:
  - **Orca workspace** (`orca worktree current --json` names it): `orca worktree rm --worktree path:<worktree> --delete-branch --json`. Orca stops the session with it, so the closing message is written before this call and nothing follows it. `--delete-branch` deletes the local branch only when Orca can prove it merged; a kept branch is named in the closing message.
  - **Any other worktree:** `git -C <main folder> worktree remove <worktree>`, then `git -C <main folder> branch -d <branch>` and `git -C <main folder> worktree prune`. When the system refuses because the folder is still in use (on Windows the running session holds it), the worktree stays and the closing message names the command for the developer.
- An Orca worker of [implement-all](../../gam-delivery/references/implement-all.md#runner-orca) is removed by the session that started it, after its merge, with the same `orca worktree rm` call on the worker's path. Orca's *Delete* stays the way for the developer to remove a workspace by hand.
- `git worktree prune` after a removal.
- **What others left behind** is removed by [cleanup](../../gam-delivery/references/cleanup.md) (QC0004–QC0010): `gam-engineering/tools/worktree-cleanup.mjs` removes every merged, clean worktree without activity for 10 minutes (an Orca workspace with `orca worktree rm --delete-branch`), its empty folder, and every merged work branch locally and on `origin`, and reports the open ones; a merged worktree still active an hour after its merge is asked about. `merge` runs it after every merge, and `/gam-engineering` in the main folder prints a hint line when there is something to remove. It never removes the main folder or the worktree it runs in, and never forces.

## Orca

[Orca](https://github.com/stablyai/orca) creates one worktree per workspace from its base ref (usually `origin/main`) and starts the agent in it.

**On Linux the Orca CLI is `orca-ide`** (cleanup-orca-screenreader, 2026-11-21): there `orca` is the GNOME screen reader, which ignores every argument, reads each key press aloud, and runs until killed. Every `orca …` command in the gam- skills means `orca-ide …` on Linux; never start a bare `orca` there. Before the first Orca command, check that the CLI is installed (on Linux `command -v orca-ide`); when it is not, no Orca command runs and the step takes its path without Orca.

- **Files the project gets** (`setup`, `migrate tools`): `.worktreeinclude` lists git-ignored files Orca and Claude Code copy into every new worktree, and the session copies into a worktree it creates for a subagent: `CLAUDE.local.md`, `.claude/settings.local.json`, `.env`, `.env.local` when they exist. In stealth mode (`GAM_STEALTH_TARGET`) `orca.yaml` lists the git-ignored gam- folders under `worktree.sharedDirectories`, so every workspace shares the main folder's copy instead of having none. Both files are merged line by line; a hand-written line stays.
- **Setting a workspace up.** Orca's documentation (`orca.yaml`, *Worktrees* page) names only `worktree.sharedDirectories` in the repository file; it does not name a setup-script key (checked 2026-11-14), so `orca.yaml` is not used to call the script. The agent in a new workspace runs `node gam-engineering/tools/worktree-setup.mjs` as its first step ([Ports, data, and tests in a worktree](#ports-data-and-tests-in-a-worktree)); a developer who wants Orca to do it adds the command under Orca's *Settings* → *Repository* → *Hooks* (commands that run after a worktree is created), which is a per-user setting and not part of the project. Open the `<branch-slug>.code-workspace` file the script wrote in VS Code to tell the windows apart.
- **One workspace per issue or plan.** Name the workspace after the branch (`feature/<issue-id>-<slug>`, `quick/<name>`, P-GIT-2) in Orca's *Advanced* → *Branch name*. The agent in it starts with `/gam-engineering`, which detects the branch ([detect](detect.md) row 5).
- **Shipping.** Orca's *Ship* (commit, push, open PR) fits projects that merge on the host. In a project that merges locally, the agent runs `/gam-engineering merge` from the workspace instead.
- **Offering parallel workspaces (Q584).** At the start of `/gam-engineering` in an Orca session (`ORCA_APP_VERSION` is set or `CLAUDE_CODE_ENTRYPOINT` is `orca`), when the session is in the main folder or on the integration branch (not [detect](detect.md) row 6) and `orca --version` answers (when `orca` is not on the PATH, as outside Orca's own terminal: the CLI the app ships, on Windows `%LOCALAPPDATA%\Programs\orca\resources\bin\orca.cmd`, measured with Orca 1.4.263 on 2026-11-19, QA0023; every `orca` command below then uses that path), the agent counts the ready items that are independent by [When to run sessions in parallel](#when-to-run-sessions-in-parallel): the ready issues of the Phase-7 frontier, or the inbox entries without a dependency on each other. At two or more it asks once per session one `Q<n>` pop-up: **Ja, N Workspaces** (recommended; `N = min(items, limit − linked worktrees)` from `node gam-engineering/tools/capacity.mjs --json`, at least one, the description names the items, the limit, and its reason), **Nur hier weiter** (no workspace, detect goes on), and **None of these**. On yes, per item: `orca worktree create --name <branch> --branch <branch> --base-branch <integration branch> --agent claude --prompt "<prompt>" --no-parent --json`, with branch `feature/<issue-id>-<slug>` and prompt `/gam-engineering implement <issue-id>` for an issue, or branch `quick/<Kurzname>` and prompt `/gam-engineering <Kurzname>` for an inbox entry (P-GIT-2). A failing create is reported and the remaining items go on; this session then continues with detect and leaves the items it handed out to their workspaces.
- **Orca as the runner of `implement-all`.** Under `env.GAM_ENGINEERING_RUNNER` `orca`, `implement-all` starts Orca workers instead of subagents ([implement-all](../../gam-delivery/references/implement-all.md#runner-orca)).

## T3 Code

[T3 Code](https://github.com/pingdotgg/t3code) is a control plane that drives Claude Code, Codex, Cursor, OpenCode, and other agents. It reads no instruction file of its own: the agents it drives read `CLAUDE.md` and `AGENTS.md`, which the skills already write. Its project file `t3.json` holds scripts, not instructions. Measured with T3 0.1.10 on 2026-11-19 (QA0023).

- **A T3 session** sets `CLAUDE_CODE_ENTRYPOINT` to `t3-code` and `T3CODE_THREAD_ID`. In it, text the developer must read in full before a pop-up (a finding, a draft the question refers to) goes out through T3's tool `send_to_user` first, since text written before a tool call can reach the developer only as a one-line summary.
- **Worktrees.** A thread in worktree mode gets a git worktree, by default under `~/.t3/worktrees` (configurable per machine) on a branch with the prefix `t3/`. Give the thread a P-GIT-2 branch name where T3 offers one; otherwise [detect](detect.md) row 6 still treats the `t3/` branch in its linked worktree as a work branch, and it is merged like any work branch through `/gam-engineering merge`. A T3 thread is an independent unit of [When to run sessions in parallel](#when-to-run-sessions-in-parallel) only when its work is independent.
- **The hook.** `t3.json` in the repository root holds the script `gam worktree setup` with `runOnWorktreeCreate` and `async: false`, which runs `node gam-engineering/tools/worktree-setup.mjs` in every new worktree ([Ports, data, and tests in a worktree](#ports-data-and-tests-in-a-worktree)). T3 sets `T3CODE_PROJECT_ROOT`; the script copies the `.worktreeinclude` files from that folder (T3 has no `.worktreeinclude` of its own) and registers the worktree in the history of the chat export (`gam-worktree-history.json` in the common git folder), so the main folder still exports the sessions of a worktree T3 removed. T3 runs only the first script with `runOnWorktreeCreate`; when `t3.json` has one, the gam entry is not added and the existing script should call `worktree-setup.mjs`. Without the hook, the agent in the thread runs the script as its first step. T3 reads the keys `name`, `command`, `icon`, `runOnWorktreeCreate`, and `async`, and waits for the script before the agent starts only when `async` is `false`; `migrate tools` adds `async: false` to a gam script that lacks it.
- **Self-cleanup.** T3 removes an idle worktree by itself. Commit or push the work before a thread rests; a worktree that holds only uncommitted changes can be gone when the developer returns.
- **Orchestration.** T3's CLI starts and drives threads (`t3 thread start --worktree <base> --branch <name> --model <slug> --wait --json`, and `send`, `show`, `list`), and the agent in a thread has T3 tools to delegate work. The CLI is `t3` on the PATH, on Windows also `%USERPROFILE%\.t3\bin\t3.cmd` (Git Bash does not find it by name, measured 2026-11-19); every `t3` command below then uses that path.
- **T3 as the runner of `implement-all`.** Under `runner t3` (`env.GAM_ENGINEERING_RUNNER` `t3`), or in a T3 session without the key, `implement-all` starts T3 threads instead of subagents ([implement-all](../../gam-delivery/references/implement-all.md#runner-t3), QA0024–QA0028).
- **Offering parallel threads (QA0028).** At the start of `/gam-engineering` in a T3 session, under the same conditions as the [Orca](#orca) offer (main folder or integration branch, not [detect](detect.md) row 6, two or more independent ready items) and when `t3 --version` answers, the agent asks once per session the same `Q<n>` pop-up: **Ja, N Threads** (recommended, N as for Orca), **Nur hier weiter**, and **None of these**. On yes, per item one call `t3 thread start --worktree <integration branch> --branch <branch> --provider <Claude provider id> --model <draft tier> --title "<branch>" . "<prompt>"` without `--wait`, with branch and prompt as for Orca (`feature/<issue-id>-<slug>` and `/gam-engineering implement <issue-id>`, or `quick/<Kurzname>` and `/gam-engineering <Kurzname>`). A failing start is reported and the remaining items go on; this session then continues with detect and leaves the items it handed out to their threads.
- **Short pop-ups.** T3's question card can hide its *Submit* button behind the chat input when a pop-up is long, measured with a multi-select question of three options with three-line descriptions (2026-11-19); a short single-select pop-up worked. In a T3 session, keep each option description to one line and put longer context into `send_to_user` before the pop-up.
- **Export.** The chats of Claude Code and Codex threads are exported as any session of that agent, since T3 worktrees are registered git worktrees. A thread of an agent with its own store that the export does not read is not exported.

## Ports, data, and tests in a worktree

Git does not copy ignored files, so a new worktree has no dependencies, shares the main folder's ports and database, and looks like every other VS Code window. `gam-engineering/tools/worktree-setup.mjs` (P-WS-13) makes it ready: the session calls it after `git worktree add` ([Worktrees for subagents](#worktrees-for-subagents)), an Orca workspace runs it as [Orca](#orca) says, and the developer runs it by hand in a worktree made by hand. It does not create the worktree. Run it inside the worktree; `--dry-run` prints what each step would do and writes nothing.

| Step | What it does |
| --- | --- |
| 1 Number | The main folder has number 0 and is left untouched. Every other worktree gets the lowest free number from 1, recorded in `gam-worktrees.json` in the common git folder; the number is free again when `git worktree list` no longer shows its worktree |
| 2 Copy | The files of `.worktreeinclude` |
| 3 Ports and database | Only with `worktree.json` (below); written into the worktree's env file |
| 4 Install | The package manager the project has, found by the lock file of each folder: `pnpm-lock.yaml`, `package-lock.json`, `yarn.lock`, `bun.lock`, `uv.lock`, `requirements.txt` (the same detection `render-ci` uses). For pnpm and yarn, `corepack enable` runs only when the manager is not on the PATH, since it needs write rights in the Node folder; when it fails, the script says to install the manager (the CI line keeps `corepack enable`, QA0062). `install` in `worktree.json` replaces the detection. Afterwards one warning for a folder with `prisma/schema.prisma` whose `postinstall` does not run `prisma generate` (QA0063) |
| 5 Workspace file | `<branch-slug>.code-workspace` with a title-bar color picked by the branch name, git-ignored through `*.code-workspace`; open it instead of the folder to tell the windows apart. The main folder gets none, and the committed `.vscode/settings.json` is not touched |
| 6 Warnings | One line for each Playwright configuration with `reuseExistingServer: true`, a literal `port:` or `localhost:<digits>`, and each Cypress configuration with a literal `baseUrl` on `localhost:<digits>`. No project file is changed |

**The block scheme.** The project file `gam-engineering/worktree.json` names the variables; every key is optional:

```json
{
  "envFile": ".env",
  "ports": { "PORT": 3000, "VITE_PORT": 5173 },
  "suffix": ["DATABASE_URL"],
  "values": { "TEST_SUFFIX": "wt{n}" },
  "install": [{ "cwd": "frontend", "command": "pnpm install --frozen-lockfile" }]
}
```

- A variable of `ports` is set to base + number × 100, so worktree 2 runs on 3200 and 5373 and two dev servers never meet.
- A variable of `suffix` gets `-wt<number>` before the file extension of a file path or URL path (`file:./dev.db` becomes `file:./dev-wt2.db`, `postgres://u@h/app` becomes `postgres://u@h/app-wt2`), so two worktrees never migrate or seed the same database. `suffix` changes the database name, not a schema name; a database separated only by a schema is not isolated by this.
- The value is taken from the worktree's env file, which `.worktreeinclude` copied (`.env.local` is in the template too; `envFile` names it). A variable in neither list is not changed. The env file must be git-ignored; otherwise the script writes nothing into it and exits with 1.
- A variable of `values` is set to its template with `{n}` replaced by the number (`wt{n}` becomes `wt2`), replacing its line or appending one, so a project can steer its own isolation through a variable of its own.
- `install` is a list of `{ "cwd": "<folder>", "command": "<line>" }`; an empty list means no install. Without `worktree.json` the script copies and installs, and ports, database, and env file stay as they are.
- The script checks the form of these keys before step 3: `ports` an object of numbers, `suffix` a list of variable names, `values` an object of strings, `install` a list of `{ cwd?, command }`, `envFile` a string. A wrong form names the key and the expected form and exits with 1 after the other steps ran; the env file is not written. Other top-level keys are ignored, but a project keeps data of its own under a name of its own, never under one of these keys (PowerFlow had its own object under `suffix`).
- A second run keeps the number and the values.

**Test rules** (P-WS-13). They hold in every worktree and for every subagent:

- Run tests once and to the end, never in watch mode (`vitest run`, `jest --ci`, not `vitest` alone).
- A test never attaches to a server it did not start: Playwright `reuseExistingServer` is `false`, and a test never talks to a port another worktree may hold.
- A test uses no fixed port, shared temp file, or shared database: it takes the port from the env variable of `worktree.json` `ports`, its own `os.tmpdir()` folder, and the database name with the suffix.
- Tests can run in parallel, within one suite and across worktrees; a test that needs one at a time is a defect to fix, not a reason to serialize the suite. `setup` and `pipeline` propose the parallel form of the test command ([setup](../../gam-setup/references/setup.md#parallel-tests), [pipeline](../../gam-setup/references/pipeline.md#parallel-tests)).

The pipeline's own `--jobs` stays as it is when several worktrees check at the same time.

## Pipeline and chat export in a worktree

- The local pipeline mounts the common git folder at its own path next to the worktree, so container checks see `.gitignore` decisions in a worktree too (Q473).
- A commit exports only the chat sessions whose working folder is this worktree. The main folder also exports the sessions of worktrees that no longer exist. `next-q` gives each checkout its own letter (`A` the main folder, `B`, `C`, … a linked worktree, from its number in `gam-worktrees.json`) and reserves each number per letter in the common git folder, so parallel sessions never get the same `Q<n>` and the number names the worktree that asked, e.g. `QB0007` (Q474, Q586–Q588).
