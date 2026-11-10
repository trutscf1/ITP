#!/usr/bin/env node
// Runs a lint or format check on the committed state (pipeline-proposal PP-F-40; plan 2026-10-29-pipeline-merge).
// Usage: node gam-engineering/tools/committed-copy.mjs [--dir=<folder>] -- <command> [arguments]
// Writes `git archive HEAD` into a temporary folder, converts every text file to LF line endings as the git host sees
// them, links in the git-ignored folders of the working tree (installed dependencies), runs the command in <folder> of
// the copy (its root without --dir), and deletes the copy afterwards: the links first, so a linked folder is never
// touched. Line-ending settings such as core.autocrlf=true can hide real lint findings in the working tree on Windows.
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { pathToFileURL } from "node:url";

const git = (args, options = {}) => spawnSync("git", args, { encoding: "utf8", ...options });

// A file is text when its first 8000 bytes hold no NUL, as git decides.
export function toLf(buffer) {
  const head = buffer.subarray(0, 8000);
  if (head.includes(0) || !buffer.includes(13)) return null;
  const text = buffer.toString("latin1");
  return text.includes("\r\n") ? Buffer.from(text.replace(/\r\n/g, "\n"), "latin1") : null;
}

function convertTree(folder) {
  for (const item of readdirSync(folder, { withFileTypes: true })) {
    const path = join(folder, item.name);
    if (item.isDirectory()) convertTree(path);
    else if (item.isFile()) {
      const converted = toLf(readFileSync(path));
      if (converted) writeFileSync(path, converted);
    }
  }
}

// The git-ignored folders that exist in the working tree, as paths relative to the root ("node_modules/",
// "backend/vendor/"), from git itself, so no dependency folder name is assumed.
export function ignoredFolders(root) {
  const run = git(["ls-files", "--others", "--ignored", "--exclude-standard", "--directory", "--no-empty-directory"], { cwd: root });
  if (run.status !== 0) return [];
  return run.stdout
    .split(/\r?\n/)
    .filter((line) => line.endsWith("/"))
    .map((line) => line.slice(0, -1));
}

export function makeCopy(root) {
  const copy = mkdtempSync(join(tmpdir(), "gam-committed-"));
  const archive = join(copy, "..", `${relative(dirname(copy), copy)}.tar`);
  const made = git(["-c", "core.autocrlf=false", "-c", "core.eol=lf", "archive", "--format=tar", "-o", archive, "HEAD"], { cwd: root });
  if (made.status !== 0) {
    rmSync(copy, { recursive: true, force: true });
    throw new Error(`git archive HEAD failed: ${made.stderr.trim()}`);
  }
  // tar runs inside the copy with a relative archive path, so no drive letter reaches it.
  const unpacked = spawnSync("tar", ["-xf", relative(copy, archive)], { cwd: copy, encoding: "utf8" });
  rmSync(archive, { force: true });
  if (unpacked.status !== 0) {
    rmSync(copy, { recursive: true, force: true });
    throw new Error(`tar could not unpack the archive: ${unpacked.stderr?.trim()}`);
  }
  convertTree(copy);
  const links = [];
  for (const folder of ignoredFolders(root)) {
    const target = join(copy, folder);
    if (existsSync(target)) continue;
    mkdirSync(dirname(target), { recursive: true });
    // A junction needs no rights on Windows; elsewhere a directory link.
    symlinkSync(join(root, folder), target, process.platform === "win32" ? "junction" : "dir");
    links.push(target);
  }
  return { copy, links };
}

// The links go first, each removed as a link, never followed; then the copy itself.
export function removeCopy({ copy, links }) {
  for (const link of links) {
    try {
      if (lstatSync(link).isSymbolicLink()) unlinkSync(link);
    } catch {
      // already gone
    }
  }
  rmSync(copy, { recursive: true, force: true });
}

export function main(args, root = process.cwd()) {
  const split = args.indexOf("--");
  const options = split < 0 ? [] : args.slice(0, split);
  const command = split < 0 ? [] : args.slice(split + 1);
  if (command.length === 0) {
    console.error("usage: node committed-copy.mjs [--dir=<folder>] -- <command> [arguments]");
    return 2;
  }
  const folder = options.find((option) => option.startsWith("--dir="))?.slice("--dir=".length) ?? "";
  let made;
  try {
    made = makeCopy(root);
  } catch (err) {
    console.error(`committed-copy: ${err.message}`);
    return 1;
  }
  try {
    console.log(`committed-copy: running on HEAD with LF line endings in ${made.copy}`);
    const options = { cwd: join(made.copy, folder), stdio: "inherit" };
    let run = spawnSync(command[0], command.slice(1), options);
    // npx, npm, and pnpm are .cmd files on Windows and are found only through the shell; an .exe keeps its arguments as given.
    if (run.error?.code === "ENOENT" && process.platform === "win32") run = spawnSync(command.join(" "), { ...options, shell: true });
    return run.status ?? 1;
  } finally {
    removeCopy(made);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv.slice(2));
}
