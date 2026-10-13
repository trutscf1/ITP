---
doc: workflow
format: engineering-human/2
title: Workflow
audience: [developer, reviewer, agent]
---
# Workflow

How work moves through this repo — branches, labels, merge requests, the Definition of Done, releases — for every developer and reviewer, and for agents before they open a branch or an MR. The general rules come from the engineering profile (IDs in parentheses); this file records only the values specific to this project and binds them to the school requirements in `docs/`. Commands for every step live in `docs/git_workflow_commands.md` (section numbers below); they are not repeated here. Current status lives in [ROADMAP-DETAILS.md](ROADMAP-DETAILS.md).

## Mode

- **Mode:** team (P-TEAM-1…5, [ADR-0003](adr/0003-switch-to-team-mode.md)); team roster and roles in `team/TEAM.md`
- **Git host / tracker:** GitLab — `htl-villach/it/classes/5bhitm-2026/itp/waent/project1/SJ26_27_5BHITM_ITP_trutscf1_project1`. People use `glab` as in `docs/git_workflow_commands.md`; agents use the REST API (`docs/agents/issue-tracker.md`). Mirror to GitHub with **all branches**; the GitHub user `gamgamstyle` gets the Reporter role (§18).
- **Time tracking:** on for humans (P-TIME-1; school requirement, see "Time tracking")
- **Host tier:** GitLab Premium/Ultimate, project in a group — determined by the agent's tier check on 2026-10-06 (the group epics API answers), not assumed, and re-checked before every `tickets` publish (P-TRK-4). Features are meant to be group epics with the story issues as native child items. The agent's project token may not create group epics, so the feature issues #87–#100 were created as project issues labelled `type::feature`, with a related-issue link from every story; a member with rights on the group promotes them with the `/promote` quick action.
- **Merge policy:** the keys `env.ENGINEERING_HUMAN_MERGE`, `env.ENGINEERING_HUMAN_APPROVALS`, and `env.ENGINEERING_HUMAN_RELEASE_MERGE` in `.claude/settings.json` (P-MR-4…6). The values live only there; they are not copied into this file. Show or change them with `/engineering-human settings`.

## Team

Four developers (`team/TEAM.md`); each owns the areas assigned in `docs/projektantrag.md` ("Projektgruppe") and the roadmap features in the Owner column of [ROADMAP.md](ROADMAP.md). Work is split into **tracks**, one per person: each track owns exclusive paths, its own plan file, and its own issues; tracks meet only at interfaces fixed in the feature's concept document. A change in another track's paths is requested as an issue for that track's owner. Template: `documentation/concepts/scaffolding.md` §16.

## Branches (P-GIT-1…3)

| Branch | Purpose | Protection |
| --- | --- | --- |
| `main` | Tested releases only; merged from `dev` for a release. The pipeline deploys automatically when `main` is updated. | Protected: push access for no one |
| `dev` | Integration branch and default branch; never deleted | Protected: push access for no one, no squash merge |
| `feature/<issue-id>-<slug>`, `fix/<issue-id>-<slug>` | Work branches, created from the issue and from the latest `dev` (§4.1); **kept after merge** (deviation below) | — |
| `concept/<feature>` | Concept authoring; tracked by a `type::concept` issue, and its MR references it with `Closes #<id>`; kept after merge | — |
| `chore/<slug>` | Repo configuration without behavior change (e.g. merge settings); no issue needed; kept after merge | — |

Branch names are lowercase with hyphens and without umlauts. Project settings (§2.3): default branch `dev`, merge method `merge`, squash `never`, "delete source branch" off.

## Commit messages (P-GIT-4)

[Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/):

```text
<type>(<scope>): <imperative description> [<requirement-id>]

<optional body>

Refs: #<issue>
```

