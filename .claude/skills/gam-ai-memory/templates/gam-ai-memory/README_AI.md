---
doc: map
format: gam-ai-memory/1
title: Map of the AI memory
audience: [developer, agent]
---
# Map of the AI memory

Which file answers which question. Rules for agents: [CLAUDE.md](CLAUDE.md).

## The running work (this folder)

| Question | File |
| --- | --- |
| What did the last agent leave for me? | [AI_HANDOVER.md](AI_HANDOVER.md) |
| What is being worked on right now, and what is next? | [CURRENT_TASK.md](CURRENT_TASK.md) |
| Where does the project stand overall? | [PROJECT_STATE.md](PROJECT_STATE.md) |
| What happened in earlier sessions? | [SESSION_LOG.md](SESSION_LOG.md) |
| What is known to be broken? | [KNOWN_ISSUES.md](KNOWN_ISSUES.md) |
| How do I start, hand over, or review? | [prompts/](prompts/) |
| Earlier review and check results | [reports/](reports/) |

## The long-term knowledge (`gam-ai-knowledge/`)

| Question | File |
| --- | --- |
| What is the project for? | [GOAL.md](../gam-ai-knowledge/GOAL.md) |
| Which features come next, and where does each stand? | [ROADMAP.md](../gam-ai-knowledge/ROADMAP.md), [ROADMAP-DETAILS.md](../gam-ai-knowledge/ROADMAP-DETAILS.md) |
| What small tasks and ideas are waiting? | [next.md](../gam-ai-knowledge/next.md) |
| What was decided, and why? | [adr/](../gam-ai-knowledge/adr/) |
| What does a term mean? | [CONTEXT.md](../gam-ai-knowledge/CONTEXT.md) |
| How is the system built, and how do I run it? | [STACK.md](../gam-ai-knowledge/STACK.md) |
| How is it tested, deployed, and secured? | [TEST_STRATEGY.md](../gam-ai-knowledge/TEST_STRATEGY.md), [DEPLOYMENT.md](../gam-ai-knowledge/DEPLOYMENT.md), [SECURITY.md](../gam-ai-knowledge/SECURITY.md) |

[Delete the rows whose file the project does not have yet. Without a knowledge folder, replace this section with one line: no knowledge folder yet, create it with `/gam-ai-knowledge init`.]
