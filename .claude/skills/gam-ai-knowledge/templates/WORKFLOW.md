---
doc: workflow
format: gam-ai-knowledge/1
title: Workflow
audience: [developer, reviewer, agent]
---
# Workflow

How work moves through this repo — branches, labels, merge requests, the Definition of Done, releases — for every developer and reviewer, and for agents before they open a branch or an MR. The general rules come from the engineering profile (IDs in parentheses); this file records only the values specific to this project.

## Mode

- **Mode:** [solo | team] (P-TEAM-1…5; team roster and roles in `team/TEAM.md`)
- **Branch model:** [dev | trunk] (P-GIT-9; value in `env.GAM_ENGINEERING_BRANCHES` of `.claude/settings.json`). Under `trunk` there is no `dev`: work merges into `main`, and a release is the tag on `main`.
- **Flow:** [full | quick] (P-FLOW-1; value in `env.GAM_ENGINEERING_FLOW` of `.claude/settings.json`). Under `quick` a change is a plan in `gam-ai-memory/plans/` with a *Done when* checklist on a `quick/<name>` branch, and the local pipeline runs only when code changed, then only the short test and the architecture checks (P-PIPE-3).
- **Version control:** [git | none — git offered and declined on YYYY-MM-DD] (P-GIT-7). Under `none` the sections *Branches*, *Merge requests*, and *Releases* do not apply, the tracker is local markdown, and the Definition of Done reads as its notes for projects without git say.
- **Git host / tracker:** [GitLab | GitHub | local markdown] — [project URL]
- **Time tracking:** [off | on for humans] (P-TIME-1)
- **Host tier:** [GitLab Free | GitLab Premium/Ultimate | GitHub] — determined by the agent's tier check, not assumed, and re-checked before every `tickets` publish (P-TRK-4). On GitLab Premium/Ultimate in a group, epics are group epics with the story issues as native child items; on GitLab Free, scoped labels are not exclusive, issue weight lives in the description, required approvals are checked by the agent, and the hierarchy is kept by `Part of` links (P-TRK-1, P-TRK-4)
- **Merge policy:** the keys `env.GAM_ENGINEERING_MERGE`, `env.GAM_ENGINEERING_APPROVALS`, and `env.GAM_ENGINEERING_RELEASE_MERGE` in `.claude/settings.json` (P-MR-4…6). The values live only there; they are not copied into this file. Show or change them with `/gam-engineering settings`.
- **Models:** the top-level `model` key and `env.GAM_ENGINEERING_MODEL_DRAFT` / `env.GAM_ENGINEERING_MODEL_CHECK` in the same file; values only there. Change them with `/gam-engineering settings model`.

## Branches (P-GIT-1…3)

| Branch | Purpose | Protection |
| --- | --- | --- |
| `main` | Tested releases only; merged from `dev` for a release [trunk: the integration branch; releases are tags on it] | Protected: no direct push, merge by [role] [trunk: also no squash merge] |
| `dev` | Integration branch; never deleted [delete this row in branch model trunk] | Protected: no direct push, no squash merge |
| `feature/<issue-id>-<slug>`, `fix/<issue-id>-<slug>` | Work branches, created from the issue; deleted after merge | — |
| `concept/<feature>` | Concept authoring; no issue needed (optionally tracked by a `type::concept` issue); deleted after merge | — |
| `rebuild/<YYYY-MM-DD>` | `/gam-engineering rebuild`; no issue needed, checked by the green check of the rebuild; merges only while the integration branch still has the recorded head; deleted after merge | — |
| `chore/rebuild-doc-fixes-<YYYY-MM-DD>` | The documentation fixes of a red or abandoned rebuild; no issue needed; deleted after merge | — |
| `chore/rebuild-drill-<YYYY-MM-DD>` | The record of a rebuild drill: one log row and the inbox items for its questions; no issue needed; deleted after merge | — |
| `wip/<YYYY-MM-DD>-<slug>` | Unfinished code secured by `/gam-engineering stopp`; no issue needed; pushed, never merged; deleted when the work is taken up again or dropped | — |
| `chore/<slug>` | Repo configuration without behavior change (e.g. merge settings); no issue needed; deleted after merge | — |

## Tracker (P-TRK-1…3)

### Labels

| Label | Meaning |
| --- | --- |
| `type::epic` | Epic issue — a group epic on GitLab Premium/Ultimate — parent of the epic's story issues (`work-items/E<nn>-<feature>/epic.md`, P-DOC-6, P-TRK-4) |
| `type::story` | User story issue (`US-n`), child of its epic issue; slice issues are children of their story |
| `type::bug` | Defect against an existing requirement |
| `type::concept` | Optional tracking issue for concept authoring on a `concept/…` branch |
| `status::ready` / `status::in-progress` / `status::review` | Board columns |
| `type::request` | Raw incoming feature request; enters the concept process via the inbox (`/gam-engineering triage`) |
| `status::needs-triage` / `status::needs-info` / `status::wontfix` | Triage states of raw incoming issues |
| `for::human` | Ready, but cannot be delegated to an agent |
| `wayfinder:map`, `wayfinder:research` / `gam-v-prototype` / `gam-v-grilling` / `task` | Map and decision tickets of `/gam-engineering wayfind` |
| [project-specific labels] | [meaning] |

### Templates

