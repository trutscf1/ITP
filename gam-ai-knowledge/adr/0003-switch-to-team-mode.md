---
doc: adr
format: gam-ai-knowledge/1
title: "Switch to team mode"
audience: [product, developer, reviewer, agent]
status: accepted
date: "2026-10-06"
deciders: ["trutscf1"]
overrides: []
supersedes: []
---
# ADR-0003 — Switch to team mode

## In plain words

Four people work on this repository, so the working rules now travel with it: the `engineering-human` skill is part of the repo, everyone has their own status file and inbox, and committed documents name people by their GitLab username.

## Context

The project was migrated to `engineering-human` in solo layout ([ADR-0002](0002-adopt-engineering-human.md)), with the skill installed only on one developer's machine although `CLAUDE.md` makes it mandatory for everyone. Team mode was chosen in [qa-log.md](../qa-log.md), Q4.

## Decision

1. The skill is vendored in `.claude/skills/engineering-human/`; the repo copy is binding and changes only through a merge request (P-TEAM-1). *Path superseded by [ADR-0008](0008-adopt-the-gam-engineering-skills.md): the vendored skills are now `.claude/skills/gam-*/`.*
2. Handles are the GitLab usernames; roster, roles, and ownership rules are in [team/TEAM.md](../team/TEAM.md). `trutscf1` is PM approver and profile maintainer.
3. Session positions and inboxes live in `team/<handle>/`; `ROADMAP-DETAILS.md` is the index and the log (P-TEAM-3).
4. Every roadmap feature has one owner in the Owner column of `ROADMAP.md` (P-TEAM-4).
5. The merge policy stays `ask`; no merge setting changes with this switch.

## Consequences

- Every developer adds `Developer handle: <handle>` to their own gitignored `CLAUDE.local.md`.
- New text in `documentation/` uses handles. The school documents in `docs/` and the legacy R1 concept and its question log keep the real names they already contain.
- A change to the profile is a merge request against the repo copy, reviewed by the profile maintainer.
