---
doc: workflow
format: engineering-human/2
title: Workflow
audience: [developer, reviewer, agent]
---
# Workflow

How work moves through this repo — branches, labels, merge requests, the Definition of Done, releases — for every developer and reviewer, and for agents before they open a branch or an MR. The general rules come from the engineering profile (IDs in parentheses); this file records only the values specific to this project.

## Mode

- **Mode:** [solo | team] (P-TEAM-1…5; team roster and roles in `team/TEAM.md`)
- **Git host / tracker:** [GitLab | GitHub] — [project URL]
- **Time tracking:** [off | on for humans] (P-TIME-1)
- **Host tier:** [GitLab Free | GitLab Premium/Ultimate | GitHub] — determined by the agent's tier check, not assumed, and re-checked before every `tickets` publish (P-TRK-4). On GitLab Premium/Ultimate in a group, features are group epics with the story issues as native child items; on GitLab Free, scoped labels are not exclusive, issue weight lives in the description, required approvals are checked by the agent, and the hierarchy is kept by `Part of` links (P-TRK-1, P-TRK-4)
- **Merge policy:** the keys `env.ENGINEERING_HUMAN_MERGE`, `env.ENGINEERING_HUMAN_APPROVALS`, and `env.ENGINEERING_HUMAN_RELEASE_MERGE` in `.claude/settings.json` (P-MR-4…6). The values live only there; they are not copied into this file. Show or change them with `/engineering-human settings`.

## Branches (P-GIT-1…3)

| Branch | Purpose | Protection |
| --- | --- | --- |
| `main` | Tested releases only; merged from `dev` for a release | Protected: no direct push, merge by [role] |
| `dev` | Integration branch; never deleted | Protected: no direct push, no squash merge |
| `feature/<issue-id>-<slug>`, `fix/<issue-id>-<slug>` | Work branches, created from the issue; deleted after merge | — |
| `concept/<feature>` | Concept authoring; no issue needed (optionally tracked by a `type::concept` issue); deleted after merge | — |
| `chore/<slug>` | Repo configuration without behavior change (e.g. merge settings); no issue needed; deleted after merge | — |

## Tracker (P-TRK-1…3)

### Labels

| Label | Meaning |
| --- | --- |
| `type::feature` | Feature issue — a group epic on GitLab Premium/Ultimate — parent of the feature's story issues (`work-items/<feature>/feature.md`, P-DOC-6, P-TRK-4) |
| `type::story` | User story issue (`US-n`), child of its feature issue; slice issues are children of their story |
| `type::bug` | Defect against an existing requirement |
| `type::concept` | Optional tracking issue for concept authoring on a `concept/…` branch |
| `status::ready` / `status::in-progress` / `status::review` | Board columns |
| `type::request` | Raw incoming feature request; enters the concept process via the inbox (`/engineering-human triage`) |
| `status::needs-triage` / `status::needs-info` / `status::wontfix` | Triage states of raw incoming issues |
| `for::human` | Ready, but cannot be delegated to an agent |
| `wayfinder:map`, `wayfinder:research` / `prototype` / `grilling` / `task` | Map and decision tickets of `/engineering-human wayfind` |
| [project-specific labels] | [meaning] |

### Templates

- GitLab — issues: `.gitlab/issue_templates/feature.md`, `.gitlab/issue_templates/user-story.md`, `.gitlab/issue_templates/bug.md`; merge requests: `.gitlab/merge_request_templates/default.md`
- GitHub — issues: `.github/ISSUE_TEMPLATE/feature.md`, `.github/ISSUE_TEMPLATE/user-story.md`, `.github/ISSUE_TEMPLATE/bug.md`; pull requests: `.github/pull_request_template.md`. Weight: [in the issue description | Projects number field `Weight`]

[Keep the line of the host in use; delete the other.]

### Sprints

One milestone per sprint: `Sprint <n>` with start and end date. Sprint length: [n weeks]. Every issue on the board belongs to a milestone once it is planned.

## Merge requests (P-MR-1…6)

- Target: `dev`; `main` only for releases (P-VER-1).
- Title: plain-language summary with the story ID, e.g. `QE-US-3 Reuse questions: copy with duplicate check`.
- Description (MR template): `Closes #<issue>`, what changes for the user, summary of the implementation, tested functions, consistency-check result — IDs always with their titles.
- Reviewer: a person other than the author checks the acceptance criteria and the DoD and leaves a content comment (P-MR-2); under merge policy `auto` (solo mode only) the recorded clean `/engineering-human review` takes this place.
- Merging: the author never merges on their own authority; an agent merges only via `/engineering-human merge` under the merge policy (P-MR-4).
- Merge method: merge commit (no squash).

## Definition of Done

An issue is done, and its MR may be merged, only when every item holds:

1. All acceptance criteria `AC-n.m` of the issue are met and demonstrated by a passing acceptance test carrying the AC ID.
2. All tests pass in CI; no test is skipped without a written reason in the MR.
3. Every commit touching production code names a requirement ID (P-GIT-4).
4. The owning concept document (and Part H, if affected) is updated in the same MR (P-GIT-5, P-HUM-3).
5. The consistency check (goal → story → requirement) shows no new orphan or contradiction if documentation changed.
6. Linters and formatters report no errors.
7. The MR title, description, and commit subjects are understandable without looking up IDs (P-GIT-4, P-MR-1, P-HUM-4).
8. A person other than the author reviewed the MR against this list and commented — or, under merge policy `auto` in solo mode, a clean `/engineering-human review` is recorded on the MR (P-MR-2).
9. Status is current: the MR carries the position in `ROADMAP-DETAILS.md` (or the developer's `STATUS.md`) and the *Status* stage in `ROADMAP.md` for the state after the merge, and the issue is closed or confirmed at the merge; if `documentation/` is not in git, the agent applies the status right after the merge (P-ROAD-4).
10. [Project-specific items]

## Releases (P-VER-1…3)

Run `/engineering-human release [<version>]`:

1. Merge `dev` → `main` via a release MR, as the release merge key allows (P-MR-5).
2. Create the annotated tag `v<version>` on `main`.
3. Publish a release on the git host (GitLab or GitHub Release) for the tag with release notes listing the closed stories (`US-n`, with titles).
4. Set the *Status* stage of every included feature in `ROADMAP.md` to `released` (P-ROAD-4).
