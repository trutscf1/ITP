---
name: gam-setup
description: Setup and administration of the gam-engineering process — set up a new project starting with its goal (setup), show or change the merge, branch-model, model, hook, attribution, and plans-folder settings in .claude/settings.json (settings), switch a repo from solo to team mode (team), decide where the pipeline runs — host CI, local, or both — record it in gam-engineering/pipeline.json, and write the local and CI pipeline files (pipeline), bring a user interface onto the frontend rules — technology skills, design audit, color themes (frontend), and migrate a project from any older state — engineering-profile, a former name (humanengineering, engineering-human), the old layout, unnumbered epics, outdated tooling, the knowledge folder (→ gam-ai-knowledge/, aigamdocs/ → gam-ai-memory/) — in one change (migrate, migrate tools), or one legacy concept document (migrate <feature>). Use when /gam-engineering routes here, or when the developer runs /gam-setup setup, settings, team, pipeline, frontend, or migrate.
---

# gam-setup

The setup and administration commands of [gam-engineering](../gam-engineering/SKILL.md). Before the first step, apply the shared rules of the core once per session — skip what already ran when the core routed here — [Before anything else](../gam-engineering/SKILL.md#before-anything-else), [Asking the developer](../gam-engineering/SKILL.md#asking-the-developer), [The contract](../gam-engineering/SKILL.md#the-contract), and [Project settings](../gam-engineering/SKILL.md#project-settings); this skill adds only its own procedures. The model line and the delegation of [Models](../gam-engineering/references/models.md) apply to every command, also when the core routed here: print the start line first, and send each step the command's row names to a subagent of its tier instead of running it in the session. Every file a project gets is copied from the core's [templates/](../gam-engineering/templates/).

| Invocation | Procedure |
| --- | --- |
| `setup` | [references/setup.md](references/setup.md); the tracker part in [references/setup-tracker.md](references/setup-tracker.md) |
| `settings [ask \| auto \| <key> <value>]` | [references/settings.md](references/settings.md), including the safeguards (merge guard, status hook) |
| `team` | [references/team.md](references/team.md) |
| `pipeline` | [references/pipeline.md](references/pipeline.md): decide where the pipeline runs and which checks it runs, record both in `gam-engineering/pipeline.json`, copy the local pipeline `gam-engineering/local-pipeline.ps1`, and on GitLab write the CI file `gam-engineering/ci/gitlab-pipeline.yml` |
| `pipeline when` | [references/pipeline-when.md](references/pipeline-when.md): change only where the pipeline runs (local, GitLab or GitHub, both, none) and when each location runs it (every merge into dev, only the merge into main, only the release) in an existing project (P-PIPE-8); `when` is a reserved argument |
| `frontend` | [references/frontend.md](references/frontend.md): bind the technology skills in `STACK.md` §10, audit the existing interface, list the gaps to the color themes and font sizes (P-DES-7…9), and hand them to one grilled feature; `frontend` is a reserved argument |
| `migrate` | [references/migrate.md](references/migrate.md): detect every older state (`engineering-profile`, the layout before 2026-10-14, the former names `humanengineering` and `engineering-human`, unnumbered work items, outdated tooling, documents outside `gam-ai-knowledge/`, an `aigamdocs/`, or plans and agent files at the old place), one inventory, one change; it loads the `migrate-*.md` part of each detected state |
| `migrate tools` | The same procedure, limited to the old layout, the tooling, and the short-term memory; `tools` is a reserved argument, not a feature name |
| first change to an unnumbered work-item tree (`feature.md`) | The same procedure, limited to the work items |
| `migrate <feature>` | [references/migrate-concept.md](references/migrate-concept.md), one legacy concept document |
| first gam- command of a session (core rule 7), `setup`, `migrate` | [references/memory.md](references/memory.md): whether gam-ai-memory is installed and current, the one hint line, `/gam-ai-memory init` (P-DOC-12) |
