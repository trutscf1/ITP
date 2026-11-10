---
doc: workflow
format: gam-ai-knowledge/1
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

Four developers (`team/TEAM.md`); each owns the areas assigned in `docs/projektantrag.md` ("Projektgruppe") and the roadmap features in the Owner column of [ROADMAP.md](ROADMAP.md). Work is split into **tracks**, one per person: each track owns exclusive paths, its own plan file, and its own issues; tracks meet only at interfaces fixed in the feature's concept document. A change in another track's paths is requested as an issue for that track's owner. Template: `gam-ai-knowledge/concepts/scaffolding.md` §16.

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
- Scopes: a unit (`web`, `identity`, `storage`, `worker`, `cms`), a shared package (`contracts`, `ui`, `config`, `db`), `deps`, `ci`, `repo`. The scope may be left out when no single one fits (for example `ci: …` for a change to the pipeline itself).
- Requirement ID per P-GIT-4; `[no-req]` for pure chores.
- Breaking change: `!` after the scope and a `BREAKING CHANGE: <what>` footer.
- Description in English, lowercase start, about 50 characters, understandable without looking the ID up.
- Checked by commitlint (`commitlint.config.ts`) in the commit-msg hook and again in CI (job `commit-messages`). The hook is active after `pre-commit install` in each clone. Examples: `gam-ai-knowledge/concepts/scaffolding.md` §10, example 4.
- Exception: the three commits on `dev` from before the workflow (`a8c6590ad` "setup", `3ea2a4675` "feat: added prisma", `231f5773e` "added mongoDB to docker stack") cannot be rewritten, so `commitlint.config.ts` lets exactly these messages pass. Without it, the job `commit-messages` of every release MR `dev` → `main` fails (review of !36).

## Changelog

`CHANGELOG.md` follows [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/). Feature MRs do not edit it. In the release MR, `pnpm run changelog:draft` generates a draft for the new version from the commits since the last tag (`feat` → Added, `fix` → Fixed, breaking changes → Changed; other types omitted); the release MR author rewrites the entries for readers and uses `Deprecated`, `Removed`, `Security` where they fit. Example: `gam-ai-knowledge/concepts/scaffolding.md` §10, example 5.

## CI/CD

GitLab CI (`.gitlab-ci.yml`) runs one pipeline per change: a merge request pipeline while an MR is open, otherwise a branch pipeline on every push to a feature branch, `dev`, or `main`; the jobs are defined by `gam-ai-knowledge/concepts/scaffolding.md` SCF-F-15, plus the documentation checks in `.gitlab/ci/docs.yml` (markdown lint and `gam-ai-knowledge/tools/doc-check.mjs`, including the rule `AC-TEST` for tests carrying the `AC` IDs). "Pipeline must succeed" is enabled as a merge check. Deployment on push to `main` follows with roadmap item R14.

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
| Reverse proxy Traefik ≥ 3.6.10 with Let's Encrypt (HTTP-01), an optional extra requirement of the school (`docs/anforderungen_software_projekte.md`, "Eventuelle Zusatzanforderungen") | Caddy (`caddy:2.11-alpine`) in the local stack and on the server, with its automatic HTTPS from Let's Encrypt (HTTP-01) | One proxy for both: the local stack, the routes of `docker/Caddyfile`, and the session check of the observability dashboards (`forward_auth`, `STACK.md` OBS-C-7) already use Caddy; a second proxy would double the configuration. The school's TLS and routing requirements (§9) are met either way (Q265). |

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
| `type::technical-improvement` | Technical improvement, refactoring, or tooling that belongs to no story (project-specific); its acceptance criteria stand in the issue without `AC` IDs, and its tests name the issue number |
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

Weight is the relative effort on the scale 1, 2, 3, 5, 8 (P-TRK-3). The expected hours are the issue's time estimate. A slice issue is cut so that it fits into one project lesson of 200 minutes; a story that needs more gets several slices.

### Sprints and time budget

- Project time: **Tuesday, 200 minutes per person**, during school hours only and not in school holidays. On a review Tuesday only about half of it is working time.
- One milestone per sprint: `Sprint <n>`, plus `Final`. The **sprint review is on the dates in the table** (the Tuesdays set by the team); the milestone ends the **day before**, on the Monday that is also the last merge to `main`.
- The release MR `dev` → `main` is merged by that Monday; feature MRs for the sprint are merged into `dev` before the release MR is opened.
- One sprint = one GitLab milestone = one release `v0.<sprint>.0` (P-VER-2); the final release is `v1.0.0`, a MAJOR bump that is confirmed as a question (P-VER-2).
- Final submission: **2027-04-06** (Tuesday); last merge to `main` on 2027-04-05.
- What each milestone must contain when it ends is defined in [ROADMAP.md](ROADMAP.md), chapter "Milestones", and copied into the description of the GitLab milestone.

