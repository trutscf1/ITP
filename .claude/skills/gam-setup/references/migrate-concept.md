# Migrating one concept document

Loaded by `/gam-engineering migrate <feature>` (skill `gam-setup`): when a legacy concept document (`format: legacy`, P-DOC-5) is next changed, or on request.

One document per MR, on the document's `concept/<feature>` branch (P-GIT-6); without git, in place (P-GIT-7). The user confirms every derived story and acceptance criterion, since they are decisions, not facts.

1. **Renumber** to the current structure. Old §0–§2 keep their numbers; every old section from §3 on moves up by one (old §3 *Functional Requirements* → §4, … old §9 *Worked Examples* → §10, old §15 *Architecture* → §16, old §16 *Test Concept* → §17). Update every `§` reference to this document inside `gam-engineering/documentation/` in the same MR; closed issues and old commits are not rewritten.
2. **§1:** add the feature goal (at most 200 characters) and *Serves*, matching the ROADMAP entry.
3. **Work items:** propose user stories by grouping the existing `F`/`U` requirements by the user outcome they serve; propose acceptance criteria from the worked examples (§10) first, and from requirements only where no example exists. Write them as the feature's work items (P-DOC-6) and let §3 link them. Existing requirement IDs are never renumbered; stories and criteria get new IDs. A concept already in the current format whose stories still stand in §3 (`doc-check` warning `WI`) only moves its rows into the work-item tree, IDs and wording unchanged.
4. **Derives from + titles:** add the *Derives from* and *Title* columns to §4–§9. A requirement that fits no story is reported — either a story is missing or the requirement is obsolete; the user decides.
5. **§17:** mark the existing integration tests that execute an acceptance criterion with its `AC` ID; add acceptance tests for criteria without one.
6. **Part H:** write H1–H7.
7. Set `format: gam-engineering/2` and add `serves` in the frontmatter, run `/gam-engineering check` for this document, and record the result in the MR.
8. **Open issues** of this feature: add the story reference and the acceptance criteria to their description, create the epic issue and link the story issues as its children, and write the issue numbers into the work items (P-TRK-2). Closed issues stay as they are.
