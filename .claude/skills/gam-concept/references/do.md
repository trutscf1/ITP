# Do

Loaded by `/gam-engineering do <feature>` (skill `gam-concept`). It pulls a feature that is already planned in `ROADMAP.md` forward and starts its concept in the same session:

1. Find the feature's row in `ROADMAP.md` by name or slug. No match → stop and suggest `/gam-engineering <feature>` for a new idea; several matches → one `Q<n>`. A row already at stage `concept` or later → continue with [Grill](../SKILL.md#grill) or the position's next step, without renumbering.
2. Move the row to the next version after the last row that is `in progress`, `in dev`, or `released`, and shift every later planned row by one version (P-VER-1). If the move would put the feature ahead of a row in its *Depends on* column, ask one `Q<n>` instead of moving. Append the change to the table's numbering-history note and update every other place in `gam-ai-knowledge/` that names a shifted version, except dated log entries, which stay as written.
3. Status in the same step (P-ROAD-4): stage `concept`, a new position row in `ROADMAP-DETAILS.md` (or the developer's `STATUS.md`), and a log entry naming the old and new version.
4. Continue with [Grill](../SKILL.md#grill) for this feature. The ROADMAP feature note is input to concept §1 and the draft slices; the answered `Q<n>` of pre-concept planning — in the chat export or an archived `concepts/<feature>.qa-log.md` — are not asked again, and numbering continues from `prompt-export.mjs next-q`.
