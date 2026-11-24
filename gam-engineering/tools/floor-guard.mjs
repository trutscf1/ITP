#!/usr/bin/env node
// Weakening guard of the gam-engineering pipeline (AS-1, master plan step 7; concept: ADR-0011).
// Usage: node gam-engineering/tools/floor-guard.mjs check [--base <ref>]
// Run from the repo root; no dependencies. It reads the diff against the merge base with the integration branch
// (branch model trunk: main, else master; otherwise dev, main, master; GAM_GUARD_BASE or --base names another ref, which
// the host CI sets to the target branch) plus untracked files, and reports every move that lowers the bar: a new
// suppression comment, an added skip or only, a deleted or moved-out test file, fewer assertions in a kept test file, a
// loosened value or a removed check in gam-engineering/pipeline.json.
// A hit passes only with a line in gam-engineering/guard-reasons.md that the same diff adds:
//   - <path>: <move> - <reason>        (moves: suppression, skip, deleted-test, fewer-assertions, loosened)
// Exit 0 clean, 1 a hit without a reason, 2 the check could not run (never to be read as 0).
import { readFileSync } from "node:fs";
import { extname } from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const REASONS = "gam-engineering/guard-reasons.md";
const PIPELINE = "gam-engineering/pipeline.json";
const MARKER = "(?:\\/\\/|\\/\\*|#|<!--)\\s*";
const SUPPRESSION = new RegExp(`${MARKER}(?:biome-ignore|eslint-disable|@ts-ignore|@ts-expect-error|@ts-nocheck|noqa|type:\\s*ignore|pylint:\\s*disable|shellcheck\\s+disable|nolint|istanbul\\s+ignore|nosemgrep|NOSONAR|gitleaks:allow)`);
const SKIP = /\b(?:describe|it|test|context)\.(?:skip|only|todo)\b|\bx(?:it|describe|test)\s*\(|\{\s*(?:skip|only|todo)\s*:\s*(?:true|["'`])|@pytest\.mark\.(?:skip|xfail)|\bpytest\.skip\s*\(|\bt\.skip\s*\(|\bt\.Skip\w*\s*\(|@(?:Disabled|Ignore)\b|@unittest\.skip\w*|\bself\.skipTest\s*\(|\.skipIf\s*\(|\bthis\.skip\s*\(|#\[ignore|\bsuite\.(?:skip|only)\b/;
// Assertions of JavaScript, Python (also the bare assert statement), Go (t.Error and t.Fatal), and Rust (assert_eq!).
const ASSERTION = /\b(?:assert\w*!?|expect|should|verify)\s*[.(]|\brequire\.\w+\s*\(|^\s*assert\s+\S|\bt\.(?:is|true|false|truthy|falsy|deepEqual|equal|throws|Error\w*|Fatal\w*|Fail\w*)\s*\(|\bself\.assert\w+\(/;
const COMMENT_LINE = /^\s*(?:\/\/|#|\*|\/\*|--)/;
const TEST_PATH = /(^|\/)(?:tests?|__tests__|spec)\/|\.(?:test|spec)\.[a-z]+$|_test\.(?:go|py)$|(^|\/)test_[^/]+\.py$/i;
// A file named like a test; one that is renamed so that it no longer is, is no longer collected by the runner.
const TEST_FILE = /\.(?:test|spec)\.[a-z]+$|_test\.(?:go|py)$|(^|\/)test_[^/]+\.py$/i;
// JUnit, PHPUnit, and xUnit names (UserServiceTest.java); case-sensitive, so "latest.java" is no test.
const JAVA_TEST = /[a-z0-9](?:Test|Tests|IT)\.(?:java|kt|php|cs)$/;
const SKIPPED_PATH = /(^|\/)(?:node_modules|vendor|dist|build|coverage)\//;
// The catalog next to this tool: the extensions of code files and the tier of each kind; a short built-in list without it.
const CATALOG = (() => {
  try {
    return JSON.parse(readFileSync(new URL("./pipeline-catalog.json", import.meta.url), "utf8"));
  } catch {
    return { codeExtensions: [".py", ".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx", ".mts", ".cts", ".php", ".java", ".kt", ".cs", ".go", ".rs", ".rb"], checks: [] };
  }
})();
const CODE = new Set(CATALOG.codeExtensions);
const isCode = (path) => CODE.has(extname(path).toLowerCase());
const SEVERITY = ["low", "medium", "high", "critical"];

const isTest = (path) => TEST_PATH.test(path) || JAVA_TEST.test(path);
const testNamed = (path) => TEST_FILE.test(path) || JAVA_TEST.test(path);

function git(args) {
  const run = spawnSync("git", ["-c", "core.quotepath=false", ...args], { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
  if (run.error || run.status !== 0) throw new Error(`git ${args.join(" ")} failed: ${run.error?.message ?? run.stderr.trim()}`);
  return run.stdout;
}

const refExists = (ref) => spawnSync("git", ["rev-parse", "--verify", "--quiet", ref], { encoding: "utf8" }).status === 0;

function branchModel() {
  try {
    return JSON.parse(readFileSync(".claude/settings.json", "utf8")).env?.GAM_ENGINEERING_BRANCHES;
  } catch {
    return undefined;
  }
}

// The merge base with the integration branch; throws when git cannot name one.
export function mergeBase(base) {
  const named = base ?? process.env.GAM_GUARD_BASE;
  const candidates = branchModel() === "trunk" ? ["main", "master", "origin/main", "origin/master"] : ["dev", "main", "master", "origin/dev", "origin/main"];
  const ref = named || candidates.find(refExists);
  if (!ref) throw new Error("no integration branch (dev, main, master) found; name one with --base");
  return git(["merge-base", ref, "HEAD"]).trim();
}

// Unified diff with zero context → [{ path, from, deleted, added, removed }]. Header lines count only before the first
// hunk of a file, so a changed line that starts with "--" or "++" stays content.
export function parseDiff(text) {
  const files = [];
  let current = null;
  let inHunk = false;
  for (const line of text.split("\n")) {
    if (!current && !line.startsWith("diff --git ")) continue;
    if (line.startsWith("diff --git ")) {
      const names = /^diff --git a\/(.+) b\/(.+)$/.exec(line);
      current = { path: names?.[2] ?? "", from: names?.[1] ?? "", deleted: false, added: [], removed: [] };
      files.push(current);
      inHunk = false;
    } else if (current && line.startsWith("@@")) {
      inHunk = true;
    } else if (inHunk) {
      if (line.startsWith("+")) current.added.push(line.slice(1));
      else if (line.startsWith("-")) current.removed.push(line.slice(1));
    } else if (line.startsWith("deleted file mode")) {
      current.deleted = true;
    } else if (line.startsWith("rename from ")) {
      current.from = line.slice(12);
    } else if (line.startsWith("rename to ")) {
      current.path = line.slice(10);
    } else if (line.startsWith("--- a/")) {
      current.from = line.slice(6);
    } else if (line.startsWith("+++ b/")) {
      current.path = line.slice(6);
    }
  }
  return files.filter((file) => (file.deleted ? file.from : file.path));
}

function untrackedFiles() {
  const names = git(["ls-files", "--others", "--exclude-standard"]).split("\n").filter(Boolean);
  const files = [];
  for (const name of names) {
    let text;
    try {
      text = readFileSync(name, "utf8");
    } catch {
      continue;
    }
    if (text.length > 1_000_000 || text.includes("\0")) continue;
    files.push({ path: name, from: name, deleted: false, added: text.split("\n"), removed: [], untracked: true });
  }
  return files;
}

const count = (lines, pattern) => lines.filter((line) => pattern.test(line)).length;
// An assertion that is commented out is no assertion.
const assertions = (lines) => lines.filter((line) => !COMMENT_LINE.test(line) && ASSERTION.test(line)).length;

// Per file: the hits of the code and test moves ({ path, move, detail }).
export function fileHits(file) {
  const path = file.deleted ? file.from : file.path;
  if (path === REASONS || SKIPPED_PATH.test(path)) return [];
  const hits = [];
  if (file.deleted) {
    if (isTest(path) && isCode(path)) hits.push({ path, move: "deleted-test", detail: "test file deleted" });
    return hits;
  }
  // Still a test: inside a test path, a code file, and, where the old name was a test file name, still named like one.
  const stillTest = isTest(path) && isCode(path) && (!testNamed(file.from ?? "") || testNamed(path));
  if (file.from && file.from !== path && isTest(file.from) && isCode(file.from) && !stillTest) {
    hits.push({ path: file.from, move: "deleted-test", detail: `test file renamed to ${path}, which is no test file or outside the test path` });
  }
  if (!path.endsWith(".md")) {
    const suppressed = count(file.added, SUPPRESSION);
    if (suppressed) hits.push({ path, move: "suppression", detail: `${suppressed} new suppression comment(s)` });
  }
  if (!isTest(path) || !isCode(path)) return hits;
  const skipped = count(file.added, SKIP);
  if (skipped) hits.push({ path, move: "skip", detail: `${skipped} added skip or only` });
  const lost = assertions(file.removed) - assertions(file.added);
  if (!file.untracked && lost > 0) hits.push({ path, move: "fewer-assertions", detail: `${lost} fewer assertion line(s)` });
  return hits;
}

const checkKey = (check) => [check.kind, check.language ?? "", check.cwd ?? "", check.tool ?? ""].join("|");
// The tier a check runs in: its own `tier` (the key in any spelling, the value without case), else the catalog's for its
// kind, else merge, as the runner reads it.
function effectiveTier(check) {
  const key = Object.keys(check).find((name) => name.toLowerCase() === "tier");
  const own = key === undefined ? "" : String(check[key]).toLowerCase();
  if (own === "merge" || own === "release") return own;
  return String(CATALOG.checks.find((entry) => entry.kind === check.kind)?.tier ?? "merge").toLowerCase();
}

// A number or a numeric text; anything else is undefined.
const numeric = (value) => (typeof value === "number" || (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) ? Number(value) : undefined);
const levelOf =(value) => {
  const levels = String(value).toLowerCase().split(/[\s,]+/).filter(Boolean).map((word) => SEVERITY.indexOf(word));
  return levels.length && levels.every((level) => level >= 0) ? Math.min(...levels) : -1;
};

// One threshold: a text describing the loosening, or "" when the bar stays or rises. A value the guard cannot rank counts
// as loosened, so a reason line has to say why.
function thresholdMove(before, after) {
  const old = String(before ?? "");
  const now = String(after ?? "");
  if (old === "" || old === now) return "";
  if (now === "") return `threshold ${old} removed`;
  if (!Number.isNaN(Number(old)) && !Number.isNaN(Number(now))) return Number(now) < Number(old) ? `threshold ${old} → ${now}` : "";
  const from = levelOf(old);
  const to = levelOf(now);
  if (from >= 0 && to >= 0) return to > from ? `severity bar ${old} → ${now}` : "";
  return `threshold ${old} → ${now} (direction unknown)`;
}

// Old and new decision → the loosenings between them: a removed check, a lower or removed threshold, a lower severity
// bar, a raised or removed max* setting, a lowered min* setting, a longer exclude list.
export function pipelineHits(oldDecision, newDecision) {
  const hits = [];
  const add = (detail) => hits.push({ path: PIPELINE, move: "loosened", detail });
  const next = new Map((newDecision.checks ?? []).map((check) => [checkKey(check), check]));
  for (const old of oldDecision.checks ?? []) {
    const check = next.get(checkKey(old));
    if (!check) {
      add(`check ${old.kind} removed`);
      continue;
    }
    const moved = thresholdMove(old.threshold, check.threshold);
    if (moved) add(`${old.kind}: ${moved}`);
    for (const [key, raw] of Object.entries(old.settings ?? {})) {
      const before = numeric(raw);
      const value = numeric(check.settings?.[key]);
      if (before === undefined) continue;
      if (/^max/i.test(key) && (value === undefined || value > before)) add(`${old.kind}: ${key} ${before} → ${value ?? "removed"}`);
      if (/^min/i.test(key) && (value === undefined || value < before)) add(`${old.kind}: ${key} ${before} → ${value ?? "removed"}`);
    }
    const tierBefore = effectiveTier(old);
    const tierNow = effectiveTier(check);
    if (tierNow !== tierBefore && tierNow !== "merge") add(`${old.kind}: tier ${tierBefore} → ${tierNow}`);
    const kept = new Set(old.exclude ?? []);
    for (const entry of check.exclude ?? []) if (!kept.has(entry)) add(`${old.kind}: exclude ${entry} added`);
  }
  if (oldDecision.docsOnly === "full" && newDecision.docsOnly !== "full") add("docsOnly full removed");
  return hits;
}

// The reason lines the diff adds: [{ path, move, reason }] (a line that is not in the diff does not count). Backticks
// around the path and backslashes are tolerated.
export function acceptedReasons(files) {
  const added = files.find((file) => file.path === REASONS)?.added ?? [];
  const accepted = [];
  for (const line of added) {
    const match = /^\s*[-*]\s+(.+?):\s+([a-z-]+)\s+-\s+(\S.*?)\s*$/.exec(line);
    if (match) accepted.push({ path: match[1].replace(/`/g, "").replace(/\\/g, "/"), move: match[2], reason: match[3] });
  }
  return accepted;
}

function decisionAt(base, text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${PIPELINE} at ${base}: ${error.message}`);
  }
}

function pipelineChange(base, files) {
  if (!files.some((file) => file.path === PIPELINE)) return [];
  const old = spawnSync("git", ["show", `${base}:${PIPELINE}`], { encoding: "utf8" });
  if (old.status !== 0) return [];
  return pipelineHits(decisionAt(base, old.stdout), decisionAt("the working tree", readFileSync(PIPELINE, "utf8")));
}

export function check(baseRef) {
  const base = mergeBase(baseRef);
  const files = [...parseDiff(git(["diff", "--unified=0", "--no-color", "--no-ext-diff", "-M", base, "--"])), ...untrackedFiles()];
  const hits = [...files.flatMap(fileHits), ...pipelineChange(base, files)];
  const accepted = acceptedReasons(files);
  const open = [];
  const lines = [];
  for (const hit of hits) {
    const reason = accepted.find((item) => item.path === hit.path && item.move === hit.move);
    lines.push(`${hit.path}: ${hit.move} - ${hit.detail}${reason ? ` (accepted: ${reason.reason})` : ""}`);
    if (!reason) open.push(hit);
  }
  if (open.length) {
    lines.push(`guard: ${open.length} loosening(s) without a reason; add "- <path>: <move> - <reason>" to ${REASONS} in the same change`);
  } else {
    lines.push(`guard: ${hits.length} loosening(s), all with a reason; ${files.length} changed file(s) read`);
  }
  console.log(lines.join("\n"));
  return open.length ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const flag = process.argv.indexOf("--base");
  if (process.argv[2] !== "check" || (flag > 0 && !process.argv[flag + 1])) {
    console.error("usage: node floor-guard.mjs check [--base <ref>]");
    process.exitCode = 2;
  } else {
    try {
      process.exitCode = check(flag > 0 ? process.argv[flag + 1] : undefined);
    } catch (error) {
      console.error(`guard: could not run: ${error.message}`);
      process.exitCode = 2;
    }
  }
}
