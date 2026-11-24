# Parallel work audit

Area 12 of [score.md](score.md) (P-ARCH-5): can sessions in different worktrees change different parts of the program without meeting in the same file? `n/a` for a project that has no program of its own to cut (P-ARCH-4).

## Terms

- **Part:** a piece of the program that owns its files and shows the others one public entry.
- **Blocking module:** a module whose files force two sessions to work one after the other, because both must change the same file.
- **Unit of work:** one commit on the first-parent line of the integration branch; a `--no-ff` merge counts with every file of its branch.
- **Overlap rate:** the share of pairs of units of work that changed at least one common file.

## The run

On the check tier ([Models](../../gam-engineering/references/models.md)), run `node gam-engineering/tools/parallel-check.mjs` in the project and read its three signals and its table of program files. Items 1 to 3 take the script's grade as it is. Without the script or without git, or with fewer than 10 units of work, grade only items 4 to 6 and say so in the row. A project that has `gam-engineering/parallel.json` is read with the limits in that file.

## Items

Each item is `met`, `partly`, or `missed`, with its evidence ([Grading an area](score.md#grading-an-area)).

| # | Item | Evidence |
| --- | --- | --- |
| 1 | No hot file | The script's grade for the share of the hottest program file |
| 2 | Low overlap rate | The script's grade for the overlap rate |
| 3 | Changes stay local | The script's grade for the spread (modules per unit, median) |
| 4 | No central list | Read each program file the script lists: `met` when none is a list that every feature extends by hand, `partly` when only lists the technology forces remain, `missed` when a hand-kept list could be split or found by convention |
| 5 | Interfaces of the parts | `met` when each part has one public entry and other parts import only it, `partly` with single imports that reach inside, `missed` when parts import each other's inner files freely; cite file and line |
| 6 | Shared data | `met` when migrations, seed and test data, and generated files are kept per part or rebuilt by a command, `partly` when one of them is shared, `missed` when two sessions would have to merge them by hand |

## What is not a finding

- The script also lists the documents of `gam-ai-knowledge/` in a table without a grade. Put them in the report as a note; they are never a finding against the project, and they do not change the score.
- A deviation recorded as an ADR that references P-ARCH-5 is not a finding.

## The fixes

Name the fix for every `partly` and `missed`, the cheapest first. A fix further down the list costs more, so name it only when the cheaper ones do not cure the finding.

1. Split the file per part: one file per part instead of one file for all, assembled by the tool that reads it.
2. Find the parts by convention instead of a central list: a folder pattern or a registry that discovers its entries.
3. An interface with its contract at the border of the part, merged first, so the sessions on each side work against the contract.
4. The part as its own package in the same repository, with its own public entry and tests.
5. Its own service, only when the part must also be deployed or scaled on its own or needs another technology. Name its cost: a network border, data kept consistent across services, and operation. Never propose a service to cure merge conflicts alone.

A shared file the technology forces (a schema file or a framework registry; a lock file is not counted at all) stays a finding. Its fix is to build changes to it one after the other (P-WS-13), or the split the technology skill of `STACK.md` section 10 names.
