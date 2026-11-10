# Where the rules live

The rules the gam- skills apply are not restated in the core, so they cannot drift apart. Linked from [the core](../SKILL.md#where-the-rules-live); moved here so the core stays within the size the compaction keeps (M-2).

| Topic | Single source |
| --- | --- |
| Standing decisions (all `P-…` IDs) | [PROFILE.md](../PROFILE.md) |
| Derivation chain, consistency rules, consistency check | [manifest: The Derivation Chain](../../gam-ai-knowledge/templates/concept_authoring_manifest.md#the-derivation-chain) |
| Work-item tree (epic → user story → slice), epic numbers, release and shipped tag, issue hierarchy, GitLab tier check | P-DOC-6, P-TRK-2, P-TRK-4, [manifest: The Documentation Set](../../gam-ai-knowledge/templates/concept_authoring_manifest.md#the-documentation-set), [templates/work-items/](../../gam-ai-knowledge/templates/work-items/) |
| Dual human/AI readability, Part H | [manifest: Writing for Humans and Machines](../../gam-ai-knowledge/templates/concept_authoring_manifest.md#writing-for-humans-and-machines) |
| Legacy documents and their marker | [manifest: Legacy documents](../../gam-ai-knowledge/templates/concept_authoring_manifest.md#legacy-documents), P-DOC-5 |
| Solo vs. team documents, developer handle | [manifest: Team Mode](../../gam-ai-knowledge/templates/concept_authoring_manifest.md#team-mode) |
| Phases, gates, concept document structure | [manifest: The Phases](../../gam-ai-knowledge/templates/concept_authoring_manifest.md#the-phases), [Concept Document Structure Template](../../gam-ai-knowledge/templates/concept_authoring_manifest.md#concept-document-structure-template) |
| Project-specific workflow values, Definition of Done | the project's `gam-ai-knowledge/WORKFLOW.md` ([template](../../gam-ai-knowledge/templates/WORKFLOW.md)) |
| Merge policy value, approval count, release merge, merge guard, status hook, main and subagent models | the project's `.claude/settings.json` ([template](../templates/claude/settings.json)); rules in P-MR-4…6 and P-ROAD-4, reading in [Project settings](../SKILL.md#project-settings), application in [gam-delivery: Merge policy](../../gam-delivery/SKILL.md#merge-policy), safeguards in [gam-setup: Settings](../../gam-setup/references/settings.md#safeguards), models in [Models](models.md) |
| Pipeline location and what "green" means | P-PIPE-1, P-PIPE-2; value in the project's `gam-engineering/pipeline.json` |
| Branch model `dev` or `trunk`, what changes without `dev`, switching | P-GIT-9, [branches.md](branches.md); value in the project's `.claude/settings.json` |
| Where AI-written plans live and how they are referenced | P-DOC-7; folder set by `plansDirectory` in the project's `.claude/settings.json` |
| Question format | [Asking the developer](../SKILL.md#asking-the-developer) |
| Status check | [manifest: Consistency check](../../gam-ai-knowledge/templates/concept_authoring_manifest.md#consistency-check), step 5 |

In a project, read the project's copy (`gam-ai-knowledge/MANIFEST.md`); the file in `templates/` is only the starting point for new projects.
