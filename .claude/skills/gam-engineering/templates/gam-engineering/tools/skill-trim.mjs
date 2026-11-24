// SessionStart hook of the gam-engineering skill (P-WS-7, Q573 to Q577, Q580): fewer skills in the listing, because every
// skill's description is sent with every request (a skills folder of 1,900 skills costs tens of thousands of tokens).
//   1. Every skill folder of the skills home (~/.claude/skills) that the project does not need gets
//      skillOverrides: user-invocable-only in the git-ignored .claude/settings.local.json: hidden from Claude, still in
//      the / menu. Needed are: every gam-* skill, every skill named in STACK.md section 10 (technology skills, P-DES-7),
//      every skill in the project's .claude/skills/, and the comma list env.GAM_ENGINEERING_SKILLS_KEEP.
//      The script adds missing names; an entry already in skillOverrides (set by hand or by /skills) and every other
//      key stay, except that a skill which is needed again (added to STACK.md section 10 or the keep list later) loses
//      an entry whose value is exactly user-invocable-only, the value this script writes. Nothing is written when
//      nothing changes, and an unreadable file is never overwritten.
//   2. Enabled plugins are not touched. Once per machine, and again when the list changes, a message names them with the
//      number of their skills and recommends /plugin and /skill-doctor (state: plugins-seen.json).
// env.GAM_ENGINEERING_SKILL_TRIM off makes the hook do nothing. Only directory names are read, never a SKILL.md.
// GAM_CLAUDE_HOME (else CLAUDE_CONFIG_DIR) replaces ~/.claude, GAM_SKILLS_HOME the skills folder, GAM_PLUGIN_STATE_DIR the state folder (tests).
// The hook never fails: on any error it exits 0 and says nothing.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

// The two settings layers (project-settings.mjs); a project whose copy lacks that file reads the committed file alone.
const { readEnv } = await import("./project-settings.mjs").catch(() => ({
  readEnv: (root) => {
    try {
      return JSON.parse(readFileSync(join(root, ".claude", "settings.json"), "utf8")).env ?? {};
    } catch {
      return {};
    }
  },
}));

const TRIMMED = "user-invocable-only";

const claudeHome = () => process.env.GAM_CLAUDE_HOME || process.env.CLAUDE_CONFIG_DIR || join(homedir(), ".claude");
const skillsHome = () => process.env.GAM_SKILLS_HOME || join(claudeHome(), "skills");
const stateDir = () => process.env.GAM_PLUGIN_STATE_DIR || join(claudeHome(), "gam-engineering");

function folderNames(dir) {
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((entry) => (entry.isDirectory() || entry.isSymbolicLink()) && !entry.name.startsWith("."))
      .map((entry) => entry.name);
  } catch {
    return [];
  }
}

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, "utf8").replace(/^﻿/, ""));
  } catch {
    return null;
  }
}

// The skill names STACK.md section 10 mentions: every `name` between its heading and the next one.
export function stackSkills(root) {
  let text;
  try {
    const folders = ["gam-ai-knowledge", "gam-engineering/documentation", "humanengineering/documentation"];
    const folder = folders.find((f) => existsSync(join(root, f))) ?? folders[0];
    text = readFileSync(join(root, folder, "STACK.md"), "utf8");
  } catch {
    return [];
  }
  const start = text.search(/^##\s+10\./m);
  if (start < 0) return [];
  const rest = text.slice(start).replace(/^##[^\n]*\n/, "");
  const next = rest.search(/^##\s/m);
  const section = next < 0 ? rest : rest.slice(0, next);
  return [...section.matchAll(/`([A-Za-z0-9][A-Za-z0-9:._-]*)`/g)].map((match) => match[1]);
}

export function neededSkills(root, env) {
  const keep = String(env.GAM_ENGINEERING_SKILLS_KEEP ?? "").split(",").map((name) => name.trim()).filter(Boolean);
  return new Set([...stackSkills(root), ...folderNames(join(root, ".claude", "skills")), ...keep]);
}

// Adds the missing entries to the local settings file and drops the trim of skills needed again; returns whether it wrote.
function trim(root, env) {
  const needed = neededSkills(root, env);
  const isNeeded = (name) => name.startsWith("gam-") || needed.has(name);
  const missing = folderNames(skillsHome()).filter((name) => !isNeeded(name));
  const file = join(root, ".claude", "settings.local.json");
  let settings = {};
  if (existsSync(file)) {
    settings = readJson(file);
    if (!settings || typeof settings !== "object" || Array.isArray(settings)) return false;
  }
  const isObject = (value) => value && typeof value === "object" && !Array.isArray(value);
  const current = isObject(settings.skillOverrides) ? settings.skillOverrides : {};
  const added = missing.filter((name) => !(name in current));
  const restored = Object.keys(current).filter((name) => current[name] === TRIMMED && isNeeded(name));
  if (!added.length && !restored.length) return false;
  const skillOverrides = { ...current };
  for (const name of restored) delete skillOverrides[name];
  for (const name of added) skillOverrides[name] = TRIMMED;
  mkdirSync(join(root, ".claude"), { recursive: true });
  writeFileSync(file, `${JSON.stringify({ ...settings, skillOverrides }, null, 2)}\n`);
  return true;
}

function enabledPlugins(root) {
  const enabled = new Set();
  const files = [join(claudeHome(), "settings.json"), join(root, ".claude", "settings.json"), join(root, ".claude", "settings.local.json")];
  for (const file of files) {
    const plugins = readJson(file)?.enabledPlugins;
    if (!plugins || typeof plugins !== "object") continue;
    for (const [key, value] of Object.entries(plugins)) {
      if (value === true) enabled.add(key);
      else if (value === false) enabled.delete(key);
    }
  }
  return [...enabled].sort();
}

// The number of skills of an installed plugin (its newest cached version), null when its folder is not found.
function skillCount(key) {
  const [name, market] = key.split("@");
  if (!name || !market) return null;
  const base = join(claudeHome(), "plugins", "cache", market, name);
  const version = folderNames(base).sort().pop();
  return version === undefined ? null : folderNames(join(base, version, "skills")).length;
}

function pluginHint(root) {
  const plugins = enabledPlugins(root);
  if (!plugins.length) return null;
  const file = join(stateDir(), "plugins-seen.json");
  const seen = readJson(file)?.plugins;
  if (Array.isArray(seen) && seen.join("\n") === plugins.join("\n")) return null;
  mkdirSync(stateDir(), { recursive: true });
  writeFileSync(file, JSON.stringify({ plugins }));
  const list = plugins
    .map((key) => {
      const count = skillCount(key);
      const name = key.split("@")[0];
      return count === null ? name : `${name} (${count} skills)`;
    })
    .join(", ");
  return `gam-engineering (P-WS-7): enabled plugins add their skills to every request: ${list}. Plugin skills are not trimmed here; turn off the ones you do not use with /plugin, and /skill-doctor shows what the listing costs.`;
}

function runHook() {
  const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const env = readEnv(root, { warn: () => {} });
  if (String(env.GAM_ENGINEERING_SKILL_TRIM ?? "on").toLowerCase() === "off") return;
  try {
    trim(root, env);
  } catch {
    // The plugin hint does not depend on it.
  }
  const text = pluginHint(root);
  if (text) process.stdout.write(JSON.stringify({ systemMessage: text }));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    runHook();
  } catch {
    // Never fail a session start because of the trim.
  }
  process.exit(0);
}
