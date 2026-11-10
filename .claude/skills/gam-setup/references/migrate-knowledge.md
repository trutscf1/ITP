# Moving the knowledge folder

Part 6 of [Migrating a project](migrate.md), loaded when its step 1 finds the project's documents outside `gam-ai-knowledge/` or a folder `aigamdocs/`. Detection, the one confirmation, the branch, and the checks are in that file; this part holds only the signs, the inventory rows, and the actions.

Since 2026-10-22 a project keeps its long-term knowledge in `gam-ai-knowledge/`, owned by the skill gam-ai-knowledge (P-DOC-11), and the standalone skill gam-ai-memory keeps only short-term files, in `gam-ai-memory/` instead of `aigamdocs/`. This part moves both in one change: the documents keep their history, every fact stays in one place, and the gam text wins where an `aigamdocs/` copy says something else.

## Signs

- **Knowledge folder.** `GOAL.md` in `gam-engineering/documentation/`, the former `humanengineering/documentation/`, or the top-level `documentation/` of the layout before 2026-10-14, and no `gam-ai-knowledge/`. That folder is the *source* below; the move goes straight from it to `gam-ai-knowledge/`, never through `gam-engineering/documentation/` (Q54).
- **Memory folder.** A folder `aigamdocs/` at the repo root.

**Stop first.** When the knowledge-folder sign applies and the skill gam-ai-knowledge is installed neither in the user skill folder (`~/.claude/skills/gam-ai-knowledge/`) nor in the repo (`.claude/skills/gam-ai-knowledge/`), stop the whole `migrate` before the inventory with exactly `The move needs the skill gam-ai-knowledge; install it and run the command again`, and change no file.

## Inventory rows

The part *Knowledge folder* in the inventory of step 2 lists these rows; nothing changes before the confirmation.

| Item | Inventory row | Action |
| --- | --- | --- |
| Documents | One row per file: `<source>/<path>` → `gam-ai-knowledge/<path>`, `team/` included | `git mv <source> gam-ai-knowledge` as a whole, so `git log --follow` keeps each file's history. Relative links from inside the folder to repo-root files lose one `../` when the source was two levels deep (`../../README.md` → `../README.md`). |
| Checker | `<tooling>/tools/doc-check.mjs` → `gam-ai-knowledge/tools/doc-check.mjs`, where `<tooling>` is `gam-engineering`, `humanengineering`, or the top level | `git mv`; part 5 then brings it to the current template. |
| Format lines | The number of frontmatter lines `format: gam-engineering/2`, `humanengineering/2`, or `engineering-human/2` | Rewrite each to `format: gam-ai-knowledge/1`; `format: legacy` stays. |
| `aigamdocs/TEST_STRATEGY.md`, `DEPLOYMENT.md`, `SECURITY.md` | One row each: → `gam-ai-knowledge/<name>` | `git mv`, and put the frontmatter of the [template](../../gam-ai-knowledge/templates/) of the same name on top; the text stays. If `gam-ai-knowledge/` already holds the file, the gam file stays and the row reads like a mirror below. |
| `aigamdocs/` mirrors | One row each for `ROADMAP.md`, `DECISIONS.md`, `adr/`, `GLOSSARY.md`, `ARCHITECTURE.md`, `TODO.md`: `delete`, with the state `same` or `differs` | `git rm -r`. The state compares the copy with its gam counterpart — `ROADMAP.md` with `ROADMAP.md`, `DECISIONS.md` and `adr/` with `adr/`, `GLOSSARY.md` with `CONTEXT.md`, `ARCHITECTURE.md` with `STACK.md`, `TODO.md` with `next.md` — and is `differs` when the copy holds a content line the counterpart lacks, headings, frontmatter, and blank lines not counted. A `differs` row shows those lines; the gam text wins (Q56), so the developer carries a fact over by hand before confirming, or names the row to keep the file. |
| `TODO.md` entries | One row per open entry missing in `next.md`: `to next.md` | Append it under `## Open` of `gam-ai-knowledge/next.md` as `- YYYY-MM-DD <text>`, with the entry's own date or else today's, before `TODO.md` is deleted. |
| Memory folder | `aigamdocs/` → `gam-ai-memory/` | `git mv aigamdocs gam-ai-memory` after the rows above, so it holds only the short-term files (Q57). Their contents are gam-ai-memory's own; this part changes only paths that name the folder. |
| Links | One row per file that names an old folder, with the number of hits | Rewrite every link and path to `<source>/`, `<tooling>/tools/doc-check.mjs`, or `aigamdocs/` to the new folder: Markdown files, `AGENTS.md`, `CLAUDE.md` (`CLAUDE.local.md` locally, never committed), `CONTEXT-MAP.md`, the agent files, scripts, and CI — found with `git grep -n -e "<source>/" -e "tools/doc-check" -e "aigamdocs/"`. Log rows, Q&A logs, ADRs, closed issues, and old commits keep their wording. |
| Pipeline | The CI file and the local runner, when either names the checker by its old path | Render the CI file again with `node gam-engineering/tools/pipeline.mjs render-ci` ([Pipeline](pipeline.md), step 10), so the job calls `gam-ai-knowledge/tools/doc-check.mjs`. |
| `AGENTS.md` pointer | Missing when the root `AGENTS.md` holds no link to `gam-ai-knowledge/` | Add the line of [gam-ai-knowledge: init](../../gam-ai-knowledge/references/init.md), step 5; its other lines stay. |

Without git, every `git mv` and `git rm` is a plain move or delete, and the history row of the check is skipped (P-GIT-7).

## Check

On top of step 4 of [Migrating a project](migrate.md):

1. `node gam-ai-knowledge/tools/doc-check.mjs` exits with `0`, and every document in `gam-ai-knowledge/` carries `format: gam-ai-knowledge/1` or `format: legacy`.
2. `git log --follow --oneline gam-ai-knowledge/GOAL.md` shows commits from before the move.
3. `git grep -n -e "gam-engineering/documentation" -e "humanengineering/documentation" -e "aigamdocs/"` finds nothing outside log rows, Q&A logs, ADRs, and closed work.
