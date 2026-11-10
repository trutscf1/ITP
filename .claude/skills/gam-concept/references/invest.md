# INVEST check

Loaded by [Grill](../SKILL.md#grill), step 7 (skill `gam-concept`), whenever the grill flow drafts a new user story or changes one. It applies P-QB-3: every story passes the six tests below before requirements are derived from it. The agent judges the tests itself; `doc-check.mjs` does not run them.

## When

Run the check on the drafted stories, before their files are written. Under override 4 of [gam-concept](../SKILL.md#overrides-for-gam-v-grilling-and-gam-v-domain-modeling) the documents are written only after confirmation, so a fix still costs nothing. Check every story of the draft, and also its relation to the stories that already exist in the epic. The check is done when every drafted story either has its no-findings assumption line or has had all its findings answered and its fixes checked again.

## The six tests

| Letter | The story passes when | A finding is | The fix the agent recommends |
| --- | --- | --- | --- |
| **I** Independent | it delivers its *so that* without another story of this or another epic being built first | the story only creates value together with another story, or must wait for one | decided by the agent, not asked (see below) |
| **N** Negotiable | *I want* names a capability the user gets, not a solution | a widget, screen layout, library, algorithm, or data structure in *I want* (manifest Phase 1: requirements first, solutions later) | reword to the capability; the solution becomes a question for Phase 5 or `STACK.md` |
| **V** Valuable | *so that* names a benefit for a role from `GOAL.md` that serves the feature goal (P-GOAL-2) | a purely technical story (*as a developer I want a table …*), a role not in `GOAL.md`, or a benefit that repeats *I want* | name the user benefit, or fold the technical work into the story that needs it |
| **E** Estimable | the agent can propose a weight on the scale 1, 2, 3, 5, 8 (P-TRK-3) now | an unknown that blocks the estimate (unclear scope, an external system nobody has described) | ask the unknown itself; if it needs research or a runnable answer, hand it to `/gam-v-research` or `/gam-v-prototype` (manifest Phase 2) |
| **S** Small | the proposed weight is at most 8 | a proposed weight above 8, or a story that bundles several user outcomes | split along the outcomes, each split story checked again |
| **T** Testable | every acceptance criterion is *Given / When / Then* with concrete values and an observable outcome (P-HUM-1, P-QB-2) | a vague word without a number (*fast*, *simple*, *user-friendly*), an outcome nobody can observe, or a story without an acceptance criterion | rewrite the criterion with values, or add the missing one |

The proposed weight goes into the story file's *Weight* line; `tickets` may still change it.

## Independence: the agent decides

Some stories cannot be independent: a story that edits something needs the story that creates it. The agent resolves an I finding itself, in this order, and states the result as an assumption `A<n>` in the round:

1. **Re-cut** the stories along the user outcome when that keeps every story's *so that*, priority, and release unchanged.
2. **Merge** them when the merged story still passes S (weight ≤ 8) and keeps both priorities equal.
3. Otherwise **keep the dependency**: the story file gets `- **Depends on:** <DOC>-US-<n> — <reason>, A<n>` ([template](../../gam-ai-knowledge/templates/work-items/story.md)), and `tickets` turns it into a *Blocked by* edge.

A pop-up is asked only where the agent's decision would change what the developer planned: the dependency is circular, a story depends on one with a lower priority (a *Must* on a *Could*) or a later release, or the only fix changes a story's *so that*. A story without a dependency keeps `- **Depends on:** —`.

## Asking

Findings follow [Asking the developer](../../gam-engineering/SKILL.md#asking-the-developer) and are recorded by the AI chat export (`docs/prompts/`, P-GRILL-2):

1. **One `Q<n>` per N, V, E, S, or T finding**, and per I finding only in the cases named above, in the next grill round together with the other open questions of the frontier. Question text: `Q<n> - INVEST <letter>: <story ID> <title> — <finding>. <question>?`
2. **Options:** the recommended fix from the table first, marked recommended; an alternative fix where one exists; **Keep as is** (for I: **Keep the dependency**). For N, V, E, S, and T the developer decides; the agent never waives one of these tests on its own.
3. **No findings, no question** (P-GRILL-4): a story that passes all six tests gets one assumption line in the round, `A<n>: INVEST checked for <story IDs>, no findings`; an I finding the agent decided gets its own `A<n>` naming the decision.
4. **After the answers**, apply the fixes and check the changed or split stories again; a second finding on the same story is a new `Q<n>`. Only a kept dependency is written into the story file; keeping another finding is recorded only in the log. If the developer rejects an `A<n>` on independence, it becomes a `Q<n>` of the next round.
