# Concept checks

Two fresh-context checks of a concept, each at its own gate: the **adversarial check** before the Phase 4 gate and the **builder check** before `tickets`. They have different artifacts and prompts, so they do not double each other; the rules below apply to both. Under flow `quick` there is no concept, so neither runs.

## Shared rules

1. **The session starts the reviewer.** The reviewer is a fresh subagent started with the Agent tool, never a fork ([Delegation](../../gam-engineering/references/models.md#delegation)). A judge subagent (P-WS-7) only drafts the `Q<n>` that offers the check; it cannot start a reviewer itself.
2. **The brief holds the artifact and the contract, nothing else.** Paths of the documents and the contract text (P-QB-1 or the Phase 4 gate), never the author's summary, conclusion, or an opinion on the result.
3. **Findings are sorted the same way.** A point the documents already answer is dropped with a pointer to the answer; a minor point becomes a stated assumption `A<n>`; every other point is a documentation defect and goes to the developer as a `Q<n>` (Phase 7 rule). A confirmed defect is fixed in the document before the next step.
4. **Both checks are logged.** The offer, the answer, the reviewer's tier, and the sorted findings are recorded by the AI chat export (`docs/prompts/`, P-GRILL-2), and the findings go into the concept's §13.

## Adversarial check

Offered as a `Q<n>` before the Phase 4 gate (optional; recommended for personal data or irreversible effects). After a yes, call the Skill tool with `gam-v-doubt-driven-development` on the goal trace (§1) and Part H, and fix every confirmed finding before the product manager reads the document. At most three doubt cycles ([Delegation](../../gam-engineering/references/models.md#delegation), loop caps); a point still open after the third goes to the developer as a `Q<n>`.

- **Cross-model offer.** The skill asks whether a second model should review. Here it is a pop-up logged per shared rule 4, asked only when the feature handles personal data or has irreversible effects, with *Skip* recommended; for every other feature the check runs on a single model and the log says so as an assumption `A<n>` ("cross-model review skipped").
- **No chat questions.** Where the skill would ask in chat, the question becomes a pop-up ([Asking the developer](../../gam-engineering/SKILL.md#asking-the-developer)).

## Builder check

Run by the `tickets` gate ([Gate](../../gam-delivery/references/tickets.md#gate)) once per state of the documentation set: it holds if the log shows a run after the last change to the concept, `STACK.md`, or a story file of the feature. It tests the quality bar of P-QB-1 directly.

1. Start one reviewer on the **check tier**, a modest model with no memory of the project. The artifact is the concept document, its story files, `STACK.md`, and `gam-ai-knowledge/CONTEXT.md`; the contract is P-QB-1.
2. The prompt: *Plan the implementation of every slice of §16 from these documents alone. Return, per slice, every question you would have to ask and every place you would have to guess. Give no verdict and no praise; if you find none, say so after naming what you checked.*
3. Sort the findings by shared rule 3 and fix the documents. After fixes, run once more on the changed documents; two runs are the cap, and a point still open goes to the developer as a `Q<n>`.
4. The documentation set passes when the last run returns no point that shared rule 3 sorts as a `Q<n>`.
