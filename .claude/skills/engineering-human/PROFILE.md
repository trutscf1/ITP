# Engineering Profile — Standing Decisions

Cross-project answers to the general questions grillings keep asking. Each entry has a stable ID; projects bind or override them by reference (see [SKILL.md](SKILL.md) for the rules). Source: decisions grilled and proven in the `gamaiconcept` (gamquiz) project, generalized 2026-08-10; goal-first, human-readability, team-mode, and git-workflow-light decisions (P-GOAL, P-HUM, P-TEAM, P-TRK, P-MR, P-TIME) added 2026-09-30; status discipline, merge policy, and delivery commands (P-ROAD-4, P-MR-4 values, P-WS-6) added 2026-10-01; P-MR-4 split into P-MR-4…6 on 2026-10-04.

**Scope.** Every entry is *team scope* (binding for everyone on a shared repo) unless marked *(personal scope)*; personal-scope entries may be overridden per developer in `CLAUDE.local.md` (P-TEAM-2).

## Project goal (P-GOAL)

- **P-GOAL-1** — Every project starts with **one project goal of at most 200 characters** in `documentation/GOAL.md` (ID `G-1`), plus target users, 1–3 measurable success signals, and non-goals (added 2026-09-30).
  - It is defined before any feature, story, or requirement; if it is missing, asking for it is the first question of any session.
  - An approved project application (e.g. a *Projektantrag* with SMART goals) is the ancestor of `G-1`: GOAL.md links it, `G-1` and the success signals stay consistent with its SMART goals, and a conflict is resolved with whoever approved the application, not in GOAL.md alone.
- **P-GOAL-2** — Everything is **derived top-down**: goal → roadmap feature → feature goal (≤ 200 characters) → user story → acceptance criterion → requirement → module → test. Every item names its parent; an item without a parent is dropped or reveals a missing parent.
- **P-GOAL-3** — **No contradiction between levels.** A lower item may narrow its ancestors, never contradict them or a non-goal. On conflict the higher level decides; changing a higher level is a deliberate ADR followed by a re-check of all its descendants.

## Git flow (P-GIT)

- **P-GIT-1** — Two permanent branches: **`main`** contains only tested releases and is updated exclusively from `dev` as part of a release; **`dev`** is the permanent integration branch and is never deleted. Neither ever receives direct commits; both are protected on the git host.
- **P-GIT-2** — One issue = one branch = one MR/PR into `dev`; work branches are deleted after merge. If a slice is too big for one MR, split the slice in the concept document first — the issue and branch follow.
  - `feature/<issue-id>-<slug>` and `fix/<issue-id>-<slug>` are created from their issue.
  - `concept/<feature>` (concept authoring) and `chore/<slug>` (repo configuration without behavior change) need no issue; a concept may optionally be tracked by an issue labelled `type::concept` (chore added 2026-10-01; issue rule clarified 2026-10-04).
- **P-GIT-3** — **No squash merges** into `dev`: merge commits preserve the per-commit requirement-ID trail that `git log --grep` relies on.
- **P-GIT-4** — Every commit touching production code names at least one requirement ID (`[QE-F-6]`); `[no-req]` sparingly for pure chores. The subject line is a plain-language summary a human understands without looking the ID up (`Refuse duplicate question on copy [QE-F-6]`; readability rule added 2026-09-30). If no ID can be named, the work is unspecified: stop, fix the concept document, then commit.
- **P-GIT-5** — A behavior change and its documentation update ship **in the same MR**. An MR that changes behavior but no document is either mislabeled or drift.
- **P-GIT-6** — Concept authoring happens on `concept/…` branches and is reviewed via MR like code.

## Versioning & releases (P-VER)

