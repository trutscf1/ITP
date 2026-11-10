---
doc: prompt
format: gam-ai-memory/1
title: Code review prompt
audience: [agent, developer]
---
# Code review prompt

Paste this into any agent to review code (Claude Code with the skill: `/gam-ai-memory review code`). In a gam-engineering project an MR is reviewed with `/gam-engineering review <MR>` instead.

```text
Review the code changes of [scope: the current branch against its base | a path | a commit range].
Read first: gam-ai-memory/CLAUDE.md, gam-ai-memory/KNOWN_ISSUES.md, the task in gam-ai-memory/CURRENT_TASK.md, and from the knowledge folder, where they exist, gam-ai-knowledge/STACK.md, TEST_STRATEGY.md, SECURITY.md, CONTEXT.md.
Check: correctness and edge cases; the task's acceptance criteria; tests for new behavior; security (input, auth, secrets, dependencies); fit with STACK.md and the ADRs in gam-ai-knowledge/adr/; naming per CONTEXT.md; readability and needless complexity; documentation updated with the code.
For each finding give: severity (blocker, major, minor, note), file and line, what is wrong, why it matters, a concrete fix.
Write the report to gam-ai-memory/reports/YYYY-MM-DD-code-review.md, newest findings ranked by severity, with a one-paragraph verdict at the top. Do not change code.
```
