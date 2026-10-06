---
doc: concept
format: engineering-human/2
title: "Load tests & operations dashboards"
audience: [product, developer, reviewer, agent]
id-prefix: "LDT"
serves: "G-1"
---
# Load tests & operations dashboards Concept

The specification of roadmap feature R13, for its owner, its reviewers, and the agents that will implement it. **This is a first draft made on 2026-10-06 from the team's tracker issues, before any grilling:** it holds the feature goal, the link to the user stories, and one requirement per acceptance criterion. Its owner (trutscf1) sharpens it with `/engineering-human load-tests`.

## 0. Synthesis Context

Path A (frontloaded). Phase 1 (grill) has not started; nothing in this document is approved.

Open before Phase 4: the requirements below repeat their acceptance criterion one to one and still name technology, which belongs in `STACK.md` (P-DES-4); user interaction, non-functional, and capability requirements, the data model, error conditions, worked examples, architecture, and the test concept (§5–§17) are not written yet.

## 1. Purpose & Goal Trace

**Feature goal:** Operators know how the platform behaves under load before a release, because load tests show its bottlenecks.

**Serves:** `G-1` in [GOAL.md](../GOAL.md), as stated in the *Serves* column of [ROADMAP.md](../ROADMAP.md).

## 3. User Stories & Acceptance Criteria

The user stories and their acceptance criteria are the work items in [work-items/load-tests/](../work-items/load-tests/feature.md); they are not repeated here (P-DOC-6).

## 4. Functional Requirements

Draft, derived one to one from the acceptance criteria.

| ID | Title | Requirement | Derives from |
| --- | --- | --- | --- |
| LDT-F-1 | Scripts | Given the k6 scripts, when they run, the system MUST ensure that they cover login, file list, upload, download, and search. | LDT-AC-1.1 (Scripts) |
| LDT-F-2 | Concurrent users | Given the documented scenario, when it runs, the system MUST ensure that at least 50 virtual users are active at the same time. | LDT-AC-1.2 (Concurrent users) |
| LDT-F-3 | Evaluated results | Given a finished load test, when its results are evaluated, the system MUST ensure that latency and error rate are analysed in Grafana and recorded in the documentation. | LDT-AC-1.3 (Evaluated results) |
| LDT-F-4 | Bottlenecks as issues | Given a bottleneck found in a load test, when the test is evaluated, the system MUST ensure that the bottleneck is recorded as an issue of its own. | LDT-AC-1.4 (Bottlenecks as issues) |
