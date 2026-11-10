---
name: gam-delivery
description: Delivery commands of the gam-engineering process (manifest Phase 7 and release) — cut an approved concept's user stories into epic and story issues (tickets), implement one issue test-first with a work branch and MR (implement), build all issues of a feature in parallel subagents with one MR per issue (implement-all), review an MR against its acceptance criteria and the Definition of Done (review), answer review threads (revise), merge under the project's merge policy with the status update (merge), release with tag and notes (release), end a session by saving its state in the project (stopp). Use when /gam-engineering routes here, or when the developer runs /gam-delivery tickets, implement, implement-all, review, revise, merge, release, or stopp.
---

# gam-delivery

The delivery commands of [gam-engineering](../gam-engineering/SKILL.md) run manifest Phase 7 and the release (P-WS-6). Each one starts like every session — read PROFILE.md, `gam-ai-knowledge/GOAL.md`, `gam-ai-knowledge/WORKFLOW.md` (in team mode also `CLAUDE.local.md` and the developer's STATUS.md) — and ends with the status update of P-ROAD-4. In a folder without git they run in the form of [Projects without git](../gam-engineering/references/no-git.md).

Before the first step, apply the shared rules of the core once per session — skip what already ran when the core routed here — [Before anything else](../gam-engineering/SKILL.md#before-anything-else), [Asking the developer](../gam-engineering/SKILL.md#asking-the-developer), [The contract](../gam-engineering/SKILL.md#the-contract), and [Built-in procedures](../gam-engineering/SKILL.md#built-in-procedures). The model line and the delegation of [Models](../gam-engineering/references/models.md) apply to every command, also when the core routed here: print the start line first, and send each step the command's row names to a subagent of its tier instead of running it in the session.

| Invocation | Procedure |
| --- | --- |
| `tickets <feature>` | [references/tickets.md](references/tickets.md) |
| `implement <issue>` | [references/implement.md](references/implement.md) |
| `implement-all <feature>` | [references/implement-all.md](references/implement-all.md) |
| `review <MR>` | [references/review.md](references/review.md) |
| `revise <MR>` | [references/revise.md](references/revise.md) |
| `merge <MR>` | [references/merge.md](references/merge.md) |
| `release [<version>]` | [references/release.md](references/release.md) |
| `stopp` | [references/stopp.md](references/stopp.md) |

## Merge policy

The rules are P-MR-4 (merge policy and approvals), P-MR-5 (release merge), and P-MR-6 (merge guard); read their effective values as [Project settings](../gam-engineering/SKILL.md#project-settings) says. Every merge an agent performs goes through [merge](references/merge.md) or [release](references/release.md) (contract point 8). Under `ask`, the merge guard ([Safeguards](../gam-setup/references/settings.md#safeguards)) prompts in addition to the P-MR-4 pop-up; the pop-up is the decision and the permission prompt only confirms it.

## Overrides for the delivery skills

| # | The skill says | Here instead |
| --- | --- | --- |
| 1 | Generic ticket cutting: one ticket per tracer-bullet slice | Issues mirror the work-item tree: an epic issue (a group epic on GitLab Premium/Ultimate), one child issue per user story, extra slices below their story — built into [references/tickets.md](references/tickets.md) (P-DOC-6, P-TRK-2…4). |
| 2 | Generic implementation: commit to the current branch, done once committed | Work branch from the issue off `dev`, requirement IDs in commits, documentation in the same MR, done only when the MR is open and the Definition of Done holds — built into [references/implement.md](references/implement.md) (P-GIT-2, P-GIT-4, P-GIT-5, P-MR-1). |
| 3 | Generic implementation: resolve questions as you go | A question during synthesis is a documentation defect: fix the concept document or `STACK.md` first, then resume (manifest Phase 7). |
| 4 | `/gam-v-tdd`: tests at seams agreed in conversation | The seams are the ones in concept §16 *Design for Testability*; test names carry the `AC` and requirement IDs (`STACK.md` §6, P-DES-2). |
| 5 | `/gam-v-code-review`: spec from issue, `docs/`, or `specs/` | Spec = the issue plus its story file in `gam-ai-knowledge/work-items/` (the acceptance criteria) and the concept document (the requirements derived from them); standards = `WORKFLOW.md` (Definition of Done) and `gam-ai-knowledge/MANIFEST.md`, on top of the repo's coding standards. |
| 6 | Any skill: publish to the tracker or host right away | Issues, MR comments, and releases are outward-facing: show what will be published and confirm it as a `Q<n>` first, unless this table or P-MR-4 says otherwise. |
| 7 | `/gam-v-verification-before-completion`: prove any claim with fresh evidence | The claims are fixed: every acceptance criterion of the issue (a test carrying its `AC` ID passes in this run) and every Definition of Done item in `WORKFLOW.md`. The full suite and `node gam-ai-knowledge/tools/doc-check.mjs` run fresh; earlier output is never quoted as proof. |
| 8 | `/gam-v-receiving-code-review`: implement or push back on each point | The yardstick for pushing back is the issue's acceptance criteria and the concept document, not taste. A point that changes behavior is fixed in the concept document first (P-GIT-5); fix commits carry requirement IDs (P-GIT-4); replies are published per override 6. |
| 9 | `/gam-v-pre-release-review`: name an inferred owner per finding | Owners are roles from `WORKFLOW.md` or handles from `team/TEAM.md`, never guessed real names (P-TEAM-2). The review stays read-only; only the release command acts on its result. |
| 10 | `/gam-v-pr`: the PR body is *Summary*, *Evidence*, *Merge Danger* | The MR template stays the structure (P-MR-1); `gam-v-pr` only shapes its *Shape of the change* (the smallest visual), the before/after evidence in *What was tested*, and *Merge danger*. Terms come from `gam-ai-knowledge/CONTEXT.md` (the engine's `GLOSSARY.md`). |

## Tickets

Under flow `quick` there are no issues to cut and `implement` builds the plan on its `quick/` branch: [Quick mode: Plan flow](../gam-engineering/references/quick.md#plan-flow).

`/gam-engineering tickets <feature>` (manifest Phase 7, step 1): follow [references/tickets.md](references/tickets.md) — gate, draft the epic issue with one child issue per user story and slice issues below, confirm as a `Q<n>`, publish in dependency order, write the issue numbers back into the work items, story status `ready` in the story files, `BACKLOG.md`, and the sprint files (P-DOC-8), ROADMAP stage `ready` (P-ROAD-4).

## Implement

`/gam-engineering implement <issue>` (manifest Phase 7, steps 2–4), in the same session as the previous issue unless the [session rule](../gam-engineering/references/models.md#session-length) suggests a new one: follow [references/implement.md](references/implement.md) — work branch, `gam-v-tdd` loop, commits with requirement IDs, `gam-v-code-review`, MR with the status for the state after the merge — then continue with [merge](references/merge.md) for this MR. `implement-all <feature>` runs the same procedure in parallel implementer subagents across the epic's ready issues and merges their MRs one at a time ([references/implement-all.md](references/implement-all.md)).
