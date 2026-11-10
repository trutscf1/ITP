# Init

Loaded by `/gam-ai-knowledge init`, and by step 1 of [New project setup](../../gam-setup/references/setup.md). It creates the knowledge folder of a project; `<templates>` is this skill's `templates/` folder.

1. **Stop on an existing folder.** If `gam-ai-knowledge/` exists, stop with "gam-ai-knowledge/ exists; run /gam-ai-knowledge check" and change nothing. If only `gam-engineering/documentation/` or `humanengineering/documentation/` exists, stop with `This project keeps its knowledge in <folder>; move it with /gam-engineering migrate`, naming that folder, and change nothing.
2. **Ask the project goal first** (P-GOAL-1), as one `Q<n>` pop-up: one goal of at most 200 characters, derived from the project application if one exists; target users, success signals, and non-goals are asked in the same round. Nothing is created before the answer.
3. **Copy the templates** from `<templates>` into `gam-ai-knowledge/`, keeping their frontmatter (`format: gam-ai-knowledge/1`):

   | Template | Destination |
   | --- | --- |
   | `GOAL.md` | `GOAL.md`, filled from step 2 |
   | `concept_authoring_manifest.md` | `MANIFEST.md` |
   | `CONTEXT.md`, `ROADMAP-DETAILS.md`, `STACK.md`, `TEST_STRATEGY.md`, `DEPLOYMENT.md`, `SECURITY.md`, `WORKFLOW.md`, `VERSIONING.md`, `next.md` | same name |
   | `ROADMAP.md` | `ROADMAP.md`, the placeholder row deleted while no feature is planned |
   | `work-items/BACKLOG.md` | `work-items/BACKLOG.md`, with an empty table |
   | `test-data/README.md` | `test-data/README.md` |
   | `gam-ai-knowledge/tools/doc-check.mjs` | `tools/doc-check.mjs` |

   Create `adr/` with an empty `.gitkeep`. `TEAM.md` and `STATUS.md` are created only by `/gam-engineering team`.
4. **Record the round** of step 2: the AI chat export keeps it (P-GRILL-2); no Q&A file is created.
5. **Point other agents at the folder.** Append this line to the root `AGENTS.md`, unless it already holds a link to `gam-ai-knowledge/`; never change its other lines. Without an `AGENTS.md`, create it with the heading `# AGENTS.md`, a blank line, and the line:

   ```markdown
   - Long-term project knowledge — goal, roadmap and status, concepts, decisions, glossary, stack: `[gam-ai-knowledge/](gam-ai-knowledge/)`; read `GOAL.md` and `CONTEXT.md` first.
   ```

6. **Check.** `node gam-ai-knowledge/tools/doc-check.mjs` must exit with `0`; fix every finding before reporting done.
7. **Report** the files created. `init` does not commit; the developer, or the calling setup, ships the change (P-GIT-2).
