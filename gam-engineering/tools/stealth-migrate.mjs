#!/usr/bin/env node
// Stealth migration (plan gam-ai-memory/plans/2026-11-05-stealth-modus.md, Q392, Q393): moves a project to stealth mode in
// one step. It copies the gam- folders with stealth-backup.mjs (stops when that fails), adds a marked block to .gitignore,
// removes the tracked gam- folders from the git index (the files stay on disk), commits only .gitignore and those folders
// on chore/stealth-migrate, and pushes that branch. It never merges. Node, no dependencies.
// Usage (in the project root): node gam-engineering/tools/stealth-migrate.mjs [--dry-run] [--yes]
// The target comes from env.GAM_STEALTH_TARGET in .claude/settings.local.json (git-ignored, never committed). When it is
// missing, the run writes the sibling folder <parent>/<project>-stealth there (plan 2026-11-05-stealth-confirm.md).
// A real run needs --yes; without it the script asks on a terminal and, without a terminal, changes nothing (exit 2).
// The script does not check that the ADR replacing ADR 0010 exists; the developer confirms it before running.
// Exit codes: 0 done (or dry run printed), 1 a step failed (later steps did not run), 2 not configured or not confirmed
// (nothing changed).
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { GAM_FOLDERS } from "./stealth-backup.mjs";

export const BRANCH = "chore/stealth-migrate";
export const MARKER_START = "# >>> gam stealth mode (managed by stealth-migrate.mjs) >>>";
export const MARKER_END = "# <<< gam stealth mode <<<";
export const COMMIT_SUBJECT = "Stop tracking gam- folders in git (stealth mode)";
const BACKUP_TOOL = join(dirname(fileURLToPath(import.meta.url)), "stealth-backup.mjs");
const NEGATION = /^!\/?(gam-ai-knowledge|gam-engineering|gam-ai-memory)(\/|$|\*)/;

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

// The .gitignore text with the marked block appended (unchanged when the block already exists), keeping the file's
// line endings. `negations` lists the lines that un-ignore a gam- folder; they are kept and reported, never removed.
export function gitignoreChange(text) {
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  const lines = text.split(/\r?\n/);
  const negations = lines
    .map((line, index) => ({ line: line.trim(), number: index + 1 }))
    .filter(({ line }) => NEGATION.test(line))
    .map(({ line, number }) => `line ${number}: ${line}`);
  if (lines.some((line) => line.trim() === MARKER_START)) return { changed: false, text, negations };
  const head = text === "" || text.endsWith("\n") ? text : text + eol;
  const block = [MARKER_START, ...GAM_FOLDERS.map((folder) => `/${folder}/`), MARKER_END].join(eol) + eol;
  return { changed: true, text: head + block, negations };
}

