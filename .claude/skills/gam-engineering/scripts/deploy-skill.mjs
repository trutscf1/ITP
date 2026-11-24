#!/usr/bin/env node
// Deploys the skill(s) of a skill repo to the folder Claude Code reads its skills from (QA0035, QA0036, QA0038).
// The successor of deploy_skill.ps1: the same on Windows, macOS, and Linux, Node 18.15+, no dependencies. It ships with
// the gam-engineering skill, so a skill repo holds only the launchers deploy_skill_wrapper.cmd and .sh, which call the
// installed copy (gam-engineering itself calls the copy in its own skills/ folder).
//
// Usage: node deploy-skill.mjs [--root <repo>] [--what-if] [--skills-root <folder>] [<skill folder>...]
//   --root         the repo (default: the current folder); its deploy_skill_hooks.mjs, if any, is loaded
//   --what-if      show what would be copied and removed, change nothing (-WhatIf works too)
//   --skills-root  the installed skills (default: $CLAUDE_CONFIG_DIR/skills, else ~/.claude/skills; -SkillsRoot too)
//   skill folders  default: the repo root when it holds a SKILL.md, else every skills/*/ folder with a SKILL.md
//
// Per skill folder: the target is <skills root>/<name: from the SKILL.md frontmatter>. Copied are the tracked files and
// the untracked ones git does not ignore (git ls-files), except repo-only files: .gitignore, .deployignore, the
// launchers and hooks (deploy_skill_wrapper.*, deploy_skill_hooks.mjs), the root qa-log.md, and every file matched by a
// .deployignore in the folder (.gitignore syntax). Only new or changed files are copied (size, then SHA-256). Target
// files not in the list are removed, except files the repo's .gitignore matches (e.g. a password placed there), which
// are kept. Folders left empty are removed.
//
// deploy_skill_hooks.mjs in the repo root may export before({ root, sources, skillsRoot, whatIf }) - it may throw to stop
// the deploy or return a new list of skill folders - and after({ root, results, skillsRoot, whatIf, log }).
// Exit code: 0 on success, 1 on error.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFileSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, realpathSync, rmdirSync, statSync, unlinkSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const LAUNCHERS = ["deploy_skill_wrapper.cmd", "deploy_skill_wrapper.sh", "deploy_skill_wrapper.ps1", "deploy_skill_wrapper.mjs"];
export const HOOKS = "deploy_skill_hooks.mjs";
const REPO_ONLY = new Set([".gitignore", ".deployignore", ...LAUNCHERS, HOOKS]);

// NTFS and the default macOS volume ignore case, Linux file systems do not.
const ignoreCase = process.platform === "win32" || process.platform === "darwin";
const keyOf = (path) => (ignoreCase ? path.toLowerCase() : path);

export function defaultSkillsRoot(env = process.env, home = homedir()) {
  return env.CLAUDE_CONFIG_DIR ? join(env.CLAUDE_CONFIG_DIR, "skills") : join(home, ".claude", "skills");
}

// The skill folders of a repo: the root when it holds a SKILL.md, else skills/*/ with a SKILL.md, sorted.
export function findSources(root) {
  if (existsSync(join(root, "SKILL.md"))) return [root];
  const skills = join(root, "skills");
  if (!existsSync(skills)) return [];
  return readdirSync(skills, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(join(skills, entry.name, "SKILL.md")))
    .map((entry) => join(skills, entry.name))
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

export function skillName(source) {
  const head = readFileSync(join(source, "SKILL.md"), "utf8").split(/\r?\n/).slice(0, 20);
  const line = head.find((text) => /^name:\s*(\S+)\s*$/.test(text));
  if (!line) throw new Error(`No 'name:' in the frontmatter of ${join(source, "SKILL.md")}`);
  return line.replace(/^name:\s*/, "").trim();
}

function git(cwd, args, input) {
  const run = spawnSync("git", ["-c", "core.quotepath=false", ...args], { cwd, encoding: "utf8", input, maxBuffer: 256 * 1024 * 1024 });
  if (run.error) throw new Error(`git ${args[0]} failed: ${run.error.message}`);
  return run;
}

const zsplit = (text) => text.split("\0").filter(Boolean);

// The files to deploy, relative to the skill folder with forward slashes.
export function deployFiles(source) {
  const listed = git(source, ["ls-files", "-z", "--cached", "--others", "--exclude-standard"]);
  if (listed.status !== 0) throw new Error(`git ls-files failed - is ${source} in a git repository? ${listed.stderr.trim()}`);
  const deployIgnored = new Set();
  const ignoreFile = join(source, ".deployignore");
  if (existsSync(ignoreFile)) {
    const run = git(source, ["ls-files", "-z", "--cached", "--others", "--ignored", `--exclude-from=${ignoreFile}`]);
    if (run.status !== 0) throw new Error(`git ls-files failed for ${ignoreFile}: ${run.stderr.trim()}`);
    for (const file of zsplit(run.stdout)) deployIgnored.add(file);
  }
  return zsplit(listed.stdout).filter((file) =>
    !REPO_ONLY.has(file) && file !== "qa-log.md" && !deployIgnored.has(file) && isFile(join(source, file)));
}

function isFile(path) {
  try { return statSync(path).isFile(); } catch { return false; }
}

function sameContent(from, to) {
  const a = statSync(from);
  const b = statSync(to);
  if (a.size !== b.size) return false;
  const hash = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");
  return hash(from) === hash(to);
}

// Every file below dir (dotfiles too), relative with forward slashes; symbolic links count as files.
function walk(dir, prefix = "") {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...walk(join(dir, entry.name), rel));
    else out.push(rel);
  }
  return out;
}

