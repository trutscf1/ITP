# Implement procedure

Loaded by `/engineering-human implement <issue>`. It replaces the generic `/implement` skill, which the model cannot invoke; the procedure is adapted from mattpocock/skills (see README, *Credits*). Run it in a fresh session per issue.

## Before the first change

1. Read the issue. It must carry the story sentence and its acceptance criteria `AC-n.m` (P-TRK-2); if it does not, fix the issue from the concept document first.
2. Read the story file of this issue in `documentation/work-items/<feature>/` (story, acceptance criteria, slices) and the concept document: the requirements that derive from this story, §16 (the slice and its modules), §17 (the tests for this story), and `STACK.md` §4–§6 and §8.
3. Create the work branch from `dev`: `feature/<issue-id>-<slug>` or `fix/<issue-id>-<slug>` (P-GIT-2). Set the issue label `status::in-progress` (on GitLab Free, also remove `status::ready` yourself, since scoped labels are not exclusive there). Record the branch in the position row; for the feature's first issue, set the ROADMAP stage to `in progress` (P-ROAD-4).

## The loop

1. Call the Skill tool with `tdd` and work one acceptance criterion at a time, at the seams agreed in §16 *Design for Testability* (P-DES-2). Test names carry the `AC` and requirement IDs as `STACK.md` §6 prescribes.
2. Run the typecheck and the single test file after every red → green step; run the full suite once at the end.
3. Commit in small steps. Every commit that touches production code names at least one requirement ID in a plain-language subject (`Refuse duplicate question on copy [QE-F-6]`, P-GIT-4).
4. If a question arises that the documents do not answer, stop: it is a documentation defect (manifest Phase 7). Fix the concept document or `STACK.md` in this branch, then resume. Never answer it only in chat.
5. If the behavior changed, update the concept document and, if an affected chapter changed, its Part H in the same branch (P-GIT-5, P-HUM-3).

## Finish

1. Run `node tools/doc-check.mjs`; it must exit with 0 and report no warning that `dev` does not already have. If the documentation changed, also run the semantic steps of the consistency check for this concept; they must report no new finding.
2. Call the Skill tool with `code-review`, fixed point = the merge base with `dev`, under override 5 of SKILL.md.
3. Call the Skill tool with `verification-before-completion` under override 7 of SKILL.md: run the full suite and `node tools/doc-check.mjs` again, and map every acceptance criterion of the issue to a test of this run that carries its `AC` ID and passes. A criterion without such a test is not done; go back to the loop.
4. Push and open the MR into `dev` with the MR template (P-MR-1): plain-language title with story ID, `Closes #<issue>`, what changes for the user, tested functions, consistency-check result. Include the status for the state after the merge (P-ROAD-4) and check it before pushing with `node tools/doc-check.mjs --status --pending-title "<MR title>" --pending-branch <branch>`, as the CI will; then set `status::review`.
5. Continue with the merge step of SKILL.md for this MR.
