#!/usr/bin/env node
// Local pipeline (gam-engineering): runs every check recorded in gam-engineering/pipeline.json.
//
// Copied into the project by /gam-engineering pipeline (P-PIPE-1); do not edit it per project - a new check changes the
// decision or the check catalog, never this script. Node only, no dependencies; the same on Windows, macOS, and Linux.
//   node gam-engineering/local-pipeline.mjs [--tier merge|release] [--skip <kind>[,<kind>]] [--jobs <n>] [--changed-files <file>[,<file>]]
// Every option may also be written the PowerShell way (-Tier, -Skip, -Jobs, -ChangedFiles), in any case, as the PowerShell
// wrapper next to this file forwards them; --option=value works too.
//
//   - reads the decision gam-engineering/pipeline.json and the catalog gam-engineering/tools/pipeline-catalog.json
//   - runs each recorded check in order: lint, tests, and the catalog's projectCommand kinds (stack-lint, custom) as
//     their recorded command line, every other kind with the catalog's calls for its kind and language
//   - cwd of a check (PP-F-32): a project command runs in that folder; a catalog call gets --cwd=<folder> through
//     {cwdFlag}; {versionFlag} becomes --version=<version>, {checkIndex} the place of the check in pipeline.json
//   - lintOnCommitted on a lint or format check (PP-F-40) runs it through gam-engineering/tools/committed-copy.mjs, on
//     the committed state with LF line endings
//   - a check whose tool is not on the search path fails with the catalog's install hint; a check that needs a
//     container is skipped when no container runtime answers (docker info), which is red only at location local
//   - flow quick (env.GAM_ENGINEERING_FLOW in .claude/settings.json, P-PIPE-3): when no changed file has an extension in
//     the catalog's codeExtensions it runs only the check of kind eol, if one is recorded (QA0016), otherwise nothing;
//     with code changed, only the checks of kind tests, architecture, limits, guard, eol, format, and types (PP-F-23);
//     --changed-files names the changed files instead of asking git (tests)
//   - flow full, tier merge, docsOnly not 'full' in pipeline.json (P-PIPE-6, PP-F-49): when every changed file is a document
//     (the catalog's docsOnly: document path, no code extension, no stack file, not in a data folder) only the checks of
//     the catalog's docsOnly kinds run; the others show as 'skipped by choice' with the reason. Git unable to answer, no
//     changed file, or one doubtful file gives the full run
//   - --tier merge|release (default merge, PP-F-27): release runs every check, merge only the checks whose catalog tier is
//     merge; lint and tests are always merge. The release command calls the runner with --tier release
//   - --skip <kind>[,<kind>] leaves out the checks of those kinds; the report shows them as 'skipped by choice', which is not red (PP-F-26)
//   - a call whose exit code is the catalog entry's skipExit makes the state 'not run', which is not red (PP-F-25)
//   - writes one folder per run, gam-engineering/reports/local-pipeline/<yyyy-MM-dd-HHmmss>/ (git-ignored, PP-F-28): report.md
//     with the overview table and one link per check, and <kind>-<tool>.md with the output of each check; the last 10
//     folders are kept, older ones are deleted. The folder exists from the start (PP-F-46): report.md ends with
//     'running' and shows each check waiting, running since, or its result; an output file appears as soon as its check
//     ends, and a running check of a parallel run writes its output to <kind>-<tool>.running.txt. No time limit
// Exit code 0 (green) only when every check passed, or was skipped while the location is both; otherwise 1 (red).
//   - --jobs <n> runs up to n checks at the same time (PP-F-43), in this process; the default is GAM_PIPELINE_JOBS, else the
//     number of processors, at most 4; --jobs 1 runs them one after the other. A check waits for the checks of the kinds
//     its catalog entry or the decision names in after (the SonarQube scan after the tests). A console shows one live
//     table (check, state, seconds); without one, a line per change. The report keeps the decision's order and adds the
//     seconds of each check
//   - the sast checks of several languages run as one semgrep call with every rule set, so the repo is read once
//
// Starting a tool: no shell. The tool is looked up on the search path (PATH, and PATHEXT on Windows) and started as a
// process of its own. The one exception is a .cmd or .bat file on Windows (npm.cmd, npx.cmd, shims): Node cannot start
// those without cmd.exe, so they go through `cmd.exe /d /s /c` with every argument quoted for cmd.
import { spawn, spawnSync } from "node:child_process";
import { accessSync, appendFileSync, constants, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { cpus } from "node:os";
import { delimiter, dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const windows = process.platform === "win32";
const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
process.chdir(repoRoot);

// {docCheck} is the project's copy of doc-check: gam-ai-knowledge/tools/, or a former folder in a project not yet moved
// (P-DOC-10, P-DOC-11).
const docCheck = ["gam-ai-knowledge/tools/doc-check.mjs", "gam-engineering/tools/doc-check.mjs", "humanengineering/tools/doc-check.mjs"].find((path) => existsSync(join(repoRoot, path))) ?? "gam-ai-knowledge/tools/doc-check.mjs";
const dash = "—";

// ---------- small helpers ----------

const text = (value) => (value === undefined || value === null ? "" : String(value));
// PowerShell compares strings without regard to case; the runner keeps that for kinds, languages, and tiers.
const same = (a, b) => text(a).toLowerCase() === text(b).toLowerCase();
const among = (list, value) => list.some((item) => same(item, value));
const pad2 = (n) => String(n).padStart(2, "0");
const clock = (date = new Date()) => `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
const stampOf = (date) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}-${pad2(date.getHours())}${pad2(date.getMinutes())}${pad2(date.getSeconds())}`;
const colors = { cyan: 36, red: 31, yellow: 33, green: 32 };
const say = (line, color) => {
  const paint = color && process.stdout.isTTY && !process.env.NO_COLOR;
  process.stdout.write(`${paint ? `\u001b[${colors[color]}m${line}\u001b[0m` : line}\n`);
};

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8").replace(/^﻿/, ""));
}

// A recorded check with its fields under the names the runner reads; the field names of the JSON match without regard to case.
const CHECK_FIELDS = ["kind", "language", "tool", "threshold", "native", "tier", "cwd", "version", "after", "lintOnCommitted"];
function normalizeCheck(raw) {
  const check = { ...raw };
  for (const field of CHECK_FIELDS) {
    if (field in check) continue;
    const key = Object.keys(raw ?? {}).find((name) => name.toLowerCase() === field.toLowerCase());
    if (key) check[field] = raw[key];
  }
  return check;
}

// --option, -Option, --option=value, in any case; a list takes every following word up to the next option.
const OPTIONS = { changedfiles: "list", skip: "list", tier: "value", jobs: "value" };
function parseArguments(argv) {
  const options = { changedGiven: false, changedFiles: [], skip: [], tier: "merge", jobs: 0 };
  const rest = [...argv];
  const names = (value) => value.split(",").filter(Boolean);
  while (rest.length > 0) {
    const word = rest.shift();
    const match = /^--?([A-Za-z][A-Za-z-]*)(?:=([\s\S]*))?$/.exec(word);
    const name = match?.[1].toLowerCase().replaceAll("-", "");
    if (!name || !OPTIONS[name]) throw new Error(`unknown argument: ${word}`);
    const values = [];
    if (match[2] !== undefined) values.push(match[2]);
    else if (OPTIONS[name] === "value") {
      if (rest.length === 0) throw new Error(`${word} needs a value`);
      values.push(rest.shift());
    } else {
      while (rest.length > 0 && !/^--?[A-Za-z]/.test(rest[0])) values.push(rest.shift());
    }
    if (name === "changedfiles") {
      options.changedGiven = true;
      options.changedFiles.push(...values.flatMap(names));
    } else if (name === "skip") options.skip.push(...values.flatMap(names));
    else if (name === "tier") {
      const tier = text(values[0]).toLowerCase();
      if (!["merge", "release"].includes(tier)) throw new Error("the tier must be merge or release");
      options.tier = tier;
    } else if (!/^\d+$/.test(text(values[0]))) throw new Error("the number of jobs must be a whole number");
    else options.jobs = Number(values[0]);
  }
  return options;
}

// ---------- finding and starting tools ----------

const isFile = (path) => {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
};
const isRunnable = (path) => {
  if (!isFile(path)) return false;
  if (windows) return true;
  try {
    accessSync(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
};
const pathExtensions = () => (windows ? (process.env.PATHEXT ?? ".COM;.EXE;.BAT;.CMD").split(";").filter(Boolean).map((ext) => ext.toUpperCase()) : []);

// The executable a word names: on the search path, or relative to `cwd` when the word holds a folder; null when there is none.
// On Windows only a name with an extension of PATHEXT counts, so the extensionless npm script beside npm.cmd is never taken.
function findApplication(word, cwd = repoRoot) {
  if (!word) return null;
  const holdsFolder = word.includes("/") || (windows && word.includes("\\"));
  const folders = holdsFolder ? [""] : text(process.env.PATH).split(delimiter).filter(Boolean);
  const extensions = pathExtensions();
  for (const folder of folders) {
    const base = holdsFolder ? resolve(cwd, word) : join(folder, word);
    if (!windows) {
      if (isRunnable(base)) return base;
      continue;
    }
    if (extensions.includes(extname(base).toUpperCase()) && isRunnable(base)) return base;
    for (const extension of extensions) if (isRunnable(base + extension)) return base + extension;
  }
  return null;
}

// An argument as cmd.exe must read it: quoted when it is empty or holds a space or a character cmd treats as its own.
const quoteForCmd = (argument) => (argument !== "" && !/[\s"&|<>^()!%]/.test(argument) ? argument : `"${argument.replace(/(\\*)"/g, '$1$1\\"').replace(/(\\+)$/, "$1$1")}"`);

// { file, args, options } for a spawn without a shell; a .cmd or .bat on Windows goes through cmd.exe.
function launch(application, args, cwd) {
  const options = { cwd, env: process.env, windowsHide: true };
  if (windows && /\.(cmd|bat)$/i.test(application)) {
    return { file: process.env.ComSpec || "cmd.exe", args: ["/d", "/s", "/c", `"${[application, ...args].map(quoteForCmd).join(" ")}"`], options: { ...options, windowsVerbatimArguments: true } };
  }
  return { file: application, args, options };
}

// A short call with the output kept: the lines, or null when the tool is missing or does not exit with 0.
function ask(word, args) {
  const application = findApplication(word);
  if (!application) return null;
  const { file, args: fileArgs, options } = launch(application, args, repoRoot);
  const result = spawnSync(file, fileArgs, { ...options, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  if (result.error || result.status !== 0) return null;
  return text(result.stdout).split(/\r?\n/).filter(Boolean);
}

// One call of a check, its output merged from both streams in the order it arrives; `emit` sees every piece at once.
function runCall(call, cwd, emit) {
  return new Promise((done) => {
    const application = findApplication(call[0], cwd);
    if (!application) {
      const message = `command not found: ${call[0]}\n`;
      emit(message);
      done({ code: 127, output: message });
      return;
    }
    const { file, args, options } = launch(application, call.slice(1), cwd);
    let output = "";
    let finished = false;
    const finish = (code) => {
      if (finished) return;
      finished = true;
      done({ code, output });
    };
    const child = spawn(file, args, { ...options, stdio: ["ignore", "pipe", "pipe"], shell: false });
    for (const stream of [child.stdout, child.stderr]) {
      stream.setEncoding("utf8");
      stream.on("data", (piece) => {
        output += piece;
        emit(piece);
      });
    }
    child.on("error", (error) => {
      const message = `${error.message}\n`;
      output += message;
      emit(message);
      finish(1);
    });
    child.on("close", (code) => finish(code ?? 1));
  });
}

// ---------- the decision, the flow, and the changed files ----------

// The flow of the project: quick only when .claude/settings.json says so; anything else, or a file that cannot be read, is full.
function readSettingsEnv() {
  const path = join(repoRoot, ".claude/settings.json");
  if (!existsSync(path)) return {};
  try {
    return readJson(path).env ?? {};
  } catch {
    return {};
  }
}
const getFlow = () => (same(readSettingsEnv().GAM_ENGINEERING_FLOW, "quick") ? "quick" : "full");
const integrationBranch = () => (same(readSettingsEnv().GAM_ENGINEERING_BRANCHES, "trunk") ? "main" : "dev");

// The extension as .NET reads it: the text from the last dot of the file name, empty when the dot ends the name.
const extensionOf = (path) => {
  const name = path.slice(Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\")) + 1);
  const dot = name.lastIndexOf(".");
  return dot < 0 || dot === name.length - 1 ? "" : name.slice(dot).toLowerCase();
};

// The files changed against the integration branch and the upstream, plus uncommitted and untracked ones; null when git
// cannot name them (A126): the caller then counts every file as changed.
let changedCache;
function getChangedFiles(options) {
  if (options.changedGiven) return options.changedFiles;
  if (changedCache !== undefined) return changedCache;
  changedCache = computeChangedFiles();
  return changedCache;
}
function computeChangedFiles() {
  if (!findApplication("git")) return null;
  const status = ask("git", ["status", "--porcelain", "--untracked-files=all"]);
  if (status === null) return null;
  // A rename lists both names, so a test renamed to a non-code name still counts as a changed code file.
  const files = status.flatMap((line) => line.slice(3).split(" -> ").map((name) => name.trim().replace(/^"|"$/g, "")));
  const integration = integrationBranch();
  const current = ask("git", ["rev-parse", "--abbrev-ref", "HEAD"]);
  const upstream = ask("git", ["rev-parse", "--abbrev-ref", "@{u}"]);
  const bases = [];
  if (current && current.join(" ") !== "" && !same(current.join(" "), integration)) bases.push(integration);
  if (upstream && upstream.length > 0) bases.push(upstream.join(" "));
  if (bases.length === 0) return null;
  for (const base of bases) {
    const diff = ask("git", ["diff", "--name-only", "--no-renames", `${base}...HEAD`]);
    if (diff === null) return null;
    files.push(...diff);
  }
  return [...new Set(files)];
}

// The weakening guard cannot be dropped silently (P-PIPE-7): when the integration branch records the check and this
// decision does not, it runs anyway and reports the removed check.
function droppedGuard(checks, options) {
  if (options.changedGiven || !findApplication("git")) return null;
  if (checks.some((check) => same(check.kind, "guard"))) return null;
  const candidates = same(readSettingsEnv().GAM_ENGINEERING_BRANCHES, "trunk") ? ["main", "master", "origin/main", "origin/master"] : ["dev", "main", "master", "origin/dev", "origin/main"];
  let recorded = null;
  for (const candidate of candidates) {
    const shown = ask("git", ["show", `${candidate}:gam-engineering/pipeline.json`]);
    if (shown !== null) {
      recorded = shown.join(" ");
      break;
    }
  }
  if (!recorded || !/"kind"[ ]*:[ ]*"guard"/i.test(recorded)) return null;
  return { kind: "guard", language: "", tool: "floor-guard", threshold: "", native: false };
}

// A wildcard pattern as PowerShell's -like reads it: * any text, ? any character, without regard to case.
const like = (value, pattern) => new RegExp(`^${[...pattern].map((char) => (char === "*" ? ".*" : char === "?" ? "." : char.replace(/[.+^${}()|[\]\\]/g, "\\$&"))).join("")}$`, "is").test(value);

// Slim pipeline (P-PIPE-3): the checks to run and a note, or the note alone when no code changed.
function selectQuickChecks(checks, catalog, options) {
  const extensions = (catalog.codeExtensions ?? []).map((extension) => text(extension).toLowerCase());
  const changed = getChangedFiles(options);
  if (changed !== null) {
    // The decision itself counts as code: loosening it is what the weakening guard reads (P-PIPE-7).
    const code = changed.filter((file) => extensions.includes(extensionOf(file)) || same(file.replaceAll("\\", "/"), "gam-engineering/pipeline.json"));
    if (code.length === 0) {
      // Documents only (QA0016): the line-ending check still runs, since a CRLF document is the likeliest slip. No changed file at all runs nothing.
      const eol = changed.length > 0 ? checks.filter((check) => same(check.kind, "eol")) : [];
      if (eol.length > 0) return { checks: eol, note: "flow quick: no code changed, only the line-ending guard ran" };
      return { checks: [], note: "flow quick: no code changed, no check run" };
    }
  }
  // The short test, the architecture checks, and the formatter and type checks (PP-F-23); every other kind waits for the full flow.
  // The two guards run with them: the weakening guard (P-PIPE-7) and the line-ending guard (P-GIT-12, Q455).
  const selected = checks.filter((check) => among(["tests", "architecture", "limits", "format", "types", "guard", "eol"], check.kind));
  const hasTest = selected.some((check) => same(check.kind, "tests"));
  const hasArchitecture = selected.some((check) => among(["architecture", "limits"], check.kind));
  const guards = [["guard", "the weakening guard"], ["eol", "the line-ending guard"]].filter(([kind]) => selected.some((check) => same(check.kind, kind))).map(([, name]) => name);
  const guardText = guards.join(" and ");
  const guardNote = guards.length > 0 ? ` (plus ${guardText})` : "";
  if (selected.length === 0) return { checks: [], note: "flow quick: code changed, but no short test is recorded (kind tests)" };
  if (!hasTest && !hasArchitecture) return { checks: selected, note: `flow quick: code changed, ${guards.length > 0 ? `only ${guardText} ran` : "only the formatter and type checks ran"}; no short test is recorded (kind tests)` };
  if (!hasArchitecture) return { checks: selected, note: `flow quick: code changed, only the short test ran${guardNote}` };
  if (!hasTest) return { checks: selected, note: `flow quick: code changed, the architecture checks ran${guardNote}; no short test is recorded (kind tests)` };
  return { checks: selected, note: `flow quick: code changed, the short test and the architecture checks ran${guardNote}` };
}

// Docs-only run (P-PIPE-6): true only when git names at least one changed file and every one is a document. One doubtful file
// (code, stack file, data folder, anything outside the document paths) makes it false, and so the run full.
function isDocsOnly(catalog, options) {
  const changed = getChangedFiles(options);
  if (changed === null || changed.length === 0) return false;
  const rules = catalog.docsOnly ?? {};
  const extensions = (catalog.codeExtensions ?? []).map((extension) => text(extension).toLowerCase());
  for (const file of changed) {
    const path = text(file).replace(/\\/g, "/").replace(/^\/+/, "");
    const leaf = path.slice(path.lastIndexOf("/") + 1);
    if (extensions.includes(extensionOf(path))) return false;
    for (const pattern of rules.stackFiles ?? []) {
      if (pattern.endsWith("/")) {
        if (path.startsWith(pattern) || path.includes(`/${pattern}`)) return false;
      } else if (like(leaf, pattern) || like(path, pattern)) return false;
    }
    for (const folder of rules.dataFolders ?? []) if (path.startsWith(folder) || path.includes(`/${folder}`)) return false;
    let isDocument = false;
    for (const pattern of rules.documentPaths ?? []) {
      if (pattern.endsWith("/")) {
        if (path.startsWith(pattern)) isDocument = true;
      } else if (like(path, pattern)) isDocument = true;
    }
    if (!isDocument) return false;
  }
  return true;
}

// ---------- the calls of one check ----------

const newRun = (check, state, detail, output = "") => ({ kind: text(check.kind), language: text(check.language), tool: text(check.tool), state, detail, output, file: "", name: "", seconds: null });

// The catalog entry of one check; lint and tests have none, they run the project's own command line, as the entries
// marked projectCommand do.
function getEntry(check, catalog) {
  if (same(check.kind, "lint") || same(check.kind, "tests")) return null;
  return (catalog.checks ?? []).find((entry) => same(entry.kind, check.kind) && same(entry.language, check.language)) ?? null;
}

// The tier of a check: the recorded check's own tier (PP-F-42), else its catalog entry; lint and tests run on a merge (PP-F-27).
function getTier(check, catalog) {
  // The weakening guard always runs with the merge (P-PIPE-7): a tier written on its entry cannot move it to the release run.
  if (same(check.kind, "guard")) return "merge";
  if (among(["merge", "release"], check.tier)) return text(check.tier);
  const entry = getEntry(check, catalog);
  if (entry?.tier) return text(entry.tier);
  return "merge";
}

// The exit code that makes a check 'not run': the catalog entry's, for lint and tests the language's (PP-F-25, PP-F-29).
function getSkipExit(check, entry, catalog) {
  if (entry?.skipExit) return Number(entry.skipExit);
  if (same(check.kind, "lint") || same(check.kind, "tests")) {
    const language = (catalog.languages ?? []).find((item) => same(item.name, check.language));
    if (language?.skipExit) return Number(language.skipExit);
  }
  return null;
}

// {threshold} becomes the decision's threshold and every later level of the catalog's thresholds, upper case.
function expandThreshold(threshold, catalog) {
  const levels = catalog.thresholds ?? [];
  const index = levels.indexOf(threshold);
  if (index < 0) return null;
  return levels.slice(index).map((level) => text(level).toUpperCase()).join(",");
}

// A project command line: lint, tests, and the projectCommand entries without calls of their own.
function isProjectCommand(check, entry) {
  if (same(check.kind, "lint") || same(check.kind, "tests")) return true;
  return Boolean(entry?.projectCommand) && (entry.localCalls ?? []).length === 0;
}

// {cwdFlag}, {versionFlag}, and {checkIndex} of one argument; null when the argument vanishes (PP-F-32).
function expandPlaceholder(argument, check, index) {
  if (argument === "{cwdFlag}") return text(check.cwd) ? `--cwd=${check.cwd}` : null;
  if (argument === "{versionFlag}") return text(check.version) ? `--version=${check.version}` : null;
  return argument.replaceAll("{checkIndex}", String(index));
}

// In a linked git worktree (Orca, implement-all, P-WS-13) the folder's .git is a file pointing into the common git folder
// outside it, so a container that mounts only the folder has no git and cannot tell ignored files (Q473). The common
// folder is mounted too, and GIT_DIR and GIT_WORK_TREE name the worktree's own git folder and /src. Read from the files
// themselves, without git; [] in a normal checkout.
let worktreeMountsCache = null;
function worktreeMounts() {
  if (worktreeMountsCache) return worktreeMountsCache;
  worktreeMountsCache = [];
  try {
    const dotGit = join(repoRoot, ".git");
    if (!statSync(dotGit).isFile()) return worktreeMountsCache;
    const pointer = /^gitdir:\s*(.+)$/m.exec(readFileSync(dotGit, "utf8"))?.[1]?.trim();
    if (!pointer) return worktreeMountsCache;
    const gitDir = resolve(repoRoot, pointer);
    const common = resolve(gitDir, readFileSync(join(gitDir, "commondir"), "utf8").trim());
    const own = relative(common, gitDir).replaceAll("\\", "/");
    worktreeMountsCache = ["-v", `${common}:/gitcommon`, "-e", `GIT_DIR=/gitcommon/${own}`, "-e", "GIT_WORK_TREE=/src"];
  } catch {
    // not a linked worktree we can read: the mount stays as it is
  }
  return worktreeMountsCache;
}

// The calls of one check as a list of argument lists, or a string naming why none could be built.
function getCalls(check, entry, catalog, index) {
  if (isProjectCommand(check, entry)) {
    if (!text(check.tool)) return `no command line recorded for ${check.kind} ${text(check.language)}`.trim();
    return [text(check.tool).split(" ").filter(Boolean).map((word) => expandPlaceholder(word, check, index)).filter((word) => word !== null)];
  }
  if (!entry) return `no catalog entry for ${check.kind} ${text(check.language)}`.trim();
  const calls = [];
  for (const call of entry.localCalls ?? []) {
    const callArguments = [];
    for (const word of call) {
      let argument = expandPlaceholder(word, check, index);
      if (argument === null) continue;
      if (argument.includes("{threshold}")) {
        const expanded = expandThreshold(text(check.threshold), catalog);
        if (expanded === null) return `unknown threshold: ${check.threshold}`;
        argument = argument.replaceAll("{threshold}", expanded);
      }
      callArguments.push(argument.replaceAll("{repoRoot}", repoRoot).replaceAll("{docCheck}", docCheck));
      if (word === "{repoRoot}:/src") callArguments.push(...worktreeMounts());
    }
    calls.push(callArguments);
  }
  return calls;
}

// A container runtime answers when docker is on the search path and docker info exits with 0; asked once per run.
let containerAnswers = null;
function hasContainerRuntime() {
  if (containerAnswers === null) containerAnswers = ask("docker", ["info"]) !== null;
  return containerAnswers;
}

// The rule sets of the other sast checks of a group, added to the first check's semgrep call (PP-F-43).
function addRuleSets(calls, others, catalog) {
  const extra = [];
  for (const other of others) {
    const words = getEntry(other, catalog)?.localCalls?.[0] ?? [];
    for (let i = 0; i < words.length - 1; i++) if (words[i] === "--config") extra.push("--config", words[i + 1]);
  }
  const first = calls[0];
  const at = first.indexOf("--config");
  if (at < 0 || extra.length === 0) return calls;
  return [[...first.slice(0, at + 2), ...extra, ...first.slice(at + 2)]];
}

const getLabel = (check) => `${check.kind} ${text(check.language)} ${text(check.cwd) ? `(${check.cwd})` : ""}`.trim();

// One check: its run, with what it prints going to `emit`.
async function invokeCheck(check, catalog, index, group, emit) {
  emit(`== ${getLabel(check)}\n`);
  const entry = getEntry(check, catalog);
  let calls = getCalls(check, entry, catalog, index);
  if (group.length > 0 && typeof calls !== "string") calls = addRuleSets(calls, group, catalog);
  // A project command runs in the check's folder unless it is told the folder itself ({cwdFlag}).
  let inFolder = Boolean(text(check.cwd)) && isProjectCommand(check, entry) && !text(check.tool).includes("{cwdFlag}");
  if (inFolder && !(existsSync(join(repoRoot, check.cwd)) && statSync(join(repoRoot, check.cwd)).isDirectory())) {
    return newRun(check, "failed", `folder not found: ${check.cwd}`);
  }
  // lintOnCommitted: every call runs in a copy of HEAD with LF line endings (PP-F-40).
  if (check.lintOnCommitted === true && among(["lint", "format"], check.kind) && typeof calls !== "string") {
    const prefix = ["node", "gam-engineering/tools/committed-copy.mjs"];
    if (inFolder) prefix.push(`--dir=${check.cwd}`);
    calls = calls.map((call) => [...prefix, "--", ...call]);
    inFolder = false;
  }
  if (typeof calls === "string") return newRun(check, "failed", calls);
  // The container probe comes first: a missing Docker gives skipped, never failed (PP-E-4).
  if (entry?.needsContainer && !hasContainerRuntime()) return newRun(check, "skipped", "container runtime missing");
  const folder = inFolder ? join(repoRoot, check.cwd) : repoRoot;
  // Every call's tool must be found before the first one runs (PP-E-3).
  for (const call of calls) {
    if (!findApplication(call[0], folder)) {
      if (entry) return newRun(check, "failed", text(entry.installHint));
      return newRun(check, "failed", `command not found: ${text(call[0])}`);
    }
  }
  const skipExit = getSkipExit(check, entry, catalog);
  const output = [];
  for (const call of calls) {
    const { code, output: piece } = await runCall(call, folder, emit);
    const lines = piece.split(/\r?\n/);
    if (lines.at(-1) === "") lines.pop();
    output.push(...lines);
    if (skipExit !== null && code === skipExit) return newRun(check, "not run", `exit code ${code}: see the output`, output.join("\n"));
    if (code !== 0) return newRun(check, "failed", `exit code ${code}: ${call.join(" ")}`, output.join("\n"));
  }
  return newRun(check, "passed", "", output.join("\n"));
}

// ---------- the report ----------

// <kind>-<tool>.md: the tool's first word, or the ts-check command, in a form safe as a file name; a second check with the same name gets -2.
function getOutputName(run, used) {
  let tool = text(run.tool).split(" ").filter(Boolean)[0] ?? "";
  const tsCheck = /ts-check\.mjs\s+(\S+)/i.exec(run.tool);
  if (tsCheck) tool = tsCheck[1];
  const name = `${run.kind}-${tool}`.replace(/[^A-Za-z0-9._-]/g, "-");
  let candidate = name;
  let number = 2;
  while (used.includes(candidate)) candidate = `${name}-${number++}`;
  return candidate;
}

// The last 10 run folders stay; older ones, and the date-only folders of earlier versions, are deleted (PP-F-28).
function removeOldReports(root) {
  if (!existsSync(root)) return;
  const folders = readdirSync(root, { withFileTypes: true }).filter((item) => item.isDirectory() && /^\d{4}-\d{2}-\d{2}(-\d{6})?$/.test(item.name)).map((item) => item.name).sort().reverse();
  for (const old of folders.slice(10)) rmSync(join(root, old), { recursive: true, force: true });
}

// The run folder exists from the start of a run, so a long or hanging check can be watched there (PP-F-46).
let runFolder = "";
let runStamp = "";
function newRunFolder() {
  runStamp = stampOf(new Date());
  runFolder = join(repoRoot, "gam-engineering/reports/local-pipeline", runStamp);
  mkdirSync(runFolder, { recursive: true });
  // Checks write extra files next to report.md (the SonarQube report, PP-F-52).
  process.env.GAM_PIPELINE_RUN_FOLDER = runFolder;
}

// The output names in the decision's order, fixed before the first check starts, so the order the checks end in never swaps them.
const outputNames = new Map();
function setOutputNames(checks) {
  const used = [];
  for (const check of checks) {
    const name = getOutputName(newRun(check, "", ""), used);
    used.push(name);
    outputNames.set(check, name);
  }
}

function writeRunOutput(run, name) {
  run.file = `${name}.md`;
  const body = [`# ${run.kind} ${run.language} - ${run.state}`, "", "~~~text", run.output ? run.output : "(no output)", "~~~", ""];
  writeFileSync(join(runFolder, run.file), body.join("\n"), "utf8");
}

// report.md while the run lasts: each check waiting, running since, or its result, under the line running.
function writeInterimReport(units, states, started) {
  if (!runFolder) return;
  const lines = [`# Local pipeline ${runStamp}`, "", "| Kind | Language | State |", "| --- | --- | --- |"];
  units.forEach((unit, i) => {
    const state = states[i] === "running" && started.has(i) ? `running since ${clock(started.get(i))}` : states[i];
    for (const check of unit.checks) lines.push(`| ${check.kind} | ${text(check.language) || dash} | ${state} |`);
  });
  lines.push("", "running");
  writeFileSync(join(runFolder, "report.md"), `${lines.join("\n")}\n`, "utf8");
}

function writeReport(runs, green, note, info) {
  if (!runFolder) newRunFolder();
  const root = dirname(runFolder);
  const used = runs.filter((run) => run.name).map((run) => run.name);
  for (const run of runs) {
    if (["skipped", "skipped by choice"].includes(run.state)) continue;
    let name = run.name;
    if (!name) {
      name = getOutputName(run, used);
      used.push(name);
    }
    writeRunOutput(run, name);
  }
  const lines = [`# Local pipeline ${runStamp}`, ""];
  if (note) lines.push(note, "");
  if (info) lines.push(info, "");
  if (runs.length > 0) {
    lines.push("| Kind | Language | State | Detail | Output | Seconds |", "| --- | --- | --- | --- | --- | --- |");
    for (const run of runs) {
      const detail = run.detail ? run.detail.replaceAll("|", "\\|") : dash;
      const link = run.file ? `[${run.file}](${run.file})` : dash;
      lines.push(`| ${run.kind} | ${run.language || dash} | ${run.state} | ${detail} | ${link} | ${run.seconds === null ? dash : run.seconds} |`);
    }
    lines.push("");
  }
  lines.push(green ? "green" : "red");
  const path = join(runFolder, "report.md");
  writeFileSync(path, `${lines.join("\n")}\n`, "utf8");
  removeOldReports(root);
  return path;
}

// ---------- running the selected checks (PP-F-43) ----------

// The kinds a check waits for: the decision's after, else its catalog entry's.
function getAfter(check, catalog) {
  if (Array.isArray(check.after)) return check.after;
  if (check.after) return [check.after];
  return getEntry(check, catalog)?.after ?? [];
}

// Units of work in the decision's order: one per check, the sast checks of several languages as one unit.
function getUnits(checks, allChecks) {
  const units = [];
  const sast = checks.filter((check) => same(check.kind, "sast") && !check.native);
  for (const check of checks) {
    const index = allChecks.indexOf(check);
    if (sast.length > 1 && sast.includes(check)) {
      if (check !== sast[0]) continue;
      units.push({ checks: sast, index, group: sast.slice(1) });
      continue;
    }
    units.push({ checks: [check], index, group: [] });
  }
  return units;
}

// The live table on a console, or one line per change without one.
let tableDrawn = false;
function showProgress(units, states, changed) {
  const names = (unit) => unit.checks.map(getLabel).join(", ");
  if (!process.stdout.isTTY) {
    for (const i of changed) say(`[${clock()}] ${names(units[i])}: ${states[i]}`);
    return;
  }
  const width = Math.max(40, (process.stdout.columns ?? 80) - 1);
  let screen = tableDrawn ? `\u001b[${units.length}A` : "";
  units.forEach((unit, i) => {
    screen += `\u001b[2K${`${states[i].padEnd(12)} ${names(unit)}`.padEnd(width).slice(0, width)}\n`;
  });
  process.stdout.write(screen);
  tableDrawn = true;
}

// One check in this process: its run object(s) with the seconds it took.
async function invokeUnit(unit, catalog, emit) {
  const start = Date.now();
  let run;
  try {
    run = await invokeCheck(unit.checks[0], catalog, unit.index, unit.group, emit);
  } catch (error) {
    run = newRun(unit.checks[0], "failed", `the check could not run: ${error.message}`);
  }
  const seconds = Math.round((Date.now() - start) / 1000);
  return unit.checks.map((check) => ({ ...newRun(check, run.state, run.detail, run.output), seconds }));
}

// The output files of a unit that ended, written at once under the names of the final report (PP-F-46).
function writeUnitOutput(unit, unitRuns) {
  unit.checks.forEach((check, c) => {
    const run = unitRuns[c];
    run.name = text(outputNames.get(check));
    if (runFolder && run.name && !["skipped", "skipped by choice"].includes(run.state)) writeRunOutput(run, run.name);
  });
}

// One check after the other, with report.md rewritten before and after each.
async function runSequential(units, catalog) {
  const states = units.map(() => "waiting");
  const started = new Map();
  const perUnit = [];
  for (let i = 0; i < units.length; i++) {
    states[i] = "running";
    started.set(i, new Date());
    writeInterimReport(units, states, started);
    const unitRuns = await invokeUnit(units[i], catalog, (piece) => process.stdout.write(piece));
    writeUnitOutput(units[i], unitRuns);
    states[i] = `${unitRuns[0].state} ${unitRuns[0].seconds} s`;
    perUnit.push(unitRuns);
  }
  return perUnit;
}

// Several checks at the same time in this process; the output of a running check goes to <name>.running.txt in the run folder.
async function runParallel(units, catalog, limit) {
  const states = units.map(() => "waiting");
  const results = new Map();
  const running = new Set();
  const started = new Map();
  // The live output of a running check: <name>.running.txt in the run folder, removed when the check ends (PP-F-46).
  const live = units.map((unit) => join(runFolder, `${text(outputNames.get(unit.checks[0]))}.running.txt`));
  showProgress(units, states, []);
  writeInterimReport(units, states, started);
  await new Promise((finishAll) => {
    const isBlocked = (i) => {
      const after = getAfter(units[i].checks[0], catalog);
      // Ready when every other unit holding a check of a kind it waits for has its result.
      return units.some((unit, j) => j !== i && !results.has(j) && unit.checks.some((check) => among(after, check.kind)));
    };
    const pump = () => {
      const changed = [];
      const startUnit = (i) => {
        started.set(i, new Date());
        running.add(i);
        states[i] = "running";
        changed.push(i);
        writeFileSync(live[i], "", "utf8");
        invokeUnit(units[i], catalog, (piece) => appendFileSync(live[i], piece)).then((runs) => {
          running.delete(i);
          results.set(i, runs);
          states[i] = `${runs[0].state} ${runs[0].seconds} s`;
          writeUnitOutput(units[i], runs);
          if (!process.stdout.isTTY && existsSync(live[i])) process.stdout.write(readFileSync(live[i], "utf8"));
          rmSync(live[i], { force: true });
          showProgress(units, states, [i]);
          writeInterimReport(units, states, started);
          pump();
        });
      };
      for (let i = 0; i < units.length && running.size < limit; i++) {
        if (results.has(i) || running.has(i) || isBlocked(i)) continue;
        startUnit(i);
      }
      // A cycle in the after lists would wait for ever; the first unit left starts anyway.
      if (running.size === 0 && results.size < units.length && changed.length === 0) startUnit([...units.keys()].find((i) => !results.has(i)));
      if (changed.length > 0) {
        showProgress(units, states, changed);
        writeInterimReport(units, states, started);
      }
      if (results.size === units.length) finishAll();
    };
    if (units.length === 0) finishAll();
    else pump();
  });
  return units.map((_, i) => results.get(i));
}

// ---------- the run ----------

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const decisionPath = join(repoRoot, "gam-engineering/pipeline.json");
  const catalogPath = join(repoRoot, "gam-engineering/tools/pipeline-catalog.json");
  const runs = [];
  let note = "";
  let info = "";
  let decision = {};
  if (!existsSync(decisionPath)) {
    note = "gam-engineering/pipeline.json missing; run /gam-engineering pipeline";
  } else if (!existsSync(catalogPath)) {
    note = "gam-engineering/tools/pipeline-catalog.json missing; run /gam-engineering migrate tools";
  } else {
    let catalog;
    try {
      decision = readJson(decisionPath);
    } catch {
      note = "pipeline.json is not valid JSON";
    }
    if (!note) {
      try {
        catalog = readJson(catalogPath);
      } catch {
        note = "pipeline-catalog.json is not valid JSON";
      }
    }
    if (!note) {
      decision = decision ?? {};
      decision.checks = (Array.isArray(decision.checks) ? decision.checks : []).map(normalizeCheck);
      const guardBack = droppedGuard(decision.checks, options);
      if (guardBack) {
        decision.checks = [...decision.checks, guardBack];
        say("weakening guard: recorded on the integration branch, missing here; it runs anyway", "yellow");
      }
      let checks = [...decision.checks];
      // The release run (PP-F-27) runs every recorded check under either flow; the slim selection belongs to the merge tier.
      if (getFlow() === "quick" && options.tier !== "release") {
        const quick = selectQuickChecks(checks, catalog, options);
        checks = quick.checks;
        info = quick.note;
        say(info, "cyan");
      }
      if (options.tier === "merge") {
        const left = checks.filter((check) => getTier(check, catalog) !== "merge");
        checks = checks.filter((check) => getTier(check, catalog) === "merge");
        if (left.length > 0) {
          const tierNote = `tier merge: ${left.length} check(s) of tier release wait for the release run`;
          info = info ? `${info}; ${tierNote}` : tierNote;
        }
      }
      let skipKinds = [...options.skip];
      const skipReason = new Map(skipKinds.map((kind) => [kind.toLowerCase(), "-Skip"]));
      // Only documents changed (P-PIPE-6): the checks outside the catalog's docsOnly kinds are left out, named in the report.
      if (getFlow() === "full" && options.tier === "merge" && !same(decision.docsOnly, "full") && catalog.docsOnly && isDocsOnly(catalog, options)) {
        const keep = catalog.docsOnly.kinds ?? [];
        const dropped = [...new Set(checks.filter((check) => !among(keep, check.kind)).map((check) => text(check.kind)))];
        for (const kind of dropped) if (!skipReason.has(kind.toLowerCase())) skipReason.set(kind.toLowerCase(), "only documents changed (P-PIPE-6)");
        skipKinds = [...skipReason.keys()];
        if (dropped.length > 0) {
          const docsNote = `docs-only: only documents changed, so only ${keep.join(", ")} ran; skipped: ${dropped.join(", ")}`;
          info = info ? `${info}; ${docsNote}` : docsNote;
          say(docsNote, "cyan");
        }
      }
      const skipped = (check) => among(skipKinds, check.kind);
      const toRun = checks.filter((check) => !skipped(check));
      const units = getUnits(toRun, decision.checks);
      const jobs = options.jobs >= 1 ? options.jobs : /^\d+$/.test(text(process.env.GAM_PIPELINE_JOBS)) ? Number(process.env.GAM_PIPELINE_JOBS) : Math.min(4, cpus().length);
      setOutputNames(checks.filter((check) => !skipped(check)));
      newRunFolder();
      const perUnit = jobs > 1 && units.length > 1 ? await runParallel(units, catalog, jobs) : await runSequential(units, catalog);
      // The report keeps the decision's order: each check gets the run of its unit, skipped checks stay where they stand.
      const runFor = new Map();
      for (const [u, unit] of units.entries()) for (const [c, check] of unit.checks.entries()) runFor.set(check, perUnit[u][c]);
      for (const check of checks) {
        if (skipped(check)) {
          runs.push(newRun(check, "skipped by choice", skipReason.get(text(check.kind).toLowerCase())));
          continue;
        }
        runs.push(runFor.get(check));
      }
    }
  }

  // A skipped run is green only while the location is both: the host pipeline still runs that check.
  const skipAllowed = !note && same(decision.location, "both");
  const red = runs.filter((run) => !["passed", "not run", "skipped by choice"].includes(run.state) && !(run.state === "skipped" && skipAllowed));
  const green = !note && red.length === 0;
  const report = writeReport(runs, green, note, info);
  if (note) say(note, "red");
  for (const run of runs.filter((item) => item.state !== "passed")) say(`${run.kind} ${run.language}: ${run.state} - ${run.detail}`, red.includes(run) ? "red" : "yellow");
  say(`Report: ${report}`);
  if (green) {
    say("Local pipeline green.", "green");
    return 0;
  }
  say("Local pipeline red.", "red");
  return 1;
}

main().then(
  (code) => {
    process.exitCode = code;
  },
  (error) => {
    process.stderr.write(`local-pipeline: ${error.message}\n`);
    process.exitCode = 1;
  },
);
