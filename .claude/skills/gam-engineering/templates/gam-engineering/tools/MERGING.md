# Merging by hand

How to merge a work branch into `dev` and how to release `dev` to `main` yourself, without an AI agent — for every developer of this repo. The rules behind it are in `gam-ai-knowledge/WORKFLOW.md` (*Branches*, *Merge requests*, *Definition of Done*, *Releases*); this guide only shows the hands-on steps. The script [merge.mjs](merge.mjs) in this folder (Node, the same on Windows, macOS, and Linux) does the git part for you.

**Branch model `trunk`** (*Branch model* in `WORKFLOW.md`, P-GIT-9): there is no `dev`. Read every `dev` in the work-branch steps below as `main`, and release as [Release in branch model trunk](#release-in-branch-model-trunk) says. The script reads the branch model itself.

## When you merge by hand

- You answered **I merge myself** when an agent offered a merge (merge policy `ask`).
- You work without an agent, or the agent is not available.
- You are the person allowed to merge to `main` (*Branches* in `WORKFLOW.md`) and cut a release.

Two rules always hold, by hand as well:

- **Merge commits only.** Never squash or rebase into `dev` or `main`; the requirement IDs in the single commits must stay in the history.
- **Nobody merges their own MR without a review.** Another person checked the acceptance criteria and the Definition of Done and left a comment on the content.

## Before every merge

Check the Definition of Done in `gam-ai-knowledge/WORKFLOW.md`. In short:

1. Every acceptance criterion `AC-n.m` of the issue has a passing test carrying its ID.
2. The pipeline of the MR is green, or not due at this merge (`node gam-engineering/tools/pipeline.mjs due merge-dev`, P-PIPE-8); no review thread is open.
3. A person other than the author reviewed the MR and commented.
4. The concept document and the status are updated in the MR: position row, ROADMAP stage, the story's `status` with its rows in `work-items/BACKLOG.md` and the sprint file.
5. `node gam-ai-knowledge/tools/doc-check.mjs` (in a project not yet moved: `gam-engineering/tools/doc-check.mjs`) reports no error.

If one point fails, do not merge. Fix it on the branch first.

## Work branch into `dev`

Pick one of three ways. All of them produce the same result: a merge commit on `dev`, and the work branch deleted.

### Way 1 — in the web interface (recommended)

GitLab:

1. Open the merge request (*Code → Merge requests*). The target must be `dev`.
2. Check: pipeline passed (or not due, P-PIPE-8), approvals present, all threads resolved.
3. Make sure **Squash commits** is **off** and **Delete source branch** is **on**.
4. Click **Merge**.

GitHub:

1. Open the pull request (*Pull requests*). The base must be `dev`.
2. Check: checks passed, review approved, all conversations resolved.
3. In the merge button's menu, choose **Create a merge commit** — not *Squash and merge*, not *Rebase and merge*.
4. Click **Merge pull request**, then **Delete branch**.

### Way 2 — with the script

From the repo root, in any shell:

```bash
# MR/PR is merged on GitLab/GitHub (needs glab or gh, logged in) - works with protected branches
node gam-engineering/tools/merge.mjs feature/12-login --via Host

# merged on your computer and pushed - only where dev accepts a direct push
node gam-engineering/tools/merge.mjs feature/12-login
```

The script stops on uncommitted changes, asks you to confirm the Definition of Done, runs `gam-ai-knowledge/tools/doc-check.mjs` on the merge result (local way), aborts cleanly on a merge conflict, and deletes the branch locally and on `origin`. Add `--yes` to skip the confirmations, `--skip-doc-check` to leave out the doc check. Without a console to answer on (input redirected, as in an agent run) the script never waits for an answer: it stops at once unless `--yes` is given. The options are also read the PowerShell way (`-Via Host`, `-Yes`, `-Branch <branch>`, `-Release <version>`), in any case. With `--via Host` it reports *Merged* only when the host says the MR/PR is merged: a merge the host only scheduled (GitLab *Will auto-merge* while the pipeline runs) is waited for up to `--wait-seconds` (default 900, checked every `--poll-seconds`, default 15); if it is still open then, the script says *Not merged yet* and ends with exit code 3 — wait for the host and do the steps after the merge only once it is merged. The script appends everything it prints, and every error, to `gam-engineering/reports/merge.log` (a git-ignored folder; `--log-file <path>` changes it, `--log-file=` with no value switches it off). It stops a local merge when the branch is behind the integration branch (*is behind …*), so the merge never produces a state no pipeline ran on. It also stops before the merge when a commit message would close an issue once it reaches `main` — a keyword such as *close*, *fix*, *resolve*, or *implement* before `#<n>` (P-GIT-10); reword the commit, or add `--allow-closing-keywords` when closing is meant.

**From a git worktree** (Orca, `implement-all`, P-WS-13): the script never switches branches in the folder you run it from. It merges in the worktree that holds `dev` (or `main`), which must be clean, or, when no worktree holds it, in a temporary worktree it removes again. A work branch still checked out in a worktree is kept locally (remove the worktree, then the branch); the branch on `origin` is deleted. Only one merge or release runs at a time: the lock `gam-merge.lock` in the common git folder (`git rev-parse --git-common-dir`) stops a second one with *Another merge is running*; a lock older than 30 minutes, or one whose process is gone, is taken over.

### Way 3 — plain git

Only where `dev` is not protected. Run it in the folder that holds `dev` (`git worktree list` shows it); from another worktree, put `git -C <that folder>` before each command instead of switching:

```powershell
git fetch origin --prune
git switch dev
git merge --ff-only origin/dev
git merge --no-ff origin/feature/12-login
node gam-ai-knowledge/tools/doc-check.mjs
git push origin dev
git branch -d feature/12-login
git push origin --delete feature/12-login
```

`--no-ff` forces the merge commit even where git could fast-forward.

## Release: `dev` into `main`

A release is the only way anything reaches `main`.

1. **Choose the version** by the rule in `gam-ai-knowledge/VERSIONING.md`: PATCH for fixes only, MINOR for new features, MAJOR when existing use breaks. A MAJOR version, including `0.x` → `1.0.0`, is agreed with the team first. Then set every version file that has a version field (`package.json`, `pyproject.toml`, `*.csproj`, …) to the new version and commit it on `dev` as `release: v0.3.0`, so the tag points at the released version (P-VER-4).
2. **Check every story since the last release** met the Definition of Done, and the pipeline on `dev` is green.
3. **Write the release notes**: one line per closed story with its ID and title, e.g. `QE-US-3 Reuse questions: copy with duplicate check`. Save them as a markdown file, e.g. `notes.md` (do not commit it).
4. **Merge, tag, and publish** — with the script:

   ```bash
   node gam-engineering/tools/merge.mjs --release 0.3.0 --via Host --notes-file notes.md
   ```

   It opens the release MR/PR `dev` → `main` if there is none, merges it with a merge commit, creates the annotated tag `v0.3.0` on `main`, pushes it, and publishes the release on the git host with your notes. Without `--via Host` it merges locally and pushes `main` — only where `main` is not protected. Without `--notes-file` it writes a draft from the merge commits; edit the release on the host afterwards.

   By hand instead: open an MR/PR from `dev` to `main` titled `Release v0.3.0`, merge it with a merge commit (keep `dev` — never delete it), then:

   ```powershell
   git fetch origin
   git switch main            # or git -C <folder that holds main> for each command
   git merge --ff-only origin/main
   git tag -a v0.3.0 -m "Release v0.3.0"
   git push origin v0.3.0
   ```

   and create the release for the tag in the web interface (*Deploy → Releases* on GitLab, *Releases → Draft a new release* on GitHub) with the notes.

## Release in branch model trunk

There is no release merge: the release is the tag on the current `main`. Steps 1–3 above apply with `main` in place of `dev`; then tag and publish with the script, which only tags in trunk mode:

```bash
node gam-engineering/tools/merge.mjs --release 0.3.0 --notes-file notes.md
```

By hand: the `git fetch` … `git push origin v0.3.0` commands above, then the release in the web interface.

## After the merge

The script prints what is left. If the MR did not already carry the status, update it now in a small follow-up MR to `dev`:

- After a work merge: close the position row in `ROADMAP-DETAILS.md` (or your `STATUS.md`) with a log entry; set the story to `status: done` with its rows in `work-items/BACKLOG.md` and the sprint file; set the ROADMAP stage to `in dev` once the epic's last story is merged; close the issue if the host did not (hosts close issues automatically only on the default branch, which is `main`), and the epic issue after its last story.
- After a release: ROADMAP stage `released` for every included feature; `shipped: "v<version>"` in the `epic.md` of every completed epic; position rows closed, log entry added.
- Then `node gam-ai-knowledge/tools/doc-check.mjs --status` must report no `STATUS` error.

## When something goes wrong

| Message | What to do |
| --- | --- |
| *running scripts is disabled on this system* | You started the old PowerShell wrapper. Call the script itself, which needs no execution policy: `node gam-engineering/tools/merge.mjs ...`. |
| *Push refused — dev is probably protected* | Undo the local merge with `git reset --hard origin/dev` and use `--via Host` or the web interface. |
| *Merge conflict* | The script has already aborted the merge. Merge `dev` into your work branch, resolve the conflict there, push, wait for the pipeline, and merge again. |
| *The host refused the merge* | Approval missing, pipeline red, threads open, or no open MR/PR for the branch. Fix that on the host; nothing was merged. |
| *Not merged yet: the host has scheduled …* (exit code 3) | The host merges when its pipeline is green. Check the MR/PR on the host; run the steps after the merge once it is merged. |
| *is behind main* (or `dev`) | The branch lacks commits of the integration branch. Run `git merge origin/<integration branch>` on the branch, resolve conflicts there, run the pipeline, push, and run the script again. |
| *These commit messages would close issues …* | A commit message names an issue after a closing keyword (P-GIT-10). Reword it on the branch (`git commit --amend` for the last commit, before it is pushed), name the issue as `next: issue #2`, or add `--allow-closing-keywords` when the commit is meant to close it. |
| *No console to answer …* | The script runs without a console (an agent run). Check the Definition of Done, then run it again with `--yes`. |
| *needs the 'glab' / 'gh' CLI* | Install [glab](https://gitlab.com/gitlab-org/cli) or [gh](https://cli.github.com/) and log in (`glab auth login`, `gh auth login`), or use the web interface. |
