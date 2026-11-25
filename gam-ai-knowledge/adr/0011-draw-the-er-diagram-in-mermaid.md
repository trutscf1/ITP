---
doc: adr
format: gam-ai-knowledge/1
title: "Draw the ER diagram in Mermaid instead of Vertabelo"
audience: [product, developer, reviewer, agent]
status: accepted
date: "2026-11-25"
deciders: ["trutscf1"]
overrides: []
supersedes: []
---
# ADR-0011 — Draw the ER diagram in Mermaid instead of Vertabelo

The number 0011 is provisional until the merge into `dev` (team mode, P-TEAM-5); 0009 and 0010 were already taken.

## In plain words

The school asks for the entity-relationship diagram of the database to be drawn in Vertabelo. This project draws it as text in Mermaid and renders a PNG from that text. The risk is that the teacher does not accept the tool. If so, the diagram is redrawn in Vertabelo from the Mermaid text.

## Context

`docs/anforderungen_software_projekte.md` (line 285) asks for an "ER Diagramm mit vertabello (redgate)". That requirement is binding, and `docs/` wins over decisions of the engineering profile. It is not an ID of the profile, so `overrides` stays empty and this ADR names the overridden requirement here. No Vertabelo diagram exists: Vertabelo needs a personal account, and nobody has drawn one. On 2026-11-25 the developer decided: "es gibt noch keines, zeichne eines mit mermaid" (Q27 in `concepts/scaffolding.md`). The text form of the diagram in `concepts/scaffolding.md` §8 already exists, is binding for the schema (SCF-F-23), and is compared with the schema by the acceptance tests (SCF-T-18, SCF-T-19).

## Decision

- The diagram is drawn as Mermaid text in `gam-ai-knowledge/images/er-diagram.mmd`, the same text as in `concepts/scaffolding.md` §8. The text stays the binding source.
- A PNG is rendered from it with `@mermaid-js/mermaid-cli` (12.0.0) into `gam-ai-knowledge/images/er-diagram.png` and embedded in §8. The tool is not a dependency of the repository; it runs from a scratch directory.
- `SCF-C-21` names Mermaid with the rendered export instead of Vertabelo; `SCF-AC-4.1` reads "ER diagram" without the tool.

## Consequences

- The school requirement names Vertabelo. The teacher may not accept Mermaid; then the grading of the point "ER diagram" is at risk.
- Fallback: redraw the diagram in Vertabelo from the Mermaid text (9 tables, listed in §8) and replace the PNG; no other document changes.
- A change of the schema changes the Mermaid text first, then the PNG is rendered again in the same merge request.
- The final presentation reports the deviation next to the others (`WORKFLOW.md`, "Deviations from the project proposal").

## Considered options

- **Vertabelo as the school asks.** Follows the requirement, but needs a human account and a manual drawing that cannot be tested against the schema. Not chosen by the developer.
- **Mermaid text only, no PNG.** Renders on GitLab and GitHub, but the requirement asks for an exported diagram. Rejected.
