#!/usr/bin/env node
// Stealth migration (plan gam-ai-memory/plans/2026-11-05-stealth-modus.md, Q392, Q393): moves a project to stealth mode in
// one step. It copies the gam- folders with stealth-backup.mjs (stops when that fails), adds a marked block to .gitignore,
// removes the tracked gam- folders from the git index (the files stay on disk), commits only .gitignore and those folders
// on chore/stealth-migrate, and pushes that branch. It never merges. Node, no dependencies.
// With --footprint=minimal (plan gam-ai-memory/plans/2026-11-21-minimal-mode.md, QA0053) it moves the project to the
// minimal footprint instead: no copy (QA0049), env.GAM_ENGINEERING_FOOTPRINT = minimal written into .claude/settings.json
// before that file leaves the index, the minimal block of footprint.mjs in .gitignore (replacing a stealth block), every
// path of that block out of the index, branch chore/minimal-migrate. Paths git tracked before gam created anything stay
// tracked (QA0051); a kept .claude/settings.json is committed with its new key. A team project is refused like a student
// one (A3, A4). Stealth is refused under the minimal footprint: there is no way back from minimal yet (A10).
// Usage (in the project root): node gam-engineering/tools/stealth-migrate.mjs [--footprint=stealth|minimal] [--dry-run] [--yes]
// The target comes from env.GAM_STEALTH_TARGET in .claude/settings.local.json (git-ignored, never committed). When it is
// missing, the run writes the sibling folder <parent>/<project>-stealth there (plan 2026-11-05-stealth-confirm.md).
// A real run needs --yes; without it the script asks on a terminal and, without a terminal, changes nothing (exit 2).
// The script does not check that the ADR replacing ADR 0010 exists; the developer confirms it before running.
// Exit codes: 0 done (or dry run printed), 1 a step failed (later steps did not run), 2 not configured, not confirmed,
// a student project (env.GAM_ENGINEERING_PROJECT_KIND, P-TEAM-6), or, for minimal, a team project (nothing changed).
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { MARKERS, gitignoreChange, planOf, readFootprint } from "./footprint.mjs";

export { gitignoreChange };
export const BRANCH = "chore/stealth-migrate";
export const MARKER_START = MARKERS.stealth.start;
export const MARKER_END = MARKERS.stealth.end;
export const COMMIT_SUBJECT = "Stop tracking gam- folders in git (stealth mode)";
export const MINIMAL_BRANCH = "chore/minimal-migrate";
export const MINIMAL_SUBJECT = "Stop tracking the gam files in git (minimal footprint)";
const BACKUP_TOOL = join(dirname(fileURLToPath(import.meta.url)), "stealth-backup.mjs");

// Runs git in `cwd`; `extraEnv` and `input` are optional (the temporary index and the index entries).
export function git(args, cwd, extraEnv = {}, input) {
  const run = spawnSync("git", args, { cwd, encoding: "utf8", env: { ...process.env, ...extraEnv }, input });
  return {
    ok: !run.error && run.status === 0,
    out: (run.stdout ?? "").trim(),
    err: (run.stderr || run.error?.message || "").trim(),
  };
}

// The default target: the sibling folder <parent>/<project>-stealth.
export function defaultTarget(root) {
  const full = resolve(root);
  return join(dirname(full), `${basename(full)}-stealth`);
}

// The target from .claude/settings.local.json, or the reason it is missing. `invalid` marks a file that cannot be read
// as a JSON object; such a file is never rewritten.
export function readTarget(root) {
  const file = join(root, ".claude", "settings.local.json");
  if (!existsSync(file)) return { target: "", reason: ".claude/settings.local.json does not exist", invalid: false };
  let settings;
  try {
    const text = readFileSync(file, "utf8").trim();
    settings = text === "" ? {} : JSON.parse(text);
  } catch {
    return { target: "", reason: ".claude/settings.local.json is not valid JSON", invalid: true };
  }
  if (settings === null || typeof settings !== "object" || Array.isArray(settings)) {
    return { target: "", reason: ".claude/settings.local.json is not a JSON object", invalid: true };
  }
  const target = settings.env?.GAM_STEALTH_TARGET;
  if (typeof target !== "string" || target.trim() === "") {
    return { target: "", reason: "env.GAM_STEALTH_TARGET is not set in .claude/settings.local.json", invalid: false };
  }
  return { target: target.trim(), reason: "", invalid: false };
}

