# Quick mode

The project flow `quick` (P-FLOW-1, P-PIPE-3), for projects with very little code. The key is `env.GAM_ENGINEERING_FLOW` in the committed `.claude/settings.json`, read like the other keys ([Project settings](../SKILL.md#project-settings)): `quick` or `full`; a missing key is `full`. Applied by rule 6 of [Before anything else](../SKILL.md#before-anything-else), by `setup`, and by `settings flow`.

## Entry question

Asked as one `Q<n>` pop-up when the key is missing: **Quick** or **Full**, recommended by the code size. Count the files whose extension is in `codeExtensions` of `gam-engineering/tools/pipeline-catalog.json` (the template's catalog in a new project): at most 10 recommends **Quick**, more recommends **Full**. The description names the count. The answer is written to `.claude/settings.json` (a normal change, P-GIT-2). **Full** is also written, so the question comes once.

## Plan flow

A change is specified by a plan `gam-ai-memory/plans/<date>-<name>.md` (`plans/` in the root while `gam-ai-memory/` is missing, P-DOC-7) with *Context*, the decisions with their `Q<n>`, and a checklist *Done when*; the checklist replaces acceptance criteria. Blocking questions are still pop-ups and are logged.

- Work happens on a branch `quick/<name>` from the integration branch; commit subjects carry `[plan:<date>-<name>]` instead of a requirement ID (P-GIT-4).
- Each *Done when* item names the command that proves it and the output that means it passed; an item only a person can judge says so and names who. Before implementing, the agent scans its own plan for lines that decide nothing (`TBD`, `TODO`, "handle edge cases", "as needed") and for items without a proof, and fixes the plan first.
- Before writing a plan, look for a plan of the same name and for open *Done when* items of a plan on an unmerged `quick/` branch. The same work updates that plan in place; other work is asked as one `Q<n>`. An unfinished plan is never overwritten, since another session may be building it.
- No concept document, epic, story files, backlog rows, or issues are created (P-DOC-6, P-TRK-2, P-QB-3). The ROADMAP row and the position and log in `ROADMAP-DETAILS.md` stay as before (P-ROAD-1…4).
- `/gam-engineering <feature>` writes the plan instead of a concept; `tickets` has nothing to cut and says so; `implement` builds the plan on its `quick/` branch.
- Definition of Done items 1, 3, 4, and 9 read: every item of the plan's *Done when* list holds (1), commits carry the plan reference (3), the plan is current (4), the ROADMAP row and the position and log are current (9).
- A feature too large for one plan, or one with personal data, takes the full path; the agent says so before writing the plan.

## Slim pipeline

The local pipeline reads the flow itself. Under `quick`:

1. It names the changed files: those differing from the merge base with the integration branch, plus uncommitted and untracked files. If git cannot answer, every file counts as changed.
2. If none has an extension in `codeExtensions`, it runs nothing and reports green, naming why.
3. Otherwise it runs only the checks of kind `tests` — the project's short test — the architecture checks of kind `architecture` and `limits` (P-ARCH, `gam-engineering/tools/architecture-check.mjs`), and the formatter and type checks of kind `format` and `types` (TypeScript projects, PP-F-23), and the weakening guard of kind `guard` (P-PIPE-7), in the recorded order. Without any of them it reports green and says that no short test is recorded; with architecture checks but no short test it says so too.

Under `full` it runs every check as before. `setup` and `pipeline` under `quick` ask for the short test as one command line (a smoke test that takes seconds) and offer the architecture checks next to it instead of proposing the rest of the catalog; the location stays `local`. A generated host CI file is not slimmed.
