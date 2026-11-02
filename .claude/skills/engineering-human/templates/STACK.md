---
doc: stack
format: engineering-human/2
title: Stack document
audience: [developer, agent]
---
# Stack Document

The single place where technology lives, for developers and agents turning the stack-neutral concept documents into code (P-DES-4). Rebuilding the project on a different stack means rewriting this file only. It names technology freely but holds no requirement, business rule, or behavior — those belong in a concept document.

## 0. In Plain Words

[3–5 sentences for non-specialists: what the system is built with and why.]

## 1. Runtime & Language

| Part | Language and version | Runtime | Package manager |
| --- | --- | --- | --- |
| [backend / frontend / …] | [language, version] | [runtime, version] | [tool] |

## 2. Capability Mapping

Every `C-x` from the concept documents appears here exactly once; a `C-x` without a row blocks synthesis, a row without a `C-x` is dead weight.

| ID | Capability (title) | Technology | Version constraint | Notes and limits |
| --- | --- | --- | --- | --- |
| [DOC]-C-[n] | [title from the concept document] | [library, service, or product] | [e.g. `^4.2`] | [limits that matter] |

## 3. Type Mapping

| Neutral type | Concrete type | Notes |
| --- | --- | --- |
| [e.g. Text, Integer, Timestamp, Id] | [stack type] | [precision, encoding, time zone] |

## 4. Module Mapping Conventions

[How a concept "module" materializes: files, classes, packages, naming, directory layout.]

## 5. Error Mapping Conventions

[How `E-x` conditions materialize: exceptions, result types, status codes, error payload shape.]

## 6. Test Framework Mapping

[How the test tables of §17 become executable tests: runner, layout, naming that carries the `AC` and requirement IDs, mocking at capability boundaries.]

## 7. Configuration & Secrets

[How neutral configuration parameters materialize (P-DES-6), naming, where secrets come from and how they stay out of the repo.]

## 8. Build, Run, Deploy

```bash
[exact commands: install, run locally, test, lint, build, deploy]
```

[CI pipeline in plain words: stages and what blocks a merge.]

## 9. Stack ADRs

| Decision | Capabilities | Reason |
| --- | --- | --- |
| [why this stack, or why this technology for a capability] | [`C-x` IDs with titles, or — for the whole stack] | [one or two sentences] |
