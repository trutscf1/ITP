#!/usr/bin/env node
// Which parts of a program force sessions in different worktrees to meet in the same file (P-ARCH-5; rubric in the
// gam-architecture-review skill, references/parallel-work.md). A report, never a pipeline check: it exits 0 whenever the
// report is printed and 1 only when the history cannot be read.
// Usage: node gam-engineering/tools/parallel-check.mjs [--branch <ref>]    (run in the repo root or any worktree)
// Units of work are the commits on the first-parent line of the integration branch (a --no-ff merge counts with every file
// of its branch). Three signals come from them, for program files only: the share of the hottest file, the overlap rate
// (the share of pairs of units that changed a common file), and the spread (modules per unit, median). Documents of
// gam-ai-knowledge/ are listed in a second table without a grade. Settings: gam-engineering/parallel.json, every key optional.
// Node, no dependencies, git called without a shell.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const SETTINGS_FILE = "gam-engineering/parallel.json";
export const MIN_UNITS = 10;
export const DEFAULTS = {
  units: 50,
  moduleDepth: 2,
  exclude: [],
  // Each limit is a pair: from the first value the grade is `partly`, from the second `missed`.
  limits: { hotShare: [30, 50], overlapRate: [20, 50], spread: [3, 5] },
};

// Never counted at all (A3): the skills' own status files, memory, chat exports, and the skills' own copies.
const SKIPPED_FILES = ["gam-ai-knowledge/ROADMAP.md", "gam-ai-knowledge/ROADMAP-DETAILS.md", "gam-ai-knowledge/next.md"];
const SKIPPED_FOLDERS = ["gam-ai-memory/", "docs/prompts/", "gam-engineering/"];
const LOCK_FILE = /(^|[-.])lock(\.json|\.yaml|b)?$/;

// "skip", "document" (a process document of gam-ai-knowledge/, shown but not graded), or "program" (A13).
export function classify(path, config = DEFAULTS) {
  const base = path.slice(path.lastIndexOf("/") + 1);
  if (SKIPPED_FILES.includes(path) || SKIPPED_FOLDERS.some((folder) => path.startsWith(folder)) || LOCK_FILE.test(base)) return "skip";
  if ((config.exclude ?? []).some((prefix) => path.startsWith(prefix))) return "skip";
  return path.startsWith("gam-ai-knowledge/") ? "document" : "program";
}

// The first `depth` segments of the file's folder; a file in the root has the module "." (A15).
export function moduleOf(path, depth = DEFAULTS.moduleDepth) {
  const folders = path.split("/").slice(0, -1);
  return folders.length ? folders.slice(0, depth).join("/") : ".";
}

// The middle value of the sorted list, the upper one of two (A15).
export function median(values) {
  if (!values.length) return 0;
  return [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
}

// `met` below the first limit, `partly` from it, `missed` from the second. The value is the rounded figure that is shown.
export function gradeOf(value, [partly, missed]) {
  if (value >= missed) return "missed";
  return value >= partly ? "partly" : "met";
}

const percent = (part, whole) => (whole ? Math.round((100 * part) / whole) : 0);

// The units of git log output: every line starting with @ opens a unit, every other non-empty line is a file.
export function parseLog(text) {
  const units = [];
  for (const line of text.split(/\r?\n/)) {
    if (line.startsWith("@")) units.push([]);
    else if (line !== "" && units.length) units.at(-1).push(line);
  }
  return units;
}

const git = (cwd, ...args) => execFileSync("git", ["-c", "core.quotepath=off", ...args], { cwd, encoding: "utf8", maxBuffer: 256 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] });

// The files of the last `count` units on the first-parent line of `branch`, newest first (A2).
export function readUnits(cwd, branch, count) {
  const text = git(cwd, "log", "--first-parent", "-n", String(count), "--format=@%H", "--name-only", "--diff-merges=first-parent", branch);
  return parseLog(text);
}

// Pairs of units that changed at least one common file: { shared, pairs }.
function overlap(sets) {
  let shared = 0;
  for (let at = 0; at < sets.length; at += 1) {
    for (let other = at + 1; other < sets.length; other += 1) {
      for (const file of sets[at]) {
        if (sets[other].has(file)) {
          shared += 1;
          break;
        }
      }
    }
  }
  return { shared, pairs: (sets.length * (sets.length - 1)) / 2 };
}

