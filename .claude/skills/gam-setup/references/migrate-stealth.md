# Moving a project to stealth mode

Loaded for `/gam-engineering migrate stealth`. It moves a project's gam- folders (`gam-ai-knowledge/`, `gam-engineering/`, `gam-ai-memory/`) out of git and onto the copy of [stealth mode](../../gam-engineering/README.md#stealth-mode-backup-copy-of-the-gam--folders). The work is done by one script, `gam-engineering/tools/stealth-migrate.mjs`; this file holds only the steps around it.

## Steps

1. **Check the tool.** The file `gam-engineering/tools/stealth-migrate.mjs` must exist. When it is missing, run `/gam-engineering migrate tools` first, then continue here.
2. **Look for the ADR.** Search `gam-ai-knowledge/adr/` for an ADR that replaces ADR 0010 (a status *superseded* on 0010, or a new ADR that names it). Name the file in the question when one is found.
3. **Dry run.** Run `node gam-engineering/tools/stealth-migrate.mjs --dry-run` and show its output to the developer. It changes nothing. Its step `b` names the target: the value of `env.GAM_STEALTH_TARGET` in `.claude/settings.local.json`, or, when that is missing, the sibling folder `<parent>/<project>-stealth` the run will write there. Exit 2 means the settings file is not valid JSON: tell the developer to fix it and stop.
4. **Ask before anything runs.** One round of two `AskUserQuestion` pop-up questions in German, each with the next `Q<n>` in its text and a header of at most 12 characters; the question rules of [gam-engineering](../../gam-engineering/SKILL.md) apply (the recommended option first with `(Empfohlen)`, **Keines davon** as the last option):
   - `Q<n> - ADR: Ist der ADR, der ADR 0010 ersetzt, im Projekt vorhanden (<file or "nicht gefunden">)?` Options **Ja, ADR ist vorhanden**, **Nein, abbrechen**, **Keines davon**.
   - `Q<n+1> - Wirklich: Soll das Projekt jetzt wirklich in den Stealth-Modus wechseln (Kopie nach <target>, gam- Ordner aus dem Git-Index, Branch chore/stealth-migrate pushen)?` Options **Ja, jetzt ausführen**, **Nein, abbrechen**, **Keines davon**. The description of *Ja* says whether the target is written to `.claude/settings.local.json` as the sibling folder.
   - When step 2 found the ADR, *Ja* is recommended (`(Empfohlen)`, first) in both questions; when it did not, *Nein, abbrechen* is recommended and first in both.
   - The answered round is recorded by the AI chat export (rule 4 of the question rules). Unless both answers are *Ja*, stop: nothing changed.
5. **Run.** Run `node gam-engineering/tools/stealth-migrate.mjs --yes` (the answered pop-up is the confirmation; without `--yes` the script asks on a terminal and, without one, changes nothing and exits 2). When the target was missing, it first writes `env.GAM_STEALTH_TARGET` (the sibling folder) into `.claude/settings.local.json`, keeping every other key. It then copies the folders with `stealth-backup.mjs` (a failure stops it before any further change), adds the marked block to `.gitignore`, removes the three folders from the git index (the files stay on disk), commits only `.gitignore` and those folders on `chore/stealth-migrate`, and pushes that branch. It never merges.
6. **Report.** Show the script's output: the target, the branch, the commit hash, the push result, and any `warning` line — a negation in `.gitignore`, or `.claude/settings.local.json` not ignored by git (either may need a decision by the developer). A push failure leaves the local commit; the developer pushes it with `git push -u origin chore/stealth-migrate`.

The merge into `main` is a separate step under the merge policy (P-MR-4); this command does not do it.

## Exit codes

| Code | Meaning |
| --- | --- |
| 0 | Done, or the dry run printed its steps |
| 1 | A step failed; the steps after it did not run |
| 2 | Not confirmed (no `--yes`, no terminal, or the terminal answer was not yes), or `.claude/settings.local.json` is not valid JSON; nothing changed |
