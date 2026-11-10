# Migrating from engineering-profile

Part 1 of [Migrating a project](migrate.md), loaded when its step 1 detects the predecessor skill. Detection, the one confirmation, the branch, and the checks are in that file; this part holds only the actions.

Projects started with the predecessor skill keep working: every `P-…` ID kept its number and meaning, and the project's own `gam-engineering/documentation/MANIFEST.md` still governs it until replaced. Migration adds what is new without rewriting finished work (P-DOC-5).

## Inventory rows

Every row of the table below, and every concept document (legacy or current) with its proposed action: migrate now with [migrate-concept.md](migrate-concept.md), or mark it legacy.

## Project-level files

| Item | Action |
| --- | --- |
| `GOAL.md` | Draft `G-1`, roles, success signals, and non-goals from the *Projektantrag*, README, and existing concept §1 sections; **the user decides** the final wording (P-GOAL-1). Nothing below is derived before it is confirmed. |
| `MANIFEST.md` | Replace with the current template. Before that, diff the project copy against the predecessor's template (`~/.claude/skills/engineering-profile/templates/concept_authoring_manifest.md`, if still installed) and carry every project-specific change over; list them in the MR. |
| `CLAUDE.md` | Change `engineering-profile` to `gam-engineering`, `/grill-with-docs` to `/gam-engineering`, and `/to-tickets` / `/implement` to `/gam-engineering tickets` / `implement`; add the new sections of [templates/CLAUDE.md](../../gam-engineering/templates/CLAUDE.md) without dropping project-specific content. |
| `ROADMAP.md` | Add the *Serves* column; propose a value per feature, the user confirms. A feature that serves no part of `G-1` is reported, not silently kept (P-GOAL-3). |
| `WORKFLOW.md` | Add the missing sections of [templates/WORKFLOW.md](../../gam-ai-knowledge/templates/WORKFLOW.md) (mode, merge policy pointer, labels, sprints, MR rules, Definition of Done, releases, time tracking); keep the existing bindings. Ask for a missing *Sprint mode* as a `Q<n>`; an existing sprint length is offered as `fixed`, never taken over silently. |
| `.claude/settings.json`, `.claude/hooks/` | Merge [templates/claude/settings.json](../../gam-engineering/templates/claude/settings.json) into the existing settings without dropping any key: the `model` key, `plansDirectory` (P-DOC-7), all five `env` values, the merge guard (only under `ask`), and the `Stop` hook; copy [templates/gam-engineering/tools/status-reminder.mjs](../../gam-engineering/templates/gam-engineering/tools/status-reminder.mjs). An older `status-reminder.sh` and its `Stop` entry are replaced by the Node version. Ask for the policy, the approval count, and the release merge as one `Q<n>` (defaults `ask`, `1`, `ask`). |
| `STACK.md` | If missing, create it from [templates/STACK.md](../../gam-ai-knowledge/templates/STACK.md) with the technology already in use; if present, add the missing sections and the *In Plain Words* summary (P-HUM-4). |
| `ROADMAP.md` stages | Map every *Status* cell to a P-ROAD-1 stage and bring it up to date with the merged MRs and closed issues (`/gam-engineering check`, status step). |
| `ROADMAP-DETAILS.md`, `next.md`, `VERSIONING.md` | Add the purpose introduction and title columns from the templates (P-HUM-4); keep all content, rewrite no log entry. |
| Glossary and ADRs | If they sit at the root: `git mv CONTEXT.md gam-engineering/documentation/CONTEXT.md` and `git mv docs/adr gam-engineering/documentation/adr` (ADR numbers unchanged), create the root `CONTEXT-MAP.md` from [templates/CONTEXT-MAP.md](../../gam-engineering/templates/CONTEXT-MAP.md), and update every link to them in the repo (P-DOC-2). |
| `docs/agents` | Rewrite `issue-tracker.md` and `domain.md` per [references/setup-tracker.md](setup-tracker.md), keeping project-specific additions; remove `triage-labels.md` (the labels now live in `WORKFLOW.md`). |
| `.gitlab/` or `.github/` | Copy [templates/gitlab/](../../gam-engineering/templates/gitlab/) to `.gitlab/` or [templates/github/](../../gam-engineering/templates/github/) to `.github/`, matching the host; labels, milestones, branch protection, required approvals, and merge method are host settings — hand them to `/gam-v-wizard` as human steps. |
| ADR | *"Adopt gam-engineering; legacy concept documents migrate on touch (P-DOC-5)"*, listing the legacy documents. |
| Frontmatter | Add the frontmatter of the [Machine-Readable Contract](../../gam-ai-knowledge/templates/concept_authoring_manifest.md#machine-readable-contract) to every file in `gam-engineering/documentation/`, taking `title` and the fields from the matching template. A concept document's `title` is its feature name exactly as in `ROADMAP.md`. |
| Legacy marker | Every concept document not migrated in this MR gets `format: legacy` in its frontmatter ([manifest: Legacy documents](../../gam-ai-knowledge/templates/concept_authoring_manifest.md#legacy-documents)); an older legacy line in the body is removed. |
| Checks | The tooling comes from part 5 in the same change. Every finding of the checks (step 4 of [Migrating a project](migrate.md)) on the project-level files is fixed; the ones in legacy documents are listed as *not migrated* in the MR. |
| Mode | Ask solo or team as a `Q<n>`; for team run [Switching solo → team](team.md) afterwards in a separate MR. |

## Finishing

When no legacy document remains (or only finished ones the team keeps as legacy on purpose), suggest removing the predecessor skill from `~/.claude/skills/` — never delete it without the user's confirmation, since other projects may still use it.