- GitLab — issues: `.gitlab/issue_templates/epic.md`, `.gitlab/issue_templates/user-story.md`, `.gitlab/issue_templates/bug.md`; merge requests: `.gitlab/merge_request_templates/default.md`
- GitHub — issues: `.github/ISSUE_TEMPLATE/epic.md`, `.github/ISSUE_TEMPLATE/user-story.md`, `.github/ISSUE_TEMPLATE/bug.md`; pull requests: `.github/pull_request_template.md`. Weight: [in the issue description | Projects number field `Weight`]

[Keep the line of the host in use; delete the other.]

### Sprints

- **Sprint mode:** [dated | fixed | goal] (P-TRK-1)
- **Sprint length:** [n weeks — `fixed` only; delete the line otherwise]

One milestone per sprint, numbered in order: `Sprint <n>`, in `goal` mode `Sprint <n> — <goal>`. Every issue on the board belongs to a milestone once it is planned. Each sprint has its sprint backlog `work-items/sprints/sprint-<n>.md`, and the stories not yet done stand in the product backlog `work-items/BACKLOG.md`; both are updated with every status change of a story (P-DOC-8).

| Mode | Milestone dates | A sprint ends |
| --- | --- | --- |
| `dated` | start and end date, set per sprint | on its end date |
| `fixed` | start date; end date = start + sprint length | after the sprint length |
| `goal` | none | when its goal is reached; the lowest open number is the active sprint |

[Keep the row of the mode in use; delete the others.]

## Merge requests (P-MR-1…6)

- Target: `dev`; `main` only for releases (P-VER-1). [trunk: Target: `main`.]
- Title: plain-language summary with the story ID, e.g. `QE-US-3 Reuse questions: copy with duplicate check`.
- Description (MR template): `Closes #<issue>`, what changes for the user, summary of the implementation, tested functions, consistency-check result — IDs always with their titles.
- Reviewer: a person other than the author checks the acceptance criteria and the DoD and leaves a content comment (P-MR-2); under merge policy `auto` (solo mode only) the recorded clean `/gam-engineering review` takes this place.
- Merging: the author never merges on their own authority; an agent merges only via `/gam-engineering merge` under the merge policy (P-MR-4). To merge by hand — after *I merge myself*, or without an agent — follow `gam-engineering/tools/MERGING.md` or run `gam-engineering/tools/merge.ps1`.
- Merge method: merge commit (no squash).

## Definition of Done

An issue is done, and its MR may be merged, only when every item holds:

1. All acceptance criteria `AC-n.m` of the issue are met and demonstrated by a passing acceptance test carrying the AC ID.
2. The pipeline is green at every location recorded in `gam-engineering/pipeline.json` (P-PIPE-2; at location `none` no location is recorded and this item holds), or, without that file, all tests pass in CI. No test is skipped without a written reason in the MR.
3. Every commit touching production code names a requirement ID (P-GIT-4).
4. The owning concept document (and Part H, if affected) is updated in the same MR (P-GIT-5, P-HUM-3).
5. The consistency check (goal → story → requirement) shows no new orphan or contradiction if documentation changed.
6. Linters and formatters report no errors.
7. The MR title, description, and commit subjects are understandable without looking up IDs (P-GIT-4, P-MR-1, P-HUM-4).
8. A person other than the author reviewed the MR against this list and commented — or, under merge policy `auto` in solo mode, a clean `/gam-engineering review` is recorded on the MR (P-MR-2).
9. Status is current: the MR carries the position in `ROADMAP-DETAILS.md` (or the developer's `STATUS.md`) the *Status* stage in `ROADMAP.md`, and the story's `status` with its rows in `work-items/BACKLOG.md` and the sprint file for the state after the merge (P-DOC-8), and the issue is closed or confirmed at the merge; if `gam-ai-knowledge/` is not in git, the agent applies the status right after the merge (P-ROAD-4).
10. [Project-specific items]

A rebuild branch (`rebuild/…`) has no issue: items 1 and 9 read as the green check of the rebuild (every test of the rebuilt stories passes in a fresh checkout) and the position row only (RB-F-9, RB-F-10).

In a project without git (*Version control: none*), "MR" means the `## Changes` section of the issue file and "CI" means a local run. Item 3 is met by the log entry in `ROADMAP-DETAILS.md` naming the requirement IDs, item 8 by a clean `/gam-engineering review` recorded under `## Review` in the issue file, and item 9 by the status update at the close step.

## Releases (P-VER-1…4)

Run `/gam-engineering release [<version>]`, or by hand `gam-engineering/tools/merge.ps1 -Release <version> -Via Host` (steps in `gam-engineering/tools/MERGING.md`):

1. Set every version file that carries a version field (`package.json`, `pyproject.toml`, `*.csproj`, …) to `<version>` and commit it as `release: v<version>` on the integration branch; without a version file, skip this step (P-VER-4).
2. Merge `dev` → `main` via a release MR, as the release merge key allows (P-MR-5). [trunk: delete this step; the release key governs step 3.]
3. Create the annotated tag `v<version>` on `main`.
4. Publish a release on the git host (GitLab or GitHub Release) for the tag with release notes listing the closed stories (`US-n`, with titles).
5. Set the *Status* stage of every included feature in `ROADMAP.md` to `released` (P-ROAD-4), and set `shipped: "v<version>"` in the `epic.md` of every epic it completes; a story shipped in a fix release for an epic already shipped gets its own `shipped` (P-DOC-6).
