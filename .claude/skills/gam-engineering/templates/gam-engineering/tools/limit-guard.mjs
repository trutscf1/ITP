// PostToolUse and UserPromptSubmit hook of the gam-engineering skill (P-WS-12, save and stop near the usage limit).
// Claude Code gives the plan's usage limits only to the status line command; limit-statusline.mjs writes them to a
// bridge file per session in the system temp folder. This hook reads that file and puts one message into the agent's
// context: at the warning threshold (default 90 %) a warning, at the stop threshold (default 95 %) the order to run
// /gam-engineering stopp (P-WS-8). Each level is announced once per session and window reset. The settings are read
// from the committed .claude/settings.json, where .claude/settings.local.json may override each one per developer (env.GAM_ENGINEERING_LIMIT_GUARD on|off, _LIMIT_WARN, _LIMIT_STOP, and
// _LIMIT_ACTION auto|ask: run stopp at once, or ask the developer with a pop-up first).
// Session age (P-WS-12): the hook stores the time of its first call in a session as firstSeen in the same file (it
// creates the file when the status line has not written one), and once the session is older than
// env.GAM_ENGINEERING_SESSION_MAX_HOURS hours (default 4, 0 turns the hint off, a value that is not a number means 4) it
// recommends finishing the step, saving with stopp, and continuing in a new session. The hint works without usage data,
// is given once per session (marked "age" in notified), and never orders stopp at once. When a usage message is due at
// the same call, both go into one context text. The hook never fails a call: on any error it exits 0 and says nothing.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
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

const STALE_MS = 15 * 60 * 1000;
const WINDOWS = { five_hour: "5-hour limit", seven_day: "weekly limit" };

export function readLimitSettings(projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd()) {
  // Committed settings, overlaid with the personal keys of .claude/settings.local.json; missing files mean defaults.
  const env = readEnv(projectDir);
  const number = (value, fallback) => (Number.isFinite(Number(value)) && String(value).trim() !== "" ? Number(value) : fallback);
  return {
    on: String(env.GAM_ENGINEERING_LIMIT_GUARD ?? "on").toLowerCase() !== "off",
    warn: number(env.GAM_ENGINEERING_LIMIT_WARN, 90),
    stop: number(env.GAM_ENGINEERING_LIMIT_STOP, 95),
    ask: String(env.GAM_ENGINEERING_LIMIT_ACTION ?? "auto").toLowerCase() === "ask",
    maxHours: number(env.GAM_ENGINEERING_SESSION_MAX_HOURS, 4),
    threshold: number(env.GAM_ENGINEERING_SESSION_THRESHOLD, 50),
  };
}

// The bridge file of a session; null for a session id that is not a plain name, so it can never leave the folder.
export function statePath(sessionId) {
  if (typeof sessionId !== "string" || !/^[A-Za-z0-9_-]+$/.test(sessionId)) return null;
  return join(process.env.GAM_LIMITS_DIR || join(tmpdir(), "gam-limits"), `${sessionId}.json`);
}

export function readState(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

export function writeState(path, state) {
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, JSON.stringify(state));
}

// The level due for a state: { level: "warn" | "stop", window, percent, resetsAt, key } or null.
export function evaluate(state, settings, now = Date.now()) {
  if (!state || typeof state.updated !== "number" || now - state.updated > STALE_MS) return null;
  let top = null;
  for (const window of Object.keys(WINDOWS)) {
    const value = state[window];
    if (!value || typeof value.used_percentage !== "number") continue;
    if (typeof value.resets_at === "number" && value.resets_at * 1000 <= now) continue;
    if (!top || value.used_percentage > top.percent) top = { window, percent: value.used_percentage, resetsAt: value.resets_at };
  }
  if (!top) return null;
  const level = top.percent >= settings.stop ? "stop" : top.percent >= settings.warn ? "warn" : null;
  if (!level) return null;
  // The reset time may jitter by seconds between status line runs; rounded to 10 minutes it names the window.
  const window = typeof top.resetsAt === "number" ? Math.round(top.resetsAt / 600) : "";
  return { ...top, level, key: `${level}:${top.window}:${window}` };
}

// The age hint due for a state: { hours } or null. The age is wall-clock time since state.firstSeen; 0 hours turns it off.
export function ageDue(state, settings, now = Date.now()) {
  if (!state || typeof state.firstSeen !== "number" || !(settings.maxHours > 0)) return null;
  const hours = (now - state.firstSeen) / 3600000;
  return hours > settings.maxHours ? { hours: Math.floor(hours) } : null;
}

export function ageMessage(due, settings) {
  return `gam-engineering (P-WS-12): this session has run for ${due.hours} hours (limit ${settings.maxHours}, env.GAM_ENGINEERING_SESSION_MAX_HOURS). Finish the current step, then save with /gam-engineering stopp (P-WS-8) and continue in a new session; a long session pays for its whole context on every turn.`;
}

function resetTime(resetsAt) {
  if (typeof resetsAt !== "number") return "";
  const date = new Date(resetsAt * 1000);
  return ` (resets ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")})`;
}

export function message(due, settings) {
  const where = `${Math.round(due.percent)} % of the ${WINDOWS[due.window]}${resetTime(due.resetsAt)}`;
  if (due.level === "stop" && settings.ask) {
    return `gam-engineering (P-WS-12): usage at ${where}. Ask the developer now with a pop-up whether to save and stop with /gam-engineering stopp (P-WS-8); start no new work until they answer.`;
  }
  if (due.level === "stop") {
    return `gam-engineering (P-WS-12): usage at ${where}. Run /gam-engineering stopp now (P-WS-8): save the session's state in the project, commit, and end the session. Start no new work.`;
  }
  return `gam-engineering (P-WS-12): usage at ${where}. Finish the current step, keep messages short, and start nothing large; at ${settings.stop} % the session saves and stops.`;
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
  const settings = readLimitSettings();
  if (!settings.on) return;
  const path = statePath(input.session_id);
  if (!path) return;
  const now = Date.now();
  let state = readState(path);
  const first = !state || typeof state.firstSeen !== "number";
  if (first) state = { ...(state ?? {}), firstSeen: now };
  const notified = Array.isArray(state.notified) ? state.notified : [];
  const marks = [];
  const texts = [];
  const due = evaluate(state, settings, now);
  // A stop already announced for this window makes a later warning pointless.
  if (due && !notified.includes(due.key) && !notified.includes(due.key.replace(/^warn:/, "stop:"))) {
    marks.push(due.key);
    texts.push(message(due, settings));
  }
  const age = ageDue(state, settings, now);
  if (age && !notified.includes("age")) {
    marks.push("age");
    texts.push(ageMessage(age, settings));
  }
  // The hook runs on every tool call: write only when the file changes.
  if (first || marks.length) writeState(path, { ...state, notified: [...notified, ...marks] });
  if (!texts.length) return;
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: { hookEventName: input.hook_event_name || "PostToolUse", additionalContext: texts.join("\n") },
    }),
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    runHook();
  } catch {
    // Never fail a tool call or a prompt because of the guard.
  }
  process.exit(0);
}
