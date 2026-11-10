# Rebuild check procedure

The agent procedure behind `/gam-engineering rebuild check` (module M2 of the concept *Rebuild from documentation* §16 in the skill repository). It answers one question: does anything in the documentation still stop the code from being deleted and rebuilt from it? It changes no file, makes no commit, and connects to no data store (RB-F-24, RB-NF-1).

This file holds the rules the mechanical helper decides and the rules the agent judges by reading: contracts and layout, the migration state, the content of stack files, and the behaviour of the code that no requirement describes.

The check starts only when the developer runs `/gam-engineering rebuild check`, or as the first step of `rebuild` and `rebuild drill` (RB-F-45). No script, hook, CI job, or other procedure starts it, and no other procedure names the command except as a pointer to this one.

## Steps

1. **Git.** If the project folder is not a git repository (`git rev-parse --is-inside-work-tree`), refuse with the words `the rebuild commands need git`, print no report, and offer nothing in its place (RB-F-46, RB-E-10, P-GIT-7).
2. **Helper.** Run `node gam-engineering/tools/rebuild.mjs check` from the project root, on a check-tier subagent where the session is not on that tier ([Models](../../gam-engineering/references/models.md#handoff)). It prints the findings as JSON and exits with 0 when none is blocking, with 1 when one is, and with 2 on a usage error. If the file is missing, stop and name `/gam-engineering migrate tools`, which copies it.
3. **Judge.** Apply [What the agent judges](#what-the-agent-judges) to the checked concepts, the stack files, and the code of every module, on the judge tier, and append each finding after the helper's, in that order. Then sharpen the fix of each file-without-place finding the helper gave: replace its general fix by the concept and §16 module where the file is to be described and the pattern to add to `STACK.md` §4, for a script that fills the store with demo quizzes `describe the demo seeding as a module seed in concepts/quiz-editor.md §16 and add the module pattern scripts/<module>.mjs to STACK.md §4` (RB-F-25). Give each undocumented-behaviour finding the fix of RB-F-25: the concept and section where the behaviour is to be written, for a rule `concepts/quiz-editor.md §4`. Read only tracked files and the documents; run no command except the heads procedure of `STACK.md` §11, and connect to no data store (RB-NF-1).
4. **Report.** Print one table with the columns *Document*, *Line*, *Finding*, *Blocking*, the helper's findings first and then the judged ones in the order given, with *Line* empty where the helper gave none and *Blocking* as `yes` or `no`. Each finding is already one plain sentence that names the document and section where the fix is written (RB-U-2); print it unchanged and never propose deleting code (RB-F-25). A document path is relative to `gam-ai-knowledge/`.
5. **Verdict.** End with a last line of exactly `rebuildable` when no finding is blocking, and `not rebuildable` otherwise. An empty list prints the table header and `rebuildable`.
6. **Nothing else.** Leave the working tree as it was: write no report file and no log entry, and do not fix a finding in this command.

## What the helper decides

Every rule below is a function of the documents alone; `rebuild.mjs` applies them in this order (RB-F-15 … RB-F-18, RB-F-43).

| Order | Finding | Blocks when |
| --- | --- | --- |
| 1 | Legacy concept | a concept document has `format: legacy` |
| 2 | Unfinished work | a story file has `status: in-progress` or `review`, or a work-item folder holds a `feature.md` and no `epic.md` |
| 3 | Synthesis cycle | the *Synthesis Dependencies* of the checked concepts form a cycle |
| 4 | Done story without slice | a story with `status: done` has no slice in its concept's §16 |
| 5 | Blocked slice | a slice of a done story is *Blocked by* a slice of a story that is not done |
| 6 | Stack name | a name of the *Names* column of `STACK.md` §2 appears as a whole word with the same case in Part S of a checked concept, except in an *Encoding* cell of §8 and in a row of §11 *External contracts* |
| 7 | Requirement without module | an `F` or `U` requirement of a checked concept is named by no *Traces to* line of its §16 |
| 8 | Contract without example | a row of §11 *External contracts* of a checked concept names no example, or its example is not a tracked file under `gam-ai-knowledge/` (RB-F-19) |
| 9 | Layout without golden dump | a checked concept has *Persisted layout* rows and `test-data/<concept>/` holds no tracked `.json` file besides the examples of its contract rows (RB-F-20) |
| 10 | File without place | a tracked file of the code tree that no pattern of `STACK.md` §4 takes and that is no lock file of the package manager named in §1 (`package-lock.json` for npm, at any depth), or that lies under a `module` pattern whose `<module>` no §16 of a checked concept names; the finding names the path and has no line (RB-F-22) |
| 11 | Stack file without row | a tracked file that no `keep`, `module`, or `test` pattern of `STACK.md` §4 takes, and a `stack` pattern matches, has no row in *Stack files*; the finding names the path and has no line (RB-F-44) |

The patterns are git pathspec globs (`**` crosses folders, `<module>` is one folder name); the keep list of RB-F-1, the migration files of §11, and every submodule come first. A checked concept is one with at least one story with `status: done`; a concept with only `ready` or `backlog` stories is out of scope (RB-F-15). A story belongs to the concept whose file name is the epic folder's name without its `E<nn>-` prefix. A project with no documents in `gam-ai-knowledge/` is not rebuildable.

## What the agent judges

Five rules need reading that a script cannot do. Each adds findings of the same row form, all blocking, each with one plain sentence that names the document and section of the fix (RB-U-2).

| Rule | The agent checks | Finding when it fails |
| --- | --- | --- |
| Contract without row (RB-F-19) | in each checked concept, every interface or configuration key the text names — a route, command, exchanged file, outgoing call, environment variable — has a row in §11 *External contracts*, in any chapter it appears | `contract "<name>" has no recorded shape; add a row in §11`, at the line where the concept names it |
| Layout without description (RB-F-20) | `STACK.md` has a §11 when §2 maps a data store; every stored structure that the files named under *Migration files* create (a table, collection, or file) has a *Persisted layout* row of some concept | `STACK.md` without §11: `§2 maps the data store "<name>" but STACK.md has no §11; add the storage mapping`; otherwise `stored structure "<name>" created by <migration file> has no Persisted layout row; add it in §8` |
| Migration state (RB-F-21) | the head IDs the *Heads procedure* of §11 reports from the migration files alone equal the recorded *Migration state*, compared as sets | `migration state <recorded> differs from head <reported>; update §11` at the line of the *Migrations* row; a procedure that cannot run or reports no head: `the heads procedure of §11 reports no head; fix the procedure` |
| Stack file content (RB-F-44) | for each *Stack files* row whose file is tracked, the file's content apart from comments equals the row (or the fenced block it names): every dependency with its exact version, every script, every non-default setting | `<what> differs from the Stack files row; record it in STACK.md §4`, naming the first difference, for example `dependency zod 3.23.8` |
| Undocumented behaviour (RB-F-23) | in each module the §16 of a checked concept names, read the files under its `module` pattern: every entry point, route, command, configuration key, stored field, and rule they implement is described by a requirement, contract row, or *Persisted layout* row of a story with `status: done`; code that implements only a requirement of a story that is not done counts as undocumented | `<behaviour in one sentence>; write it into <concept> §<n>`, at the file and the line of the behaviour; the *Document* column holds the file |

A *Keep paths* entry that matches a file the project wrote itself, not a binary asset or third-party code, is one more finding: `<path> is kept but the project wrote it; describe it as a module or stack file in STACK.md §4`. A lock file of the package manager in `STACK.md` §1 is no stack file. The agent never proposes deleting code (RB-F-25): a file without a place is documented or recorded as a stack file, a binary asset, or third-party code in `STACK.md` §4, never dropped.
