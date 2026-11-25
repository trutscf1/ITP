# Moving a project to the minimal footprint

Loaded for `/gam-engineering migrate minimal`. It takes out of git everything the gam- skills created in a project — the gam- folders, the root files, `.claude/settings.json`, and in a skill repo the deploy launchers — so the full process runs while git holds only one marked block in `.gitignore` ([Footprint](../../gam-engineering/README.md#footprint-tracked-stealth-minimal)). The work is done by one script, `gam-engineering/tools/stealth-migrate.mjs --footprint=minimal`; this file holds only the steps around it. Unlike stealth mode, minimal keeps no copy (QA0049): whoever wants a backup uses [stealth mode](migrate-stealth.md).

## Steps

1. **Check the tools.** The files `gam-engineering/tools/stealth-migrate.mjs` and `gam-engineering/tools/footprint.mjs` must exist. When one is missing, run `/gam-engineering migrate tools` first, then continue here.
2. **Dry run.** Run `node gam-engineering/tools/stealth-migrate.mjs --footprint=minimal --dry-run` and show its output to the developer. It changes nothing. It lists the paths that leave the index (step `e`) and the paths that stay tracked because git tracked them before gam created anything (QA0051). Exit 2 means `.claude/settings.json` is not valid JSON, the project kind is `student` (P-TEAM-6), or `gam-ai-knowledge/team/TEAM.md` exists (team mode: a team cannot share ignored documents): name the reason and stop.
3. **Ask before anything runs.** One `AskUserQuestion` pop-up question in German, with the next `Q<n>` in its text and a header of at most 12 characters; the question rules of [gam-engineering](../../gam-engineering/SKILL.md#asking-the-developer) apply:
   - `Q<n> - Minimal: Soll das Projekt jetzt wirklich auf Footprint minimal wechseln (<n> Pfade aus dem Git-Index, keine Kopie, Branch chore/minimal-migrate pushen)?` Options **Ja, jetzt ausführen** (recommended when the dry run exited 0), **Nein, abbrechen**, **Keines davon**. The description of *Ja* names the paths that stay tracked and that the host CI file, if the project has one, stops finding its checks.
   - The answered round is recorded by the AI chat export. Unless the answer is *Ja*, stop: nothing changed.
4. **Run.** Run `node gam-engineering/tools/stealth-migrate.mjs --footprint=minimal --yes`. It writes `env.GAM_ENGINEERING_FOOTPRINT` = `minimal` into `.claude/settings.json` while the file is still on disk, adds the marked minimal block to `.gitignore` (a stealth block is replaced in place), removes the block's paths from the git index (the files stay on disk), commits only `.gitignore` and those removals (plus `.claude/settings.json` with its new key when git tracked it before gam) on `chore/minimal-migrate`, and pushes that branch. It never merges.
5. **Settle what minimal changes.** Under minimal, the pipeline location is `local` and the chat export is `local` (A5, A11): set `env.GAM_ENGINEERING_PROMPT_EXPORT` to `local` in the settings file on disk, and when `gam-engineering/pipeline.json` names `host` or `both`, set it to `local` and name the host CI file (`.gitlab-ci.yml`, `.github/workflows/gam-*.yml`), which the developer removes in a later change. Nothing here touches git.
6. **Report.** Show the script's output: the branch, the commit hash, the push result, the paths that stay tracked, and any `warning` line (a negation in `.gitignore` that un-ignores a path of the block). A push failure leaves the local commit; the developer pushes it with `git push -u origin chore/minimal-migrate`.

The merge into `main` is a separate step under the merge policy (P-MR-4); this command does not do it. There is no command back to `tracked`: the README names the steps, and `migrate tracked` is suggestion S-17.

## Exit codes

| Code | Meaning |
| --- | --- |
| 0 | Done, or the dry run printed its steps |
| 1 | A step failed; the steps after it did not run |
| 2 | Not confirmed, `.claude/settings.json` is not valid JSON, the project kind is `student`, or the project is in team mode; nothing changed |
