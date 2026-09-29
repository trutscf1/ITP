# Git Workflow – Command Reference

This guide contains every command needed for the project workflow defined in
[anforderungen_software_projekte.md](anforderungen_software_projekte.md).
Each command is explained together with its important options.

Tool rule used in this guide:

- **git** is used for everything that Git itself can do.
- **glab** (GitLab CLI) is only used for GitLab features that Git cannot
  handle: issues, merge requests, reviews, merging, time tracking, pipelines,
  releases, labels, milestones and project settings.
- Everything shown with glab can also be done in the GitLab web interface.

Example values used throughout this guide:

- Issue number: `12`
- Merge request number: `5`
- Feature branch: `feature/12-add-login`
- Sprint milestone: `Sprint 2`
- Release version: `v1.0.0`

## Contents

- [Workflow at a Glance](#workflow-at-a-glance)
- [1. One-Time Setup](#1-one-time-setup)
- [2. Project Setup (once per project)](#2-project-setup-once-per-project)
- [3. Plan the Work: Issues](#3-plan-the-work-issues)
- [4. Start an Issue: Feature Branch](#4-start-an-issue-feature-branch)
- [5. Work: Inspect, Stage, Commit](#5-work-inspect-stage-commit)
- [6. Push the Feature Branch](#6-push-the-feature-branch)
- [7. Stay Up to Date with dev](#7-stay-up-to-date-with-dev)
- [8. Merge Request](#8-merge-request)
- [9. Time Tracking](#9-time-tracking)
- [10. Review](#10-review)
- [11. Merge into dev](#11-merge-into-dev)
- [12. Next Issue and Branch Overview](#12-next-issue-and-branch-overview)
- [13. Set Work Aside: git stash](#13-set-work-aside-git-stash)
- [14. Undo Things](#14-undo-things)
- [15. Release: dev to main](#15-release-dev-to-main)
- [16. Team Example: One Maintainer, Several Developers](#16-team-example-one-maintainer-several-developers)
- [17. Best Practices for This Workflow](#17-best-practices-for-this-workflow)
- [18. GitLab to GitHub Mirror](#18-gitlab-to-github-mirror)
- [19. Quick Reference](#19-quick-reference)
- [20. Checklist Before an Issue Is Done](#20-checklist-before-an-issue-is-done)

## Workflow at a Glance

```text
Issue -> Feature Branch -> Commits -> Push -> Merge Request -> Review
      -> Merge into dev -> Release MR (dev -> main) -> Tag -> GitLab Release
```

```text
main            o-----------------------o-------   releases only
                 \                     /
dev               o----o---------o----o---------   integration branch
                        \       /
feature/12-...           o--o--o                   one branch per issue
```

| Step | Tool | Main commands |
| --- | --- | --- |
| Create issue | glab | `glab issue create` |
| Create feature branch | git | `git switch -c` |
| Commit and push | git | `git add`, `git commit`, `git push` |
| Create merge request | glab | `glab mr create` |
| Record time | glab | `glab issue note` / `glab mr note` |
| Review and approve | git + glab | `git diff`, `glab mr approve` |
| Merge into `dev` | glab | `glab mr merge` |
| Tag release | git | `git tag -a`, `git push origin <tag>` |
| Publish release | glab | `glab release create` |

Binding rules:

- Every change starts with an issue.
- Feature branches are created from `dev` and merged back into `dev`.
- `main` only receives merges from `dev` as part of a release.
- No direct commits or pushes to `dev` or `main`.
- Do not squash merges. Do not delete feature branches. Never delete `dev`.
- A person other than the merge request author reviews and merges.
- Record time in entries of at most 50 minutes.

## 1. One-Time Setup

### 1.1 Check the Git Version

```bash
git --version
```

Some options in this guide need Git 2.37 or newer (for example
`push.autoSetupRemote`). Update Git if your version is older.

### 1.2 Set Your Identity

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Every commit stores this name and email. Use the email of your GitLab account
so GitLab links the commits to your profile.

- `--global` – value applies to all repositories of your user account.
- without `--global` – value applies only to the current repository.
- `--get <key>` – reads a value: `git config --global --get user.email`.
- `--list --show-origin` – lists all settings and the file they come from.

### 1.3 Recommended Git Settings

```bash
git config --global init.defaultBranch main
git config --global pull.ff only
git config --global push.autoSetupRemote true
git config --global fetch.prune true
git config --global core.editor "code --wait"
git config --global merge.conflictStyle zdiff3
```

- `init.defaultBranch main` – new repositories start with `main`.
- `pull.ff only` – `git pull` only fast-forwards and never creates surprise
  merge commits. If it fails, the branches have diverged and you decide how
  to integrate (section 7).
- `push.autoSetupRemote true` – the first `git push` of a new branch creates
  the remote branch and sets it as upstream automatically.
- `fetch.prune true` – every fetch removes stale remote-tracking references
  (`origin/...`). Your local branches are never deleted by this.
- `core.editor "code --wait"` – VS Code opens for commit messages.
- `merge.conflictStyle zdiff3` – conflict markers also show the original
  version, which makes conflicts easier to understand.

### 1.4 Line Endings on Windows

```bash
git config --global core.autocrlf true
```

- `true` (Windows) – stores LF in the repository, checks out CRLF locally.
- `input` (macOS/Linux) – converts CRLF to LF on commit only.

Better: commit a `.gitattributes` file so the rule applies to the whole team:

```text
* text=auto eol=lf
*.bat text eol=crlf
*.ps1 text eol=crlf
```

### 1.5 SSH Key for GitLab

```bash
ssh-keygen -t ed25519 -C "you@example.com"
cat ~/.ssh/id_ed25519.pub
ssh -T git@gitlab.com
```

- `ssh-keygen -t ed25519` – creates a modern key pair; `-C` adds a comment
  so you recognise the key later. Use a passphrase when asked.
- `cat ~/.ssh/id_ed25519.pub` – prints the public key. Add it in GitLab under
  **User settings > SSH Keys**. Never share the private key (file without
  `.pub`).
- `ssh -T git@gitlab.com` – tests the connection; a welcome message with your
  username means it works.

### 1.6 Install and Log In to glab

Git cannot talk to the GitLab API, so issues, merge requests and releases
need glab. Install it (Windows: `winget install glab.glab`, macOS:
`brew install glab`), then log in:

```bash
glab auth login
glab auth status
```

- `glab auth login` – interactive login. Choose `gitlab.com`, then log in via
  web browser or paste a personal access token (scopes `api` and
  `write_repository`).
- `glab auth login --hostname gitlab.example.com` – for a self-hosted GitLab.
- `glab auth status` – shows which account glab uses.

glab reads the project from the `origin` remote of the current folder, so run
glab commands inside the cloned repository. `-R group/project` selects another
project explicitly.

### 1.7 Clone the Repository

```bash
git clone git@gitlab.com:group/project.git
cd project
```

Copies the repository including its history and creates the remote `origin`.
Copy the URL from the **Code** button in GitLab.

- `git clone <url> <folder>` – clones into a folder with a different name.
- `--branch dev` – checks out `dev` directly after cloning.

You clone only once; later you keep working in the existing folder.

### 1.8 Inspect and Change Remotes

```bash
git remote -v
git remote set-url origin git@gitlab.com:group/new-project.git
```

- `git remote -v` – lists remotes with fetch and push URLs.
- `git remote set-url <name> <url>` – changes the URL, for example when
  switching from HTTPS to SSH or after the project was moved.

## 2. Project Setup (once per project)

Only one team member does this, usually the project lead.

### 2.1 Create the GitLab Project (glab – Git cannot create projects)

```bash
glab repo create group/project --private --description "Project name"
```

- `--private` / `--internal` / `--public` – visibility of the project.
- `--description` – short project description.
- Without a group (`glab repo create project`) the project is created in
  your personal namespace.

### 2.2 Initial Commit and dev Branch (git)

```bash
git init
git add .
git commit -m "Initial project setup"
git remote add origin git@gitlab.com:group/project.git
git push -u origin main
git switch -c dev
git push -u origin dev
```

- `git init` – creates a new repository in the current folder.
- `git remote add <name> <url>` – connects the repository with GitLab.
- `git push -u origin main` – publishes `main`; `-u` sets the upstream.
- `git switch -c dev` – creates the integration branch `dev` from `main`.
- `git push -u origin dev` – publishes `dev`.

### 2.3 Project Settings (glab – GitLab settings, not Git)

These commands use `glab api`, which calls the GitLab REST API. `:id` is
replaced by glab with the ID of the current project.

Default branch `dev`, merge commits, no squash, keep source branches:

```bash
glab api projects/:id -X PUT \
  -f default_branch=dev \
  -f merge_method=merge \
  -f squash_option=never \
  -F remove_source_branch_after_merge=false
```

- `-X PUT` – HTTP method (update).
- `-f key=value` – sends a string field; `-F key=value` – sends a typed value
  (numbers, `true`/`false`).
- `default_branch=dev` – new merge requests target `dev`, and `Closes #12`
  closes issues when merging into `dev`.
- `merge_method=merge` – every merge creates a merge commit.
- `squash_option=never` – squashing is not possible.
- `remove_source_branch_after_merge=false` – *Delete source branch* is not
  preselected.

Protect `dev` and `main` (nobody pushes directly, developers may merge):

```bash
glab api projects/:id/protected_branches -X POST \
  -f name=dev -F push_access_level=0 -F merge_access_level=30
glab api projects/:id/protected_branches -X POST \
  -f name=main -F push_access_level=0 -F merge_access_level=40
```

- Access levels: `0` = no one, `30` = developers and maintainers,
  `40` = maintainers only.
- If `main` is already protected by default, remove it first with
  `glab api projects/:id/protected_branches/main -X DELETE` and create it
  again with the values above, or adjust it in
  **Settings > Repository > Protected branches**.

Optional merge checks:

```bash
glab api projects/:id -X PUT \
  -F only_allow_merge_if_pipeline_succeeds=true \
  -F only_allow_merge_if_all_discussions_are_resolved=true
```

### 2.4 Labels (glab)

```bash
glab label create --name feature --color "#428BCA"
glab label create --name bug --color "#D9534F"
glab label create --name documentation --color "#5CB85C"
glab label list
```

- `--name` – label name; `--color` – hex colour; `--description` – optional
  explanation.
- `glab label list` – shows all project labels.

### 2.5 Milestones for Sprints (glab)

```bash
glab api projects/:id/milestones -X POST \
  -f title="Sprint 2" -f start_date=2026-10-05 -f due_date=2026-10-18
glab api projects/:id/milestones
```

- `title` – name of the sprint; `start_date` / `due_date` – format
  `YYYY-MM-DD`.
- The second command lists all milestones (JSON output).

### 2.6 Issue Templates (git)

Issue templates are Markdown files in the repository, so they are created
with Git, for example `.gitlab/issue_templates/user_story.md`:

```bash
git switch -c feature/1-issue-templates
git add .gitlab/issue_templates/
git commit -m "Add issue templates (#1)"
git push -u origin feature/1-issue-templates
```

Merge request templates work the same way in `.gitlab/merge_request_templates/`.

## 3. Plan the Work: Issues

Issues exist only in GitLab, so they are handled with glab.

### 3.1 Create an Issue

```bash
glab issue create \
  --title "User can log in with email and password" \
  --description "Acceptance criteria: ..." \
  --label feature \
  --milestone "Sprint 2" \
  --weight 3 \
  --assignee @me
```

- `--title` / `--description` – title and text (user story, acceptance
  criteria). Without these flags glab asks interactively.
- `--label` – one or more labels, comma separated (`feature,frontend`).
- `--milestone` – sprint milestone by title.
- `--weight` – effort estimate (weight).
- `--assignee` – username(s); `@me` means yourself.
- `--template user_story` – starts from an issue template (if your glab
  version supports it); otherwise use the template in the web interface.
- `--web` – opens the issue form in the browser instead.

### 3.2 List, View and Update Issues

```bash
glab issue list --assignee=@me
glab issue list --milestone "Sprint 2" --label bug
glab issue view 12
glab issue view 12 --comments
glab issue view 12 --web
glab issue update 12 --label frontend --milestone "Sprint 3"
glab issue update 12 --assignee @username
```

- `list` – open issues; `--closed` / `--all` also shows closed ones.
- `view 12` – shows the issue; `--comments` includes the discussion;
  `--web` opens it in the browser.
- `update` – changes labels, milestone, assignee, title or description.
  `--unlabel <label>` removes a label.

### 3.3 Close or Reopen an Issue

```bash
glab issue close 12
glab issue reopen 12
```

Normally issues are closed automatically by `Closes #12` in the merge
request. Close manually only if that did not happen.

### 3.4 Bugs

Bugs and defects are issues too:

```bash
glab issue create --title "Date shown in wrong format" --label bug \
  --description "Steps to reproduce: ..." --milestone "Sprint 2"
```

## 4. Start an Issue: Feature Branch

Creating branches is a Git task, so git is used here.

### 4.1 Update dev and Create the Branch

```bash
git status
git switch dev
git pull
git switch -c feature/12-add-login
git push -u origin feature/12-add-login
```

- `git status` – must show no uncommitted changes before switching. If it
  does, commit them on their branch or stash them (section 13).
- `git switch dev` – changes to the integration branch.
- `git pull` – updates local `dev` from GitLab (fetch + fast-forward).
- `git switch -c <branch>` – creates a new branch from the current commit
  and switches to it. `-C` would overwrite an existing branch – avoid it.
- `git push -u origin <branch>` – publishes the branch so GitLab and the
  issue show it; `-u` links local and remote branch.

Variants:

- `git switch -c feature/12-add-login origin/dev` – creates the branch
  directly from the remote `dev` (after `git fetch origin`).
- `git checkout -b feature/12-add-login` – older equivalent of
  `git switch -c`.
- `git switch -` – switches back to the previous branch.

### 4.2 Branch Created in the GitLab Web Interface

If a team member created the branch from the issue (**Create merge request >
Create branch**, source `dev`), fetch it:

```bash
git fetch origin
git switch feature/12-add-login
```

- `git fetch origin` – downloads new branches, commits and tags without
  changing your files. `--prune` removes references to deleted remote
  branches; `--tags` also fetches all tags.
- `git switch <branch>` – if only `origin/<branch>` exists, Git creates a
  local branch that tracks it.

### 4.3 Branch Naming Convention

```text
feature/<issue-id>-<short-description>
```

- lowercase, words separated by hyphens, no spaces or umlauts
- examples: `feature/12-add-login`, `feature/23-profile-settings`
- bugs use the same pattern (or `bugfix/31-fix-date-format` if the team
  agreed on a separate prefix)

### 4.4 Check Where You Are

```bash
git branch --show-current
git status -sb
```

- `git branch --show-current` – prints the current branch name.
- `git status -sb` – short status (`-s`) with branch and ahead/behind
  information (`-b`).

## 5. Work: Inspect, Stage, Commit

### 5.1 git status – What Has Changed?

```bash
git status
git status -s
```

Shows the branch, staged changes, unstaged changes and untracked files.
`-s` shows a compact two-column view:

- `M` modified, `A` added, `D` deleted, `R` renamed, `??` untracked
- left column = staged, right column = not staged yet

### 5.2 git diff – What Exactly Has Changed?

```bash
git diff
git diff --staged
git diff --stat
git diff dev...feature/12-add-login
```

- `git diff` – changes that are **not staged** yet.
- `git diff --staged` (same as `--cached`) – what **will be committed**.
- `--stat` – summary per file (lines added and removed).
- `--word-diff` – highlights changed words instead of whole lines.
- `git diff <file>` – limits the output to one file.
- `git diff dev...feature/12-add-login` (three dots) – everything the
  feature branch changed since it branched off `dev` (the merge request
  view).

### 5.3 git add – Choose What Goes into the Commit

```bash
git add src/login/form.tsx
git add src/login/
git add -p
git add -u
git add -A
```

- `git add <file>` / `git add <folder>/` – stages a file or folder.
- `-p` (patch mode) – asks for every change block: `y` stage, `n` skip,
  `s` split, `q` quit. Ideal for clean, small commits.
- `-u` – stages changes and deletions of **tracked** files only.
- `-A` (or `git add .` in the root) – stages everything including new files.
  Check `git status` first so no secrets or build output are committed.

### 5.4 .gitignore – Never Commit These Files

Create `.gitignore` in the repository root **in the initial commit**, before
anybody creates a feature branch. Otherwise every branch commits its own
local files and they conflict later.

Rule of thumb:

- **Commit** everything a team member needs to install, build and run the
  project: source code, configuration, lockfile, schema and migrations.
- **Ignore** everything that is generated (`pnpm install`, `next build`,
  `prisma generate`, tests), everything personal (editor, operating system)
  and everything secret (`.env`, keys, certificates).

#### Commit or Ignore – Project Stack

The project stack from the requirements: Node.js 24, pnpm, Next.js 16
(App Router), React 19, TypeScript, Tailwind CSS 4, zod 4, better-auth,
Prisma, PostgreSQL 18, Docker, Traefik, Biome, GitLab CI.

Node.js and pnpm:

- commit: `package.json` – dependencies, scripts and the `packageManager`
  field; the central project file, never ignore it
- commit: `pnpm-lock.yaml` – exact versions for everybody
- commit: `pnpm-workspace.yaml` (if present) – workspace and build settings
- commit: `.nvmrc` or `.node-version` – Node.js version (`24`)
- commit: `.npmrc` – only if it contains **no** tokens
- ignore: `node_modules/` – created by `pnpm install`
- ignore: `package-lock.json`, `yarn.lock`, `bun.lockb` – wrong package
  manager; if they appear, someone used `npm install` by mistake

Next.js, React, TypeScript, Tailwind:

- commit: `src/` or `app/`, `public/`, `proxy.ts`
- commit: `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`
- ignore: `.next/` – build output and cache of `next dev` / `next build`
- ignore: `out/` – output of a static export
- ignore: `next-env.d.ts` – regenerated by Next.js on every `dev` and
  `build`
- ignore: `*.tsbuildinfo` – TypeScript incremental build cache
- ignore: `.vercel/` – local Vercel link (if Vercel is used)

Prisma, better-auth, PostgreSQL:

- commit: `prisma/schema.prisma` – database schema
- commit: `prisma/migrations/` – all migrations including
  `migration_lock.toml`
- commit: `prisma.config.ts` (if present) and seed scripts
- commit: the better-auth configuration (for example `src/lib/auth.ts`)
- ignore: the generated Prisma client – the folder set as `output` in the
  `generator` block, for example `src/generated/prisma/`; it is recreated
  by `pnpm prisma generate`
- ignore: local database data, for example `postgres-data/`

Validation and API:

- commit: the shared zod schemas (client and server use the same file)
- ignore: a generated OpenAPI file (for example `openapi.json`) if it is
  created during the build; commit it only if it is maintained by hand or
  the team agreed to version it

Docker and Traefik:

- commit: `Dockerfile`, `docker-compose.yml`, `.dockerignore`
- commit: the Traefik configuration (for example `traefik/traefik.yml`)
- ignore: `docker-compose.override.yml` – personal local overrides
- ignore: `acme.json` / `letsencrypt/` – Let's Encrypt certificates and
  **private keys**
- ignore: Docker volume folders with data (`docker-data/`)

Quality, tests, CI:

- commit: `biome.json`, `.editorconfig`, `.gitattributes`, `.gitlab-ci.yml`
- commit: test files and test configuration (for example
  `vitest.config.ts`, `playwright.config.ts`)
- ignore: `coverage/`, `playwright-report/`, `test-results/`
- ignore: `*.log`

Environment and secrets:

- commit: `.env.example` – all variable names with dummy values
- ignore: `.env`, `.env.local`, `.env.production` and all other `.env.*`
- ignore: `*.pem`, `*.key`, `*.p12` – certificates and keys

Editor and operating system:

- commit: `.vscode/extensions.json` – recommended extensions
- ignore: all other files in `.vscode/`, `.idea/`
- ignore: `.DS_Store`, `Thumbs.db`, `desktop.ini`

#### .gitignore Template

```gitignore
# ---------- Dependencies ----------
node_modules/
.pnpm-store/

# Only pnpm is used: lockfiles of other package managers must not appear
package-lock.json
yarn.lock
bun.lockb

# ---------- Next.js / TypeScript ----------
.next/
out/
next-env.d.ts
*.tsbuildinfo
.vercel/

# ---------- Generic build output and caches ----------
dist/
build/
.turbo/
.cache/

# ---------- Prisma ----------
# Generated client: adjust to the "output" path in prisma/schema.prisma
src/generated/prisma/
generated/prisma/

# ---------- Tests and coverage ----------
coverage/
playwright-report/
test-results/
blob-report/

# ---------- Logs ----------
*.log
npm-debug.log*
pnpm-debug.log*

# ---------- Environment variables and secrets ----------
.env
.env.*
!.env.example
*.pem
*.key
*.p12

# ---------- Docker / Traefik ----------
docker-compose.override.yml
docker-data/
postgres-data/
acme.json
letsencrypt/

# ---------- Local databases ----------
*.sqlite
*.db

# ---------- Editors and IDEs ----------
.vscode/*
!.vscode/extensions.json
.idea/
*.swp
*~

# ---------- Operating system ----------
.DS_Store
Thumbs.db
desktop.ini
```

Keep the Docker build context clean as well with a `.dockerignore`, so
secrets and local build output never end up in an image:

```gitignore
node_modules/
.next/
.git/
.env
.env.*
!.env.example
coverage/
*.log
.vscode/
.idea/
```

Pattern syntax:

- one pattern per line; `#` starts a comment
- `name/` – a trailing `/` matches folders only
- `*.log` – `*` matches any characters except `/`
- `**/temp/` – `**` matches any number of folders
- `/build/` – a leading `/` matches only in the repository root
- `!pattern` – re-includes a file that an earlier pattern excluded

Check after the first `pnpm install`, `pnpm build` and
`pnpm prisma generate` that `git status` shows no generated files. If it
does, add the missing pattern to `.gitignore`.

#### Why .vscode Causes Merge Conflicts and How to Avoid It

`.vscode/settings.json` contains personal settings (font size, theme, local
paths). If it is committed, every developer changes the same file and every
merge of `dev` produces a conflict. The pattern above solves this:

- `.vscode/*` – ignores everything in `.vscode`.
- `!.vscode/extensions.json` – only the list of recommended extensions
  (for example Biome, Prisma, Tailwind CSS) stays shared. Nobody changes it
  often, so it does not cause conflicts.
- Rules that must be the same for everybody (indentation, formatting, line
  endings) belong in `biome.json`, `.editorconfig` and `.gitattributes`, not
  in editor settings.

Example `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "biomejs.biome",
    "prisma.prisma",
    "bradlc.vscode-tailwindcss"
  ]
}
```

#### Personal Ignore Rules Without Changing the Project

Files that only you produce (your editor, your operating system) can be
ignored for all your repositories without touching the project's
`.gitignore`:

```bash
git config --global core.excludesFile ~/.gitignore_global
```

Then write the patterns (for example `.idea/`, `.DS_Store`, `Thumbs.db`) into
`~/.gitignore_global`. For rules that apply to one repository only and must
not be shared, use `.git/info/exclude` (same syntax, never committed).

#### Stop Tracking Files That Were Committed by Mistake

`.gitignore` only affects files that are **not tracked** yet. Remove already
committed files from tracking (they stay on disk) on a feature branch:

```bash
git rm -r --cached .vscode
git rm --cached .env
git commit -m "Stop tracking local editor settings and .env (#12)"
```

- `-r` – recursive, for folders.
- `--cached` – removes the file from the repository only, not from disk.

Check why a file is ignored or not:

```bash
git check-ignore -v .vscode/settings.json
git status --ignored
```

- `git check-ignore -v <file>` – shows the `.gitignore` file, line and
  pattern that ignores the file (no output = not ignored).
- `git status --ignored` – also lists the ignored files.

A committed secret stays in the Git history even after `git rm`. If a real
password or key was ever pushed, change (rotate) it immediately.

### 5.5 git restore – Unstage or Discard Changes

```bash
git restore --staged src/login/form.tsx
git restore src/login/form.tsx
git restore --source=dev src/login/form.tsx
```

- `--staged` – removes the file from the staging area; edits stay.
- without `--staged` – resets the file to the last commit. **Your edits in
  that file are lost.**
- `--source=<branch-or-commit>` – restores the file from another branch or
  commit.

### 5.6 git rm and git mv – Delete and Rename

```bash
git rm old-file.ts
git rm --cached .env
git mv old-name.ts new-name.ts
```

- `git rm` – deletes the file and stages the deletion.
- `git rm --cached` – stops tracking, the file stays on disk.
- `git mv` – renames or moves a file and stages the change.

### 5.7 git commit – Save a Snapshot

```bash
git commit -m "Add login form validation (#12)"
git commit -m "Add login form validation (#12)" -m "Uses the shared schema."
git commit
git commit -v
```

- `-m "<message>"` – commit message; a second `-m` adds a body paragraph.
- without `-m` – opens the editor: subject line, empty line, body.
- `-v` – shows the diff in the editor while writing the message.
- `-a` – stages all modified tracked files automatically (no new files).
  Only use it after checking `git status`.

Good commit messages:

- imperative subject, about 50 characters: "Add login form validation"
- reference the issue with `#12`, so GitLab links the commit to the issue
- one logical change per commit

### 5.8 Fix the Last Commit (only before pushing)

```bash
git add forgotten-file.ts
git commit --amend --no-edit
git commit --amend -m "Better commit message (#12)"
```

- `--amend` – replaces the last commit with a new one.
- `--no-edit` – keeps the existing message.
- Only amend commits that are **not pushed** yet; otherwise a force push
  would be needed.

### 5.9 git log and git show – Read the History

```bash
git log --oneline -10
git log --oneline --graph --decorate --all
git log -p src/login/form.tsx
git log --author="Your Name" --since="2 weeks ago"
git log dev..feature/12-add-login --oneline
git show a1b2c3d
```

- `--oneline` – one line per commit; `-10` – only the last 10 commits.
- `--graph --decorate --all` – draws branches and merges of all branches
  with branch and tag names.
- `-p <file>` – changes of every commit that touched the file.
- `--author` / `--since` – filter by author or date.
- `dev..feature/12-add-login` (two dots) – commits in the feature branch
  that are not yet in `dev`.
- `git show <commit-or-tag>` – message and changes of one commit or tag.
- Press `q` to leave the log view.

## 6. Push the Feature Branch

### 6.1 git push

```bash
git push -u origin feature/12-add-login
git push
```

- first push with `-u` – creates the branch on GitLab and sets the upstream
  (not needed with `push.autoSetupRemote`).
- afterwards plain `git push` is enough.
- rejected with `non-fast-forward` – someone else pushed to the branch.
  Run `git pull`, then push again.
- Never push to `dev` or `main` directly; they are protected.

### 6.2 Force Push (only in exceptional cases)

```bash
git push --force-with-lease
```

Only needed after rewriting already pushed commits (amend, rebase).
`--force-with-lease` refuses to overwrite commits you have not seen yet;
`--force` would silently delete them.

- only on **your own** feature branch, never on `dev` or `main`
- better: do not rewrite pushed history at all

## 7. Stay Up to Date with dev

If other features were merged into `dev` while you work, bring those changes
into your branch before the review.

### 7.1 Merge dev into the Feature Branch (recommended)

```bash
git switch feature/12-add-login
git fetch origin
git merge origin/dev
git push
```

- `git fetch origin` – updates `origin/dev` without touching your files.
- `git merge origin/dev` – merges the latest `dev` into your branch. History
  is kept and no force push is needed, which fits the "no squash, no
  rewrite" rule.
- `--no-ff` – always creates a merge commit; `--ff-only` – only allows a
  fast-forward.

### 7.2 Rebase (only for branches nobody else uses)

```bash
git fetch origin
git rebase origin/dev
git push --force-with-lease
```

`git rebase` replays your commits on top of `dev`. The history becomes linear
but the commits are **rewritten**, so a force push is required. Use it only
if you work alone on the branch and the team allows it.

- `git rebase --continue` – continues after solving a conflict.
- `git rebase --abort` – cancels the rebase.

### 7.3 Resolve Merge Conflicts

A conflict happens when both branches changed the same lines:

```text
<<<<<<< HEAD
your version
||||||| base
original version
=======
version from dev
>>>>>>> origin/dev
```

```bash
git status
git diff --name-only --diff-filter=U
git add src/login/form.tsx
git commit
```

1. `git status` lists the files under *Unmerged paths*;
   `git diff --name-only --diff-filter=U` lists only the conflicting files.
2. Edit each file (VS Code offers *Accept Current / Incoming / Both*),
   remove all markers and test the result.
3. `git add <file>` marks the conflict as resolved.
4. `git commit` (or `git merge --continue`) finishes the merge.

`git merge --abort` cancels the merge and restores the previous state.

## 8. Merge Request

Merge requests exist only in GitLab, so they are created with glab.

### 8.1 Create the Merge Request

```bash
glab mr create \
  --source-branch feature/12-add-login \
  --target-branch dev \
  --title "Add login form (#12)" \
  --description "Closes #12

Implementation: login form with shared validation schema.
Tested: login with valid and invalid data, lint, unit tests.
DoD: all points checked." \
  --reviewer reviewer-username \
  --assignee @me \
  --label feature \
  --milestone "Sprint 2"
```

- `--source-branch` – your feature branch (default: current branch).
- `--target-branch dev` – always `dev` for features.
- `--title` / `--description` – summary, tested functions, DoD and the issue
  reference `Closes #12`, which closes the issue when merged into the
  default branch `dev`.
- `--reviewer` – the other team member who reviews.
- `--assignee`, `--label`, `--milestone` – as for issues.
- `--draft` – creates a draft MR (not ready for review yet).
- `--related-issue 12` – links the MR to the issue.
- `--fill` – takes title and description from the commits.
- `--web` – continues in the browser.
- Do **not** use `--squash-before-merge` or `--remove-source-branch`; both
  contradict the project rules.

Commits pushed later to the same branch appear in the MR automatically.

### 8.2 Show and Update Merge Requests

```bash
glab mr list
glab mr list --reviewer=@me
glab mr view 5
glab mr view 5 --comments
glab mr update 5 --ready
glab mr update 5 --draft
glab mr update 5 --reviewer another-username
```

- `list` – open MRs; `--reviewer=@me` – MRs you have to review;
  `--assignee=@me` – your own MRs; `--merged` – merged MRs.
- `view` – details, status and approvals; `--comments` – discussion;
  `--web` – opens it in the browser.
- `update --ready` / `--draft` – marks the MR as ready or draft.
- `update --reviewer` – changes the reviewer.

### 8.3 Check the Pipeline

```bash
glab ci status
glab ci list
glab ci view
```

- `glab ci status` – pipeline status of the current branch.
- `glab ci list` – recent pipelines of the project.
- `glab ci view` – interactive view of jobs and logs.
- `glab ci trace` – follows the log of a running job.

## 9. Time Tracking

Git cannot record time, so time entries are posted as GitLab quick actions in
a comment with glab.

### 9.1 Record Time on an Issue or Merge Request

```bash
glab issue note 12 -m "/spend 45m
Implementation of login validation (#12)"
glab mr note 5 -m "/spend 30m
Review of MR !5 (#12)"
```

- `glab issue note <id> -m` / `glab mr note <id> -m` – adds a comment.
- `/spend 45m` – records spent time; the second line documents the activity.
- `/spend 30m 2026-09-28` – records time for a specific date.
- `/spend -15m` – corrects a wrong entry.

Rules: one entry per work session, at most **50 minutes**, with the activity
and the issue or MR reference. Split longer sessions into several entries.
Review and merge request work must be recorded as well.

### 9.2 Further Quick Actions

The same `note` commands accept other quick actions, one per line:

- `/estimate 3h` – planned effort for the issue.
- `/label ~bug`, `/milestone %"Sprint 2"` – label and milestone.
- `/assign @username`, `/assign_reviewer @username` – people.

Show the recorded time:

```bash
glab issue view 12
```

The output contains the time estimate and the total time spent.

## 10. Review

A person other than the author reviews the merge request.

### 10.1 Check Out and Inspect the Branch (git)

```bash
git fetch origin
git switch feature/12-add-login
git log origin/dev..origin/feature/12-add-login --oneline
git diff origin/dev...origin/feature/12-add-login --stat
git diff origin/dev...origin/feature/12-add-login
```

- lists the commits and changes the MR adds to `dev`.
- run the application, the tests, `pnpm run lint` and `biome check`.
- `git switch -` – back to your own branch afterwards.

### 10.2 Comment and Approve (glab)

```bash
glab mr diff 5
glab mr note 5 -m "Review: acceptance criteria 1-3 met, DoD checked.
Validation error text on empty email should be clearer."
glab mr approve 5
glab mr revoke 5
```

- `glab mr diff 5` – shows the MR diff as GitLab sees it.
- `glab mr note` – adds the review comment. It must show that the review
  really happened: which acceptance criteria and DoD points were checked,
  and what should be improved.
- `glab mr approve 5` – approves the MR.
- `glab mr revoke 5` – withdraws the approval.

If changes are needed, the author commits and pushes them to the same branch;
then the reviewer checks again.

## 11. Merge into dev

Merge only if the review is done, all acceptance criteria and the DoD are
met and the pipeline is green. Merging is done by the reviewer or another
person, **not the author**.

```bash
glab mr merge 5
```

- Merges MR 5 into its target branch `dev` with a merge commit.
- Do **not** use `--squash` (`-s`) or `--remove-source-branch` (`-d`).
- `--rebase` (`-r`) – not used in this workflow.
- `--auto-merge` – merges automatically once the pipeline succeeds (older
  glab versions: `--when-pipeline-succeeds`).
- `--yes` (`-y`) – skips the confirmation prompt.

Check afterwards that the issue was closed:

```bash
glab issue view 12
```

## 12. Next Issue and Branch Overview

### 12.1 Start the Next Issue

```bash
git switch dev
git pull
git switch -c feature/23-profile-settings
```

Always start a new feature branch from the **latest** `dev`.

### 12.2 Branch Overview

```bash
git branch
git branch -a
git branch -vv
git branch --merged dev
```

- `git branch` – local branches (`*` marks the current one).
- `-a` – also remote branches (`remotes/origin/...`).
- `-vv` – upstream branch and ahead/behind status per branch.
- `--merged dev` – branches that are already merged into `dev`.

Do not delete feature branches (`git branch -d`, `git push origin --delete`);
the project rules require keeping them.

## 13. Set Work Aside: git stash

Use the stash if you must switch branches but your changes are not ready for
a commit.

```bash
git stash push -m "WIP login validation"
git stash push -u -m "WIP including new files"
git stash list
git stash show -p stash@{0}
git stash pop
git stash apply stash@{1}
git stash drop stash@{1}
```

- `push -m "<text>"` – saves tracked changes with a description and cleans
  the working tree.
- `-u` – also saves untracked (new) files.
- `list` – all stashes; `show -p` – content of one stash.
- `pop` – restores the newest stash and removes it from the list.
- `apply` – restores a stash but keeps it.
- `drop` – deletes a stash.

In PowerShell, quote the reference: `git stash show -p 'stash@{0}'`.

## 14. Undo Things

| Situation | Command | Safe after push? |
| --- | --- | --- |
| Unstage a file | `git restore --staged <file>` | yes |
| Discard edits in a file | `git restore <file>` | yes (edits are lost) |
| Change the last commit | `git commit --amend` | no |
| Undo last commit, keep changes | `git reset --soft HEAD~1` | no |
| Undo a pushed commit | `git revert <commit>` | yes |
| Find "lost" commits again | `git reflog` | yes |

### 14.1 git revert – Undo a Pushed Commit Safely

```bash
git revert a1b2c3d
git revert -m 1 <merge-commit>
```

Creates a **new** commit that reverses the given commit. The history stays
intact, so this is the right choice for pushed commits. `-m 1` is required
for merge commits and keeps the first parent (the target branch) as base.

### 14.2 git reset – Move the Branch Pointer (local commits only)

```bash
git reset --soft HEAD~1
git reset --mixed HEAD~1
git reset --hard HEAD~1
```

- `HEAD~1` – one commit before the current one.
- `--soft` – removes the commit, changes stay staged.
- `--mixed` (default) – removes the commit, changes stay unstaged.
- `--hard` – removes the commit **and all changes**. Use only if you are
  sure.

### 14.3 git reflog – Rescue Lost Work

```bash
git reflog
git switch -c rescue-branch a1b2c3d
```

`git reflog` lists every recent position of `HEAD`, even after a reset.
Create a branch at the lost commit to get it back.

## 15. Release: dev to main

Releases are the only time changes move from `dev` to `main`.

### 15.1 Release Merge Request (glab)

Make sure `dev` is tested and ready: all sprint issues merged, pipeline
green, lint and tests passing.

```bash
glab mr create \
  --source-branch dev \
  --target-branch main \
  --title "Release v1.0.0" \
  --description "Sprint 2 release. Included issues: #12, #23, #31." \
  --reviewer reviewer-username \
  --milestone "Sprint 2"
```

Review and merge by another person (sections 10 and 11) – no squash, and
never delete `dev`.

### 15.2 Create and Push the Tag (git)

```bash
git switch main
git pull
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

- `git tag -a <name> -m "<message>"` – creates an **annotated** tag with
  author, date and message. Always use annotated tags for releases.
- `git tag <name>` without `-a` – lightweight tag without metadata; not
  recommended for releases.
- `git tag -a v1.0.0 <commit>` – tags a specific commit.
- `git push origin <tag>` – publishes one tag. A normal `git push` does
  **not** push tags.
- `git push origin --tags` – pushes all local tags, including test tags; use
  with care.

Version numbers follow Semantic Versioning `vMAJOR.MINOR.PATCH`:

- `MAJOR` – incompatible changes (`v2.0.0`)
- `MINOR` – new, compatible features (`v1.1.0`)
- `PATCH` – bug fixes only (`v1.0.1`)

### 15.3 Inspect and Correct Tags (git)

```bash
git tag -l
git tag -l "v1.*"
git show v1.0.0
git tag -d v1.0.0
git push origin --delete v1.0.0
```

- `-l` – lists tags, optionally filtered by a pattern.
- `git show <tag>` – tag message and tagged commit.
- `git tag -d` – deletes a tag locally; `git push origin --delete <tag>` –
  deletes it on GitLab. Only for a wrong tag that was **not** used for a
  release yet.

### 15.4 Publish the GitLab Release (glab)

A GitLab Release is a GitLab feature on top of the Git tag, so glab is used:

```bash
glab release create v1.0.0 \
  --name "v1.0.0" \
  --notes "New: login (#12), profile settings (#23). Fixed: #31." \
  --milestone "Sprint 2"
glab release list
glab release view v1.0.0
```

- `glab release create <tag>` – creates the release for an existing tag.
- `--name` – release title.
- `--notes "<text>"` – release notes; `--notes-file CHANGELOG.md` – reads
  them from a file.
- `--milestone` – links the sprint milestone.
- `--ref main` – only needed if the tag does not exist yet: glab then
  creates it from `main` (a lightweight tag – prefer creating the annotated
  tag with git first).
- `glab release create v1.0.0 ./dist/app.zip` – attaches files.
- `glab release list` / `view` – shows releases.

The pipeline deploys automatically when `main` is updated (see project
requirements).

## 16. Team Example: One Maintainer, Several Developers

This example shows the complete workflow for a team of three. It works the
same way for two or more developers.

### 16.1 Roles and Rights

| Person | GitLab username | GitLab role |
| --- | --- | --- |
| Maintainer M | `maintainer-m` | Maintainer |
| Developer A | `dev-a` | Developer |
| Developer B | `dev-b` | Developer |

| Action | Maintainer | Developer |
| --- | --- | --- |
| Push directly to `dev` or `main` | no | no |
| Push feature branches | yes | yes |
| Create issues and merge requests | yes | yes |
| Review, comment, approve | yes | yes |
| Merge feature MRs into `dev` | yes | yes |
| Merge the release MR into `main` | **yes** | no |
| Create release tags `v*` and releases | **yes** | no |
| Change project settings and members | **yes** | no |

What follows from these rights together with the rule "the author does not
merge":

- A feature MR is merged into `dev` by any **other** team member.
- The maintainer's own feature MRs are merged by a developer.
- The release MR (`dev` -> `main`) is **created by a developer** and
  **reviewed and merged by the maintainer**, because only the maintainer may
  merge into `main` and the author must not merge their own MR.
- Tags and GitLab releases are created by the maintainer.

### 16.2 Setup by the Maintainer

Do the project setup from section 2 first (default branch `dev`, no squash,
`dev` merge level `30`, `main` merge level `40`). Then add the team members
and protect the release tags.

Add members as Developer (GitLab settings, therefore glab):

```bash
glab api "users?username=dev-a"
glab api projects/:id/members -X POST -F user_id=1234567 -F access_level=30
```

- The first command returns the user as JSON; the `id` field is the
  `user_id` for the second command.
- `access_level`: `30` = Developer, `40` = Maintainer, `20` = Reporter.
- Repeat for `dev-b`. In the web interface: **Manage > Members > Invite
  members**.
- `glab api projects/:id/members` lists all members and their roles.

Protect release tags so only the maintainer can create them:

```bash
glab api projects/:id/protected_tags -X POST \
  -f name="v*" -F create_access_level=40
```

- `name="v*"` – all tags starting with `v` (`v1.0.0`, `v1.1.0`, ...).
- `create_access_level=40` – only maintainers can create these tags.

### 16.3 Step 1 – Sprint Planning (Maintainer M)

M creates the sprint issues and assigns them:

```bash
glab issue create --title "User can log in" --label feature \
  --milestone "Sprint 2" --weight 3 --assignee dev-a \
  --description "Acceptance criteria: ..."
glab issue create --title "User can register" --label feature \
  --milestone "Sprint 2" --weight 5 --assignee dev-b \
  --description "Acceptance criteria: ..."
glab issue create --title "Profile settings page" --label feature \
  --milestone "Sprint 2" --weight 3 --assignee @me \
  --description "Acceptance criteria: ..."
```

In this example the issues get the numbers `#12` (A), `#13` (B) and
`#14` (M).

### 16.4 Step 2 – Parallel Feature Branches (A, B and M)

Every person creates their own branch from the latest `dev`.

Developer A:

```bash
git switch dev
git pull
git switch -c feature/12-add-login
git push -u origin feature/12-add-login
```

Developer B:

```bash
git switch dev
git pull
git switch -c feature/13-add-registration
git push -u origin feature/13-add-registration
```

Maintainer M:

```bash
git switch dev
git pull
git switch -c feature/14-profile-settings
git push -u origin feature/14-profile-settings
```

Everybody commits and pushes only to their own branch and records time on
their issue:

```bash
git add src/login/
git commit -m "Add login form (#12)"
git push
glab issue note 12 -m "/spend 45m
Login form implementation (#12)"
```

### 16.5 Step 3 – A Opens a Merge Request, B Reviews and Merges

Developer A:

```bash
glab mr create --source-branch feature/12-add-login --target-branch dev \
  --title "Add login (#12)" --reviewer dev-b --milestone "Sprint 2" \
  --description "Closes #12

Tested: valid and invalid login, lint, unit tests. DoD checked."
```

GitLab creates MR `!5`. Developer B reviews it:

```bash
git fetch origin
git switch feature/12-add-login
git diff origin/dev...origin/feature/12-add-login --stat
glab mr note 5 -m "Review: acceptance criteria 1-3 met, DoD checked.
Please show a clearer message for a wrong password."
```

A fixes the finding on the same branch:

```bash
git switch feature/12-add-login
git add src/login/
git commit -m "Improve wrong password message (#12)"
git push
```

B checks again, approves, merges and records the review time:

```bash
git pull
glab mr approve 5
glab mr merge 5
glab mr note 5 -m "/spend 30m
Review of MR !5 (#12)"
git switch -
```

A must **not** run `glab mr merge 5` on their own MR.

### 16.6 Step 4 – B Integrates the New dev and Resolves a Conflict

B's branch does not contain A's merged login yet. Both changed the shared
validation file, so B merges `dev` into the feature branch:

```bash
git switch feature/13-add-registration
git fetch origin
git merge origin/dev
```

Git reports a conflict in `src/validation/user-schema.ts`. B resolves it:

```bash
git status
git add src/validation/user-schema.ts
git commit
git push
```

Then B opens the merge request, A reviews and merges it:

```bash
glab mr create --source-branch feature/13-add-registration \
  --target-branch dev --title "Add registration (#13)" --reviewer dev-a \
  --description "Closes #13

Tested: registration, duplicate email, lint, unit tests. DoD checked."
```

This is MR `!6`. Developer A reviews it as in step 3 and merges it with
`glab mr merge 6`.

### 16.7 Step 5 – The Maintainer's Own Feature

M's MR is handled like every other feature MR. M must not merge it; a
developer does:

```bash
glab mr create --source-branch feature/14-profile-settings \
  --target-branch dev --title "Add profile settings (#14)" \
  --reviewer dev-a --description "Closes #14

Tested: edit and save profile, lint, unit tests. DoD checked."
```

This is MR `!7`. Developer A reviews and merges it into `dev`
(`glab mr merge 7`) – developers may merge into `dev`.

### 16.8 Step 6 – Release: A Creates the MR, M Merges into main

At the end of the sprint `dev` is tested and ready. Developer A creates the
release merge request with the maintainer as reviewer:

```bash
glab mr create --source-branch dev --target-branch main \
  --title "Release v1.0.0" --reviewer maintainer-m --milestone "Sprint 2" \
  --description "Sprint 2 release. Included: #12, #13, #14."
```

This is MR `!8`. A developer cannot merge it: `glab mr merge 8` run by A or B
is rejected by GitLab because `main` only allows maintainers to merge.

Maintainer M reviews, approves and merges:

```bash
git fetch origin
git diff origin/main...origin/dev --stat
glab mr note 8 -m "Release review: all sprint issues merged, pipeline
green, DoD checked."
glab mr approve 8
glab mr merge 8
```

### 16.9 Step 7 – Tag and Release (Maintainer M)

```bash
git switch main
git pull
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
glab release create v1.0.0 --name "v1.0.0" --milestone "Sprint 2" \
  --notes "New: login (#12), registration (#13), profile settings (#14)."
```

A developer's `git push origin v1.0.0` would be rejected because `v*` tags
are protected.

### 16.10 Step 8 – Everybody Continues with the Next Sprint

All team members update `dev` before starting their next issue:

```bash
git switch dev
git pull
git switch -c feature/15-password-reset
```

### 16.11 Team of Two

With only one maintainer and one developer the same rules apply:

- The developer's feature MRs are reviewed and merged by the maintainer.
- The maintainer's feature MRs are reviewed and merged by the developer.
- The release MR is created by the developer and merged by the maintainer.

## 17. Best Practices for This Workflow

### 17.1 Small Issues, Short-Lived Branches

- One issue = one feature branch = one merge request.
- Split user stories so a branch can be merged within one to three days.
  The longer a branch lives, the more `dev` moves away and the bigger the
  conflicts get.
- Merge `origin/dev` into your feature branch at least once a day and always
  before requesting a review (section 7.1).
- Start every new branch from the latest `dev` (`git switch dev`,
  `git pull`).

### 17.2 Commit and Push Often

- Commit every small, working step; push at least at the end of every work
  session. The push is your backup and makes your progress visible on the
  issue board.
- Open the merge request early as a draft (`glab mr create --draft`) so the
  team sees what you are working on; switch it to ready with
  `glab mr update <id> --ready`.
- Check the branch before every commit: `git branch --show-current`.

### 17.3 Avoid Merge Conflicts in the Team

- Coordinate on the issue board who works on which files. Two issues that
  change the same component at the same time should be done one after the
  other.
- Do not reformat, rename or move files that have nothing to do with your
  issue. Unrelated changes are the most common cause of conflicts.
- Do renames and moves in a separate commit without content changes, so Git
  recognises them as renames.
- Formatting is identical for everybody: `biome.json` and `.editorconfig` are
  committed, VS Code formats with Biome on save, and `biome check` runs
  before every commit. Then whitespace and quote style never cause
  conflicts.
- Line endings are fixed by `.gitattributes` (section 1.4), so Windows and
  macOS users do not change every line of a file.

### 17.4 Lockfile Conflicts (pnpm-lock.yaml)

Never resolve conflicts in `pnpm-lock.yaml` by hand. Let pnpm regenerate it:

```bash
git merge origin/dev
pnpm install
git add pnpm-lock.yaml
git commit
```

- `pnpm install` reads `package.json` and repairs the conflicting lockfile.
  If `package.json` itself has a conflict, resolve that file first.
- Use only pnpm. Set the version in `package.json`, for example
  `"packageManager": "pnpm@10.x.x"` with the exact version, so everybody
  uses the same one (`corepack enable` activates it).
- Add or update dependencies in a separate commit with a clear message, for
  example `Add zod dependency (#12)`.

### 17.5 Database Migration Conflicts (Prisma)

If two branches create a Prisma migration at the same time, the migration
order in `prisma/migrations/` can conflict after merging `dev`.

- Create migrations only with `pnpm prisma migrate dev --name <name>`, never
  edit applied migrations.
- If your **not yet merged** migration conflicts with a new migration from
  `dev`: merge `origin/dev`, delete your own migration folder, run
  `pnpm prisma migrate dev --name <name>` again and commit the new
  migration.
- Merge feature branches with schema changes promptly, so other branches
  build on the new schema.

### 17.6 Changelog Conflicts

If the team keeps a `CHANGELOG.md` and everybody adds lines at the top, use
Git's built-in `union` merge driver in `.gitattributes`:

```gitattributes
CHANGELOG.md merge=union
```

On a merge, Git keeps the lines from both sides instead of reporting a
conflict. Check the order of the lines afterwards.

### 17.7 Secrets and Configuration

- Real values live only in `.env` (ignored) or in the CI/CD variables in
  GitLab (**Settings > CI/CD > Variables**, masked and protected).
- `.env.example` lists every variable with a dummy value and is updated in
  the same commit that introduces a new variable.
- Check `git diff --staged` before every commit for passwords, tokens and
  keys.

### 17.8 Merge Requests and Reviews

- Keep merge requests small (as a guide: fewer than about 400 changed
  lines). Small MRs are reviewed faster and more thoroughly.
- The MR description always contains `Closes #<id>`, what was tested and
  the DoD check.
- Review promptly (within one school day) so nobody is blocked.
- Resolve every review thread before merging; the author answers each
  comment with a fix or a short explanation.
- The pipeline (lint, tests, build) must be green before merging.

### 17.9 Clean History Without Squash

Squash is not allowed, so the history of every feature branch stays visible.
Keep it readable:

- meaningful commit messages with issue reference, no "fix", "wip", "asdf"
- fix typos in the last, **unpushed** commit with `git commit --amend`
- do not rewrite pushed commits (no rebase or force push on shared
  branches)
- use `git revert` instead of `git reset` for pushed commits

### 17.10 Daily Routine

Start of a work session:

```bash
git fetch origin
git switch feature/12-add-login
git merge origin/dev
```

End of a work session:

```bash
git status
git add <files>
git commit -m "Describe the step (#12)"
git push
glab issue note 12 -m "/spend 45m
Describe the activity (#12)"
```

## 18. GitLab to GitHub Mirror

Follow the
[mirror setup guide](https://gitlab.com/htl-villach/personal/gam/selected/gam_internal/-/blob/main/git/gitlab_nach_github_mirror.md?ref_type=heads).

- Mirror **all branches**.
- Grant the GitHub user `gamgamstyle` the **Reporter** role.

## 19. Quick Reference

```text
Setup (once)
  git config --global user.name "Name"      set identity
  glab auth login                            log in to GitLab
  git clone <url>                            copy repository

Plan
  glab issue create --title "..." ...        create issue

Start an issue
  git switch dev && git pull                 update dev
  git switch -c feature/12-add-login         create feature branch

Work
  git status / git diff / git diff --staged  inspect changes
  git add <file> / git add -p                stage changes
  git commit -m "Message (#12)"              commit
  git push -u origin <branch>                first push, later: git push

Stay up to date
  git fetch origin && git merge origin/dev   bring dev into feature

Merge request and review
  glab mr create --target-branch dev ...     create MR
  glab issue note 12 -m "/spend 45m ..."     record time (max. 50 min)
  glab mr note 5 -m "Review: ..."            review comment
  glab mr approve 5                          approve
  glab mr merge 5                            merge (not by the author)

Release
  glab mr create --source-branch dev --target-branch main
  git switch main && git pull
  git tag -a v1.0.0 -m "Release v1.0.0"
  git push origin v1.0.0
  glab release create v1.0.0 --notes "..."
```

## 20. Checklist Before an Issue Is Done

- [ ] Issue has description, acceptance criteria, weight, assignee and
  milestone.
- [ ] Feature branch `feature/<id>-<description>` was created from the latest
  `dev`.
- [ ] Commits are small, meaningful and reference the issue (`#12`).
- [ ] No secrets (`.env`) or build output were committed.
- [ ] Lint (`pnpm run lint`, `biome check`) and tests pass.
- [ ] Merge request targets `dev`, contains `Closes #12` and the tested
  functions.
- [ ] Another person reviewed the MR, checked the DoD and left a comment.
- [ ] Time was recorded in entries of at most 50 minutes, including review.
- [ ] Merged without squash; the feature branch was not deleted.