// The files of a table with the number of units that changed each, hottest first (ties by name); the population is the
// units that changed at least one file of the table (A14).
function table(sets) {
  const population = sets.filter((set) => set.size > 0);
  const counts = new Map();
  for (const set of population) for (const file of set) counts.set(file, (counts.get(file) ?? 0) + 1);
  const files = [...counts].map(([file, count]) => ({ file, count, share: percent(count, population.length) })).sort((a, b) => b.count - a.count || a.file.localeCompare(b.file));
  return { population, files };
}

// The three signals and the tables for a list of units (each a list of file paths).
export function measure(units, config = DEFAULTS) {
  const limits = { ...DEFAULTS.limits, ...config.limits };
  const depth = config.moduleDepth ?? DEFAULTS.moduleDepth;
  const kinds = units.map((files) => {
    const program = new Set();
    const documents = new Set();
    for (const file of files) {
      const kind = classify(file, config);
      if (kind === "program") program.add(file);
      else if (kind === "document") documents.add(file);
    }
    return { program, documents };
  });

  const programTable = table(kinds.map((kind) => kind.program));
  const rate = (sets) => {
    const { shared, pairs } = overlap(sets);
    return { shared, pairs, percent: percent(shared, pairs) };
  };
  const base = rate(programTable.population);
  const top = programTable.files.slice(0, 10).map((entry) => {
    const without = programTable.population.map((set) => new Set([...set].filter((file) => file !== entry.file)));
    return { ...entry, rateWithout: rate(without).percent };
  });
  const spreads = programTable.population.map((set) => new Set([...set].map((file) => moduleOf(file, depth))).size);
  const hotShare = programTable.files.length ? programTable.files[0].share : null;
  const spread = spreads.length ? median(spreads) : null;
  const program = {
    population: programTable.population.length,
    files: top,
    allFiles: programTable.files.length,
    hotShare,
    overlapRate: base.percent,
    overlapPairs: base.shared,
    pairs: base.pairs,
    spreads,
    spread,
    grades: {
      hot: hotShare === null ? "n/a" : gradeOf(hotShare, limits.hotShare),
      overlap: programTable.files.length ? gradeOf(base.percent, limits.overlapRate) : "n/a",
      spread: spread === null ? "n/a" : gradeOf(spread, limits.spread),
    },
  };

  const documentTable = table(kinds.map((kind) => kind.documents));
  const both = rate(kinds.map((kind) => new Set([...kind.program, ...kind.documents])).filter((set) => set.size > 0));
  return {
    units: units.length,
    tooLittle: units.length < MIN_UNITS,
    program,
    documents: { population: documentTable.population.length, files: documentTable.files.slice(0, 10) },
    overlapWithDocuments: both.percent,
  };
}

const pct = (value) => `${value} %`;

// The report as Markdown.
export function render(report, { branch, config = DEFAULTS }) {
  const depth = config.moduleDepth ?? DEFAULTS.moduleDepth;
  const lines = ["# Parallel work check", ""];
  lines.push(`Branch \`${branch}\`, ${report.units} units of work read (limit ${config.units ?? DEFAULTS.units}), module depth ${depth}.`, "");
  if (report.tooLittle) {
    lines.push(`too little history: ${report.units} units of work, at least ${MIN_UNITS} are needed; nothing is graded.`, "");
    return lines.join("\n");
  }
  const { program } = report;
  if (!program.files.length) {
    lines.push("No program file changed in these units; nothing is graded.", "");
    return lines.join("\n");
  }
  lines.push("| Signal | Value | Grade |", "| --- | --- | --- |");
  lines.push(`| Share of the hottest program file | ${pct(program.hotShare)} (\`${program.files[0].file}\`) | ${program.grades.hot} |`);
  lines.push(`| Overlap rate | ${pct(program.overlapRate)} | ${program.grades.overlap} |`);
  lines.push(`| Spread (modules per unit, median) | ${program.spread} | ${program.grades.spread} |`, "");
  lines.push("## Program files", "", "| Share | File | Rate without it |", "| --- | --- | --- |");
  for (const entry of program.files) lines.push(`| ${pct(entry.share)} | \`${entry.file}\` | ${pct(entry.rateWithout)} |`);
  lines.push("", "## Process documents (not graded)", "");
  if (report.documents.files.length) {
    lines.push("| Share | File |", "| --- | --- |");
    for (const entry of report.documents.files) lines.push(`| ${pct(entry.share)} | \`${entry.file}\` |`);
    lines.push("", `Overlap rate with the process documents counted too: ${pct(report.overlapWithDocuments)}.`, "");
  } else {
    lines.push("No process document changed in these units.", "");
  }
  return lines.join("\n");
}

