# Issue tracker: local markdown

Issues for this repo live as markdown files, for solo projects without a git host. Merge requests do not exist here: a work branch is merged after the merge-policy decision of P-MR-4, and the MR description goes into the issue file under `## Merge`.

## Issues

- **Location:** `.scratch/<feature>/issues/<NN>-<slug>.md`, numbered from `01` in dependency order; one file per issue.
- **Header lines:** `Status: ready | in-progress | review | done`, `Type: feature | story | bug | concept`, `Part of: NN` (the parent issue, or `none`), `Weight: <n>`, `Blocked by: NN, NN` (or `none`).
- **Body:** the feature or user-story issue template from `documentation/WORKFLOW.md`.
- **Comments:** appended under `## Comments` at the bottom, each with date and handle.
- **Close:** set `Status: done`.

## Wayfinding

- **Map:** `.scratch/<effort>/map.md`.
- **Ticket:** `.scratch/<effort>/issues/NN-<slug>.md` with `Type: research | prototype | grilling | task`, `Status: open | claimed | resolved`, and `Blocked by:`.
- **Resolve:** add the answer under `## Answer`, set `Status: resolved`, then add the gist and link to the map's *Decisions so far*.