- **P-VER-1** — Semantic Versioning; releases are annotated git tags `v<version>` on `main`, each published as a release on the git host (GitLab or GitHub Release) with release notes. `dev` → `main` merges happen only for a release.
- **P-VER-2** — In the `0.x` phase: MINOR per roadmap feature iteration, PATCH for fixes; APIs may change in any `0.x` MINOR. Under release merge `auto` (P-MR-5) the agent derives the version from this rule without asking and states the reasoning in the release notes; a MAJOR bump (including `0.x` → `1.0.0`) is always confirmed by a person. Destructive DB migrations are allowed pre-1.0 only if the project explicitly declares its data disposable.
- **P-VER-3** — Backwards compatibility is judged against the externally observable contracts: HTTP API shapes, event names/payloads, export formats, and whether migrations run on existing production data without loss.

## Roadmap & planning (P-ROAD)

- **P-ROAD-1** — `documentation/ROADMAP.md` is the ordered backlog. Order encodes **dependencies, not dates**. Every entry is **pre-concept**: a scoped intention with a feasibility assessment, which goes through the manifest phases before implementation. Table columns: Version | Feature | Serves | Status | Depends on | Feasibility (+ Owner in team mode, P-TEAM-4), followed by per-feature notes. *Serves* names the part of `G-1` the feature advances; a feature that serves no part of the goal does not enter the roadmap (P-GOAL-2; columns extended 2026-09-30). *Status* holds only the coarse lifecycle stage — `idea`, `concept`, `ready`, `in progress`, `in dev`, `released` — never a position (stages fixed 2026-10-01).
- **P-ROAD-2** — `documentation/ROADMAP-DETAILS.md` is the **single status location**: current repo/branch/MR positions precise enough that a fresh session needs no chat history, plus the annotated log of processed tasks (done-markers instead of deletion). All other documents link here instead of copying status snapshots; the only other status field is the lifecycle stage in ROADMAP.md (P-ROAD-1). In team mode it becomes the index + log, and positions move to per-developer STATUS files (P-TEAM-3).
- **P-ROAD-3** — `documentation/next.md` is the **task inbox**: new prompts land there first; processing a prompt moves it to ROADMAP-DETAILS (log/positions) and — if it is a planned feature — into ROADMAP.md. In team mode each developer has an own inbox (P-TEAM-3).
- **P-ROAD-4** — **Status is updated at the moment work reaches `dev`, not later** (added 2026-10-01 after status drifted behind two merged slices).
  - Every merge of a story or slice MR, every phase boundary of a concept, and every release updates, in the same working step, the position row in `ROADMAP-DETAILS.md` (or the developer's `STATUS.md`) and the *Status* stage of the feature in `ROADMAP.md`, and closes or confirms the issue.
  - Where `documentation/` is in git, the MR itself carries the status for the state after the merge, so the reviewer sees it; where it is not, the agent applies it right after the merge.
  - It is part of the Definition of Done. A `Stop` hook from the settings template reminds the agent when the newest merge on `dev` left the status files untouched.

## Documentation (P-DOC)

- **P-DOC-1** — Documentation-first: `documentation/` is the source of truth, code is a derivative (see the concept authoring manifest). Docs prescribe; they never merely describe.
- **P-DOC-2** — `documentation/CONTEXT.md` is a glossary and nothing else (format per `/domain-modeling`); it is read right after `GOAL.md`. ADRs live in `documentation/adr/` as `NNNN-slug.md`. A root `CONTEXT-MAP.md` points to both so that skills looking at the repo root find them; a root `CONTEXT.md` or `docs/adr/` is never created (locations changed 2026-09-30).
- **P-DOC-3** — Single-context layout by default (one glossary and one ADR folder in `documentation/`, per P-DOC-2); multi-context only with real monorepo signals, then each context is listed in the root `CONTEXT-MAP.md`.
- **P-DOC-4** — IDs follow one grammar; an ID reference always means "as specified in the document" — never restated in other words (US and AC added 2026-09-30).
  - Project level, no document prefix, all in `GOAL.md`: `G-1` (project goal), `G-1.S<n>` (success signal), `G-1.N<n>` (non-goal), `R-<n>` (target-user role).
  - Concept level: `<DOC>-<KIND>-<n>` with KIND ∈ US (user story), F (functional), NF (non-functional), U (user interaction), C (capability), E (error condition), T (test; added 2026-10-04).
  - Acceptance criteria are numbered per story as `<DOC>-AC-<story>.<n>` (`[QE-AC-3.2]` = criterion 2 of `QE-US-3`).
  - In prose, IDs stand in square brackets (`[QE-F-6]`).
- **P-DOC-5** — Documents written under an older documentation format are **migrated on touch**: they carry a legacy marker until the next MR that changes them, which migrates them completely. Untouched, finished documents may stay legacy indefinitely. Project-level files (CLAUDE.md, MANIFEST.md, GOAL.md, ROADMAP.md, WORKFLOW.md) are migrated at once (added 2026-09-30).
- **P-DOC-6** — **User stories and acceptance criteria live in a work-item tree** in `documentation/work-items/<feature>/`, ordered like the tracker hierarchy *feature → user story → slice*, and it is their single source (added 2026-10-06).
  - `feature.md` is the parent work item: one per concept document, with the stories in priority order.
  - Each user story is one file `<DOC>-US-<n>-<slug>.md` holding the story row, its acceptance criteria `AC-n.m`, and its slices with their issue numbers.
  - Slices are designed in concept §16 and only listed in the story file; the concept document's §3 links the tree and never repeats a story or criterion.

## Design defaults (P-DES)

- **P-DES-1** — Design **deep modules** in the `/codebase-design` vocabulary: much behavior behind a small interface at a clean seam. Prefer existing seams, place new ones as high as possible, and keep the seam count minimal.
- **P-DES-2** — Tests live only at **pre-agreed seams** (per `/tdd`); the interface is the test surface.
- **P-DES-3** — New code follows the project's documented layering chain even where legacy code bypasses it.
- **P-DES-4** — Concept documents are stack-neutral: neutral type system, capability requirements (`C-x`) instead of library names, dialect-free pseudocode. Technology lives only in `STACK.md`.
- **P-DES-5** — Reference records by surrogate ID, always; never treat a natural/display value (name, label, code) as a foreign key or lookup key in application code, URLs, or UI control values. A natural value may still back a uniqueness constraint or a find-or-create lookup, but every relationship and every reference elsewhere goes through the ID.
- **P-DES-6** — Never hardcode a tunable value (timeout, threshold, default) in code. Put it in a config file when it's a deploy-time operational knob (e.g. a request timeout), or in a database table when it needs to be admin-editable at runtime without a deploy (e.g. institutional/business data that changes per organization or over time, like a school year boundary).

## Quality bar (P-QB)

- **P-QB-1** — The **Simple-LLM bar**: a modest LLM (equivalently, a junior developer) with no project memory must be able to implement correctly from the documentation set alone. Every question either would ask is a documentation defect, fixed in the document — never only in chat.
- **P-QB-2** — Requirements are numbered tables in normative language (MUST/MUST NOT/MAY) with concrete values; every non-trivial rule gets a worked input → output example; every failure mode is an enumerated `E-x`.

## Issue tracker (P-TRK)

- **P-TRK-1** — The tracker is set up with **project labels**, **issue templates** (user story, bug), **one milestone per sprint**, and an actively used **issue board**; the concrete labels and templates are bound in the project's `WORKFLOW.md`. Supported hosts are GitLab and GitHub; on GitHub the board is a GitHub Project and the weight lives in the issue description or a Projects number field (GitHub added 2026-10-01). On GitLab Free, scoped labels are not mutually exclusive and issue weight and required approval rules are unavailable: the agent removes the old `status::` label itself, the weight lives in the issue description, and the approval count of P-MR-4 is checked by the agent through the API (added 2026-10-04).
- **P-TRK-2** — **Every work item of P-DOC-6 is an issue, in the same hierarchy.** The feature is a parent issue (`type::feature`, title = the ROADMAP feature name); each user story is its child issue, titled with its ID (`QE-US-3 Reuse questions`), whose description holds the *As a … I want … so that …* sentence, the acceptance criteria `AC-n.m` copied verbatim from the story file, a **weight**, and an **assignee**. If a story needs more than one vertical slice, the extra slices are child issues of the story issue. The issue numbers are written back into the work-item files (hierarchy and story file added 2026-10-06).
- **P-TRK-3** — Weight is a relative effort estimate on the scale 1, 2, 3, 5, 8; a story weighted above 8 is split in its work-item file first, and the issue follows.
- **P-TRK-4** — **On GitLab, the agent checks the tier itself and uses native child items where the tier has them** (added 2026-10-06).
  - The tier is determined at setup and again before every `tickets` publish, never assumed: the namespace's `plan` field, else a probe of the group epics API, else a pop-up; the result is recorded as *Host tier* in `WORKFLOW.md`.
  - GitLab Premium or Ultimate with the project in a group: the feature is a **group epic** (label `type::feature`) and every story issue is its native child item; blocking edges use the native *blocked by* link.
  - GitLab Free, or a project in a personal namespace: the feature is an issue and the hierarchy is kept by `Part of #<parent>`, a related-issue link, and the parent's task list.
  - GitLab has no issue under an issue at any tier, so slice issues stay linked to their story issue by `Part of` and a related-issue link.

## Merge requests & review (P-MR)

- **P-MR-1** — Every change reaches `dev` through an MR (on GitHub: a pull request; every MR rule applies to it unchanged), written for a human reviewer first. The title is a plain-language summary with the story ID (`QE-US-3 Reuse questions: copy with duplicate check`). The description contains the issue reference (`Closes #12`), *what changes for the user* in plain words, a short summary of the implementation, the functions that were tested and how, and the consistency-check result. IDs always appear with their titles (P-HUM-2).
- **P-MR-2** — Review by **another person** is mandatory: the reviewer checks the acceptance criteria and the Definition of Done explicitly and leaves a short comment on the content. The MR author never merges their own MR on their own authority. An MR authored by an AI agent is reviewed by a human, and the agent merges it only as the merge policy allows (P-MR-4): on the human's *Merge now* (`ask`) or after the human's approval on the git host (`approved`). AI review (`/code-review`) is an additional check, never a replacement for the human review — the single exception is merge policy `auto` in solo mode, where a clean AI review recorded on the MR takes the reviewer's place (exception added 2026-10-01).
- **P-MR-3** — Merge only when **all acceptance criteria of the issue are met**, the **Definition of Done** is fully met, and the pipeline is green. The DoD is defined once in the project's `WORKFLOW.md` and is binding.
- **P-MR-4** — **AI agents merge into `dev` only as the project's merge policy allows** (added 2026-09-30; values and approvals 2026-10-01; release key and merge guard moved to P-MR-5 and P-MR-6 on 2026-10-04).
  - *Source:* `env.ENGINEERING_HUMAN_MERGE` in the repo's committed `.claude/settings.json` (team scope). The agent reads that file, so a value in `settings.local.json` or the personal settings never loosens it. A missing file, key, or unknown value means `ask`.
  - **`ask`** (default): before every merge the agent asks with a **pop-up** (`AskUserQuestion`, never a chat question) naming branch, target, and MR, with exactly these options — **Merge now** (merge commit, P-GIT-3; work branch deleted, P-GIT-2), **No** (nothing is merged; the agent asks what is missing), **Later** (the MR stays open and is listed as pending in the session summary), **I merge myself** (the agent only hands over the MR link). Silence or an unclear answer counts as *No*.
  - **`approved`**: the agent merges without a pop-up once at least `env.ENGINEERING_HUMAN_APPROVALS` persons other than the author (positive integer in the same file; default and fallback `1`) approved the MR on the git host; until then the MR stays open and is listed as pending.
  - **`auto`**: solo mode only — in team mode it acts as `approved`. The agent merges without a pop-up once its own review (`/engineering-human review`) is clean and recorded on the MR.
  - In every policy the merge happens only when P-MR-3 holds; otherwise the agent reports what is missing.
- **P-MR-5** — **The release merge `dev` → `main` has its own key**, `env.ENGINEERING_HUMAN_RELEASE_MERGE` in the same file (added 2026-10-04, from P-MR-4).
  - **`ask`** (default and fallback): the P-MR-4 pop-up, whatever the merge policy.
  - **`auto`**: solo mode only — in team mode it acts as `ask`. The agent merges the release MR without a pop-up once the pipeline on `dev` is green and every story since the last tag met the Definition of Done; a MAJOR bump is still confirmed (P-VER-2).
- **P-MR-6** — **Under merge policy `ask`, the settings file carries a merge guard**: `permissions.ask` rules for `git merge`, `glab mr merge`, and `gh pr merge`, so Claude Code itself prompts even if an agent skips the pop-up (added 2026-10-04, from P-MR-4).
  - Switching the merge policy to `approved` or `auto` removes the guard in the same change; switching back restores it.
  - The guard follows the merge policy, not the release key: under release `auto` with merge policy `ask`, the release merge still triggers the guard's prompt. A fully unattended release therefore needs merge policy `approved` or `auto` as well.
  - The guard also prompts for harmless merges (`git merge dev` into a work branch, `git merge --abort`) and does not cover `git pull` or raw API calls.

## Time tracking (P-TIME)

- **P-TIME-1** — Time tracking is **optional** and applies **only to humans**; the project decides in `WORKFLOW.md` whether it is used. When used, each entry is at most 50 minutes and names the activity and the issue or MR (`45m – implement validation (#23)`); reviews and MR work are tracked too. AI agents never book time, neither for themselves nor on behalf of a person.

## Human readability (P-HUM)

- **P-HUM-1** — Write once for both readers. User stories use *As a … I want … so that …*; acceptance criteria use *Given / When / Then* with concrete values; requirements are full plain sentences with MUST/MUST NOT/MAY. Each such row is at the same time the human-readable statement and the machine-readable spec.
- **P-HUM-2** — Every ID-bearing row carries a short plain-language **title**, and human-facing prose names the title next to the ID on first mention (`[QE-F-6] (duplicate check)`) — never bare ID chains. Terms come from `CONTEXT.md`; abbreviations are spelled out once.
- **P-HUM-3** — Content that cannot serve both readers (pseudocode, typed schemas, interface tables, state machines, traceability matrices) gets a **plain-language summary in Part H** of the concept document. Part H is a view, not a source: it adds no rule, cites the IDs it summarizes, and any contradiction with the normative part is a defect fixed in the same MR.
- **P-HUM-4** — P-HUM applies to **every artifact people read**, not only concept documents: every file in `documentation/`, ADRs, issues, MR titles and descriptions, commit subjects, and release notes. Each document in `documentation/` opens with one to three plain sentences saying what it is for and who reads it; tables whose rows are IDs carry a title column; purely technical documents (`STACK.md`) open with a short plain-language summary of the stack choice. Verbatim transcripts (`.qa-log.md`) are exempt from rewriting but keep their question titles.

## Working style (P-WS)

- **P-WS-1** — Think before coding: state assumptions explicitly; if multiple interpretations exist, present them instead of picking silently; push back when a simpler approach exists.
- **P-WS-2** — Simplicity first: the minimum code that solves the problem; no speculative features, abstractions, or configurability.
- **P-WS-3** — Surgical changes: every changed line traces to the request (project obligations like doc sync included); don't "improve" adjacent code; remove only what your own change made dead.
- **P-WS-4** — Goal-driven execution: transform tasks into verifiable goals ("fix the bug" → "write a failing test, make it pass") and loop until verified.
- **P-WS-5** — **Skill enforcement**: before each task, check the installed skills for one that matches and load it. The engineering-flow skills are mandatory at their phase (routing table in the project CLAUDE.md / manifest) — these workflows are never improvised from memory.
- **P-WS-6** — **Delivery runs through `/engineering-human` too.** Cutting tickets, implementing, reviewing, merging, and releasing start with `/engineering-human tickets | implement | review | revise | merge | release`, and merge settings change only through `/engineering-human settings`. These commands carry the ticket and implementation procedures themselves, call `/tdd` and `/code-review`, and add the profile's obligations (issue format, commit IDs, MR format, DoD, merge policy, status update). The generic `/to-tickets`, `/implement`, `/triage`, `/wayfinder`, and `/improve-codebase-architecture` are never started directly in a repo that follows this profile; their counterparts are `/engineering-human tickets | implement | triage | wayfind | sweep` (added 2026-10-01; built-in procedures and `revise` 2026-10-04).

## Grilling & interviews (P-GRILL)

- **P-GRILL-1** — *(personal scope)* Every question to the developer, in every mode, is a numbered `AskUserQuestion` pop-up, never a chat question, so a question is recognizable at a glance. Each lists the viable options with the recommendation first; the pop-up supplies the free-text *Other*. The exact format is defined once in SKILL.md, *Asking the developer* (extended 2026-09-30; format reference 2026-10-04; pop-up 2026-10-06).
- **P-GRILL-2** — Every grilling session's full question/answer transcript is logged verbatim (user answers quoted exactly) to a separate addon file alongside the concept document being produced (e.g. `<concept>.qa-log.md`), in addition to — not instead of — the concept document's own distilled "Resolved Questions" table. Question numbers in both files stay in sync. Questions outside concept work (setup, check, team, migrate) are logged to `documentation/qa-log.md` (extended 2026-09-30).
- **P-GRILL-3** — *(personal scope)* After completing a phase of the concept-authoring process (grilling, sharpening, etc.), proactively suggest starting a new chat session to continue, to save tokens. The project's documentation (concept doc, Q&A log, `ROADMAP-DETAILS.md`, `CONTEXT.md`) already carries all state needed for a fresh session to pick up seamlessly — this is a deliberate, low-cost checkpoint, not a loss of context. Do not suggest this mid-phase or mid-question; only at phase boundaries.
- **P-GRILL-4** — Keep the concept-authoring process — the concept documents and the grilling interviews that produce them — as small as possible. Ask only questions that resolve a real ambiguity actually blocking implementation; skip speculative, exploratory, or "nice to know" questions that don't change what gets built. When a reasonable default exists and getting it wrong is cheap to correct later, state the assumption instead of asking. Prefer fewer, higher-leverage questions over exhaustive coverage.
- **P-GRILL-5** — **Every grilling, planning, or concept session starts with `/engineering-human`** (with or without argument). `/grill-with-docs`, `/grill-me`, and `/grilling` are never started directly in a repo that follows this profile; when a session starts otherwise, the agent switches to `/engineering-human` before the first question (added 2026-09-30).

## Team mode (P-TEAM)

- **P-TEAM-1** — When more than one developer works on a repo, this skill is **vendored** into `.claude/skills/engineering-human/` and committed; the repo copy is binding for that project and changes only via MR. Personal copies never override it inside the repo.
- **P-TEAM-2** — Personal preferences live in each developer's gitignored `CLAUDE.local.md` (including `Developer handle: <handle>`) and may only override *personal-scope* entries. Anything that shapes a shared artifact (git flow, document formats, IDs) is team scope. Committed files use pseudonymous handles, never real names or other personal data.
- **P-TEAM-3** — Volatile per-person documents are **split per developer** under `documentation/team/<handle>/` (`STATUS.md` for session positions, `next.md` for the inbox). `ROADMAP-DETAILS.md` stays the single status *entry point*: a feature → owner → STATUS-link index plus an append-only log whose entries start with date and handle.
- **P-TEAM-4** — Each concept document has exactly **one owner at a time** (Owner column in ROADMAP.md); only the owner grills and edits it, others contribute via MR review. Ownership changes are recorded in the log.
- **P-TEAM-5** — IDs created on a branch are **provisional until merged into `dev`**. On a collision at merge time, the later branch renumbers its own not-yet-merged IDs (the only permitted renumbering, since those IDs were never referenced from `dev`).
