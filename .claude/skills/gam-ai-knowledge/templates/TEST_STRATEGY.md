---
doc: test-strategy
format: gam-ai-knowledge/1
title: Test strategy
audience: [developer, reviewer, agent]
---
# Test strategy

What is tested how, and when a change counts as tested. The Definition of Done in `WORKFLOW.md` decides when a change is done; this file only describes the tests.

## Levels

| Level | Tool | Location | Command | Goal |
| --- | --- | --- | --- | --- |
| Unit | [tool] | [path] | [command] | [coverage goal or —] |
| Integration | [tool] | [path] | [command] | [—] |
| End-to-end | [tool] | [path] | [command] | [central user flows] |

## Rules

- [e.g. New behavior is written test-first; a bug fix starts with a failing test]
- [e.g. Tests run in the pipeline on every merge]

## Not tested automatically

- [Area and why — and how it is checked instead]
