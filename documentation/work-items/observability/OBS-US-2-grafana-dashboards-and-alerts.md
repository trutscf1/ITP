---
doc: story
format: engineering-human/2
title: "OBS-US-2 Grafana dashboards and alerts"
audience: [product, developer, reviewer, agent]
id-prefix: "OBS"
---
# OBS-US-2 Grafana dashboards and alerts

One user story of [Observability baseline](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-46 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| OBS-US-2 | Grafana dashboards and alerts | operator | dashboards and alerts | I notice errors and bottlenecks at once | Should |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| OBS-AC-2.1 | Dashboards | Grafana | An operator opens the dashboards | They show request rate, error rate, latency (p95), upload throughput, queue length, and storage usage |
| OBS-AC-2.2 | Linked logs and traces | A dashboard | An operator follows a link | It leads to the matching logs and traces |
| OBS-AC-2.3 | Alerts | The running system | The error rate exceeds 5 %, the storage usage exceeds 90 %, or the queue keeps growing | An alert fires |
| OBS-AC-2.4 | Dashboards as code | The repository | The stack starts | The dashboards stored as code are provisioned automatically |
| OBS-AC-2.5 | Login required | Grafana | A person opens it | It is reachable only after login |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | OBS-AC-2.1, OBS-AC-2.2, OBS-AC-2.3, OBS-AC-2.4, OBS-AC-2.5 | — | #83 |

- **Story issue:** #83
- **Weight:** 3
- **Depends on:** OBS-US-1 (OpenTelemetry instrumentation, #82)
