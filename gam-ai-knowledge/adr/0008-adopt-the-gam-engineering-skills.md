---
doc: adr
format: gam-ai-knowledge/1
title: "Adopt the gam-engineering skills"
audience: [product, developer, reviewer, agent]
status: accepted
date: "2026-11-10"
deciders: ["tschudea07"]
overrides: []
supersedes: []
---
# ADR-0008 — Adopt the gam-engineering skills

## In plain words

The skill the project works under was renamed and split into the `gam-` skills, and its folders got new names. The rules stay the same; only the names and places change: the long-term documents live in `gam-ai-knowledge/`, the short-term memory of the agents in `gam-ai-memory/`, and the tooling and agent files of the process in `gam-engineering/`.

## Context

[ADR-0002](0002-adopt-engineering-human.md) adopted the skill `engineering-human`, and [ADR-0003](0003-switch-to-team-mode.md) item 1 vendored it in `.claude/skills/engineering-human/`. The skill has since been renamed `gam-engineering` and split into several skills; its documents, tooling, and agent memory have their own folders. Rules, `P-…` IDs, and document structure are unchanged. The migration is `/gam-engineering migrate` on the branch `chore/migrate-gam-engineering`.

## Decision

1. The vendored skills are the folders `.claude/skills/gam-*/` (`gam-engineering`, `gam-setup`, `gam-concept`, `gam-delivery`, `gam-explore`, `gam-ai-knowledge`, `gam-rebuild`, `gam-architecture-review`, `gam-profile`, `gam-ai-memory`). They stay binding for everyone and change only through a merge request, reviewed by the profile maintainer. This replaces item 1 of ADR-0003; its items 2 to 5 stand.
2. The long-term knowledge lives in `gam-ai-knowledge/` (formerly `documentation/`), with its checker `gam-ai-knowledge/tools/doc-check.mjs` and the format `format: gam-ai-knowledge/1`.
3. The short-term memory of the agents lives in `gam-ai-memory/`, with the plans in `gam-ai-memory/plans/`; the root `AGENTS.md` links both folders.
4. The tooling of the process (`status-reminder.mjs`, `merge.ps1`, `prompt-export.mjs`, the docs CI job) and the agent files (`agents/`) live in `gam-engineering/`. `docs/` keeps only the four school documents.
5. Work items are numbered epics, `work-items/E<nn>-<feature>/epic.md`, with status and sprint on every story, `work-items/BACKLOG.md`, and `work-items/sprints/` (P-DOC-6, P-DOC-8).
6. The settings keys are `GAM_ENGINEERING_*`; the values of the merge policy are unchanged.

## Consequences

- Every link and path that named `documentation/`, `tools/doc-check.mjs`, or `docs/agents/` is rewritten; ADRs, Q&A logs, log rows, and `.gitleaksignore` keep their old wording (their fingerprints are bound to commits).
- The vendored skills are copied into the repo; a new version of the skills reaches the team as a merge request.
- The label `type::feature` becomes `type::epic` on GitLab; the host-side rename is done by a maintainer.
- The project keeps its own pipeline; merging it with the pipeline of the skill is a later step.