// The paths the commit may hold: .gitignore and the gam- folders that exist on disk or are in HEAD.
function commitPathsOf(root) {
  return [".gitignore", ...GAM_FOLDERS].filter(
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

const say = (line) => console.log(`stealth-migrate: ${line}`);
const stop = (step, message) => {
  console.error(`stealth-migrate: FAILED at step ${step} - ${message}`);
  return 1;
};

// Runs the steps a to i in `root`; with `dryRun` it only prints the plan. A real run needs `confirmed`; otherwise `ask`
// (a terminal prompt, or null) decides, and without it nothing changes. Resolves to the exit code.
export async function run(root, { dryRun = false, confirmed = false, ask = null, env = process.env } = {}) {
  // a: a git repository, and the folder is its root.
  const top = git(["rev-parse", "--show-toplevel"], root);
  if (!top.ok) return stop("a", "the folder is not inside a git repository");
  if (!samePath(top.out, root)) return stop("a", `run it in the project root (${top.out}), not in ${root}`);
  if (!git(["rev-parse", "--verify", "--quiet", "HEAD"], root).ok) return stop("a", "the repository has no commit yet");

  // b: the target; a missing one becomes the sibling folder, an unreadable settings file stops the run.
  const found = readTarget(root);
  if (found.invalid) {
    console.log(`stealth-migrate: not configured - ${found.reason}. Fix the file or set env.GAM_STEALTH_TARGET there; nothing changed.`);
    return 2;
  }
  const configure = found.target === "";
  const target = configure ? defaultTarget(root) : found.target;

  const gitignorePath = join(root, ".gitignore");
  const before = existsSync(gitignorePath) ? readFileSync(gitignorePath, "utf8") : "";
  const change = gitignoreChange(before);
  const tracked = GAM_FOLDERS.filter((folder) => git(["ls-files", "--", folder], root).out !== "");
  const current = git(["branch", "--show-current"], root).out;

  if (dryRun || !confirmed) {
    say(dryRun ? "dry run - nothing will be changed. Steps:" : "planned steps:");
    console.log(
      configure
        ? `  b: write env.GAM_STEALTH_TARGET = ${target} (sibling folder) to .claude/settings.local.json`
        : `  b: target from .claude/settings.local.json: ${target}`,
    );
    console.log(`  c: copy the gam- folders to ${target} with stealth-backup.mjs (stops here if it fails)`);
    console.log(
      change.changed ? "  d: add the marked block to .gitignore" : "  d: .gitignore already has the marked block; nothing to do",
    );
    console.log(
      tracked.length > 0
        ? `  e: git rm -r --cached -q ${tracked.join(" ")}`
        : "  e: no gam- folder is tracked; nothing to remove",
    );
    console.log(`  f: switch to ${BRANCH} (create it when missing; now on ${current || "a detached HEAD"})`);
    console.log(`  g: commit ${commitPathsOf(root).join(", ")} only, subject "${COMMIT_SUBJECT}"`);
    console.log(`  h: git push -u origin ${BRANCH} (no merge)`);
    for (const negation of change.negations) say(`warning: .gitignore ${negation} un-ignores a gam- path; check it`);
    say("before running: the ADR that replaces ADR 0010 must be in the project; this script does not check it.");
    if (dryRun) return 0;
    const yes = ask ? await ask("stealth-migrate: really move this project to stealth mode? [y/N] ") : false;
    if (!yes) {
      say(ask ? "not confirmed; nothing changed." : "not confirmed - run it with --yes to proceed; nothing changed.");
      return 2;
    }
  }

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

  // d: the marked block in .gitignore.
  for (const negation of change.negations) {
    say(`warning: .gitignore ${negation} un-ignores a gam- path; it may need a decision`);
  }
  if (change.changed) {
    writeFileSync(gitignorePath, change.text);
    const add = git(["add", "--", ".gitignore"], root);
    if (!add.ok) return stop("d", add.err);
    say("added the stealth block to .gitignore");
  } else {
    say(".gitignore already has the stealth block; unchanged");
  }

  // e: out of the index; the files stay on disk.
  for (const folder of tracked) {
    const remove = git(["rm", "-r", "--cached", "-q", "--", folder], root);
    if (!remove.ok) return stop("e", `git rm --cached ${folder}: ${remove.err}`);
  }
  say(tracked.length > 0 ? `removed from the index (files stay on disk): ${tracked.join(", ")}` : "no gam- folder was tracked");

  // f: the branch.
  if (current !== BRANCH) {
    const exists = git(["rev-parse", "--verify", "--quiet", `refs/heads/${BRANCH}`], root).ok;
    const checkout = exists ? git(["checkout", BRANCH], root) : git(["checkout", "-b", BRANCH], root);
    if (!checkout.ok) return stop("f", checkout.err);
  }
  say(`on branch ${BRANCH}`);

  // g: commit only the listed paths. A temporary index holds HEAD plus the staged state of those paths, so staged or
  // unstaged changes elsewhere stay as they are. (`git commit -- <paths>` would re-add the ignored gam- files that
  // are still on disk and so would not remove them from the commit.)
  const commitPaths = commitPathsOf(root);
  const scratch = mkdtempSync(join(tmpdir(), "stealth-migrate-"));
  const commitEnv = { GIT_INDEX_FILE: join(scratch, "index") };
  try {
    const read = git(["read-tree", "HEAD"], root, commitEnv);
    if (!read.ok) return stop("g", read.err);
    const clear = git(["rm", "-r", "--cached", "-q", "--ignore-unmatch", "--", ...commitPaths], root, commitEnv);
    if (!clear.ok) return stop("g", clear.err);
    const staged = git(["ls-files", "-s", "--", ...commitPaths], root).out;
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
      say("nothing to commit for .gitignore and the gam- folders; no new commit");
    } else {
      const commit = git(["commit", "-m", COMMIT_SUBJECT], root, commitEnv);
      if (!commit.ok) return stop("g", commit.err || commit.out);
      say(`committed ${commitPaths.join(", ")} only`);
    }
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
  const hash = git(["rev-parse", "--short", "HEAD"], root).out;

  // h: push; a failure keeps the local commit.
  const push = git(["push", "-u", "origin", BRANCH], root);
  if (!push.ok) {
    return stop("h", `push failed (${push.err}); the local commit ${hash} stays on ${BRANCH}; push with git push -u origin ${BRANCH}`);
  }

  // i: summary.
  say(`done - branch ${BRANCH}, commit ${hash}, pushed to origin/${BRANCH}. No merge was made.`);
  say(`.gitignore: ${change.changed ? "stealth block added" : "stealth block was already there"}`);
  say(`the gam- files stay on disk; the copy is in ${target} (GAM_STEALTH_TARGET).`);
  say("reminder: the ADR that replaces ADR 0010 must be in the project before running this; the script does not check it.");
  return 0;
}

export async function main(args, cwd = process.cwd(), env = process.env) {
  const unknown = args.filter((arg) => arg !== "--dry-run" && arg !== "--yes");
  if (unknown.length > 0) {
    console.error(`stealth-migrate: unknown argument ${unknown[0]}; usage: stealth-migrate.mjs [--dry-run] [--yes]`);
    return 1;
  }
  return run(cwd, {
    dryRun: args.includes("--dry-run"),
    confirmed: args.includes("--yes"),
    ask: process.stdin.isTTY ? askOnTerminal : null,
    env,
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await main(process.argv.slice(2));
}
