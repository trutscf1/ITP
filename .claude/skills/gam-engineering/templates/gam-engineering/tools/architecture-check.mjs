#!/usr/bin/env node
// Architecture checks of the gam-engineering pipeline (P-ARCH-1, P-ARCH-2; concept pipeline-proposal M7, PP-F-21, PP-F-22).
// Usage: node gam-engineering/tools/architecture-check.mjs layers   (dependency-cruiser: cycles and inward layer rules)
//        node gam-engineering/tools/architecture-check.mjs limits   (file size and function length)
// Run from the repo root; no dependencies of its own. dependency-cruiser runs through npx at the version the catalog
// pins. The recorded check in gam-engineering/pipeline.json may carry settings ({ maxFileLines, maxFunctionLines })
// and exclude (a list of path prefixes) for limits.
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const STACK = "gam-ai-knowledge/STACK.md";
const CONFIG = "gam-engineering/reports/architecture/dependency-cruiser.json";
const SKIPPED_FOLDERS = new Set(["node_modules", ".git", "vendor", "dist", "build", "coverage", ".next", "target", "obj"]);
// The skills' own copies in a project (pipeline helper, doc-check, runner) are not the project's code (PP-F-22).
const SKILL_FOLDERS = ["gam-engineering/", "gam-ai-knowledge/", "humanengineering/"];
const KEYWORDS = new Set(["if", "for", "while", "switch", "catch", "function", "return", "else", "do", "try", "with", "new"]);

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// STACK.md text → [{ layer, path }] from the table under the heading "Layering chain", ordered from the domain outward;
// [] without the heading or without a usable row (A181).
export function parseChain(markdown) {
  const rows = [];
  let inside = false;
  for (const line of markdown.split(/\r?\n/)) {
    if (/^#{1,6}\s/.test(line)) {
      inside = /layering chain/i.test(line);
      continue;
    }
    if (!inside || !line.trim().startsWith("|")) continue;
    const [layer, path] = line.split("|").slice(1, -1).map((cell) => cell.trim().replace(/`/g, ""));
    if (!layer || !path || /^-+$/.test(layer.replace(/\s|:/g, "")) || /^layer$/i.test(layer)) continue;
    if (layer.startsWith("[") || path.startsWith("[") || /^e\.g\./i.test(path)) continue;
    rows.push({ layer, path: path.replace(/\\/g, "/").replace(/\/+$/, "") });
  }
  return rows;
}

// Chain → dependency-cruiser configuration: no-circular always, and per layer except the outermost one rule that forbids
// importing from the layers outside it (P-ARCH-1).
export function buildConfig(chain) {
  const forbidden = [{ name: "no-circular", severity: "error", from: {}, to: { circular: true } }];
  chain.slice(0, -1).forEach(({ layer, path }, index) => {
    const outer = chain.slice(index + 1).map((item) => escapeRegex(item.path));
    forbidden.push({
      name: `${layer}-inward`,
      severity: "error",
      comment: `${layer} must not depend on a layer outside it (P-ARCH-1)`,
      from: { path: `^${escapeRegex(path)}/` },
      to: { path: `^(${outer.join("|")})/` },
    });
  });
  return {
    forbidden,
    options: { doNotFollow: { path: "node_modules" }, exclude: { path: "(^|/)(node_modules|\\.git|dist|build|coverage)/" }, tsPreCompilationDeps: true },
  };
}

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const catalogEntry = (kind) => readJson(new URL("./pipeline-catalog.json", import.meta.url)).checks.find((entry) => entry.kind === kind);

function layers() {
  let chain = [];
  try {
    chain = parseChain(readFileSync(STACK, "utf8"));
  } catch {
    // no STACK.md: the same finding as a STACK.md without the chain
  }
  if (chain.length === 0) console.log("layering chain missing in STACK.md (P-DES-3); only the cycle rule runs");
  mkdirSync(dirname(CONFIG), { recursive: true });
  writeFileSync(CONFIG, `${JSON.stringify(buildConfig(chain), null, 2)}\n`);
  const args = ["--yes", `dependency-cruiser@${catalogEntry("architecture").version}`, "--config", CONFIG, "--output-type", "err", "."];
  const run = spawnSync("npx", args, { stdio: "inherit", shell: process.platform === "win32" });
  if (run.error) console.error(`architecture-check: cannot run npx (${run.error.message})`);
  return run.status === 0 ? 0 : 1;
}

// Declaration line → function name, or null. One pattern per family; comments and strings are stripped first.
const DECLARATIONS = [
  /\bfunction\b\s*\*?\s*([\w$:-]*)/,
  /\b(?:fn|func)\s+(?:\([^)]*\)\s*)?([\w$]+)/,
  /\b(?:const|let|var)\s+([\w$]+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[\w$]+)\s*=>\s*\{/,
  /^\s*(?:(?:public|private|protected|static|final|abstract|override|virtual|async|internal|sealed|synchronized)\s+)+[\w<>[\],.?\s]*?([\w$]+)\s*\([^)]*\)[^;{]*\{?\s*$/,
  /^\s*(?:async\s+)?(?:static\s+)?([\w$]+)\s*\([^)]*\)\s*\{\s*$/,
];

function declaredName(line) {
  for (const pattern of DECLARATIONS) {
    const match = pattern.exec(line);
    if (match && !KEYWORDS.has(match[1])) return match[1] || "anonymous";
  }
  return null;
}

const stripLiterals = (line) => line.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/g, '""').replace(/\/\/.*$|#.*$/, "");

// Index of the line where the braces opened at or after `start` close again, or -1 (no body within 5 lines).
function closingLine(codeLines, start) {
  let depth = 0;
  let opened = false;
  for (let index = start; index < codeLines.length; index++) {
    if (!opened && index > start + 5) return -1;
    for (const char of codeLines[index]) {
      if (char === "{") {
        depth++;
        opened = true;
      } else if (char === "}" && opened && --depth === 0) return index;
    }
  }
  return -1;
}

// Python: a def runs up to the last non-blank line before the next line indented no deeper.
function pythonFunctions(lines) {
  const found = [];
  lines.forEach((line, index) => {
    const match = /^(\s*)(?:async\s+)?def\s+(\w+)/.exec(line);
    if (!match) return;
    let last = index;
    for (let next = index + 1; next < lines.length; next++) {
      if (!lines[next].trim()) continue;
      if (lines[next].match(/^\s*/)[0].length <= match[1].length) break;
      last = next;
    }
    found.push({ name: match[2], line: index + 1, length: last - index + 1 });
  });
  return found;
}

// Text of one file → [{ name, line, length }] (A182: the same heuristic for every language).
export function functionsOf(text, extension) {
  const lines = text.split(/\r?\n/);
  if (extension === ".py") return pythonFunctions(lines);
  const code = lines.map(stripLiterals);
  const found = [];
  code.forEach((line, index) => {
    const name = declaredName(line);
    if (name === null) return;
    const end = closingLine(code, index);
    if (end >= 0) found.push({ name, line: index + 1, length: end - index + 1 });
  });
  return found;
}

const countLines = (text) => {
  const lines = text.split(/\r?\n/);
  return lines.at(-1) === "" ? lines.length - 1 : lines.length;
};

// Settings of the recorded limits check over the catalog defaults.
function limitSettings() {
  let recorded;
  try {
    recorded = readJson("gam-engineering/pipeline.json").checks.find((check) => check.kind === "limits");
  } catch {
    // no decision: the defaults apply
  }
  const { maxFileLines, maxFunctionLines } = { ...catalogEntry("limits").defaults, ...recorded?.settings };
  const exclude = (recorded?.exclude ?? []).map((prefix) => prefix.replace(/\\/g, "/"));
  return { maxFileLines, maxFunctionLines, exclude };
}

function* codeFiles(folder, extensions) {
  for (const item of readdirSync(folder, { withFileTypes: true })) {
    const path = join(folder, item.name);
    if (item.isDirectory()) {
      if (!SKIPPED_FOLDERS.has(item.name)) yield* codeFiles(path, extensions);
    } else if (extensions.has(extname(item.name).toLowerCase()) && !item.name.includes(".min.") && statSync(path).size < 5_000_000) {
      yield path;
    }
  }
}

function limits() {
  const { maxFileLines, maxFunctionLines, exclude } = limitSettings();
  const extensions = new Set(readJson(new URL("./pipeline-catalog.json", import.meta.url)).codeExtensions);
  const reports = [];
  let checked = 0;
  for (const path of codeFiles(".", extensions)) {
    const name = relative(".", path).replace(/\\/g, "/");
    if (SKILL_FOLDERS.some((folder) => name.startsWith(folder))) continue;
    if (exclude.some((prefix) => name === prefix || name.startsWith(prefix.endsWith("/") ? prefix : `${prefix}/`))) continue;
    checked++;
    const text = readFileSync(path, "utf8");
    const total = countLines(text);
    if (total > maxFileLines) reports.push(`${name}: ${total} lines, limit ${maxFileLines}`);
    for (const item of functionsOf(text, extname(name).toLowerCase())) {
      if (item.length > maxFunctionLines) reports.push(`${name}:${item.line}: function ${item.name}, ${item.length} lines, limit ${maxFunctionLines}`);
    }
  }
  console.log(reports.length ? reports.join("\n") : `limits: ${checked} code files within the limits`);
  return reports.length ? 1 : 0;
}

const COMMANDS = { layers, limits };

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const command = COMMANDS[process.argv[2]];
  if (!command) {
    console.error(`usage: node architecture-check.mjs <${Object.keys(COMMANDS).join(" | ")}>`);
    process.exitCode = 2;
  } else {
    process.exitCode = command();
  }
}
