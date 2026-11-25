# Cleanup

Loaded by `/gam-engineering cleanup` (skill `gam-delivery`, P-WS-13, QC0004–QC0010), by step 7 of [merge](merge.md), and through the hint line of [detect](../../gam-engineering/references/detect.md). It removes what finished parallel sessions left behind: merged worktrees, their empty folders, and merged work branches, locally and on `origin`. A session's own worktree stays the last step of [merge](merge.md); the rules of [Parallel sessions: Cleanup](../../gam-engineering/references/parallel.md#cleanup) hold throughout.

## What the script decides

`node gam-engineering/tools/worktree-cleanup.mjs` (P-WS-14) fetches `origin` with `--prune`, then checks every linked worktree, every local branch except the integration branches (`main`, `dev`), and every branch on `origin` without a local one. Merged means the branch tip is contained in the integration branch (`main` under `trunk`); a branch on `origin` is deleted only when its tip is contained in `origin/<integration branch>`.

| Found | What happens |
| --- | --- |
| Merged, clean worktree without activity for 10 minutes | Removed: an Orca workspace with `orca worktree rm --worktree path:<path> --delete-branch --json` (`orca-ide` on Linux, where `orca` is the screen reader; only when that CLI is installed, else `git worktree remove`; each Orca call ends after 30 seconds), any other with `git worktree remove <path>`; then `git branch -d`, an empty folder left behind, and the branch on `origin` |
| Merged, clean worktree with activity in the last 10 minutes | Kept as active; once its merge is 60 minutes or more old, listed under *Ask* |
| Merged worktree with uncommitted or untracked files | Kept as unclean |
| Worktree whose branch has no own commit (fresh) | Kept as fresh: a session has just started there |
| Unmerged worktree or branch | Kept as open, with commits ahead of the integration branch, pushed state, changes, and the position (the first line under *Next step* of `gam-ai-memory/branches/<branch-slug>.md`) |
| Merged or fresh branch that no worktree holds | `git branch -d` and the branch on `origin` |
| Merged branch only on `origin` | `git push origin --delete <branch>` |
| Empty folder at a path of `gam-worktree-history.json`, or empty in the Orca workspace folder of the repo | Removed with a non-recursive `rmdir` |
| The main folder, the worktree the script runs in, a locked or detached worktree | Kept, with the reason |

Activity is the newest of the tip's commit time, the last git operation in the worktree (the mtime of its `index`), and Orca's last output for the workspace. Nothing is ever forced: no `--force`, no `git branch -D`, no recursive delete. `--dry-run` lists without changing anything, `--summary` prints one line or nothing, `--json` prints the report as one object; `--idle-minutes` and `--ask-minutes` change the 10 and 60 minutes. Exit 1 means a removal step failed.

## Procedure

1. Run `node gam-engineering/tools/worktree-cleanup.mjs`, its full output logged per P-WS-11 (rule 9 of the core). The script removes directly; there is no confirmation before it (QC0004).
2. For each entry under *Ask*, one `Q<n>` pop-up per worktree with the fixed options **Ja, löschen** and **Nein** (QC0005; like the merge pop-up, without *None of these*): the first runs `node gam-engineering/tools/worktree-cleanup.mjs --confirm <path>`, which removes it under the same checks; the second runs `--snooze <path>`, so the script asks again at the earliest 60 minutes later (QC0005). Removing an Orca workspace ends the session running in it; the description says so.
3. For each worktree kept as unclean, ask the `Q<n>` of [Parallel sessions: Cleanup](../../gam-engineering/references/parallel.md#cleanup) (commit to the branch, move into the main folder, delete) (SP-9).
4. Report in a few lines what was removed and every open worktree and branch with its state, so the developer sees at a glance what is unfinished. A failed removal is named with its message.
