# Migrating plans and agent files

Part 8 of [Migrating a project](migrate.md). Plans are short-term memory and live in `gam-ai-memory/plans/`; the tracker and domain files are agent configuration and live in `gam-engineering/agents/` (P-DOC-7, P-DOC-9). The part runs last, once `gam-ai-memory/` exists; without `gam-ai-memory/` only the agent files move and plans stay in the root `plans/`.

The part *Plans and agent files* in the inventory of step 2 lists these rows; nothing changes before the confirmation.

| Row | Detect | Action |
| --- | --- | --- |
| Plans | A root `plans/` with files, and `gam-ai-memory/` | `git mv plans/* gam-ai-memory/plans/` (create the subfolder first; without git a plain move), then remove the empty `plans/`. Plans already in `gam-ai-memory/plans/` stay; a name that exists in both is listed and left for the developer. |
| Agent files | `docs/agents/` | `git mv docs/agents gam-engineering/agents`, then remove `docs/` when it is empty; any other file in `docs/` stays. |
| Settings | `plansDirectory` other than `./gam-ai-memory/plans` | Set it to `./gam-ai-memory/plans`, without dropping any other key. |
| Publish lists | Entries `plans/` or `docs/agents/` (P-DOC-9) | Replace them by `gam-ai-memory/`; `gam-engineering/` already covers the agent files. |
| Links | One row per live file that names `plans/` or `docs/agents/`, with the number of hits | Rewrite every link and path: `CLAUDE.md` (also the *Agent skills* block and the plans paragraph), `AGENTS.md`, `CONTEXT-MAP.md`, the documents in `gam-ai-knowledge/`, `gam-ai-memory/`, scripts, and CI — found with `git grep -n -e "plans/" -e "docs/agents"`. Log rows, Q&A logs, ADRs, closed issues, and old commits keep their wording. |

## Check

`git grep -n -e "docs/agents" -e "[^-a-z/]plans/"` finds nothing outside logs, ADRs, Q&A logs, and closed work; the root has no `docs/agents/` and, where `gam-ai-memory/` exists, no `plans/`.
