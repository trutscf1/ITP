#!/usr/bin/env node
// Merges by hand, without an AI agent, the way gam-ai-knowledge/WORKFLOW.md prescribes (gam-engineering).
//
// Copied into the project by /gam-engineering migrate tools; do not edit it per project. Node only, no dependencies; the
// same on Windows, macOS, and Linux. Git, gh, and glab are started without a shell.
//
//   node gam-engineering/tools/merge.mjs <branch> [--via Local|Host]
//   node gam-engineering/tools/merge.mjs --release <MAJOR.MINOR.PATCH> [--via Local|Host] [--notes-file <file>]
//   options: --skip-doc-check  --allow-closing-keywords  --yes  --wait-seconds <n>  --poll-seconds <n>  --log-file <file>
// Every option may also be written the PowerShell way (-Branch, -Release, -Via, -NotesFile, -SkipDocCheck,
// -AllowClosingKeywords, -Yes, -WaitSeconds, -PollSeconds, -LogFile), in any case, as the PowerShell wrapper next to
// this file forwards them; --option=value works too. The first word that is no option is the branch.
//
// Two jobs, both with merge commits only (no squash, no rebase, P-GIT-3):
//   - Work merge: a work branch (feature/..., fix/..., concept/..., chore/...) into the integration branch, then the
//                 branch is deleted.
//   - Release:    dev into main (branch model dev only), the annotated tag v<version> on main, and the release on the
//                 git host.
//
// The integration branch follows env.GAM_ENGINEERING_BRANCHES in .claude/settings.json (P-GIT-9): dev when it is missing or
// 'dev', main when it is 'trunk'. In trunk mode a release is only the tag on main.
//
// --via Local (default) merges with git on this computer and pushes. This only works where the target branch accepts a
// direct push. If they are protected (the standard setup), use --via Host: the open merge request (GitLab, needs glab)
// or pull request (GitHub, needs gh) is merged on the host instead.
//
// The script cannot judge the Definition of Done; it asks you to confirm it. Without a console to answer on (input
// redirected, as in an agent run) it does not wait: it stops at once unless --yes is given.
//
// --via Host reports success only when the host says the MR/PR is merged. A host that only schedules the merge (GitLab
// "Will auto-merge" while the pipeline runs) is waited for, up to --wait-seconds; if it is still open then, the script says
// so and ends with exit code 3, never with "Merged".
//
// Before a work merge (and, in branch model dev, before the release merge) it stops when a commit message would close an
// issue once it reaches main: a closing keyword (close, fix, resolve, implement) before #<n> (P-GIT-10). Reword the commit,
// or pass --allow-closing-keywords when closing is meant.
//
// A local work merge also stops when the branch does not contain the tip of the integration branch: the merge result would
// be a state the pipeline never ran on. Merge the integration branch into the work branch and run the pipeline first.
//
// --log-file appends everything the script prints, and every error, to that file (relative to the repository root); the
// default is gam-engineering/reports/merge.log in the git-ignored reports folder, and an empty string switches the log off.
//
// Exit codes: 0 merged (and, for a release, tagged), 1 failed or stopped, 3 merge scheduled on the host but not done within
// --wait-seconds. The step-by-step guide, including what to update afterwards, is gam-engineering/tools/MERGING.md.
import { spawnSync } from "node:child_process";
import { accessSync, appendFileSync, constants, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, dirname, extname, isAbsolute, join, resolve } from "node:path";
import { createInterface } from "node:readline/promises";

const windows = process.platform === "win32";
const PRODUCTION = "main";

// ---------- small helpers ----------

const text = (value) => (value === undefined || value === null ? "" : String(value));
// PowerShell compares strings without regard to case; the script keeps that for the options and the branch names.
const same = (a, b) => text(a).toLowerCase() === text(b).toLowerCase();
const colors = { cyan: 36, red: 31, yellow: 33, green: 32 };
const lines = (value) => text(value).split(/\r?\n/).filter(Boolean);
const sleep = (milliseconds) => new Promise((done) => setTimeout(done, milliseconds));

// ---------- log and output ----------

