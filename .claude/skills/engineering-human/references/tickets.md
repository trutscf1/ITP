# Tickets procedure

Loaded by `/engineering-human tickets <feature>`. It replaces the generic `/to-tickets` skill, which the model cannot invoke; the procedure is adapted from mattpocock/skills (see README, *Credits*). The main difference: the unit is the **user story**, not the tracer-bullet slice, and the issues mirror the work-item tree *feature → user story → slice* in `documentation/work-items/<feature>/` (P-DOC-6, P-TRK-2).

## Gate

Stop and report what is missing unless all of these hold:

1. The concept passed the Phase 4 sign-off (in team mode: the PM approver's MR approval).
2. §16 *Vertical Slices Breakdown* and §17 exist, every slice lists the stories and acceptance criteria it delivers, and the *Slices* table of every story file lists the slices that deliver it.
3. The consistency check for this concept is empty: `node tools/doc-check.mjs` reports no error and no warning for the concept document, and the semantic steps of the check found nothing open.
4. `docs/agents/issue-tracker.md` exists (written by setup); it says how to talk to the tracker.
5. On GitLab, the tier is re-checked now (P-TRK-4, *Tier check* in `docs/agents/issue-tracker.md`) and *Host tier* in `WORKFLOW.md` matches it. Premium or Ultimate with the project in a group means native child items; anything else means the `Part of` form.

## Draft

1. One **feature issue** from `feature.md` — on GitLab Premium or Ultimate a group epic (P-TRK-4): title = the ROADMAP feature name, label `type::feature`, body from the feature issue template (the feature goal of concept §1 as a link, the list of story issues). If it already exists, reuse it.
2. One **story issue** per story file, in the order of `feature.md`, as a child of the feature issue:
   - Title: `<DOC>-US-<n> <Title>` (`QE-US-3 Reuse questions`).
   - Body from the user-story issue template: the story sentence, the `AC-n.m` rows copied verbatim from the story file, the links to the story file and the concept document, weight, milestone.
   - Weight on the scale 1, 2, 3, 5, 8 (P-TRK-3). A story above 8 is split in its story file first; then draft again.
3. A story that spans several §16 slices gets the extra slices (rows 2 and later of its *Slices* table) as **child issues** of the story issue, each with *What to build* (the end-to-end behavior from the user's view), the `AC` IDs it delivers, and *Blocked by*.
4. Blocking edges come from §16: a ticket is blocked by every ticket that must be merged before it can start. Prefactoring named in §16 comes first.
5. **Wide refactors** are the one exception to vertical slicing: one mechanical change whose blast radius spans the codebase (rename a column, retype a shared symbol). Cut it as expand → migrate in batches → contract, each step its own child issue that lands green.
6. No source-file paths or code in issue bodies — they go stale; links to the work-item files and the concept document are required. The only exception is a decision-rich snippet from a prototype (schema, state machine), marked as such.

## Confirm

Show the draft as one `Q<n>` ([Asking the developer](../SKILL.md#asking-the-developer)): the tree feature → stories → slices with title, weight, milestone, *Blocked by*, and what each delivers. Ask whether the granularity, the weights, and the edges are right; iterate until confirmed. Nothing is published before that (override 6).

## Publish

1. Create the feature issue first, then the story and slice issues in dependency order (blockers first) so edges can reference real numbers, with the commands in `docs/agents/issue-tracker.md` (`glab` or `gh`).
2. Labels `type::feature` on the feature issue, `type::story` and `status::ready` on story and slice issues; the sprint milestone; the assignee if known.
3. Edges: native blocking links where the host has them (GitHub issue dependencies; GitLab Premium `/blocked_by`), otherwise a `Blocked by: #<n>` line at the top of the body. Children: GitHub sub-issues; on GitLab Premium or Ultimate, story issues as native child items of the feature epic; otherwise, and for slice issues on GitLab at every tier, `Part of #<parent>` at the top of the body plus a related-issue link (P-TRK-4). If creating the epic or the child link fails with `403`, the tier was wrong: fall back to the `Part of` form, correct *Host tier* in `WORKFLOW.md`, and report it.
4. Write the issue numbers back in the same commit: the feature issue (`#<n>`, or `&<n>` for a GitLab epic) into `feature.md`, the story issue into its story file, each slice issue into the *Issue* column of its *Slices* row (P-TRK-2). This commit goes on the concept branch or a `chore/tickets-<feature>` branch with an MR (P-GIT-2).
5. The feature issue is closed by [merge](../SKILL.md#merge) once its last story issue is closed, never earlier.

## Status

Per P-ROAD-4: ROADMAP stage `ready`; position row → Phase 7 with the first unblocked issue as the next step; a log entry listing the created issues with their titles.
