---
doc: manifest
format: gam-ai-knowledge/1
title: Concept document authoring manifest
audience: [developer, reviewer, agent]
---
# Concept Document Authoring Manifest

**How this project builds software from concept documents — and why.**

This is the skill-bound edition of the manifest: every phase names the installed skill that executes it. Process mechanics live in those skills; standing personal conventions live in the `engineering-human` skill's `PROFILE.md`; this document owns only what neither covers — the documentation model, the derivation chain from the project goal, the dual human/AI readability rules, the quality bar, the phase gates, and the stack-neutrality rules. Nothing is stated in two places.

---

## Why This Document Exists

The project builds software AI-first. That is not a slogan — it is an architectural decision with a concrete consequence:

**The concept documents are the source of truth. The code is a derivative.**

In a traditional software company, documentation describes what was built. Here, documentation prescribes what will be synthesized. The markdown files in `gam-ai-knowledge/` are the specification from which an AI agent can regenerate the complete software stack: modules, interfaces, tests, and deployment configuration.

| Traditional | AI-First Project |
| --- | --- |
| Code is the source of truth | Concept documents are the source of truth |
| Docs describe the code | Docs prescribe the code |
| Tests verify the implementation | Tests verify the synthesis |
| Refactoring = changing code | Refactoring = changing the concept, then re-synthesizing |
| Porting = rewriting the codebase | Porting = replacing the Stack Document, then re-synthesizing |
| Knowledge lives in developers' heads | Knowledge lives in versioned markdown |

If a concept document is incomplete, ambiguous, or wrong, the synthesized code will be too. There is no developer who "knows what was meant." The document must be self-contained.

---

## The Documentation Set

`gam-ai-knowledge/` contains two groups of files.

**Specification documents** — what the system does and what it is built with:

| File | Job | Stack-specific? |
| --- | --- | --- |
| `GOAL.md` | The project goal `G-1` (≤ 200 characters), target users, success signals, non-goals — the root every other document derives from (P-GOAL-1) | No |
| `MANIFEST.md` (this file) | How to write and maintain the other documents | No |
| `CONTEXT.md` | Ubiquitous language: the shared glossary all documents, code, and agents use (format and upkeep: `/domain-modeling` skill, locations per P-DOC-2) | No |
| `adr/NNNN-slug.md` | Architecture decision records: one short decision with its reason each (format: `/domain-modeling`) | No, except stack ADRs, which live in `STACK.md` §9 |
| `concepts/<feature>.md` | One concept document per feature: human part (Part H), user stories, acceptance criteria, requirements, architecture, test concept | **Never** |
| `work-items/<feature>/` | The feature's work items, ordered like the tracker (P-DOC-6): `feature.md` (parent work item, stories in priority order) and one file per user story `<DOC>-US-<n>-<slug>.md` with its acceptance criteria and slices — the single source for stories and acceptance criteria | **Never** |
| `concepts/<feature>.qa-log.md` | Verbatim question/answer transcript of the concept's grilling rounds (P-GRILL-2); its distilled decisions live in the concept's §13 | No |
| `STACK.md` | The single technology-mapping document: languages, frameworks, versions, commands | **Only here** |

**Process documents** — how work flows around the specifications. Their conventions are the engineering profile's standing decisions (IDs in parentheses); the files bind them to this repo:

| File | Job |
| --- | --- |
| `WORKFLOW.md` | Binds manifest artifacts to this repo's git host and tracker: solo/team mode, labels, issue and MR templates, sprints, host tier, issues mirroring the work-item tree, branch/commit/MR/review rules, Definition of Done, release steps, time tracking on/off, pointer to the merge policy in `.claude/settings.json` (P-GIT-1…6, P-DOC-4, P-DOC-6, P-TRK-1…4, P-MR-1…4, P-TIME-1) |
| `ROADMAP.md` | Ordered backlog of pre-concept feature intentions with feasibility, the part of `G-1` each serves, and its lifecycle stage (P-ROAD-1, P-ROAD-4) |
| `ROADMAP-DETAILS.md` | Single status entry point: session positions (solo) or feature → owner → STATUS index (team) + processed-task log (P-ROAD-2, P-TEAM-3) |
| `next.md` | Task inbox (P-ROAD-3); in team mode one per developer under `team/<handle>/` |
| `team/TEAM.md` | Team mode only: members by handle, roles, ownership rules (P-TEAM-1…5) |
| `team/<handle>/STATUS.md` | Team mode only: one developer's session positions (P-TEAM-3) |
| `VERSIONING.md` | SemVer binding for this project (P-VER-1…3) |
| `qa-log.md` | Verbatim transcript of every question round outside concept work — setup, check, triage, delivery (P-GRILL-2) |

Every file in both groups is written for human readers as well (P-HUM-4): it opens with one to three plain sentences saying what it is for and who reads it, and ID tables carry a title column.

Outside `gam-ai-knowledge/`, the root `CONTEXT-MAP.md` only points to `gam-ai-knowledge/CONTEXT.md` and `gam-ai-knowledge/adr/`, so that skills looking at the repo root find them. It holds no content of its own.

The separation inside the specification group is the point:

* **Concept documents** define *what the system does* — behavior, data, logic, interfaces, tests — in stack-neutral terms. They must remain valid unchanged if the project is rebuilt on a different stack.
* **`STACK.md`** defines *what the system is built with* — and how neutral concepts map onto that technology.
* **Synthesis** always consumes both.

> **Portability test**: Delete `STACK.md`, write a new one for a different stack, and hand the documentation set to an agent. If anything else in `gam-ai-knowledge/` must change for the port to work, stack details have leaked into a concept document. Fix the leak.

---

## Skill Bindings — the single-source rules

The installed engineering skills execute the phases. To keep every rule in exactly one place:

| Concern | Single source | Consequence |
| --- | --- | --- |
| Interview mechanics (rounds with the full frontier, each question a numbered `Q<n>` pop-up with options, explore-instead-of-ask) | `/grilling`, always started via `/engineering-human` (P-GRILL-5) | Not restated here — except depth, order, and logging, which the `/engineering-human` overrides fix |
| Glossary format, ADR criteria and format | `/domain-modeling` | Not restated here — except locations, mandatory ADRs, and team numbering, which the `/engineering-human` overrides fix |
| Design vocabulary (module, interface, seam, depth, adapter, leverage, locality) | `/codebase-design` | Architecture chapters use these terms exactly |
| TDD loop rules, what a good test is, seam discipline | `/tdd` | Not restated here |
| Review axes (Standards + Spec) and smell baseline | `/code-review` | Not restated here |
| User stories and acceptance criteria | `work-items/<feature>/` (P-DOC-6) | The concept's §3 links the tree; issues copy the rows verbatim; nothing restates them |
| Ticket cutting (feature issue, one child issue per user story, slices as child issues of the story, wide refactors as expand–contract) | `/engineering-human tickets` (P-WS-6, P-TRK-2, P-TRK-4) | Not restated here |
| Implementation loop, review, answering review threads, merge, release | `/engineering-human implement / review / revise / merge / release` (P-WS-6), which call `/tdd`, `/code-review`, `/receiving-code-review`, and `/pre-release-review` | Not restated here |
| Proof before "done" (every acceptance criterion and Definition of Done item, with fresh evidence) | `/verification-before-completion`, called by `implement` and `merge` | Not restated here |
| Privacy requirements for personal data (minimisation, retention, deletion, rights) | `/privacy-by-design`, called by the `/engineering-human` grill flow | Its results are `NF` requirements in the concept document; legal questions go to the data-protection contact, never decided by the agent |
| Triage of raw incoming issues, wayfinding for foggy efforts, architecture sweeps | `/engineering-human triage / wayfind / sweep` (P-WS-6) | Not restated here |
| Merge policy (`ask` / `approved` / `auto`), release merge, merge guard | `.claude/settings.json` (P-MR-4…6) | `WORKFLOW.md` points to it, never copies the value |
| Tracker commands and domain-doc layout for this repo | `docs/agents/*.md`, written by `/engineering-human setup` | Skills read these, humans edit them |
| Standing conventions (goal, git flow, versioning, roadmap files, tracker, MR and review, time tracking, readability, team mode, working style) | `engineering-human` skill, `PROFILE.md` | This repo's process documents bind them by ID |
| Definition of Done, labels, sprint length, project-specific workflow values | `WORKFLOW.md` | Issues and MRs link it, never copy it |
| What the system does | `concepts/<feature>.md` | Never answered in chat, code comments, or tickets |
| What it is built with | `STACK.md` | Never named in a concept document |
| Current implementation status | `ROADMAP-DETAILS.md` (positions), `ROADMAP.md` (lifecycle stage only) | Other documents link, never copy; both are updated at every merge, phase boundary, and release (P-ROAD-4) |

**Deliberately unused skills, and why:**

* **`/to-spec`** — not used. The concept document *is* the spec; generating a second spec from conversation would create a competing source of truth. `/engineering-human tickets` reads the work-item tree (P-DOC-6) and the slice breakdown (§16) directly.
* **`/to-tickets`, `/implement`, `/triage`, `/wayfinder`, `/improve-codebase-architecture`** — not started directly. `/engineering-human` carries their procedures, adapted to this process (P-WS-6).
* **`/grill-me`** and plain **`/grill-with-docs`** — not used inside a repo. `/engineering-human` runs the same interview, goal-first and profile-aware, and leaves the paper trail (`CONTEXT.md`, ADRs, `.qa-log.md`) this process depends on.

**Situational skills** (outside the phase sequence): `/engineering-human triage` for raw incoming issues and external MRs (never for the story issues `tickets` produced), `/diagnosing-bugs` for hard bugs, `/resolving-merge-conflicts` mid-conflict, `/research` for reading legwork, `/prototype` for runnable design questions, `/wizard` for steps only a human can perform, `/engineering-human wayfind` for efforts too big and foggy for one session (see Phase 1).

---

## The Derivation Chain

Every document and every ID-bearing row descends from the project goal `G-1` in `GOAL.md` (P-GOAL-1…3):

| Level | Lives in | Names its parent via |
| --- | --- | --- |
| Project goal `G-1` | `GOAL.md` | — (root) |
| Roadmap feature | `ROADMAP.md` | *Serves* column: which part of `G-1` |
| Feature goal (≤ 200 characters) | concept §1 | *Serves:* the roadmap entry and `G-1` |
| Feature work item | `work-items/<feature>/feature.md` | `concept:` its concept document (same `id-prefix`) |
| User story `US-n` | `work-items/<feature>/<DOC>-US-<n>-<slug>.md`, listed in `feature.md` | Every story advances the feature goal |
| Acceptance criterion `AC-n.m` | the story's file | Its story (the number `n`, and the file it stands in) |
| Requirement `F` / `U` / `NF` / `C` / `E` | concept §4–§9 | *Derives from* column: one or more `AC` (or `US` / `G-1.Sx` for NF and C) |
| Module | concept §16 | *Traces to:* requirements |
| Test | concept §17 | The requirement and — for acceptance tests — the `AC` it executes |

### Consistency rules

1. **No orphans upward.** Every row names its parent. An item without one is dropped, or it reveals a missing story or feature that is added first.
2. **No contradiction downward.** A child may narrow its parent (add limits, values, cases), never contradict it or any non-goal in `GOAL.md`.
3. **The higher level decides.** If a lower item is right and an ancestor is wrong, change the ancestor first (ADR, same MR), then re-check every descendant of the changed item. Never silently bend the lower item to paper over a wrong ancestor, and never let both stand.
4. **Coverage downward.** Every story has at least one acceptance criterion; every acceptance criterion is covered by at least one requirement and one acceptance test.

### Consistency check

A short pass run at the Phase 1 start (feature vs. goal), the Phase 4 gate, the end of Phase 5, every merge, and every Phase 8 sweep, or on demand via `/engineering-human check`:

1. Run `node gam-ai-knowledge/tools/doc-check.mjs` (see [Machine-Readable Contract](#machine-readable-contract)). It lists every orphan, dangling reference, coverage gap (rule 4, including acceptance criteria without a test in the code, rule `AC-TEST`), malformed or duplicate ID, and contract violation. The CI runs the same script on every MR.
2. Read each row next to its parent and the non-goals; list every contradiction as *child ID — parent ID — conflict in one sentence*. This is the semantic part no script can do.
3. Fix or defer every finding of steps 1 and 2.
4. Record the result in the MR description. The gate passes only with an empty list, or with each entry resolved or explicitly deferred with rationale.
5. **Status check** (P-ROAD-4): compare every position row in `ROADMAP-DETAILS.md` (or the STATUS files) and every *Status* stage in `ROADMAP.md` with the git host — merged MRs, open MRs, closed issues, release tags — and list each stale entry as *document — row — actual state*. `node gam-ai-knowledge/tools/doc-check.mjs --status` does the part git can show (merged stories, release tags, position rows on merged branches); the CI runs it on every MR. Open MRs and closed issues are checked with the host's command line. Step 5 runs at merges, releases, and on demand; the concept gates skip it.

Legacy concept documents (see below) are listed as *not migrated* and skipped in steps 1–3, except that their feature must still serve `G-1` via its ROADMAP entry.

### Legacy documents

A concept document written under the older `engineering-profile` format (no §3 user stories, old section numbers) is a **legacy document** until it is migrated (P-DOC-5). It is marked in its frontmatter, which both git hosts show above the rendered page, so people and the check script see it alike:

```yaml
---
doc: concept
format: legacy   # pre-engineering-human section numbers; migrated on the next change (P-DOC-5, ADR-[number])
title: "[feature name as in ROADMAP.md]"
audience: [product, developer, reviewer, agent]
id-prefix: "[DOC]"
---
```

The next MR that changes the document migrates it completely (`/engineering-human migrate <feature>`) and sets `format: engineering-human/2`. A legacy document's old section numbers stay valid inside that document until then.

---

## Writing for Humans and Machines

The same document is read by product people, developers, reviewers, and synthesis agents. The rule (P-HUM-1…3): **write once in a form both can read; split only where one form cannot serve both.**

### Dual-readable content (written once)

| Artifact | Form | Why both can read it |
| --- | --- | --- |
| User story | *As a* (role from `GOAL.md`) *I want* (capability) *so that* (benefit) | Plain sentence; the fixed skeleton is parseable |
| Acceptance criterion | *Given* (state with values) / *When* (action) / *Then* (observable outcome with values) | Reads as a scenario; executes as a test |
| Requirement | One full sentence with MUST / MUST NOT / MAY and concrete values, plus a short title | Normative and still prose |
| Error condition | Title, trigger, required behavior, fallback — each a sentence | Same |
| Worked example | Input → output table with real values | Examples are the most human-friendly spec there is |

Rules for these rows:

* Every ID-bearing row has a **title** of 2–5 plain words (`Duplicate check`). Human-facing prose names it next to the ID on first mention: `[QE-F-6] (duplicate check)`.
* Words come from `CONTEXT.md`; abbreviations are spelled out once per document.
* One statement per row; "and/or" chains are split into separate rows.
* No bare ID chains in prose ("see F-3, F-7, U-2, E-4") — name the titles or use a table.

### Machine-only content (gets a human summary)

Pseudocode, typed record schemas, inter-module interface tables, state machines, and traceability matrices stay in their precise form in the specification part. **Part H** of the concept document holds a plain-language summary of each of them:

* A summary adds **no rule**. It explains in the reader's words what the normative section says and cites the IDs it covers.
* If Part H and the specification disagree, the specification wins and Part H is fixed in the same MR — a disagreement is a defect, never an intentional simplification.
* Part H is written once a chapter is stable and re-checked whenever the chapter changes (P-GIT-5 applies).

> **Reader test**: someone from a target-user group in `GOAL.md` reads only Part H and the feature's work items. They must be able to say what the feature does for them and when it counts as done — without asking a developer.

---

## Machine-Readable Contract

Everything in `gam-ai-knowledge/` is written for people first (P-HUM). This contract adds the minimum structure a script needs to check the derivation chain without guessing; it adds no rule of its own, it only fixes the form. `gam-ai-knowledge/tools/doc-check.mjs` (copied from the skill's `templates/tools/`) checks it.

### Frontmatter

Every file in `gam-ai-knowledge/` starts with a YAML frontmatter block. GitLab and GitHub show it above the page, so it doubles as a visible header.

| Field | Required in | Values |
| --- | --- | --- |
| `doc` | every file | `goal`, `manifest`, `context`, `adr`, `concept`, `feature`, `story`, `qa-log`, `stack`, `workflow`, `roadmap`, `roadmap-details`, `inbox`, `versioning`, `team`, `status` |
| `format` | every file | `engineering-human/2`, or `legacy` for a not-yet-migrated concept document |
| `title` | every file | Plain-language title; for a concept document, the feature name exactly as in the ROADMAP *Feature* column |
| `audience` | every file | List of `product`, `developer`, `reviewer`, `agent` — who reads this file |
| `id-prefix` | `concept`, `feature`, `story` | The document prefix of P-DOC-4, 2–4 capital letters (`QE`); a feature's work items carry the prefix of its concept |
| `concept` | `feature` | The concept document's file name (`quiz-editor.md`) |
| `serves` | `concept` | The goal ID the feature advances (`G-1` or `G-1.S<n>`); §1 explains it in words |
| `concept` | `qa-log` of a concept | The concept's file name (`export.md`) |
| `handle` | `status`, team `inbox` | The developer handle (P-TEAM-2) |
| `status`, `date`, `deciders`, `overrides`, `supersedes` | `adr` | Status `proposed`, `accepted`, `rejected`, `deprecated`, or `superseded`; deciders as handles; `overrides` lists the `P-…` IDs a project deviation overrides |

Frontmatter never holds status or ownership: the lifecycle stage and the owner live only in `ROADMAP.md` (P-ROAD-2).

### ID grammar

| ID | Pattern | Example |
| --- | --- | --- |
| Project goal, success signal, non-goal | `G-1`, `G-1.S<n>`, `G-1.N<n>` | `G-1.S2` |
| Target-user role | `R-<n>` | `R-1` |
| Story, requirement, test | `<DOC>-<KIND>-<n>`, KIND one of `US`, `F`, `NF`, `U`, `C`, `E`, `T` | `QE-F-6` |
| Acceptance criterion | `<DOC>-AC-<story>.<n>` | `QE-AC-3.2` |

`<DOC>` is the concept's `id-prefix`; every ID in a concept document carries it (P-DOC-4). An ID is defined once — in the ID column of its table — and referenced everywhere else.

### Table schemas

The check script recognizes a table by its header row. Keep these headers exactly; extra columns may follow.

| Table | Lives in | Header row (columns) |
| --- | --- | --- |
| Target users | `GOAL.md` | ID, User group (role), What they need from the product |
| Success signals | `GOAL.md` | ID, Signal, Target |
| Non-goals | `GOAL.md` | ID, Non-goal, Why |
| Roadmap | `ROADMAP.md` | Version, Feature, Serves, Status, Depends on, Feasibility (+ Owner in team mode) |
| Stage list | `ROADMAP.md` | Stage, Meaning |
| User story (exactly one row) | story file | ID, Title, As a, I want, so that, Priority |
| Acceptance criteria | story file | ID, Title, Given, When, Then |
| Slices | story file | Slice, Delivers, Blocked by, Issue |
| Requirements (F, U, NF, C) | concept §4–§7 | ID, Title, Requirement, Derives from |
| Error conditions | concept §9 | ID, Title, Trigger, Required behavior, Fallback, Derives from |
| Acceptance and integration tests | concept §17 | ID, Title, Covers, Given, When, Then |
| Unit tests | concept §17 | ID, Module, Input, Expected, Covers |
| Untested justifications | concept §17 | ID, Reason |
| Capability mapping | `STACK.md` §2 | ID, Capability (title), Technology, Version constraint, Notes and limits |

*Derives from*, *Covers*, and *Delivers* cells list IDs, optionally each followed by its title in parentheses: `QE-AC-3.2 (no duplicates)`.

### What the script checks

| Code | Finding | Severity |
| --- | --- | --- |
| `FM` | Frontmatter missing, or a required field missing or invalid | error |
| `ID` | ID malformed, without the document's prefix, or defined twice | error |
| `REF` | A *Derives from*, *Covers*, *Delivers*, *Serves*, or `serves` value names an ID that does not exist (dangling) | error |
| `ORPHAN` | A requirement or test without parent; an acceptance criterion whose story does not exist; a concept whose `title` has no ROADMAP row | error |
| `COVER` | A story without acceptance criterion; an acceptance criterion without requirement or without test | error |
| `UNTESTED` | A requirement no test covers and no untested justification names | warning |
| `STACK` | A `C-x` without a `STACK.md` mapping (blocks synthesis) is an error; a mapping without its `C-x` (dead weight) is a warning | error / warning |
| `ROAD` | A ROADMAP *Status* outside the P-ROAD-1 stages, or an empty *Serves* | error |
| `COPY` | The stage list in `ROADMAP.md` differs from the P-ROAD-1 stages | error |
| `ROLE` | A user story's *As a* names no role of the `GOAL.md` target users | warning |
| `NA` | An `n/a` without a reason | error |
| `WI` | Work-item tree broken: a `feature` or `story` whose `id-prefix` matches no concept, a `concept` field naming another file, a story file not listed in its folder's `feature.md` or without one, a story file with not exactly one story, an acceptance criterion of another story; a warning for stories still in a concept document (move them on the next change, P-DOC-5) | error / warning |
| `STATUS` | Only with `--status`: a ROADMAP stage that does not match the git history, or a position row that names an already merged branch (see below) | error |
| `AC-TEST` | An acceptance criterion whose ID no test name in the code carries (see below) | error / warning |

Legacy concept documents are checked for frontmatter only. Output is plain text for people, or JSON with `--json` for tools; the exit code is `1` when an error is found.

**Status against git (`--status`).** A story counts as merged when a merge commit on the checked-out branch names its ID — the MR title carries it (P-MR-1), and GitLab and GitHub both write the title into the merge commit. It counts as released when a `v*` tag contains that merge. From this the script derives the stage each concept's feature must have: all stories in a tag → `released`; all merged → `in dev`; some merged → `in progress`; none merged → `concept`, `ready`, or `in progress`. In an MR pipeline, `--pending-title` and `--pending-branch` count the MR as merged, because the MR carries the status for the state after the merge (P-ROAD-4). The check needs the full history and the tags; a shallow clone is an error.

**Acceptance criteria against the tests in code (`AC-TEST`).** `COVER` checks that §17 plans a test for every acceptance criterion; `AC-TEST` checks that the code has one (rule 4 above, Definition of Done item 1 in `WORKFLOW.md`). The script reads every test file next to `gam-ai-knowledge/`: files named `*.test.*` or `*.spec.*` with a `.js`, `.jsx`, `.ts`, `.tsx`, `.mjs`, `.cjs`, `.mts`, or `.cts` extension under `tests/`, `apps/`, and `packages/`, skipping `node_modules`, `dist`, `build`, `out`, `coverage`, `storybook-static`, and every folder whose name starts with a dot. A test name is the first string argument of `describe`, `it`, `test`, `suite`, or `test.describe`, also with `.only`; an acceptance criterion counts as tested when a test name carries its ID (`it("QE-AC-3.2 refuses a duplicate question", …)`). Skipped (`.skip`) and `.todo` tests, comments, and other strings do not count. The severity follows the state of the work, so that `dev` stays green while a feature is still being built:

| Situation | Severity |
| --- | --- |
| The feature's ROADMAP stage is `in dev` or `released` | error |
| The merge request delivers the criterion: `--pending-branch` is `feature/<n>-…` or `fix/<n>-…`, and `#<n>` stands in the *Issue* cell of a slice whose *Delivers* names the criterion | error |
| The feature is `in progress` and neither of the above holds | warning |
| The feature is `idea`, `concept`, or `ready` | no finding |
| An error case, but an untested justification of the concept (§17, *ID, Reason*) names the criterion | warning |

The CI passes the merge request's source branch, so every MR must bring the tests of the criteria its slice delivers; merged slices of a feature still in progress show as warnings on `dev` until the feature reaches `in dev`.

---

## Stack Neutrality Rules

Concept documents must be implementable in any mainstream stack without edits. Concretely:

### Use the neutral type system

All schemas, signatures, and interfaces use these types and only these types:

`string`, `integer`, `decimal`, `boolean`, `timestamp`, `duration`, `binary`, `uuid`, `enum(A|B|C)`, `list<T>`, `map<K,V>`, `optional<T>`, plus named record types you define in the document (e.g., `DocumentChunk { id: uuid, text: string, position: integer }`).

`STACK.md` owns the mapping table from neutral types to concrete stack types.

### Declare capabilities, not libraries

Concept documents never name a library, framework, package, or product. They declare **capability requirements**:

| Wrong (in a concept doc) | Right (in a concept doc) | Then in `STACK.md` |
| --- | --- | --- |
| "Use `pdfplumber` to extract text" | "Requires: PDF text extraction with per-page positions" | `PDF text extraction → pdfplumber >= 0.11` |
| "Store embeddings in pgvector" | "Requires: vector store with cosine similarity search over ≥ 1M entries" | `vector store → PostgreSQL 16 + pgvector` |

Each capability requirement gets an ID (`C-1`, `C-2`, …) so `STACK.md` can trace its mappings back to the concepts that demand them.

### Describe behavior directly, never by framework analogy

"Works like Django signals" or "the usual React data flow" are forbidden. If the behavior matters, specify it; if it doesn't, drop the sentence.

### Keep pseudocode dialect-free

Architecture chapters use pseudocode with the neutral type system. No language keywords, no framework base classes. Concurrency, retries, and error propagation are explicit behavioral rules ("processes up to 4 documents concurrently; on failure of one, the others continue"), not language constructs.

### Specify tests as data, not framework code

Test concepts are tables of `given → when → then` with concrete values — never framework snippets. `STACK.md` names the test framework and how tables become executable tests.

---

## The Simple-LLM Bar

The quality bar for every concept document (P-QB-1): **a modest LLM — not a frontier model — with no memory of this project and no access to existing code must be able to produce a working implementation from the documentation set alone.** Human equivalent: a junior developer who never has to ask a single question. Every question either would ask is a defect in the document, and the fix is always to answer it *in the document*, never in chat (see Phase 7).

What this demands in practice:

1. **No inference gaps.** Every rule that could be resolved two ways is resolved in the document.
2. **A worked example for every non-trivial rule** (§10), with real values; edge cases get their own examples. Examples are normative: if prose and example conflict, that is a defect to fix.
3. **Normative language.** MUST / MUST NOT / MAY, with values. Every quantifier gets a number: "files up to 50 MB," "p95 within 2 s," "3 retries at 1 s, 2 s, 4 s."
4. **Named error conditions.** Every failure mode gets an ID (`E-1`, …), its trigger, and the required behavior. "Smart" behavior (LLM calls, heuristics) always specifies its deterministic fallback.
5. **Bounded context.** Each concept document is implementable on its own; cross-references name the exact file and section, never "see above."
6. **Explicit sequencing.** Where order matters, it is a numbered list, not prose.

> **Litmus test**: Hand the documentation set to the *cheapest* model that can write code. If its implementation fails the test suite, the document is not ready — regardless of whether a smarter model would have succeeded.

---

## Team Mode

The mode is decided once in Phase 0 (*"Will more than one developer work on this repo?"*) and recorded in `WORKFLOW.md`; solo is the default. When more than one developer works on the repo (`WORKFLOW.md` says *team*), the process is unchanged, but documents are split so that each developer runs the same vendored profile on their own machine without editing the same file concurrently (P-TEAM-1…5):

| Document | Solo | Team |
| --- | --- | --- |
| Engineering profile | Personal skill | Vendored in `.claude/skills/engineering-human/`, changed via MR |
| Personal preferences + developer handle | `~/.claude/CLAUDE.md` | `CLAUDE.local.md` (gitignored) |
| Session positions | `ROADMAP-DETAILS.md` | `team/<handle>/STATUS.md`, one file per developer |
| `ROADMAP-DETAILS.md` | Positions + processed-task log | Index (feature → owner → link to the owner's STATUS.md) + append-only log, entries prefixed with date and handle |
| Inbox | `next.md` | `team/<handle>/next.md`; unassigned work in the issue tracker |
| Concept document + `.qa-log.md` + work items | Author | Single owner (ROADMAP.md *Owner*); others review in the MR |
| New IDs | Final on commit | Provisional until merged into `dev`; the later branch renumbers its own new IDs on collision |
| Phase 4 PM gate | The user | The PM approver in `team/TEAM.md`, given as MR approval |

**Developer handle.** Each developer puts one line into their gitignored `CLAUDE.local.md`: `Developer handle: <handle>` — a short pseudonymous identifier such as the git username. Committed files never contain real names or other personal data. A session starts by reading the handle, then `ROADMAP-DETAILS.md` (the index), then that developer's `STATUS.md`.

---

## The Two Paths

Two ways to arrive at a production-grade concept document. Both are valid.

### Path A — Frontloading (Concept → Code)

Write the concept document first (Phases 0–6), then synthesize.

* **When**: the domain is understood; requirements can be stated before coding; the feature touches existing architecture non-trivially.
* **Advantage**: fewer false starts, designed architecture, built-in traceability. **Risk**: over-engineering a feature that a day's prototype would have settled.

### Path B — Retrofit (Code → Concept)

Build first, then extract the concept document from the working code.

* **When**: the problem is novel, the right abstraction unclear, the APIs unknown. Use the `/prototype` skill for the build — its rules (throwaway from day one, no polish, capture the verdict on a `prototype/<name>` branch) are the single source for how prototypes are made.
* **Process**: prototype → stop coding → extract the concept document (feature goal traced to `G-1`, user stories and acceptance criteria reverse-engineered from what the prototype lets users do, requirements derived from them, architecture as-built, test concept from what you learned). **De-stack while extracting**: translate library calls and framework idioms into neutral behavior and `C-x` requirements. Then review the extracted document through Phases 1–8 as a draft — retrofitted documents fail the Portability Test and the Simple-LLM Bar more often than frontloaded ones. Finally refactor the code to the cleaned-up concept, or re-synthesize.
* **Risk**: the retrofit never happens and the prototype becomes production code. **A prototype without a concept document is technical debt with no repayment plan.**

> **The rule**: every module that ships to production has a concept document, regardless of path.

---

## The Synthesis Contract

A concept document is **synthesis-ready** when it satisfies all of the following:

### Ubiquitous Language

* Every domain term used is defined in `CONTEXT.md` or defined inline and then promoted there; names in documents and code follow it.

### Goal Trace

* The feature goal (§1) serves a named part of `G-1` and violates no non-goal; the consistency check reports no orphan, dangling reference, or contradiction.

### Completeness

* Every user story has at least one acceptance criterion; every acceptance criterion is covered by at least one requirement and one acceptance test.
* Every functional requirement has a corresponding module, method signature, and test case.
* Every inter-module interface is specified: inputs, outputs, neutral types, named error conditions.
* Every external capability is a numbered `C-x` with acceptance criteria — never a library name.
* Every configuration parameter has neutral type, default, valid range, and boundary behavior.
* Every worked example needed for the Simple-LLM Bar is present.

### Precision

* Signatures in the neutral type system; state machines with explicit states, transitions, guards; schemas as typed records; smart behavior with deterministic fallback; normative language throughout.

### Self-Containment

* No "see the code" or "ask [person]"; domain knowledge embedded; resolved questions include the reasoning; no behavior defined by analogy.

### Traceability

* Every requirement derives from ≥ 1 acceptance criterion or story, maps to ≥ 1 module and ≥ 1 test; every module traces to ≥ 1 requirement; every `C-x` is mapped in `STACK.md`. No orphans.

### Falsifiability

* Every requirement is testable — otherwise it is a wish, not a requirement. Worked examples double as acceptance tests: each example's input/output pair appears in the test concept.

### Stack Neutrality

* Passes the Portability Test; no library, framework, or language name anywhere; neutral types and dialect-free pseudocode only.

### Human Readability

* Part H is complete for every chapter that exists, adds no rule, and agrees with Part S; every ID-bearing row has a title; the Reader Test passes.

---

## The Phases

### Phase 0 — Repo setup (once)

First write `GOAL.md` (P-GOAL-1) — nothing else is created before the project goal exists. Then decide solo or team (see Team Mode). Then set up the tracker and the workflow per P-TRK-1 and `WORKFLOW.md` (labels, issue and MR templates, sprint milestones, protected `main` and `dev`, Definition of Done) and the merge policy, merge guard, and status hook in `.claude/settings.json` (P-MR-4…6, P-ROAD-4). Then write the agent files every other skill reads from `docs/agents/*.md` — tracker commands and the domain-doc layout pointing to `gam-ai-knowledge/CONTEXT.md` and `gam-ai-knowledge/adr/` — and create the root `CONTEXT-MAP.md` (P-DOC-2); `/engineering-human setup` does all of this. Create the process documents (`WORKFLOW.md`, `ROADMAP.md`, `ROADMAP-DETAILS.md`, `next.md` or the per-developer folders, `VERSIONING.md`) per the profile's P-GIT / P-ROAD / P-VER / P-TEAM decisions, and `STACK.md` with at least §0, §1, and §8 filled in.

### Phase 1 — Grill the draft

Run **`/engineering-human <feature>`** (the profile-aware wrapper around `/grill-with-docs`) on whatever exists (loose notes, a roadmap entry, a half-finished doc). It drives the `/grilling` interview and maintains `CONTEXT.md` and ADRs via `/domain-modeling` as decisions land.

Manifest-specific rules on top of the skill:

* **Consult the engineering profile first.** Before the first question, read the `engineering-human` skill's `PROFILE.md`, state the applied standing decisions by ID, and ask only what is new about this feature. Re-asking a profile-answered question is a defect.
* **Goal before details.** Write the feature goal (≤ 200 characters) in §1 and run the consistency check against `G-1` and the non-goals before the first detail question. A feature that serves no part of `G-1` stops here.
* **Stories before requirements.** Capture user stories and their acceptance criteria first, in the dual-readable form, as the feature's work items (`work-items/<feature>/`, P-DOC-6); derive `F` / `U` / `NF` from them, each naming the `AC` or `US` it derives from.
* **Personal data gets privacy requirements.** When a story stores, shows, or sends data about a person, the grill flow derives `NF` requirements with `/privacy-by-design`.
* **Requirements first, solutions later.** Push back if the interview drifts to code — and equally hard if it drifts to technology ("we could use X library"). Stack talk is deferred to `STACK.md`, always.
* Separate functional, non-functional, and user-interaction requirements; **number everything** (`US-1`, `AC-1.1`, `F-1`, `NF-1`, `U-1`) with the document prefix per P-DOC-4.
* Capture open questions as numbered items (`Q1`, `Q2`, …).
* **Too big for one session?** If the effort is a fog-wrapped, multi-session endeavor, chart it with **`/engineering-human wayfind`** first. Its decision tickets resolve into exactly the material Phases 1–2 need; when the map is clear, return here and continue — wayfinder plans, it does not build.

### Phase 2 — Resolve open questions & sharpen terminology

Answer the open questions from Phase 1, batched by theme, as crisp one-line decisions. Delegate reading legwork to **`/research`** subagents (primary sources, cited findings file in the repo). `/domain-modeling` keeps `CONTEXT.md` and ADRs current as answers land.

* If research surfaces a technology constraint (an external API's actual behavior), capture the *behavior* as a requirement or `C-x` in the concept doc and the *technology* in `STACK.md`.
* Newly discovered requirements get appended (`F-45`, `F-46`, …), each naming the acceptance criterion it derives from; if none fits, add the missing story or acceptance criterion first. Resolved questions move into a "Resolved Questions" table with their reasoning.
* If a question needs a *runnable* answer (state model, business logic, a UI you have to see), detour through **`/prototype`** and fold the verdict back in.

### Phase 3 — Check artifact interactions

Before architecture, scan the existing system for interferences: for each existing artifact type your feature touches, document **Interaction** (how the feature uses it), **Interference** (how it might break or conflict with it), and **Schema extensions** (what must change, backward-compatibly). This phase typically discovers 3–5 new requirements; each names its parent acceptance criterion or story like any other. No skill covers this — it is manifest work.

### Phase 4 — PM review gate

**Stop. The product manager reads the document** — Part H so far, goal trace, user stories and acceptance criteria, requirements, resolved questions, artifact interactions, schema extensions; no architecture yet. The consistency check result is attached; so is the result of the optional adversarial check of the goal trace and Part H (`/doubt-driven-development`), if it was run. In team mode, the PM approver named in `team/TEAM.md` signs off by approving the MR. Do not proceed without sign-off. Small fixes go into the doc; large changes restart Phase 1.

### Phase 5 — Architecture & vertical slices

Add the architecture chapter, written in the **`/codebase-design`** vocabulary — design deep modules per P-DES-1: much behavior behind small interfaces at the fewest, highest seams.

* One module = one responsibility (`STACK.md` decides how modules map to files/classes/packages).
* Every module lists `Traces to: F-x, NF-y` and `Requires: C-x`.
* **Mandatory artifacts**: module tree; class/method signatures in dialect-free pseudocode with neutral types; a mermaid flowchart; an inter-module interface table with named `E-x` conditions; a state machine diagram; a design-for-testability section naming the seams tests will use (pre-agreed per `/tdd`). An artifact with nothing to show is `n/a` with a reason (see *Sections that do not apply* below the structure template).
* Break the architecture into **vertical slices** sized for one fresh context window each — each slice cuts a narrow but complete path through every layer and is demoable on its own; slices are applied on paper here, listed in the *Slices* table of the story files they deliver, and cut into issues in Phase 7.
* End with a traceability matrix (G-1 → US → AC → F/NF/U → module(s); no orphans) and update `STACK.md`: every new `C-x` mapped with version constraints.
* Run the consistency check again, then write the Part H summaries of the data model and architecture (P-HUM-3).

### Phase 6 — Test concept & TDD contract

Add the test concept as the final documentation chapter, structured so an agent can run a red-green loop one slice at a time:

* Unit test tables per module (input → expected → requirement), values taken from the document's worked examples (§10).
* Acceptance tests: every acceptance criterion from the story files as a given/when/then scenario carrying its `AC` ID.
* Integration tests as end-to-end given/when/then scenarios with synthetic documents.
* **CI constraint**: no LLM calls, no network; external capabilities mocked at the capability boundary; fast enough to run before every deployment.
* **Synthetic test data**: template + variation approach; golden outputs as stack-neutral data files, versioned in the repo.
* **Coverage matrix**: every acceptance criterion → at least one acceptance test; every requirement → at least one test; untested requirements explicitly justified.
* Finish with the Part H summary H6 (how we know it works).

### Phase 7 — Synthesize via tickets and TDD

The concept document is the spec — `/to-spec` is not run (see Skill Bindings). The steps are the `engineering-human` delivery commands, which own their procedure; in order:

| Step | Command | What it produces |
| --- | --- | --- |
| 1 | `/engineering-human tickets <feature>` | The feature issue, one child issue per user story with its `AC-n.m` rows, weight, and milestone, slice issues below their story; issue numbers written back into the work items (P-TRK-2) |
| 2 | `/engineering-human implement <issue>`, one fresh session per issue | Branch, TDD loop, commits with requirement IDs, MR with the status for the state after the merge |
| 3 | `/engineering-human review <MR>` | Review against the acceptance criteria and the Definition of Done; a person reviews as well, except under merge policy `auto` in solo mode (P-MR-2) |
| 3a | `/engineering-human revise <MR>`, when review threads are open | Each thread verified, answered, or fixed; fixes carry requirement IDs |
| 4 | `/engineering-human merge <MR>` | Merge under the merge policy and status update in the same step (P-MR-4, P-ROAD-4) |
| — | `/engineering-human release [<version>]` | Read-only pre-release review, release MR, tag, release notes (P-VER-1, P-MR-5) |

The one rule the manifest adds: **if the agent gets stuck or asks a question during synthesis, that is a documentation defect** — answer it in the concept document or `STACK.md` first, then resume. Never answer only in chat.

### Phase 8 — Architectural rescue

AI-driven development accelerates software entropy; periodically run a maintenance pass:

* **`/engineering-human sweep`** surfaces deepening opportunities; a picked candidate becomes an idea that re-enters at Phase 1.
* The same sweep checks **goal drift** (the consistency check across all concept documents against the current `GOAL.md`), **Part H drift** (human summaries that no longer match their chapter), **concept drift** (code and concept document disagree — repaired in the document first, then the code, never the other way around silently) and **stack leaks** (technology names in concept documents — moved to `STACK.md`).
* Bugs found along the way follow `/diagnosing-bugs`; its post-mortem hands back to `/engineering-human sweep` when the real finding is a missing seam.

---

## The Stack Document (`STACK.md`)

The single place where technology lives. Rebuilding on a different stack means rewriting this one file. Setup creates it from the `engineering-human` skill's `templates/STACK.md`, which follows this outline.

```markdown
# Stack Document

## 0. In Plain Words        — 3–5 sentences: what the system is built with and why, for non-specialists
## 1. Runtime & Language        — language(s), version(s), runtime, package manager
## 2. Capability Mapping        — C-x → technology + version constraint → notes/limits (every C-x, no orphans)
## 3. Type Mapping              — neutral type → concrete stack type
## 4. Module Mapping Conventions — how a concept "module" materializes (files/classes/packages, naming)
## 5. Error Mapping Conventions — how E-x conditions materialize (exceptions / result types / codes)
## 6. Test Framework Mapping    — how test tables become executable tests; runner, layout, mocking at capability boundaries
## 7. Configuration & Secrets   — how neutral config parameters materialize; naming; secret handling
## 8. Build, Run, Deploy        — exact commands; CI pipeline description
## 9. Stack ADRs                — why this stack; per-capability rationale where non-obvious
```

Rules:

* `STACK.md` may name anything — that is its job. But it must not contain requirements, business rules, or behavior; "when the user does X…" belongs in a concept document.
* Every mapping traces to the `C-x` IDs that demand it. A mapping with no `C-x` is dead weight; a `C-x` with no mapping blocks synthesis.
* Version constraints live here and only here.

---

## Anti-Patterns

| Don't | Do instead |
| --- | --- |
| Start a project or feature without a goal | `GOAL.md` first; feature goal in §1 first |
| Keep a story or requirement that serves no parent | Add the missing parent or drop the item |
| Bend a lower item to hide a wrong goal | Change the higher level via ADR, then re-check descendants |
| Write requirements only an agent can parse | Dual-readable rows with titles; Part H for machine-only chapters |
| Put a rule into Part H | Part H summarizes; rules live in Part S |
| Two developers edit one concept document or STATUS file | One owner per concept; one STATUS file per developer |
| Jump to architecture before requirements are stable | Complete Phases 1–4 first |
| Re-ask a question the engineering profile answers | Read `PROFILE.md`, state applied decisions by ID |
| Run `/to-spec` on a concept-document feature | The concept document is the spec; `/engineering-human tickets` reads its work items and §16 |
| MR or commit only an agent understands ("fix [QE-F-6]") | Plain-language title and summary, IDs with titles (P-GIT-4, P-MR-1) |
| Improvise a workflow an installed skill owns | Load the skill (P-WS-5); the routing lives in Skill Bindings |
| Write requirements as prose paragraphs | Numbered tables (`F-1`, `NF-1`, `U-1`), one sentence per row |
| Skip the artifact interaction analysis | Phase 3 always finds hidden conflicts |
| Leave open questions dangling | Resolve, or defer explicitly with rationale |
| Architecture without traceability | Every module traces to numbered requirements |
| Tests without a coverage matrix | Every requirement maps to a test |
| Let the AI invent solutions during requirements | "Requirements here, solutions later" |
| Ship a prototype without extracting a concept doc | Path B, steps 2–5 |
| Reference "the code" for details in concept docs | Embed the domain knowledge |
| Name a library/framework/product in a concept doc | Declare a `C-x`; map it in `STACK.md` |
| Language-specific types in concept docs | Neutral type system; map in `STACK.md` |
| Define behavior by analogy ("like Django signals") | Specify the behavior, with a worked example |
| "Should handle errors appropriately" | Enumerated `E-x` with trigger and required behavior |
| Vague quantifiers ("fast", "large", "many") | Numbers with units and percentiles |
| A non-trivial rule without an example | Concrete input → output example, normative |
| Answer a synthesis agent's question only in chat | Fix the document first, then resume |
| Synthesize the whole architecture at once | Small vertical slices, continuous TDD cycles |
| Ignore entropy after synthesis | Periodic Phase 8 rescue, incl. drift + stack-leak sweep |
| Copy positions into README/CONTEXT/ROADMAP | Link to `ROADMAP-DETAILS.md`; ROADMAP holds only the lifecycle stage (P-ROAD-2) |
| Leave the status update for the next session | Update position and stage in the same step as the merge (P-ROAD-4) |
| Merge with a bare `git merge` or the host button | `/engineering-human merge` under the merge policy (P-MR-4) |

---

## Concept Document Structure Template

```markdown
---
doc: concept
format: gam-ai-knowledge/1
title: "[Feature name exactly as in the ROADMAP Feature column]"
audience: [product, developer, reviewer, agent]
id-prefix: "[DOC]"
serves: "[G-1 or G-1.S<n>]"
---

# [Feature] Concept

[One to three plain sentences: what this feature gives which users, and who reads this document.]

# Part H — For Human Readers
(Plain-language view; adds no rule; cites IDs with titles; Part S wins on conflict — P-HUM-3)
## H1. In one sentence (the §1 feature goal, and which part of G-1 it serves)
## H2. Who benefits and how (roles from GOAL.md; what changes for them)
## H3. How it works, step by step (the main user journey in prose, citing US/AC)
## H4. What it deliberately does not do (from §12 and the GOAL.md non-goals)
## H5. How it is built, in plain words (summaries of §8 data model, §16 architecture, state machine)
## H6. How we know it works (summary of §17: which stories are covered by which scenarios)
## H7. Key decisions (one line per decision from §13, with the reason)

# Part S — Specification (normative)
## 0. Synthesis Context
    ### Development Path (A: Frontloaded / B: Retrofitted)
    ### Synthesis Dependencies (other concept docs this feature requires, by filename)
    ### Synthesis Scope (what can be regenerated from this doc alone)
    ### Owner (team mode: handle, per ROADMAP.md)
## 1. Purpose & Goal Trace
    ### Feature Goal (at most 200 characters)
    ### Serves (ROADMAP entry + the part of G-1; non-goals checked)
## 2. Ubiquitous Language & Context (terms used here; each defined in CONTEXT.md or inline)
## 3. User Stories & Acceptance Criteria
    (One link to work-items/<feature>/feature.md — the stories and criteria live there, P-DOC-6; never restated here)
## 4. Functional Requirements (ID | Title | Requirement with MUST/MUST NOT/MAY and values | Derives from)
## 5. User Interaction Requirements (U-1 … U-N, same columns)
## 6. Non-Functional Requirements (NF-1 … NF-N — every quantifier has a number; derives from US or G-1.Sx)
## 7. Capability Requirements (C-1 … C-N — external capabilities with acceptance criteria; no library names)
## 8. Data Model (record types in the neutral type system; field-level constraints)
## 9. Error Conditions (ID | Title | Trigger | Required behavior | Fallback | Derives from)
## 10. Worked Examples (concrete input → output pairs for every non-trivial rule; normative)
## 11. Integration Points
## 12. Out of Scope
## 13. Resolved Questions & ADRs (Q1 … QN → Decision / Rationale)
## 14. Artifact Interactions & Interferences
## 15. Schema Extensions
## 16. Architecture & Vertical Slices
    ### Module Overview & Tree
    ### Vertical Slices Breakdown (each slice lists the US/AC it delivers)
    ### Module Specifications (dialect-free pseudocode, neutral types; Traces to: F-x / Requires: C-x)
    ### Pipeline Flow (mermaid flowchart)
    ### Inter-Module Interfaces Table (inputs, outputs, error conditions E-x)
    ### State Machine Diagram (mermaid)
    ### Design for Testability (the pre-agreed seams, per /tdd)
    ### Requirement Traceability Matrix (G-1 → US → AC → F/U/NF → module → test)
## 17. Test Concept & TDD Contract
    ### Unit Tests & Test Case Tables (ID | Module | Input | Expected | Covers — values from §10)
    ### Acceptance Tests (ID | Title | Covers | Given | When | Then — every AC-n.m at least once)
    ### Integration Tests (ID | Title | Covers | Given | When | Then — end-to-end scenarios)
    ### Synthetic Test Data Strategy (templates, variations, golden outputs as stack-neutral data files)
    ### CI Test Constraints (mock at capability boundaries, no network, no LLM calls)
    ### Test Coverage Matrix & Untested Justifications (ID | Reason)
```

**Sections that do not apply.** Keep the process small (P-GRILL-4): a section or mandatory artifact that has nothing to say for this feature — e.g. §11 without integration points, §14/§15 when no existing artifact is touched, a state machine for a stateless feature — keeps its heading and contains exactly one line, `n/a — <reason in one sentence>`. An empty section or a bare `n/a` is a defect; a reason makes the omission reviewable at the Phase 4 gate.

### Example rows (form, not content)

A story file (`work-items/quiz-editor/QE-US-3-reuse-questions.md`) and a concept document:

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| QE-US-3 | Reuse questions | teacher | to copy a question from an earlier quiz | I do not have to type it twice | Must |

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| QE-AC-3.1 | Copy keeps answers | a quiz with the question "2 + 2" and 4 answers | the teacher copies the question into a new quiz | the new quiz contains "2 + 2" with the same 4 answers and the same correct answer |
| QE-AC-3.2 | No duplicates | the target quiz already contains "2 + 2" | the teacher copies "2 + 2" into it | the copy is refused and the message "This question is already in the quiz" is shown |

| ID | Title | Requirement | Derives from |
| --- | --- | --- | --- |
| QE-F-6 | Duplicate check | The system MUST refuse a copy into a quiz that already contains a question with identical text and raise [QE-E-2] (duplicate question). | QE-AC-3.2 (no duplicates) |

| ID | Title | Covers | Given | When | Then |
| --- | --- | --- | --- | --- | --- |
| QE-T-4 | Duplicate copy refused | QE-AC-3.2 (no duplicates), QE-F-6 (duplicate check) | quiz "Week 3" contains "2 + 2" | the teacher copies "2 + 2" into "Week 3" | the copy is refused; "Week 3" still holds exactly one "2 + 2" |
