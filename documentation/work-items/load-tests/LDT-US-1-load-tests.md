---
doc: story
format: engineering-human/2
title: "LDT-US-1 Load tests"
audience: [product, developer, reviewer, agent]
id-prefix: "LDT"
---
# LDT-US-1 Load tests

One user story of [Load tests & operations dashboards](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-47 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| LDT-US-1 | Load tests | operator | to test the platform under load | bottlenecks are known before the release | Could |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| LDT-AC-1.1 | Scripts | The k6 scripts | They run | They cover login, file list, upload, download, and search |
| LDT-AC-1.2 | Concurrent users | The documented scenario | It runs | At least 50 virtual users are active at the same time |
| LDT-AC-1.3 | Evaluated results | A finished load test | Its results are evaluated | Latency and error rate are analysed in Grafana and recorded in the documentation |
| LDT-AC-1.4 | Bottlenecks as issues | A bottleneck found in a load test | The test is evaluated | The bottleneck is recorded as an issue of its own |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | LDT-AC-1.1, LDT-AC-1.2, LDT-AC-1.3, LDT-AC-1.4 | — | #84 |

- **Story issue:** #84
- **Weight:** 3
- **Depends on:** OBS-US-2 (Operations dashboards and alerts, #83)