- Types: `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `style`, `build`, `ci`, `chore`, `revert`.
- Scopes: a unit (`web`, `identity`, `storage`, `worker`, `cms`), a shared package (`contracts`, `ui`, `config`), `deps`, `ci`, `repo`.
- Requirement ID per P-GIT-4; `[no-req]` for pure chores.
- Breaking change: `!` after the scope and a `BREAKING CHANGE: <what>` footer.
- Description in English, lowercase start, about 50 characters, understandable without looking the ID up.
- Checked by a commit-msg hook and in CI. Examples: `documentation/concepts/scaffolding.md` §10, example 4.

## Changelog

`CHANGELOG.md` follows [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/). Feature MRs do not edit it. In the release MR, a command generates a draft for the new version from the commits since the last tag (`feat` → Added, `fix` → Fixed, breaking changes → Changed; other types omitted); the release MR author rewrites the entries for readers and uses `Deprecated`, `Removed`, `Security` where they fit. Example: `documentation/concepts/scaffolding.md` §10, example 5.

## CI/CD

GitLab CI runs on every MR into `dev` and every push to `dev` and `main`; the jobs are defined by `documentation/concepts/scaffolding.md` SCF-F-15, plus the documentation checks in `.gitlab/ci/docs.yml` (markdown lint and `tools/doc-check.mjs`). "Pipeline must succeed" is enabled as a merge check. Deployment on push to `main` follows with roadmap item R14.

## Deviations from the profile

Where `docs/` and a profile decision disagree, `docs/` wins.

| Overrides | Rule here | Reason |
| --- | --- | --- |
| P-GIT-2 (work branches are deleted after merge) | Feature, fix, concept, and chore branches are **never deleted** after merge. | School requirement (`docs/anforderungen_software_projekte.md` §2, §5): the per-branch history is graded. |
| P-GIT-2 (`concept/…` branches need no issue) | Every `concept/…` branch has a `type::concept` issue. | School requirement: every change starts with an issue (§3). |

## Deviations from the project proposal

Presented at the final presentation (`docs/anforderungen_software_projekte.md`, "Präsentation").

| Proposal says | Rule here | Reason |
| --- | --- | --- |
| CI/CD with GitHub Actions | GitLab CI | Repository, MRs, reviews, and merge checks live on GitLab; GitHub is only a mirror and cannot block a GitLab merge. |

## Tracker (P-TRK-1…4)

Every change starts with an issue (§3). Each issue has: description, acceptance criteria, weight, assignee, sprint milestone, exactly one `type::` label, and exactly one `status::` label. Bugs and defects are always recorded as their own issue.

### Labels

| Label | Meaning |
| --- | --- |
| `type::feature` | Feature issue — a group epic here — parent of the feature's story issues (`work-items/<feature>/feature.md`, P-DOC-6, P-TRK-4) |
| `type::story` | User story issue (`US-n`), child of its feature issue; slice issues are children of their story |
| `type::bug` | Defect against an existing requirement |
| `type::concept` | Tracking issue for concept authoring on a `concept/…` branch, one per roadmap feature |
| `type::request` | Raw incoming feature request; enters the concept process via the inbox (`/engineering-human triage`) |
| `type::documentation` | Documentation work that belongs to no single story (project-specific) |
| `status::backlog` | Not planned for a sprint yet (project-specific; first board column) |
| `status::ready` / `status::in-progress` / `status::review` | Board columns |
| `status::done` | Finished; set at the merge (project-specific; last board column) |
| `status::blocked` | Blocked by an open point; no board column, set by hand (project-specific) |
| `status::needs-triage` / `status::needs-info` / `status::wontfix` | Triage states of raw incoming issues |
| `for::human` | Ready, but cannot be delegated to an agent |
| `priority::high` / `priority::medium` / `priority::low` | Urgency, optional (project-specific) |
| `area::ui` / `area::api` / `area::infrastructure` | Affected part of the system, optional (project-specific) |
| `env::development` / `env::staging` / `env::production` | Deployment context, optional (project-specific) |
| `wayfinder:map`, `wayfinder:research` / `prototype` / `grilling` / `task` | Map and decision tickets of `/engineering-human wayfind` |

### Board

The GitLab issue board "Kanban" has one column per status label: Backlog, Ready, In Progress, Review, Done. Moving a card changes the `status::` label.

### Templates

GitLab — issues: `.gitlab/issue_templates/feature.md`, `.gitlab/issue_templates/user-story.md`, `.gitlab/issue_templates/bug.md`; merge requests: `.gitlab/merge_request_templates/default.md`.

### Issues and weight

Every roadmap feature has one **concept issue** (`type::concept`, assignee = feature owner); its owner starts the concept with `/engineering-human <feature>`. Story and slice issues are cut from the approved concept with `/engineering-human tickets <feature>`, one track per person.

Weight is the relative effort on the scale 1, 2, 3, 5, 8 (P-TRK-3). The expected hours are the issue's time estimate. A slice issue is cut so that it fits into 4 h, one person's weekly project time; a story that needs more gets several slices.

### Sprints and time budget

- Project time: **4 h per person per week**, during school hours only.
- One milestone per sprint: `Sprint <n>`. A sprint ends on the **last Tuesday of the month** with the sprint review. If that lesson is cancelled, the review is in the next project lesson.
- The release MR `dev` → `main` is merged **by the Monday before** the sprint review; feature MRs for the sprint are merged into `dev` before the release MR is opened.
- One sprint = one GitLab milestone = one release `v0.<sprint>.0` (P-VER-2).
- Final submission: **2027-04-06** (Tuesday); last merge to `main` on 2027-04-05.

| Sprint | Start | Last merge to `main` | Review |
| --- | --- | --- | --- |
| Sprint 1 | 2026-09-30 | 2026-10-26 | 2026-10-27 |
| Sprint 2 | 2026-10-28 | 2026-11-23 | 2026-11-24 |
| Sprint 3 | 2026-11-25 | 2026-12-28 | 2026-12-29 |
| Sprint 4 | 2026-12-30 | 2027-01-25 | 2027-01-26 |
| Sprint 5 | 2027-01-27 | 2027-02-22 | 2027-02-23 |
| Sprint 6 | 2027-02-24 | 2027-03-29 | 2027-03-30 |
| Final | 2027-03-31 | 2027-04-05 | 2027-04-06 (submission) |

Reviews that fall into school holidays move to the next project lesson; the team enters the holiday weeks per sprint at sprint planning, because they reduce that sprint's capacity.

## Merge requests (P-MR-1…6)

- Target: `dev`; `main` only for releases (P-VER-1).
- Title: plain-language summary with the story ID, e.g. `SCF-US-3 Status page: one row per unit`.
- Description (MR template): `Closes #<issue>`, what changes for the user, summary of the implementation, tested functions, consistency-check result, and the Definition of Done check — IDs always with their titles.
- Reviewer: a person other than the author checks the acceptance criteria and the DoD explicitly and leaves a short, content-related comment (§10, P-MR-2).
- Merging: the author never merges their own MR (§11); an agent merges only via `/engineering-human merge` under the merge policy (P-MR-4).
- Every review thread is resolved and the pipeline is green before merging.
- Merge method: merge commit (no squash, P-GIT-3).

