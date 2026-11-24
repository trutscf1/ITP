#!/usr/bin/env node
// Removes merged work branches and the worktrees that hold them, locally and on origin (gam-engineering, P-WS-13,
// QC0004-QC0010; plan gam-ai-memory/plans/2026-11-18-worktree-cleanup.md; procedure in the skill gam-delivery,
// references/cleanup.md).
//
// Copied into the project by /gam-engineering migrate tools; do not edit it per project. Node only, no dependencies; the
// same on Windows, macOS, and Linux. Git and orca are started without a shell. Run it from any worktree of the repository.
// The Orca CLI is `orca` on Windows and macOS and `orca-ide` on Linux, where `orca` is the GNOME screen reader (never started).
//
//   node gam-engineering/tools/worktree-cleanup.mjs [--dry-run] [--summary] [--json] [--no-fetch]
//        [--idle-minutes <n>] [--ask-minutes <n>] [--confirm <path>] [--snooze <path>]
//
// What it does: a merged work branch (its tip is contained in the local integration branch: main under trunk, else dev) is
// removed together with its clean worktree, its local branch, and its branch on origin (when origin/<integration> holds it
// too). A worktree with activity in the last --idle-minutes (default 10) stays; when it is still active --ask-minutes
// (default 60) after its merge, it is listed under "Ask" for the agent's yes/no question (--snooze <path> answers no and
// postpones the question by --ask-minutes, --confirm <path> answers yes). Unmerged, unclean, locked, detached, and fresh
// (no own commit) worktrees stay with the reason. The main folder and the worktree the script runs in are never touched.
//
// Hard rules: nothing is forced anywhere, a branch is only deleted by the safe delete that refuses unmerged work, and no
// folder is deleted recursively (an empty leftover folder goes through a plain rmdir). Output is English. Exit 1 only when
// a removal step failed, else 0 (2 when the repository cannot be read).
// --summary implies --dry-run and --no-fetch and prints one line, or nothing when there is nothing to remove or ask about.
// Snooze file: <git common dir>/gam-cleanup-snooze.json, { "<normalized path>": <epoch ms until which the question waits> }.
// Test hooks: GAM_CLEANUP_NOW (epoch ms), GAM_CLEANUP_ORCA=off (never call orca).
import { spawnSync } from "node:child_process";
import { accessSync, constants, existsSync, readdirSync, readFileSync, realpathSync, rmdirSync, statSync, writeFileSync } from "node:fs";
import { basename, delimiter, dirname, extname, join, resolve } from "node:path";
import { readEnv } from "./project-settings.mjs";

const windows = process.platform === "win32";
const MINUTE = 60000;
// The Orca worktree CLI. On Linux `orca` is the GNOME screen reader, which ignores the arguments and runs until killed.
const ORCA = process.platform === "linux" ? "orca-ide" : "orca";
// Orca answers within seconds; a call that hangs is ended so the cleanup falls back to git.
const ORCA_TIMEOUT_MS = 30000;

// ---------- small helpers ----------

const text = (value) => (value === undefined || value === null ? "" : String(value));
const lines = (value) => text(value).split(/\r?\n/).filter(Boolean);

function tryParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
function readJson(file, fallback) {
  try {
    const parsed = JSON.parse(readFileSync(file, "utf8"));
    return parsed && typeof parsed === typeof fallback ? parsed : fallback;
  } catch {
    return fallback;
  }
}
// The newest lastOutputAt / lastActivityAt number anywhere in an Orca entry.
function newestTime(value) {
  let newest = 0;
  const walk = (node) => {
    if (!node || typeof node !== "object") return;
    for (const [key, item] of Object.entries(node)) {
      if ((key === "lastOutputAt" || key === "lastActivityAt") && typeof item === "number") newest = Math.max(newest, item);
      else walk(item);
    }
  };
  walk(value);
  return newest;
}

// ---------- finding and starting tools (the pattern of merge.mjs) ----------

