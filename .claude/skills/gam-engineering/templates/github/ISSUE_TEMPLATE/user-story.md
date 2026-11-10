---
name: User story
about: One user story from a concept document, with its acceptance criteria (P-TRK-2)
title: "<DOC>-US-<n> <Title>"
labels: ["type::story", "status::ready"]
---
<!-- markdownlint-disable-file MD041 -->
## User story

**As a** [role from GOAL.md] **I want** [capability] **so that** [benefit].

Part of: #[epic issue] · Story file: `gam-ai-knowledge/work-items/E[nn]-[feature]/[DOC]-US-[n]-[slug].md` · Concept document: `gam-ai-knowledge/concepts/[feature].md`

## Acceptance criteria

<!-- Copy the AC-n.m rows verbatim from the story file. Never reword them here. -->

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| [DOC]-AC-[n].1 | [title] | [state with values] | [action] | [observable outcome with values] |

## Planning

- **Weight:** [1 | 2 | 3 | 5 | 8] — above 8: split the story in its story file first. GitHub has no weight field; it lives here (or in a Projects number field, as bound in `WORKFLOW.md`).
- **Assignee:** set in the issue sidebar
- **Milestone:** `Sprint <n>` (in `goal` mode `Sprint <n> — <goal>`)
