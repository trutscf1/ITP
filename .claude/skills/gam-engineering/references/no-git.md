# Projects without git

Read in every session whose project folder is not a git repository (core rule 3 of [SKILL.md](../SKILL.md#before-anything-else)), and by every command that replaces a git step.

A project folder that is not a git repository runs the same flow without the git parts (P-GIT-7). Goal, grilling, concept documents, work items, question logs, the Definition of Done, and the status discipline (P-ROAD-4) are unchanged.

Whether git is there is checked in every session ([Before anything else](../SKILL.md#before-anything-else), rule 3) and never taken from a document. The line *Version control* in `gam-ai-knowledge/WORKFLOW.md` only records whether git was already offered:

| Git repository | *Version control* line | What to do |
| --- | --- | --- |
| no | missing | Ask once, as a `Q<n>`: **Create a git repository** (recommended) or **Work without git**. On the first, run `git init`, commit the existing files as the first commit on `main`, create `dev` from it (not in branch model `trunk`, P-GIT-9), and continue in the git flow. Write the answer into the line — at setup together with `WORKFLOW.md`. |
| no | `none` | Work without git. Do not ask again. |
| yes | `none` | State the switch as an assumption `A<n>`, set the line to `git`, and work in the git flow from now on. Catch up what setup skipped: `main` and `dev`, the tracker host ([references/setup-tracker.md](../../gam-setup/references/setup-tracker.md)), setup step 6, the question of step 7, and the CI job of step 10. Open local issue files stay valid until then. |
| yes | `git` or missing | Git flow. |

Without git, each git step is replaced as follows:

| Git flow | Without git |
| --- | --- |
| Work, concept, and chore branches (P-GIT-1, P-GIT-2, P-GIT-6) | None; files are edited in place. |
| Commits with requirement IDs (P-GIT-4) | None; the trace is the log entry in `ROADMAP-DETAILS.md`, which names the story and the requirement IDs it implemented. |
| Tracker on GitLab or GitHub (P-TRK) | Local markdown issues ([templates/agents/issue-tracker-local.md](../templates/agents/issue-tracker-local.md)), chosen without a question. |
| MR and its description (P-MR-1) | `## Changes` in the issue file: what changes for the user, the files touched, the tested functions, the consistency-check result. |
| `review <MR>` against the merge base | `review <issue>`: `gam-v-code-review` on the files listed under `## Changes`, plus the two profile axes; the result is recorded under `## Review` in the issue file and takes the reviewer's place (P-MR-2). |
| `revise` | Not available; findings are fixed in the implement loop. |
| `merge <MR>` under the merge policy (P-MR-4…6) | `merge <issue>`, the close step: run `review` if no clean one is recorded, check P-MR-3 without the pipeline, set the issue to `Status: done`, update the status (P-ROAD-4). No question is asked and the merge keys are not read. |
| `release`, tag, release MR (P-VER-1, P-MR-5) | Not available; the command says so and stops. |
| `gam-engineering/tools/merge.ps1`, `gam-engineering/tools/MERGING.md` | Not copied. |
| `node gam-ai-knowledge/tools/doc-check.mjs --status`, the CI job | Skipped; `node gam-ai-knowledge/tools/doc-check.mjs` without `--status` and the markdown lint still run. |
| Team mode (P-TEAM) | Not available; `team` says that it needs git and stops. |
| ROADMAP stage `in dev` | Reached when the feature's last story is closed; `released` is never set. |

The settings file is written from the template as it is: the merge guard and the status hook do nothing without git, and a later switch to git starts at the safe default `ask`.