// Writes env.GAM_STEALTH_TARGET into .claude/settings.local.json (created when missing), keeping every other key.
export function writeTarget(root, target) {
  const folder = join(root, ".claude");
  const file = join(folder, "settings.local.json");
  mkdirSync(folder, { recursive: true });
  const text = existsSync(file) ? readFileSync(file, "utf8").trim() : "";
  const settings = text === "" ? {} : JSON.parse(text);
  const env = settings.env !== null && typeof settings.env === "object" && !Array.isArray(settings.env) ? settings.env : {};
  settings.env = { ...env, GAM_STEALTH_TARGET: target };
  writeFileSync(file, `${JSON.stringify(settings, null, 2)}\n`);
}

// Asks on the terminal; true for y, yes, j, ja.
async function askOnTerminal(question) {
  const { createInterface } = await import("node:readline/promises");
  const terminal = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return /^(y|yes|j|ja)$/i.test((await terminal.question(question)).trim());
  } finally {
    terminal.close();
  }
}

// The paths the commit may hold: .gitignore and the given paths that exist on disk or are in HEAD.
function commitPathsOf(root, paths) {
  return [".gitignore", ...paths].filter(
    (path) =>
      path === ".gitignore" ||
      existsSync(join(root, path)) ||
      git(["ls-tree", "-r", "--name-only", "HEAD", "--", path], root).out !== "",
  );
}

function samePath(a, b) {
  const normalise = (path) => {
    const real = existsSync(path) ? realpathSync(path) : resolve(path);
    const slashed = real.replace(/\\/g, "/").replace(/\/+$/, "");
    return process.platform === "win32" ? slashed.toLowerCase() : slashed;
  };
  return normalise(a) === normalise(b);
}

// The committed project kind (P-TEAM-6, Q537): stealth mode is refused for a student project. Read here, so the script
// needs no other tool.
export function projectKindOf(root) {
  try {
    const env = JSON.parse(readFileSync(join(root, ".claude", "settings.json"), "utf8").replace(/^﻿/, "")).env ?? {};
    return String(env.GAM_ENGINEERING_PROJECT_KIND ?? "").trim().toLowerCase() || "normal";
  } catch {
    return "normal";
  }
}

// Team mode (A4): the minimal footprint is solo only, since a team cannot share ignored documents.
export function isTeamProject(root) {
  return existsSync(join(root, "gam-ai-knowledge", "team", "TEAM.md"));
}

// Writes env.GAM_ENGINEERING_FOOTPRINT into .claude/settings.json (created when missing), keeping every other key.
export function writeFootprint(root, footprint) {
  const folder = join(root, ".claude");
  const file = join(folder, "settings.json");
  mkdirSync(folder, { recursive: true });
  const text = existsSync(file) ? readFileSync(file, "utf8").replace(/^\uFEFF/, "").trim() : "";
  const settings = text === "" ? {} : JSON.parse(text);
  const env = settings.env !== null && typeof settings.env === "object" && !Array.isArray(settings.env) ? settings.env : {};
  settings.env = { ...env, GAM_ENGINEERING_FOOTPRINT: footprint };
  writeFileSync(file, `${JSON.stringify(settings, null, 2)}\n`);
}

// A git pathspec without the trailing slash of a folder.
const pathspec = (path) => path.replace(/\/$/, "");

const say = (line) => console.log(`stealth-migrate: ${line}`);
const stop = (step, message) => {
  console.error(`stealth-migrate: FAILED at step ${step} - ${message}`);
  return 1;
};

