---
doc: adr
format: gam-ai-knowledge/1
title: "The units encode OTLP themselves instead of using the OpenTelemetry SDK"
audience: [product, developer, reviewer, agent]
status: proposed
date: "2026-11-10"
deciders: ["trutscf1"]
overrides: []
supersedes: []
---
# ADR-0009 — The units encode OTLP themselves instead of using the OpenTelemetry SDK

## In plain words

Every unit reports metrics, log entries, and spans to the collector through the package `packages/telemetry`. The package speaks the OpenTelemetry protocol (OTLP over HTTP with JSON bodies) with its own code and brings no OpenTelemetry library. The collector and the three stores are the planned OpenTelemetry components and do not change.

## Context

The project proposal names observability through OpenTelemetry, and `STACK.md` section 1 left the choice of the instrumentation library "to be confirmed in slice 2". Slice 2 of OBS-US-1 (#154) builds the package. The assumption A1 of round 68 chose own code, and the review of !48 asked for a record of that choice, because it replaces the library that was planned and commits the team to maintain code.

## Decision

The package `telemetry` encodes the OTLP protocol itself (`src/otlp.ts`, about 150 lines) and keeps no runtime dependency. We chose this because the logs packages of the OpenTelemetry SDK are experimental (Definition of Done item 18), because its exporters keep their own queues instead of the bounded buffer that OBS-E-1 requires, and because every package would have to pass the supply-chain rules of `pnpm-workspace.yaml`.

## Consequences

- The team maintains its own code for spans, metrics, the W3C Trace Context, the export, and the buffer.
- Nothing is instrumented automatically: HTTP handlers, outgoing calls, Prisma, and BullMQ are wrapped by hand in each unit (the module M11 of that unit's slice).
- The collector, the stores, and the dashboards are unchanged, since the protocol is the same; a unit could later switch to the SDK without a change to them.
- The final presentation reports the deviation from the proposal (`WORKFLOW.md`, "Deviations from the project proposal").

## Considered options

- **The OpenTelemetry SDK for JavaScript.** Automatic instrumentation and the common API. Rejected: experimental logs packages (item 18), exporters with their own queues instead of the bounded buffer of OBS-E-1, and one more dependency tree under the supply-chain rules.
- **The SDK for metrics and spans, own code for logs.** Fewer lines to maintain. Not chosen: it keeps two export paths with two buffers, which the single bounded buffer of OBS-E-1 does not allow without a wrapper.
