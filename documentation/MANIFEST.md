# Concept Document Authoring Manifest

**How this project builds software from concept documents — and why.**

This is the skill-bound edition of the manifest: every phase names the installed skill that executes it. Process mechanics live in those skills; standing personal conventions live in the `engineering-profile` skill's `PROFILE.md`; this document owns only what neither covers — the documentation model, the quality bar, the phase gates, and the stack-neutrality rules. Nothing is stated in two places.

---

## Why This Document Exists

The project builds software AI-first. That is not a slogan — it is an architectural decision with a concrete consequence:

**The concept documents are the source of truth. The code is a derivative.**

In a traditional software company, documentation describes what was built. Here, documentation prescribes what will be synthesized. The markdown files in `documentation/` are the specification from which an AI agent can regenerate the complete software stack: modules, interfaces, tests, and deployment configuration.

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

`documentation/` contains two groups of files.

**Specification documents** — what the system does and what it is built with:

| File | Job | Stack-specific? |
| --- | --- | --- |
| `MANIFEST.md` (this file) | How to write and maintain the other documents | No |
| `CONTEXT.md` | Ubiquitous language: the shared glossary all documents, code, and agents use (format and upkeep: `/domain-modeling` skill). In this repo it lives at the repo root (P-DOC-3, `docs/agents/domain.md`). | No |
| `concepts/<feature>.md` | One concept document per feature: requirements, architecture, test concept | **Never** |
| `STACK.md` | The single technology-mapping document: languages, frameworks, versions, commands | **Only here** |

**Process documents** — how work flows around the specifications. Their conventions are the engineering profile's standing decisions (IDs in parentheses); the files bind them to this repo:

| File | Job |
| --- | --- |
| `WORKFLOW.md` | Binds manifest artifacts to this repo's git host and tracker: issue per slice, branch/commit/MR rules, Definition of Done (P-GIT-1…6, P-DOC-4) |
| `ROADMAP.md` | Ordered backlog of pre-concept feature intentions with feasibility (P-ROAD-1) |
| `ROADMAP-DETAILS.md` | Single status location: session positions + processed-task log (P-ROAD-2) |
| `next.md` | Task inbox (P-ROAD-3) |
| `VERSIONING.md` | SemVer binding for this project (P-VER-1…3) |

The separation inside the specification group is the point:

* **Concept documents** define *what the system does* — behavior, data, logic, interfaces, tests — in stack-neutral terms. They must remain valid unchanged if the project is rebuilt on a different stack.
* **`STACK.md`** defines *what the system is built with* — and how neutral concepts map onto that technology.
* **Synthesis** always consumes both.

> **Portability test**: Delete `STACK.md`, write a new one for a different stack, and hand the documentation set to an agent. If anything else in `documentation/` must change for the port to work, stack details have leaked into a concept document. Fix the leak.

---

## Skill Bindings — the single-source rules

The installed engineering skills execute the phases. To keep every rule in exactly one place:

| Concern | Single source | Consequence |
| --- | --- | --- |
| Interview mechanics (rounds, one question at a time, explore-instead-of-ask) | `/grilling` (via `/grill-with-docs`) | Not restated here |
| Glossary format, ADR criteria and format | `/domain-modeling` | Not restated here |
| Design vocabulary (module, interface, seam, depth, adapter, leverage, locality) | `/codebase-design` | Architecture chapters use these terms exactly |
| TDD loop rules, what a good test is, seam discipline | `/tdd` | Not restated here |
| Review axes (Standards + Spec) and smell baseline | `/code-review` | Not restated here |
| Ticket cutting, tracer-bullet rules, ticket templates, expand–contract for wide refactors | `/to-tickets` | Not restated here |
| Issue tracker, triage labels, domain-doc layout for this repo | `docs/agents/*.md`, written by `/setup-matt-pocock-skills` | Skills read these, humans edit them |
| Standing personal conventions (git flow, versioning, roadmap files, working style) | `engineering-profile` skill, `PROFILE.md` | This repo's process documents bind them by ID |
| What the system does | `concepts/<feature>.md` | Never answered in chat, code comments, or tickets |
| What it is built with | `STACK.md` | Never named in a concept document |
| Current implementation status | `ROADMAP-DETAILS.md` | Other documents link, never copy |

