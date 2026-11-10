# Rebuild procedure

The agent procedure behind `/gam-engineering rebuild` (module M3 of the concept *Rebuild from documentation* §16 in the skill repository). This file holds the steps built so far: *Start*, *Write the contract and data tests*, *Cross-check against the old code*, *Deletion*, *Scaffold*, *Build the slices*, *Ask a gap question*, *Green check*, and *Continue*. *Continue* resumes a rebuild in a new session. *Review and merge* hands a green rebuild to `review` and `merge`, and *Keep the documentation fixes* offers the gap answers of a red or abandoned rebuild to the integration branch (S1.4).

Every test this procedure writes or runs runs in the test environment of the project's `STACK.md` §6 and §7, never against another store (RB-NF-1). Never open a file the project ignores, such as `.env` or a store file, and never export data from any store.

## Start

Run on the judge tier; the helper run and every suite run go to a check-tier subagent ([Models](../../gam-engineering/references/models.md#handoff)).

1. **Git.** If the project folder is not a git repository (`git rev-parse --is-inside-work-tree`), refuse with the words `the rebuild commands need git`, create nothing, and offer nothing in its place (RB-F-46, RB-E-10, P-GIT-7).
2. **Clean tree.** Run `git status --porcelain`. A tracked file with uncommitted changes, or a file git neither tracks nor ignores, stops the rebuild: name the files, create nothing (RB-F-2, RB-E-6). Never open or list a file git ignores.
3. **Unmerged branch.** Look for a started rebuild with `git branch --list "rebuild/*" --no-merged <integration branch> --format="%(refname:short)"` (`dev`, or `main` in branch model `trunk`, P-GIT-9). When it prints a name, or the current branch is a `rebuild/` branch, follow [Continue](#continue) and nothing below (RB-F-41).
4. **Check first.** Follow [rebuild-check.md](rebuild-check.md) in full, helper and judged rules, and print its table. When one finding is blocking, print the table and stop: no branch, no folder, and no commit is created, and the report names every blocking document (RB-F-4, RB-E-1). Nothing below runs.
5. **Branch.** Read the integration branch (`dev`, or `main` in branch model `trunk`, P-GIT-9) and create `rebuild/<YYYY-MM-DD>` from its head with `git switch -c`; when that name exists and is merged, use `rebuild/<YYYY-MM-DD>-2`, `-3`, … (RB-F-3, RB-E-4). The head the branch starts from is the recorded head: it is the parent of the first commit.
6. **Tests.** Follow [Write the contract and data tests](#write-the-contract-and-data-tests) and commit exactly the files it returns as `Add the contract and data tests [no-req]` (RB-F-3).
7. Continue with [Cross-check against the old code](#cross-check-against-the-old-code).

## Write the contract and data tests

Called at the start of a rebuild, before any code is deleted, and again by the drill (RB-F-33, RB-F-34). The tests are the proof that a rebuilt project still serves its clients and reads its stored data, so they are written from the documents and the invented sample data alone, never from the old code.

1. Read the concept of every rebuilt story (a story that is `done`; a `ready` or `backlog` story is left out, RB-F-5), `STACK.md` §6 for the test layout, naming, and seams, §7 for the test configuration, and §11 for the migration files and the migration state. The tests reach the code only through the seams that §6 and the concept's §16 name: opening a test store, running the migrations, loading a dump, and starting the code. When the documents do not name one of them, that is a documentation gap: fix `STACK.md` first, then write the test.
2. **Data test.** For every such concept with a *Persisted layout* (RB-F-33), write one test that:
   - brings an empty test store to the migration state of `STACK.md` §11 by running the migration files that §11 names as they are; a rebuild never rewrites or renumbers them (RB-F-14);
   - checks that `migrationState` of each golden dump in `test-data/<feature>/` equals that state, and stops if it does not: the documents disagree, which is a documentation defect to fix first;
   - loads each golden dump with the physical names of `STACK.md` §11 and the stored field names of the *Persisted layout*, and starts the code;
   - checks that no further migration ran (the migration seam, run once more, applies nothing), and reads every record back with the values the dump holds, through the `in` contracts of §11 that expose it; a field no contract exposes is read through the module seams of §16 by the rebuilt code only.
3. **Contract test.** For every row of *External contracts* (RB-F-34), write one test that replays the example named in its *Example* cell in the format of [test-data/README.md](../../gam-ai-knowledge/templates/test-data/README.md) for its direction, and compares the result with the example field by field, ignoring only the fields the example marks `<any>`:
   - `in`: send the request, compare status, headers, and body with `response`;
   - `config`: set the keys of `set` in the test environment, then as `in`;
   - `out`, a call: perform `trigger`, compare the call the code makes with `expectedCall`, and answer it with a test double that returns `reply`;
   - `out`, a file: perform `trigger` and compare the written file with the `.expected` file next to the example.
4. Name each test so that it carries the contract title or the dump file and, where a requirement of the concept demands it, that requirement's ID, in the naming of `STACK.md` §6. Put the files where §6 puts contract tests.
5. A contract row without an example, or a layout without a dump, is a blocking finding of the completeness check and cannot reach this step; if one does, stop and name it.
6. Return the list of test files. The caller commits them; the first rebuild commit is `Add the contract and data tests [no-req]`.
7. Run the new tests only in the cross-check against the old code (RB-F-42), which is a later step of this procedure; here they are written, not yet judged.

## Cross-check against the old code

Proves the tests and the documents against the code that still exists, before anything is deleted (RB-F-42). The fix for a red test is always the documentation or the sample data, never the old code.

1. **Fresh checkout.** From the project root run `git worktree add --detach <temp folder>/gam-rebuild-check-<date> <first commit>`; the checkout has the tracked files of the recorded head and the new tests, and none of the ignored files (RB-C-3). Install the dependencies in it only with the install command `STACK.md` §8 lists, if it lists one.
2. **Run.** In the checkout run only the tests of the first commit, with the test command of `STACK.md` §8, in the test environment of §6 and §7: a store in memory or a throwaway one, no environment file, no other store (RB-NF-1). Collect the result per test.
3. **Remove.** Whatever the result, run `git worktree remove --force <checkout>`; when it fails, report its path to remove by hand and go on (RB-E-9).
4. **On a red test.** Switch back to the integration branch, delete the branch with `git branch -D rebuild/<date>`, and stop (RB-E-11). Check `git worktree list` shows only the project folder, the integration branch has its former head, and `git status --porcelain` is empty. The report names each failing test with the contract or dump it covers, the field or value it expected, and the field or value the code gave, and says in one sentence what differs, for example that the example or the `External contracts` row names `title` where the code answers `name`, and that the fix is the documentation or the sample, never the old code (RB-U-2).
5. **On green.** Continue with [Deletion](#deletion).

## Deletion

Removes the code tree, so that the rebuild starts from the documents alone (RB-F-1, RB-F-2, RB-F-3).

1. Run `node gam-engineering/tools/rebuild.mjs plan --integration <integration branch>` on the check tier and take `deletion` from its output: the tracked files of the recorded head that are no keep-list file and not a file the test commit added. `next` still reads `cross-check` here, because a passed cross-check leaves no commit; ignore it.
2. Run `git rm -q -- <the paths of deletion>`, and nothing else: no ignored file is touched, listed, or opened, so `.env` and the store files stay in the working folder (RB-F-2, RB-NF-1).
3. Check `git status --porcelain`: only the staged deletions of step 2, no other change. Commit with the subject `Remove the code before the rebuild [no-req]` and nothing else in it (RB-F-3).
4. Continue with [Scaffold](#scaffold).

## Scaffold

Writes the stack files before the first slice (RB-F-6).

1. Read `STACK.md` §1 for the package manager and §4 for the *Stack files* table. Write every file of that table at its path with the content its row records, and no other file; a row that does not record a content in full is a documentation gap ([Ask a gap question](#ask-a-gap-question)).
2. Let the package manager of §1 write the lock files: the install command `STACK.md` §8 lists (only its install line, not the test or start lines), or, where it lists none, the manager's command that writes only the lock file. Run it in the test environment; the lock files are generated, never written by hand.
3. Commit the stack files and the lock files with the subject `Set up the stack from STACK.md [no-req]`.
4. Continue with [Build the slices](#build-the-slices).

## Build the slices

Before each slice, and after a compaction, apply [Recovery](../../gam-engineering/references/models.md#recovery-after-a-compaction-or-a-new-session): re-read this file and take the state from `plan`, `git log`, `git status`, and the chat export (`docs/prompts/`).

Builds every slice of the stories that are `done`, concept by concept (RB-F-5, RB-F-7, RB-F-8). Build a slice on the draft tier by work handoff ([Models](../../gam-engineering/references/models.md#handoff)); the subagent never asks a pop-up, so a gap goes back to the session.

1. Run `plan` as in [Deletion](#deletion): `slices` lists the slices in build order, and `built` is `false` for those still missing. A story that is `ready` or `backlog` has no slice in the list and gets none.
2. For each slice with `built: false`, in that order: read its row in the concept's §16, the module specifications it names, the acceptance criteria of its story, the §17 tests that cover them, and `STACK.md` §4–§8 (and §11 when the slice touches stored data). The old code stays unread: it is history at the recorded head, and what the documents leave open is a gap.
3. Build the slice test-first with the Skill tool, `gam-v-tdd`, one acceptance criterion at a time, at the seams of the concept's §16 *Design for Testability* and `STACK.md` §6, which count as agreed; a subagent that cannot ask relies on them. Test names carry the acceptance criterion and requirement IDs as `STACK.md` §6 prescribes; the tests run in the test environment of §6 and §7, never against another store (RB-NF-1). The migration files of `STACK.md` §11 are used as they are, never rewritten (RB-F-14).
4. Commit in small steps. Every commit names at least one requirement ID of the slice and ends its subject with the slice ID in parentheses, for example `Refuse a duplicate title [QE-F-2] (S1.1)`; several IDs go in one bracket, `[QE-F-1, QE-F-2]` (RB-F-8, P-GIT-4).
5. When a question arises that the documents do not answer, stop and follow [Ask a gap question](#ask-a-gap-question) before the next commit of the slice.
6. Run `plan` again: the slice must read `built: true` (`deletion` keeps listing the paths of the old tree; ignore it). After the last slice `next` reads `green`; continue with [Green check](#green-check).

## Ask a gap question

For a question the documents do not answer (RB-F-12, RB-U-1). The question is a documentation defect, so the answer goes into the documents, and the build goes on only afterwards. A gap is a rule a client or the stored data can observe (a refusal, a status, a stored field, how applied migrations are recorded); the internal shape of the code (names, parameters, helper tables) is the builder's choice and no gap.

1. Stop the slice. Read how the code of the recorded head behaves, in tracked files only: `git show <recorded head>:<path>` or `git grep -n <term> <recorded head> -- <paths>`.
2. Ask one pop-up (`AskUserQuestion`, numbered `Q<n>`, in the format of [Asking the developer](../../gam-engineering/SKILL.md#asking-the-developer)). The first option, marked `(Recommended)`, is the behaviour of the old code, worded as a rule, for example "Refuse an empty title".
3. Write the answer into the document that owns it: the concept for behaviour, `STACK.md` for a stack file or a seam. The round is recorded by the AI chat export (P-GRILL-2), numbered with `prompt-export.mjs next-q`. Commit the document in one commit of its own, with a plain-language subject ending `[no-req]`, for example `Document that a title may not be empty in quiz-editor.md [no-req]`.
4. Continue the slice. Its first commit that uses the answer comes after this commit. The documentation-fix commits stay on the branch (RB-F-13).

## Green check

Proves the rebuilt code in a fresh checkout (RB-F-9, RB-C-3). Run the checkout and the commands on the check tier.

1. **Fresh checkout.** `git worktree add --detach <temp folder>/gam-rebuild-green-<date> HEAD`: the tracked files of the branch head and no ignored file. Install the dependencies in it only with the install command `STACK.md` §8 lists.
2. **Run.** In the checkout, in the test environment of §6 and §7, run the build command and the test command of `STACK.md` §8 (a build command that §8 says does not exist is skipped). Both must exit with 0. Collect the result per test.
3. **Judge.** The check is green only when all three hold: every §17 test that covers a rebuilt story passes; every contract and data test of the first commit passes; every acceptance criterion of every rebuilt story has at least one passing test whose name carries its ID. Name each failing test and each criterion without a passing test.
4. **Remove.** Whatever the result, run `git worktree remove --force <checkout>`; when it fails, report its path to remove by hand and go on (RB-E-9).
5. **On green.** Print the slices built, the number of passing tests per story, and the contract and data tests on a line of their own, then continue with [Review and merge](#review-and-merge) (RB-F-10).
6. **On red.** Print each failing test with the criterion or contract it covers, open no merge request, keep the `rebuild/` branch, end with the line `Green check failed; the branch rebuild/<date> is kept.` (RB-E-5), and continue with [Keep the documentation fixes](#keep-the-documentation-fixes).

## Review and merge

A green rebuild reaches the integration branch only through `/gam-engineering review` and `/gam-engineering merge` (RB-F-10). Neither takes an issue: the green check above stands in for the acceptance criteria of an issue (RB-F-9), and every issue and story-status step is skipped. The rebuild creates, closes, and changes no issue.

1. **Merge request.** Where the project uses merge requests (the tracker file `gam-engineering/agents/issue-tracker.md` names the host), push the branch and open one MR into the integration branch titled `Rebuild from documentation (<YYYY-MM-DD>)`, with no story ID and no `Closes #`. The description holds the MR template of P-MR-1, the result of the [Green check](#green-check), the slices built, and the recorded head from `plan` (`recordedHead`), saying that the merge is wrong once the integration branch moved beyond it (RB-F-11). Where the project merges locally (ADR-0002), no MR is opened.
2. **Review.** Follow [review.md](../../gam-delivery/references/review.md) for the `rebuild/` branch; its acceptance criteria are the green check, and the recorded review is clean only when that check is green.
3. **Merge.** Follow [merge.md](../../gam-delivery/references/merge.md) for the branch; it runs the frozen check against the recorded head first, then the merge policy.
4. End with the line `Rebuild branch rebuild/<date> handed to review and merge.`

## Keep the documentation fixes

The gap answers of [Ask a gap question](#ask-a-gap-question) are the lasting value of a rebuild that ended red or is given up (RB-F-13, RB-E-5).

1. List the commits of the branch that changed only documents of `gam-ai-knowledge/` after the first commit: `git log --reverse --format="%h %s" <recorded head>..HEAD -- gam-ai-knowledge`, keeping those whose subject ends `[no-req]` and which no code file touches. Without such a commit, offer nothing.
2. Ask one pop-up (`Q<n>`, [Asking the developer](../../gam-engineering/SKILL.md#asking-the-developer)): bring these commits to the integration branch on `chore/rebuild-doc-fixes-<YYYY-MM-DD>`? Options: **Yes** (recommended), **No**.
3. On yes, create `chore/rebuild-doc-fixes-<YYYY-MM-DD>` from the integration branch, `git cherry-pick` exactly those commits in order, and hand the branch to [merge.md](../../gam-delivery/references/merge.md) as a `chore/` branch (no issue, RB-F-10). The `rebuild/` branch is kept.

## Continue

Resumes a rebuild that an earlier session left on an unmerged `rebuild/` branch (RB-F-41). The state is read from the branch alone, and the `git status --porcelain` rule of [Start](#start) has already stopped a dirty tree (RB-E-6).

1. **Branch.** When [Start](#start) printed more than one name, ask which one as a `Q<n>` pop-up, the newest first and `(Recommended)`. Run `git switch <branch>` unless it is the current branch. Create no new branch (RB-AC-1.7).
2. **Plan.** Run `node gam-engineering/tools/rebuild.mjs plan --integration <integration branch>` on the check tier. `recordedHead` is the parent of the branch's first commit, and `next` says where to go on.
3. **Skip.** The completeness check of [rebuild-check.md](rebuild-check.md) does not run again, and a fresh checkout for the cross-check is made only when `next` is `cross-check` (RB-F-4, RB-F-41).
4. **Resume** at the first missing step, in this order:
   - `cross-check`: [Cross-check against the old code](#cross-check-against-the-old-code), from its step 1, with the first commit of the branch;
   - `deletion`: [Deletion](#deletion);
   - `scaffold`: [Scaffold](#scaffold);
   - `slice`: [Build the slices](#build-the-slices), which builds the slices with `built: false` and leaves the built ones alone;
   - `green`: [Green check](#green-check).
5. From there the procedure ends as it does for a new rebuild.
