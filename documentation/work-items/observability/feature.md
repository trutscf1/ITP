---
doc: feature
format: engineering-human/2
title: "Observability baseline"
audience: [product, developer, reviewer, agent]
id-prefix: "OBS"
concept: "observability.md"
---
# Observability baseline

The parent work item of this feature: its user stories in the order they are built, each with its acceptance criteria in its own file. Read it to see what the feature delivers and how far the work is cut; the behavior itself is specified in the concept document (P-DOC-6).

- **Concept document:** [`concepts/observability.md`](../../concepts/observability.md) — feature goal in §1
- **Feature issue:** #88 (an issue labelled `type::feature`; to be promoted to a group epic, see `WORKFLOW.md`, "Mode")
- **Concept issue:** #114
- **Roadmap:** R2, owner trutscf1

## User stories

In dependency order; each file holds the story, its acceptance criteria, and its slices.

1. [OBS-US-1 Telemetry of every unit](OBS-US-1-telemetry-of-every-unit.md) — every unit delivers metrics, log entries, and traces, without data that identifies a person
2. [OBS-US-2 Operations dashboards and alerts](OBS-US-2-operations-dashboards-and-alerts.md) — operations dashboards and four alert rules behind the login of `identity`
