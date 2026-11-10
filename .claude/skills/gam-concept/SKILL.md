---
name: gam-concept
description: Concept work of the gam-engineering process — grill a feature or idea into a goal-traced concept document with user stories, acceptance criteria, and requirements; pull a planned ROADMAP feature forward (do); run the consistency check over goal, derivation chain, and status (check). Use when /gam-engineering routes here, or when the developer runs /gam-concept <feature>, /gam-concept do <feature>, or /gam-concept check in a repo that has gam-ai-knowledge/GOAL.md.
---

# gam-concept

The concept commands of [gam-engineering](../gam-engineering/SKILL.md): `<feature>` (grill), `do <feature>`, and `check`, manifest Phases 1–6. Before the first step, apply the shared rules of the core once per session — skip what already ran when the core routed here — [Before anything else](../gam-engineering/SKILL.md#before-anything-else), [Asking the developer](../gam-engineering/SKILL.md#asking-the-developer), and [The contract](../gam-engineering/SKILL.md#the-contract); this skill adds only its own procedures. The model line and the delegation of [Models](../gam-engineering/references/models.md) apply to every command, also when the core routed here: print the start line first, and send each step the command's row names to a subagent of its tier instead of running it in the session.

| Invocation | Procedure |
| --- | --- |
| `<feature or idea>` | [Grill](#grill), below |
| `do <feature>` | [references/do.md](references/do.md) |
| `check` | [Check](#check), below |

## Grill

Under flow `quick` (`env.GAM_ENGINEERING_FLOW`, P-FLOW-1) the grill ends in a plan in `gam-ai-memory/plans/`, not in a concept document: follow [Quick mode: Plan flow](../gam-engineering/references/quick.md#plan-flow).

`/gam-engineering <feature or idea>` runs the grill flow, in this order:

1. Read PROFILE.md (the repo copy in team mode) and `gam-ai-knowledge/GOAL.md`; in team mode also read `CLAUDE.local.md` for the developer handle and that developer's STATUS.md.
2. State the applied standing decisions by ID in one line, plus the goal `G-1` the feature must serve, and ask for deviations.
3. Check the feature against the goal first: which part of `G-1` it serves, and that it violates no non-goal. If it fails, stop and resolve that before any detail question (P-GOAL-3).
4. Call the Skill tool twice, for `gam-v-grilling` and `gam-v-domain-modeling`, and run the interview under the manifest's Phase 1 rules **and the overrides below**, which take precedence over both skills. Every question follows [Asking the developer](../gam-engineering/SKILL.md#asking-the-developer).
5. **Personal data.** As soon as a story stores, shows, or sends data about a person, call the Skill tool with `gam-v-privacy-by-design` and derive `NF` requirements from it: which data the story really needs, how long it is kept, how it is deleted, and which rights the person has. Each one names the `AC` or `US` it derives from (P-GOAL-2). The agent does not decide legal questions (lawful basis, consent, processing agreements): it records them as open questions in the concept and refers them to the organisation's data-protection contact (at a school, the school management).
6. **User interface.** When the first story of the project gets a screen, derive the theme and font-size requirements of P-DES-9 into this concept as `U` and `NF` requirements, unless an earlier concept already holds them; later concepts link those IDs instead of restating them. A project that drops a part records it as a deviation (contract point 4).
7. Write the results top-down: feature goal (concept §1), then the user stories — each one drafted first and passed through the [INVEST check](references/invest.md) (P-QB-3), its findings asked as `Q<n>` (independence decided by the agent) before the files are written — and acceptance criteria as the epic's work items in `gam-ai-knowledge/work-items/E<nn>-<feature>/` — `epic.md` (the next free epic number, `release` = the ROADMAP Version) and one story file each with `status: backlog`, from [templates/work-items/](../gam-ai-knowledge/templates/work-items/) (P-DOC-6), each story added to `work-items/BACKLOG.md` (P-DOC-8), linked from concept §3 — then the requirements in the concept document, all in the dual-readable form (P-HUM-1/2), plus the Part H summaries (P-HUM-3) once machine-only sections exist.
8. Before the Phase 4 gate, offer an adversarial check as a `Q<n>` (optional; recommended for features with personal data or irreversible effects): call the Skill tool with `gam-v-doubt-driven-development` on the goal trace (§1) and Part H, and fix every confirmed finding in the document before the product manager reads it. The session starts the reviewer, and the cross-model offer is a logged pop-up only for personal data or irreversible effects: [Concept checks](references/concept-checks.md#adversarial-check). The builder check before `tickets` is in the same file.
9. At the phase boundary, run the consistency check for this feature, update the position in ROADMAP-DETAILS (or the developer's STATUS.md) and the *Status* stage in ROADMAP (P-ROAD-4), and continue with the next phase in the same session unless the session rule of [Models](../gam-engineering/references/models.md#session-length) suggests a new one (P-GRILL-3, P-WS-7).

## Overrides for `gam-v-grilling` and `gam-v-domain-modeling`

Both skills are the interview engine; where they differ from this profile, these rules win:

| # | The engine says | Here instead |
| --- | --- | --- |
| 1 | Glossary `GLOSSARY.md` (formerly `CONTEXT.md`) and ADRs `docs/adr/` at the repo root, in the engine's own format | Glossary `gam-ai-knowledge/CONTEXT.md` — the file the engine calls `GLOSSARY.md` — ADRs `gam-ai-knowledge/adr/NNNN-slug.md` (P-DOC-2), created from [templates/CONTEXT.md](../gam-ai-knowledge/templates/CONTEXT.md) and [templates/adr.md](../gam-ai-knowledge/templates/adr.md) so they carry the frontmatter of the [Machine-Readable Contract](../gam-ai-knowledge/templates/concept_authoring_manifest.md#machine-readable-contract). Never create a root `GLOSSARY.md`, `CONTEXT.md`, or `docs/adr/`; the root `CONTEXT-MAP.md` only points to them. |
| 2 | Relentless: visit every branch, assume nothing silently | P-GRILL-4 first: where a reasonable default exists and is cheap to change later, state it in the round as an assumption (`A<n>: …`) instead of asking. A stated assumption counts as a visited branch. |
| 3 | Frontier order follows the topic | The design tree is rooted in the derivation chain: `G-1` → feature goal → user stories → acceptance criteria → requirements. No question is asked while an ancestor in that chain is still open (P-GOAL-3). |
| 4 | Act only after shared understanding is confirmed; questions start at Q1 | Question numbers come from `prompt-export.mjs next-q`; every round is recorded verbatim by the AI chat export — recording is not acting (P-GRILL-2, [Asking the developer](../gam-engineering/SKILL.md#asking-the-developer)). The concept document itself is written only after the confirmation. |
| 5 | Offer an ADR only if hard to reverse, surprising, and a real trade-off | Those criteria apply, plus **mandatory** ADRs for: any change to `GOAL.md`, a project deviation from a `P-…` ID, adopting or migrating to this skill, switching solo → team. |
| 6 | ADR number = highest existing + 1 | Same, but in team mode the number is provisional until merged into `dev` (P-TEAM-5). |
| 7 | Code contradicts a statement → ask which is right | Ask, then record the answer in the documentation first; the code follows in the implementing MR (concept drift, manifest Phase 8). |
| 8 | Question format: number, title, body, recommendation, asked in chat | Every question is a numbered pop-up with the recommended option first; *None of these* is the last option and the free-text *Other* is added by the pop-up ([Asking the developer](../gam-engineering/SKILL.md#asking-the-developer), rules 1–2). |

## Check

`/gam-engineering check` runs the consistency check of the [manifest](../gam-ai-knowledge/templates/concept_authoring_manifest.md#consistency-check) over the whole documentation set, including the status check (step 5), and reports every orphan, contradiction, and stale status.

1. Run `node gam-ai-knowledge/tools/doc-check.mjs` and, under git, `--status` — on the check tier ([Models](../gam-engineering/references/models.md)); the subagent returns the script findings.
2. Judge the semantic steps of the check yourself: contradictions along the derivation chain, Part H against its chapters, and whether the issues of merged stories are closed (with the host's command line from `gam-engineering/agents/issue-tracker.md`).
3. Report the findings as one table *document — row — finding — proposed fix*. Change nothing without confirmation as a `Q<n>`; a confirmed fix ships like any change (P-GIT-2).
