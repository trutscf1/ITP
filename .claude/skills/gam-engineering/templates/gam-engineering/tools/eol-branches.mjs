#!/usr/bin/env node
// Open-branch check before the line-ending renormalize (P-GIT-12, plan gam-ai-memory/plans/2026-11-18-eol-migration-branches.md,
// QB0011, QB0012, QB0017): the row `Line endings LF` of `migrate tools` runs `git add --renormalize .`, which rewrites every
// file stored with CRLF. A branch that changed such a file conflicts in exactly that file when it merges the integration
// branch afterwards. This script finds those branches before the rewrite, so the row can wait.
//
// Copied into the project by /gam-engineering migrate tools; do not edit it per project. Node only, no dependencies; git is
// started without a shell. Run it from any worktree of the repository.
//
//   node gam-engineering/tools/eol-branches.mjs [--no-fetch]
//
// Renormalize set: the paths of the integration branch's tree (P-GIT-9: main under trunk, else dev when it exists, else
// main) that git stores with CRLF or mixed endings (`i/crlf`, `i/mixed`) and that .gitattributes does not mark `-text`.
// An empty set means nothing can conflict. Open: every local branch and every branch on origin whose tip is not contained in
// the integration branch, plus the uncommitted changes of every other worktree; the branch and worktree the script runs in,
// `main`, and `dev` never count. A branch blocks when it changed a file of the set (a file it only added does not).
// Exit 0: nothing blocks (also without git or outside a repository, with the reason said). Exit 1: at least one open branch
// changed a file the renormalize would change. Exit 2: git failed or the integration branch is missing (never read as 0).
import { spawnSync } from "node:child_process";
import { mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parseEol } from "./eol-check.mjs";
import { readEnv } from "./project-settings.mjs";

const windows = process.platform === "win32";
const SHOWN_FILES = 5;

