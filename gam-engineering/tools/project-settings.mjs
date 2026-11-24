// Reads the project's gam- settings from two layers (P-TEAM-2, P-TEAM-6; Q534, Q536):
//   - project: env of the committed .claude/settings.json, binding for everyone on the repo;
//   - personal: env of the git-ignored .claude/settings.local.json, which may override only the PERSONAL_KEYS below.
// A project key in the local file is ignored, so no developer can loosen the merge policy, the project kind, or the
// chat export for themselves. The project kind (student | teacher | normal; the former `other` reads as `normal`)
// decides the chat export: under `student` it is always `commit` (Q533). GAM_ENGINEERING_FOOTPRINT (tracked | stealth |
// minimal) is a project key too; under minimal the settings file is git-ignored and the file on disk counts (A7 of plan
// gam-ai-memory/plans/2026-11-21-minimal-mode.md).
//
//   node gam-engineering/tools/project-settings.mjs show   # every gam- key with value and source (project/local)
//
// Node 18+, no dependencies.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export const PROJECT_KINDS = ["student", "teacher", "normal"];

const PERSONAL = new Set([
  "GAM_ENGINEERING_SKILL_TRIM",
  "GAM_ENGINEERING_SKILLS_KEEP",
  "GAM_ENGINEERING_LIMIT_GUARD",
  "GAM_ENGINEERING_LIMIT_WARN",
  "GAM_ENGINEERING_LIMIT_STOP",
  "GAM_ENGINEERING_LIMIT_ACTION",
  "GAM_ENGINEERING_SESSION_THRESHOLD",
  "GAM_ENGINEERING_SESSION_MAX_HOURS",
  "GAM_ENGINEERING_LOG_KEEP",
  "GAM_ENGINEERING_FRONTEND_HOOK",
  "GAM_ENGINEERING_DELEGATE_MIN_FILES",
  "GAM_ENGINEERING_DELEGATE_MIN_OUTPUT_LINES",
  "GAM_ENGINEERING_RUNNER",
  "GAM_ENGINEERING_MAX_PARALLEL",
  "GAM_STEALTH_TARGET",
]);

// Model tiers and per-command models (GAM_ENGINEERING_MODEL_JUDGE, _DRAFT, _CHECK, _<COMMAND>) are personal too.
export function isPersonalKey(key) {
  return PERSONAL.has(key) || key.startsWith("GAM_ENGINEERING_MODEL_");
}

export const PERSONAL_KEYS = [...PERSONAL];

function readEnvOf(file, warn) {
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    return {};
  }
  try {
    const env = JSON.parse(text.replace(/^﻿/, "")).env;
    return env && typeof env === "object" && !Array.isArray(env) ? env : {};
  } catch {
    warn?.(`project-settings: ${file} is not valid JSON; it is ignored`);
    return {};
  }
}

// Both layers with the source of every key: { env, source } where source[key] is "project" or "local".
export function readLayers(root = process.env.CLAUDE_PROJECT_DIR || process.cwd(), { warn = (line) => process.stderr.write(`${line}\n`) } = {}) {
  const project = readEnvOf(join(root, ".claude", "settings.json"), warn);
  const local = readEnvOf(join(root, ".claude", "settings.local.json"), warn);
  const env = { ...project };
  const source = Object.fromEntries(Object.keys(project).map((key) => [key, "project"]));
  const ignored = [];
  for (const [key, value] of Object.entries(local)) {
    if (isPersonalKey(key)) {
      env[key] = value;
      source[key] = "local";
    } else if (key.startsWith("GAM_")) {
      ignored.push(key);
    }
  }
  return { env, source, ignored };
}

// The effective env: the committed settings, overlaid with the personal keys of the local file.
export function readEnv(root, options) {
  return readLayers(root, options).env;
}

// The project kind of an env (only the committed value counts, since the key is never personal).
export function projectKind(env = {}) {
  const value = String(env.GAM_ENGINEERING_PROJECT_KIND ?? "").trim().toLowerCase();
  return PROJECT_KINDS.includes(value) ? value : "normal";
}

export const FOOTPRINTS = ["tracked", "stealth", "minimal"];

// The footprint of an effective env (plan gam-ai-memory/plans/2026-11-21-minimal-mode.md, QA0052): the project key
// GAM_ENGINEERING_FOOTPRINT; without it, a set GAM_STEALTH_TARGET (personal, in the local file) reads as stealth, so
// stealth projects from before the key keep working; otherwise tracked. footprint.mjs builds the path lists on it.
export function footprintOf(env = {}) {
  const value = String(env.GAM_ENGINEERING_FOOTPRINT ?? "").trim().toLowerCase();
  if (FOOTPRINTS.includes(value)) return { footprint: value, source: "GAM_ENGINEERING_FOOTPRINT" };
  if (String(env.GAM_STEALTH_TARGET ?? "").trim() !== "") return { footprint: "stealth", source: "GAM_STEALTH_TARGET" };
  return { footprint: "tracked", source: value === "" ? "default" : `default (unknown value ${value})` };
}

function show(root) {
  const { env, source, ignored } = readLayers(root);
  const keys = Object.keys(env).filter((key) => key.startsWith("GAM_")).sort();
  console.log(`project kind: ${projectKind(env)}`);
  const footprint = footprintOf(env);
  console.log(`footprint: ${footprint.footprint} (from ${footprint.source})`);
  for (const key of keys) {
    const scope = isPersonalKey(key) ? "personal" : "project";
    console.log(`${key} = ${env[key]}  (${scope}, from ${source[key] === "local" ? ".claude/settings.local.json" : ".claude/settings.json"})`);
  }
  for (const key of ignored) console.log(`${key} in .claude/settings.local.json is ignored: a project key belongs in .claude/settings.json`);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [command] = process.argv.slice(2);
  if (command === "show") process.exitCode = show(process.cwd());
  else {
    process.stderr.write("usage: project-settings.mjs show\n");
    process.exitCode = 1;
  }
}
