#!/usr/bin/env node
// How many linked git worktrees this computer carries (P-WS-13, plan 2026-11-17-worktree-capacity, Q555-Q560).
// Usage: node gam-engineering/tools/capacity.mjs [--json]    (run inside the main folder or any worktree)
// Formula: limit = max(1, min(floor(cores / 2), floor(free RAM / 2 GB), floor(free disk / (dependencies + 1 GB)))).
// One worktree costs 2 cores, 2 GB RAM, and on disk the dependency folders of the main checkout (node_modules, .venv,
// vendor, up to three levels deep) plus 1 GB reserve. GAM_ENGINEERING_MAX_PARALLEL (personal key) is `auto` or a number
// that replaces the computed limit. Prints one line, or JSON. Node 18.15+, no dependencies.
import { spawnSync } from "node:child_process";
import { lstatSync, readdirSync, statfsSync } from "node:fs";
import { cpus, freemem } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const GB = 1024 ** 3;
export const COST = { cores: 2, ram: 2 * GB, reserve: 1 * GB };
export const SETTING = "GAM_ENGINEERING_MAX_PARALLEL";
const DEP_FOLDERS = new Set(["node_modules", ".venv", "vendor"]);
const MAX_DEPTH = 3;
const WALK_BUDGET_MS = 5000;

// The limit from the three signals (A4) or the setting (A6): { limit, computed, limitedBy, warnings }.
export function capacity({ cores, freeRam, freeDisk, deps = 0, setting }) {
  const signals = [
    ["cpu", Math.floor(cores / COST.cores)],
    ["ram", Math.floor(freeRam / COST.ram)],
    ["disk", Math.floor(freeDisk / (deps + COST.reserve))],
  ];
  const [limitedBy, smallest] = signals.reduce((best, item) => (item[1] < best[1] ? item : best));
  const computed = Math.max(1, smallest);
  const warnings = [];
  const text = setting === undefined || setting === null ? "auto" : String(setting).trim().toLowerCase();
  if (text !== "auto" && text !== "") {
    if (/^[1-9]\d*$/.test(text)) return { limit: Number(text), computed, limitedBy: "setting", warnings };
    warnings.push(`${SETTING}="${setting}" is neither auto nor a positive number; auto is used`);
  }
  return { limit: computed, computed, limitedBy, warnings };
}

// Total size of the dependency folders under `root`; stops when the time budget is used up (A5): { bytes, lowerBound }.
export function walkDeps(root, budgetMs = WALK_BUDGET_MS, now = Date.now) {
  const start = now();
  let bytes = 0;
  let lowerBound = false;
  const expired = () => {
    if (!lowerBound && now() - start >= budgetMs) lowerBound = true;
    return lowerBound;
  };
  const entriesOf = (folder) => {
    try {
      return readdirSync(folder, { withFileTypes: true });
    } catch {
      return [];
    }
  };
  const sum = (folder) => {
    for (const entry of entriesOf(folder)) {
      if (expired()) return;
      const path = join(folder, entry.name);
      if (entry.isDirectory()) sum(path);
      else {
        try {
          bytes += lstatSync(path).size;
        } catch {
          // vanished meanwhile
        }
      }
    }
  };
  const find = (folder, depth) => {
    for (const entry of entriesOf(folder)) {
      if (expired() || !entry.isDirectory() || entry.name === ".git") continue;
      if (DEP_FOLDERS.has(entry.name)) sum(join(folder, entry.name));
      else if (depth < MAX_DEPTH) find(join(folder, entry.name), depth + 1);
    }
  };
  find(root, 1);
  return { bytes, lowerBound };
}

// The folders of all worktrees git lists, the main folder first; [] outside a repository.
export function worktreeFolders(cwd) {
  const listed = spawnSync("git", ["worktree", "list", "--porcelain"], { cwd, encoding: "utf8" });
  if (listed.status !== 0) return [];
  return listed.stdout.split(/\r?\n/).filter((line) => line.startsWith("worktree ")).map((line) => line.slice("worktree ".length));
}

async function settingOf(main) {
  if (process.env[SETTING]) return process.env[SETTING];
  try {
    const { readLayers } = await import(pathToFileURL(join(dirname(fileURLToPath(import.meta.url)), "project-settings.mjs")).href);
    return readLayers(main, { warn: () => {} }).env[SETTING];
  } catch {
    return undefined;
  }
}

const size = (bytes) => `${(bytes / GB).toFixed(1)} GB`;

// Gathers the signals of this computer and returns capacity() plus the readings and the number of linked worktrees
// (all but the first one git lists). `mainFolder` names the main folder when git cannot tell.
export async function measure(cwd = process.cwd(), { mainFolder } = {}) {
  const folders = worktreeFolders(cwd);
  const main = mainFolder ?? folders[0] ?? resolve(cwd);
  const linked = Math.max(0, folders.length - 1);
  const walked = walkDeps(main);
  let freeDisk = Number.POSITIVE_INFINITY;
  try {
    const stat = statfsSync(dirname(resolve(main)));
    freeDisk = stat.bavail * stat.bsize;
  } catch {
    // no reading: the disk does not limit
  }
  const input = { cores: cpus().length, freeRam: freemem(), freeDisk, deps: walked.bytes, setting: await settingOf(main) };
  return { ...capacity(input), linked, main, cores: input.cores, freeRam: input.freeRam, freeDisk, deps: walked.bytes, depsLowerBound: walked.lowerBound };
}

// The one-line form.
export function describe(result) {
  const disk = Number.isFinite(result.freeDisk) ? size(result.freeDisk) : "unknown";
  return `Capacity: max ${result.limit} worktrees (${result.limitedBy}); cores ${result.cores}, free RAM ${size(result.freeRam)}, free disk ${disk}, deps ${result.depsLowerBound ? "≥" : ""}${size(result.deps)}; linked ${result.linked}`;
}

const entry = process.argv[1] ? resolve(process.argv[1]) : "";
if (entry && resolve(fileURLToPath(import.meta.url)).toLowerCase() === entry.toLowerCase()) {
  const result = await measure();
  if (process.argv.includes("--json")) process.stdout.write(`${JSON.stringify(result, (_, value) => (value === Number.POSITIVE_INFINITY ? null : value), 2)}\n`);
  else {
    process.stdout.write(`${describe(result)}\n`);
    for (const warning of result.warnings) process.stdout.write(`warning: ${warning}\n`);
  }
}
