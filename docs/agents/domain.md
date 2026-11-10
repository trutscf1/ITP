# Domain docs

How agents and skills read this repo's domain documentation before they explore the code. Written by `/gam-engineering setup`; edit it directly if the layout changes.

## Read these first

1. `gam-ai-knowledge/GOAL.md` — the project goal `G-1` everything derives from.
2. `gam-ai-knowledge/CONTEXT.md` — the glossary. In a multi-context repo, the root `CONTEXT-MAP.md` lists one glossary per context; read each one relevant to the topic.
3. `gam-ai-knowledge/adr/` — the decision records that touch the area you work in.

The root `CONTEXT-MAP.md` only points to these files. Never create a root `CONTEXT.md` or `docs/adr/`. If a file does not exist yet, proceed silently; `/domain-modeling` creates it when a term or decision is actually resolved.

## Use the glossary's words

When your output names a domain concept — an issue title, a test name, a refactor proposal — use the term exactly as `gam-ai-knowledge/CONTEXT.md` defines it. A missing term is a signal: either you are inventing language the project does not use, or there is a real gap to note for `/domain-modeling`.

## Flag ADR conflicts

If your output contradicts an ADR, say so explicitly instead of overriding it silently:

> *Contradicts ADR-0007 (event-sourced orders), but worth reopening because …*
