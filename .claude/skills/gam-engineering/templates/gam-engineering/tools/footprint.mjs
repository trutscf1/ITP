#!/usr/bin/env node
// The footprint of a project in git (plan gam-ai-memory/plans/2026-11-21-minimal-mode.md, QA0045-QA0054): how much of
// what the gam- skills create is tracked. Node, no dependencies.
//   tracked  everything is committed (the default);
//   stealth  the three gam- folders are git-ignored and backed up by a folder copy (stealth-backup.mjs);
//   minimal  everything setup or migrate creates is git-ignored, no copy; only the marked .gitignore block is tracked.
// The value is env.GAM_ENGINEERING_FOOTPRINT in .claude/settings.json. A missing key with GAM_STEALTH_TARGET set (in
// .claude/settings.local.json) reads as stealth, so stealth projects from before the key keep working (QA0052).
// Under minimal, .claude/settings.json is itself ignored; the file on disk is the project's settings (A7).
//
//   node gam-engineering/tools/footprint.mjs show                  # footprint, its source, and the paths it keeps out of git
//   node gam-engineering/tools/footprint.mjs block [--footprint=X]  # write the marked .gitignore block (setup; X defaults
//                                                                   # to the project's footprint); changes no other file
//
// stealth-backup.mjs, stealth-check.mjs, and stealth-migrate.mjs take their path lists and the .gitignore block from here.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { FOOTPRINTS, footprintOf, readEnv } from "./project-settings.mjs";

export { FOOTPRINTS, footprintOf };

export const GAM_FOLDERS = ["gam-ai-knowledge", "gam-engineering", "gam-ai-memory"];

// Folders of the former names (P-DOC-10, P-DOC-11): their first commit also marks the start of gam in a repo.
export const FORMER_FOLDERS = ["humanengineering", "engineering-human", "aigamdocs"];

// Everything setup or migrate creates outside the gam- folders (QA0051). A folder ends with a slash.
export const ROOT_PATHS = [
  "CLAUDE.md",
  "AGENTS.md",
  "GEMINI.md",
  "CONTEXT-MAP.md",
  ".claude/settings.json",
  ".githooks/",
  "docs/prompts/",
  ".github/copilot-instructions.md",
  ".cursor/rules/",
  ".github/ISSUE_TEMPLATE/",
  ".github/pull_request_template.md",
  ".gitlab/issue_templates/",
  ".gitlab/merge_request_templates/",
  ".markdownlint.jsonc",
  ".markdownlint-cli2.jsonc",
  ".gitleaks.toml",
  ".semgrepignore",
  "trivy.yaml",
  ".gitattributes",
  ".editorconfig",
  ".vscode/settings.json",
  ".worktreeinclude",
  "orca.yaml",
  "t3.json",
];

// What a skill repo gets on top (QA0045): the deploy launchers and their hook file.
export const SKILL_REPO_PATHS = ["deploy_skill_wrapper.sh", "deploy_skill_wrapper.cmd", "deploy_skill_hooks.mjs"];

export const MARKERS = {
  stealth: { start: "# >>> gam stealth mode (managed by stealth-migrate.mjs) >>>", end: "# <<< gam stealth mode <<<" },
  minimal: { start: "# >>> gam minimal footprint (managed by stealth-migrate.mjs) >>>", end: "# <<< gam minimal footprint <<<" },
};

export function readFootprint(root) {
  return footprintOf(readEnv(root, { warn: () => {} }));
}

// A skill repo has a SKILL.md in its root or in skills/*/ (QA0045).
export function isSkillRepo(root) {
  if (existsSync(join(root, "SKILL.md"))) return true;
  const skills = join(root, "skills");
  if (!existsSync(skills) || !statSync(skills).isDirectory()) return false;
  return readdirSync(skills).some((name) => existsSync(join(skills, name, "SKILL.md")));
}

// The paths a footprint keeps out of git, folders with a trailing slash.
export function footprintPaths(footprint, { skillRepo = false } = {}) {
  if (footprint === "stealth") return GAM_FOLDERS.map((folder) => `${folder}/`);
  if (footprint !== "minimal") return [];
  return [...GAM_FOLDERS.map((folder) => `${folder}/`), ...ROOT_PATHS, ...(skillRepo ? SKILL_REPO_PATHS : [])];
}

const gitOut = (args, cwd) => {
  const run = spawnSync("git", args, { cwd, encoding: "utf8" });
  return !run.error && run.status === 0 ? run.stdout.trim() : "";
};

const firstAdd = (root, paths) =>
  gitOut(["log", "--diff-filter=A", "--format=%H", "--reverse", "--", ...paths], root).split(/\r?\n/)[0] ?? "";

// Splits the minimal paths into those to ignore and those to keep tracked: a path git tracked before gam created
// anything stays tracked (QA0051). "Before" means its first commit is an ancestor of the first commit that added a gam-
// folder or a folder of a former name; without such a commit, every tracked path predates gam.
export function minimalPlan(root, { skillRepo = isSkillRepo(root) } = {}) {
  const paths = footprintPaths("minimal", { skillRepo });
  const gamStart = firstAdd(root, [...GAM_FOLDERS, ...FORMER_FOLDERS]);
  const keep = [];
  const ignore = [];
  for (const path of paths) {
    const isGamFolder = GAM_FOLDERS.some((folder) => path === `${folder}/`);
    const tracked = gitOut(["ls-files", "--", path], root) !== "";
    if (isGamFolder || !tracked) {
      ignore.push(path);
      continue;
    }
    const added = firstAdd(root, [path]);
    const before =
      gamStart === "" ||
      (added !== "" && added !== gamStart && spawnSync("git", ["merge-base", "--is-ancestor", added, gamStart], { cwd: root }).status === 0);
    (before ? keep : ignore).push(path);
  }
  return { ignore, keep };
}

