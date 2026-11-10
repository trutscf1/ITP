# Review

Agent-neutral reviews, so a review by Codex reads the same as one by Claude Code. The prompts live in the project's `gam-ai-memory/prompts/`; any agent can run them by hand.

## Steps

1. **Pick the kind and scope.** `code` (default: the diff of the current branch against its base) or `architecture` (default: the whole repo). Ask only if neither the argument nor the branch makes the scope clear.
2. **Load the prompt** `gam-ai-memory/prompts/code_review.md` or `gam-ai-memory/prompts/architecture_review.md` and the documents it names.
3. **Review.** Every finding names file and line (or component), what is wrong, why it matters, and a concrete fix; rank by severity: blocker, major, minor, note.
4. **Write the report** to `gam-ai-memory/reports/YYYY-MM-DD-<kind>-review.md`.
5. **Carry forward.** Accepted findings become `KNOWN_ISSUES.md` entries or inbox entries in the knowledge folder (`next.md`); a structural decision becomes an ADR there. Change no code unless the developer asks.

## In a gam-engineering project

An MR is reviewed with `/gam-engineering review <MR>` — against its acceptance criteria and the Definition of Done. This review is for branches without an MR, for other agents, and for architecture reviews outside a sweep; it does not replace the gam review.
