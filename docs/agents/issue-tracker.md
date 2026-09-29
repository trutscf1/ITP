# Issue tracker: GitLab (REST API)

Issues and specs for this repo live as GitLab issues in project `87030014` (`htl-villach/it/classes/5bhitm-2026/itp/waent/project1/SJ26_27_5BHITM_ITP_trutscf1_project1`). Use the GitLab REST API v4 with `curl` or a short script; `glab` is not used.

## Access

- Token: a personal access token (scope `api`) of the person running the session, in the environment variable `GITLAB_TOKEN`. Never write it into a file, a commit, an issue, or command output.
- If `GITLAB_TOKEN` is not set, stop and ask the user to set it.
- Base: `API=https://gitlab.com/api/v4/projects/87030014`, header `PRIVATE-TOKEN: $GITLAB_TOKEN`.
- User IDs for assignees: `GET $API/members/all`.

## Conventions

- **Create an issue**: `POST $API/issues` with JSON `{title, description, labels, assignee_ids, milestone_id, weight}`. Build multi-line JSON with a script, not by hand. Then set the estimate: `POST $API/issues/<iid>/time_estimate?duration=<n>h`. Weight, milestone and track rules: `documentation/WORKFLOW.md`.
- **Read an issue**: `GET $API/issues/<iid>` and its comments with `GET $API/issues/<iid>/notes?sort=asc`.
- **List issues**: `GET $API/issues?state=opened&labels=<a,b>&milestone=<title>&per_page=100`.
- **Comment**: `POST $API/issues/<iid>/notes` with `{body}`. GitLab calls comments "notes".
- **Apply / remove labels**: `PUT $API/issues/<iid>` with `{add_labels}` / `{remove_labels}` (comma-separated).
- **Close**: first post the explanation as a note, then `PUT $API/issues/<iid>` with `{state_event: "close"}`.
- **Merge requests**: the same shape under `$API/merge_requests`. GitLab numbers issues and MRs separately.

## Merge requests as a triage surface

**MRs as a request surface: no.** _(Set to `yes` if this repo treats external merge requests as feature requests; `/triage` reads this flag.)_

## When a skill says "publish to the issue tracker"

Create a GitLab issue.

## When a skill says "fetch the relevant ticket"

Read the issue and its notes.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single issue with **child** issues as tickets.

- **Map**: an issue labelled `wayfinder:map` holding the Notes / Decisions-so-far / Fog body.
- **Child ticket**: an issue with `Part of #<map>` at the top of its description and a label `wayfinder:<type>` (`research` / `prototype` / `grilling` / `task`).
- **Blocking**: a `Blocked by: #<n>, #<n>` line at the top of the description. A ticket is unblocked when every blocker is closed.
- **Frontier query**: list the map's children, drop those with an open blocker or an assignee; the first in map order wins.
- **Claim**: `PUT $API/issues/<n>` with `{assignee_ids: [<own id>]}`, the session's first write.
- **Resolve**: note with the answer, close, then append a pointer (gist + link) to the map's Decisions-so-far.
