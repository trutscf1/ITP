# Issue tracker: local markdown

Issues for this project live as markdown files, for solo projects without a git host: a git repository without a remote, or a folder without git (P-GIT-7). Merge requests do not exist here; what an MR would carry goes into the issue file.

## Issues

- **Location:** `.scratch/<feature>/issues/<NN>-<slug>.md`, numbered from `01` in dependency order; one file per issue.
- **Header lines:** `Status: ready | in-progress | review | done`, `Type: epic | story | bug | concept`, `Part of: NN` (the parent issue, or `none`), `Weight: <n>`, `Blocked by: NN, NN` (or `none`).
- **Body:** the epic or user-story issue template from `gam-ai-knowledge/WORKFLOW.md`.
- **Comments:** appended under `## Comments` at the bottom, each with date and handle.
- **Close:** set `Status: done`.

## Instead of a merge request

| Section in the issue file | Content | Written by |
| --- | --- | --- |
| `## Changes` | What changes for the user, the files touched, the tested functions, the consistency-check result (the MR description of P-MR-1) | `implement` |
| `## Review` | The review result: every acceptance criterion and every Definition of Done item, met or not met | `review` |
| `## Merge` | With git only: the merge-policy decision of P-MR-4 and the merge commit | `merge` |

- **With git, no remote:** the work branch is merged into the integration branch (`dev`, or `main` in branch model `trunk`, P-GIT-9) after the merge-policy decision of P-MR-4.
- **Without git:** there is no branch and no merge. The issue is closed without a question once the review under `## Review` is clean and the Definition of Done holds.

## Wayfinding

- **Map:** `.scratch/<effort>/map.md`.
- **Ticket:** `.scratch/<effort>/issues/NN-<slug>.md` with `Type: research | prototype | grilling | task`, `Status: open | claimed | resolved`, and `Blocked by:`.
- **Frontier:** the tickets of `.scratch/<effort>/issues/` with `Status: open` whose `Blocked by:` tickets are all `resolved` (or `none`), in number order.
- **Claim:** set `Status: claimed` and add a `Claimed by: <handle>` line before any work.
- **Resolve:** add the answer under `## Answer`, set `Status: resolved`, then add the gist and link to the map's *Decisions so far*.
