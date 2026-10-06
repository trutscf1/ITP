---
doc: concept
format: engineering-human/2
title: "Observability baseline"
audience: [product, developer, reviewer, agent]
id-prefix: "OBS"
serves: "G-1"
---
# Observability baseline Concept

The specification of roadmap feature R2, for its owner, its reviewers, and the agents that will implement it. **This is a first draft made on 2026-10-06 from the team's tracker issues, before any grilling:** it holds the feature goal, the link to the user stories, and one requirement per acceptance criterion. Its owner (trutscf1) sharpens it with `/engineering-human observability`.

## 0. Synthesis Context

Path A (frontloaded). Phase 1 (grill) has not started; nothing in this document is approved.

Open before Phase 4: the requirements below repeat their acceptance criterion one to one and still name technology, which belongs in `STACK.md` (P-DES-4); user interaction, non-functional, and capability requirements, the data model, error conditions, worked examples, architecture, and the test concept (§5–§17) are not written yet.

## 1. Purpose & Goal Trace

**Feature goal:** Operators see metrics, logs, and traces of every service in dashboards with alerts, so that errors and bottlenecks show at once.

**Serves:** `G-1` in [GOAL.md](../GOAL.md), as stated in the *Serves* column of [ROADMAP.md](../ROADMAP.md).

## 3. User Stories & Acceptance Criteria

The user stories and their acceptance criteria are the work items in [work-items/observability/](../work-items/observability/feature.md); they are not repeated here (P-DOC-6).

## 4. Functional Requirements

Draft, derived one to one from the acceptance criteria.

| ID | Title | Requirement | Derives from |
| --- | --- | --- | --- |
| OBS-F-1 | Instrumented services | Given the running stack, when web, storage API, and worker run, the system MUST ensure that each is instrumented with OpenTelemetry. | OBS-AC-1.1 (Instrumented services) |
| OBS-F-2 | Collector routing | Given the OpenTelemetry Collector, when it receives telemetry, the system MUST ensure that it forwards metrics to Prometheus, logs to Loki, and traces to Tempo. | OBS-AC-1.2 (Collector routing) |
| OBS-F-3 | Connected trace | Given a request from the frontend, when it passes the API and a worker job, the system MUST ensure that it is visible as one connected trace. | OBS-AC-1.3 (Connected trace) |
| OBS-F-4 | Structured logs | Given a service, when it writes a log entry, the system MUST ensure that the entry is structured JSON with the trace ID and holds no password or token. | OBS-AC-1.4 (Structured logs) |
| OBS-F-5 | Optional stack | Given the Docker Compose file, when an operator starts it with the observability profile, the system MUST ensure that the observability stack starts with it. | OBS-AC-1.5 (Optional stack) |
| OBS-F-6 | Dashboards | Given Grafana, when an operator opens the dashboards, the system MUST ensure that they show request rate, error rate, latency (p95), upload throughput, queue length, and storage usage. | OBS-AC-2.1 (Dashboards) |
| OBS-F-7 | Linked logs and traces | Given a dashboard, when an operator follows a link, the system MUST ensure that it leads to the matching logs and traces. | OBS-AC-2.2 (Linked logs and traces) |
| OBS-F-8 | Alerts | Given the running system, when the error rate exceeds 5 %, the storage usage exceeds 90 %, or the queue keeps growing, the system MUST ensure that an alert fires. | OBS-AC-2.3 (Alerts) |
| OBS-F-9 | Dashboards as code | Given the repository, when the stack starts, the system MUST ensure that the dashboards stored as code are provisioned automatically. | OBS-AC-2.4 (Dashboards as code) |
| OBS-F-10 | Login required | Given Grafana, when a person opens it, the system MUST ensure that it is reachable only after login. | OBS-AC-2.5 (Login required) |
