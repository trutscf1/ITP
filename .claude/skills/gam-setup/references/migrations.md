# Migrations

Every change of the skills that a project has to follow gets the next number `M-<n>` here, in the same commit as the change. `/gam-engineering migrate` and `migrate tools` read `gam-engineering/version.json` in the project, list every entry above its `migration` (all entries when the file is missing) as *what this project must change*, and write the file again at the end of every run ([migrate.md](migrate.md#step-5--version)). Setup writes it with the highest number, since a new project starts current.

| M | Date | What a project must change | Done by |
| --- | --- | --- | --- |
| M-1 | 2026-11-09 | Baseline: every state of [migrate.md](migrate.md) step 1 — layout, names, tooling, knowledge and memory folders, plans | `migrate` (all parts) |
| M-2 | 2026-11-10 | The AI chat export replaces the Q&A log (P-TEAM-6, P-GRILL-2): copy `gam-engineering/tools/prompt-export.mjs`, run its `install-hook`, set `GAM_ENGINEERING_PROJECT_KIND` and `GAM_ENGINEERING_PROMPT_EXPORT`; `qa-log.md` and `<concept>.qa-log.md` stay as archive and are no longer written | `migrate tools`, row *AI chat export* |
| M-3 | 2026-11-10 | The AI chat export never shrinks, writes `owner.json`, model, author, user name, and rounds, reads Aider and OpenCode, finds WSL and remote workspaces, and adds `check` (P-TEAM-6): replace `gam-engineering/tools/prompt-export.mjs`, run its `install-hook` (executable hook, user name in the local git config), and add the section *AI chat export* to the agent instruction files | `migrate tools`, row *AI chat export* |