function removeEmptyDirs(dir, isRoot = true) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) removeEmptyDirs(join(dir, entry.name), false);
  }
  if (!isRoot && readdirSync(dir).length === 0) rmdirSync(dir);
}

// Deploys one skill folder; returns { skill, source, target, copied, unchanged, removed, kept }.
export function deploySkill({ source, skillsRoot = defaultSkillsRoot(), whatIf = false, log = console.log }) {
  source = resolve(source);
  if (!existsSync(join(source, "SKILL.md"))) throw new Error(`No SKILL.md in ${source}`);
  const skill = skillName(source);
  const target = join(skillsRoot, skill);
  log(`Skill:  ${skill}`);
  log(`Source: ${source}`);
  log(`Target: ${target}`);
  if (whatIf) log("(WhatIf - nothing is changed)");

  const files = deployFiles(source);
  const result = { skill, source, target, copied: 0, unchanged: 0, removed: 0, kept: 0 };
  for (const file of files) {
    const from = join(source, file);
    const to = join(target, file);
    if (existsSync(to)) {
      if (isFile(to) && sameContent(from, to)) { result.unchanged++; continue; }
      log(`Update ${file}`);
    } else log(`Add    ${file}`);
    if (!whatIf) {
      mkdirSync(dirname(to), { recursive: true });
      copyFileSync(from, to);
    }
    result.copied++;
  }

  if (existsSync(target) && lstatSync(target).isDirectory()) {
    const wanted = new Set(files.map(keyOf));
    const extra = walk(target).filter((rel) => !wanted.has(keyOf(rel)));
    if (extra.length > 0) {
      // Paths the repo's .gitignore matches are not managed by this deploy - keep them. Exit 1: nothing matched.
      const run = git(source, ["check-ignore", "--no-index", "-z", "--stdin"], extra.join("\0") + "\0");
      if (run.status > 1) throw new Error(`git check-ignore failed: ${run.stderr.trim()}`);
      const ignored = new Set(zsplit(run.stdout));
      for (const rel of extra) {
        if (ignored.has(rel)) {
          log(`Keep   ${rel} (ignored by .gitignore)`);
          result.kept++;
          continue;
        }
        log(`Remove ${rel}`);
        if (!whatIf) unlinkSync(join(target, rel));
        result.removed++;
      }
    }
    if (!whatIf) removeEmptyDirs(target);
  }
  log(`Done: ${result.copied} copied, ${result.unchanged} unchanged, ${result.removed} removed, ${result.kept} kept.`);
  return result;
}

export function parseArgs(argv) {
  const options = { root: process.cwd(), whatIf: false, skillsRoot: undefined, sources: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const lower = arg.toLowerCase();
    if (lower === "--what-if" || lower === "-whatif") options.whatIf = true;
    else if (lower === "--skills-root" || lower === "-skillsroot") options.skillsRoot = argv[++i];
    else if (lower === "--root") options.root = argv[++i];
    else if (arg.startsWith("-")) throw new Error(`Unknown option ${arg}`);
    else options.sources.push(arg);
    if (options.skillsRoot === undefined && (lower === "--skills-root" || lower === "-skillsroot")) throw new Error(`${arg} needs a folder`);
    if (options.root === undefined) throw new Error("--root needs a folder");
  }
  options.root = resolve(options.root);
  options.sources = options.sources.map((source) => resolve(options.root, source));
  return options;
}

// The whole run: hooks, every skill folder, summary. Returns the exit code.
export async function run(argv, { env = process.env, log = console.log } = {}) {
  try {
    const options = parseArgs(argv);
    const skillsRoot = options.skillsRoot ? resolve(options.skillsRoot) : defaultSkillsRoot(env);
    let sources = options.sources.length > 0 ? options.sources : findSources(options.root);
    const hooksFile = join(options.root, HOOKS);
    const hooks = existsSync(hooksFile) ? await import(pathToFileURL(hooksFile).href) : {};
    const context = { root: options.root, skillsRoot, whatIf: options.whatIf, log };
    if (hooks.before) sources = (await hooks.before({ ...context, sources })) ?? sources;
    if (sources.length === 0) throw new Error(`No SKILL.md in ${options.root} and no skills/*/SKILL.md`);
    const results = [];
    for (const source of sources) {
      results.push(deploySkill({ source, skillsRoot, whatIf: options.whatIf, log }));
      if (sources.length > 1) log("");
    }
    if (hooks.after) await hooks.after({ ...context, results });
    log("All OK");
    return 0;
  } catch (error) {
    log(`ERROR: ${error.message}`);
    return 1;
  }
}

// Called directly? Node reports the module by its real path, so the installed copy, reached through a symbolic link
// (e.g. ~/.claude/skills -> ~/.agents/skills), only matches when argv[1] is resolved the same way.
export function isMain(argv1, moduleUrl = import.meta.url) {
  if (!argv1) return false;
  const real = (path) => { try { return realpathSync(path); } catch { return resolve(path); } };
  return keyOf(real(resolve(argv1))) === keyOf(real(fileURLToPath(moduleUrl)));
}

if (isMain(process.argv[1])) {
  process.exitCode = await run(process.argv.slice(2));
}
