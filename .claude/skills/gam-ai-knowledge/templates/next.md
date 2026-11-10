---
doc: inbox
format: gam-ai-knowledge/1
title: Inbox
audience: [developer, agent]
handle: "[handle]"   # team mode only; delete in solo mode
---
# Inbox

New tasks and ideas land here first, before anyone plans them (P-ROAD-3). In team mode this file exists once per developer at `team/<handle>/next.md`; work nobody has claimed yet goes to the issue tracker instead.

Anyone may add a line by hand at any time. Entries under *Urgent* are handled before the planned next step. Processing an entry means, in one working step: add a dated row with its text to the log in [ROADMAP-DETAILS.md](ROADMAP-DETAILS.md), if it is a planned feature add it to [ROADMAP.md](ROADMAP.md), and delete it here.

## Urgent

## Open

A hand-written line is enough: `- [YYYY-MM-DD] [The task or idea in one or two plain sentences, as it was given]`. `/gam-engineering inbox` structures the lines like this, sorted by priority (P1 high, P2 medium, P3 low; the priorities are proposals, not decisions):

### P2 — [Title]

- **Kurzname:** [short-kebab-name]
- **Added:** [YYYY-MM-DD]
- **Priority:** P2 — [one sentence why]
- **Summary:** [the task in one or two sentences, every ID and path kept]
- **Next step:** [the first action]
