#!/usr/bin/env node
// Makes a new git worktree ready to work in (P-WS-13; rules in the gam-engineering skill, references/parallel.md).
// Usage: node gam-engineering/tools/worktree-setup.mjs [--main <main folder>] [--dry-run]    (run inside the worktree)
// Steps: (1) the main folder and this worktree's number, (2) copy the files of .worktreeinclude, (3) write ports and
// database suffixes into the env file, (4) install the dependencies, (5) write the colored VS Code workspace file,
// (6) warn about test servers that worktrees would share, then warn when the linked worktrees exceed the capacity of the computer (capacity.mjs, Q559). It does not create the worktree. Without gam-engineering/
// worktree.json only steps 2 and 4 to 6 do anything. A failing step exits with 1 after the other steps ran; nothing is
// deleted or rolled back. Node, no dependencies, the same on Windows, macOS, and Linux.
// T3 Code (Q561, Q562): its t3.json script with runOnWorktreeCreate runs this file in a new worktree; T3CODE_PROJECT_ROOT
// names the main checkout, and the worktree is registered in the history of prompt-export.mjs, so its chat sessions are
// still exported after T3 removed it. `--t3-json <file>` only merges the gam script into that t3.json and exits.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { measure } from "./capacity.mjs";
import { detectInstall, installSteps, onPath } from "./install-detect.mjs";
import { repoRoots } from "./prompt-export.mjs";
import { numberFor, same, slash } from "./worktree-number.mjs";

// numberFor lives in worktree-number.mjs, so prompt-export.mjs reaches it without an import cycle; re-exported for callers.
export { numberFor };

// Dark colors that read well under light text (A256); the branch name picks one.
export const WORKSPACE_COLORS = ["#8b2e2e", "#8a4b0f", "#6b6b00", "#2e6b2e", "#0f6b6b", "#1f4f8b", "#4b2e8b", "#8b2e6b", "#5c3b1e", "#3a4a5a"];
export const colorOf = (branch) => WORKSPACE_COLORS[createHash("sha1").update(branch).digest().readUInt32BE(0) % WORKSPACE_COLORS.length];

// The inactive title bar: the color halfway to black.
const darker = (hex) => `#${[1, 3, 5].map((at) => Math.round(Number.parseInt(hex.slice(at, at + 2), 16) / 2).toString(16).padStart(2, "0")).join("")}`;

export const portOf = (base, number) => base + number * 100;