**Deliberately unused skills, and why:**

* **`/to-spec`** — not used. The concept document *is* the spec; generating a second spec from conversation would create a competing source of truth. `/to-tickets` reads the concept document's §15 slice breakdown directly.
* **`/grill-me`** — not used inside a repo. `/grill-with-docs` runs the same interview and leaves the paper trail (`CONTEXT.md`, ADRs) this process depends on.

**Situational skills** (outside the phase sequence): `/triage` for raw incoming issues and external PRs (never for tickets `/to-tickets` produced), `/diagnosing-bugs` for hard bugs, `/resolving-merge-conflicts` mid-conflict, `/research` for reading legwork, `/prototype` for runnable design questions, `/wizard` for steps only a human can perform, `/wayfinder` for efforts too big and foggy for one session (see Phase 1).

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
2. **A worked example for every non-trivial rule**, with real values; edge cases get their own examples. Examples are normative: if prose and example conflict, that is a defect to fix.
3. **Normative language.** MUST / MUST NOT / MAY, with values. Every quantifier gets a number: "files up to 50 MB," "p95 within 2 s," "3 retries at 1 s, 2 s, 4 s."
4. **Named error conditions.** Every failure mode gets an ID (`E-1`, …), its trigger, and the required behavior. "Smart" behavior (LLM calls, heuristics) always specifies its deterministic fallback.
5. **Bounded context.** Each concept document is implementable on its own; cross-references name the exact file and section, never "see above."
6. **Explicit sequencing.** Where order matters, it is a numbered list, not prose.

> **Litmus test**: Hand the documentation set to the *cheapest* model that can write code. If its implementation fails the test suite, the document is not ready — regardless of whether a smarter model would have succeeded.

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
* **Process**: prototype → stop coding → extract the concept document (requirements reverse-engineered, architecture as-built, test concept from what you learned). **De-stack while extracting**: translate library calls and framework idioms into neutral behavior and `C-x` requirements. Then review the extracted document through Phases 1–8 as a draft — retrofitted documents fail the Portability Test and the Simple-LLM Bar more often than frontloaded ones. Finally refactor the code to the cleaned-up concept, or re-synthesize.
* **Risk**: the retrofit never happens and the prototype becomes production code. **A prototype without a concept document is technical debt with no repayment plan.**

> **The rule**: every module that ships to production has a concept document, regardless of path.

---

## The Synthesis Contract

A concept document is **synthesis-ready** when it satisfies all of the following:

### Ubiquitous Language
* Every domain term used is defined in `CONTEXT.md` or defined inline and then promoted there; names in documents and code follow it.

### Completeness
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
* Every requirement maps to ≥ 1 module and ≥ 1 test; every module traces to ≥ 1 requirement; every `C-x` is mapped in `STACK.md`. No orphans.

### Falsifiability
* Every requirement is testable — otherwise it is a wish, not a requirement. Worked examples double as acceptance tests: each example's input/output pair appears in the test concept.

### Stack Neutrality
* Passes the Portability Test; no library, framework, or language name anywhere; neutral types and dialect-free pseudocode only.

---

## The Phases

### Phase 0 — Repo setup (once)

Run `/setup-matt-pocock-skills`: it configures the issue tracker, triage labels, and domain-doc layout that every other skill reads from `docs/agents/*.md`. Create the process documents (`WORKFLOW.md`, `ROADMAP.md`, `ROADMAP-DETAILS.md`, `next.md`, `VERSIONING.md`) per the profile's P-GIT / P-ROAD / P-VER decisions.

### Phase 1 — Grill the draft

Run **`/grill-with-docs`** on whatever exists (loose notes, a roadmap entry, a half-finished doc). It drives the `/grilling` interview and maintains `CONTEXT.md` and ADRs via `/domain-modeling` as decisions land.

Manifest-specific rules on top of the skill:

* **Consult the engineering profile first.** Before the first question, read the `engineering-profile` skill's `PROFILE.md`, state the applied standing decisions by ID, and ask only what is new about this feature. Re-asking a profile-answered question is a defect.
* **Requirements first, solutions later.** Push back if the interview drifts to code — and equally hard if it drifts to technology ("we could use X library"). Stack talk is deferred to `STACK.md`, always.
* Separate functional, non-functional, and user-interaction requirements; **number everything** (`F-1`, `NF-1`, `U-1`) with the document prefix per P-DOC-4.
* Capture open questions as numbered items (`Q1`, `Q2`, …).
* **Too big for one session?** If the effort is a fog-wrapped, multi-session endeavor, chart it with **`/wayfinder`** first. Its decision tickets resolve into exactly the material Phases 1–2 need; when the map is clear, return here and continue — wayfinder plans, it does not build.

### Phase 2 — Resolve open questions & sharpen terminology

Answer the open questions from Phase 1, batched by theme, as crisp one-line decisions. Delegate reading legwork to **`/research`** subagents (primary sources, cited findings file in the repo). `/domain-modeling` keeps `CONTEXT.md` and ADRs current as answers land.

* If research surfaces a technology constraint (an external API's actual behavior), capture the *behavior* as a requirement or `C-x` in the concept doc and the *technology* in `STACK.md`.
* Newly discovered requirements get appended (`F-45`, `F-46`, …); resolved questions move into a "Resolved Questions" table with their reasoning.
* If a question needs a *runnable* answer (state model, business logic, a UI you have to see), detour through **`/prototype`** and fold the verdict back in.

### Phase 3 — Check artifact interactions

Before architecture, scan the existing system for interferences: for each existing artifact type your feature touches, document **Interaction** (how the feature uses it), **Interference** (how it might break or conflict with it), and **Schema extensions** (what must change, backward-compatibly). This phase typically discovers 3–5 new requirements. No skill covers this — it is manifest work.

### Phase 4 — PM review gate

**Stop. The product manager reads the document** — requirements, resolved questions, artifact interactions, schema extensions; no architecture yet. Do not proceed without sign-off. Small fixes go into the doc; large changes restart Phase 1.

### Phase 5 — Architecture & vertical slices

Add the architecture chapter, written in the **`/codebase-design`** vocabulary — design deep modules per P-DES-1: much behavior behind small interfaces at the fewest, highest seams.

* One module = one responsibility (`STACK.md` decides how modules map to files/classes/packages).
* Every module lists `Traces to: F-x, NF-y` and `Requires: C-x`.
* **Mandatory artifacts**: module tree; class/method signatures in dialect-free pseudocode with neutral types; a mermaid flowchart; an inter-module interface table with named `E-x` conditions; a state machine diagram; a design-for-testability section naming the seams tests will use (pre-agreed per `/tdd`).
* Break the architecture into **vertical slices** sized for one fresh context window each — the slice rules are `/to-tickets`' tracer-bullet rules, applied on paper here and cut into tickets in Phase 7.
* End with a traceability matrix (every F/NF/U → module(s); no orphans) and update `STACK.md`: every new `C-x` mapped with version constraints.

### Phase 6 — Test concept & TDD contract

Add the test concept as the final documentation chapter, structured so an agent can run a red-green loop one slice at a time:

* Unit test tables per module (input → expected → requirement), values taken from the document's worked examples (§9).
* Integration tests as end-to-end given/when/then scenarios with synthetic documents.
* **CI constraint**: no LLM calls, no network; external capabilities mocked at the capability boundary; fast enough to run before every deployment.
* **Synthetic test data**: template + variation approach; golden outputs as stack-neutral data files, versioned in the repo.
* **Coverage matrix**: every requirement → at least one test; untested requirements explicitly justified.

### Phase 7 — Synthesize via tickets and TDD

The concept document is the spec — `/to-spec` is not run (see Skill Bindings).

1. **`/to-tickets`** cuts the §15 slice breakdown into tickets on the configured tracker, blocking edges included. Ticket acceptance criteria are copied or linked from the §16 test tables — never re-invented in different words.
2. Per ticket, in a fresh context window: **`/implement`** — it drives `/tdd` internally (red → green, one slice at a time) and closes with `/code-review` before committing per the P-GIT rules (requirement IDs in every commit, doc sync in the same MR).
3. **If the agent gets stuck or asks a question during synthesis, that is a documentation defect**: answer it in the concept document or `STACK.md` first, then resume. Never answer only in chat.

### Phase 8 — Architectural rescue

AI-driven development accelerates software entropy; periodically run a maintenance pass:

* **`/improve-codebase-architecture`** surfaces deepening opportunities; a picked candidate becomes an idea that re-enters at Phase 1.
* Additionally sweep for what the skill doesn't know about: **concept drift** (code and concept document disagree — repaired in the document first, then the code, never the other way around silently) and **stack leaks** (technology names in concept documents — moved to `STACK.md`).
* Bugs found along the way follow `/diagnosing-bugs`; its post-mortem hands back to `/improve-codebase-architecture` when the real finding is a missing seam.

---

## The Stack Document (`STACK.md`)

The single place where technology lives. Rebuilding on a different stack means rewriting this one file.

```markdown
# Stack Document

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
| Jump to architecture before requirements are stable | Complete Phases 1–4 first |
| Re-ask a question the engineering profile answers | Read `PROFILE.md`, state applied decisions by ID |
| Run `/to-spec` on a concept-document feature | The concept document is the spec; `/to-tickets` reads its §15 |
| Improvise a workflow an installed skill owns | Load the skill (P-WS-5); the routing lives in Skill Bindings |
| Write requirements as prose paragraphs | Numbered tables (`F-1`, `NF-1`, `U-1`) |
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
| Copy status into README/CONTEXT/ROADMAP | Link to `ROADMAP-DETAILS.md` (P-ROAD-2) |

---

## Concept Document Structure Template

```markdown
# [Feature] Concept — Consolidated Requirements

## 0. Synthesis Context
    ### Development Path (A: Frontloaded / B: Retrofitted)
    ### Synthesis Dependencies (other concept docs this feature requires, by filename)
    ### Synthesis Scope (what can be regenerated from this doc alone)
## 1. Purpose
## 2. Ubiquitous Language & Context (terms used here; each defined in CONTEXT.md or inline)
## 3. Functional Requirements (F-1 … F-N — normative language, concrete values)
## 4. User Interaction Requirements (U-1 … U-N)
## 5. Non-Functional Requirements (NF-1 … NF-N — every quantifier has a number)
## 6. Capability Requirements (C-1 … C-N — external capabilities with acceptance criteria; no library names)
## 7. Data Model (record types in the neutral type system; field-level constraints)
## 8. Error Conditions (E-1 … E-N — trigger → required behavior → fallback)
## 9. Worked Examples (concrete input → output pairs for every non-trivial rule; normative)
## 10. Integration Points
## 11. Out of Scope
## 12. Resolved Questions & ADRs (Q1 … QN → Decision / Rationale)
## 13. Artifact Interactions & Interferences
## 14. Schema Extensions
## 15. Architecture & Vertical Slices
    ### Module Overview & Tree
    ### Vertical Slices Breakdown
    ### Module Specifications (dialect-free pseudocode, neutral types; Traces to: F-x / Requires: C-x)
    ### Pipeline Flow (mermaid flowchart)
    ### Inter-Module Interfaces Table (inputs, outputs, error conditions E-x)
    ### State Machine Diagram (mermaid)
    ### Design for Testability (the pre-agreed seams, per /tdd)
    ### Requirement Traceability Matrix
## 16. Test Concept & TDD Contract
    ### Unit Tests & Test Case Tables (per module: input → expected → requirement; values from §9)
    ### Integration Tests (E2E scenarios as given/when/then tables)
    ### Synthetic Test Data Strategy (templates, variations, golden outputs as stack-neutral data files)
    ### CI Test Constraints (mock at capability boundaries, no network, no LLM calls)
    ### Test Coverage Matrix & Untested Justifications
```