// The .gitignore line of a path: anchored to the root.
export const ignoreLine = (path) => `/${path}`;

// Every marked gam block of a .gitignore text, in file order: { footprint, start, end (line indexes, inclusive), closed,
// paths }. A block whose end marker was deleted ends at its last contiguous path line, so lines after it are never taken.
export function findBlocks(lines) {
  const blocks = [];
  for (const [footprint, marker] of Object.entries(MARKERS)) {
    lines.forEach((line, start) => {
      if (line.trim() !== marker.start) return;
      const offset = lines.slice(start + 1).findIndex((other) => other.trim() === marker.end);
      let end = offset === -1 ? start : start + 1 + offset;
      if (offset === -1) while (end + 1 < lines.length && lines[end + 1].trim().startsWith("/")) end += 1;
      const inner = offset === -1 ? lines.slice(start + 1, end + 1) : lines.slice(start + 1, end);
      const paths = inner
        .map((entry) => entry.trim())
        .filter((entry) => entry !== "" && !entry.startsWith("#"))
        .map((entry) => entry.replace(/^\//, ""));
      blocks.push({ footprint, start, end, closed: offset !== -1, paths });
    });
  }
  return blocks.sort((a, b) => a.start - b.start);
}

export function findBlock(lines) {
  return findBlocks(lines)[0] ?? null;
}

export function blockOf(text) {
  return findBlock(text.split(/\r?\n/));
}

const negationOf = (paths) => {
  const names = paths.map((path) => path.replace(/\/$/, "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp(`^!\\/?(${names.join("|")})(\\/|$|\\*)`);
};

// The .gitignore text with the marked block of `footprint` holding `paths`, keeping the file's line endings. One closed
// block of the same footprint stays as it is; any other gam block (the other footprint, an unclosed one, a second one) is
// removed and the new block takes the place of the first (stealth -> minimal). `negations` lists the lines that un-ignore
// a path of the block; they are kept and reported, never removed.
export function gitignoreChange(text, { footprint = "stealth", paths = footprintPaths(footprint) } = {}) {
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  const lines = text.split(/\r?\n/);
  const negation = negationOf(paths);
  const negations = lines
    .map((line, index) => ({ line: line.trim(), number: index + 1 }))
    .filter(({ line }) => negation.test(line))
    .map(({ line, number }) => `line ${number}: ${line}`);
  const marker = MARKERS[footprint];
  const block = [marker.start, ...paths.map(ignoreLine), marker.end];
  const found = findBlocks(lines);
  if (found.length === 1 && found[0].footprint === footprint && found[0].closed) return { changed: false, text, negations };
  if (found.length > 0) {
    const kept = lines.filter((_, index) => !found.some((b) => index >= b.start && index <= b.end));
    const at = found[0].start;
    const replaced = [...kept.slice(0, at), ...block, ...kept.slice(at)];
    const textOut = replaced.join(eol);
    return { changed: true, text: textOut.endsWith(eol) ? textOut : textOut + eol, negations };
  }
  const head = text === "" || text.endsWith("\n") ? text : text + eol;
  return { changed: true, text: head + block.join(eol) + eol, negations };
}

// The paths a footprint keeps out of git in `root` ({ ignore, keep }): minimal splits them by minimalPlan, stealth keeps
// nothing back, tracked ignores nothing.
export function planOf(root, footprint) {
  if (footprint === "minimal") return minimalPlan(root);
  return { ignore: footprintPaths(footprint), keep: [] };
}

function show(root) {
  const { footprint, source } = readFootprint(root);
  console.log(`footprint: ${footprint} (from ${source})`);
  if (footprint === "tracked") return 0;
  const paths = planOf(root, footprint);
  console.log(`kept out of git: ${paths.ignore.join(", ")}`);
  if (paths.keep.length > 0) console.log(`tracked before gam, so they stay tracked: ${paths.keep.join(", ")}`);
  return 0;
}

// Writes the marked block of `footprint` (default: the project's) into the .gitignore of `root`. Exit 0 written or already
// there, 1 an unknown or tracked footprint (nothing to ignore).
export function writeBlock(root, footprint = readFootprint(root).footprint) {
  if (footprint !== "stealth" && footprint !== "minimal") {
    console.error(`footprint: ${footprint} keeps everything in git; no block to write`);
    return 1;
  }
  const paths = planOf(root, footprint);
  const file = join(root, ".gitignore");
  const change = gitignoreChange(existsSync(file) ? readFileSync(file, "utf8") : "", { footprint, paths: paths.ignore });
  if (change.changed) writeFileSync(file, change.text);
  console.log(`footprint: ${change.changed ? "wrote" : "kept"} the ${footprint} block in .gitignore (${paths.ignore.length} paths)`);
  if (paths.keep.length > 0) console.log(`tracked before gam, so left out of the block: ${paths.keep.join(", ")}`);
  for (const negation of change.negations) console.log(`warning: .gitignore ${negation} un-ignores a path of the block`);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [command, ...rest] = process.argv.slice(2);
  const option = rest.find((arg) => arg.startsWith("--footprint="))?.slice("--footprint=".length);
  if (command === "show") process.exitCode = show(process.cwd());
  else if (command === "block") process.exitCode = writeBlock(process.cwd(), option);
  else {
    process.stderr.write("usage: footprint.mjs show | block [--footprint=stealth|minimal]\n");
    process.exitCode = 1;
  }
}
