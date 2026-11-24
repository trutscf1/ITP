# Adopting a foreign project

Part 9 of [Migrating a project](migrate.md), and step 6 of [Start basis](start.md) when setup finds a foreign project (Q541, Q545, P-GOAL-4). A foreign project has its own documents, another process, or other agents' instruction files; adopting it moves what has a gam home into `gam-ai-knowledge/`, keeps the rest unchanged in `gam-ai-knowledge/sources/`, and links both, so no second documentation set runs beside the gam one. The part needs `gam-ai-knowledge/` with `GOAL.md`; under `migrate` without it, stop and run setup, which preselects the basis *existing project* and calls this part after the goal question.

## Inventory

The signs are the foreign signs of [detect.md](../../gam-engineering/references/detect.md), row 3 (Q546). The inventory of step 2 lists one row per foreign file: *file — content — gam home — action*. The content is read by a draft-tier subagent (P-WS-7), which proposes the home; the session judges the table. Nothing changes before the confirmation.

## Mapping

| Content of the foreign file | Gam home | Action |
| --- | --- | --- |
| Glossary, terms | `CONTEXT.md` | Merge the terms into `CONTEXT.md`; the file moves to `sources/`. |
| Decisions (ADRs, decision logs) | `adr/` | `git mv` each into `adr/` with the next free number; its first line names the origin (old path and number). |
| Requirements, specifications, user stories (speckit `spec.md`, BMAD PRD and stories) | inbox (`next.md`), under flow `full` an epic proposal | One inbox entry per feature, linking the file; the file moves to `sources/`. |
| Stack, setup, run commands | `STACK.md` | Merge into `STACK.md` §0/§1 and the commands; the file moves to `sources/`. |
| Test, deployment, security notes | `TEST_STRATEGY.md`, `DEPLOYMENT.md`, `SECURITY.md` | Merge into the document; the file moves to `sources/`. |
| Anything else | `sources/` | `git mv` unchanged. |

A file whose content is split over several homes moves to `sources/` as a whole, and each gam document links it. Moves use `git mv` (without git a plain move, P-GIT-7), so the history follows. The `README.md` is never moved, since it is the repository's face: `START.md` links its sections, and requirements found in it become inbox entries. The foreign process's own tooling folders (`.specify/`, `.bmad-core/`) move to `sources/` only when the developer chooses so in the confirmation; otherwise they stay and the ADR names them.

## Agent instruction files

Each foreign agent instruction file (`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `.cursor/rules/*`, `.github/copilot-instructions.md`) is asked about by its own `Q<n>` (Q549), with its contradictions to the gam rules listed in the question:

- **Add the gam section** (recommended) — add the routing line of the core rule 2 and the section *AI chat export*, and remove each listed contradiction (another planning folder, another commit or merge rule, another question format).
- **Leave unchanged** — the file stays as it is; the ADR names it.

## ADR

The one ADR of the adoption (mandatory when adopting the skill, gam-concept override 5): *"Adopt gam-engineering in a project with its own documents"*. It lists every moved file with its old and new path, the files kept in `sources/`, the merged contents, the agent files and the answer for each, and the foreign tooling left in place.

## Check

`node gam-ai-knowledge/tools/doc-check.mjs` and the markdown lint report nothing in a file this part touched; no foreign file is left at its old path except the `README.md`, the agent files the developer kept, and the tooling folders left in place; every link to a moved file follows it (`git grep` for the old paths finds nothing outside logs and the ADR).
