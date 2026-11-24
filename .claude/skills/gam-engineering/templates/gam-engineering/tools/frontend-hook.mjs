// PostToolUse hook of the gam-engineering skill (P-DES-12, P-DES-13, frontend hook). After an edit of an interface file it
// runs the design detector of gam-v-impeccable on that file and puts the findings, plus once per session the order to run
// the change through gam-frontend, into the agent's context. A hook cannot start a skill; it can run a program and write
// a hint. The switch is env.GAM_ENGINEERING_FRONTEND_HOOK (on|off, missing is off) in the committed .claude/settings.json;
// env.GAM_ENGINEERING_FRONTEND=off leaves the gam-frontend line out. The hook never fails a call and never waits longer
// than 20 seconds for a detector: on any error it exits 0 and says nothing.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { isAbsolute, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

// The two settings layers (project-settings.mjs, P-TEAM-2); a project whose copy lacks that file falls back to the
// committed .claude/settings.json alone, so the hook never fails on a missing import.
const { readEnv } = await import("./project-settings.mjs").catch(() => ({
  readEnv: (root) => {
    try {
      return JSON.parse(readFileSync(join(root, ".claude", "settings.json"), "utf8")).env ?? {};
    } catch {
      return {};
    }
  },
}));

const INTERFACE_EXTENSIONS = [".tsx", ".jsx", ".html", ".vue", ".svelte", ".astro", ".css", ".scss", ".sass", ".less"];
const MAX_FINDINGS = 10;
const TIMEOUT_MS = 20000;
const FRONTEND_LINE = "Interface file changed: run this change through gam-frontend (build, motion, review; P-DES-13)";

// The detectors: a skill folder, its launcher under scripts/, and the arguments before the file. A new entry joins here.
const DETECTORS = [{ skill: "gam-v-impeccable", launcher: "scripts/impeccable", args: ["detect", "--json"] }];

export function isInterfaceFile(path) {
  if (typeof path !== "string") return false;
  const lower = path.toLowerCase();
  return INTERFACE_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

export function readSwitches(projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd()) {
  // FRONTEND_HOOK is personal (.claude/settings.local.json may override it), FRONTEND only committed; no file: hook off.
  const env = readEnv(projectDir);
  return {
    hook: String(env.GAM_ENGINEERING_FRONTEND_HOOK ?? "off").toLowerCase() === "on",
    frontend: String(env.GAM_ENGINEERING_FRONTEND ?? "on").toLowerCase() !== "off",
  };
}

// The launcher of a detector: first in the project's skill folder, then in the user's; null when neither holds it.
export function findLauncher(detector, projectDir, { configDir = process.env.CLAUDE_CONFIG_DIR || join(homedir(), ".claude"), platform = process.platform } = {}) {
  const file = platform === "win32" ? `${detector.launcher}.cmd` : detector.launcher;
  for (const base of [join(projectDir, ".claude", "skills"), join(configDir, "skills")]) {
    const path = join(base, detector.skill, file);
    if (existsSync(path)) return path;
  }
  return null;
}

// One line per finding, equal lines once, at most `limit`, then the count of the rest.
export function formatFindings(findings, limit = MAX_FINDINGS) {
  const all = findings.map((item) => {
    const rule = item.antipattern ?? item.name ?? "finding";
    const where = item.line !== undefined ? ` (line ${item.line})` : "";
    const snippet = item.snippet ? `: ${String(item.snippet).replace(/\s+/g, " ").trim().slice(0, 160)}` : "";
    return `- ${rule}${where}${snippet}`;
  });
  const unique = [...new Set(all)];
  const lines = unique.slice(0, limit);
  if (unique.length > limit) lines.push(`… and ${unique.length - limit} more`);
  return lines.join("\n");
}

// The state file of a session; null for a session id that is not a plain name, so it can never leave the folder.
export function statePath(sessionId) {
  if (typeof sessionId !== "string" || !/^[A-Za-z0-9_-]+$/.test(sessionId)) return null;
  return join(process.env.GAM_FRONTEND_HOOK_DIR || join(tmpdir(), "gam-frontend-hook"), `${sessionId}.json`);
}

function readState(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return {};
  }
}

function writeState(path, state) {
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, JSON.stringify(state));
}

// Runs one detector on a file; the findings array, or [] when the output is not one. A .cmd launcher needs a shell.
function detect(detector, launcher, file) {
  const windows = process.platform === "win32";
  const options = { encoding: "utf8", timeout: TIMEOUT_MS, windowsHide: true };
  const result = windows
    ? spawnSync(`"${launcher}" ${detector.args.join(" ")} "${file}"`, { ...options, shell: true })
    : spawnSync(launcher, [...detector.args, file], options);
  try {
    const parsed = JSON.parse(result.stdout);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readInput() {
  try {
    return JSON.parse(readFileSync(0, "utf8") || "{}");
  } catch {
    return {};
  }
}

function runHook() {
  const input = readInput();
  const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
  const raw = input.tool_input?.file_path;
  if (!isInterfaceFile(raw)) return;
  const switches = readSwitches(projectDir);
  if (!switches.hook) return;
  const file = isAbsolute(raw) ? raw : resolve(input.cwd || projectDir, raw);
  if (file.includes('"')) return;

  const path = statePath(input.session_id);
  const state = path ? readState(path) : {};
  const parts = [];
  const next = { ...state };

  for (const detector of DETECTORS) {
    const launcher = findLauncher(detector, projectDir);
    if (!launcher) {
      if (!state[`missing:${detector.skill}`]) {
        parts.push(`gam-engineering frontend hook: detector ${detector.skill} not found in .claude/skills/ or the user's skills folder; install it or run /gam-engineering frontend hook off.`);
        next[`missing:${detector.skill}`] = true;
      }
      continue;
    }
    const findings = detect(detector, launcher, file);
    if (findings.length > 0) parts.push(`Design detector (${detector.skill}) on ${file}:\n${formatFindings(findings)}`);
  }
  if (switches.frontend && !state.announced) {
    parts.push(FRONTEND_LINE);
    next.announced = true;
  }
  if (parts.length === 0) return;
  if (path) writeState(path, next);
  process.stdout.write(
    JSON.stringify({ hookSpecificOutput: { hookEventName: input.hook_event_name || "PostToolUse", additionalContext: parts.join("\n\n") } }),
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    runHook();
  } catch {
    // Never fail a tool call because of the hook.
  }
  process.exit(0);
}
