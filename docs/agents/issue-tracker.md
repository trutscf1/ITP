# Issue tracker: GitLab (REST API)

Issues and merge requests for this repo live on GitLab in project `87030014` (`htl-villach/it/classes/5bhitm-2026/itp/waent/project1/SJ26_27_5BHITM_ITP_trutscf1_project1`). Agents use the GitLab REST API v4 with `curl` or a short script; `glab` is not used by agents. Labels, templates, and sprints are bound in `documentation/WORKFLOW.md`.

## Access

- Token: a **personal access token** (scope `api`) of the person running the session, in the environment variable `GITLAB_TOKEN`. Never write it into a file, a commit, an issue, a chat, or command output.
- No project access token: it acts as a bot user, so issues, merge requests, and reviews would not carry the person's name, and it has no rights on the group (no epics) and, below the Maintainer role, none on branch protection and project settings.
- If `GITLAB_TOKEN` is not set, stop and ask the user to set it.
- Base: `API=https://gitlab.com/api/v4/projects/87030014`, header `PRIVATE-TOKEN: $GITLAB_TOKEN`.
- Group of the project (for epics): `GROUP=https://gitlab.com/api/v4/groups/htl-villach%2Fit%2Fclasses%2F5bhitm-2026%2Fitp%2Fwaent%2Fproject1`.
- User IDs for assignees: `GET $API/members/all`.

## Issues

- **Create:** `POST $API/issues` with JSON `{title, description, labels, assignee_ids, milestone_id, weight}`. Build multi-line JSON with a script, not by hand. Then set the estimate: `POST $API/issues/<iid>/time_estimate?duration=<n>h`.
- **Read:** `GET $API/issues/<iid>` and its comments with `GET $API/issues/<iid>/notes?sort=asc`.
- **List:** `GET $API/issues?state=opened&labels=<a,b>&milestone=<title>&per_page=100`.
- **Comment:** `POST $API/issues/<iid>/notes` with `{body}`. GitLab calls comments notes.
- **Labels:** `PUT $API/issues/<iid>` with `{add_labels}` / `{remove_labels}` (comma-separated). When setting a new `status::` label, remove the old one in the same call.
- **Close:** first post the explanation as a note, then `PUT $API/issues/<iid>` with `{state_event: "close"}`.
- **Blocking:** `POST $API/issues/<iid>/links` with `{target_project_id, target_issue_iid, link_type: "is_blocked_by"}`.
- **Weight:** the native `weight` field (scale in `documentation/WORKFLOW.md`).
- **Hierarchy (P-TRK-2, P-TRK-4):** feature → story issues → slice issues. The tier is recorded as *Host tier* in `documentation/WORKFLOW.md`; re-check it before every `tickets` publish (see *Tier check*).
  - **Premium or Ultimate, project in a group (the current tier):** the feature is a group epic, `POST $GROUP/epics` with `{title, labels: "type::feature", description}` (the description from `.gitlab/issue_templates/feature.md`); each story issue becomes its native child, `POST $GROUP/epics/<epic-iid>/issues/<issue-id>` (`<issue-id>` is the global `id`, not the `iid`). Where the instance has retired the REST epics API, use GraphQL work items instead: `workItemCreate` with type *Epic*, then `workItemUpdate` with `hierarchyWidget: { parentId }` on each story. Epics are referenced as `&<iid>`.
  - **Free:** the feature is an issue labelled `type::feature`; each child carries `Part of #<parent>` at the top of its description and a related-issue link; the parent lists its children as a task list (`- [ ] #<n> <title>`).
  - **Slices, every tier:** GitLab allows no issue under an issue, so a slice issue carries `Part of #<story>` and a related-issue link (`POST $API/issues/<iid>/links`), and the story lists it in its task list.
- **Tier check (P-TRK-4):** `GET https://gitlab.com/api/v4/namespaces/htl-villach` and read `plan` (`premium` or `ultimate` → Premium; `free` or `default` → Free). If the field is not visible to this token, probe `GET $GROUP/epics?per_page=1`: a list → Premium; `403` or `404` → Free. If neither answers, ask with a pop-up. Record the result as *Host tier* in `WORKFLOW.md`; if it changed, ship the edit like any other change.

## Merge requests

- **Create:** `POST $API/merge_requests` with `{source_branch, target_branch: "dev", title, description, remove_source_branch: false}` (branches are kept, `WORKFLOW.md`).
- **Read:** `GET $API/merge_requests/<iid>`, comments with `GET $API/merge_requests/<iid>/notes?sort=asc`, threads with `GET $API/merge_requests/<iid>/discussions`, the diff with `GET $API/merge_requests/<iid>/changes`.
- **Approvals:** `GET $API/merge_requests/<iid>/approvals` — count approvers other than the author for merge policy `approved`.
- **Comment:** `POST $API/merge_requests/<iid>/notes` with `{body}`.
- **Merge:** only through `/engineering-human merge` (P-MR-4); `PUT $API/merge_requests/<iid>/merge` with `{squash: false, should_remove_source_branch: false}`.

## External merge requests as a triage surface

**MRs as a request surface: no.** *(Set to `yes` if external merge requests count as requests; `/engineering-human triage` reads this flag.)* External means the author is not a project member.

GitLab numbers issues and MRs separately: `#42` is an issue, `!42` an MR.

## Wayfinding

- **Map:** one issue labelled `wayfinder:map`.
- **Ticket:** an issue with `Part of #<map>` at the top and a label `wayfinder:<research|prototype|grilling|task>`.
- **Claim:** `PUT $API/issues/<iid>` with `{assignee_ids: [<own id>]}` before any work.
- **Resolve:** note with the answer, close, then add the gist and link to the map's *Decisions so far*.