## Time tracking

Record time on the issue or MR with `/spend` (§9): one entry per work session, **at most 50 minutes**, with the activity and the issue/MR reference. Review and MR work is recorded as well. Agents never book time (P-TIME-1).

## Definition of Done

An issue is done, and its MR may be merged, only when every item holds:

1. All acceptance criteria `AC-n.m` of the issue are met and demonstrated by a passing acceptance test carrying the AC ID.
2. All tests pass in CI; no test is skipped without a written reason in the MR.
3. Every commit follows "Commit messages" above; every commit touching production code names a requirement ID (P-GIT-4).
4. The owning concept document (and Part H, if affected) is updated in the same MR (P-GIT-5, P-HUM-3).
5. The consistency check (goal → story → requirement) shows no new orphan or contradiction if documentation changed.
6. `pnpm run lint` and `biome check` report no errors.
7. The MR title, description, and commit subjects are understandable without looking up IDs (P-GIT-4, P-MR-1, P-HUM-4).
8. A person other than the author reviewed the MR against this list and commented (P-MR-2).
9. Status is current: the MR carries the position in the developer's `team/<handle>/STATUS.md` and the *Status* stage in `ROADMAP.md` for the state after the merge, and the issue is closed or confirmed at the merge (P-ROAD-4).
10. `pre-commit run --all-files` passes: no secrets (Gitleaks), no Semgrep errors, no high/critical vulnerabilities (`pnpm audit --prod`).
11. TypeScript uses explicit types throughout; the linter reports no `any`.
12. No `.env`, secrets, or build output are committed; new environment variables are in `.env.example`.
13. The MR was merged without squash; the branch still exists.
14. Time is recorded per "Time tracking", including the review.

## Releases (P-VER-1…3)

Run `/engineering-human release [<version>]`:

1. Merge `dev` → `main` via a release MR (§15.1) that includes the curated `CHANGELOG.md` section, as the release merge key allows (P-MR-5).
2. Create the annotated tag `v<version>` on `main` (§15.2).
3. Publish a GitLab Release for the tag, linked to the sprint milestone (§15.4), with release notes listing the closed stories (`US-n`, with titles).
4. Set the *Status* stage of every included feature in `ROADMAP.md` to `released` (P-ROAD-4).
