# Parallel sessions

How the memory works when several agent sessions run on one repository at the same time, each in its own git worktree: Orca workspaces, Claude Code sessions in worktrees, or gam-engineering's `implement-all`. Shared files would be overwritten by whichever session wrote last, so each session keeps its own **branch memory file** and the shared files change only on the integration branch. The process rules (independence, merge lock, cleanup) are gam-engineering's P-WS-13; this file holds only what the memory does.

## When a session uses its branch file

A session uses `gam-ai-memory/branches/<branch-slug>.md` (the branch name with every `/` as `-`) when it is on a work branch and either:

- its folder is a linked worktree: `git rev-parse --git-dir` differs from `git rev-parse --git-common-dir`; or
- the branch file already exists.

Otherwise, in a plain checkout or on the integration branch (`dev`, or `main` where there is no `dev`), the session uses the shared files as [session.md](session.md) describes.

## What each side writes

| File | Session on a work branch (branch file in use) | Session on the integration branch, and the merge |
| --- | --- | --- |
| `branches/<branch-slug>.md` | Owns it: task, baseline, next step, what the merge must write, open questions ([template](../templates/gam-ai-memory/templates/BRANCH_TEMPLATE.md)) | Folded in at the merge, then deleted |
| `CURRENT_TASK.md`, `AI_HANDOVER.md`, `PROJECT_STATE.md` | Read only | Written |
| `SESSION_LOG.md` | Read only | One entry per merged branch, from its branch file |
| `KNOWN_ISSUES.md` | Read only; new entries go to *For the merge* of the branch file | Entries copied in at the merge |

A session never writes another branch's file.

## Start

Read `CLAUDE.md`, then the branch file instead of `AI_HANDOVER.md` and `CURRENT_TASK.md`, then `PROJECT_STATE.md` and `KNOWN_ISSUES.md` for the shared picture. Without a branch file yet, create it from the template and record the baseline: the integration tip the branch started from, a clean tree, and the project's short test. Where the project has `gam-engineering/tools/worktree-setup.mjs`, run `node gam-engineering/tools/worktree-setup.mjs` in the worktree before the baseline (gam-engineering P-WS-13): it copies the ignored files, installs the dependencies, and gives the worktree its own ports, so the short test can run. Note the worktree number it prints in the branch file; when it exits with an error, record that as a red baseline and stop.

## Handover and recover

Overwrite the branch file instead of steps 2–6 of [Handover](session.md#handover); a recovered branch file says so in its first line. Transcripts count only when they belong to this worktree: the chat export in a worktree writes only that worktree's sessions, and a raw transcript is used only when its working folder is this worktree.

## Sync

A session with a branch file in use runs no **sync**: it writes nothing and says so. The merging session syncs after the merge ([At the merge](#at-the-merge)).

## At the merge

The session that merges the branch, after the merge and on the integration branch:

1. Insert one `SESSION_LOG.md` entry from the branch file (branch, commits, done, decided, next).
2. Copy *For the merge* → *Known issues* into `KNOWN_ISSUES.md`; the status and inbox lines go to the knowledge folder through the gam commands ([gam-interop.md](gam-interop.md)).
3. Update `CURRENT_TASK.md` and `PROJECT_STATE.md` where the merged work changed them.
4. Run **sync** ([session.md](session.md#sync)) once the branch file is folded in: it ticks the finished steps, sets the next action, and adds the merge line to the session's entry (gam-engineering P-DOC-13).
5. Delete the branch file and commit with the status of the merge.

A branch that is dropped without a merge keeps its file until the developer decides; **check** names it.
