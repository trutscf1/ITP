# Rebuild drill procedure

The agent procedure behind `/gam-engineering rebuild drill` (module M4 of the concept *Rebuild from documentation* §16 in the skill repository). It proves that the documentation alone is enough to rebuild the project: the rebuild runs in a throwaway copy that holds no old code and no history, built by subagents on the check tier, and ends in one verdict. The steps are *Start*, *Throwaway folder*, *Build in the folder*, *Green check and cleanup*, and *Report and record*.

The drill starts only when the developer runs `/gam-engineering rebuild drill`. No other command, hook, CI job, or local pipeline starts it, and no other procedure names it except as a pointer to this one (RB-F-35). It pushes nothing, opens no merge request, and writes nothing to the issue tracker (RB-NF-3). Every test it runs runs in the test environment of `STACK.md` §6 and §7, never against another store (RB-NF-1); never open a file the project ignores, and never export data from any store.

## Start

Run on the session's own model; the helper run goes to a check-tier subagent ([Models](../../gam-engineering/references/models.md#handoff)). Each stop below gives the verdict `blocked` (RB-F-39): create no folder, no branch, and no commit, run no test, and write nothing.

1. **Git.** If the project folder is not a git repository (`git rev-parse --is-inside-work-tree`), refuse with the words `the rebuild commands need git`, and offer nothing in its place (RB-F-46, RB-E-10, P-GIT-7).
2. **Clean tree.** Run `git status --porcelain`. A tracked file with uncommitted changes, or a file git neither tracks nor ignores, stops the drill: name the files (RB-E-6). Never open or list a file git ignores.
3. **Check first.** Follow [rebuild-check.md](rebuild-check.md) in full and print its table. When one finding is blocking, print the table and stop, naming every blocking document (RB-F-4, RB-E-1).
4. Continue with [Throwaway folder](#throwaway-folder).

## Throwaway folder

Builds the copy the drill works in (RB-F-36, RB-C-1).

1. Run `node gam-engineering/tools/rebuild.mjs plan --integration <integration branch>` (`dev`, or `main` in branch model `trunk`, P-GIT-9) on the check tier. With no rebuild branch, `deletion` lists every tracked file of the integration branch's head that is no keep-list file, and `slices` lists the slices of the `done` stories in build order; keep both for the steps below.
2. Create a new folder `gam-rebuild-drill-<YYYY-MM-DD>-<random>` in the temp folder of the machine, outside the project folder, and in it run `git init`. Add no remote.
3. Take the keep-list files of the integration branch's head — the tracked files that are not in `deletion` — with `git archive <integration branch> -- <those paths> | tar -x -C <folder>`; a submodule path is left out. The folder holds nothing else: no old code, no ignored file, no history of the project.
4. Commit them as the one commit of the folder, with the subject `Keep list of <head> [no-req]`. Check that `git log` shows only that commit and `git remote` prints nothing.
5. Continue with [Build in the folder](#build-in-the-folder).

## Build in the folder

Runs the rebuild of [rebuild.md](rebuild.md) in the folder, with one fresh subagent per part, all on the model tier `env.GAM_ENGINEERING_MODEL_CHECK` (default `haiku`) read from the committed `.claude/settings.json` ([Models](../../gam-engineering/references/models.md#tiers), RB-F-37, RB-C-2).

1. **Probe.** Start the scaffold subagent first. When no subagent can be started on that tier, stop: remove the folder, give the verdict `blocked`, and say why (RB-E-8). There is no fallback; the drill never builds with the main model, unlike the fallback of the *Models* section.
2. **Scaffold.** One fresh subagent writes the stack files and lets the package manager write the lock files in the folder, as [Scaffold](rebuild.md#scaffold) says, and commits them.
3. **Slices.** Then one fresh subagent for each slice of `slices`, in that order, builds that slice as [Build the slices](rebuild.md#build-the-slices) says; before the first slice of a concept it first writes that concept's contract and data tests as [Write the contract and data tests](rebuild.md#write-the-contract-and-data-tests) says (RB-F-33, RB-F-34). The drill runs no cross-check, no deletion commit, and none of the steps for review, merge, or keeping documentation fixes (RB-F-37).
4. **The brief** of each subagent holds pointers, not copies: the folder, the slice row of the concept's §16 and its story, `STACK.md`, and this section. A subagent never asks the developer and changes no document, the concept and `STACK.md` included; where the documents leave a question open, it records the question with the document and section that should answer it and goes on with its best reading (RB-F-38).
5. **Return.** Each subagent returns the questions it recorded (document, section, question) and its test results: the number of tests that ran and the name of each failing test.
6. Continue with [Green check and cleanup](#green-check-and-cleanup).

## Green check and cleanup

1. **Green check.** Run [Green check](rebuild.md#green-check) steps 1 to 3 on the check tier, in the repository of the folder (`git -C <folder>`) (RB-F-37); its steps 5 and 6 do not apply here. Add the number of tests that ran and the name of each failing test to what the subagents returned.
2. **Remove.** Whatever the result, run `git worktree remove --force <checkout>` from the folder and then delete the folder. When either cannot be removed, print the path to remove by hand; the project stays unchanged (RB-E-9).
3. **Verdict.** Write a DrillRun as JSON to a file outside the project (`stop`, left out when the drill was not stopped; `testsRun`; `failingTests`; `questions`, each with `document`, `section`, and `question`), run `node gam-engineering/tools/rebuild.mjs verdict <file>`, and print its word as the line `Verdict: <word>` (RB-F-39). The verdict is the helper's, never the agent's own judgment: `rebuildable` only for no question, at least one test, and no failing test.
4. Continue with [Report and record](#report-and-record).

## Report and record

Runs in the session after the folder is gone, on the head `<head>` of the integration branch that [Throwaway folder](#throwaway-folder) read (RB-AC-5.3, RB-F-40, RB-U-2).

1. **Report.** Print, in plain words, the numbers `<testsRun> tests ran, <m> failed, <n> questions`; one line for each question, `<document> <section>: <what is missing, in one sentence>; fix it there`; and one line for each failing test with its name. When there is neither, say so in one line. End with the line `Verdict: <word>` of [Green check and cleanup](#green-check-and-cleanup).
2. **Blocked ends here.** A `blocked` drill writes no log row, no inbox item, and no branch; the project is unchanged (RB-AC-5.4).
3. **Branch.** Note the current branch, then create `chore/rebuild-drill-<YYYY-MM-DD>` from the integration branch (`-2`, `-3` when the name exists, P-GIT-2). The tree is clean, because *Start* checked it.
4. **Log row.** Insert as the first row of the log table in `ROADMAP-DETAILS.md`: the date, the handle (`—` in solo mode), the task `Rebuild drill of <head, seven characters>`, the outcome `Verdict <verdict>; <n> questions; <m> red tests` followed by the document and section of each question, and `✔`. A drill without questions gets the row too.
5. **Inbox items.** For each question add one line `<date> Rebuild drill question, <document> <section>: <question>` at the top of the open entries of `next.md` (in team mode `gam-ai-knowledge/team/<handle>/next.md`); read the file again right before the edit and change nothing else in it ([Inbox](../../gam-ai-knowledge/SKILL.md#inbox), P-ROAD-3).
6. **Commit.** `git add` only those two files and commit with the subject `Record the rebuild drill of <YYYY-MM-DD>: <verdict> [no-req]`. Check that `git diff --name-only <integration branch>` lists nothing else.
7. **Merge.** Hand the branch to [merge.md](../../gam-delivery/references/merge.md) as a `chore/` branch, without issue and under the merge policy; where the project uses MRs the MR title is `Rebuild drill (<YYYY-MM-DD>): <verdict>`. This is the only thing the drill pushes (RB-NF-3). Afterwards switch back to the branch noted in step 3 when it still exists.
