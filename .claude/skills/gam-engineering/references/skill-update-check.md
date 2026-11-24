# Vendored skills: checked update

Loaded when the vendored skills (`skills/gam-v-*`) are updated in the gam-engineering repository; never needed in a project session. An upstream's new version is staged first, checked here by the AI against the gam- skills, and applied only after the check. **The gam- skills take precedence**; where an upstream does something better, its idea is taken over through the gam- rule, not by editing the copy (Q426–Q429).

## Steps

1. **Stage.** `node skills/gam-engineering/scripts/skill-update.mjs --stage` (or `--only=<gam-name>,…`). It writes each skill with a new upstream commit or changed files to the git-ignored `.skill-update/<gam-name>/` (`upstream/` as rewritten, `files/` with `local.patch` re-applied) and the report `.skill-update/report.md`. `skills/` is not touched.
2. **Read per skill**: its report section (files, patch status, diff of `SKILL.md`, `references/`, and other `.md` files), the section *Integration* of `skills/<gam-name>/SOURCE.md`, and the gam- text that calls the skill (named there).
3. **Check** every changed skill against the [checklist](#checklist).
4. **Classify** each finding:
   - **ok** — nothing to do.
   - **gam wins** — the gam- rule already overrides the new text (an override table, a profile entry); add the point to *Integration* if it is not there yet.
   - **upstream better** — the new text solves something better than a gam- rule. One pop-up per finding (`Q<n>`): **Keep the gam rule** or **Take over the upstream** (the gam- rule, override, or `PROFILE.md` entry changes in the same change; the copy stays unchanged).
   - **conflict** — the new text cannot work under the gam- skills as they are. One pop-up per finding with a recommendation; its options are: **Keep the old version** (the skill is not applied, `--apply --only=` the others, an inbox entry in `gam-ai-knowledge/next.md`), **Override in the gam- skills** (a rule that neutralizes it), **Rewrite locally** (see [Local rewrite](#local-rewrite)), and **Apply as is**.
   - A `failed` local patch is always a conflict.
5. **Apply** what was decided: `--apply` (or `--apply --only=<gam-names>` to leave a skill at its old version). It copies the staging into `skills/`, keeps `SOURCE.md`, `CREDITS.md`, and `local.patch`, records commit and date, and removes the staging of the applied skills.
6. **Finish** as the README section *Updating the vendored skills* says: tests, commit, merge through `/gam-engineering merge`, deploy.

## Checklist

For each changed skill, does the new text now:

1. **Write files outside its folder** — `PRODUCT.md`, `DESIGN.md`, `docs/`, specs, plans, ADRs, `CONTEXT.md`? Only what a P-DOC entry or a recorded override allows (the knowledge folder is the source of truth; P-DES-12 for impeccable).
2. **Install hooks or edit settings** — `.claude/settings*.json`, git hooks, MCP servers? None without a recorded decision.
3. **Ask in chat** instead of a pop-up, or ask what the profile already answers (P-GRILL-1)?
4. **Bring its own git, branch, commit, or merge rules**, or publish to a tracker or host without confirmation (P-GIT, P-MR-4, gam-delivery override 6)?
5. **Call skills** that are not vendored, or a vendored one under its upstream name?
6. **Change its invocation** — `disable-model-invocation`, `user-invocable`, `allowed-tools`? A skill the gam- skills or a `STACK.md` §10 row call must stay model-invocable.
7. **Download or run something** — network calls, binaries, package installs?
8. **Change its license** (compare the upstream license file with `CREDITS.md`)?
9. **Collide by name or reference** — a new skill name in the same repository, a word now renamed by mistake (`upstream.name`, `upstream.renameRefs`), a sibling path `../<name>/` left pointing at an upstream folder name?
10. **Overlap a gam- rule** — a step the gam- skills already own (ticket cutting, Definition of Done, review axes, status)? Then it is *gam wins* or *upstream better*.
11. **Break a point named in *Integration*** of its `SOURCE.md`?

## Local rewrite

Only after a pop-up chose it. A rewrite that only removes a frontmatter key (such as `disable-model-invocation`) is not a patch: add the key to `upstream.dropFrontmatter` in `skill-deps.json` and stage again (Q567). Otherwise edit `skills/<gam-name>/` as decided, then run `node skills/gam-engineering/scripts/skill-update.mjs --patch=<gam-name>`: it writes `local.patch`, the difference to the upstream at the recorded commit. Record it in `SOURCE.md` under *Local changes* (what, why, `Q<n>`) and set *Upstream SKILL.md identical* to `no`. Every later `--stage` re-applies the patch; when it no longer applies, the check treats it as a conflict.
