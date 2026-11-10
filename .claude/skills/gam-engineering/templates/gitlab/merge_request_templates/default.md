<!-- markdownlint-disable-file MD041 -->
<!-- MR title: "<DOC>-US-<n> <Story title>: <what this MR does, in plain words>" -->

## Issue

Closes #[issue number] — [story ID and title, e.g. `QE-US-3` (reuse questions)]

## What changes for the user

[One to three plain sentences a non-developer understands. No IDs needed here.]

## What was implemented

[Two or three sentences for the reviewer; name requirement IDs with their titles, e.g. `[QE-F-6]` (duplicate check)]

## Shape of the change

[The smallest visual that makes the change clear: pseudocode, a call tree, a file tree, a Mermaid diagram, or a diff sketch. Only the parts the reviewer needs.]

## What was tested

| Function / acceptance criterion | How it was tested | Before | After |
| --- | --- | --- | --- |
| [QE-AC-3.1] (copy keeps answers) | [acceptance test name or manual steps] | [fails: answers lost] | [passes] |

[For a changed screen: a screenshot per theme (P-DES-9). Execution evidence (test run, console output) otherwise.]

## Merge danger

**Door:** [two-way: easy to roll back | one-way: hard to undo, e.g. data migration, deleted data, published interface]

**Blast radius:** [one word, e.g. none, layout, consumers, data] — [what could break if this MR is wrong]

## Documentation

- [ ] Concept document updated in this MR (or: no behavior change)
- [ ] Part H updated if an affected chapter changed
- [ ] Consistency check: no new orphan or contradiction
- [ ] Status for the state after this merge: position in `ROADMAP-DETAILS.md` (or `STATUS.md`) and stage in `ROADMAP.md` (P-ROAD-4)

Consistency-check result: ["no findings" or the list: child ID — parent ID — conflict]

## Reviewer checklist

To be completed by a person other than the author. The merge itself follows the merge policy in `.claude/settings.json` (P-MR-4); under `auto` (solo mode) the recorded `/gam-engineering review` completes this list.

- [ ] All acceptance criteria of the issue are met
- [ ] Definition of Done (`gam-ai-knowledge/WORKFLOW.md`) is fully met
- [ ] Title, description, and commit subjects are understandable without looking up IDs
- [ ] Content comment left on this MR