// One git call without a shell: { status, stdout, stderr }; status 127 when git is missing. LC_ALL=C keeps git's messages
// English, so "not a git repository" is recognized under any system language (git-locale).
function git(cwd, args, env = {}, input = undefined) {
  const result = spawnSync("git", ["-c", "core.quotepath=false", ...args], {
    cwd,
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0", LC_ALL: "C", ...env },
    encoding: "utf8",
    input,
    maxBuffer: 1 << 28,
    windowsHide: true,
  });
  if (result.error) return { status: 127, stdout: "", stderr: result.error.message };
  return { status: result.status ?? 1, stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
}
const records = (text) => text.split("\0").filter(Boolean);
const lines = (text) => text.split(/\r?\n/).filter(Boolean);
const failure = (what, result) => ({ code: 2, lines: [`eol-branches: ${what} failed: ${(result.stderr || result.stdout).trim()}`] });

// A path in one comparable form (real path, forward slashes, lower case on Windows).
function normPath(path) {
  let real = resolve(path);
  try {
    real = realpathSync.native(real);
  } catch {
    try {
      real = join(realpathSync.native(dirname(real)), basename(real));
    } catch {
      // keep the resolved path
    }
  }
  const slashed = real.replace(/\\/g, "/").replace(/\/+$/, "");
  return windows ? slashed.toLowerCase() : slashed;
}

// The worktrees of `git worktree list --porcelain`: [{ path, branch, detached, head }]; bare and prunable ones are skipped.
export function parseWorktrees(text) {
  const all = [];
  for (const line of lines(text)) {
    if (line.startsWith("worktree ")) all.push({ path: line.slice(9), branch: "", detached: false, head: "", skip: false });
    else if (!all.length) continue;
    else if (line.startsWith("HEAD ")) all.at(-1).head = line.slice(5);
    else if (line.startsWith("branch refs/heads/")) all.at(-1).branch = line.slice(18);
    else if (line === "detached") all.at(-1).detached = true;
    else if (line === "bare" || line.startsWith("prunable")) all.at(-1).skip = true;
  }
  return all.filter((entry) => !entry.skip);
}

// The paths git would rewrite with `git add --renormalize .` on the integration branch: stored with CRLF or mixed endings and
// not marked `-text`. Read from a temporary index filled from the branch, so every worktree gets the same answer.
function renormalizeSet(top, integrationRef) {
  const folder = mkdtempSync(join(tmpdir(), "gam-eol-branches-"));
  try {
    const env = { GIT_INDEX_FILE: join(folder, "index") };
    const filled = git(top, ["read-tree", integrationRef], env);
    if (filled.status !== 0) return { error: failure(`git read-tree ${integrationRef}`, filled) };
    const listed = git(top, ["ls-files", "--eol", "-z"], env);
    if (listed.status !== 0) return { error: failure("git ls-files --eol", listed) };
    const candidates = parseEol(listed.stdout).filter((entry) => entry.index === "crlf" || entry.index === "mixed").map((entry) => entry.path);
    const paths = new Set(candidates);
    if (candidates.length === 0) return { paths };
    // check-attr reads the .gitattributes of the index, not of the working tree; `binary` expands to -text (unset).
    const attributes = git(top, ["check-attr", "--cached", "-z", "--stdin", "text"], env, `${candidates.join("\0")}\0`);
    if (attributes.status !== 0) return { error: failure("git check-attr", attributes) };
    const fields = records(attributes.stdout);
    for (let at = 0; at + 2 < fields.length; at += 3) if (fields[at + 2] === "unset") paths.delete(fields[at]);
    return { paths };
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
}

export function run(argv = [], cwd = process.cwd()) {
  const fetchWanted = !argv.includes("--no-fetch");
  for (const word of argv) if (word !== "--no-fetch") return { code: 2, lines: [`eol-branches: unknown option ${word}`, "Usage: node gam-engineering/tools/eol-branches.mjs [--no-fetch]"] };

  const probe = git(cwd, ["rev-parse", "--show-toplevel"]);
  if (probe.status === 127) return { code: 0, lines: ["eol-branches: no git on this computer, nothing to check"] };
  if (probe.status !== 0) {
    if (/not a git repository/i.test(probe.stderr)) return { code: 0, lines: ["eol-branches: not a git repository, nothing to check"] };
    return failure("git rev-parse --show-toplevel", probe);
  }
  const top = probe.stdout.trim();
  const here = normPath(top);

  // Integration branch (P-GIT-9): main under trunk, else dev when it exists, else main.
  const exists = (ref) => git(top, ["rev-parse", "--verify", "--quiet", ref]).status === 0;
  const trunk = String(readEnv(top, { warn: () => {} }).GAM_ENGINEERING_BRANCHES ?? "").trim().toLowerCase() === "trunk";
  const name = !trunk && (exists("refs/heads/dev") || exists("refs/remotes/origin/dev")) ? "dev" : "main";
  const integrationRef = exists(`refs/heads/${name}`) ? `refs/heads/${name}` : exists(`refs/remotes/origin/${name}`) ? `refs/remotes/origin/${name}` : "";
  if (!integrationRef) return { code: 2, lines: [`eol-branches: the integration branch ${name} exists neither locally nor on origin`] };

  const notes = [];
  const done = (code, text) => ({ code, lines: [...text, ...notes] });

  // The renormalize set.
  const prepared = renormalizeSet(top, integrationRef);
  if (prepared.error) return prepared.error;
  const set = prepared.paths;
  if (set.size === 0) return done(0, ["eol-branches: the renormalize would change no file in the index, nothing can conflict"]);

  // Fetch.
  const hasOrigin = lines(git(top, ["remote"]).stdout).includes("origin");
  if (hasOrigin) {
    if (!fetchWanted) {
      notes.push("eol-branches: not fetched (--no-fetch); the branches on origin are as of the last fetch");
    } else {
      const fetched = git(top, ["fetch", "--prune", "origin"]);
      if (fetched.status !== 0) {
        notes.push(`eol-branches: warning: git fetch --prune origin failed (${(fetched.stderr || fetched.stdout).trim().split(/\r?\n/)[0]}); the branches on origin are as of the last fetch`);
      }
    }
  }

  // The branches: name -> { local, remote }.
  const branches = new Map();
  const collect = (prefix, key) => {
    const listed = git(top, ["for-each-ref", "--format=%(refname)%09%(objectname)", prefix]);
    if (listed.status !== 0) return failure(`git for-each-ref ${prefix}`, listed);
    for (const line of lines(listed.stdout)) {
      const [ref, sha] = line.split("\t");
      const branch = ref.slice(prefix.length + 1);
      if (key === "remote" && branch === "HEAD") continue;
      if (!branches.has(branch)) branches.set(branch, {});
      branches.get(branch)[key] = sha;
    }
    return null;
  };
  const broken = collect("refs/heads", "local") ?? (hasOrigin ? collect("refs/remotes/origin", "remote") : null);
  if (broken) return broken;

  const worktreesResult = git(top, ["worktree", "list", "--porcelain"]);
  if (worktreesResult.status !== 0) return failure("git worktree list", worktreesResult);
  const worktrees = parseWorktrees(worktreesResult.stdout);
  const others = worktrees.filter((entry) => normPath(entry.path) !== here);
  const current = worktrees.find((entry) => normPath(entry.path) === here);

  const remoteIntegration = exists(`refs/remotes/origin/${name}`) ? `refs/remotes/origin/${name}` : "";
  const contained = (sha) => git(top, ["merge-base", "--is-ancestor", sha, integrationRef]).status === 0 || (remoteIntegration !== "" && git(top, ["merge-base", "--is-ancestor", sha, remoteIntegration]).status === 0);
  const changedSince = (sha) => {
    const base = git(top, ["merge-base", integrationRef, sha]);
    if (base.status !== 0) {
      const all = git(top, ["ls-tree", "-r", "--name-only", "-z", sha]);
      return all.status === 0 ? records(all.stdout) : null;
    }
    const diff = git(top, ["diff", "--name-only", "--no-renames", "-z", base.stdout.trim(), sha]);
    return diff.status === 0 ? records(diff.stdout) : null;
  };
  const uncommitted = (path) => {
    const diff = git(path, ["diff", "--name-only", "--no-renames", "-z", "HEAD"]);
    return diff.status === 0 ? records(diff.stdout) : [];
  };

  // Open entries: { label, onOriginOnly, worktree, changed: Set }.
  const open = new Map();
  const skipNames = new Set(["main", "dev", name]);
  if (current?.branch) skipNames.add(current.branch);
  for (const [branch, tips] of branches) {
    if (skipNames.has(branch)) continue;
    const changed = new Set();
    let isOpen = false;
    for (const sha of [tips.local, tips.remote].filter(Boolean)) {
      if (contained(sha)) continue;
      isOpen = true;
      const files = changedSince(sha);
      if (files === null) return { code: 2, lines: [`eol-branches: could not read the changes of ${branch}`] };
      for (const file of files) changed.add(file);
    }
    if (isOpen) open.set(branch, { label: branch, onOriginOnly: tips.local === undefined, worktree: "", changed });
  }

  const alone = [];
  for (const entry of others) {
    const files = uncommitted(entry.path);
    let target = entry.branch ? open.get(entry.branch) : undefined;
    if (target) {
      target.worktree = entry.path;
      for (const file of files) target.changed.add(file);
      continue;
    }
    if (entry.detached && entry.head && !contained(entry.head)) {
      const committed = changedSince(entry.head) ?? [];
      target = { label: `detached ${entry.head.slice(0, 7)}`, onOriginOnly: false, worktree: entry.path, changed: new Set([...committed, ...files]) };
      open.set(target.label, target);
      continue;
    }
    if (files.length > 0) alone.push({ label: entry.branch || `detached ${entry.head.slice(0, 7)}`, onOriginOnly: false, worktree: entry.path, changed: new Set(files) });
  }

  const everything = [...open.values(), ...alone];
  const blocking = [];
  const clean = [];
  for (const entry of everything) {
    const overlap = [...entry.changed].filter((file) => set.has(file)).sort();
    if (overlap.length > 0) blocking.push({ ...entry, overlap });
    else if (open.has(entry.label)) clean.push(entry.label);
  }
  const cleanLine = clean.length > 0 ? [`Open branches that merge cleanly: ${clean.sort().join(", ")}`] : [];

  if (blocking.length === 0) {
    if (open.size === 0) return done(0, [`eol-branches: ${set.size} file(s) would change, no open branch (${name} is the integration branch), nothing can conflict`]);
    return done(0, [`eol-branches: ${set.size} file(s) would change, but no open branch changed one of them`, ...cleanLine]);
  }
  const out = [`eol-branches: ${blocking.length} open branch(es) changed files the line-ending renormalize would change; the row Line endings LF waits (P-GIT-12):`];
  for (const entry of blocking) {
    const shown = entry.overlap.slice(0, SHOWN_FILES).join(", ");
    const more = entry.overlap.length > SHOWN_FILES ? ` and ${entry.overlap.length - SHOWN_FILES} more` : "";
    out.push(`  ${entry.label}${entry.onOriginOnly ? " (on origin)" : ""}${entry.worktree ? ` in ${entry.worktree}` : ""}: ${entry.overlap.length} file(s): ${shown}${more}`);
  }
  out.push(...cleanLine);
  out.push(`Way out: merge each branch into ${name}, or delete it when it is abandoned (and commit or discard the changes of a worktree), then run \`migrate tools\` again.`);
  out.push(`A branch that still conflicts after the migration: \`git merge -X renormalize ${name}\`, then \`git add --renormalize .\` and a commit.`);
  return done(1, out);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { code, lines: output } = run(process.argv.slice(2));
  console.log(output.join("\n"));
  process.exitCode = code;
}
