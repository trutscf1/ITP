# Migrating to numbered epics

Part 4 of [Migrating a project](migrate.md), loaded when its step 1 finds an unnumbered work-item tree — through `/gam-engineering migrate`, or on the first change to such a tree. Detection, the one confirmation, the branch, and the checks are in that file; this part holds only the actions.

Work-item trees written before 2026-10-14 have unnumbered folders `work-items/<feature>/` with a `feature.md`, no release fields, no story status, and no backlog files; `doc-check` reports each such `feature.md` as a `WI` warning. They are migrated on touch (P-DOC-5): the first change to any work item migrates the whole tree. Inventory rows: the mapping *old folder — new folder `E<nn>-<feature>`*.

| Item | Action |
| --- | --- |
| Epic folders | Number every existing folder in ROADMAP order, starting at `E01`: `git mv work-items/<feature> work-items/E<nn>-<feature>` (P-DOC-6). Fix every link to the old paths in `gam-engineering/documentation/`. |
| `epic.md` | `git mv feature.md epic.md`; `doc: epic`; add `release` = the ROADMAP *Version* of the feature and `shipped` = the tag of the release that delivered it (from the ROADMAP note or `git tag --contains` of the last story merge), empty while unreleased. Rename *Feature issue* to *Epic issue*. |
| Story files | Add `status` (closed issue merged to `dev` → `done`, otherwise the issue's `status::` label, no issue → `backlog`) and `sprint` (the issue's milestone number, else empty); a story shipped in a fix release gets its own `shipped`. |
| `BACKLOG.md`, `sprints/` | Create `work-items/BACKLOG.md` with every story not `done`, in ROADMAP order and then in `epic.md` order, and one `sprints/sprint-<n>.md` per open milestone, from [templates/work-items/](../../gam-ai-knowledge/templates/work-items/) (P-DOC-8). Closed sprints are not reconstructed. |
| Tracker | Rename the label `type::feature` to `type::epic` on the host (the issues keep it); copy the epic issue templates from [templates/gitlab/](../../gam-engineering/templates/gitlab/) or [templates/github/](../../gam-engineering/templates/github/) and remove the old `feature.md` templates; update the label table in `WORKFLOW.md`. |
| Checks | Use the current `gam-engineering/tools/doc-check.mjs` (re-copy it if part 5 does not run); after step 4 of [Migrating a project](migrate.md), no `WI`, `BL`, or `FM` finding may remain in `work-items/`. |