const validPair = (value) => Array.isArray(value) && value.length === 2 && value.every((entry) => Number.isFinite(entry)) && value[0] <= value[1];

// The settings of gam-engineering/parallel.json over the defaults; an unreadable or invalid file throws with its name.
export function loadConfig(root) {
  const path = join(root, SETTINGS_FILE);
  if (!existsSync(path)) return { ...DEFAULTS, limits: { ...DEFAULTS.limits } };
  let given;
  try {
    given = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`${SETTINGS_FILE} is not valid JSON: ${error.message}`);
  }
  if (given === null || typeof given !== "object" || Array.isArray(given)) throw new Error(`${SETTINGS_FILE} must hold a JSON object`);
  const config = { ...DEFAULTS, limits: { ...DEFAULTS.limits } };
  for (const key of ["units", "moduleDepth"]) {
    if (given[key] === undefined) continue;
    if (!Number.isInteger(given[key]) || given[key] < 1) throw new Error(`${SETTINGS_FILE}: ${key} must be a whole number of at least 1`);
    config[key] = given[key];
  }
  if (given.exclude !== undefined) {
    if (!Array.isArray(given.exclude) || given.exclude.some((entry) => typeof entry !== "string")) throw new Error(`${SETTINGS_FILE}: exclude must be a list of path prefixes`);
    config.exclude = given.exclude;
  }
  for (const [key, value] of Object.entries(given.limits ?? {})) {
    if (!(key in DEFAULTS.limits)) throw new Error(`${SETTINGS_FILE}: unknown limit ${key}`);
    if (!validPair(value)) throw new Error(`${SETTINGS_FILE}: limits.${key} must be a pair of numbers, the first not above the second`);
    config.limits[key] = value;
  }
  return config;
}

// The integration branch of the repo: env.GAM_ENGINEERING_BRANCHES of the committed settings, `trunk` is main, else dev (P-GIT-9).
export function integrationBranch(root) {
  try {
    const env = JSON.parse(readFileSync(join(root, ".claude/settings.json"), "utf8")).env ?? {};
    return (env.GAM_ENGINEERING_BRANCHES ?? env.HUMANENGINEERING_BRANCHES ?? env.ENGINEERING_HUMAN_BRANCHES) === "trunk" ? "main" : "dev";
  } catch {
    return "dev";
  }
}

// The whole run: { code, stdout, stderr }.
export function run(args, cwd) {
  const failure = (message) => ({ code: 1, stdout: "", stderr: `parallel-check: ${message}\n` });
  let branchArg;
  for (let at = 0; at < args.length; at += 1) {
    if (args[at] === "--branch" && args[at + 1]) branchArg = args[++at];
    else return failure(`unknown argument ${args[at]}; usage: parallel-check.mjs [--branch <ref>]`);
  }
  let root;
  try {
    root = git(cwd, "rev-parse", "--show-toplevel").trim();
  } catch (error) {
    return failure(error.code === "ENOENT" ? "git was not found" : "not a git repository");
  }
  let config;
  try {
    config = loadConfig(root);
  } catch (error) {
    return failure(error.message);
  }
  const branch = branchArg ?? integrationBranch(root);
  try {
    git(root, "rev-parse", "--verify", "--quiet", `${branch}^{commit}`);
  } catch {
    return failure(`unknown branch \`${branch}\`; name the integration branch with --branch <ref>`);
  }
  let units;
  try {
    units = readUnits(root, branch, config.units);
  } catch (error) {
    return failure(`the history of \`${branch}\` cannot be read: ${String(error.stderr || error.message).trim()}`);
  }
  return { code: 0, stdout: render(measure(units, config), { branch, config }), stderr: "" };
}

const entry = process.argv[1] ? resolve(process.argv[1]) : "";
if (entry && resolve(fileURLToPath(import.meta.url)).toLowerCase() === entry.toLowerCase()) {
  const result = run(process.argv.slice(2), process.cwd());
  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);
  process.exitCode = result.code;
}
