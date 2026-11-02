---
doc: story
format: engineering-human/2
title: "OBS-US-2 Operations dashboards and alerts"
audience: [product, developer, reviewer, agent]
id-prefix: "OBS"
---
# OBS-US-2 Operations dashboards and alerts

One user story of [Observability baseline](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-46 and brought into this form on 2026-10-06. On 2026-10-27 the grilling replaced the technology names by neutral ones, split the alerts into one criterion each, and added the alert for a silent unit (`OBS-AC-2.6` to `OBS-AC-2.8`; [question log](../../concepts/observability.qa-log.md), Q8–Q16). On 2026-11-02 the owner's answers to the gate review renamed the story (A18; before: "Grafana dashboards and alerts"), moved the login to `identity` (`OBS-AC-2.5`, Q37), and kept the dashboard tool on the server itself until TLS exists (Q36).

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| OBS-US-2 | Operations dashboards and alerts | operator | operations dashboards and alerts behind a login | I notice errors and bottlenecks at once | Should |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| OBS-AC-2.1 | Operations overview | The dashboard tool with telemetry of the last hour | An operator opens the operations dashboard "Operations overview" | It shows per unit the request rate, the error rate, and the 95th-percentile latency, and for the installation the upload throughput, the waiting jobs per queue, and the storage usage |
| OBS-AC-2.2 | Linked logs and traces | A panel of the operations dashboard, a log entry with a trace ID, and a trace | An operator follows the link of each | The panel opens the log entries of the same unit and time range, the log entry opens its trace, and the trace opens its log entries |
| OBS-AC-2.3 | Error rate alert | A unit that answered more than 5 % of at least 20 requests in the last 5 minutes with a server error | The alert rules are evaluated | The alert "High error rate" for that unit is firing in the alert list |
| OBS-AC-2.4 | Dashboards as code | The operations dashboards and alert rules stored as files in the repository | The observability stack starts | They are loaded into the dashboard tool automatically, and a change made in the dashboard tool cannot be saved over them |
| OBS-AC-2.5 | Login required | The dashboard tool behind the reverse proxy over HTTPS | A person without an operator session of `identity` opens its address | They are sent to the login of `identity`, and no operations dashboard, telemetry, or alert is reachable; the dashboard tool has no login form and no password of its own |
| OBS-AC-2.6 | Storage usage alert | Object storage with more than 90 % of its capacity used for 5 minutes | The alert rules are evaluated | The alert "Storage almost full" is firing in the alert list |
| OBS-AC-2.7 | Queue growth alert | A queue whose waiting jobs grew at each of the last three 5-minute steps to at least 10 | The alert rules are evaluated | The alert "Queue growing" for that queue is firing in the alert list |
| OBS-AC-2.8 | Silent unit alert | A unit that delivered telemetry in the last 24 hours | It has delivered none for 2 minutes | The alert "Unit silent" for that unit is firing in the alert list |

## Slices

The vertical slices that deliver this story (concept §16, Q30). Slice 1 is delivered by the story issue itself; every further slice becomes a child issue of it with `/engineering-human tickets observability`. The panels and alerts that read the metrics of storage and processing wait for R5 and R9, the silent-unit alert follows them (A19), and the login through `identity` waits for R3 and TLS of R14 (Q36, Q37); until then the dashboard tool is reachable only on the server itself (A22).

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — dashboard tool on the server itself, stored files, and links (`trutscf1`) | OBS-AC-2.2, OBS-AC-2.4 | OBS-US-1 slice 1 | #83 |
| 2 — error rate alert (`trutscf1`) | OBS-AC-2.3 | slice 1 | — |
| 3 — operations dashboard "Operations overview" (`trutscf1`) | OBS-AC-2.1 | slice 1; the metrics of R5 and R9 | — |
| 4 — storage, queue, and silent-unit alerts (`trutscf1`) | OBS-AC-2.6, OBS-AC-2.7, OBS-AC-2.8 | slice 2; the metrics of R5 and R9 | — |
| 5 — login through `identity` behind the reverse proxy over HTTPS (`trutscf1`) | OBS-AC-2.5 | slice 1; the operator login of R3; TLS of R14 | — |

- **Story issue:** #83
- **Weight:** 5 (five slices; set on #83 with the revision of 2026-11-02, Q216)
- **Depends on:** OBS-US-1 (Telemetry of every unit, #82); slices 3 and 4 also R5 and R9, slice 5 also R3 and R14
