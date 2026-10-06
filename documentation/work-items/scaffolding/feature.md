---
doc: feature
format: engineering-human/2
title: "Scaffolding & shared contracts"
audience: [product, developer, reviewer, agent]
id-prefix: "SCF"
concept: "scaffolding.md"
---
# Scaffolding & shared contracts

The parent work item of this feature: its user stories in the order they are built, each with its acceptance criteria in its own file. Read it to see what the feature delivers and how far the work is cut; the behavior itself is specified in the concept document (P-DOC-6).

- **Concept document:** [`concepts/scaffolding.md`](../../concepts/scaffolding.md) — feature goal in §1
- **Feature issue:** #87 (an issue labelled `type::feature`; to be promoted to a group epic, see `WORKFLOW.md`, "Mode")
- **Roadmap:** R1, owner trutscf1

## User stories

In dependency order; each file holds the story, its acceptance criteria, and its slices.

1. [SCF-US-1 Set up the monorepo](SCF-US-1-set-up-the-monorepo.md)
2. [SCF-US-2 Local development environment with Docker Compose](SCF-US-2-local-development-environment-with-docker-compose.md)
3. [SCF-US-3 Shared contracts with Zod and OpenAPI](SCF-US-3-shared-contracts-with-zod-and-openapi.md)
4. [SCF-US-4 Data model and Prisma schema](SCF-US-4-data-model-and-prisma-schema.md)
5. [SCF-US-5 CI pipeline with quality and security checks](SCF-US-5-ci-pipeline-with-quality-and-security-checks.md)
6. [SCF-US-6 Conventional Commits and generated changelog](SCF-US-6-conventional-commits-and-generated-changelog.md)
7. [SCF-US-7 Project documentation and Definition of Done](SCF-US-7-project-documentation-and-definition-of-done.md)
