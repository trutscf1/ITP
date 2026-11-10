# Check

Loaded by `/gam-ai-knowledge check`. It runs the mechanical checks of the knowledge folder and reports; it never changes a file. The full consistency check, which also judges contradictions between documents, is `/gam-engineering check`.

1. **Find the folder and the checker.** The folder is `gam-ai-knowledge/`, or in a project not yet moved `gam-engineering/documentation/` or `humanengineering/documentation/` ([Reading](../SKILL.md#reading), rule 3). Run the project's copy `gam-ai-knowledge/tools/doc-check.mjs` (before the move: `gam-engineering/tools/doc-check.mjs`); without a copy, run this skill's `templates/gam-ai-knowledge/tools/doc-check.mjs` with the folder as its argument and name the missing copy in the report.
2. **Run** `node <checker>` and, in a git repository, `node <checker> --status`.
3. **Report** every error and warning with its rule, file, and line, grouped by file, then the two summary lines of the checker. When a copy differs from this skill's template, say that `/gam-engineering migrate tools` refreshes it.
4. **Confirm nothing changed:** `git status --short` shows the same files as before step 2.
