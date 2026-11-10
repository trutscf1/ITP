---
doc: prompt
format: gam-ai-memory/1
title: Architecture review prompt
audience: [agent, developer]
---
# Architecture review prompt

Paste this into any agent to review the architecture (Claude Code with the skill: `/gam-ai-memory review architecture`). In a gam-engineering project, drift between documents and code is also covered by `/gam-engineering sweep`.

```text
Review the architecture of [scope: the whole repo | a component or path].
Read first: gam-ai-memory/CLAUDE.md, and from the knowledge folder, where they exist, gam-ai-knowledge/STACK.md, the ADRs in gam-ai-knowledge/adr/, SECURITY.md, DEPLOYMENT.md, ROADMAP.md.
Check: does the code match STACK.md and the ADRs; module boundaries and dependencies (cycles, leaks, shallow modules); data flow and ownership; error handling and observability; security boundaries; scalability and performance risks for the features in ROADMAP.md; testability; operational fit with DEPLOYMENT.md.
For each finding give: severity (blocker, major, minor, note), component or path, what is wrong, why it matters, a concrete recommendation, and whether it needs an ADR.
Write the report to gam-ai-memory/reports/YYYY-MM-DD-architecture-review.md with a short summary and a component diagram if useful. Do not change code.
```
