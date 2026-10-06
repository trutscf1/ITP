---
doc: story
format: engineering-human/2
title: "OBS-US-1 OpenTelemetry instrumentation"
audience: [product, developer, reviewer, agent]
id-prefix: "OBS"
---
# OBS-US-1 OpenTelemetry instrumentation

One user story of [Observability baseline](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-45 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| OBS-US-1 | OpenTelemetry instrumentation | operator | all services to deliver metrics, logs, and traces | the runtime behaviour can be followed at any time | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| OBS-AC-1.1 | Instrumented services | The running stack | Web, storage API, and worker run | Each is instrumented with OpenTelemetry |
| OBS-AC-1.2 | Collector routing | The OpenTelemetry Collector | It receives telemetry | It forwards metrics to Prometheus, logs to Loki, and traces to Tempo |
| OBS-AC-1.3 | Connected trace | A request from the frontend | It passes the API and a worker job | It is visible as one connected trace |
| OBS-AC-1.4 | Structured logs | A service | It writes a log entry | The entry is structured JSON with the trace ID and holds no password or token |
| OBS-AC-1.5 | Optional stack | The Docker Compose file | An operator starts it with the observability profile | The observability stack starts with it |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it. A story of this weight needs more than one slice of at most 4 h (`WORKFLOW.md`, "Issues and weight"); its owner cuts them in the concept document.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | OBS-AC-1.1, OBS-AC-1.2, OBS-AC-1.3, OBS-AC-1.4, OBS-AC-1.5 | — | #82 |

- **Story issue:** #82
- **Weight:** 5
- **Depends on:** SCF-US-2 (Local development environment with Docker Compose, #39)
