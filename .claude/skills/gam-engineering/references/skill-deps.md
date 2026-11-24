# Vendored skills check

Loaded by rule 7 of [Before anything else](../SKILL.md#before-anything-else). The gam- skills call skills that were copied from upstream into this repo and renamed with the prefix `gam-v-` (`gam-v-grilling`, `gam-v-tdd`, `gam-v-code-review`, `gam-v-pr`, …), so that no project depends on a skill a developer happens to have installed under the same name. [skill-deps.json](../scripts/skill-deps.json) lists them with a tier (`required`, `optional`, `maintenance`), where each is used, and its upstream.

## When

At the first gam- command on a machine, run `node <skill folder>/scripts/skill-deps.mjs --once`. It prints nothing when the marker `~/.claude/gam-skill-deps.json` matches the manifest, so it runs again only after the manifest changed. A re-check by hand is the same command without `--once`.

## What the script does

It reports which skills are not deployed: a skill counts as installed when `~/.claude/skills/<name>/SKILL.md` (or `$CLAUDE_CONFIG_DIR/skills/`) or `.claude/skills/<name>/SKILL.md` in the project exists. It exits 1 when a `required` one is missing. The command continues either way. The fix is `deploy_skill_wrapper.ps1` in the gam-engineering repo, which deploys every `skills/gam-*` folder.

## Changing a vendored skill

A vendored skill is a copy of its upstream (its `SOURCE.md` names repository, path, commit, and the update steps; the manifest repeats them as `upstream`), renamed in its `name:` (prefix `gam-v-`) and in the references of the gam- skills; its own text is otherwise unchanged and is not held to the size limits of `tests/skill-structure.test.mjs`. An upstream change is taken over in three steps, never by editing the folder: `node <skill folder>/scripts/skill-update.mjs --stage` (`--only=<gam-name>` limits it) clones each upstream, sets the `gam-v-` name, renames references and `../<name>/` paths to other vendored skills of the same upstream repository, never a call or JSX prop (`upstream.name` in the manifest when the upstream name differs, as for `gam-v-ui-prototype`; `upstream.renameRefs: false` keeps every reference, as for `gam-v-impeccable`, whose name is also its CLI), removes the frontmatter keys of `upstream.dropFrontmatter` from `SKILL.md` (Q567), re-applies the skill's `local.patch`, and writes the result and a report to the git-ignored `.skill-update/`; the AI then checks it against the gam- skills as [skill-update-check.md](skill-update-check.md) says (the gam- skills take precedence; a better upstream idea and a conflict are each a pop-up); `--apply` copies the checked staging into `skills/`, keeps `SOURCE.md`, `CREDITS.md`, and `local.patch`, and updates the commit and date in `SOURCE.md` and `skill-deps.json`. What to watch for in each skill is the section *Integration* of its `SOURCE.md`; a local rewrite exists only as `local.patch` (a removed frontmatter key only as `upstream.dropFrontmatter`), made with `--patch=<gam-name>` after a pop-up and recorded under *Local changes*.
