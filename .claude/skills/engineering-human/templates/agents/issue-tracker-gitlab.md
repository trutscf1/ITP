# Issue tracker: GitLab

Issues and merge requests for this repo live on GitLab. Agents use the [`glab`](https://gitlab.com/gitlab-org/cli) CLI for every operation; it infers the project from `git remote -v`. Labels, templates, and sprints are bound in `documentation/WORKFLOW.md`.

## Issues

- **Create:** `glab issue create --title "..." --description "..." --label "..." --milestone "..."`; use a heredoc for multi-line descriptions.
- **Read:** `glab issue view <n> --comments`; `-F json` for machine-readable output.
- **List:** `glab issue list -F json` with `--label` filters.
- **Comment:** `glab issue note <n> --message "..."` (GitLab calls comments notes).
- **Labels:** `glab issue update <n> --label "..."` / `--unlabel "..."`. On GitLab Free, scoped labels (`status::…`) are not mutually exclusive: remove the old `status::` label yourself when setting a new one.
- **Close:** post the explanation with `glab issue note` first, then `glab issue close <n>`.
- **Blocking:** the `/blocked_by #<n>` quick action as a note (Premium, native link); on Free, a `Blocked by: #<n>` line at the top of the description.
- **Weight:** a `Weight:` line in the description (the native weight field is Premium).
- **Hierarchy (P-TRK-2, P-TRK-4):** feature → story issues → slice issues. Which form applies depends on the tier recorded in `documentation/WORKFLOW.md`; re-check it before every `tickets` publish (see *Tier check*).
  - **Premium or Ultimate, project in a group:** the feature is a group epic, `glab api --method POST "groups/<group>/epics" -f title="<feature>" -f labels="type::feature" -f description="..."` (the description from `.gitlab/issue_templates/feature.md`); each story issue becomes its native child, `glab api --method POST "groups/<group>/epics/<epic-iid>/issues/<issue-id>"` (`<issue-id>` is the global `id`, not the `iid`, from `glab issue view <n> -F json`). Where the instance has retired the REST epics API, use GraphQL work items instead: `workItemCreate` with type *Epic*, then `workItemUpdate` with `hierarchyWidget: { parentId }` on each story. Epics are referenced as `&<iid>`.
  - **Free, or a personal namespace:** the feature is an issue labelled `type::feature`; each child carries `Part of #<parent>` at the top of its description and the `/relate #<parent>` quick action as a note; the parent lists its children as a task list (`- [ ] #<n> <title>`).
  - **Slices, every tier:** GitLab allows no issue under an issue, so a slice issue carries `Part of #<story>` and `/relate #<story>`, and the story lists it in its task list.
- **Tier check (P-TRK-4):** first `glab api "namespaces/<url-encoded top-level group path>"` and read `plan` (`premium` or `ultimate` → Premium; `free` or `default` → Free). If the field is missing (not visible to this account, or self-managed), probe `glab api "groups/<group>/epics?per_page=1"`: a list → Premium; `403` or `404` → Free. A project in a personal namespace counts as Free for the hierarchy. If neither answers, ask with a pop-up. Record the result as *Host tier* in `WORKFLOW.md`; if it changed, ship the edit like any other change.

## Merge requests

- **Create:** `glab mr create --target-branch dev --title "..." --description "..."`.
- **Read:** `glab mr view <n> --comments`; the diff with `glab mr diff <n>`.
- **Approvals:** `glab api projects/:id/merge_requests/<n>/approvals` — count approvers other than the author for merge policy `approved`. Required approval rules are Premium; on Free the count is enforced by the agent, not the host.
- **Comment:** `glab mr note <n> --message "..."`.
- **Merge:** only through `/engineering-human merge` (P-MR-4).

## External merge requests as a triage surface

**MRs as a request surface: no.** *(Set to `yes` if external merge requests count as requests; `/engineering-human triage` reads this flag.)* External means the author is not a project member.

GitLab numbers issues and MRs separately: `#42` is an issue, `!42` an MR.

## Wayfinding

- **Map:** one issue labelled `wayfinder:map`.
- **Ticket:** an issue with `Part of #<map>` at the top and a label `wayfinder:<research|prototype|grilling|task>`.
- **Claim:** `glab issue update <n> --assignee @me` before any work.
- **Resolve:** `glab issue note <n> --message "<answer>"`, `glab issue close <n>`, then add the gist and link to the map's *Decisions so far*.
