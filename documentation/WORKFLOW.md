# Workflow

Binds the engineering profile's git decisions (P-GIT-1…6, P-DOC-4, P-VER-1) to this repository's GitLab project and to the school requirements in `docs/`. Commands for every step live in `docs/git_workflow_commands.md` (section numbers below); they are not repeated here. Current status lives in [ROADMAP-DETAILS.md](ROADMAP-DETAILS.md).

## Team

Four developers; each owns the areas and roadmap features assigned in `docs/projektantrag.md` ("Projektgruppe") and [ROADMAP.md](ROADMAP.md). Work is split into **tracks**, one per person: each track owns exclusive paths, its own plan file, and its own issues; tracks meet only at interfaces fixed in the feature's concept document. A change in another track's paths is requested as an issue for that track's owner. Template: `documentation/concepts/scaffolding.md` §15.

## Git host

- GitLab: `htl-villach/it/classes/5bhitm-2026/itp/waent/project1/SJ26_27_5BHITM_ITP_trutscf1_project1`, CLI `glab`.
- Mirror to GitHub with **all branches**; the GitHub user `gamgamstyle` gets the Reporter role (`docs/git_workflow_commands.md` §18).
- Project settings (§2.3): default branch `dev`, merge method `merge`, squash `never`, "delete source branch" off; `dev` and `main` protected with push access for no one.

## Profile decisions and their binding

| ID | Binding in this repo |
| --- | --- |
| P-GIT-1 | Applies as written. The pipeline deploys automatically when `main` is updated. |
| P-GIT-2 | One issue = one branch = one MR into `dev`. Branch names: `concept/<feature>`, `feature/<issue-id>-<slug>`, `fix/<issue-id>-<slug>` — lowercase, hyphens, no umlauts. Branches are created from the latest `dev` (§4.1). **Deviation below: branches are kept.** |
| P-GIT-3 | Applies as written; also required by the school rules. |
| P-GIT-4 | See "Commit messages" below. |
| P-GIT-5 | Applies as written. |
| P-GIT-6 | Every `concept/…` branch also has an issue, and its MR references it with `Closes #<id>`. |
| P-VER-1 | Release = release MR `dev` → `main` (§15.1) including the curated `CHANGELOG.md` section, annotated tag `v<version>` on `main` (§15.2), **and** a GitLab Release linked to the sprint milestone (§15.4). |

## Commit messages

[Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/), binding P-GIT-4:

```text
<type>(<scope>): <imperative description> [<requirement-id>]

<optional body>

Refs: #<issue>
```

- Types: `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `style`, `build`, `ci`, `chore`, `revert`.
- Scopes: a unit (`web`, `identity`, `storage`, `worker`, `cms`), `contracts`, `deps`, `ci`, `repo`.
- Requirement ID per P-GIT-4; `[no-req]` for pure chores.
- Breaking change: `!` after the scope and a `BREAKING CHANGE: <what>` footer.
- Description in English, lowercase start, about 50 characters.
- Checked by a commit-msg hook and in CI. Examples: `documentation/concepts/scaffolding.md` §9, example 4.

## Changelog

`CHANGELOG.md` follows [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/). Feature MRs do not edit it. In the release MR, a command generates a draft for the new version from the commits since the last tag (`feat` → Added, `fix` → Fixed, breaking changes → Changed; other types omitted); the release MR author rewrites the entries for readers and uses `Deprecated`, `Removed`, `Security` where they fit. Example: `documentation/concepts/scaffolding.md` §9, example 5.

## CI/CD

GitLab CI runs on every MR into `dev` and every push to `dev` and `main`; the jobs are defined by `documentation/concepts/scaffolding.md` SCF-F-15. "Pipeline must succeed" is enabled as a merge check. Deployment on push to `main` follows with roadmap item R14.

## Deviations from the profile

| Overrides | Rule here | Reason |
| --- | --- | --- |
| P-GIT-2 (work branches are deleted after merge) | Feature, fix, and concept branches are **never deleted** after merge. | School requirement (`docs/anforderungen_software_projekte.md` §2, §5): the per-branch history is graded. |

## Deviations from the project proposal

Presented at the final presentation (`docs/anforderungen_software_projekte.md`, "Präsentation").

| Proposal says | Rule here | Reason |
| --- | --- | --- |
| CI/CD with GitHub Actions | GitLab CI | Repository, MRs, reviews, and merge checks live on GitLab; GitHub is only a mirror and cannot block a GitLab merge. |

## Issues

Every change starts with an issue (§3). Each issue has: description, acceptance criteria, weight, assignee, sprint milestone, exactly one `type::` label and exactly one `status::` label; `priority::`, `area::`, and `env::` are optional. The label set and its rules are owned by `.gitlab/workflows/labels.md` (its branch names `development` / `develop` mean `dev` here). Bugs and defects are always recorded as their own issue.

**Board:** the GitLab issue board "Kanban" has one column per status label — Backlog, Ready, In Progress, In Review, Done (`.gitlab/workflows/issue_board_setup.md`). Moving a card changes the `status::` label; `status::blocked` has no column and is set by hand.

**Two kinds of issues:** every roadmap item has one **concept issue** `<R>: concept – <feature>` (label `ready-for-human`, owner = feature owner); its owner starts it with `/grill-with-docs <R>`. Implementation issues are cut from the approved concept (`/to-tickets`), one track per person. Triage state is one of the labels in `docs/agents/triage-labels.md`.

**Issue size:** weight = estimated hours. An issue estimated above 4 h (one person's weekly project time) is split before it is scheduled.

## Sprints and time budget

- Project time: **4 h per person per week**, during school hours only.
- A sprint ends on the **last Tuesday of the month** with the sprint review. If that lesson is cancelled, the review is in the next project lesson.
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

## Merge requests and review

- Target `dev`. The description contains `Closes #<id>`, a short summary of the implementation, the tested functions, and the Definition of Done check.
- Review by **another person**: they check the Definition of Done explicitly and leave a short, content-related comment (§10).
- The MR author never merges their own MR (§11).
- Every review thread is resolved and the pipeline is green before merging.

## Time tracking

Record time on the issue or MR with `/spend` (§9): one entry per work session, **at most 50 minutes**, with the activity and the issue/MR reference. Review and MR work is recorded as well.

## Definition of Done

An issue is done when every item holds:

1. All acceptance criteria of the issue are met and were checked in the MR.
2. The owning document in `documentation/` is updated in the same MR (P-GIT-5).
3. Every commit follows the P-GIT-4 binding above.
4. `pnpm run lint`, `biome check`, and all tests pass.
5. `pre-commit run --all-files` passes: no secrets (Gitleaks), no Semgrep errors, no high/critical vulnerabilities (`pnpm audit --prod`).
6. TypeScript uses explicit types throughout; the linter reports no `any`.
7. No `.env`, secrets, or build output are committed; new environment variables are in `.env.example`.
8. The MR meets the "Merge requests and review" rules above and was merged without squash; the branch still exists.
9. Time is recorded per "Time tracking", including the review.
