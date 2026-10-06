# Issue tracker: GitHub

Issues and pull requests for this repo live on GitHub. Agents use the `gh` CLI for every operation; it infers the repo from `git remote -v`. Labels, templates, the Project board, and sprints are bound in `documentation/WORKFLOW.md`. Every MR rule of the profile applies to pull requests unchanged (P-MR-1).

## Issues

- **Create:** `gh issue create --title "..." --body "..." --label "..." --milestone "..."`; use a heredoc for multi-line bodies.
- **Read:** `gh issue view <n> --comments --json number,title,body,labels,comments`.
- **List:** `gh issue list --state open --json number,title,labels` with `--label` filters.
- **Comment:** `gh issue comment <n> --body "..."`.
- **Labels:** `gh issue edit <n> --add-label "..."` / `--remove-label "..."`. Labels are not exclusive: remove the old `status::` label yourself.
- **Close:** `gh issue close <n> --comment "..."`.
- **Blocking:** native issue dependencies, `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker database id>` (the id from `gh api repos/<owner>/<repo>/issues/<n> --jq .id`); otherwise a `Blocked by: #<n>` line at the top of the body.
- **Child issues:** GitHub sub-issues; otherwise `Part of #<parent>` at the top of the body. Hierarchy (P-TRK-2): feature issue → story issues → slice issues.
- **Weight:** as bound in `WORKFLOW.md` — a `Weight:` line in the body or the Projects number field.

## Pull requests

- **Create:** `gh pr create --base dev --title "..." --body "..."`.
- **Read:** `gh pr view <n> --comments`; the diff with `gh pr diff <n>`.
- **Approvals:** `gh pr view <n> --json reviews` — count `APPROVED` reviews by people other than the author for merge policy `approved`.
- **Merge:** only through `/engineering-human merge` (P-MR-4).

## External pull requests as a triage surface

**PRs as a request surface: no.** *(Set to `yes` if external pull requests count as requests; `/engineering-human triage` reads this flag.)* External means `authorAssociation` is `CONTRIBUTOR`, `FIRST_TIME_CONTRIBUTOR`, or `NONE`.

GitHub shares one number space for issues and pull requests: resolve `#42` with `gh pr view 42` and fall back to `gh issue view 42`.

## Wayfinding

- **Map:** one issue labelled `wayfinder:map`.
- **Ticket:** a sub-issue of the map with a label `wayfinder:<research|prototype|grilling|task>`.
- **Claim:** `gh issue edit <n> --add-assignee @me` before any work.
- **Resolve:** `gh issue comment <n> --body "<answer>"`, `gh issue close <n>`, then add the gist and link to the map's *Decisions so far*.
