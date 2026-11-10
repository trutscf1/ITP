# Tickets procedure

Loaded by `/gam-engineering tickets <feature>`. It replaces the generic `/to-tickets` skill, which the model cannot invoke; the procedure is adapted from mattpocock/skills (see README, *Credits*). The main difference: the unit is the **user story**, not the tracer-bullet slice, and the issues mirror the work-item tree *epic → user story → slice* in `gam-ai-knowledge/work-items/E<nn>-<feature>/` (P-DOC-6, P-TRK-2).

## Gate

Stop and report what is missing unless all of these hold:

1. The concept passed the Phase 4 sign-off (in team mode: the PM approver's MR approval).
2. §16 *Vertical Slices Breakdown* and §17 exist, every slice lists the stories and acceptance criteria it delivers, and the *Slices* table of every story file lists the slices that deliver it.
3. The consistency check for this concept is empty: `node gam-ai-knowledge/tools/doc-check.mjs` reports no error and no warning for the concept document, and the semantic steps of the check found nothing open.
4. The builder check ran on the current documentation set and left no open point ([Concept checks: Builder check](../../gam-concept/references/concept-checks.md#builder-check)); the session starts it on the check tier when the log shows no run after the last change.
5. `gam-engineering/agents/issue-tracker.md` exists (written by setup); it says how to talk to the tracker.
6. On GitLab, the tier is re-checked now (P-TRK-4, *Tier check* in `gam-engineering/agents/issue-tracker.md`) and *Host tier* in `WORKFLOW.md` matches it. Premium or Ultimate with the project in a group means native child items; anything else means the `Part of` form.

## Draft

1. One **epic issue** from `epic.md` — on GitLab Premium or Ultimate a group epic (P-TRK-4): title = the ROADMAP feature name, label `type::epic`, body from the epic issue template (the feature goal of concept §1 as a link, the list of story issues). If it already exists, reuse it.
2. One **story issue** per story file, in the order of `epic.md`, as a child of the epic issue:
   - Title: `<DOC>-US-<n> <Title>` (`QE-US-3 Reuse questions`).
   - Body from the user-story issue template: the story sentence, the `AC-n.m` rows copied verbatim from the story file, the links to the story file and the concept document, weight, milestone.
   - Weight on the scale 1, 2, 3, 5, 8 (P-TRK-3). A story above 8 is split in its story file first; then draft again.
3. A story that spans several §16 slices gets the extra slices (rows 2 and later of its *Slices* table) as **child issues** of the story issue, each with *What to build* (the end-to-end behavior from the user's view), the `AC` IDs it delivers, and *Blocked by*.
4. Blocking edges come from §16 and from each story file's *Depends on* line (P-QB-3): a ticket is blocked by every ticket that must be merged before it can start. Prefactoring named in §16 comes first.
5. **Wide refactors** are the one exception to vertical slicing: one mechanical change whose blast radius spans the codebase (rename a column, retype a shared symbol). Cut it as expand → migrate in batches → contract, each step its own child issue that lands green.
6. No source-file paths or code in issue bodies — they go stale; links to the work-item files and the concept document are required. The only exception is a decision-rich snippet from a prototype (schema, state machine), marked as such.

## Confirm

Read *Sprint mode* in `WORKFLOW.md` first (P-TRK-1). If it is missing — a project set up before the modes existed — ask for it as a `Q<n>` before the draft and add it to `WORKFLOW.md` in the write-back commit (Publish, step 4).

Show the draft as one `Q<n>` ([Asking the developer](../../gam-engineering/SKILL.md#asking-the-developer)): the tree epic → stories → slices with title, weight, milestone, *Blocked by*, and what each delivers. Ask whether the granularity, the weights, and the edges are right; iterate until confirmed. Nothing is published before that (override 6 of [gam-delivery](../SKILL.md#overrides-for-the-delivery-skills)).

## Publish

1. Create the epic issue first, then the story and slice issues in dependency order (blockers first) so edges can reference real numbers — never a placeholder `#<n>`, which links to an unrelated issue — with the commands in `gam-engineering/agents/issue-tracker.md` (`glab` or `gh`; with the local markdown tracker, one issue file each).
2. Labels `type::epic` on the epic issue, `type::story` and `status::ready` on story and slice issues; the sprint milestone in the form of the sprint mode (`Sprint <n>`, in `goal` mode `Sprint <n> — <goal>`); the assignee if known.
3. Edges: native blocking links where the host has them (GitHub issue dependencies; GitLab Premium `/blocked_by`), otherwise a `Blocked by: #<n>` line at the top of the body; where the native link is set, the body carries no *Blocked by* section, so the two cannot disagree. Children: GitHub sub-issues; on GitLab Premium or Ultimate, story issues as native child items of the group epic; otherwise, and for slice issues on GitLab at every tier, `Part of #<parent>` at the top of the body plus a related-issue link (P-TRK-4). If creating the epic or the child link fails with `403`, the tier was wrong: fall back to the `Part of` form, correct *Host tier* in `WORKFLOW.md`, and report it.
4. Write the issue numbers back in the same commit: the epic issue (`#<n>`, or `&<n>` for a GitLab epic) into `epic.md`, the story issue into its story file, each slice issue into the *Issue* column of its *Slices* row (P-TRK-2). In the same commit every published story gets `status: ready` and, if it was given a milestone, `sprint: <n>`; its row in `work-items/BACKLOG.md` follows, and a story with a sprint is added to `work-items/sprints/sprint-<n>.md`, created from [templates/work-items/sprints/sprint.md](../../gam-ai-knowledge/templates/work-items/sprints/sprint.md) if it does not exist yet (P-DOC-8). This commit goes on the concept branch or a `chore/tickets-<feature>` branch with an MR (P-GIT-2); without git the numbers are written in place (P-GIT-7).
5. The epic issue is closed by [merge](merge.md) once its last story issue is closed, never earlier.

## Status

Per P-ROAD-4: ROADMAP stage `ready`; `BACKLOG.md` and the sprint files match the story files (`node gam-ai-knowledge/tools/doc-check.mjs` reports no `BL` finding); position row → Phase 7 with the first unblocked issue as the next step; a log entry listing the created issues with their titles.
