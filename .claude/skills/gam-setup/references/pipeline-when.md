# Pipeline: where and when

Loaded by `/gam-engineering pipeline when` (skill `gam-setup`, P-PIPE-8). It changes only two things in a project that already has a pipeline decision: **where** the pipeline runs (`location`: `local`, `host` — GitLab or GitHub —, `both`, `none`) and **when** each location runs it. It does not detect languages and does not touch the checks; for those run `/gam-engineering pipeline` ([pipeline.md](pipeline.md)). Setup and `migrate tools` call this procedure for a project without the answer, so every project, new or existing, gets the same questions.

Without `gam-engineering/pipeline.json` there is no decision to change: say so and run `/gam-engineering pipeline` instead.

## The moments

| Answer | Local pipeline (`localWhen`) | Host pipeline (`ci.trigger`) |
| --- | --- | --- |
| **At every merge into dev** (default) | `dev` — also the value when the field is missing | `merge-request` — merge requests and the integration branch |
| **Only at the merge into main** | `main` — due at the release merge `dev` → `main`, not at the merges into `dev` | `release-only` — merge requests into `main`, `main`, and tags |
| **Only at the release** | `release` — due at `release` with `-Tier release` only | `release-tag` — release tags only, no merge request and no branch |

In branch model `trunk` the merge into the integration branch is the merge into `main`: the first two answers are the same, so ask only *at every merge* and *only at the release*. `ci.trigger` `both` (merge requests, integration branch, `main`, tags) stays valid and is never offered anew.

A pipeline that is not due at a moment counts as green there (P-MR-3): the merge or release states `pipeline not due at <moment> (P-PIPE-8)`. `node gam-engineering/tools/pipeline.mjs due <merge-dev | merge-main | release> [--trunk]` prints `{ "local": <bool>, "host": <bool> }` for the recorded decision; `--trunk` in branch model `trunk`.

## Steps

1. **Read the decision**: `gam-engineering/pipeline.json` (`location`, `localWhen`, `ci`) and the branch model and host from `WORKFLOW.md`. The recorded values are the recommended options, so accepting everything keeps the decision.
2. **Ask in one round** ([Asking the developer](../../gam-engineering/SKILL.md#asking-the-developer)); a question whose prerequisite is unanswered waits for the next call:
   - **Where**, one `Q<n>`: `both`, `local`, `host` (name the host: GitLab or GitHub), `none`. The recorded location comes first as recommended. `none` is never recommended and reads "no pipeline: no checks, no local script, no CI file".
   - **When, local**, one `Q<n>`, only when the answer is `local` or `both`: the options of the table above, the recorded one first as recommended.
   - **When, host**, one `Q<n>`, only when the answer is `host` or `both`: the options of the table above, the recorded one first as recommended. Add that on GitLab and GitHub a trigger that skips merge requests also skips the status the protection of the integration branch may require (P-MR-3).
   - A project ADR that sets when CI runs ([pipeline.md](pipeline.md#merge-with-an-existing-pipeline), point 7) governs the host question: name it and offer only what it allows.
3. **Name a loosening.** Write `{ "previous": <recorded decision>, "next": <the new one> }` to a temporary file outside the repo and run `node gam-engineering/tools/pipeline.mjs compare <file>`. A dropped location, a later `ci.trigger`, and a later `localWhen` are loosenings. When it prints any, ask one `Q<n>` that lists each `change` with its `noLongerRed`; options **Keep the decision** (recommended) and **Loosen**. On *Keep the decision* only the round is logged and the procedure ends.
4. **Write the decision.** Set `location`; set `localWhen` to `main` or `release`, and delete the field for `dev` (the default); set `ci` per [pipeline.md](pipeline.md#folders-triggers-and-the-new-checks) (`{ "file", "trigger" }` for a trigger other than `merge-request`). At location `local` or `none`, `localWhen` is kept only for `local`.
5. **Bring the files along**, as steps 9 and 10 of [pipeline.md](pipeline.md#steps) write them, limited to what the answer changes:
   - a new host or `both`: render the CI file with `render-ci <host> <integration branch> --write`, make `.gitlab-ci.yml` include it, and lint it (`glab ci lint` or `actionlint`); a changed trigger regenerates the file the same way ([Own changes kept](pipeline.md#own-changes-kept) applies);
   - a dropped host: remove the generated CI file and its `include` entry;
   - a new `local` or `both`: copy `local-pipeline.ps1` when it is missing;
   - a dropped local: remove the copy only after [Own changes kept](pipeline.md#own-changes-kept).
6. **Validate**: `node gam-engineering/tools/pipeline.mjs validate gam-engineering/pipeline.json` must print `[]`.
7. **Ship it** like every change (P-GIT-2): the decision (its question round is in the chat export), and the changed files in one commit on a work branch; the MR description names the linter result when a CI file was written.
