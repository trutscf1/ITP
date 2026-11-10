#!/usr/bin/env node
// The guard of stealth mode (plan gam-ai-memory/plans/2026-11-05-stealth-modus.md, step 3): reports every file of a gam-
// folder that git tracks, because stealth mode keeps those folders out of git (Q386). Node, no dependencies.
// Usage: node gam-engineering/tools/stealth-check.mjs [--cwd=<project folder>]
// Exit codes: 0 no gam- file is tracked; 1 at least one is tracked (listed on stdout, remove it with
// `git rm -r --cached <folder>`); 2 git could not answer (no repository).
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { GAM_FOLDERS } from "./stealth-backup.mjs";

// Tracked files under the gam- folders, as git writes them (forward slashes), from the index.
export function trackedGamFiles(root) {
  const run = spawnSync("git", ["ls-files", "--", ...GAM_FOLDERS], { cwd: root, encoding: "utf8" });
  if (run.error || run.status !== 0) return { ok: false, files: [], detail: (run.stderr || run.error?.message || "").trim() };
  return { ok: true, files: run.stdout.split(/\r?\n/).filter((line) => line !== "") };
}

export function main(args, cwd = process.cwd()) {
  const option = args.find((arg) => arg.startsWith("--cwd="));
  const root = option ? option.slice("--cwd=".length) : cwd;
  const result = trackedGamFiles(root);
  if (!result.ok) {
    console.error(`stealth-check: git could not list the files of ${root}${result.detail ? ` (${result.detail})` : ""}`);
    return 2;
  }
  if (result.files.length === 0) {
    console.log("stealth-check: no gam- file is tracked by git.");
    return 0;
  }
  console.log(`stealth-check: ${result.files.length} gam- file(s) are tracked by git again:`);
  for (const file of result.files) console.log(`  ${file}`);
  console.log("Remove them from the index with: git rm -r --cached <folder>  (the files stay on disk).");
  return 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv.slice(2));
}