const isRunnable = (path) => {
  try {
    if (!statSync(path).isFile()) return false;
    if (windows) return true;
    accessSync(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
};
const pathExtensions = () => (windows ? (process.env.PATHEXT ?? ".COM;.EXE;.BAT;.CMD").split(";").filter(Boolean).map((ext) => ext.toUpperCase()) : []);

// The executable a word names, on the search path; null when there is none.
function findApplication(word) {
  for (const folder of text(process.env.PATH ?? process.env.Path).split(delimiter).filter(Boolean)) {
    const base = join(folder, word);
    if (!windows) {
      if (isRunnable(base)) return base;
      continue;
    }
    const extensions = pathExtensions();
    if (extensions.includes(extname(base).toUpperCase()) && isRunnable(base)) return base;
    for (const extension of extensions) if (isRunnable(base + extension)) return base + extension;
  }
  return null;
}

// An argument as cmd.exe must read it.
const quoteForCmd = (argument) => (argument !== "" && !/[\s"&|<>^()!%]/.test(argument) ? argument : `"${argument.replace(/(\\*)"/g, '$1$1\\"').replace(/(\\+)$/, "$1$1")}"`);

function launch(application, args) {
  const options = { env: { ...process.env, GIT_TERMINAL_PROMPT: "0" }, windowsHide: true };
  if (windows && /\.(cmd|bat)$/i.test(application)) {
    return { file: process.env.ComSpec || "cmd.exe", args: ["/d", "/s", "/c", `"${[application, ...args].map(quoteForCmd).join(" ")}"`], options: { ...options, windowsVerbatimArguments: true } };
  }
  return { file: application, args, options };
}

// One call with its output kept: { status, stdout, stderr, out }; status 127 when the tool is missing.
function exec(word, args, cwd, timeout) {
  const application = findApplication(word);
  if (!application) return { status: 127, stdout: "", stderr: `command not found: ${word}\n`, out: [] };
  const { file, args: fileArgs, options } = launch(application, args);
  const result = spawnSync(file, fileArgs, { ...options, ...(cwd ? { cwd } : {}), ...(timeout ? { timeout, killSignal: "SIGKILL" } : {}), encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 1 << 28 });
  if (result.error) return { status: 127, stdout: "", stderr: `${result.error.message}\n`, out: [] };
  return { status: result.status ?? 1, stdout: text(result.stdout), stderr: text(result.stderr), out: lines(result.stdout) };
}
const git = (cwd, ...args) => exec("git", args, cwd);
const orca = (...args) => exec(ORCA, args, undefined, ORCA_TIMEOUT_MS);
const words = (result) => lines(result.stdout + result.stderr).join(" | ");

// ---------- paths ----------

// A path in one comparable form (real path, forward slashes, lower case on Windows).
function normPath(path) {
  const absolute = resolve(path);
  let real;
  try {
    real = realpathSync.native(absolute);
  } catch {
    try {
      real = join(realpathSync.native(dirname(absolute)), basename(absolute));
    } catch {
      real = absolute;
    }
  }
  const slashed = real.replace(/\\/g, "/").replace(/\/+$/, "");
  return windows ? slashed.toLowerCase() : slashed;
}

// ---------- options ----------

function parseArguments(argv) {
  const opts = { dryRun: false, summary: false, json: false, fetch: true, idleMinutes: 10, askMinutes: 60, confirm: [], snooze: [] };
  const next = (at, name) => {
    if (at + 1 >= argv.length) throw new Error(`${name} needs a value`);
    return argv[at + 1];
  };
  const minutes = (at, name) => {
    const number = Number(next(at, name));
    if (!Number.isFinite(number) || number < 0) throw new Error(`${name} needs a number of minutes`);
    return number;
  };
  for (let at = 0; at < argv.length; at += 1) {
    const word = argv[at];
    if (word === "--dry-run") opts.dryRun = true;
    else if (word === "--summary") opts.summary = true;
    else if (word === "--json") opts.json = true;
    else if (word === "--no-fetch") opts.fetch = false;
    else if (word === "--idle-minutes") opts.idleMinutes = minutes(at++, word);
    else if (word === "--ask-minutes") opts.askMinutes = minutes(at++, word);
    else if (word === "--confirm") opts.confirm.push(next(at++, word));
    else if (word === "--snooze") opts.snooze.push(next(at++, word));
    else throw new Error(`unknown option ${word}`);
  }
  if (opts.summary) {
    opts.dryRun = true;
    opts.fetch = false;
  }
  return opts;
}

// ---------- main ----------

function main(argv) {
  let opts;
  try {
    opts = parseArguments(argv);
  } catch (error) {
    process.stderr.write(`worktree-cleanup: ${error.message}\n`);
    return 2;
  }
  const now = Number(process.env.GAM_CLEANUP_NOW) || Date.now();
  const top = git(null, "rev-parse", "--show-toplevel").out[0];
  if (!top) {
    process.stderr.write("worktree-cleanup: not inside a git repository\n");
    return 2;
  }
  const current = normPath(top);
  const commonDir = resolve(top, git(top, "rev-parse", "--git-common-dir").out[0] ?? ".git");
  const result = { integration: "", dryRun: opts.dryRun, removed: [], ask: [], kept: [], skipped: [], failed: [], warnings: [] };
  const warn = (message) => result.warnings.push(message);

  // The worktrees: [{ path, branch, detached, locked, prunable, bare }]; the first one is the main folder.
  const worktrees = [];
  for (const line of git(top, "worktree", "list", "--porcelain").out) {
    if (line.startsWith("worktree ")) worktrees.push({ path: line.slice(9), branch: "", detached: false, locked: false, prunable: false, bare: false });
    else if (!worktrees.length) continue;
    else if (line.startsWith("branch refs/heads/")) worktrees.at(-1).branch = line.slice(18);
    else if (line === "detached") worktrees.at(-1).detached = true;
    else if (line === "bare") worktrees.at(-1).bare = true;
    else if (line.startsWith("locked")) worktrees.at(-1).locked = true;
    else if (line.startsWith("prunable")) worktrees.at(-1).prunable = true;
  }
  if (!worktrees.length) {
    process.stderr.write("worktree-cleanup: git worktree list printed nothing\n");
    return 2;
  }
  const mainFolder = worktrees[0].path;
  const hasRef = (ref) => git(top, "rev-parse", "--verify", "--quiet", ref).status === 0;

  // Integration branch (P-GIT-9): main under trunk, else dev; a missing dev falls back to main.
  const trunk = text(readEnv(top, { warn: null }).GAM_ENGINEERING_BRANCHES).trim().toLowerCase() === "trunk";
  const integration = !trunk && hasRef("refs/heads/dev") ? "dev" : "main";
  result.integration = integration;
  if (!hasRef(`refs/heads/${integration}`)) {
    process.stderr.write(`worktree-cleanup: the integration branch ${integration} does not exist\n`);
    return 2;
  }
  const integrationBranches = new Set(["main", "dev"]);

  // Step 1: fetch.
  const hasOrigin = git(top, "remote").out.includes("origin");
  if (hasOrigin && opts.fetch) {
    const fetched = git(top, "fetch", "--prune", "origin");
    if (fetched.status !== 0) warn(`git fetch --prune origin failed: ${words(fetched)}`);
  }

  // Orca (only to remove its workspaces and to read its activity).
  let orcaOn = process.env.GAM_CLEANUP_ORCA !== "off" && findApplication(ORCA) !== null;
  const orcaPaths = new Set();
  const orcaActivity = new Map();
  if (orcaOn) {
    const listed = orca("worktree", "list", "--json");
    const parsed = listed.status === 0 ? tryParse(listed.stdout) : null;
    if (!parsed) {
      orcaOn = false;
      warn(`${ORCA} worktree list failed; Orca is not used: ${words(listed)}`);
    } else {
      for (const entry of parsed.result?.worktrees ?? []) if (entry?.path) orcaPaths.add(normPath(entry.path));
      const processes = orca("worktree", "ps", "--json");
      const psParsed = processes.status === 0 ? tryParse(processes.stdout) : null;
      if (!psParsed) warn(`${ORCA} worktree ps failed; Orca activity is not read`);
      for (const entry of psParsed?.result?.worktrees ?? []) {
        if (!entry?.path) continue;
        const newest = newestTime(entry);
        if (newest) orcaActivity.set(normPath(entry.path), newest);
      }
    }
  }

  // Branch and remote facts.
  const localBranches = new Map();
  for (const line of git(top, "for-each-ref", "--format=%(refname)%09%(objectname)", "refs/heads").out) {
    const [name, sha] = line.split("\t");
    localBranches.set(name.slice("refs/heads/".length), sha);
  }
  const remoteBranches = new Map();
  if (hasOrigin) {
    for (const line of git(top, "for-each-ref", "--format=%(refname)%09%(objectname)", "refs/remotes/origin").out) {
      const [name, sha] = line.split("\t");
      const short = name.slice("refs/remotes/origin/".length);
      if (short !== "HEAD") remoteBranches.set(short, sha);
    }
  }
  const remoteIntegration = remoteBranches.get(integration);
  const firstParent = new Set(git(top, "rev-list", "--first-parent", integration).out);
  const isAncestor = (sha, into) => git(top, "merge-base", "--is-ancestor", sha, into).status === 0;
  const isMerged = (sha) => isAncestor(sha, integration);
  const isFresh = (sha) => firstParent.has(sha);
  // A1: the branch on origin goes only when origin/<integration> contains its tip.
  const remoteDeletable = (branch) => remoteBranches.has(branch) && remoteIntegration !== undefined && isAncestor(remoteBranches.get(branch), remoteIntegration);
  const aheadOf = (sha, base) => Number(git(top, "rev-list", "--count", `${base}..${sha}`).out[0] ?? 0);
  const pushedState = (branch, sha) => {
    const remote = remoteBranches.get(branch);
    if (remote === undefined) return "not pushed";
    return isAncestor(sha, remote) ? "pushed" : "partly pushed";
  };

  // The position of a branch: the first line under "## Next step" of its branch memory file.
  const positionOf = (branch, folder) => {
    if (!branch) return null;
    const relative = `gam-ai-memory/branches/${branch.replace(/\//g, "-")}.md`;
    let content = null;
    try {
      if (folder && existsSync(join(folder, relative))) content = readFileSync(join(folder, relative), "utf8");
    } catch {
      content = null;
    }
    if (content === null) {
      const shown = git(top, "show", `${branch}:${relative}`);
      if (shown.status === 0) content = shown.stdout;
    }
    if (content === null) return null;
    const all = content.split(/\r?\n/);
    const heading = all.findIndex((line) => /^##\s+next step\s*$/i.test(line.trim()));
    if (heading < 0) return null;
    for (const line of all.slice(heading + 1)) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith("#")) return null;
      return trimmed.replace(/^[-*]\s+/, "");
    }
    return null;
  };

  const keep = (branch, path, reason, sha, extra = {}) => {
    const entry = { branch, path, reason };
    if (sha) {
      entry.ahead = aheadOf(sha, integration);
      entry.pushed = pushedState(branch, sha);
    }
    Object.assign(entry, extra);
    const position = positionOf(branch, path);
    if (position) entry.position = position;
    result.kept.push(entry);
  };
  const changesOf = (path) => lines(git(path, "--no-optional-locks", "status", "--porcelain").stdout).length;

  // Step 2: the linked worktrees.
  const snoozeFile = join(commonDir, "gam-cleanup-snooze.json");
  let snoozed = readJson(snoozeFile, {});
  if (opts.snooze.length) {
    snoozed = Object.fromEntries(Object.entries(snoozed).filter(([, until]) => Number(until) > now));
    for (const path of opts.snooze) snoozed[normPath(path)] = now + opts.askMinutes * MINUTE;
    try {
      writeFileSync(snoozeFile, `${JSON.stringify(snoozed, null, 2)}\n`);
    } catch (error) {
      warn(`the snooze file could not be written: ${error.message}`);
    }
  }
  const confirmed = new Set(opts.confirm.map(normPath));
  const held = new Set();
  const livePaths = new Set(worktrees.map((tree) => normPath(tree.path)));
  const removableTrees = [];
  for (const [index, tree] of worktrees.entries()) {
    const norm = normPath(tree.path);
    if (tree.bare) continue;
    if (tree.prunable) {
      livePaths.delete(norm);
      result.removed.push({ kind: "prune", path: tree.path, branch: tree.branch || null });
      continue;
    }
    if (tree.branch) held.add(tree.branch);
    if (index === 0) {
      result.skipped.push({ path: tree.path, branch: tree.branch || null, reason: "main folder" });
      continue;
    }
    if (norm === current) {
      result.skipped.push({ path: tree.path, branch: tree.branch || null, reason: "current worktree" });
      continue;
    }
    if (tree.locked) {
      keep(tree.branch || null, tree.path, "locked", localBranches.get(tree.branch));
      continue;
    }
    if (tree.detached || !tree.branch) {
      keep(null, tree.path, "detached HEAD");
      continue;
    }
    if (integrationBranches.has(tree.branch)) {
      keep(tree.branch, tree.path, "holds an integration branch");
      continue;
    }
    const sha = localBranches.get(tree.branch);
    if (!sha || !isMerged(sha)) {
      keep(tree.branch, tree.path, "open: not merged", sha, { changes: changesOf(tree.path) });
      continue;
    }
    if (isFresh(sha)) {
      keep(tree.branch, tree.path, "fresh: no own commit yet", sha, { changes: changesOf(tree.path) });
      continue;
    }
    const changes = changesOf(tree.path);
    if (changes > 0) {
      keep(tree.branch, tree.path, "merged but unclean", sha, { changes });
      continue;
    }
    // Merged and clean: activity decides (tip commit time, mtime of the worktree's index, Orca's own timestamps).
    const times = [Number(git(top, "log", "-1", "--format=%ct", sha).out[0] ?? 0) * 1000];
    const indexPath = git(tree.path, "rev-parse", "--git-path", "index").out[0];
    try {
      if (indexPath) times.push(statSync(resolve(tree.path, indexPath)).mtimeMs);
    } catch {
      // no index file: it adds no activity
    }
    if (orcaActivity.has(norm)) times.push(orcaActivity.get(norm));
    const activityAt = Math.max(...times);
    const mergedAt = Number(git(top, "log", "--ancestry-path", "--reverse", "--format=%ct", `${sha}..${integration}`).out[0] ?? 0) * 1000 || times[0];
    const activeMinutes = Math.floor((now - activityAt) / MINUTE);
    const mergedMinutes = Math.floor((now - mergedAt) / MINUTE);
    if (confirmed.has(norm) || activeMinutes >= opts.idleMinutes) {
      removableTrees.push({ tree, branch: tree.branch });
    } else if (mergedMinutes >= opts.askMinutes && !(Number(snoozed[norm]) > now)) {
      result.ask.push({ path: tree.path, branch: tree.branch, mergedMinutes, activeMinutes });
    } else {
      keep(tree.branch, tree.path, `merged but active (last activity ${activeMinutes} min ago)`, sha, { changes: 0, mergedMinutes, activeMinutes });
    }
  }

  // The folder that runs `git branch -d`: a worktree that holds the integration branch, so "merged into HEAD" holds.
  const integrationFolder = (worktrees.find((tree) => tree.branch === integration && !tree.prunable) ?? worktrees[0]).path;
  const failStep = (step, entry, message) => result.failed.push({ step, ...entry, message });
  const deleteLocalBranch = (branch) => {
    const done = git(integrationFolder, "branch", "-d", branch);
    if (done.status !== 0) failStep("git branch -d", { branch }, words(done));
    return done.status === 0;
  };
  const deleteRemoteBranch = (branch) => {
    const done = git(mainFolder, "push", "origin", "--delete", branch);
    if (done.status !== 0) failStep("git push origin --delete", { branch }, words(done));
    return done.status === 0;
  };
  const removeEmptyFolder = (path) => {
    try {
      if (existsSync(path) && statSync(path).isDirectory() && readdirSync(path).length === 0) {
        rmdirSync(path);
        return true;
      }
    } catch (error) {
      failStep("rmdir", { path }, error.message);
    }
    return false;
  };

  // Step 3: remove the merged, clean, idle worktrees (planned only under --dry-run).
  if (!opts.dryRun && result.removed.some((item) => item.kind === "prune")) git(mainFolder, "worktree", "prune");
  for (const { tree, branch } of removableTrees) {
    const entry = { kind: "worktree", branch, path: tree.path, remote: remoteDeletable(branch) };
    if (opts.dryRun) {
      result.removed.push(entry);
      continue;
    }
    const viaOrca = orcaOn && orcaPaths.has(normPath(tree.path));
    const removal = viaOrca ? orca("worktree", "rm", "--worktree", `path:${tree.path}`, "--delete-branch", "--json") : git(mainFolder, "worktree", "remove", tree.path);
    const orcaRefused = viaOrca && removal.status === 0 && tryParse(removal.stdout)?.ok === false;
    if (removal.status !== 0 || orcaRefused) {
      failStep(viaOrca ? `${ORCA} worktree rm` : "git worktree remove", { branch, path: tree.path }, words(removal));
      continue;
    }
    // The branch on origin goes first: `git branch -d` refuses a branch that is ahead of its upstream.
    if (entry.remote && !deleteRemoteBranch(branch)) entry.remote = false;
    if (hasRef(`refs/heads/${branch}`)) deleteLocalBranch(branch);
    removeEmptyFolder(tree.path);
    result.removed.push(entry);
  }

  // Step 4: local branches no worktree holds.
  for (const [branch, sha] of localBranches) {
    if (integrationBranches.has(branch) || held.has(branch)) continue;
    if (!isMerged(sha)) {
      keep(branch, null, "open: not merged", sha);
      continue;
    }
    const entry = { kind: "branch", branch, fresh: isFresh(sha), remote: remoteDeletable(branch) };
    if (!opts.dryRun) {
      // The branch on origin goes first: `git branch -d` refuses a branch that is ahead of its upstream.
      if (entry.remote && !deleteRemoteBranch(branch)) entry.remote = false;
      if (!deleteLocalBranch(branch)) {
        if (entry.remote) result.removed.push({ kind: "remote", branch });
        continue;
      }
    }
    result.removed.push(entry);
  }

  // Step 5: branches that exist only on origin.
  for (const [branch, sha] of remoteBranches) {
    if (integrationBranches.has(branch) || localBranches.has(branch)) continue;
    if (remoteIntegration !== undefined && isAncestor(sha, remoteIntegration)) {
      if (!opts.dryRun && !deleteRemoteBranch(branch)) continue;
      result.removed.push({ kind: "remote", branch });
    } else {
      const base = remoteIntegration === undefined ? integration : `origin/${integration}`;
      result.kept.push({ branch: `origin/${branch}`, path: null, reason: "open: only on origin, not merged", ahead: aheadOf(`origin/${branch}`, base), pushed: "origin only" });
    }
  }

  // Step 6: empty folders of worktrees that are gone (A4), then prune. A folder counts only when it is listed in the
  // history, is no worktree any more, and sits next to a worktree of this repository (the Orca workspace folder).
  const history = readJson(join(commonDir, "gam-worktree-history.json"), []).filter((item) => typeof item === "string");
  const mainNorm = normPath(mainFolder);
  const workspaceFolders = new Set();
  for (const path of [...worktrees.filter((_, index) => index > 0).map((tree) => tree.path), ...history]) {
    if (normPath(path) !== mainNorm) workspaceFolders.add(normPath(dirname(path)));
  }
  for (const path of history) {
    const norm = normPath(path);
    if (norm === mainNorm || livePaths.has(norm) || !workspaceFolders.has(normPath(dirname(path)))) continue;
    try {
      if (!existsSync(path) || !statSync(path).isDirectory() || readdirSync(path).length > 0) continue;
    } catch {
      continue;
    }
    if (opts.dryRun || removeEmptyFolder(path)) result.removed.push({ kind: "folder", path });
  }
  if (!opts.dryRun) git(mainFolder, "worktree", "prune");

  return report(result, opts);
}

// ---------- report ----------

function report(result, opts) {
  const { removed, ask, kept, skipped, failed, warnings } = result;
  if (opts.summary) {
    const count = (predicate) => removed.filter(predicate).length;
    const parts = [
      [count((item) => item.kind === "worktree" || item.kind === "prune"), "worktree", "worktrees"],
      [count((item) => item.kind === "branch"), "branch", "branches"],
      [count((item) => item.kind === "remote"), "remote-only branch", "remote-only branches"],
      [count((item) => item.kind === "folder"), "empty folder", "empty folders"],
    ].filter(([number]) => number > 0).map(([number, one, many]) => `${number} ${number === 1 ? one : many}`);
    const pieces = [];
    if (parts.length > 0) pieces.push(`${parts.join(", ")} can be removed`);
    if (ask.length > 0) pieces.push(`${ask.length} merged ${ask.length === 1 ? "worktree is" : "worktrees are"} still active and asked about`);
    if (pieces.length > 0) console.log(`worktree-cleanup: ${pieces.join("; ")} (run /gam-engineering cleanup)`);
    return 0;
  }
  if (opts.json) {
    console.log(JSON.stringify(result, null, 2));
    return failed.length > 0 ? 1 : 0;
  }
  const out = [];
  out.push(`Integration branch: ${result.integration}${opts.dryRun ? " (dry run, nothing is changed)" : ""}`);
  out.push(`${opts.dryRun ? "Would remove" : "Removed"} (${removed.length}):`);
  for (const item of removed) {
    if (item.kind === "worktree") out.push(`  worktree ${item.branch}  ${item.path}  (+ local branch${item.remote ? ", + origin branch" : ""})`);
    else if (item.kind === "prune") out.push(`  stale worktree entry ${item.path}${item.branch ? `  (${item.branch})` : ""}`);
    else if (item.kind === "branch") out.push(`  branch ${item.branch}${item.fresh ? "  (fresh, no own commit)" : ""}${item.remote ? "  (+ origin branch)" : ""}`);
    else if (item.kind === "remote") out.push(`  origin branch ${item.branch}  (merged into origin/${result.integration})`);
    else if (item.kind === "folder") out.push(`  empty folder ${item.path}`);
  }
  out.push(`Ask (${ask.length}):`);
  for (const item of ask) out.push(`  ${item.branch}  ${item.path}  merged ${item.mergedMinutes} min ago, last activity ${item.activeMinutes} min ago`);
  out.push(`Kept (${kept.length}):`);
  for (const item of kept) {
    const facts = [item.reason];
    if (item.ahead !== undefined) facts.push(`${item.ahead} commit${item.ahead === 1 ? "" : "s"} ahead`);
    if (item.pushed) facts.push(item.pushed);
    if (item.changes !== undefined) facts.push(item.changes > 0 ? `${item.changes} changed file${item.changes === 1 ? "" : "s"}` : "no changes");
    out.push(`  ${item.branch ?? "(no branch)"}${item.path ? `  ${item.path}` : ""}  [${facts.join("; ")}]${item.position ? `  position: ${item.position}` : ""}`);
  }
  if (skipped.length) out.push(`Skipped: ${skipped.map((item) => `${item.reason} ${item.path}`).join("; ")}`);
  for (const message of warnings) out.push(`Warning: ${message}`);
  if (failed.length) {
    out.push(`Failed (${failed.length}):`);
    for (const item of failed) out.push(`  ${item.step} ${item.branch ?? item.path ?? ""}: ${item.message}`);
  }
  console.log(out.join("\n"));
  return failed.length > 0 ? 1 : 0;
}

process.exitCode = main(process.argv.slice(2));
