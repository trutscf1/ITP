---
name: gam-explore
description: Exploration commands of the gam-engineering process — triage raw incoming issues and external MRs into ready bug fixes or inbox requests (triage), chart an effort too big and foggy for one session as a map of decision tickets and work its next ticket (wayfind), sweep the code for shallow modules and drift between documents and code with an HTML report (sweep, manifest Phase 8), and look back at a coding session to propose changes to the agent's environment — checks, pointers, steering files (retro). Also structure and prioritize the inbox (inbox). Use when /gam-engineering routes here, or when the developer runs /gam-explore triage, inbox, wayfind, sweep, or retro.
---

# gam-explore

The exploration commands of [gam-engineering](../gam-engineering/SKILL.md): work that arrives from outside the concept process or prepares it. Before the first step, apply the shared rules of the core once per session — skip what already ran when the core routed here — [Before anything else](../gam-engineering/SKILL.md#before-anything-else), [Asking the developer](../gam-engineering/SKILL.md#asking-the-developer), [The contract](../gam-engineering/SKILL.md#the-contract), and [Built-in procedures](../gam-engineering/SKILL.md#built-in-procedures); this skill adds only its own procedures. The model line and the delegation of [Models](../gam-engineering/references/models.md) apply to every command, also when the core routed here: print the start line first, and send each step the command's row names to a subagent of its tier instead of running it in the session. Outward-facing posts follow override 6 of [gam-delivery](../gam-delivery/SKILL.md#overrides-for-the-delivery-skills): show them and confirm them as a `Q<n>` first.

| Invocation | Procedure |
| --- | --- |
| `triage [<issue>]` | [references/triage.md](references/triage.md): bugs become ready fix issues, requests go to the inbox |
| `inbox [<kurzname>]` | [references/inbox.md](references/inbox.md): summarizes, structures, and prioritizes the inbox; changes no entry's meaning. With a short name, starts that entry |
| `wayfind <effort \| map>` (alias `wayfinder`, same procedure) | [references/wayfind.md](references/wayfind.md): plans, never builds |
| `sweep [<area>]` | [references/sweep.md](references/sweep.md): reports, never changes code by itself |
| `retro [<session>]` | [references/retro.md](references/retro.md): proposes environment changes, applies only confirmed ones |
