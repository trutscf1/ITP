---
doc: roadmap-details
format: gam-ai-knowledge/1
title: Roadmap details
audience: [developer, reviewer, agent]
---
# Roadmap Details

Where the project stands right now, for anyone starting a work session — human or agent (P-ROAD-2). It is the single status entry point: it must be precise enough that a fresh session needs no chat history. Other documents link here and never copy this status.

Keep exactly one of the two position sections below, depending on the mode in [WORKFLOW.md](WORKFLOW.md).

## Current positions (solo mode)

| Feature | Concept document | Phase | Branch | MR | Next step |
| --- | --- | --- | --- | --- | --- |
| [feature] | [concepts/[feature].md](concepts/[feature].md) | [0–8, name] | [branch] | [MR link or —] | [one concrete action] |

## Status index (team mode)

In team mode, positions live in one STATUS file per developer (P-TEAM-3). This index only says who owns what and where to look.

| Feature | Owner | Phase | Status file |
| --- | --- | --- | --- |
| [feature] | [handle] | [0–8, name] | [team/[handle]/STATUS.md](team/[handle]/STATUS.md) |

## Log

Append-only record of processed tasks; entries are marked done instead of being deleted. In team mode every entry starts with the author's handle.

| Date | Handle | Task | Outcome | Done |
| --- | --- | --- | --- | --- |
| [YYYY-MM-DD] | [handle or — in solo mode] | [what was asked, in plain words] | [what was decided or delivered, with IDs and titles] | [✔ or open] |
