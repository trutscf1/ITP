---
name: gam-profile
description: Profile rules of the gam- process skills (PROFILE.md) — record a project deviation from a P- ID, append a durable answer to PROFILE.md, write or change a profile entry, and keep each fact in one home. Use when /gam-engineering routes `profile`, `profile deviation`, or `profile append` here, when a grilling answers a P- ID differently for this project, when it yields a decision an unrelated future project would answer the same way, or when a PROFILE.md entry is edited or deleted.
---

# gam-profile

The profile commands of [gam-engineering](../gam-engineering/SKILL.md): how a project departs from the standing decisions of [PROFILE.md](../gam-engineering/PROFILE.md), how a new durable answer enters the profile, and how an entry is written and changed. The profile file itself stays in the core, which every skill reads.

Before the first step, apply the shared rules of the core once per session — skip what already ran when the core routed here — [Before anything else](../gam-engineering/SKILL.md#before-anything-else), [Asking the developer](../gam-engineering/SKILL.md#asking-the-developer), and [The contract](../gam-engineering/SKILL.md#the-contract). The model line and the delegation of [Models](../gam-engineering/references/models.md) apply to every command, also when the core routed here: print the start line first.

| Invocation | Procedure |
| --- | --- |
| `profile` | Show the parts of PROFILE.md and the highest ID per prefix; change nothing |
| `profile deviation <ID>` | Record a project deviation from `<ID>` as described under [Deviations](#deviations) |
| `profile append` | Append a durable answer to PROFILE.md after the test and the `Q<n>` confirmation of [Appending durable answers](#appending-durable-answers) |

## Stating applied decisions

Before a grilling, state the applied decisions by ID, for example: *"Applying your standing decisions: P-GIT-1/2/3/9 (main+dev or trunk flow), P-VER-1 (SemVer), P-ROAD-1…4 (roadmap files, status discipline), P-MR-4…6 (merge policy from `.claude/settings.json`). Deviations for this project?"* — one confirmation line, not a re-interview.

## Deviations

Projects may deviate. A deviation is recorded in the *project* (as an ADR or in the project's WORKFLOW.md) referencing the overridden ID ("overrides P-GIT-3: squash merges allowed here because …"). PROFILE.md itself is never edited to fit one project.

## Appending durable answers

New durable answers get appended. When a grilling produces a decision that would be answered the same way in the next project, append it to PROFILE.md with the next free ID and the date. The test: *"Would this answer be identical for an unrelated future project?"* Yes → profile. No → project docs (CONTEXT.md, ADR, WORKFLOW.md). Never both. In a team repo, a profile change is an MR against the repo copy (P-TEAM-1). If the new entry adds or changes a setting, default, or behavior, update README.md in the same change (the skill repo's `CLAUDE.md`, *Maintenance*).

`profile append` states the candidate entry and the test result as an assumption, then asks the developer to confirm it as a `Q<n>`; only a confirmed entry is written.

## No duplication

Single source of truth:

- *General* decisions live **once** in PROFILE.md; project docs **bind** them by reference, never copy the text.
- *Process mechanics* (how to grill, how to TDD, how to cut tickets) live in the respective skills — the profile records only the user's *choices*, not the procedures.
- *Project-specific* facts never enter the profile.
- A human summary (P-HUM-3) is a *view* on the normative text, never a second source: it adds no rule and cites the IDs it summarizes.
- One exception for readability: a template may carry a read-only copy of a *value list* a reader needs to understand the document (e.g. the ROADMAP stages of P-ROAD-1), because in solo mode PROFILE.md is not in the repo. The copy names its source ID and is never extended locally; the consistency check compares it with the source.

## Entry form

- One decision per profile entry: a lead sentence of one or two sentences that states the decision, and — only where the decision has several parts — short sub-bullets, one fact each. An entry that needs more is two decisions and gets a second ID.
- When a standing decision changes globally, edit the entry in place and note the date; projects that pinned the old behavior keep their recorded deviation.
- Delete an entry only when it is wrong everywhere; renumbering is forbidden (IDs are referenced from project ADRs and commits). The only exception is P-TEAM-5: IDs that never reached `dev`.
