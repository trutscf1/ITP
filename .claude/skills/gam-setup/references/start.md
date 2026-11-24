# Start basis

Loaded by `/gam-engineering start` (skill `gam-setup`) and by step 0 of [New project setup](setup.md) (P-GOAL-4). It asks what the project starts from, reads that basis, and hands the goal question a summary; in a project that already has `gam-ai-knowledge/GOAL.md`, it reads the basis again and compares. One text for both callers.

## Steps

1. **Detect the signs (read-only).** Look for the foreign signs of [detect.md](../../gam-engineering/references/detect.md), row 3 (Q546), and for program code. Code or any foreign sign preselects **Existing project**; a PDF, DOCX, or Markdown file whose name or first heading reads as an application or specification (*Projektantrag*, *Pflichtenheft*, *Lastenheft*, *Specification*, *Aufgabenstellung*) preselects **Requirements document**; nothing preselects **Only an idea**.
2. **Ask the basis** as one `Q<n>` ([Asking the developer](../../gam-engineering/SKILL.md#asking-the-developer)), the preselected option first and recommended, the detected signs named in its description:
   - **Requirements document** — a project application, specification, or assignment; its path or link goes into *Other* or a follow-up `Q<n>` when no file was found.
   - **Existing project** — code and/or the project's own documents.
   - **Only an idea** — nothing written yet.
3. **Read the basis.** The reading is a work handoff to a subagent of the draft tier ([Models](../../gam-engineering/references/models.md#handoff), P-WS-7); its brief names the files and asks for the five lines of the summary (purpose, users, scope, stack, open points, "unknown" where the basis says nothing). The session judges the summary before it is used.
   - **Requirements document:** copy the original to `gam-ai-knowledge/sources/` unchanged. A file that is not Markdown gets a Markdown version beside it (`<name>.md`), made with the session's document skills (`anthropic-skills:pdf`, `anthropic-skills:docx`) or by reading; when no text can be extracted, keep only the original and say so in `START.md` (Q547). `doc-check` never checks `sources/`.
   - **Existing project:** summarize code and documents; nothing is copied here. Moving the project's own documents is the adoption of step 6.
   - **Only an idea:** no summary; the goal question starts empty.
4. **Hand on or compare.**
   - Without `GOAL.md` (setup step 0): the summary goes to the goal question of [gam-ai-knowledge: Init](../../gam-ai-knowledge/references/init.md) as the source of the proposed `G-1`, target users, success signals, and non-goals.
   - With `GOAL.md`: run [Comparison](#comparison) instead, and skip step 6 unless foreign signs remain.
5. **Write `gam-ai-knowledge/START.md`** from [the template](../../gam-ai-knowledge/templates/START.md) (after init has created the folder): basis, sources, summary, and as *Derived* every proposal the summary yields — a `STACK.md` §0/§1 value, a `CONTEXT.md` term, a `ROADMAP.md` row, an inbox entry. Each proposal is offered in the setup's next rounds and written only when accepted; `START.md` only links it (one home per fact). A requirements document may name people (a student project application names its students): `START.md` and the setup summary say that the school management decides whether it may stand in a public repo (G-1.N3), as for the AI chat export.
6. **Adopt a foreign project.** When step 1 found foreign signs other than code, run [Foreign project](migrate-foreign.md) in the same change, after the goal question (Q545); it writes the one ADR. Code alone needs no adoption.
7. **Choose the next step** (Q542) and write it with its reason to *Next step*:
   - Without git, or without `gam-engineering/agents/issue-tracker.md` (no tracker, so no map): **grill**.
   - Otherwise one breadth-first round over the open decisions the summary and the goal leave: when they fit one session, **grill** the first one; otherwise **wayfind** the effort ([Wayfinding](../../gam-explore/references/wayfind.md)), as detect row 9 does for an inbox item.

   The summary of setup (or of this command) names the next step as the command to run.

## Comparison

Run by `/gam-engineering start` in a project with `GOAL.md` (Q543). Read the basis again (step 3; for a requirements document the copy in `sources/`, or a newer file the developer names, which is copied beside it), then compare it with `G-1` and its success signals and non-goals, the rows of `ROADMAP.md`, and the inbox. Report one table *source statement — gam document — difference — proposal*. A difference that touches `G-1` is proposed only as an ADR followed by the re-check of P-GOAL-3, never as a direct edit of `GOAL.md`; the other proposals (a ROADMAP row, an inbox entry) are offered as a `Q<n>` with `multiSelect`. Without `START.md`, the first run writes it (step 5) with the basis asked in step 2. Every run appends one dated row to *Comparisons*. The change ships like any other (P-GIT-2).
