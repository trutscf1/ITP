#!/usr/bin/env node
// The guard of stealth mode and of the minimal footprint (plans gam-ai-memory/plans/2026-11-05-stealth-modus.md, step 3,
// and gam-ai-memory/plans/2026-11-21-minimal-mode.md, A6): reports every file git tracks although the footprint keeps it
// out of git. Under stealth (and by default) those are the gam- folders (Q386); under minimal, the paths of the marked
// .gitignore block, or, without a block, every path footprint.mjs lists for minimal. Node, no dependencies.
// Usage: node gam-engineering/tools/stealth-check.mjs [--cwd=<project folder>]
// Exit codes: 0 no such file is tracked; 1 at least one is tracked (listed on stdout, remove it with
// `git rm -r --cached <path>`); 2 git could not answer (no repository).
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { GAM_FOLDERS, blockOf, minimalPlan, readFootprint } from "./footprint.mjs";

// The paths the guard checks in `root`, and the footprint they come from.
export function guardedPaths(root) {
  const { footprint } = readFootprint(root);
  if (footprint !== "minimal") return { footprint, paths: GAM_FOLDERS };
  const gitignore = join(root, ".gitignore");
  const block = existsSync(gitignore) ? blockOf(readFileSync(gitignore, "utf8")) : null;
  if (block?.footprint === "minimal" && block.paths.length > 0) return { footprint, paths: block.paths };
  return { footprint, paths: minimalPlan(root).ignore };
}

// Tracked files under `paths` (default: the gam- folders), as git writes them (forward slashes), from the index.
export function trackedGamFiles(root, paths = GAM_FOLDERS) {
  const run = spawnSync("git", ["ls-files", "--", ...paths], { cwd: root, encoding: "utf8" });
  if (run.error || run.status !== 0) return { ok: false, files: [], detail: (run.stderr || run.error?.message || "").trim() };
  return { ok: true, files: run.stdout.split(/\r?\n/).filter((line) => line !== "") };
}

export function main(args, cwd = process.cwd()) {
  const option = args.find((arg) => arg.startsWith("--cwd="));
  const root = option ? option.slice("--cwd=".length) : cwd;
  const { footprint, paths } = guardedPaths(root);
  const what = footprint === "minimal" ? "file of the minimal footprint" : "gam- file";
  const result = trackedGamFiles(root, paths);
  if (!result.ok) {
    console.error(`stealth-check: git could not list the files of ${root}${result.detail ? ` (${result.detail})` : ""}`);
    return 2;
  }
  if (result.files.length === 0) {
    console.log(`stealth-check: no ${what} is tracked by git.`);
    return 0;
  }
  console.log(`stealth-check: ${result.files.length} ${what}(s) are tracked by git again:`);
  for (const file of result.files) console.log(`  ${file}`);
  console.log("Remove them from the index with: git rm -r --cached <path>  (the files stay on disk).");
  return 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv.slice(2));
}
