# Wayfinding procedure

Loaded by `/engineering-human wayfind <effort | map>`. It replaces the generic `/wayfinder` skill, which the model cannot invoke; the procedure is adapted from mattpocock/skills (see README, *Credits*). Use it when an effort is too big and too foggy for one session (manifest Phase 1). Wayfinding **plans, it does not build**: its destination is a decision or a concept document ready for Phase 4, never code.

## The map

One issue labelled `wayfinder:map` on the tracker (commands in `docs/agents/issue-tracker.md`). It is an index, not a store: each decision lives in exactly one ticket, and the map only gives its gist and link. Refer to tickets by their title, never by a bare number.

```markdown
## Destination

[What reaching the end looks like — e.g. "concept document concepts/export.md ready for the Phase 4 gate". One or two lines.]

## Serves

[The part of G-1 this effort advances (P-GOAL-3).]

## Notes

[Skills every session should use; standing preferences for this effort.]

## Decisions so far

- [Ticket title](link): one-line gist of the answer

## Not yet specified

[Questions you can see coming but cannot yet state sharply.]

## Out of scope

- [Ticket title](link): why it lies beyond the destination
```

## Tickets

Each ticket is a child issue of the map whose body is one question, sized for one session, with one label:

| Label | Mode | Resolved by |
| --- | --- | --- |
| `wayfinder:research` | agent alone | a subagent that calls the Skill tool with `research` |
| `wayfinder:prototype` | with a person | the Skill tool with `prototype`; the prototype is linked, not pasted |
| `wayfinder:grilling` | with a person | the grill flow of SKILL.md (rounds of `Q<n>`, logged); the agent never answers its own questions |
| `wayfinder:task` | either | manual work that unblocks a decision; the answer records what was done and the resulting facts |

A ticket is **claimed** by assigning it before any work. It is **unblocked** when every blocking ticket is closed. The **frontier** is every open, unblocked, unclaimed ticket.

A ticket is created only when its question can be stated sharply, even if it cannot be answered yet. Anything vaguer stays under *Not yet specified*.

## Chart the map (input: a loose idea)

1. Check the idea against `G-1` and the non-goals first (P-GOAL-3); if it serves no part of the goal, stop.
2. Fix the destination with a short grilling round.
3. Grill breadth-first for the open decisions. If no fog appears, the effort fits one session: stop and continue with `/engineering-human <feature>` instead.
4. Create the map, then the tickets you can state now, then wire the blocking edges in a second pass.
5. Start one research subagent per `research` ticket. Then stop: charting is one session's work.

## Work through the map (input: the map)

At most one ticket per session, except research tickets.

1. Load the map, not every ticket body.
2. Take the ticket the developer named, or the first frontier ticket; claim it.
3. Resolve it; open related tickets only as needed.
4. Post the answer, close the ticket, and add the gist to *Decisions so far*. A ticket found to lie beyond the destination is closed and listed under *Out of scope*.
5. Turn fog that became specifiable into new tickets.

When no ticket and no fog remain, the destination is reached: write or update the concept document from the decisions and continue at manifest Phase 2 or Phase 4. Add a log entry in `ROADMAP-DETAILS.md` at each session end (P-ROAD-4).
