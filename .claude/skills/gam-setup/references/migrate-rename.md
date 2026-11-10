# Migrating to the name gam-engineering

Part 3 of [Migrating a project](migrate.md), loaded when its step 1 finds a former name of the skill. Detection, the one confirmation, the branch, and the checks are in that file; this part holds only the signs and the actions.

The skill was called `engineering-human` until 2026-10 and `humanengineering` until 2026-10-15, when it was split into the five gam- skills (P-DOC-10). Rules, `P-…` IDs, and document structure are unchanged, so the rename touches names only. Detect it by any of:

- `CLAUDE.md` or `CLAUDE.local.md` naming `/humanengineering` or `engineering-human`;
- `HUMANENGINEERING_` or `ENGINEERING_HUMAN_` keys in `.claude/settings.json`;
- a folder `humanengineering/` at the repo root;
- `format: humanengineering/2` or `format: engineering-human/2` in the documentation folder;
- a vendored `.claude/skills/humanengineering/` or `.claude/skills/engineering-human/`.

Inventory rows: every hit as *file — occurrence — replacement*. Part 6 has already moved `humanengineering/documentation/` straight to `gam-ai-knowledge/` and its checker to `gam-ai-knowledge/tools/` ([migrate-knowledge.md](migrate-knowledge.md), P-DOC-11), so the *Project folder* row moves only the tooling left in `humanengineering/`; a project on the layout before 2026-10-14 has no such folder, and the row does not apply.

| Item | Action |
| --- | --- |
| Project folder | `git mv` every file left in `humanengineering/` to the same path under `gam-engineering/` (without git: a plain move), then remove the empty `humanengineering/`. Update every path that names it: the `Stop` command in `.claude/settings.json`, the `include` in `.gitlab-ci.yml`, the root `CONTEXT-MAP.md`, `CLAUDE.md`, the agent file `domain.md`, `README.md`, the project's own scripts, and the publish lists (P-DOC-9) — found with `git grep -n "humanengineering/"`. |
| GitHub workflow | `git mv .github/workflows/humanengineering-docs.yml .github/workflows/gam-engineering-docs.yml`. |
| `CLAUDE.md`, `CLAUDE.local.md` | `/humanengineering` and `/engineering-human` → `/gam-engineering`, `humanengineering` and `engineering-human` → `gam-engineering`. `CLAUDE.local.md` is changed locally and not committed. |
| `.claude/settings.json` | Rename every `HUMANENGINEERING_<KEY>` and `ENGINEERING_HUMAN_<KEY>` to `GAM_ENGINEERING_<KEY>`, values unchanged. |
| `gam-ai-knowledge/` | The format lines are part 6's (`format: gam-ai-knowledge/1`); any other mention of the old names and paths in the text. Closed issues, old commits, log entries, and ADRs are not rewritten. |
| Tooling | Part 5 runs in the same change: the copied files take their new paths and the current versions, whose comments name the new skill. |
| Team mode | Replace the vendored `.claude/skills/humanengineering/` (or `engineering-human/`) with the five folders `.claude/skills/gam-*/` in their current version (P-TEAM-1). |

No ADR is needed: nothing is decided, only renamed. Until the MR is merged, the old names keep working for the transition period of P-DOC-10 ([Project settings](../../gam-engineering/SKILL.md#project-settings), `doc-check`).
