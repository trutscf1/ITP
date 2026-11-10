# Stopp

Loaded by `/gam-engineering stopp` (skill `gam-delivery`, P-WS-8): ends a session by saving what it decided in the project, so a fresh session needs no chat history. The command is the confirmation — no pop-up asks whether to save; the only questions are the ones the merge policy asks (P-MR-4).

1. **Write down what the session decided.** Each fact goes to its one home and is never copied (the core's contract point 6). Leave out keys, passwords, tokens, and personal data (school projects: student data) in every file written here:
   - New tasks and ideas: entries in `next.md` (in team mode the developer's own, P-TEAM).
   - Open assumptions `A<n>` and unanswered questions: `next.md`, each with its number (the answered rounds are in the chat export, P-GRILL-2); run `node gam-engineering/tools/prompt-export.mjs export` so the export holds this session too.
   - Lasting rules for this project: the project's `CLAUDE.md`.
   - The position and the command for the next step: `ROADMAP-DETAILS.md` (team mode: the developer's `STATUS.md`), as P-ROAD-4 demands; add the log entry for finished work.
2. **Secure unfinished code.** Look at `git status`. Changes that are not part of a finished step are not committed to the work branch or `main`: move them onto a branch `wip/<YYYY-MM-DD>-<slug>`, commit them there, and push it where a remote exists. The branch is never merged; the position's next step names it. Plain documents of step 1 stay out of it.
3. **Commit** the documents of step 1 on the current branch, or on a `chore/stopp-<slug>` branch when the current branch is the integration branch (P-GIT-2). Commit subjects follow P-GIT-4.
4. **Bring the documents into the integration branch** (`dev`, or `main` in branch model `trunk`). Run the pipeline fresh as [merge](merge.md) step 1 says, then merge as the merge policy says (P-MR-4, [Merge policy](../SKILL.md#merge-policy)): every merge goes through [merge](merge.md). A pipeline that is not green stops the command here: the documents stay committed on their branch, and the report names every failed check.
5. **End what the session started.** Stop the background tasks and the local containers the session started (P-PIPE-4); leave everything else alone.
6. **Copy the gam- folders (stealth mode).** Run it when the project set `GAM_STEALTH_TARGET` in its `.claude/settings.local.json` (never committed); without the setting, skip this step silently. Run `node gam-engineering/tools/stealth-backup.mjs` from the project root after step 4, also when step 4 stopped the command, because the files are then still at risk. Exit code 2 means not configured and is a note; any other failure is reported loudly as `stealth-backup FAILED` with its message, and the command goes on, as in [merge](merge.md) step 5. Name the target only when the copy succeeded.
7. **Check the stealth guard.** Where the copy of step 6 ran (`GAM_STEALTH_TARGET` set), run `node gam-engineering/tools/stealth-check.mjs`. Exit code 1 means a gam- file is tracked by git again: report it with its `git rm -r --cached` hint and do not commit anything that adds it; exit code 2 (no repo) is a note. The guard changes no file.
8. **Hand over.** In a project with `gam-ai-memory/`, run `/gam-ai-memory handover`. Then print the command for the next step, name every MR and `wip/` branch left open, and stop; do not start new work.

**Without git** (P-GIT-7): only step 1 runs, and step 6 prints the next command. No `wip/` branch, commit, merge, or pipeline.

**Team mode:** step 1 writes only the developer's own files; another developer's `STATUS.md` and `next.md` are never touched (P-TEAM).