| Sprint | Start | Last merge to `main` (milestone due) | Review | Release |
| --- | --- | --- | --- | --- |
| Sprint 1 | 2026-09-30 | 2026-11-02 | 2026-11-03 | `v0.1.0` |
| Sprint 2 | 2026-11-03 | 2026-11-23 | 2026-11-24 | `v0.2.0` |
| Sprint 3 | 2026-11-24 | 2027-01-11 | 2027-01-12 | `v0.3.0` |
| Sprint 4 | 2027-01-12 | 2027-01-25 | 2027-01-26 | `v0.4.0` |
| Sprint 5 | 2027-01-26 | 2027-02-22 | 2027-02-23 | `v0.5.0` |
| Sprint 6 | 2027-02-23 | 2027-03-15 | 2027-03-16 | `v0.6.0` |
| Final | 2027-03-16 | 2027-04-05 | 2027-04-06 (submission) | `v1.0.0` |

School holidays (assumed: Christmas 2026-12-24 … 2027-01-06, 2026-12-08, semester break 2027-02-08 … 02-13, Easter 2027-03-22 … 03-29) are corrected at sprint planning, because they reduce that sprint's capacity. Capacity and the planned load per person and sprint are in [ROADMAP.md](ROADMAP.md), chapter "Capacity".

### Sprint cycle: documents first, code generated, tests first (ADR-0005)

Every sprint runs the same five steps; the exit criteria of each milestone are in [ROADMAP.md](ROADMAP.md).

1. **Concept.** The concept documents of the sprint's features reach `ready`: phases 1–6 including §17 (tests carrying the `AC` IDs), work items, issues cut.
2. **Generate, tests first.** From the ready documents the code is generated per story: first a `test(<scope>): … [AC-ID]` commit with failing tests, then `feat`/`fix` commits until they pass. One MR per story.
3. **Review** by another person in the last working lesson; fixes with `/engineering-human revise`.
4. **Release.** Release MR by the milestone due date, tag `v0.<sprint>.0`, `CHANGELOG.md`, status current (P-ROAD-4).
5. **Regeneration probe.** One feature of the sprint is regenerated in an empty worktree from its concept document and tests alone; its acceptance tests must pass. The result (feature, passed or not, what was missing from the documents) is logged in `ROADMAP-DETAILS.md`; every gap found is fixed in the documents first.

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

1. All acceptance criteria `AC-n.m` of the issue are met and demonstrated by a passing acceptance test carrying the AC ID. `gam-ai-knowledge/tools/doc-check.mjs` rule `AC-TEST` checks that a test name carries the ID; in the MR pipeline it fails for every criterion the MR's slice delivers that has none (`MANIFEST.md`, "What the script checks").
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
15. Test first (ADR-0005): on the story's branch, a `test(<scope>): … [AC-ID]` commit with the failing tests of the story's acceptance criteria comes before the first `feat` or `fix` commit that touches production code; the MR checklist confirms it.
16. Every acceptance criterion of the story is covered by a test whose name carries its `AC` ID (check: `gam-ai-knowledge/tools/doc-check.mjs` rule `AC-TEST`, once built; until then the reviewer checks it by hand).

17. Layers stay separate (school requirement §1): pages and UI components hold no business rule and no database statement, business logic sits in the unit that owns it (ADR-0001), and every database access goes through the access layer of the package `db` (`STACK.md` SCF-C-19).
18. Dependencies and content (school requirements §3, §10): no SaaS service replaces a core function (authentication, database logic, business logic); no experimental or unmaintained dependency, except an exception recorded as an ADR (ADR-0006, Prisma 8 release candidate); every committed image, font, text, and dependency is licence-free, because the repository is public (`concepts/scaffolding.md` SCF-F-28, licence notes).
19. Keys and encryption (school requirements, "Projektanforderungen"): symmetric encryption uses at least AES-256-GCM; its key comes from `.env` on the server or from a key vault (Azure Key Vault, AWS KMS, or HashiCorp Vault), never from the code or the repository; no own cryptographic algorithm (`G-1.N5`); an end-to-end encryption, if it is built (O1), uses libsodium.
20. User interface (school requirements §10): a changed page is built mobile first, readable at 320 pixels without horizontal scrolling, and usable with keyboard and screen reader; the automated accessibility check reports no violation (`G-1.S2`).

Items 15 and 16 apply from the day the sprint plan is merged into `dev`, to work that begins after that day. Items 17 to 20 apply from the day of the merge request `chore/school-requirements-gaps`, to work that begins after that day; they restate school requirements that were already binding through `docs/`, and the reviewer checks them in the MR like items 1 to 14. Merge requests that are already open on that day (`!5`, `!7`, `!9`, `!14`) were written before the rule and are not blocked on these two items; their reviewers check items 1 to 14.

## Releases (P-VER-1…3)

Run `/engineering-human release [<version>]`:

1. Merge `dev` → `main` via a release MR (§15.1) that includes the curated `CHANGELOG.md` section, as the release merge key allows (P-MR-5).
2. Create the annotated tag `v<version>` on `main` (§15.2).
3. Pushing the tag publishes the GitLab Release: the CI jobs `release-notes` and `release` take the tag's section of `CHANGELOG.md` as release notes and fail for a tag that is not SemVer or has no section (SCF-AC-6.3). The curated section therefore lists the closed stories (`US-n`, with titles); link the release to the sprint milestone afterwards (§15.4).
4. Set the *Status* stage of every included feature in `ROADMAP.md` to `released` (P-ROAD-4).
