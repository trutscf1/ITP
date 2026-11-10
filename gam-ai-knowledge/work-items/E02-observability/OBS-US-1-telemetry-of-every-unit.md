---
doc: story
format: gam-ai-knowledge/1
title: "OBS-US-1 Telemetry of every unit"
audience: [product, developer, reviewer, agent]
id-prefix: "OBS"
status: review
sprint: 2
---
# OBS-US-1 Telemetry of every unit

One user story of [Observability baseline](epic.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-45 and brought into this form on 2026-10-06. On 2026-10-27 the grilling replaced the technology names by neutral ones, extended the instrumentation to all five units, and added the criteria `OBS-AC-1.6` and `OBS-AC-1.7` ([question log](../../concepts/observability.qa-log.md), Q2–Q7). On 2026-11-02 the owner's answers to the gate review renamed the story (A18; before: "OpenTelemetry instrumentation"), switched the profile on by default (`OBS-AC-1.5`, Q35), and made `OBS-AC-1.4` precise about the trace ID (Q38).

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| OBS-US-1 | Telemetry of every unit | operator | every unit to deliver metrics, log entries, and traces to one observability stack | the runtime behaviour can be followed at any time | Must |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| OBS-AC-1.1 | Instrumented units | The local stack started with the observability profile | Each of the five units `web`, `identity`, `storage`, `worker`, `cms` has run for 60 seconds | The metric store holds the heartbeat metric of each unit, and the log store holds the start log entry of each unit, each with the unit's name |
| OBS-AC-1.2 | Collector routing | The collector of the observability stack | A unit sends it metrics, log entries, and traces | Within 60 seconds the metrics are in the metric store, the log entries in the log store, and the traces in the trace store |
| OBS-AC-1.3 | Connected trace | A request to `web` that calls `storage`, which queues a job for `worker` | The job has finished | The trace store holds one trace with the spans of `web`, `storage`, and the `worker` job under one trace ID |
| OBS-AC-1.4 | Structured logs | A unit that handles a request | It writes a log entry whose attributes hold a password and a session token | The entry is one JSON object with time, level, unit, message, and the trace ID of the request, and the values of the password and the token are replaced by `[redacted]`; an entry written outside a request or a job, such as at start or shutdown, has no trace ID |
| OBS-AC-1.5 | Observability profile | The stack definition and the example configuration | An operator starts the local stack with its start command | The collector, the metric store, the log store, the trace store, and the dashboard tool start and report healthy; when the operator has removed the observability profile from the configuration, none of them starts |
| OBS-AC-1.6 | No person identifiers | A request from IP address `203.0.113.7` to a share link, whose handling writes an error message containing `ada@example.org` | The unit records the request | No metric, log entry, or trace holds the IP address, the e-mail address, a member ID, the share-link token, or the query string |
| OBS-AC-1.7 | Units without the stack | The local stack started without the observability profile | Every unit runs and answers requests | No unit is `down` or `degraded` because of telemetry, and every unit still writes its log entries as JSON lines to its standard output |

## Slices

The vertical slices that deliver this story (concept §16, Q30). Slice 1 is delivered by the story issue itself; every further slice becomes a child issue of it with `/gam-engineering tickets observability`. Slices 3–6 change units of other tracks and are built by those tracks' owners. The trace through a job needs the upload of R5 and the queue of R9, so it has its own slice (A19).

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — observability stack in the local stack, images pinned and scanned (`trutscf1`) | OBS-AC-1.2, OBS-AC-1.5 | — | #82 |
| 2 — shared package `telemetry` (`trutscf1`) | OBS-AC-1.4, OBS-AC-1.6, OBS-AC-1.7 | — | — |
| 3 — `cms` instrumented (`trutscf1`) | OBS-AC-1.1 | slices 1, 2 | — |
| 4 — `web` instrumented (`schwaigc`) | OBS-AC-1.1 | slices 1, 2 | — |
| 5 — `identity` instrumented (`tschudea07`) | OBS-AC-1.1 | slices 1, 2 | — |
| 6 — `storage` and `worker` instrumented (`schauby1`) | OBS-AC-1.1 | slices 1, 2 | — |
| 7 — trace through the job (`schauby1`) | OBS-AC-1.3 | slice 6; a job queued by `storage` (R5, R9) | — |

- **Story issue:** #82
- **Weight:** 8 (seven slices; set on #82 with the revision of 2026-11-02, Q216)
- **Depends on:** SCF-US-2 (Local development environment with Docker Compose, #39); slice 7 also R5 and R9
