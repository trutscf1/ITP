---
doc: epic
format: gam-ai-knowledge/1
title: "[Feature name exactly as in the ROADMAP Feature column]"
audience: [product, developer, reviewer, agent]
id-prefix: "[DOC]"
concept: "[feature].md"
release: "[ROADMAP Version, e.g. 0.19.0]"
shipped: ""
---
# [Feature name]

The parent work item of this epic: its user stories in the order they are built, each with its acceptance criteria in its own file. Read it to see what the epic delivers and how far the work is cut; the behavior itself is specified in the concept document (P-DOC-6).

<!-- Folder: work-items/E<nn>-[feature]/ — <nn> is the highest existing epic number plus one, assigned once and never changed (P-DOC-6). -->
<!-- release: the Version of this feature's row in ROADMAP.md; change both together. shipped: the git tag of the release that delivered the epic (v0.19.0), set when it is tagged; empty until then. -->

- **Concept document:** [`concepts/[feature].md`](../../concepts/[feature].md) — feature goal in §1, requirements from §4 on
- **Epic issue:** [#n, or &n for a GitLab epic — filled in by `/gam-engineering tickets`]
- **Backlog:** the open stories of this epic stand in the [product backlog](../BACKLOG.md) (P-DOC-8)

## User stories

In priority order; each file holds the story, its acceptance criteria, and its slices.

1. [[DOC]-US-1 [Title]]([DOC]-US-1-[slug].md)
2. [[DOC]-US-2 [Title]]([DOC]-US-2-[slug].md)
