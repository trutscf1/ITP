#!/usr/bin/env node
// Line-ending guard of the gam-engineering pipeline (P-GIT-12, the check of kind `eol`): every text file in the git index
// is LF. It reads `git ls-files --eol`, so only what is committed or staged counts; the working tree is the editor's
// business (.gitattributes and .editorconfig keep it LF). *.cmd, *.bat, and *.ps1 are CRLF files: with `eol=crlf` in
// .gitattributes git keeps them LF in the index and checks them out as CRLF, so `i/lf` is fine for them and the check is
// that their attr/ column holds `eol=crlf`, which a missing .gitattributes line leaves out. A script with `i/crlf` or
// `i/mixed` fails even then (QA0017): it was committed before that line existed, and `git add --renormalize .` fixes it.
// Usage: node gam-engineering/tools/eol-check.mjs [check]
// Run from the repo root; no dependencies. Exit 0 clean (also without git, with the reason said), 1 a file with the wrong
// line ending, 2 the check could not run (never to be read as 0).
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const WINDOWS_SCRIPT = /\.(?:cmd|bat|ps1)$/i;

// The output of `git ls-files --eol -z` → [{ index, attr, path }]: the index state (lf, crlf, mixed, none, -text) and the
// attributes (the text after attr/, for example "text eol=crlf") of each path.
export function parseEol(text) {
  const entries = [];
  for (const record of text.split("\0")) {
    const match = /^i\/(\S*)\s+w\/\S*\s+attr\/([^\t]*)\t(.+)$/s.exec(record);
    if (match) entries.push({ index: match[1], attr: match[2].trim(), path: match[3] });
  }
  return entries;
}

// The entries that break the rule, each with what is wrong: a text file with CRLF or mixed endings in the index, outside
// the three Windows script types; a Windows script whose attributes lack eol=crlf, or whose index content is CRLF or
// mixed (the pin keeps new files LF, it does not convert what was committed before it). A file .gitattributes marks `-text`
// (which `binary` expands to) is no text file and never fails. A text file whose attributes already hold eol=lf needs no
// .gitattributes line (line null): it was committed before that line, and `git add --renormalize .` alone fixes it.
export function findOffenders(entries) {
  const offenders = [];
  for (const { index, attr, path } of entries) {
    const attributes = attr.split(/\s+/);
    if (attributes.includes("-text")) continue;
    if (WINDOWS_SCRIPT.test(path)) {
      if (!attributes.includes("eol=crlf")) offenders.push({ path, problem: `.gitattributes does not pin eol=crlf (attributes: ${attr || "none"})`, line: `*.${path.split(".").pop().toLowerCase()} text eol=crlf` });
      else if (index === "crlf" || index === "mixed") offenders.push({ path, problem: `index has ${index}, expected lf (eol=crlf is pinned, but this file was committed before it)`, line: null });
    } else if (index === "crlf" || index === "mixed") {
      offenders.push({ path, problem: `index has ${index}, expected lf`, line: attributes.includes("eol=lf") ? null : "* text=auto eol=lf" });
    }
  }
  return offenders;
}

// Lines to print and the exit code for a repository path (the current folder by default).
export function check(cwd = process.cwd()) {
  // LC_ALL=C: git's messages in English, so "not a git repository" is recognized under any system language.
  const run = spawnSync("git", ["-c", "core.quotepath=false", "ls-files", "--eol", "-z"], { cwd, encoding: "utf8", maxBuffer: 256 * 1024 * 1024, env: { ...process.env, LC_ALL: "C" } });
  if (run.error?.code === "ENOENT") return { code: 0, lines: ["eol-check: no git on this computer, nothing to check"] };
  if (run.error) return { code: 2, lines: [`eol-check: could not run git: ${run.error.message}`] };
  if (run.status !== 0) {
    if (/not a git repository/i.test(run.stderr)) return { code: 0, lines: ["eol-check: not a git repository, nothing to check"] };
    return { code: 2, lines: [`eol-check: git ls-files --eol failed: ${run.stderr.trim()}`] };
  }
  const entries = parseEol(run.stdout);
  const offenders = findOffenders(entries);
  if (offenders.length === 0) return { code: 0, lines: [`eol-check: ${entries.length} files in the index, every text file is LF as P-GIT-12 asks`] };
  const lines = [`eol-check: ${offenders.length} file(s) break the line-ending rule (P-GIT-12):`];
  for (const { path, problem } of offenders) lines.push(`  ${path}: ${problem}`);
  const missing = [...new Set(offenders.map((offender) => offender.line).filter(Boolean))];
  if (missing.length === 0) lines.push("Fix: run `git add --renormalize .` and commit (P-GIT-12); .gitattributes already holds the needed lines.");
  else lines.push(`Fix: add ${missing.map((line) => `\`${line}\``).join(", ")} to .gitattributes (P-GIT-12), then run \`git add --renormalize .\` and commit.`);
  return { code: 1, lines };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv[2] !== undefined && process.argv[2] !== "check") {
    console.error("Usage: node gam-engineering/tools/eol-check.mjs [check]");
    process.exitCode = 2;
  } else {
    const { code, lines } = check();
    console.log(lines.join("\n"));
    process.exitCode = code;
  }
}
