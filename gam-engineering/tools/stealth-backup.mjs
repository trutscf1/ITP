#!/usr/bin/env node
// Copies the gam- folders of a project to a backup folder (stealth mode; plan gam-ai-memory/plans/2026-11-05-stealth-modus.md,
// Q384-Q388). Node, no dependencies, Windows (robocopy).
// Usage: node gam-engineering/tools/stealth-backup.mjs [--source=<project folder>] [--target=<folder>]
// The source defaults to the working directory. The target defaults to the environment variable GAM_STEALTH_TARGET,
// which the developer sets in .claude/settings.local.json (never committed, so no path lands in git).
// Two generations: <target> and <target>-prev. Before each copy, <target>-prev is replaced by the current <target>; then
// every gam- folder is copied with `robocopy /E` (never /MIR or /PURGE), so a file deleted in the project stays in the copy.
// A failed refresh of -prev stops the run before the target is touched, so the last good copy is never overwritten.
// Exit codes: 0 copied, 1 failed (reported loudly; the caller goes on), 2 not configured (no target given, nothing copied).
import { spawnSync } from "node:child_process";
import { existsSync, rmSync, statSync } from "node:fs";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

export const GAM_FOLDERS = ["gam-ai-knowledge", "gam-engineering", "gam-ai-memory"];

// robocopy returns a bit mask: 0-7 are successes (copied, extra, mismatched files), 8 and above a failure.
const ROBOCOPY_FAILED = 8;

export function previousGeneration(target) {
  return `${resolve(target)}-prev`;
}

// The default copier: a plain robocopy /E from one folder into another, no purge.
export function robocopy(from, to) {
  const run = spawnSync("robocopy", [from, to, "/E", "/R:2", "/W:1", "/NFL", "/NDL", "/NJH", "/NJS", "/NP"], {
    encoding: "utf8",
  });
  if (run.error) return { ok: false, detail: run.error.message };
  return { ok: run.status < ROBOCOPY_FAILED, detail: `robocopy exit code ${run.status}` };
}

function isInside(inner, outer) {
  const path = relative(outer, inner);
  return path === "" || (path.split(sep)[0] !== ".." && !isAbsolute(path));
}

// Copies the gam- folders of `source` to `target` and rotates the previous generation. `copy(from, to)` returns
// { ok, detail }; a test passes its own copier.
export function backup({ source, target, copy = robocopy }) {
  const from = resolve(source);
  const to = resolve(target);
  if (!existsSync(from) || !statSync(from).isDirectory()) return { ok: false, message: `source ${from} is not a folder` };
  if (from === to || isInside(to, from) || isInside(from, to)) {
    return { ok: false, message: "target and source must not be the same folder or inside each other" };
  }
  const folders = GAM_FOLDERS.filter((name) => existsSync(join(from, name)) && statSync(join(from, name)).isDirectory());
  if (folders.length === 0) return { ok: false, message: `no gam- folder found in ${from}` };

  const prev = previousGeneration(to);
  if (existsSync(to)) {
    rmSync(prev, { recursive: true, force: true });
    const refreshed = copy(to, prev);
    if (!refreshed.ok) {
      return { ok: false, message: `previous generation ${prev} could not be refreshed (${refreshed.detail}); target not touched` };
    }
  }
  const failed = [];
  for (const name of folders) {
    const result = copy(join(from, name), join(to, name));
    if (!result.ok) failed.push(`${name} (${result.detail})`);
  }
  if (failed.length > 0) return { ok: false, message: `copy into ${to} failed for ${failed.join(", ")}` };
  return { ok: true, message: `copied ${folders.join(", ")} to ${to}; previous generation in ${prev}` };
}

export function parseArgs(args, env = process.env, cwd = process.cwd()) {
  const option = (name) => args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3);
  const target = option("target") || env.GAM_STEALTH_TARGET || "";
  return { source: option("source") || cwd, target };
}

export function main(args, env = process.env, cwd = process.cwd()) {
  const { source, target } = parseArgs(args, env, cwd);
  if (!target) {
    console.log("stealth-backup: not configured (no --target and no GAM_STEALTH_TARGET); nothing copied.");
    return 2;
  }
  const result = backup({ source, target });
  if (!result.ok) {
    console.error(`stealth-backup: FAILED - ${result.message}`);
    return 1;
  }
  console.log(`stealth-backup: ${result.message}`);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv.slice(2));
}