// Runs the steps a to i in `root`; with `dryRun` it only prints the plan. A real run needs `confirmed`; otherwise `ask`
// (a terminal prompt, or null) decides, and without it nothing changes. `footprint` is stealth (the default) or minimal.
// Resolves to the exit code.
export async function run(root, { dryRun = false, confirmed = false, ask = null, env = process.env, footprint = "stealth" } = {}) {
  const minimal = footprint === "minimal";
  const branch = minimal ? MINIMAL_BRANCH : BRANCH;
  const subject = minimal ? MINIMAL_SUBJECT : COMMIT_SUBJECT;
  const mode = minimal ? "the minimal footprint" : "stealth mode";

  // a: a git repository, and the folder is its root.
  const top = git(["rev-parse", "--show-toplevel"], root);
  if (!top.ok) return stop("a", "the folder is not inside a git repository");
  if (!samePath(top.out, root)) return stop("a", `run it in the project root (${top.out}), not in ${root}`);
  if (!git(["rev-parse", "--verify", "--quiet", "HEAD"], root).ok) return stop("a", "the repository has no commit yet");
  if (projectKindOf(root) === "student") {
    console.log(`stealth-migrate: refused - env.GAM_ENGINEERING_PROJECT_KIND is student in .claude/settings.json; a student project keeps its gam- folders and chats in the repo (P-TEAM-6), so ${mode} is not allowed. Nothing changed.`);
    return 2;
  }
  if (!minimal && readFootprint(root).footprint === "minimal") {
    console.log("stealth-migrate: refused - the project has footprint minimal (env.GAM_ENGINEERING_FOOTPRINT); stealth would track the root files again. Return to tracked first (README, Footprint). Nothing changed.");
    return 2;
  }
  if (minimal && isTeamProject(root)) {
    console.log("stealth-migrate: refused - gam-ai-knowledge/team/TEAM.md exists; a team cannot share ignored documents, so the minimal footprint is solo only. Nothing changed.");
    return 2;
  }

  // b: stealth: the target, a missing one becomes the sibling folder, an unreadable settings file stops the run.
  // minimal: the settings file must be readable, since the footprint is written into it.
  let configure = false;
  let target = "";
  if (minimal) {
    const file = join(root, ".claude", "settings.json");
    try {
      if (existsSync(file)) {
        const text = readFileSync(file, "utf8").replace(/^﻿/, "").trim();
        const parsed = text === "" ? {} : JSON.parse(text);
        if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not a JSON object");
      }
    } catch {
      console.log("stealth-migrate: not configured - .claude/settings.json is not a valid JSON object. Fix the file; nothing changed.");
      return 2;
    }
  } else {
    const found = readTarget(root);
    if (found.invalid) {
      console.log(`stealth-migrate: not configured - ${found.reason}. Fix the file or set env.GAM_STEALTH_TARGET there; nothing changed.`);
      return 2;
    }
    configure = found.target === "";
    target = configure ? defaultTarget(root) : found.target;
  }

  const plan = planOf(root, footprint);
  const settingsKept = minimal && plan.keep.includes(".claude/settings.json");
  const paths = plan.ignore.map(pathspec);
  const commitPaths = [...paths, ...(settingsKept ? [".claude/settings.json"] : [])];
  const gitignorePath = join(root, ".gitignore");
  const before = existsSync(gitignorePath) ? readFileSync(gitignorePath, "utf8") : "";
  const change = gitignoreChange(before, { footprint, paths: plan.ignore });
  const tracked = paths.filter((path) => git(["ls-files", "--", path], root).out !== "");
  const current = git(["branch", "--show-current"], root).out;

  if (dryRun || !confirmed) {
    say(dryRun ? "dry run - nothing will be changed. Steps:" : "planned steps:");
    if (minimal) {
      console.log("  b: write env.GAM_ENGINEERING_FOOTPRINT = minimal to .claude/settings.json (before it leaves the index)");
      console.log("  c: no copy (the minimal footprint keeps no backup; use stealth mode for one)");
    } else {
      console.log(
        configure
          ? `  b: write env.GAM_STEALTH_TARGET = ${target} (sibling folder) to .claude/settings.local.json`
          : `  b: target from .claude/settings.local.json: ${target}`,
      );
      console.log(`  c: copy the gam- folders to ${target} with stealth-backup.mjs (stops here if it fails)`);
    }
    const blockName = minimal ? "minimal" : "stealth";
    console.log(
      change.changed ? `  d: add the marked ${blockName} block to .gitignore` : `  d: .gitignore already has the marked ${blockName} block; nothing to do`,
    );
    console.log(
      tracked.length > 0
        ? `  e: git rm -r --cached -q ${tracked.join(" ")}`
        : `  e: nothing of ${mode} is tracked; nothing to remove`,
    );
    if (plan.keep.length > 0) console.log(`     stay tracked (tracked before gam created anything): ${plan.keep.join(", ")}`);
    console.log(`  f: switch to ${branch} (create it when missing; now on ${current || "a detached HEAD"})`);
    console.log(`  g: commit ${commitPathsOf(root, commitPaths).join(", ")} only, subject "${subject}"`);
    console.log(`  h: git push -u origin ${branch} (no merge)`);
    for (const negation of change.negations) say(`warning: .gitignore ${negation} un-ignores a path of the block; check it`);
    if (!minimal) say("before running: the ADR that replaces ADR 0010 must be in the project; this script does not check it.");
    if (dryRun) return 0;
    const yes = ask ? await ask(`stealth-migrate: really move this project to ${mode}? [y/N] `) : false;
    if (!yes) {
      say(ask ? "not confirmed; nothing changed." : "not confirmed - run it with --yes to proceed; nothing changed.");
      return 2;
    }
  }

  if (minimal) {
    // b: the footprint goes into the settings file while it is still on disk.
    try {
      writeFootprint(root, "minimal");
    } catch (error) {
      return stop("b", `could not write .claude/settings.json: ${error.message}`);
    }
    say("wrote env.GAM_ENGINEERING_FOOTPRINT = minimal to .claude/settings.json");
    if (settingsKept) {
      const add = git(["add", "--", ".claude/settings.json"], root);
      if (!add.ok) return stop("b", add.err);
      say(".claude/settings.json was tracked before gam, so it stays tracked and the commit carries the new key");
    }
  } else {
    // b: write the sibling target when none was set.
    if (configure) {
      try {
        writeTarget(root, target);
      } catch (error) {
        return stop("b", `could not write .claude/settings.local.json: ${error.message}`);
      }
      say(`wrote env.GAM_STEALTH_TARGET = ${target} to .claude/settings.local.json`);
    }
    if (!git(["check-ignore", "-q", "--", ".claude/settings.local.json"], root).ok) {
      say("warning: git does not ignore .claude/settings.local.json; add it to .gitignore so it is never committed");
    }

    // c: copy first; nothing else changes when the copy fails.
    const backup = spawnSync(process.execPath, [BACKUP_TOOL], {
      cwd: root,
      env: { ...env, GAM_STEALTH_TARGET: target },
      stdio: "inherit",
    });
    if (backup.status !== 0) return stop("c", `stealth-backup.mjs did not exit 0 (exit ${backup.status}); nothing changed`);
  }

  // d: the marked block in .gitignore.
  for (const negation of change.negations) {
    say(`warning: .gitignore ${negation} un-ignores a path of the block; it may need a decision`);
  }
  if (change.changed) {
    writeFileSync(gitignorePath, change.text);
    const add = git(["add", "--", ".gitignore"], root);
    if (!add.ok) return stop("d", add.err);
    say(`added the ${minimal ? "minimal" : "stealth"} block to .gitignore`);
  } else {
    say(`.gitignore already has the ${minimal ? "minimal" : "stealth"} block; unchanged`);
  }

  // e: out of the index; the files stay on disk.
  for (const path of tracked) {
    const remove = git(["rm", "-r", "--cached", "-q", "--", path], root);
    if (!remove.ok) return stop("e", `git rm --cached ${path}: ${remove.err}`);
  }
  say(tracked.length > 0 ? `removed from the index (files stay on disk): ${tracked.join(", ")}` : `nothing of ${mode} was tracked`);

  // f: the branch.
  if (current !== branch) {
    const exists = git(["rev-parse", "--verify", "--quiet", `refs/heads/${branch}`], root).ok;
    const checkout = exists ? git(["checkout", branch], root) : git(["checkout", "-b", branch], root);
    if (!checkout.ok) return stop("f", checkout.err);
  }
  say(`on branch ${branch}`);

  // g: commit only the listed paths. A temporary index holds HEAD plus the staged state of those paths, so staged or
  // unstaged changes elsewhere stay as they are. (`git commit -- <paths>` would re-add the ignored files that are still
  // on disk and so would not remove them from the commit.)
  const committed = commitPathsOf(root, commitPaths);
  const scratch = mkdtempSync(join(tmpdir(), "stealth-migrate-"));
  const commitEnv = { GIT_INDEX_FILE: join(scratch, "index") };
  try {
    const read = git(["read-tree", "HEAD"], root, commitEnv);
    if (!read.ok) return stop("g", read.err);
    const clear = git(["rm", "-r", "--cached", "-q", "--ignore-unmatch", "--", ...committed], root, commitEnv);
    if (!clear.ok) return stop("g", clear.err);
    const staged = git(["ls-files", "-s", "--", ...committed], root).out;
    if (staged !== "") {
      const entries = staged
        .split(/\r?\n/)
        .map((line) => line.replace(/^(\d+) ([0-9a-f]+) \d+\t/, "$1 $2\t"))
        .join("\n");
      const update = git(["update-index", "--add", "--index-info"], root, commitEnv, `${entries}\n`);
      if (!update.ok) return stop("g", update.err);
    }
    const nothing = git(["diff", "--cached", "--quiet", "HEAD"], root, commitEnv).ok;
    if (nothing) {
      say(`nothing to commit for .gitignore and the paths of ${mode}; no new commit`);
    } else {
      const commit = git(["commit", "-m", subject], root, commitEnv);
      if (!commit.ok) return stop("g", commit.err || commit.out);
      say(`committed ${committed.join(", ")} only`);
    }
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
  const hash = git(["rev-parse", "--short", "HEAD"], root).out;

  // h: push; a failure keeps the local commit.
  const push = git(["push", "-u", "origin", branch], root);
  if (!push.ok) {
    return stop("h", `push failed (${push.err}); the local commit ${hash} stays on ${branch}; push with git push -u origin ${branch}`);
  }

  // i: summary.
  say(`done - branch ${branch}, commit ${hash}, pushed to origin/${branch}. No merge was made.`);
  say(`.gitignore: ${change.changed ? `${minimal ? "minimal" : "stealth"} block added` : "block was already there"}`);
  if (minimal) {
    say("the files stay on disk; there is no copy (minimal footprint). .claude/settings.json on disk now holds the settings.");
    if (plan.keep.length > 0) say(`still tracked, because git tracked them before gam: ${plan.keep.join(", ")}`);
  } else {
    say(`the gam- files stay on disk; the copy is in ${target} (GAM_STEALTH_TARGET).`);
    say("reminder: the ADR that replaces ADR 0010 must be in the project before running this; the script does not check it.");
  }
  return 0;
}

export async function main(args, cwd = process.cwd(), env = process.env) {
  const usage = "usage: stealth-migrate.mjs [--footprint=stealth|minimal] [--dry-run] [--yes]";
  const footprintArg = args.find((arg) => arg.startsWith("--footprint="));
  const footprint = footprintArg ? footprintArg.slice("--footprint=".length) : "stealth";
  const unknown = args.filter((arg) => arg !== "--dry-run" && arg !== "--yes" && arg !== footprintArg);
  if (unknown.length > 0) {
    console.error(`stealth-migrate: unknown argument ${unknown[0]}; ${usage}`);
    return 1;
  }
  if (footprint !== "stealth" && footprint !== "minimal") {
    console.error(`stealth-migrate: unknown footprint ${footprint}; ${usage}`);
    return 1;
  }
  return run(cwd, {
    dryRun: args.includes("--dry-run"),
    confirmed: args.includes("--yes"),
    ask: process.stdin.isTTY ? askOnTerminal : null,
    env,
    footprint,
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await main(process.argv.slice(2));
}
