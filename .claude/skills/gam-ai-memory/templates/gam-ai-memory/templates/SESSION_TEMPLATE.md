---
doc: template
format: gam-ai-memory/1
title: Session log entry
audience: [agent]
---
# Session log entry

Copy the block below to the top of the *Entries* section of [SESSION_LOG.md](../SESSION_LOG.md) and fill it. Keep it short: the details are in the commits and in the handover. One entry per session: the first sync of a session inserts it with its *Merges* line and `open` in *Handover*, every further sync adds one line to *Merges*, and the handover of the same session completes it (fills the other fields, sets *Handover* to `done`). Until then the fields a handover fills stay `—`.

```markdown
### [YYYY-MM-DD] — [agent and model] — [task in a few words]

- **Branch:** [branch], commits [first..last hash or "none"]
- **Merges:**
  - [branch] — [one sentence] — [link to the log row in ROADMAP-DETAILS.md]
- **Done:** [one to three bullets' worth, comma-separated]
- **Decided:** [the developer's decisions from pop-ups and approved plans, ADR links, or "nothing"]
- **Found:** [new KNOWN_ISSUES or inbox entries or "nothing"]
- **Next:** [the next step from the handover]
- **Handover:** [open — sync only | done by <agent and model>]
- **Transcript:** [path of the exported day file under docs/prompts/, or the session ID, or "none"; add "recovered by <agent and model>" if written by a later session]
```