let logPath = null;
const record = (piece) => {
  if (!logPath) return;
  try {
    appendFileSync(logPath, piece);
  } catch {
    // a log that cannot be written never stops a merge
  }
};
// Everything the script prints goes to the console and, once it is open, to the log.
const say = (line = "", color, stream = process.stdout) => {
  const paint = color && stream.isTTY && !process.env.NO_COLOR;
  stream.write(`${paint ? `\u001b[${colors[color]}m${line}\u001b[0m` : line}\n`);
  record(`${line}\n`);
};
// What a child printed, passed on as it is.
const relay = (result) => {
  if (result.stdout) {
    process.stdout.write(result.stdout);
    record(result.stdout);
  }
  if (result.stderr) {
    process.stderr.write(result.stderr);
    record(result.stderr);
  }
};

// A failure is written to the console and the log, then the script ends with exit code 1; `Exit` ends it with another code.
class Failure extends Error {}
class Exit extends Error {
  constructor(code) {
    super(`exit ${code}`);
    this.code = code;
  }
}
const fail = (message) => {
  throw new Failure(message);
};

// ---------- finding and starting tools (the way local-pipeline.mjs does it) ----------

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

// The executable a word names, on the search path; null when there is none. On Windows only a name with an extension of
// PATHEXT counts.
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

// An argument as cmd.exe must read it: quoted when it is empty or holds a space or a character cmd treats as its own.
const quoteForCmd = (argument) => (argument !== "" && !/[\s"&|<>^()!%]/.test(argument) ? argument : `"${argument.replace(/(\\*)"/g, '$1$1\\"').replace(/(\\+)$/, "$1$1")}"`);

// { file, args, options } for a spawn without a shell; a .cmd or .bat on Windows goes through cmd.exe.
function launch(application, args) {
  const options = { env: process.env, windowsHide: true };
  if (windows && /\.(cmd|bat)$/i.test(application)) {
    return { file: process.env.ComSpec || "cmd.exe", args: ["/d", "/s", "/c", `"${[application, ...args].map(quoteForCmd).join(" ")}"`], options: { ...options, windowsVerbatimArguments: true } };
  }
  return { file: application, args, options };
}

// One call with its output kept: { status, stdout, stderr }; status 127 when the tool is missing.
function exec(word, args, cwd) {
  const application = findApplication(word);
  if (!application) return { status: 127, stdout: "", stderr: `command not found: ${word}\n` };
  const { file, args: fileArgs, options } = launch(application, args);
  const result = spawnSync(file, fileArgs, { ...options, ...(cwd ? { cwd } : {}), encoding: "utf8", stdio: ["inherit", "pipe", "pipe"], maxBuffer: 1 << 28 });
  if (result.error) return { status: 127, stdout: "", stderr: `${result.error.message}\n` };
  return { status: result.status ?? 1, stdout: text(result.stdout), stderr: text(result.stderr) };
}

// git without a shell; a failure ends the script with git's own words.
const git = (...args) => gitAt(null, ...args);
// The same in another checkout (the worktree that holds the target branch); null is the current folder.
function gitAt(cwd, ...args) {
  const result = exec("git", args, cwd);
  if (result.status !== 0) fail(`git ${args.join(" ")} failed${cwd ? ` in ${cwd}` : ""}:\n${lines(result.stdout + result.stderr).join("\n")}`);
  return lines(result.stdout);
}
// git with its output shown; the exit code is the caller's to judge.
const gitShown = (...args) => gitShownAt(null, ...args);
function gitShownAt(cwd, ...args) {
  const result = exec("git", args, cwd);
  relay(result);
  return result.status;
}
// git, quiet; only its exit code and output are wanted.
const gitQuiet = (...args) => exec("git", args);
const testGitRef = (ref) => gitQuiet("rev-parse", "--verify", "--quiet", ref).status === 0;

// ---------- worktrees and the merge lock (P-WS-13) ----------
//
// Several sessions may work in parallel, each in its own git worktree (Orca, implement-all). A branch can be checked out in
// only one worktree, so the script never switches branches in the caller's folder: it merges in the worktree that holds
// the target branch, or, when no worktree holds it, in a temporary one it removes again. One lock file in the common git
// folder lets only one merge or release run at a time; a lock older than 30 minutes, or one whose process is gone, is
// taken over with a warning.

const samePath = (a, b) => (windows ? same(resolve(a), resolve(b)) : resolve(a) === resolve(b));

// Every worktree of the repository: [{ path, branch }] (branch without refs/heads/, "" when detached).
function worktrees() {
  const list = [];
  for (const line of lines(gitQuiet("worktree", "list", "--porcelain").stdout)) {
    if (line.startsWith("worktree ")) list.push({ path: line.slice(9), branch: "" });
    else if (line.startsWith("branch refs/heads/") && list.length > 0) list[list.length - 1].branch = line.slice(18);
  }
  return list;
}

// The common git folder all worktrees share (absolute).
const commonGitDir = () => resolve(git("rev-parse", "--git-common-dir")[0]);

// The folder to work on a branch in: { path, temporary }. The worktree that holds the branch (the current folder or
// another one), when it is clean. When no worktree holds it, the main folder switches to it as before (a repo without
// linked worktrees behaves as it always did); a linked worktree gets a new temporary worktree on the branch instead.
function targetCheckout(branch) {
  const holder = worktrees().find((tree) => tree.branch === branch);
  if (holder) {
    if (lines(exec("git", ["status", "--porcelain"], holder.path).stdout).length > 0) {
      fail(`${branch} is checked out in ${holder.path} with uncommitted changes. Commit or stash them there, then run again.`);
    }
    return { path: holder.path, temporary: false };
  }
  const linked = resolve(git("rev-parse", "--git-dir")[0]) !== commonGitDir();
  if (!linked) {
    git("switch", branch);
    return { path: process.cwd(), temporary: false };
  }
  const path = join(tmpdir(), `gam-merge-${branch.replace(/[^\w.-]+/g, "-")}-${process.pid}`);
  git("worktree", "add", "--quiet", path, branch);
  return { path, temporary: true };
}

// Removes a temporary worktree again, never with --force; a refusal is reported, not hidden.
function releaseCheckout(target) {
  if (!target?.temporary) return;
  if (gitQuiet("worktree", "remove", target.path).status !== 0) say(`Could not remove the temporary worktree ${target.path}; remove it with 'git worktree remove ${target.path}'.`, "yellow");
}

const LOCK_MINUTES = 30;
function processAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === "EPERM";
  }
}

// Runs fn while holding <common git dir>/gam-merge.lock.
async function withMergeLock(what, fn) {
  const lockPath = join(commonGitDir(), "gam-merge.lock");
  const mine = { pid: process.pid, worktree: process.cwd(), what, time: new Date().toISOString() };
  for (let attempt = 0; ; attempt += 1) {
    try {
      writeFileSync(lockPath, `${JSON.stringify(mine)}\n`, { flag: "wx" });
      break;
    } catch (error) {
      if (error.code !== "EEXIST" || attempt > 0) fail(`Cannot take the merge lock ${lockPath}: ${error.message}`);
      let held = null;
      try {
        held = JSON.parse(readFileSync(lockPath, "utf8"));
      } catch {
        // an unreadable lock counts as stale
      }
      const age = held ? Date.now() - Date.parse(held.time) : Infinity;
      if (held && age < LOCK_MINUTES * 60 * 1000 && processAlive(held.pid)) {
        fail(`Another merge is running (${held.what}, from ${held.worktree}, since ${held.time}). Wait until it is done, then run again.`);
      }
      say(`Taking over a stale merge lock (${held ? `${held.what}, from ${held.worktree}, since ${held.time}` : "unreadable"}).`, "yellow");
      rmSync(lockPath, { force: true });
    }
  }
  try {
    return await fn();
  } finally {
    rmSync(lockPath, { force: true });
  }
}
// gh or glab with its output shown; the exit code is the caller's to judge.
function hostShown(cli, ...args) {
  const result = exec(cli, args);
  relay(result);
  return result.status;
}
// gh or glab, quiet: the output lines, or null when the call fails.
function hostAsk(cli, ...args) {
  const result = exec(cli, args);
  return result.status === 0 ? lines(result.stdout) : null;
}

// ---------- arguments ----------

// --option, -Option, --option=value, in any case.
const OPTIONS = {
  branch: "value",
  release: "value",
  via: "value",
  notesfile: "value",
  skipdoccheck: "switch",
  allowclosingkeywords: "switch",
  yes: "switch",
  waitseconds: "value",
  pollseconds: "value",
  logfile: "value",
};

function parseArguments(argv) {
  const options = { branch: "", release: "", via: "Local", notesFile: "", skipDocCheck: false, allowClosingKeywords: false, yes: false, waitSeconds: 900, pollSeconds: 15, logFile: "gam-engineering/reports/merge.log" };
  const rest = [...argv];
  while (rest.length > 0) {
    const word = rest.shift();
    const match = /^--?([A-Za-z][A-Za-z-]*)(?:[=:]([\s\S]*))?$/.exec(word);
    if (!match) {
      if (options.branch) fail(`unknown argument: ${word}`);
      options.branch = word;
      continue;
    }
    const name = match[1].toLowerCase().replaceAll("-", "");
    if (!OPTIONS[name]) fail(`unknown argument: ${word}`);
    let value;
    if (OPTIONS[name] === "switch") {
      value = match[2] === undefined ? true : !/^(false|0|\$false)$/i.test(match[2]);
    } else if (match[2] !== undefined) {
      value = match[2];
    } else {
      if (rest.length === 0) fail(`${word} needs a value`);
      value = rest.shift();
    }
    if (name === "via") {
      const via = ["Local", "Host"].find((choice) => same(choice, value));
      if (!via) fail(`${word} must be Local or Host`);
      options.via = via;
    } else if (name === "waitseconds" || name === "pollseconds") {
      if (!/^\d+$/.test(text(value))) fail(`${word} must be a whole number`);
      options[name === "waitseconds" ? "waitSeconds" : "pollSeconds"] = Number(value);
    } else if (name === "notesfile") options.notesFile = value;
    else if (name === "skipdoccheck") options.skipDocCheck = value;
    else if (name === "allowclosingkeywords") options.allowClosingKeywords = value;
    else if (name === "logfile") options.logFile = value;
    else options[name] = value;
  }
  if (options.branch && options.release) fail("Give a branch to merge or --release <version>, not both.");
  if (!options.branch && !options.release) fail("Give the branch to merge (merge.mjs <branch>), or --release <version>.");
  return options;
}

// ---------- the steps ----------

const closingPattern = /\b(?:clos(?:e[sd]?|ing)|fix(?:e[sd]|ing)?|resolv(?:e[sd]?|ing)|implement(?:s|ed|ing)?):? +(?:issues? +)?(?:[\w.-]+(?:\/[\w.-]+)*)?#\d+/gi;

async function confirmStep(options, question) {
  if (options.yes) return;
  // No console to answer on: stop at once instead of waiting for an answer that never comes.
  if (!process.stdin.isTTY) fail(`No console to answer '${question}' (input is redirected, as in an agent run). Check it, then run again with -Yes.`);
  const prompt = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await prompt.question(`${question} [y/N] `);
  prompt.close();
  record(`${question} [y/N] ${answer}\n`);
  if (!/^(y|yes|j|ja)$/i.test(answer.trim())) {
    say("Stopped. Nothing more was changed.", "yellow");
    throw new Exit(1);
  }
}

async function confirmDefinitionOfDone(options, what) {
  say();
  say(`Before ${what}, check by hand (gam-ai-knowledge/WORKFLOW.md, Definition of Done):`, "cyan");
  say("  - every acceptance criterion has a passing test carrying its AC ID");
  say("  - the pipeline is green and no review thread is open");
  say("  - another person reviewed it and left a comment on the content");
  say("  - concept document and status (ROADMAP, story status, BACKLOG, sprint file) are updated");
  await confirmStep(options, "All of this holds?");
}

function getGitHost() {
  const url = git("remote", "get-url", "origin")[0] ?? "";
  if (/github/i.test(url)) return "github";
  if (/gitlab/i.test(url)) return "gitlab";
  return fail(`Cannot tell GitLab from GitHub by the remote '${url}'. Use -Via Local or merge in the web interface.`);
}

function assertCli(gitHost) {
  const cli = gitHost === "github" ? "gh" : "glab";
  if (!findApplication(cli)) fail(`-Via Host on ${gitHost} needs the '${cli}' CLI (logged in). Install it or merge in the web interface.`);
  return cli;
}

const parseJson = (outputLines) => {
  try {
    return JSON.parse(outputLines.join("\n"));
  } catch {
    return null;
  }
};

// The number of the open MR/PR of a source branch, read before the merge: the branch may be gone afterwards.
function getRequestId(cli, sourceBranch) {
  let id = null;
  if (cli === "gh") id = hostAsk("gh", "pr", "view", sourceBranch, "--json", "number", "--jq", ".number")?.[0];
  else {
    const json = hostAsk("glab", "mr", "view", sourceBranch, "--output", "json");
    id = json ? parseJson(json)?.iid : null;
  }
  if (!id) fail(`No open MR/PR for '${sourceBranch}' on the host.`);
  return `${id}`;
}

// The newest MR/PR of a source branch in any state, for the release check after the merge call.
function getRequestIdAny(cli, sourceBranch) {
  let id = null;
  if (cli === "gh") id = hostAsk("gh", "pr", "list", "--head", sourceBranch, "--state", "all", "--limit", "1", "--json", "number", "--jq", ".[0].number")?.[0];
  else {
    const json = hostAsk("glab", "mr", "list", "--source-branch", sourceBranch, "--all", "--per-page", "1", "--output", "json");
    id = json ? [parseJson(json)].flat()[0]?.iid : null;
  }
  if (!id) fail(`No MR/PR for '${sourceBranch}' on the host.`);
  return `${id}`;
}

// The state of an MR/PR as merged, open, or closed, from the host itself.
function getRequestState(cli, id) {
  let state = "";
  if (cli === "gh") state = text(hostAsk("gh", "pr", "view", id, "--json", "state", "--jq", ".state")?.[0]);
  else {
    const json = hostAsk("glab", "mr", "view", id, "--output", "json");
    state = json ? text(parseJson(json)?.state) : "";
  }
  state = state.trim().toLowerCase();
  if (state === "merged") return "merged";
  if (["open", "opened", "locked"].includes(state)) return "open";
  if (state === "closed") return "closed";
  return "unknown";
}

// After the merge call: success only when the host says merged. A scheduled merge is waited for; still open after
// --wait-seconds ends the script with exit code 3, a closed MR/PR with an error.
async function waitMerged(options, cli, id, what) {
  const deadline = Date.now() + options.waitSeconds * 1000;
  while (true) {
    const state = getRequestState(cli, id);
    if (state === "merged") return;
    if (state === "closed") fail(`The host closed ${what} without merging it.`);
    if (Date.now() >= deadline) {
      const view = cli === "gh" ? `gh pr view ${id}` : `glab mr view ${id}`;
      say(`Not merged yet: the host has scheduled ${what} (state ${state}), e.g. to merge when its pipeline is green. Check with '${view}'; the steps after the merge wait until it is merged.`, "yellow");
      throw new Exit(3);
    }
    say(`Waiting for the host to merge ${what} (state ${state}) ...`);
    await sleep(Math.max(1, options.pollSeconds) * 1000);
  }
}

function invokeDocCheck(options, cwd = process.cwd()) {
  if (options.skipDocCheck) return true;
  // gam-ai-knowledge/, or a former folder in a project not yet moved (P-DOC-10, P-DOC-11).
  const docCheck = ["gam-ai-knowledge/tools/doc-check.mjs", "gam-engineering/tools/doc-check.mjs", "humanengineering/tools/doc-check.mjs"].find((path) => existsSync(join(cwd, path)));
  if (!docCheck) return true;
  const result = spawnSync(process.execPath, [docCheck], { cwd, encoding: "utf8", stdio: ["inherit", "pipe", "pipe"] });
  relay(result);
  return result.status === 0;
}

// A commit message that would close an issue once it reaches the default branch (P-GIT-10): GitLab's default closing
// pattern (close, fix, resolve, implement in their forms) and GitHub's keywords, then an issue reference. Only the MR/PR
// description closes an issue on purpose (Closes #<issue>).
function assertNoClosingKeyword(options, range, target) {
  if (options.allowClosingKeywords) return;
  const result = gitQuiet("log", "--format=%h %B%x1e", range);
  const found = [];
  for (const entry of (result.status === 0 ? result.stdout : "").split("\x1e")) {
    const body = entry.trim();
    if (!body) continue;
    const hash = body.split(" ")[0];
    for (const match of body.matchAll(closingPattern)) found.push(`  ${hash}: ${match[0]}`);
  }
  if (found.length === 0) return;
  say(`These commit messages would close issues once they reach ${target}:`, "red");
  for (const line of found) say(line);
  fail("Reword them on the branch (P-GIT-10), e.g. 'next: issue #2'; only the MR/PR description closes an issue. Pass -AllowClosingKeywords when closing is meant.");
}

function showStatusReminder(reminders) {
  say();
  say('Still to do by hand unless the MR already carried it (gam-engineering/tools/MERGING.md, "After the merge"):', "cyan");
  for (const line of reminders) say(`  - ${line}`);
}

// ---------- the two jobs ----------

async function workMerge(options, context) {
  const { branch, via } = options;
  const { integration, integratedStage } = context;
  if (same(branch, integration) || same(branch, PRODUCTION)) fail(`'${branch}' is not a work branch. For a release use -Release <version>.`);
  if (!testGitRef(`origin/${branch}`) && !testGitRef(branch)) fail(`Branch '${branch}' exists neither locally nor on origin.`);
  // In branch model dev the commits reach the default branch only with the release, which checks them again.
  assertNoClosingKeyword(options, `origin/${integration}..${testGitRef(`origin/${branch}`) ? `origin/${branch}` : branch}`, PRODUCTION);

  await confirmDefinitionOfDone(options, `merging '${branch}' into ${integration}`);

  if (via === "Host") {
    const gitHost = getGitHost();
    const cli = assertCli(gitHost);
    await confirmStep(options, `Merge the open MR/PR of '${branch}' into ${integration} on ${gitHost} with a merge commit?`);
    const requestId = getRequestId(cli, branch);
    const status = cli === "gh" ? hostShown("gh", "pr", "merge", requestId, "--merge", "--delete-branch") : hostShown("glab", "mr", "merge", requestId, "--remove-source-branch", "--yes");
    if (status !== 0) fail("The host refused the merge (see above): missing approval, red pipeline, or no open MR/PR.");
    await waitMerged(options, cli, requestId, `the MR/PR of '${branch}'`);
    git("fetch", "origin", "--prune");
  } else {
    const source = testGitRef(`origin/${branch}`) ? `origin/${branch}` : branch;
    await withMergeLock(`merge of '${branch}' into ${integration}`, async () => {
      const target = targetCheckout(integration);
      const at = (...args) => gitAt(target.path, ...args);
      const shown = (...args) => gitShownAt(target.path, ...args);
      try {
        at("merge", "--ff-only", `origin/${integration}`);
        if (gitQuiet("merge-base", "--is-ancestor", source, integration).status === 0) fail(`'${branch}' is already merged into ${integration}.`);
        if (gitQuiet("merge-base", "--is-ancestor", `origin/${integration}`, source).status !== 0) {
          fail(`'${branch}' is behind ${integration}, so the merge would produce a state no pipeline ran on. Merge ${integration} into the branch, run the pipeline, push, and run again.`);
        }

        if (shown("merge", "--no-ff", "--no-commit", source) !== 0) {
          shown("merge", "--abort");
          fail(`Merge conflict between '${branch}' and ${integration}. Merge ${integration} into the branch, resolve the conflict there, push, and run again.`);
        }
        if (!invokeDocCheck(options, target.path)) {
          shown("merge", "--abort");
          fail("doc-check reports errors on the merge result. Fix them on the branch first.");
        }
        at("commit", "-m", `Merge branch '${branch}' into ${integration}`);

        await confirmStep(options, `Push ${integration} to origin and delete '${branch}'?`);
        if (shown("push", "origin", integration) !== 0) {
          fail(`Push refused - ${integration} is probably protected. Undo with 'git -C "${target.path}" reset --hard origin/${integration}' and use -Via Host.`);
        }
      } finally {
        releaseCheckout(target);
      }
    });
    // A branch still checked out in a worktree (the caller's own, or an Orca workspace) stays: the worktree goes first,
    // then the branch, both by whoever made the worktree.
    const holder = worktrees().find((tree) => tree.branch === branch);
    if (holder) say(`Kept the local branch '${branch}': it is checked out in ${holder.path}. Remove that worktree, then the branch.`, "yellow");
    // Deleted from any folder: checked against the integration branch, not against this folder's HEAD.
    else if (testGitRef(branch) && gitQuiet("merge-base", "--is-ancestor", branch, integration).status === 0) git("branch", "-D", branch);
    if (testGitRef(`origin/${branch}`)) git("push", "origin", "--delete", branch);
  }

  say(`Merged '${branch}' into ${integration}.`, "green");
  showStatusReminder([
    "position row in ROADMAP-DETAILS.md (or your STATUS.md) closed, log entry added",
    "story status: done, with its rows in work-items/BACKLOG.md and the sprint file",
    `ROADMAP stage '${integratedStage}' once the epic's last story is merged`,
    "close the issue (hosts close issues automatically only on the default branch), and the epic issue after its last story",
    "then: node gam-ai-knowledge/tools/doc-check.mjs --status reports no STATUS and no MEMORY error",
  ]);
}

async function release(options, context) {
  const { release: version, via } = options;
  const { integration, branchModel } = context;
  if (!/^\d+\.\d+\.\d+$/.test(version)) fail(`Version '${version}' is not MAJOR.MINOR.PATCH (e.g. 0.3.0).`);
  const tag = `v${version}`;
  if (testGitRef(`refs/tags/${tag}`)) fail(`Tag ${tag} already exists.`);

  const described = gitQuiet("describe", "--tags", "--abbrev=0", `origin/${PRODUCTION}`);
  const lastTag = described.status === 0 ? lines(described.stdout)[0] : null;
  const range = lastTag ? `${lastTag}..origin/${integration}` : `origin/${integration}`;
  const logged = gitQuiet("log", "--first-parent", "--merges", "--format=- %s", range);
  const merges = logged.status === 0 ? lines(logged.stdout) : [];
  const since = lastTag ?? "the start";
  if (merges.length === 0) fail(`No merges on ${integration} since ${since} - nothing to release.`);

  say(`Release ${tag} - merged into ${integration} since ${since}:`, "cyan");
  for (const merge of merges) say(`  ${merge}`);
  say("Version rule (VERSIONING.md): PATCH = only fixes, MINOR = new features, MAJOR = breaks existing use.");
  if (branchModel !== "trunk") assertNoClosingKeyword(options, `origin/${PRODUCTION}..origin/${integration}`, PRODUCTION);
  await confirmDefinitionOfDone(options, `releasing ${tag} on ${PRODUCTION} (every story since the last release)`);

  await withMergeLock(`release ${tag}`, () => releaseSteps(options, context, { tag, merges }));
  await publishRelease(options, context, { tag, merges });
}

// The release merge and the tag, under the merge lock; never switches branches in the caller's folder (P-WS-13).
async function releaseSteps(options, context, { tag, merges }) {
  const { via } = options;
  const { integration, branchModel } = context;
  if (branchModel === "trunk") {
    // Trunk mode: no release merge; the tag goes on the current main.
    const target = targetCheckout(PRODUCTION);
    try {
      gitAt(target.path, "merge", "--ff-only", `origin/${PRODUCTION}`);
      if (!invokeDocCheck(options, target.path)) fail(`doc-check reports errors on ${PRODUCTION}. Fix them through a work branch first.`);
      await confirmStep(options, `Tag ${tag} on ${PRODUCTION} and push the tag?`);
    } finally {
      releaseCheckout(target);
    }
  } else if (via === "Host") {
    const gitHost = getGitHost();
    const cli = assertCli(gitHost);
    await confirmStep(options, `Open (if needed) and merge the release MR/PR ${integration} -> ${PRODUCTION} on ${gitHost}?`);
    const title = `Release ${tag}`;
    const body = `Release ${tag}\n\n${merges.join("\n")}`;
    let status;
    if (cli === "gh") {
      const open = (hostAsk("gh", "pr", "list", "--base", PRODUCTION, "--head", integration, "--state", "open", "--json", "number", "--jq", ".[0].number") ?? []).some((line) => line !== "null");
      if (!open) hostShown("gh", "pr", "create", "--base", PRODUCTION, "--head", integration, "--title", title, "--body", body);
      status = hostShown("gh", "pr", "merge", integration, "--merge");
    } else {
      const open = (hostAsk("glab", "mr", "list", "--source-branch", integration, "--target-branch", PRODUCTION) ?? []).some((line) => line.startsWith("!"));
      if (!open) hostShown("glab", "mr", "create", "--source-branch", integration, "--target-branch", PRODUCTION, "--title", title, "--description", body, "--yes");
      status = hostShown("glab", "mr", "merge", integration, "--yes");
    }
    if (status !== 0) fail("The host refused the release merge (see above). The MR/PR stays open.");
    // The tag waits until main really holds the release.
    await waitMerged(options, cli, getRequestIdAny(cli, integration), `the release MR/PR ${integration} -> ${PRODUCTION}`);
    git("fetch", "origin", "--prune");
    const target = targetCheckout(PRODUCTION);
    try {
      gitAt(target.path, "merge", "--ff-only", `origin/${PRODUCTION}`);
    } finally {
      releaseCheckout(target);
    }
  } else {
    const target = targetCheckout(PRODUCTION);
    const shown = (...args) => gitShownAt(target.path, ...args);
    try {
      gitAt(target.path, "merge", "--ff-only", `origin/${PRODUCTION}`);
      if (shown("merge", "--no-ff", "--no-commit", `origin/${integration}`) !== 0) {
        shown("merge", "--abort");
        fail(`Merge conflict between ${integration} and ${PRODUCTION}. ${PRODUCTION} should only ever receive ${integration} - find out who committed on ${PRODUCTION}.`);
      }
      if (!invokeDocCheck(options, target.path)) {
        shown("merge", "--abort");
        fail(`doc-check reports errors on the release. Fix them on ${integration} first.`);
      }
      gitAt(target.path, "commit", "-m", `Release ${tag}`);
      await confirmStep(options, `Push ${PRODUCTION} to origin?`);
      if (shown("push", "origin", PRODUCTION) !== 0) {
        fail(`Push refused - ${PRODUCTION} is probably protected. Undo with 'git -C "${target.path}" reset --hard origin/${PRODUCTION}' and use -Via Host.`);
      }
    } finally {
      releaseCheckout(target);
    }
  }

  git("tag", "-a", tag, "-m", `Release ${tag}`, PRODUCTION);
  git("push", "origin", tag);
}

// The release on the git host and the reminder; outside the lock, nothing here changes a branch.
async function publishRelease(options, context, { tag, merges }) {
  const { integration, branchModel } = context;
  say(`${branchModel === "trunk" ? "Tagged" : `Merged ${integration} into ${PRODUCTION} and tagged`} ${tag} on ${PRODUCTION} and pushed the tag.`, "green");

  let notesPath = options.notesFile;
  if (!notesPath) {
    notesPath = join(tmpdir(), `release-notes-${tag}.md`);
    writeFileSync(notesPath, `${[`## ${tag}`, "", ...merges].join("\n")}\n`);
    say(`No -NotesFile: draft notes from the merge commits written to ${notesPath} - edit the release on the host so it lists the stories with ID and title.`, "yellow");
  }

  let cliForRelease = null;
  try {
    cliForRelease = assertCli(getGitHost());
  } catch (error) {
    if (!(error instanceof Failure)) throw error;
    say(error.message, "yellow");
  }
  let releaseStatus = 1;
  if (cliForRelease === "gh") releaseStatus = hostShown("gh", "release", "create", tag, "--title", tag, "--notes-file", notesPath);
  else if (cliForRelease === "glab") releaseStatus = hostShown("glab", "release", "create", tag, "--name", tag, "--notes-file", notesPath);
  if (!cliForRelease || releaseStatus !== 0) {
    say(`Publish the release for ${tag} in the web interface of the git host (Releases -> New release).`, "yellow");
  }

  showStatusReminder([
    "ROADMAP.md: stage 'released' for every included feature",
    `epic.md of every completed epic: shipped: "${tag}"`,
    "position rows closed, log entry added",
    "then: node gam-ai-knowledge/tools/doc-check.mjs --status reports no STATUS and no MEMORY error",
  ]);
}

// ---------- main ----------

async function main() {
  const options = parseArguments(process.argv.slice(2));

  if (!testGitRef("HEAD")) fail("Run this script in the root of a git repository.");
  process.chdir(git("rev-parse", "--show-toplevel")[0]);

  if (options.logFile) {
    // Relative to the main worktree, so the log outlives a removed linked worktree (Orca, implement-all).
    const main = worktrees()[0]?.path ?? process.cwd();
    const path = isAbsolute(options.logFile) ? options.logFile : resolve(main, options.logFile);
    mkdirSync(dirname(path), { recursive: true });
    logPath = path;
    record(`---- merge.mjs ${new Date().toISOString()} ${process.argv.slice(2).join(" ")} ----\n`);
  }

  if (git("status", "--porcelain").length > 0) fail("The working tree has uncommitted changes. Commit or stash them first.");

  git("fetch", "origin", "--prune", "--tags");

  // Branch model (P-GIT-9): only the committed settings file counts, under the current or a former key prefix
  // (P-DOC-10); missing or unknown means dev.
  let branchModel = "dev";
  try {
    const settings = JSON.parse(readFileSync(".claude/settings.json", "utf8").replace(/^﻿/, ""));
    const branches = [settings.env?.GAM_ENGINEERING_BRANCHES, settings.env?.HUMANENGINEERING_BRANCHES, settings.env?.ENGINEERING_HUMAN_BRANCHES].find(Boolean);
    if (same(branches, "trunk")) branchModel = "trunk";
  } catch {
    // no settings file, or none we can read: branch model dev
  }
  const context = {
    branchModel,
    integration: branchModel === "trunk" ? PRODUCTION : "dev",
    integratedStage: branchModel === "trunk" ? "merged" : "in dev",
  };

  if (options.release) await release(options, context);
  else await workMerge(options, context);
}

try {
  await main();
} catch (error) {
  if (error instanceof Exit) process.exitCode = error.code;
  else {
    say(`ERROR: ${error instanceof Failure ? error.message : (error?.stack ?? error)}`, "red", process.stderr);
    process.exitCode = 1;
  }
}
