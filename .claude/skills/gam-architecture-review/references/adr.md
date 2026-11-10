# ADR generation

Loaded by `architecture adr`. It writes ADRs for decisions the code already embodies.

1. **Find candidates.** From the review report or the code: a framework or library choice, a layer rule, a data store, an auth approach, a deviation from a `P-` rule. Skip what an ADR in `gam-ai-knowledge/adr/` already records.
2. **Confirm.** Ask one `Q<n>` pop-up (multiSelect) listing the candidates; the developer picks which become ADRs, since the reason behind a decision is the developer's to state.
3. **Write.** One file per ADR, `gam-ai-knowledge/adr/NNNN-<slug>.md` with the next free number, from the [ADR template](../../gam-ai-knowledge/templates/adr.md), status `proposed`, with *In plain words*, *Context*, *Decision*, and *Consequences*. Where the code shows the decision but not the reason, the reason is a question to the developer, never invented.
4. **Check.** Run `node gam-ai-knowledge/tools/doc-check.mjs`; it must report no new finding.
