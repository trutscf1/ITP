# Former names and paths

How a skill reads a project that still has the names and folders of an earlier version. Applied by [Project settings](../SKILL.md#project-settings).

## Former names (P-DOC-10)

A project not yet renamed ([Migrating a project](../../gam-setup/references/migrate.md)) still carries the keys under a former prefix, `HUMANENGINEERING_` or `ENGINEERING_HUMAN_`, and its documents and tooling in `humanengineering/`. During the transition period, read such a key as its `GAM_ENGINEERING_` counterpart and read every `gam-engineering/…` path the gam- skills name as `humanengineering/…` wherever the new one is missing, and offer the migration once per session.

## Knowledge folder (P-DOC-11)

The long-term documents live in `gam-ai-knowledge/`, owned by the skill [gam-ai-knowledge](../../gam-ai-knowledge/SKILL.md); in a project not yet moved they are still in `gam-engineering/documentation/` (or `humanengineering/documentation/`). Read every `gam-ai-knowledge/…` path there while `gam-ai-knowledge/` is missing — except `gam-ai-knowledge/tools/`, which is `gam-engineering/tools/` (or `humanengineering/tools/`) before the move — and offer `/gam-engineering migrate` once per session.

## Plans and agent files (P-DOC-7, P-DOC-9)

The agent files live in `gam-engineering/agents/`; in a project not yet moved they are still in `docs/agents/`, and the plans in a root `plans/`. Read every `gam-engineering/agents/…` path there as `docs/agents/…` while `gam-engineering/agents/` is missing, and every `gam-ai-memory/plans/…` path as `plans/…` while `gam-ai-memory/` is missing, and offer `/gam-engineering migrate` once per session ([migrate-plans.md](../../gam-setup/references/migrate-plans.md)).