// `file:./dev.db` → `file:./dev-wt2.db`, `postgres://u@h/app?x=1` → `postgres://u@h/app-wt2?x=1` (A252). A name that
// already ends with this worktree's suffix stays (idempotent); a value without a name (`postgres://u@h`) stays as is.
export function applySuffix(value, number) {
  const tailAt = value.search(/[?#]/);
  const head = tailAt < 0 ? value : value.slice(0, tailAt);
  const tail = tailAt < 0 ? "" : value.slice(tailAt);
  const urlRoot = head.match(/^[A-Za-z][\w+.-]*:\/\/[^/]*/)?.[0] ?? "";
  const rest = head.slice(urlRoot.length);
  const nameAt = Math.max(rest.lastIndexOf("/"), rest.lastIndexOf("\\"), urlRoot ? -1 : rest.lastIndexOf(":"));
  const name = rest.slice(nameAt + 1);
  if (!name || (urlRoot && nameAt < 0)) return value;
  const suffix = `-wt${number}`;
  const extension = name.match(/\.[A-Za-z0-9]{1,6}$/)?.[0] ?? "";
  const stem = name.slice(0, name.length - extension.length);
  if (stem.endsWith(suffix)) return value;
  return `${urlRoot}${rest.slice(0, nameAt + 1)}${stem}${suffix}${extension}${tail}`;
}

const ENV_LINE = /^(\s*(?:export\s+)?)([A-Za-z_][A-Za-z0-9_]*)(\s*=\s*)(.*?)(\r?)$/;

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

// The keys of worktree.json this script reads, checked before any step uses them: a list of "<key> <what is wrong>"
// (PowerFlow 2026-11-22: an object under `suffix` stopped step 3 with "object is not iterable"). Keys the script does not
// know stay allowed, but a project keeps data of its own under a name of its own, never under one of these keys.
export function validateConfig(config) {
  if (!isObject(config)) return ["worktree.json must be a JSON object"];
  const errors = [];
  if ("envFile" in config && typeof config.envFile !== "string") errors.push(`envFile must be a file name such as ".env"`);
  if ("ports" in config) {
    if (!isObject(config.ports)) errors.push(`ports must be an object of variable name → base port, such as { "PORT": 3000 }`);
    else for (const [key, base] of Object.entries(config.ports)) if (!Number.isFinite(base)) errors.push(`ports.${key} must be a number (the base port)`);
  }
  if ("suffix" in config && !(Array.isArray(config.suffix) && config.suffix.every((key) => typeof key === "string"))) {
    errors.push(`suffix must be a list of variable names, such as ["DATABASE_URL"]; keep data of your own under another key`);
  }
  if ("values" in config) {
    if (!isObject(config.values)) errors.push(`values must be an object of variable name → template with {n}, such as { "TEST_SUFFIX": "wt{n}" }`);
    else for (const [key, template] of Object.entries(config.values)) if (typeof template !== "string") errors.push(`values.${key} must be a string template such as "wt{n}"`);
  }
  if ("install" in config) {
    if (!Array.isArray(config.install)) errors.push(`install must be a list of { "cwd"?: "<folder>", "command": "<command>" }`);
    else {
      config.install.forEach((item, index) => {
        if (!isObject(item) || typeof item.command !== "string" || !item.command || ("cwd" in item && typeof item.cwd !== "string")) {
          errors.push(`install[${index}] must be { "cwd"?: "<folder>", "command": "<command>" }`);
        }
      });
    }
  }
  return errors;
}

// The env file's text with the ports set, the suffixes applied, and the values written: { text, changes, notes }.
// A key in none of the lists stays.
export function planEnv(text, config, number) {
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  const lines = text === "" ? [] : text.split(/\r?\n/);
  if (lines.at(-1) === "") lines.pop();
  const changes = [];
  const notes = [];
  const indexOf = (key) => lines.findIndex((line) => ENV_LINE.exec(line)?.[2] === key);
  for (const [key, base] of Object.entries(config.ports ?? {})) {
    if (!Number.isFinite(base)) throw new Error(`ports.${key} must be a number`);
    const entry = `${key}=${portOf(base, number)}`;
    const at = indexOf(key);
    if (at < 0) lines.push(entry);
    else lines[at] = lines[at].replace(ENV_LINE, (_, before, name, equals) => `${before}${name}${equals}${portOf(base, number)}`);
    changes.push(entry);
  }
  for (const key of config.suffix ?? []) {
    const at = indexOf(key);
    const match = at < 0 ? null : ENV_LINE.exec(lines[at]);
    const quote = match?.[4].match(/^(["'])(.*)\1$/);
    const value = quote ? quote[2] : match?.[4];
    if (!value) {
      notes.push(`${key} has no value in the env file; nothing to suffix`);
      continue;
    }
    const suffixed = applySuffix(value, number);
    if (suffixed === value && !value.includes(`-wt${number}`)) notes.push(`${key} holds no database name; unchanged`);
    lines[at] = lines[at].replace(ENV_LINE, (_, before, name, equals, _old, cr) => `${before}${name}${equals}${quote ? `${quote[1]}${suffixed}${quote[1]}` : suffixed}${cr}`);
    changes.push(`${key}=${suffixed}`);
  }
  // values: a project steers its isolation by a variable of its own, such as POWERFLOW_TEST_SUFFIX=wt1.
  for (const [key, template] of Object.entries(config.values ?? {})) {
    const value = String(template).replaceAll("{n}", String(number));
    const at = indexOf(key);
    if (at < 0) lines.push(`${key}=${value}`);
    else lines[at] = lines[at].replace(ENV_LINE, (_, before, name, equals, _old, cr) => `${before}${name}${equals}${value}${cr}`);
    changes.push(`${key}=${value}`);
  }
  return { text: lines.length ? `${lines.join(eol)}${eol}` : "", changes, notes };
}

const shellRun = (command, cwd) => spawnSync(command, { cwd, shell: true, stdio: "inherit" });

// Runs one install command in `dir` by its steps (install-detect.mjs: corepack only when the manager is missing).
// Returns null, or the failure message.
export function runInstall(dir, command, { has = onPath, spawn = shellRun } = {}) {
  for (const step of installSteps(command, has)) {
    const run = spawn(step.command, dir);
    if (run.status === 0) continue;
    if (step.manager) {
      return `${step.manager} is missing and \`corepack enable\` is not possible here (it needs write rights in the Node folder): install ${step.manager}, then run the script again`;
    }
    return `\`${step.command}\` exited with ${run.status ?? run.error?.message}`;
  }
  return null;
}

// A Prisma project whose install does not generate the client leaves a worktree without it (PowerFlow 2026-11-22,
// QA0063): one hint, nothing runs.
export function prismaHint(tree, folder) {
  const dir = join(tree, folder);
  if (!existsSync(join(dir, "prisma", "schema.prisma"))) return null;
  let postinstall = "";
  try {
    postinstall = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"))?.scripts?.postinstall ?? "";
  } catch {
    // no package.json: the hint still applies
  }
  if (/prisma\s+generate/.test(postinstall)) return null;
  const shown = folder ? `${folder}/prisma/schema.prisma` : "prisma/schema.prisma";
  return `${shown} exists, but no postinstall runs prisma generate, so the Prisma client may be missing in this worktree; add it to postinstall or to install in worktree.json`;
}

const git = (cwd, ...args) => spawnSync("git", args, { cwd, encoding: "utf8" });
const SKIPPED_FOLDERS = new Set(["node_modules", "vendor", "dist", "build", "out", "target", "coverage"]);
const subfolders = (root) =>
  readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith(".") && !SKIPPED_FOLDERS.has(entry.name))
    .map((entry) => entry.name);

// The worktrees git lists, the first one being the main folder (git worktree list --porcelain).
export function listWorktrees(cwd) {
  const listed = git(cwd, "worktree", "list", "--porcelain");
  if (listed.status !== 0) throw new Error(`git worktree list failed: ${listed.stderr.trim()}`);
  return listed.stdout.split(/\r?\n/).filter((line) => line.startsWith("worktree ")).map((line) => line.slice("worktree ".length));
}

// Playwright and Cypress configurations that let two worktrees share one test server (Q493, A262): one warning each.
export function testServerWarnings(root) {
  const folders = ["", ...subfolders(root)];
  const warnings = [];
  const configs = [
    ...["ts", "js", "mjs", "cjs"].map((extension) => ({ name: `playwright.config.${extension}`, kind: "playwright" })),
    ...["ts", "js", "mjs", "cjs"].map((extension) => ({ name: `cypress.config.${extension}`, kind: "cypress" })),
  ];
  for (const folder of folders) {
    for (const { name, kind } of configs) {
      const path = join(root, folder, name);
      if (!existsSync(path)) continue;
      const shown = folder ? `${folder}/${name}` : name;
      const code = readFileSync(path, "utf8").split(/\r?\n/).filter((line) => !/^\s*(\/\/|\/\*|\*)/.test(line)).join("\n");
      if (kind === "playwright") {
        if (/reuseExistingServer\s*:\s*true\b/.test(code)) warnings.push(`${shown}: reuseExistingServer: true attaches a test to a server another worktree started; use false`);
        for (const [, port] of code.matchAll(/\bport\s*:\s*(\d+)/g)) warnings.push(`${shown}: fixed port ${port}; take the port from the env variable of worktree.json ports`);
        for (const [, port] of code.matchAll(/localhost:(\d+)/g)) warnings.push(`${shown}: fixed address localhost:${port}; take the port from the env variable of worktree.json ports`);
      } else {
        for (const [, port] of code.matchAll(/baseUrl\s*:\s*["'`][^"'`]*localhost:(\d+)/g)) warnings.push(`${shown}: baseUrl with localhost:${port}; take the port from the env variable of worktree.json ports`);
      }
    }
  }
  return warnings;
}

// The gam script T3 Code runs in a new worktree (Q562). Keys checked against T3 0.1.10 on 2026-11-19 (QA0023): T3 waits
// for the script before the agent starts only when runOnWorktreeCreate is true and async is false.
export const T3_SCRIPT = { name: "gam worktree setup", command: "node gam-engineering/tools/worktree-setup.mjs", runOnWorktreeCreate: true, async: false };

// The text of t3.json with the gam script added: { text, added, note }. T3 runs only the first script with
// runOnWorktreeCreate, so a file that has one is returned unchanged with a note; foreign keys and scripts stay.
// A gam script written before QA0023 (without async: false) gets async: false, so T3 waits for the setup.
export function mergeT3Json(text) {
  let data = {};
  if (text.trim()) {
    try {
      data = JSON.parse(text);
    } catch (error) {
      throw new Error(`t3.json is not valid JSON (${error.message})`);
    }
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("t3.json is not a JSON object");
  }
  const scripts = Array.isArray(data.scripts) ? data.scripts : [];
  if (scripts.some((script) => script?.runOnWorktreeCreate)) {
    const own = scripts.some((script) => script?.runOnWorktreeCreate && /worktree-setup.mjs/.test(script.command ?? ""));
    const stale = scripts.find((script) => script?.runOnWorktreeCreate && script.name === T3_SCRIPT.name && script.async !== false);
    if (stale) {
      stale.async = false;
      return { text: `${JSON.stringify(data, null, 2)}
`, added: true, note: "set async: false on the script gam worktree setup, so T3 waits for the setup" };
    }
    return { text, added: false, note: own ? "t3.json already runs worktree-setup.mjs" : "t3.json already has a script with runOnWorktreeCreate; T3 runs only the first one, so let that script call node gam-engineering/tools/worktree-setup.mjs" };
  }
  return { text: `${JSON.stringify({ ...data, scripts: [...scripts, T3_SCRIPT] }, null, 2)}
`, added: true, note: "added the script gam worktree setup to t3.json" };
}

async function main(argv) {
  const t3At = argv.indexOf("--t3-json");
  if (t3At >= 0) {
    const path = resolve(argv[t3At + 1] ?? "t3.json");
    try {
      const merged = mergeT3Json(existsSync(path) ? readFileSync(path, "utf8") : "");
      if (merged.added) writeFileSync(path, merged.text);
      process.stdout.write(`worktree-setup: ${merged.note}
`);
      return 0;
    } catch (error) {
      process.stderr.write(`worktree-setup: ${error.message}
`);
      return 1;
    }
  }
  const dryRun = argv.includes("--dry-run");
  const mainAt = argv.indexOf("--main");
  const say = (text) => process.stdout.write(`${text}\n`);
  const failures = [];
  const fail = (step, message) => {
    failures.push(step);
    process.stderr.write(`worktree-setup: ${message}\n`);
  };

  const top = git(process.cwd(), "rev-parse", "--show-toplevel");
  if (top.status !== 0) {
    process.stderr.write("worktree-setup: not inside a git repository\n");
    return 1;
  }
  const tree = top.stdout.trim();
  let alive;
  try {
    alive = listWorktrees(tree);
  } catch (error) {
    process.stderr.write(`worktree-setup: ${error.message}\n`);
    return 1;
  }
  // T3 Code names the main checkout in T3CODE_PROJECT_ROOT (A4); --main wins, then that variable, then git.
  const main = mainAt >= 0 ? resolve(argv[mainAt + 1] ?? "") : process.env.T3CODE_PROJECT_ROOT ? resolve(process.env.T3CODE_PROJECT_ROOT) : alive[0];
  const common = resolve(tree, git(tree, "rev-parse", "--git-common-dir").stdout.trim());
  if (dryRun) say("worktree-setup: dry run, nothing is written");

  // Step 1: the number.
  if (same(tree, main)) {
    say(`1/6 number: ${slash(tree)} is the main folder. The main folder has number 0 and keeps its values; nothing is changed.`);
    return 0;
  }
  const numbered = numberFor(common, tree, main, alive, !dryRun);
  const { number } = numbered;
  say(`1/6 number: ${slash(tree)} has number ${number}${numbered.known ? " (kept)" : dryRun ? " (would be recorded)" : " (recorded)"}; main folder ${slash(main)}`);

  // Register this worktree in the history of the chat export, so its sessions are exported after the worktree is removed
  // (A2): repoRoots remembers every live worktree. A failure only loses that history.
  if (!dryRun) {
    try {
      repoRoots(tree);
    } catch (error) {
      say(`warning: worktree not registered for the chat export (${error.message})`);
    }
  }

  // Step 2: the files of .worktreeinclude.
  const includeAt = [join(tree, ".worktreeinclude"), join(main, ".worktreeinclude")].find((path) => existsSync(path));
  if (!includeAt) say("2/6 copy: no .worktreeinclude, nothing to copy");
  else {
    for (const raw of readFileSync(includeAt, "utf8").split(/\r?\n/)) {
      const path = raw.trim();
      if (!path || path.startsWith("#")) continue;
      if (isAbsolute(path) || path.split(/[\\/]/).includes("..")) {
        say(`2/6 copy: skipped ${path} (not a path inside the folder)`);
        continue;
      }
      const from = join(main, path);
      const to = join(tree, path);
      if (!existsSync(from)) say(`2/6 copy: skipped ${path} (not in the main folder)`);
      else if (existsSync(to)) say(`2/6 copy: kept ${path} (already there)`);
      else if (dryRun) say(`2/6 copy: would copy ${path}`);
      else {
        mkdirSync(dirname(to), { recursive: true });
        cpSync(from, to, { recursive: true });
        say(`2/6 copy: copied ${path}`);
      }
    }
  }

  // Step 3: ports and database suffixes (A252, A253, A254).
  const configAt = [join(tree, "gam-engineering", "worktree.json"), join(main, "gam-engineering", "worktree.json")].find((path) => existsSync(path));
  let config = null;
  if (configAt) {
    try {
      config = JSON.parse(readFileSync(configAt, "utf8"));
    } catch (error) {
      fail("3/6 ports and database", `3/6 ports and database: ${configAt} is not valid JSON (${error.message})`);
    }
  }
  const problems = config ? validateConfig(config) : [];
  for (const problem of problems) fail("3/6 ports and database", `3/6 ports and database: worktree.json: ${problem}`);
  const installValid = !problems.some((problem) => problem.startsWith("install"));
  if (problems.length) {
    say("3/6 ports and database: worktree.json has the wrong form; the env file stays as it is");
    config = installValid && config && !Array.isArray(config) && typeof config === "object" ? { install: config.install } : null;
  }
  if (!configAt) say("3/6 ports and database: no worktree.json, ports, database, and env file stay as they are");
  else if (problems.length) {
    // reported above
  } else if (config && !Object.keys(config.ports ?? {}).length && !(config.suffix ?? []).length && !Object.keys(config.values ?? {}).length) say("3/6 ports and database: worktree.json names no ports, suffix variables, or values");
  else if (config) {
    const envName = config.envFile ?? ".env";
    const envPath = join(tree, envName);
    try {
      const ignored = git(tree, "check-ignore", "-q", "--", envName);
      if (ignored.status === 1) fail("3/6 ports and database", `3/6 ports and database: ${envName} is not git-ignored, so nothing is written into it; add it to .gitignore and run the script again`);
      else if (ignored.status !== 0) fail("3/6 ports and database", `3/6 ports and database: git check-ignore failed: ${ignored.stderr.trim()}`);
      else {
        const before = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
        const plan = planEnv(before, config, number);
        for (const note of plan.notes) say(`3/6 ports and database: ${note}`);
        if (plan.text === before) say(`3/6 ports and database: ${envName} already holds ${plan.changes.join(", ") || "the values"}`);
        else if (dryRun) say(`3/6 ports and database: would write ${plan.changes.join(", ")} into ${envName}`);
        else {
          writeFileSync(envPath, plan.text);
          say(`3/6 ports and database: wrote ${plan.changes.join(", ")} into ${envName}`);
        }
      }
    } catch (error) {
      fail("3/6 ports and database", `3/6 ports and database: ${error.message}`);
    }
  }

  // Step 4: install (A247, A248).
  let installs;
  if (!installValid) installs = [];
  else if (Array.isArray(config?.install)) installs = config.install.map((item) => ({ cwd: item.cwd ?? "", command: item.command }));
  else {
    installs = ["", ...subfolders(tree)].flatMap((folder) => detectInstall(join(tree, folder)).map((item) => ({ cwd: folder, command: item.command })));
  }
  if (!installValid) say("4/6 install: skipped, install in worktree.json has the wrong form");
  else if (!installs.length) say("4/6 install: nothing to install");
  for (const { cwd, command } of installs) {
    const where = cwd || ".";
    if (typeof command !== "string" || !command) {
      fail("4/6 install", `4/6 install failed in ${where}: no command`);
      continue;
    }
    const shown = installSteps(command).map((step) => step.command).join(" && ");
    if (dryRun) {
      say(`4/6 install: would run \`${shown}\` in ${where}`);
      continue;
    }
    if (!existsSync(join(tree, cwd))) {
      fail("4/6 install", `4/6 install failed in ${where}: the folder does not exist`);
      continue;
    }
    say(`4/6 install: running \`${shown}\` in ${where}`);
    const problem = runInstall(join(tree, cwd), command);
    if (problem) fail("4/6 install", `4/6 install failed in ${where}: ${problem}`);
  }
  for (const folder of [...new Set(installs.map((item) => item.cwd))]) {
    const hint = existsSync(join(tree, folder)) ? prismaHint(tree, folder) : null;
    if (hint) say(`warning: ${hint}`);
  }

  // Step 5: the workspace file (A256).
  const branch = git(tree, "branch", "--show-current").stdout.trim() || basename(tree);
  const slug = branch.replace(/[\\/]+/g, "-").replace(/[^A-Za-z0-9._-]/g, "-");
  const workspaceName = `${slug}.code-workspace`;
  const workspacePath = join(tree, workspaceName);
  if (existsSync(workspacePath)) say(`5/6 workspace: kept ${workspaceName}`);
  else if (dryRun) say(`5/6 workspace: would write ${workspaceName} with the color ${colorOf(branch)}`);
  else {
    const color = colorOf(branch);
    const colors = { "titleBar.activeBackground": color, "titleBar.inactiveBackground": darker(color), "statusBar.background": color };
    const workspace = { folders: [{ path: "." }], settings: { "workbench.colorCustomizations": colors } };
    writeFileSync(workspacePath, `${JSON.stringify(workspace, null, 2)}\n`);
    say(`5/6 workspace: wrote ${workspaceName} with the color ${color}`);
  }
  if (!dryRun && git(tree, "check-ignore", "-q", "--", workspaceName).status === 1) say(`warning: ${workspaceName} is not git-ignored; add *.code-workspace to .gitignore`);

  // Step 6: test servers that worktrees would share (Q493, A262).
  const warnings = testServerWarnings(tree);
  if (!warnings.length) say("6/6 test servers: no shared server or fixed port found in Playwright or Cypress configurations");
  for (const warning of warnings) say(`warning: ${warning}`);

  // The capacity of the computer (Q555, Q559): warns and continues when the linked worktrees exceed the limit.
  try {
    const found = await measure(tree, { mainFolder: main });
    for (const warning of found.warnings) say(`warning: ${warning}`);
    if (found.linked > found.limit) say(`warning: ${found.linked} linked worktrees exceed the limit of ${found.limit} (${found.limitedBy}); the computer may run short of memory or disk space (node gam-engineering/tools/capacity.mjs)`);
  } catch (error) {
    say(`warning: capacity not measured (${error.message})`);
  }

  if (failures.length) {
    process.stderr.write(`worktree-setup: failed steps: ${[...new Set(failures)].join("; ")}. The worktree stays as it is.\n`);
    return 1;
  }
  say(dryRun ? "worktree-setup: dry run done" : "worktree-setup: done");
  return 0;
}

const entry = process.argv[1] ? resolve(process.argv[1]) : "";
if (entry && same(entry, fileURLToPath(import.meta.url))) process.exitCode = await main(process.argv.slice(2));
