# Sweep procedure (manifest Phase 8)

Loaded by `/gam-engineering sweep [<area>]`. It replaces the generic `/improve-codebase-architecture` skill, which the model cannot invoke; the procedure is adapted from mattpocock/skills (see README, *Credits*). A sweep finds two kinds of entropy: **shallow modules** in the code, and **drift** between the documents and the code. It changes nothing by itself; every finding it acts on re-enters the normal flow.

Call the Skill tool with `gam-v-codebase-design` first and use its terms exactly — module, interface, depth, seam, adapter, leverage, locality — and the glossary's terms for the domain.

## 1. Scope

If the developer named an area, take it. Otherwise read a good stretch of `git log --oneline` and start with the hot spots: the files and areas that keep changing. Deepening pays off where change happens.

## 2. Explore

Read the glossary, the ADRs, and the concept documents for the area, then let a fresh subagent (never a fork, [Models](../../gam-engineering/references/models.md#delegation)) walk the code and note friction:

- Understanding one concept needs many small modules.
- A module is shallow: its interface is almost as complex as its implementation (deletion test: would deleting it concentrate complexity, or only move it?).
- Pure functions were extracted for testing, but the bugs hide in how they are called.
- Modules leak across their seams, or a part is untested or hard to test through its interface.

## 3. Drift sweep

In the same pass, check what only this profile knows:

| Drift | Check |
| --- | --- |
| Goal drift | The consistency check across all concept documents against the current `GOAL.md` |
| Part H drift | Each Part H summary still matches its chapter |
| Concept drift | Code and concept document disagree; repaired in the document first, then the code (P-DOC-1) |
| Stack leaks | Technology names in concept documents; moved to `STACK.md` |

## 4. Report

Write a self-contained HTML file to the system temp directory (`%TEMP%` on Windows), named `gam-engineering-sweep-<timestamp>.html`, never into the repo, and open it. Tailwind and Mermaid may come from a CDN.

- One card per candidate: the modules involved, the problem, the proposed change in plain words, the benefit in terms of locality and leverage, a before/after diagram, and a strength badge — *Strong*, *Worth exploring*, or *Speculative*.
- A candidate that contradicts an ADR is shown only if the friction justifies reopening it, and is marked as such.
- One section listing the drift findings as *document — row — what drifted*.
- A closing *Top recommendation*.

Do not propose interfaces yet. Ask as a `Q<n>` which candidate to pursue.

## 5. Follow-up

- A chosen candidate becomes an idea in the inbox and re-enters at manifest Phase 1 through `/gam-engineering <feature>`, where the new seams are designed with `gam-v-codebase-design`.
- A rejected candidate with a load-bearing reason: offer an ADR so the next sweep does not suggest it again.
- Drift findings: concept and Part H drift become a `concept/…` MR; stack leaks a `chore/…` MR.
- Bugs found along the way follow `/gam-v-diagnosing-bugs`.
- Add a log entry in `ROADMAP-DETAILS.md`.
