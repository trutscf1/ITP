<!-- markdownlint-disable-file MD041 -->
<!-- MR title: "<DOC>-US-<n> <Story title>: <what this MR does, in plain words>" -->

## Issue

Closes #[issue number] — [story ID and title, e.g. `QE-US-3` (reuse questions)]

## What changes for the user

[One to three plain sentences a non-developer understands. No IDs needed here.]

## What was implemented

[Two or three sentences for the reviewer; name requirement IDs with their titles, e.g. `[QE-F-6]` (duplicate check)]

## What was tested

| Function / acceptance criterion | How it was tested | Result |
| --- | --- | --- |
| [QE-AC-3.1] (copy keeps answers) | [acceptance test name or manual steps] | [pass] |

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
- [ ] Test first: a `test(...)` commit with the `AC` ID comes before the first code commit (DoD item 15)
- [ ] Title, description, and commit subjects are understandable without looking up IDs
- [ ] Content comment left on this MR
