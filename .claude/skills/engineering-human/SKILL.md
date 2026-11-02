---
name: engineering-human
description: The user's standing engineering decisions (PROFILE.md — goal first, git flow, versioning, roadmap, documentation readable by humans and AI, quality bar, merge policy, solo vs. team) and the documentation-first workflow built on them. Consult PROFILE.md before any grilling, planning, design, or project-setup session so already-answered questions are never asked again. Invoke as /engineering-human to set up a project, grill a feature into a concept document, check goal and status consistency, triage incoming issues, chart a big effort, cut tickets, implement, review, address review feedback, merge, release, sweep the architecture, migrate from engineering-profile, or change the merge settings — with Definition of Done and status updates enforced.
---

# engineering-human

## Before anything else

Two rules apply from the first message of every session that loads this skill, before any other step:

1. **Every question to the developer is a pop-up** (`AskUserQuestion`), never a chat question — in every mode and for every kind of question, from grilling rounds to a plain yes/no confirmation. The format is defined in [Asking the developer](#asking-the-developer).
2. **Offer to make this skill the standing first step of the project.** Unless the project's `CLAUDE.md` already says that every session starts with `/engineering-human`, ask once, as a pop-up, whether to write that into the project's CLAUDE.md. Options: **In CLAUDE.md** (committed, binding for everyone on the repo; recommended), **In CLAUDE.local.md** (personal and gitignored; the file must be listed in `.gitignore`, P-TEAM-2), **No** (change nothing; do not ask again in this session). If yes, add one line next to the existing routing rule, or create the file from [templates/CLAUDE.md](templates/CLAUDE.md) if it does not exist: `Every grilling, planning, concept, or delivery session starts with /engineering-human (P-GRILL-5, P-WS-6).` A `CLAUDE.md` edit ships like any other change (P-GIT-2); `CLAUDE.local.md` is personal and never committed.

Grilling sessions (`/grilling`, `/grill-me`, `/grill-with-docs`, and every workflow that grills internally — triage, wayfinding, architecture sweeps) keep re-asking questions the user has already answered in earlier projects: which git flow, how releases are versioned, where the roadmap lives, what the documentation quality bar is. This skill is the cross-project memory for those answers.

**[PROFILE.md](PROFILE.md) holds the standing decisions**, each with a stable ID (`P-GIT-1`, `P-ROAD-2`, …). A grilling that respects the profile only asks what is genuinely new about *this* project.

Four principles shape every document this skill produces:

1. **Goal first** — every project starts with one project goal of at most 200 characters; everything else is derived from it and must not contradict it (P-GOAL).
2. **Readable by humans and AI** — user stories, acceptance criteria, and requirements are written once in a form both can read; only content that cannot serve both gets a separate human summary (Part H). This holds for every artifact people read: all documents in `documentation/`, issues, MRs, commit subjects, release notes (P-HUM-1…4).
3. **Traceable workflow** — every user story is an issue with its acceptance criteria, weight, and assignee; every change goes through an MR checked against the acceptance criteria and the Definition of Done, reviewed by another person and merged as the project's merge policy allows; status is current the moment work reaches `dev` (P-TRK, P-MR, P-ROAD-4). Time tracking is optional and for humans only (P-TIME).
4. **Solo or team** — when several developers work on the project, the profile travels with the repo and the volatile documents are split per developer, so everyone can run the same profile on their own machine without merge fights (P-TEAM).

## Command: `/engineering-human`

**Every session starts here** (P-GRILL-5, P-WS-6): grilling, planning, concept work, setup, migration, and delivery all begin with `/engineering-human`. If a session starts any other way — including `/grill-with-docs`, `/grill-me`, `/grilling`, `/to-tickets`, or `/implement` — switch to the matching subcommand before the first question or change. Invoked directly (`/engineering-human [argument]`) it runs the profile-aware counterpart of `/grill-with-docs`, or one of the delivery steps. The argument picks the entry point:

| Invocation | What happens |
| --- | --- |
| `/engineering-human` (no argument) | Detect the state of the repo and continue from there, first match wins: signs of the predecessor skill (see [Migrating](#migrating-from-engineering-profile)) → **migrate**; no `documentation/GOAL.md` → **setup**; a position row (in `ROADMAP-DETAILS.md` or the developer's `STATUS.md`) in Phase 7 → its next step: **implement** the next unblocked issue, **review** or **merge** its open MR; a position in Phases 1–6 → **grill** that concept further; otherwise → **grill** the oldest inbox item. State the detected entry point as an assumption `A<n>` before acting. |
| `/engineering-human setup` | Run [New project setup](#new-project-setup), starting with the project-goal question. |
| `/engineering-human <feature or idea>` | **Grill** that feature into a concept document. |
| `/engineering-human check` | Run the **consistency check** ([manifest: The Derivation Chain](templates/concept_authoring_manifest.md#the-derivation-chain)) over the whole documentation set, including the status check, and report every orphan, contradiction, and stale status; change nothing without confirmation. |
| `/engineering-human team` | Run the [solo → team migration](#switching-solo--team). |
| `/engineering-human migrate` | Bring a project started with the predecessor skill `engineering-profile` onto this skill ([Migrating from engineering-profile](#migrating-from-engineering-profile)): inventory, then project-level files, then legacy marking. |
| `/engineering-human migrate <feature>` | Migrate one legacy concept document to the current format. |
| `/engineering-human triage [<issue>]` | Triage raw incoming issues and external MRs: bugs become ready fix issues, requests go to the inbox ([references/triage.md](references/triage.md)). |
| `/engineering-human wayfind <effort \| map>` | Chart an effort too big and foggy for one session as a map of decision tickets, or work the next ticket of a map ([references/wayfind.md](references/wayfind.md)). |
| `/engineering-human sweep [<area>]` | Manifest Phase 8: find shallow modules and drift between documents and code, report them as HTML ([references/sweep.md](references/sweep.md)). |
| `/engineering-human tickets <feature>` | Cut the approved concept's user stories into issues ([Delivery: tickets](#tickets)). |
| `/engineering-human implement <issue>` | Implement one issue end to end: branch, TDD, MR, then the merge step ([Delivery: implement](#implement)). |
| `/engineering-human review <MR>` | Review an MR against its acceptance criteria and the Definition of Done ([Delivery: review](#review)). |
| `/engineering-human revise <MR>` | Work through the review threads on an MR the agent authored: verify each point, reply, fix ([Delivery: revise](#revise)). |
| `/engineering-human merge <MR>` | Merge an MR under the project's merge policy and bring the status up to date ([Delivery: merge](#merge)). |
| `/engineering-human release [<version>]` | Release `dev` → `main`: release MR, tag, release notes, status ([Delivery: release](#release)); without a version, the agent derives it (P-VER-2). |
| `/engineering-human settings [ask \| auto \| <key> <value>]` | Show or change the merge settings; `settings auto` switches a solo project to fully automatic merges and releases ([Settings](#settings)). |

### Asking the developer

These rules apply to **every** question addressed to the developer, in every mode (grill, setup, check, team, migrate, triage, wayfind, sweep, settings, and the delivery commands), including confirmations such as "Deviations for this project?" or "wait for confirmation". They are the single definition of the question format that P-GRILL-1 refers to:

1. **Pop-up, numbered.** Every question is an `AskUserQuestion` pop-up, never a chat message. Each question gets its own number `Q<n>`, written at the start of the pop-up question text (`Q<n> - <title>: <question>?`), and a header of at most 12 characters.
2. **Options, recommendation, Other.** The options are the viable choices (2–4, each with a short description); the recommended one comes first and carries `(Recommended)` in its label. The pop-up adds the free-text *Other* by itself, so no `Other:` line is written. Choices that may combine use `multiSelect`.
3. **Rounds.** Each round asks the complete currently answerable frontier; defer only questions blocked by unanswered prerequisites. One pop-up call holds up to four questions, so a larger frontier is sent as several calls in a row, without work in between. A stated assumption (`A<n>`, P-GRILL-4) is not a question; if the developer rejects it, it becomes a `Q<n>` of the next round.
4. **Logged.** Each round is appended verbatim (answers quoted exactly) as soon as it is answered (P-GRILL-2): concept work goes to `<concept>.qa-log.md`; everything else (setup, check, team, migrate, triage, wayfind, sweep, delivery) goes to `documentation/qa-log.md`. Numbers continue from the highest `Q<n>` already in that file. During setup, before `documentation/` exists, keep the rounds and write them into `documentation/qa-log.md` together with `GOAL.md`.
5. **Merge decisions use fixed options.** The one exception to rules 1–3: whether to merge is a pop-up with the fixed options defined in P-MR-4, not with options of the agent's choosing. Where P-MR-4 or P-MR-5 asks, it is that pop-up; where they do not ask, no question is asked at all. The answer is still logged per rule 4.

The **grill** flow, in this order:

1. Read PROFILE.md (the repo copy in team mode) and `documentation/GOAL.md`; in team mode also read `CLAUDE.local.md` for the developer handle and that developer's STATUS.md.
2. State the applied standing decisions by ID in one line, plus the goal `G-1` the feature must serve, and ask for deviations.
3. Check the feature against the goal first: which part of `G-1` it serves, and that it violates no non-goal. If it fails, stop and resolve that before any detail question (P-GOAL-3).
4. Call the Skill tool twice, for `grilling` and `domain-modeling`, and run the interview under the manifest's Phase 1 rules **and the overrides below**, which take precedence over both skills. Every question follows [Asking the developer](#asking-the-developer).
5. **Personal data.** As soon as a story stores, shows, or sends data about a person, call the Skill tool with `privacy-by-design` and derive `NF` requirements from it: which data the story really needs, how long it is kept, how it is deleted, and which rights the person has. Each one names the `AC` or `US` it derives from (P-GOAL-2). The agent does not decide legal questions (lawful basis, consent, processing agreements): it records them as open questions in the concept and refers them to the organisation's data-protection contact (at a school, the school management).
6. Write the results top-down: feature goal (concept §1), then the user stories and acceptance criteria as the feature's work items in `documentation/work-items/<feature>/` — `feature.md` and one story file each, from [templates/work-items/](templates/work-items/) (P-DOC-6), linked from concept §3 — then the requirements in the concept document, all in the dual-readable form (P-HUM-1/2), plus the Part H summaries (P-HUM-3) once machine-only sections exist.
7. Before the Phase 4 gate, offer an adversarial check as a `Q<n>` (optional; recommended for features with personal data or irreversible effects): call the Skill tool with `doubt-driven-development` on the goal trace (§1) and Part H, and fix every confirmed finding in the document before the product manager reads it.
8. At the phase boundary, run the consistency check for this feature, update the position in ROADMAP-DETAILS (or the developer's STATUS.md) and the *Status* stage in ROADMAP (P-ROAD-4), and suggest a fresh session (P-GRILL-3).

### Overrides for `grilling` and `domain-modeling`

Both skills are the interview engine; where they differ from this profile, these rules win:

| # | The engine says | Here instead |
| --- | --- | --- |
| 1 | Glossary `CONTEXT.md` and ADRs `docs/adr/` at the repo root, in the engine's own format | Glossary `documentation/CONTEXT.md`, ADRs `documentation/adr/NNNN-slug.md` (P-DOC-2), created from [templates/CONTEXT.md](templates/CONTEXT.md) and [templates/adr.md](templates/adr.md) so they carry the frontmatter of the [Machine-Readable Contract](templates/concept_authoring_manifest.md#machine-readable-contract). Never create a root `CONTEXT.md` or `docs/adr/`; the root `CONTEXT-MAP.md` only points to them. |
| 2 | Relentless: visit every branch, assume nothing silently | P-GRILL-4 first: where a reasonable default exists and is cheap to change later, state it in the round as an assumption (`A<n>: …`) instead of asking. A stated assumption counts as a visited branch. |
| 3 | Frontier order follows the topic | The design tree is rooted in the derivation chain: `G-1` → feature goal → user stories → acceptance criteria → requirements. No question is asked while an ancestor in that chain is still open (P-GOAL-3). |
| 4 | Act only after shared understanding is confirmed; questions start at Q1 | Question numbers continue from the highest number in the concept's `.qa-log.md`. Each round is appended to the log verbatim as soon as it is answered — logging is not acting (P-GRILL-2); questions outside concept work go to `documentation/qa-log.md` ([Asking the developer](#asking-the-developer)). The concept document itself is written only after the confirmation. |
| 5 | Offer an ADR only if hard to reverse, surprising, and a real trade-off | Those criteria apply, plus **mandatory** ADRs for: any change to `GOAL.md`, a project deviation from a `P-…` ID, adopting or migrating to this skill, switching solo → team. |
| 6 | ADR number = highest existing + 1 | Same, but in team mode the number is provisional until merged into `dev` (P-TEAM-5). |
| 7 | Code contradicts a statement → ask which is right | Ask, then record the answer in the documentation first; the code follows in the implementing MR (concept drift, manifest Phase 8). |
| 8 | Question format: number, title, body, recommendation, asked in chat | Every question is a numbered pop-up with the recommended option first; the free-text *Other* is added by the pop-up ([Asking the developer](#asking-the-developer), rules 1–2). |

## Delivery commands

The delivery commands run manifest Phase 7 and the release (P-WS-6). Each one starts like every session — read PROFILE.md, `documentation/GOAL.md`, `documentation/WORKFLOW.md` (in team mode also `CLAUDE.local.md` and the developer's STATUS.md) — and ends with the status update of P-ROAD-4.

**Built-in procedures.** The generic skills `/to-tickets`, `/implement`, `/setup-matt-pocock-skills`, `/triage`, `/wayfinder`, and `/improve-codebase-architecture` cannot be invoked by the model (`disable-model-invocation`). Their procedures are therefore built into this skill, already adapted to the profile, under [references/](references/); a command loads only its own file. Only model-invocable skills are called with the Skill tool: `grilling`, `domain-modeling`, `codebase-design`, `tdd`, `code-review`, `verification-before-completion`, `receiving-code-review`, `pre-release-review`, `privacy-by-design`, `doubt-driven-development`, `research`, `prototype`, `diagnosing-bugs`, `resolving-merge-conflicts`, `wizard`. Where they differ from this profile, the overrides below take precedence.

### Merge policy

The rules are P-MR-4 (merge policy and approvals), P-MR-5 (release merge), and P-MR-6 (merge guard); this section only says how to apply them. Read the committed `.claude/settings.json` itself ([template](templates/claude/settings.json)) — never the process environment, which may hold personal values — and apply the fallbacks and team-mode rules of those IDs to get the effective values. Changing a value is a normal MR on that file, made with [`/engineering-human settings`](#settings); `WORKFLOW.md` names the keys but never copies their values.

The settings template carries two technical safeguards; this table is their single description, and the README links here:

| Safeguard | What it does | When it is present |
| --- | --- | --- |
| Merge guard (`permissions.ask`, P-MR-6) | Six rules — `git merge`, `glab mr merge`, `gh pr merge`, each for Bash and PowerShell — make Claude Code itself prompt before a merge command, as a backstop if an agent skips the pop-up | Only under merge policy `ask` |
| Status hook (`hooks.Stop`) | Runs `.claude/hooks/status-reminder.mjs` ([template](templates/claude/hooks/status-reminder.mjs)) with Node at the end of each turn. It passes when the newest merge on `dev` or `origin/dev` touched `ROADMAP-DETAILS.md` or a `STATUS.md`, when a later commit on that branch or on `HEAD` did, or when one of them is modified in the working tree; otherwise it blocks the stop once and asks for the P-ROAD-4 update. If `documentation/` is outside git, it compares the file time with the merge time | Always. Needs Node; the second stop always passes |

Under `ask`, the merge guard prompts in addition to the P-MR-4 pop-up; the pop-up is the decision and the permission prompt only confirms it.

### Settings

`/engineering-human settings [ask | auto | <key> <value>]` shows or changes the project's merge settings in `.claude/settings.json`, keeping the safeguards in step. It runs only when the developer invokes it — an agent never loosens a setting on its own initiative.

| Invocation | Effect |
| --- | --- |
| `settings` | Show the effective values (after the team-mode and fallback rules of P-MR-4 and P-MR-5), whether the merge guard and the status hook are present, and any instruction in `~/.claude/CLAUDE.md` that would override them. Changes nothing. |
| `settings auto` | Preset *fully automatic* (solo mode only): `ENGINEERING_HUMAN_MERGE=auto`, `ENGINEERING_HUMAN_RELEASE_MERGE=auto`, merge guard removed; approval count and status hook unchanged. In team mode it refuses and offers `merge approved` instead. |
| `settings ask` | Preset *safe default*: `ENGINEERING_HUMAN_MERGE=ask`, `ENGINEERING_HUMAN_RELEASE_MERGE=ask`, merge guard restored. |
| `settings merge <ask \| approved \| auto>` | Set the merge policy; the merge guard is added for `ask` and removed otherwise. |
| `settings approvals <n>` | Set the approval count for `approved` (positive integer). |
| `settings release <ask \| auto>` | Set the release merge (P-MR-5). `auto` is refused in team mode, like `settings auto`. If the merge policy stays `ask`, say that the merge guard will still prompt at the release merge (P-MR-6). |
| `settings hook <on \| off>` | Add or remove the status hook (`hooks.Stop` and `.claude/hooks/status-reminder.mjs`). |

Steps for every change:

1. Show the change as *key — old → new*, including the safeguards it adds or removes, and confirm it with an `AskUserQuestion` pop-up (*Apply* / *Cancel*); a loosening change (towards `approved` or `auto`, guard or hook removed) also names what will no longer be asked.
2. Edit `.claude/settings.json` without touching any other key, and `WORKFLOW.md` only if its pointer is missing — it never holds the values.
3. Ship it like any change: on the current work branch, or on a new `chore/settings-<slug>` branch from `dev` with an MR (P-GIT-2). The MR merges under the policy currently on `dev`, not the new one.
4. Add a log entry in `ROADMAP-DETAILS.md` (P-ROAD-2).

### Overrides for the delivery skills

| # | The skill says | Here instead |
| --- | --- | --- |
| 1 | Generic ticket cutting: one ticket per tracer-bullet slice | Issues mirror the work-item tree: a feature issue (a group epic on GitLab Premium/Ultimate), one child issue per user story, extra slices below their story — built into [references/tickets.md](references/tickets.md) (P-DOC-6, P-TRK-2…4). |
| 2 | Generic implementation: commit to the current branch, done once committed | Work branch from the issue off `dev`, requirement IDs in commits, documentation in the same MR, done only when the MR is open and the Definition of Done holds — built into [references/implement.md](references/implement.md) (P-GIT-2, P-GIT-4, P-GIT-5, P-MR-1). |
| 3 | Generic implementation: resolve questions as you go | A question during synthesis is a documentation defect: fix the concept document or `STACK.md` first, then resume (manifest Phase 7). |
| 4 | `/tdd`: tests at seams agreed in conversation | The seams are the ones in concept §16 *Design for Testability*; test names carry the `AC` and requirement IDs (`STACK.md` §6, P-DES-2). |
| 5 | `/code-review`: spec from issue, `docs/`, or `specs/` | Spec = the issue plus its story file in `documentation/work-items/` (the acceptance criteria) and the concept document (the requirements derived from them); standards = `WORKFLOW.md` (Definition of Done) and `documentation/MANIFEST.md`, on top of the repo's coding standards. |
| 6 | Any skill: publish to the tracker or host right away | Issues, MR comments, and releases are outward-facing: show what will be published and confirm it as a `Q<n>` first, unless this table or P-MR-4 says otherwise. |
| 7 | `/verification-before-completion`: prove any claim with fresh evidence | The claims are fixed: every acceptance criterion of the issue (a test carrying its `AC` ID passes in this run) and every Definition of Done item in `WORKFLOW.md`. The full suite and `node tools/doc-check.mjs` run fresh; earlier output is never quoted as proof. |
| 8 | `/receiving-code-review`: implement or push back on each point | The yardstick for pushing back is the issue's acceptance criteria and the concept document, not taste. A point that changes behavior is fixed in the concept document first (P-GIT-5); fix commits carry requirement IDs (P-GIT-4); replies are published per override 6. |
| 9 | `/pre-release-review`: name an inferred owner per finding | Owners are roles from `WORKFLOW.md` or handles from `team/TEAM.md`, never guessed real names (P-TEAM-2). The review stays read-only; only the release command acts on its result. |

### Tickets

`/engineering-human tickets <feature>` (manifest Phase 7, step 1): follow [references/tickets.md](references/tickets.md) — gate, draft the feature issue with one child issue per user story and slice issues below, confirm as a `Q<n>`, publish in dependency order, write the issue numbers back into the work items, status `ready` (P-ROAD-4).

### Implement

`/engineering-human implement <issue>` (manifest Phase 7, steps 2–4), in a fresh session per issue: follow [references/implement.md](references/implement.md) — work branch, `tdd` loop, commits with requirement IDs, `code-review`, MR with the status for the state after the merge — then continue with [merge](#merge) for this MR.

### Review

`/engineering-human review <MR>`:

1. Call `code-review` with the MR's merge base on `dev` as the fixed point, under override 5.
2. Add the two profile axes: every acceptance criterion of the issue (met / not met, with the test that proves it) and every Definition of Done item (met / not met).
3. Report the result as a table. Posting it as an MR comment follows override 6 — except under merge policy `auto`, where posting the clean result is the recorded review that P-MR-2 requires.

### Revise

`/engineering-human revise <MR>`, for an MR the agent authored that has open review threads:

1. Collect every unresolved thread on the MR (the project's `docs/agents/issue-tracker.md` has the command).
2. Call the Skill tool with `receiving-code-review` and work through the threads under override 8: verify each point against the code, the issue, and the concept document, then fix it or answer with the reason. One point at a time, with the tests after each fix.
3. Show the drafted replies and the fix commits as one `Q<n>` (override 6), then push and post the replies. Resolving a thread is the reviewer's decision, not the agent's.
4. If every thread is answered, continue with [merge](#merge) for this MR; its step 1 stops while a thread is still unresolved.

### Merge

`/engineering-human merge <MR>` (manifest Phase 7, step 4) — the only path by which an agent merges into `dev`:

1. Check P-MR-3 with `verification-before-completion` (override 7): all acceptance criteria, every Definition of Done item, green pipeline, no unresolved threads. If anything fails, report it and stop; no merge prompt is offered. For unresolved threads on the agent's own MR, offer [revise](#revise).
2. Apply the effective merge policy (P-MR-4, read per [Merge policy](#merge-policy)): under `ask` show the pop-up; under `approved` count the approvals on the host (the project's `docs/agents/issue-tracker.md` has the command) and leave the MR pending if they are not enough; under `auto` run [review](#review) first if no clean review is recorded yet.
3. Merge with a merge commit (P-GIT-3) and delete the work branch (P-GIT-2).
4. Status in the same working step (P-ROAD-4): if the MR did not already carry it, update the position row and the ROADMAP stage now (`in dev` once the feature's last story is merged); close the issue if the host did not (GitLab and GitHub close issues automatically only on the default branch), and the feature issue once its last story issue is closed; add the log entry. `node tools/doc-check.mjs --status` on `dev` must then report no `STATUS` error.
5. Name every MR left open (*Later*, missing approval) as pending in the session summary.

### Release

`/engineering-human release [<version>]` (P-VER-1…3):

1. Determine the version from `VERSIONING.md`, P-VER-2, and the stories merged since the last tag. Under release `ask` (P-MR-5), confirm it as a `Q<n>`; under release `auto`, use it without asking and write the reasoning into the release notes — except a MAJOR bump, which is always confirmed as a `Q<n>`.
2. Call the Skill tool with `pre-release-review` for `v<last tag>..dev` under override 9: migrations, configuration, secrets, rollout order, rollback risk. A blocker stops the release and is reported; a confirmation item becomes a `Q<n>`; the remaining risks go into the release notes.
3. Open the release MR `dev` → `main` with release notes that list the closed stories with IDs and titles (P-HUM-4).
4. Check that the pipeline on `dev` is green and every story since the last tag met the Definition of Done; otherwise report and stop. Then merge per the effective release key (P-MR-5).
5. Create the annotated tag `v<version>` on `main` and publish the release on the git host (GitLab or GitHub Release) with the notes.
6. Status: ROADMAP stage `released` for every included feature, position rows closed, log entry; `node tools/doc-check.mjs --status` must report no `STATUS` error.

## The contract

1. **Read PROFILE.md before the first question** of any grilling, planning, or design session. This is mandatory, not optional context. In a team repo, read the repo's copy (`.claude/skills/engineering-human/PROFILE.md`), not a personal one (P-TEAM-1).
2. **Read the project goal next** (`documentation/GOAL.md`). If it does not exist, defining it is the first question of the session — before any feature, story, or requirement (P-GOAL-1).
3. **Never ask a question PROFILE.md already answers.** Instead, state the applied decisions up front by ID: *"Applying your standing decisions: P-GIT-1/2/3 (main+dev flow), P-VER-1 (SemVer), P-ROAD-1…4 (roadmap files, status discipline), P-MR-4…6 (merge policy from `.claude/settings.json`). Deviations for this project?"* — one confirmation line, not a re-interview.
4. **Projects may deviate.** A deviation is recorded in the *project* (as an ADR or in the project's WORKFLOW.md) referencing the overridden ID ("overrides P-GIT-3: squash merges allowed here because …"). PROFILE.md itself is never edited to fit one project.
5. **New durable answers get appended.** When a grilling produces a decision that would be answered the same way in the next project, append it to PROFILE.md with the next free ID and the date. The test: *"Would this answer be identical for an unrelated future project?"* Yes → profile. No → project docs (CONTEXT.md, ADR, WORKFLOW.md). Never both. In a team repo, a profile change is an MR against the repo copy (P-TEAM-1). If the new entry adds or changes a setting, default, or behavior, update README.md in the same change ([Maintenance](#maintenance)).
6. **No duplication (single source of truth):**
   - *General* decisions live **once** in PROFILE.md; project docs **bind** them by reference, never copy the text.
   - *Process mechanics* (how to grill, how to TDD, how to cut tickets) live in the respective skills — the profile records only the user's *choices*, not the procedures.
   - *Project-specific* facts never enter the profile.
   - A human summary (P-HUM-3) is a *view* on the normative text, never a second source: it adds no rule and cites the IDs it summarizes.
   - One exception for readability: a template may carry a read-only copy of a *value list* a reader needs to understand the document (e.g. the ROADMAP stages of P-ROAD-1), because in solo mode PROFILE.md is not in the repo. The copy names its source ID and is never extended locally; the consistency check compares it with the source.
7. **Keep status current at every merge, phase boundary, and release** (P-ROAD-4): the `ROADMAP-DETAILS.md` position (or the developer's `STATUS.md`) and the `ROADMAP.md` stage reflect the work the moment it reaches `dev`, and before any session ends. Never leave this to the next session; the repo cannot show the omission if `documentation/` is outside git.
8. **Merge only through the merge policy** (P-MR-4, P-MR-5): every merge an agent performs goes through [Delivery: merge](#merge) or [release](#release), never a bare `git merge` or host merge button.

## Where the rules live

The rules this skill applies are not restated here, so they cannot drift apart:

| Topic | Single source |
| --- | --- |
| Standing decisions (all `P-…` IDs) | [PROFILE.md](PROFILE.md) |
| Derivation chain, consistency rules, consistency check | [manifest: The Derivation Chain](templates/concept_authoring_manifest.md#the-derivation-chain) |
| Work-item tree (feature → user story → slice), issue hierarchy, GitLab tier check | P-DOC-6, P-TRK-2, P-TRK-4, [manifest: The Documentation Set](templates/concept_authoring_manifest.md#the-documentation-set), [templates/work-items/](templates/work-items/) |
| Dual human/AI readability, Part H | [manifest: Writing for Humans and Machines](templates/concept_authoring_manifest.md#writing-for-humans-and-machines) |
| Legacy documents and their marker | [manifest: Legacy documents](templates/concept_authoring_manifest.md#legacy-documents), P-DOC-5 |
| Solo vs. team documents, developer handle | [manifest: Team Mode](templates/concept_authoring_manifest.md#team-mode) |
| Phases, gates, concept document structure | [manifest: The Phases](templates/concept_authoring_manifest.md#the-phases), [Concept Document Structure Template](templates/concept_authoring_manifest.md#concept-document-structure-template) |
| Project-specific workflow values, Definition of Done | the project's `documentation/WORKFLOW.md` ([template](templates/WORKFLOW.md)) |
| Merge policy value, approval count, release merge, merge guard, status hook | the project's `.claude/settings.json` ([template](templates/claude/settings.json)); rules in P-MR-4…6 and P-ROAD-4, mechanics and safeguards in [Merge policy](#merge-policy) |
| Question format | [Asking the developer](#asking-the-developer) |
| Status check | [manifest: Consistency check](templates/concept_authoring_manifest.md#consistency-check), step 5 |

In a project, read the project's copy (`documentation/MANIFEST.md`); the file in `templates/` is only the starting point for new projects.

## Switching solo → team

The procedure behind `/engineering-human team` (the resulting layout is described in the manifest's Team Mode chapter):

1. Copy this skill folder to `.claude/skills/engineering-human/` in the repo and commit it.
2. Create `documentation/team/TEAM.md` from [templates/TEAM.md](templates/TEAM.md).
3. Move the current session positions from `ROADMAP-DETAILS.md` into `documentation/team/<handle>/STATUS.md` ([templates/STATUS.md](templates/STATUS.md)); leave the log in place and turn the positions section into the index.
4. Move open items of `next.md` into the owner's inbox or the issue tracker; delete the shared `next.md`.
5. Add the Owner column to ROADMAP.md and `CLAUDE.local.md` to `.gitignore`.
6. Set the mode in `WORKFLOW.md` to team. If the merge policy in `.claude/settings.json` is `auto`, it now acts as `approved` (P-MR-4): change the value to `approved` in the same MR, remove the merge guard if still present (P-MR-6), and require `ENGINEERING_HUMAN_APPROVALS` approvals on the host where the tier allows it (P-TRK-1). A release key `auto` acts as `ask` in team mode (P-MR-5): set it to `ask` in the same MR.

## Migrating from engineering-profile

Projects started with the predecessor skill keep working: every `P-…` ID kept its number and meaning, and the project's own `documentation/MANIFEST.md` still governs it until replaced. Migration adds what is new without rewriting finished work (P-DOC-5). All work happens on the branch `concept/migrate-engineering-human` and reaches `dev` through an MR like any other change (P-GIT-6).

### Step 1 — Inventory (read-only)

Detect the predecessor by any of: `CLAUDE.md` or `MANIFEST.md` naming `engineering-profile`; no `documentation/GOAL.md`; concept documents whose §3 is *Functional Requirements*. Report a table *item — current state — proposed action* covering every row of Step 2 and every concept document (legacy or current), then ask for confirmation as a `Q<n>` ([Asking the developer](#asking-the-developer)). Change nothing before that.

### Step 2 — Project-level files (one MR)

| Item | Action |
| --- | --- |
| `GOAL.md` | Draft `G-1`, roles, success signals, and non-goals from the *Projektantrag*, README, and existing concept §1 sections; **the user decides** the final wording (P-GOAL-1). Nothing below is derived before it is confirmed. |
| `MANIFEST.md` | Replace with the current template. Before that, diff the project copy against the predecessor's template (`~/.claude/skills/engineering-profile/templates/concept_authoring_manifest.md`, if still installed) and carry every project-specific change over; list them in the MR. |
| `CLAUDE.md` | Change `engineering-profile` to `engineering-human`, `/grill-with-docs` to `/engineering-human`, and `/to-tickets` / `/implement` to `/engineering-human tickets` / `implement`; add the new sections of [templates/CLAUDE.md](templates/CLAUDE.md) without dropping project-specific content. |
| `ROADMAP.md` | Add the *Serves* column; propose a value per feature, the user confirms. A feature that serves no part of `G-1` is reported, not silently kept (P-GOAL-3). |
| `WORKFLOW.md` | Add the missing sections of [templates/WORKFLOW.md](templates/WORKFLOW.md) (mode, merge policy pointer, labels, sprints, MR rules, Definition of Done, releases, time tracking); keep the existing bindings. |
| `.claude/settings.json`, `.claude/hooks/` | Merge [templates/claude/settings.json](templates/claude/settings.json) into the existing settings without dropping any key: all three `env` values, the merge guard (only under `ask`), and the `Stop` hook; copy [templates/claude/hooks/status-reminder.mjs](templates/claude/hooks/status-reminder.mjs). An older `status-reminder.sh` and its `Stop` entry are replaced by the Node version. Ask for the policy, the approval count, and the release merge as one `Q<n>` (defaults `ask`, `1`, `ask`). |
| `STACK.md` | If missing, create it from [templates/STACK.md](templates/STACK.md) with the technology already in use; if present, add the missing sections and the *In Plain Words* summary (P-HUM-4). |
| `ROADMAP.md` stages | Map every *Status* cell to a P-ROAD-1 stage and bring it up to date with the merged MRs and closed issues (`/engineering-human check`, status step). |
| `ROADMAP-DETAILS.md`, `next.md`, `VERSIONING.md` | Add the purpose introduction and title columns from the templates (P-HUM-4); keep all content, rewrite no log entry. |
| Glossary and ADRs | If they sit at the root: `git mv CONTEXT.md documentation/CONTEXT.md` and `git mv docs/adr documentation/adr` (ADR numbers unchanged), create the root `CONTEXT-MAP.md` from [templates/CONTEXT-MAP.md](templates/CONTEXT-MAP.md), and update every link to them in the repo (P-DOC-2). |
| `docs/agents/` | Rewrite `issue-tracker.md` and `domain.md` per [references/setup-tracker.md](references/setup-tracker.md), keeping project-specific additions; remove `triage-labels.md` (the labels now live in `WORKFLOW.md`). |
| `.gitlab/` or `.github/` | Copy [templates/gitlab/](templates/gitlab/) to `.gitlab/` or [templates/github/](templates/github/) to `.github/`, matching the host; labels, milestones, branch protection, required approvals, and merge method are host settings — hand them to `/wizard` as human steps. |
| ADR | *"Adopt engineering-human; legacy concept documents migrate on touch (P-DOC-5)"*, listing the legacy documents. |
| Frontmatter | Add the frontmatter of the [Machine-Readable Contract](templates/concept_authoring_manifest.md#machine-readable-contract) to every file in `documentation/`, taking `title` and the fields from the matching template. A concept document's `title` is its feature name exactly as in `ROADMAP.md`. |
| Legacy marker | Every concept document not migrated in this MR gets `format: legacy` in its frontmatter ([manifest: Legacy documents](templates/concept_authoring_manifest.md#legacy-documents)); an older legacy line in the body is removed. |
| Checks | Copy the tooling as in [New project setup](#new-project-setup), step 10, then run `node tools/doc-check.mjs` and the markdown lint; fix every finding on the project-level files, and list the ones in legacy documents as *not migrated* in the MR. |
| Mode | Ask solo or team as a `Q<n>`; for team run [Switching solo → team](#switching-solo--team) afterwards in a separate MR. |

### Step 3 — One concept document (`/engineering-human migrate <feature>`)

Run when the document is next changed, or on request. One document per MR; the user confirms every derived story and acceptance criterion, since they are decisions, not facts.

1. **Renumber** to the current structure. Old §0–§2 keep their numbers; every old section from §3 on moves up by one (old §3 *Functional Requirements* → §4, … old §9 *Worked Examples* → §10, old §15 *Architecture* → §16, old §16 *Test Concept* → §17). Update every `§` reference to this document inside `documentation/` in the same MR; closed issues and old commits are not rewritten.
2. **§1:** add the feature goal (at most 200 characters) and *Serves*, matching the ROADMAP entry.
3. **Work items:** propose user stories by grouping the existing `F`/`U` requirements by the user outcome they serve; propose acceptance criteria from the worked examples (§10) first, and from requirements only where no example exists. Write them as the feature's work items (P-DOC-6) and let §3 link them. Existing requirement IDs are never renumbered; stories and criteria get new IDs. A concept already in the current format whose stories still stand in §3 (`doc-check` warning `WI`) only moves its rows into the work-item tree, IDs and wording unchanged.
4. **Derives from + titles:** add the *Derives from* and *Title* columns to §4–§9. A requirement that fits no story is reported — either a story is missing or the requirement is obsolete; the user decides.
5. **§17:** mark the existing integration tests that execute an acceptance criterion with its `AC` ID; add acceptance tests for criteria without one.
6. **Part H:** write H1–H7.
7. Set `format: engineering-human/2` and add `serves` in the frontmatter, run `/engineering-human check` for this document, and record the result in the MR.
8. **Open issues** of this feature: add the story reference and the acceptance criteria to their description, create the feature issue and link the story issues as its children, and write the issue numbers into the work items (P-TRK-2). Closed issues stay as they are.

### Finishing

When no legacy document remains (or only finished ones the team keeps as legacy on purpose), suggest removing the predecessor skill from `~/.claude/skills/` — never delete it without the user's confirmation, since other projects may still use it.

## New project setup

For a fresh repo that should follow the user's standard process:

1. **Define the project goal.** Ask for it first — derived from the approved project application (*Projektantrag*, SMART goals) if one exists — and write `documentation/GOAL.md` from [templates/GOAL.md](templates/GOAL.md): one goal of at most 200 characters, target users, 1–3 measurable success signals, non-goals. Nothing else is created before the goal exists (P-GOAL-1).
2. **Ask solo or team** (as a `Q<n>`, see [Asking the developer](#asking-the-developer)) and set up accordingly ([manifest: Team Mode](templates/concept_authoring_manifest.md#team-mode)).
3. Copy [templates/concept_authoring_manifest.md](templates/concept_authoring_manifest.md) to `documentation/MANIFEST.md` in the project.
4. Copy [templates/CLAUDE.md](templates/CLAUDE.md) to the repo root and fill in the `[placeholders]`.
5. Configure the agent files the callable skills read — tracker commands and domain-doc layout in `docs/agents/` — per [references/setup-tracker.md](references/setup-tracker.md), and create the root `CONTEXT-MAP.md` from [templates/CONTEXT-MAP.md](templates/CONTEXT-MAP.md) (P-DOC-2).
6. Set up the tracker per P-TRK-1. Ask for the host (GitLab or GitHub) as a `Q<n>`; on GitLab, run the tier check instead of asking for the tier (P-TRK-4), then copy [templates/gitlab/](templates/gitlab/) to `.gitlab/` or [templates/github/](templates/github/) to `.github/` (issue templates for features, user stories, and bugs, MR or PR template), create the labels and the first sprint milestone (on GitHub also the Project board), protect `main` and `dev`, and allow only merge commits (no squash, no rebase). For merge policy `approved`, also require `ENGINEERING_HUMAN_APPROVALS` approvals on `dev`.
7. Ask for the merge policy (`ask` / `approved` / `auto`, P-MR-4), the approval count, and the release merge (`ask` / `auto`, P-MR-5) as one `Q<n>`, then write `.claude/settings.json` from [templates/claude/settings.json](templates/claude/settings.json) — all three `env` values, the merge guard only under `ask`, and the `Stop` hook — and copy [templates/claude/hooks/status-reminder.mjs](templates/claude/hooks/status-reminder.mjs) to `.claude/hooks/` (it runs with Node on every platform). If the settings file exists, merge into it without dropping other settings.
8. Create the process documents in `documentation/` from their templates: [ROADMAP.md](templates/ROADMAP.md), [ROADMAP-DETAILS.md](templates/ROADMAP-DETAILS.md) (keep the solo or the team position section), [next.md](templates/next.md) (solo) or `team/<handle>/next.md` per developer (team), [WORKFLOW.md](templates/WORKFLOW.md) (mode, host, labels, sprints, Definition of Done, release steps, time tracking on/off), and [VERSIONING.md](templates/VERSIONING.md).
9. Create `documentation/STACK.md` from [templates/STACK.md](templates/STACK.md); fill in §0, §1, and §8 now, the rest as the first concept reaches Phase 5. Create `documentation/CONTEXT.md` from [templates/CONTEXT.md](templates/CONTEXT.md) and `documentation/qa-log.md` from [templates/qa-log.md](templates/qa-log.md).
10. Copy the documentation checks: [templates/tools/doc-check.mjs](templates/tools/doc-check.mjs) to `tools/doc-check.mjs`, [templates/.markdownlint.jsonc](templates/.markdownlint.jsonc) to the repo root, and the CI job matching the host — [templates/ci/gitlab-ci.docs.yml](templates/ci/gitlab-ci.docs.yml) to `.gitlab/ci/docs.yml`, included from `.gitlab-ci.yml`, or [templates/ci/github-docs.yml](templates/ci/github-docs.yml) to `.github/workflows/docs.yml`. Run `node tools/doc-check.mjs` once; on the fresh documents it must exit with 0.

The templates are the reusable versions of the `gamaiconcept` originals; that project remains their reference implementation for everything except the goal, human-readability, team, git-host-workflow, and merge-policy rules added here (GOAL, CONTEXT, CONTEXT-MAP, adr, qa-log, TEAM, STATUS, WORKFLOW, ROADMAP, ROADMAP-DETAILS, next, VERSIONING, STACK, `.markdownlint.jsonc`, `tools/`, `ci/`, `claude/settings.json`, `claude/hooks/`, `agents/`, and the `gitlab/` and `github/` templates are new).

## Maintenance

- One decision per profile entry: a lead sentence of one or two sentences that states the decision, and — only where the decision has several parts — short sub-bullets, one fact each. An entry that needs more is two decisions and gets a second ID.
- When a standing decision changes globally, edit the entry in place and note the date; projects that pinned the old behavior keep their recorded deviation.
- Delete an entry only when it is wrong everywhere; renumbering is forbidden (IDs are referenced from project ADRs and commits). The only exception is P-TEAM-5: IDs that never reached `dev`.
- **Keep [README.md](README.md) current.** It is the user-facing view of this skill: how it works, every setting a user can change (where, values, default, scope, rule ID), the commands, the files a project gets, and open suggestions. Every change to SKILL.md, PROFILE.md, or `templates/` that adds, changes, or removes a command, a setting, a default, a generated file, or a described behavior updates README.md in the same commit. Like Part H, the README adds no rule and cites the IDs; on a contradiction the rule files win and the README is fixed.
- **Suggestions go to the README.** An improvement to this skill that is proposed but not implemented is added to the README's *Suggestions* table with the next free `S-<n>`; when it is implemented it moves into the matching README section, when it is rejected it is removed. IDs are not reused.
- **Check the skill after every change.** Call the Skill tool with `writing-for-agents` and `skill-check` on this folder, then confirm: the description has at most 1024 characters, SKILL.md stays under about 500 lines, every Skill-tool call names a skill the model can invoke, and `npx markdownlint-cli2 "**/*.md"` reports nothing.
- **Edit the repo, never the installed copy.** Changes are made in this repo and deployed with `deploy_skill_wrapper.ps1`, which overwrites `~/.claude/skills/engineering-human/`; edits made only in the installed copy are lost on the next deploy.
- In team repos, the vendored copy may lag behind or run ahead of the personal copy. Sync deliberately via MR in either direction; never overwrite the repo copy from a personal one without review.
