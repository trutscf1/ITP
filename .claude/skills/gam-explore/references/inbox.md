# Inbox procedure

Loaded by `/gam-engineering inbox`. It turns the raw lines of the inbox (`next.md`, in team mode the developer's `team/<handle>/next.md`, P-ROAD-3) into a structured, prioritized list. It plans nothing and builds nothing: an entry stays in the inbox until it is handled (P-ROAD-3).

The session runs on the judge tier (`env.GAM_ENGINEERING_MODEL_JUDGE`, default `opus`), because the priority is a judgment; on a weaker session model, one judge subagent does the work ([Models](../../gam-engineering/references/models.md)).

## Steps

1. **Read** the inbox completely and `GOAL.md`, `ROADMAP.md`, and `ROADMAP-DETAILS.md` for the goal, the stages, and what is already planned. Read the inbox again right before writing, so a hand edit is never overwritten (P-ROAD-3).
2. **Structure every entry** under `## Open` (and `## Urgent`, which keeps its place above) as the shape of [next.md](../../gam-ai-knowledge/templates/next.md) shows: a heading `### P<n> — <title>` and a list with *Kurzname*, *Added*, *Priority*, *Summary*, and, where the entry has them, *Decision*, *Cause*, *Details*, *Next step*, *Done*. The **Kurzname** is a short, unique, lowercase, English kebab-case name of at most three words (`ci-lockfile-setup`); a name written by hand stays, and a missing one is set here. Names are unique across the file and are not reused once an entry is handled. The read hook `inbox-names.mjs` adds a derived name to entries that lack one whenever `next.md` is read (P-ROAD-3).
3. **Keep every fact.** Dates, IDs (`Q<n>`, `P-…`, `F-…`), paths, and numbers stay as given. Nothing is deleted, merged away, moved to the roadmap, or decided here; parts already done are kept as *Done*. A figure that is out of date is not replaced silently: the new measurement is named next to the old one.
4. **Propose a priority** per entry, with a one-sentence reason: **P1** high — blocks other work, is a known defect, or the developer has already decided it; **P2** medium — valuable, but open, small in effect, or waiting on research or a precondition; **P3** low — cleanup or nice to have. The priorities are proposals; the developer changes them by hand. An entry the developer marked urgent stays under `## Urgent`.
5. **Sort** by priority, oldest first within a priority, and name in a line above the list that the priorities are proposals.
6. **Check and report.** Run `npx markdownlint-cli2` on the file and `doc-check --status`; report the result as a table of priority, Kurzname, title, date, and reason, and name every figure that was re-measured. The change is committed under the merge policy like any document change (P-GIT-11).

## Start an entry by its name

`/gam-engineering inbox <kurzname>` (for example `/gam-engineering inbox ci-lockfile-setup`) does not structure the inbox. It finds the entry by its Kurzname, shows its text, and asks one pop-up (`Q<n>`) how to start it, with the matching command first and marked `(Empfohlen)`: a planned feature goes to `do <feature>`, a new idea to a grilling (`/gam-engineering <idea>`) — never straight to `wayfind`; the grilling switches to [wayfind](wayfind.md) only when its first breadth-first round shows open decisions that do not fit one session (Q408) — a bug to `triage` and then `implement <issue>`; *Later* leaves the entry where it is. An unknown name is answered with the list of names, not guessed. Starting does not delete the entry: it is removed only when it is handled (P-ROAD-3), by the command that takes it up.

A new entry the developer adds later is structured at the next `inbox` run; the entry shape is optional for a hand-written line, which every command still reads (P-ROAD-3).
