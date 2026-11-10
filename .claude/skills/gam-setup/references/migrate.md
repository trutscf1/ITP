# Migrating a project

Loaded by `/gam-engineering migrate` and `migrate tools` (skill `gam-setup`), and on the first change to an unnumbered work-item tree.

One procedure brings a project from any older state onto the current one: detect every state that applies, show one inventory, apply all parts in one change, check. Each part's actions live in its own file, loaded only when its state is detected. One legacy concept document is migrated on its own with `migrate <feature>` ([migrate-concept.md](migrate-concept.md)).

## Step 1 — Detect (read-only)

First read `gam-engineering/version.json` and take every entry of [migrations.md](migrations.md) above its `migration` (every entry when the file is missing): they head the inventory as *what this project must change since the last run*.

Check every row; several states may apply at once. The entry point limits the rows:

- `migrate` checks all eight;
- `migrate tools` only rows 2, 5, and 7;
- the first change to an unnumbered work-item tree (P-DOC-5) only row 4.

| # | State | Signs | Part |
| --- | --- | --- | --- |
| 1 | Predecessor skill `engineering-profile` | `CLAUDE.md` or `MANIFEST.md` naming `engineering-profile`; a `MANIFEST.md` in the documentation folder without a `GOAL.md` next to it; concept documents whose §3 is *Functional Requirements*. A project without any `MANIFEST.md` is a fresh repo: stop and run setup instead. | [migrate-engineering-profile.md](migrate-engineering-profile.md) |
| 2 | Layout before 2026-10-14 | A top-level `documentation/` and neither `gam-ai-knowledge/`, `gam-engineering/documentation/`, nor `humanengineering/documentation/`; or a tooling file of the skill at an old path | [migrate-tools.md](migrate-tools.md), *Old locations* |
| 3 | Former names `humanengineering`, `engineering-human` | The signs listed in the part | [migrate-rename.md](migrate-rename.md) |
| 4 | Unnumbered work items | A `work-items/<feature>/feature.md` (`doc-check` warning `WI`) | [migrate-epics.md](migrate-epics.md) |
| 5 | Missing or outdated tooling | A row of the part's inventory that is not *current* | [migrate-tools.md](migrate-tools.md), *Inventory* |
| 6 | Knowledge folder | The documents outside `gam-ai-knowledge/` — in `gam-engineering/documentation/`, `humanengineering/documentation/`, or a top-level `documentation/` — or a folder `aigamdocs/`; checked first, since it can stop the run | [migrate-knowledge.md](migrate-knowledge.md) |
| 7 | Memory folder missing or incomplete | gam-ai-memory installed and current, no `aigamdocs/`, and `init` would add something (`gam-ai-memory/`, its `plans/`, a template file, or the `AGENTS.md` link missing) | [memory.md](memory.md#in-setup-and-migrate) |
| 8 | Plans or agent files at the old place | A root `plans/` (or `plansDirectory` other than `./gam-ai-memory/plans`) while `gam-ai-memory/` exists, or `docs/agents/` | [migrate-plans.md](migrate-plans.md) |

If no row applies, say so, write the version file (step 5) as its own commit, and stop.

## Step 2 — Inventory and one confirmation

Report one table *part — item — current state — action* over every detected part; each part names its rows (for example the rename's *file — occurrence — replacement*). Show a short diff for every *customised* tooling item. Confirm the whole table as one `Q<n>` ([Asking the developer](../../gam-engineering/SKILL.md#asking-the-developer)) with the options **All proposed** (recommended), **Choose parts**, and **No**. On *Choose parts*, a second `Q<n>` with `multiSelect` names the detected parts. *Customised* items stay as they are unless the answer names them. Change nothing before the confirmation.

The questions a part prescribes come after the confirmation and before any change, as the next rounds: the goal wording of part 1 first (P-GOAL-1), then the rest of the frontier — merge keys, sprint mode, attribution, solo or team.

## Step 3 — Apply (one change)

All confirmed parts go into one change on the branch `chore/migrate-gam-engineering` from the integration branch, with one MR (P-GIT-2); without git, in place (P-GIT-7), and the parts' git-only rows are skipped. Apply the parts in this order, so that each later part works on the final paths and names:

1. part 6 — move the documents straight to `gam-ai-knowledge/` and `aigamdocs/` to `gam-ai-memory/`;
2. part 2 — move the old tooling paths to `gam-engineering/`; its `documentation/` row is part 6's;
3. part 3 — rename the former names; its *Project folder* row moves only the tooling left in `humanengineering/`;
4. part 1 — the project-level files of `engineering-profile`;
5. part 4 — number the epics;
6. part 5 — the tooling;
7. part 7 — `/gam-ai-memory init`, which creates or completes `gam-ai-memory/`, so the memory links the knowledge folder at its final place;
8. part 8 — the plans and agent files, last, since `gam-ai-memory/` exists only after part 6 or 7.

The MR description lists every part with its items, every *customised* item kept with its diff summary, and the result of step 4. Part 1 writes the one ADR this migration needs (mandatory when adopting the skill); the other parts decide nothing for the project and need none.

## Step 4 — Check

1. Run `node gam-ai-knowledge/tools/doc-check.mjs` (before the move `gam-engineering/tools/doc-check.mjs`; with `--status` under git) and the markdown lint.
2. Fix every finding in a file this change touched. Findings in legacy concept documents are listed in the MR as *not migrated*; findings the updated check raises in untouched documents as *found by the updated check* — each is fixed in its own change.
3. Where part 6 ran: its own checks ([migrate-knowledge.md](migrate-knowledge.md#check)).
4. Where part 2 or 3 ran: `git grep -n -i -e "humanengineering" -e "engineering-human" -e "ENGINEERING_HUMAN_"` finds nothing outside logs, ADRs, and closed work.

Then merge through [`/gam-engineering merge`](../../gam-delivery/references/merge.md) under the project's merge policy, and add the log entry in `ROADMAP-DETAILS.md` (P-ROAD-4). If the *Frontend* row of part 5 was accepted, run [Frontend](frontend.md) now.

## Step 5 — Version

Every run of `migrate` and `migrate tools` ends by writing `gam-engineering/version.json` — in the migration's change, or alone when nothing applied:

```json
{ "migration": 2, "skill": "1.5.0", "migratedOn": "2026-11-10", "parts": [5, 7] }
```

`migration` is the highest `M-<n>` of [migrations.md](migrations.md) whose changes the project now has (a declined part keeps the number below its entry), `skill` the content of [VERSION](../../gam-engineering/VERSION), `migratedOn` the date, and `parts` the parts applied in this run. The summary names the entries between the old and the new `migration`.
