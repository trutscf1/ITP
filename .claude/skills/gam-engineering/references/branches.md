# Branch model `trunk`

The skill's procedures are written for branch model `dev`: work lands on `dev`, and a release merges `dev` into `main`. In branch model `trunk` (P-GIT-9) there is no `dev`; `main` is the integration branch. This file is the single list of what changes; everything not listed here applies unchanged.

The model is read in every session from `env.GAM_ENGINEERING_BRANCHES` in the committed `.claude/settings.json`; a missing or unknown value means `dev`. Without git the key is not read (P-GIT-7).

## Substitutions

| Branch model `dev` | Branch model `trunk` |
| --- | --- |
| Work branch from `dev`; MR into `dev` (P-GIT-2) | Work branch from `main`; MR into `main` |
| `main` and `dev` protected, no direct commits (P-GIT-1) | `main` protected, no direct commits; in team mode it requires `GAM_ENGINEERING_APPROVALS` approvals |
| Tracker commands with `--base dev` / `--target-branch dev` | `--base main` / `--target-branch main` |
| ROADMAP stage `in dev` once the epic's last story is merged | Stage `merged` (P-ROAD-1) |
| Story `done` when it reaches `dev` | Story `done` when it reaches `main` |
| `gam-v-code-review` and doc-check baseline: the merge base with `dev` | The merge base with `main` |
| Release: version, `gam-v-pre-release-review` over `v<last tag>..dev`, release MR `dev` → `main`, merge per P-MR-5, tag on `main`, host release | Release: version, `gam-v-pre-release-review` over `v<last tag>..main`, green pipeline on `main`, tag per P-MR-5 on the current `main`, host release; no MR |
| Release pop-up under `ask`: **Merge now**, **No**, **Later**, **I merge myself** | **Release now**, **No**, **Later**, **I release myself** |
| Merge guard (P-MR-6): `git merge`, `glab mr merge`, `gh pr merge` | The same, plus `git tag`, `glab release create`, `gh release create` |
| Status hook watches `dev` and `origin/dev` | Watches `main` and `origin/main` (it reads the key itself) |
| `merge.ps1 -Release` merges `dev` into `main`, then tags | `merge.ps1 -Release` only tags `main` (it reads the key itself) |
| `git init` without git: first commit on `main`, then `dev` from it | First commit on `main`, no `dev` |

`doc-check.mjs` reads the key itself: in branch model `trunk` the stage `in dev` is an error `STAGE-MODE`, in branch model `dev` the stage `merged` is.

## Switching an existing project

`/gam-engineering settings branches <dev | trunk>` follows the steps for every settings change ([gam-setup: Settings](../../gam-setup/references/settings.md)); each step that touches the git host is confirmed by pop-up. Everything except the host settings ships in one MR into the integration branch that is current before the switch.

### `dev` → `trunk`

1. Precondition: the pipeline on `dev` is green and no story on `dev` is unfinished. Otherwise report what is open and stop.
2. Bring `dev` into `main`: a closing MR `dev` → `main` without a tag, unless the developer chooses to release now (then run the release instead).
3. Retarget every open MR from `dev` to `main`.
4. Write `GAM_ENGINEERING_BRANCHES=trunk`, add the trunk rules of the merge guard under merge policy `ask`, rename the stage `in dev` to `merged` in `ROADMAP.md` (rows and stage table), and set the *Branch model* line in `WORKFLOW.md`.
5. After the merge: remove the protection of `dev` and delete it on the host and locally. Log the switch in `ROADMAP-DETAILS.md`.

### `trunk` → `dev`

1. In the switch MR into `main`: write `GAM_ENGINEERING_BRANCHES=dev`, remove the trunk rules from the merge guard, rename the stage `merged` to `in dev`, set the *Branch model* line in `WORKFLOW.md`, and log the switch.
2. After the merge: create `dev` from `main` and protect it like `main` (no direct push, no squash merge, approvals as on `main`).
3. Retarget every open MR from `main` to `dev`.
