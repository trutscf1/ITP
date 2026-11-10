#!/usr/bin/env node
// Mechanical part of the engineering-human consistency check: checks documentation/ against the
// Machine-Readable Contract of documentation/MANIFEST.md. No dependencies; Node 18+.
// Usage: node tools/doc-check.mjs [documentation-dir] [--json]
//        [--status [--pending-title <MR title>] [--pending-branch <MR source branch>]]
// --status also compares the ROADMAP stages and the position rows with the git history (S-3).
// Rule AC-TEST looks for each acceptance criterion's ID in the test names of the code next to the
// documentation folder; --pending-branch names the merge request whose slice must be tested.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { dirname, join, relative, resolve, posix } from "node:path";
import { execFileSync } from "node:child_process";

const DOC_TYPES = ["goal", "manifest", "context", "adr", "concept", "feature", "story", "qa-log", "stack", "workflow", "roadmap", "roadmap-details", "inbox", "versioning", "team", "status"];
const FORMATS = ["engineering-human/2", "legacy"];
const AUDIENCES = ["product", "developer", "reviewer", "agent"];
const STAGES = ["idea", "concept", "ready", "in progress", "in dev", "released"];
const EARLY_STAGES = ["idea", "concept"];
const DONE_STAGES = ["in dev", "released"];
const ADR_STATUS = ["proposed", "accepted", "rejected", "deprecated", "superseded"];

const ID_TOKEN = /(?<![\w-])(?:[A-Z]{2,4}-AC-\d+\.\d+|[A-Z]{2,4}-(?:US|NF|F|U|C|E|T)-\d+|G-1(?:\.[SN]\d+)?|R-\d+)(?!\w)/g;
const CONCEPT_ID = /^([A-Z]{2,4})-(US|NF|F|U|C|E|T)-(\d+)$/;
const AC_ID = /^([A-Z]{2,4})-AC-(\d+)\.(\d+)$/;
// Rule AC-TEST: test files, folders never searched, test calls with their name, AC IDs in a name.
const TEST_FILE = /\.(?:test|spec)\.[cm]?[jt]sx?$/;
const SKIPPED_DIRS = new Set(["node_modules", "dist", "build", "out", "coverage", "storybook-static"]);
const TEST_CALL = /(?<![\w$.])(?:test\.)?(?:describe|it|test|suite)(?:\.only)?\s*\(\s*(["'`])((?:\\[\s\S]|(?!\1)[^\\])*)\1/g;
const AC_IN_NAME = /(?<![\w-])[A-Z]{2,4}-AC-\d+\.\d+(?!\w|\.\d)/g;

const args = process.argv.slice(2);
const VALUE_OPTIONS = ["--pending-title", "--pending-branch"];
const option = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] ?? "" : "");
const asJson = args.includes("--json");
const statusMode = args.includes("--status");
const pendingTitle = option("--pending-title");
const pendingBranch = option("--pending-branch");
const root = args.find((a, i) => !a.startsWith("--") && !VALUE_OPTIONS.includes(args[i - 1])) || "documentation";

const findings = [];
const report = (severity, code, file, line, id, message) => findings.push({ severity, code, file, line, id, message });

// ---------- parsing ----------

function listMarkdown(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return listMarkdown(path);
    return name.endsWith(".md") ? [path] : [];
  });
}

function stripComment(line) {
  let quote = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quote) {
      if (c === quote) quote = null;
    } else if (c === '"' || c === "'") quote = c;
    else if (c === "#" && (i === 0 || /\s/.test(line[i - 1]))) return line.slice(0, i);
  }
  return line;
}

function scalar(text) {
  const t = text.trim();
  return /^(["']).*\1$/.test(t) ? t.slice(1, -1) : t;
}

function yamlValue(text) {
  const t = text.trim();
  if (t.startsWith("[") && t.endsWith("]")) {
    const inner = t.slice(1, -1).trim();
    return inner ? inner.split(",").map(scalar) : [];
  }
  return scalar(t);
}

function parseFrontmatter(lines) {
  if (lines[0] !== "---") return null;
  const end = lines.indexOf("---", 1);
  if (end < 0) return null;
  const data = {};
  let lastKey = null;
  for (const raw of lines.slice(1, end)) {
    const line = stripComment(raw);
    if (!line.trim()) continue;
    const item = line.match(/^\s+-\s+(.*)$/);
    if (item && lastKey) {
      if (!Array.isArray(data[lastKey])) data[lastKey] = [];
      data[lastKey].push(scalar(item[1]));
      continue;
    }
    const kv = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (kv) {
      lastKey = kv[1];
      data[lastKey] = yamlValue(kv[2]);
    }
  }
  return { data, end };
}

function splitRow(line) {
  let t = line.trim();
  if (t.startsWith("|")) t = t.slice(1);
  if (t.endsWith("|") && !t.endsWith("\\|")) t = t.slice(0, -1);
  return t.split(/(?<!\\)\|/).map((c) => c.replace(/\\\|/g, "|").trim());
}

function parseBody(lines, start) {
  const tables = [];
  const naLines = [];
  let inFence = false;
  let heading = "";
  for (let i = start; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const h = line.match(/^#{1,6}\s+(.*)/);
    if (h) {
      heading = h[1];
      continue;
    }
    if (/^\s*n\/a\b/i.test(line) && !/^\s*n\/a\s*[—–-]\s*\S/i.test(line)) naLines.push(i + 1);
    if (line.trim().startsWith("|") && /^\s*\|?\s*:?-{3,}/.test(lines[i + 1] || "")) {
      const header = splitRow(line).map((c) => c.toLowerCase());
      const rows = [];
      let j = i + 2;
      while (j < lines.length && lines[j].trim().startsWith("|")) {
        rows.push({ cells: splitRow(lines[j]), line: j + 1 });
        j++;
      }
      tables.push({ heading, header, rows, line: i + 1 });
      i = j - 1;
    }
  }
  return { tables, naLines };
}

function tableKind(header) {
  const has = (name) => header.includes(name);
  if (header[0] === "id" && has("user group (role)")) return "users";
  if (header[0] === "id" && has("signal") && has("target")) return "signals";
  if (header[0] === "id" && has("non-goal")) return "nongoals";
  if (has("feature") && has("serves") && has("status")) return "roadmap";
  if (header[0] === "stage" && has("meaning")) return "stages";
  if (header[0] === "id" && has("as a") && has("i want")) return "stories";
  if (header[0] === "id" && has("covers")) return "tests";
  if (header[0] === "id" && has("given") && has("then")) return "acs";
  if (header[0] === "id" && has("derives from")) return "requirements";
  if (header[0] === "id" && has("technology")) return "stack";
  if (header[0] === "slice" && has("delivers")) return "slices";
  if (has("feature") && has("branch") && has("next step")) return "positions";
  if (header.length === 2 && header[0] === "id" && has("reason")) return "untested";
  return null;
}

const ids = (text) => (text || "").replace(/[`[\]]/g, " ").match(ID_TOKEN) || [];
const bare = (text) => (text || "").replace(/[`[\]*]/g, "").trim();
const col = (table, row, name) => row.cells[table.header.indexOf(name)] ?? "";

// ---------- collect ----------

if (!existsSync(root) || !statSync(root).isDirectory()) {
  console.error(`doc-check: directory not found: ${root}`);
  process.exit(2);
}

const defined = new Map(); // id -> {file, line}
const refs = []; // {id, file, line, from}
const concepts = [];
const roadmapRows = [];
const positions = [];
const stackIds = [];
const roles = [];
const features = []; // work-item tree (P-DOC-6): feature.md per folder
const storyFiles = []; // one user story per file
const slices = []; // {acs, issues} per row of a story file's slice table
let goalFound = false;

function define(id, file, line) {
  if (defined.has(id)) {
    const first = defined.get(id);
    report("error", "ID", file, line, id, `defined twice (first at ${first.file}:${first.line})`);
  } else defined.set(id, { file, line });
}

for (const path of listMarkdown(root)) {
  const file = relative(process.cwd(), path).replace(/\\/g, "/");
  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  const fm = parseFrontmatter(lines);
  if (!fm) {
    report("error", "FM", file, 1, "", "no frontmatter block (--- … ---) at the top");
    continue;
  }
  const d = fm.data;
  const fmError = (msg) => report("error", "FM", file, 1, "", msg);
  if (!DOC_TYPES.includes(d.doc)) fmError(`doc must be one of ${DOC_TYPES.join(", ")}`);
  if (!FORMATS.includes(d.format)) fmError(`format must be ${FORMATS.join(" or ")}`);
  if (d.format === "legacy" && d.doc !== "concept") fmError("format legacy is allowed only for concept documents");
  if (typeof d.title !== "string" || !d.title) fmError("title is missing");
  if (!Array.isArray(d.audience) || !d.audience.length || d.audience.some((a) => !AUDIENCES.includes(a)))
    fmError(`audience must be a list of ${AUDIENCES.join(", ")}`);
  if (["concept", "feature", "story"].includes(d.doc) && !/^[A-Z]{2,4}$/.test(d["id-prefix"] || "")) fmError("id-prefix must be 2–4 capital letters");
  if (d.doc === "feature" && !/\.md$/.test(d.concept || "")) fmError("concept must name the concept document's file (feature.md)");
  if (d.doc === "concept" && d.format !== "legacy" && !/^G-1(\.S\d+)?$/.test(d.serves || "")) fmError("serves must be G-1 or G-1.S<n>");
  if (d.doc === "adr") {
    if (!ADR_STATUS.includes(d.status)) fmError(`status must be one of ${ADR_STATUS.join(", ")}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date || "")) fmError("date must be YYYY-MM-DD");
  }
  if (d.doc === "status" && !d.handle) fmError("handle is missing");

  const body = parseBody(lines, fm.end + 1);
  for (const line of body.naLines) report("error", "NA", file, line, "", "n/a needs a reason: `n/a — <reason in one sentence>`");

  if (d.doc === "goal") {
    goalFound = true;
    define("G-1", file, 1);
  }
  if (d.doc === "concept") {
    const concept = { file, prefix: d["id-prefix"], title: d.title, serves: d.serves, legacy: d.format === "legacy", stories: [], acs: [], reqs: [], tests: [], untested: new Set(), hasTests: false };
    concepts.push(concept);
    if (concept.serves) refs.push({ id: concept.serves, file, line: 1, from: "serves" });
    if (concept.legacy) continue;
  }
  if (d.doc === "feature") {
    const links = [];
    for (const line of lines.slice(fm.end + 1))
      for (const m of line.matchAll(/\]\(([^)#\s]+\.md)(?:#[^)]*)?\)/g)) links.push(posix.join(posix.dirname(file), m[1]));
    features.push({ file, dir: posix.dirname(file), prefix: d["id-prefix"], concept: d.concept, links });
  }
  const story = d.doc === "story" ? { file, dir: posix.dirname(file), prefix: d["id-prefix"], stories: [], acs: [] } : null;
  if (story) storyFiles.push(story);

  for (const table of body.tables) {
    const kind = tableKind(table.header);
    for (const row of table.rows) {
      const rawId = bare(row.cells[0]);
      const at = row.line;
      switch (d.doc === "concept" ? kind : `${d.doc}:${kind}`) {
        case "goal:users":
          if (!/^R-\d+$/.test(rawId)) report("error", "ID", file, at, rawId, "a target-user role ID must be R-<n>");
          else define(rawId, file, at);
          roles.push(bare(col(table, row, "user group (role)")).toLowerCase());
          break;
        case "goal:signals":
          if (!/^G-1\.S\d+$/.test(rawId)) report("error", "ID", file, at, rawId, "a success-signal ID must be G-1.S<n>");
          else define(rawId, file, at);
          break;
        case "goal:nongoals":
          if (!/^G-1\.N\d+$/.test(rawId)) report("error", "ID", file, at, rawId, "a non-goal ID must be G-1.N<n>");
          else define(rawId, file, at);
          break;
        case "roadmap:roadmap": {
          const feature = bare(col(table, row, "feature"));
          const stage = bare(col(table, row, "status")).toLowerCase();
          const serves = col(table, row, "serves");
          roadmapRows.push({ feature, stage, file, line: at });
          if (!STAGES.includes(stage)) report("error", "ROAD", file, at, feature, `status "${stage}" is not one of ${STAGES.join(", ")} (P-ROAD-1)`);
          const servesIds = ids(serves);
          if (!servesIds.length) report("error", "ROAD", file, at, feature, "Serves names no part of G-1");
          for (const id of servesIds) refs.push({ id, file, line: at, from: "Serves" });
          break;
        }
        case "roadmap:stages": {
          const listed = table.rows.map((r) => bare(r.cells[0]).toLowerCase());
          if (listed.join("|") !== STAGES.join("|"))
            report("error", "COPY", file, table.line, "", `stage list must be exactly ${STAGES.join(", ")} (copy of P-ROAD-1)`);
          table.rows.length = 0;
          break;
        }
        case "roadmap-details:positions":
        case "status:positions":
          positions.push({ feature: bare(col(table, row, "feature")), branch: bare(col(table, row, "branch")), file, line: at });
          break;
        case "stack:stack":
          for (const id of ids(row.cells[0])) stackIds.push({ id, file, line: at });
          break;
        case "story:stories":
        case "story:acs":
          conceptRow(story, kind, table, row, rawId, file, at);
          break;
        case "story:slices": {
          const delivers = ids(col(table, row, "delivers"));
          for (const id of delivers) refs.push({ id, file, line: at, from: "Delivers" });
          slices.push({ acs: delivers, issues: [...col(table, row, "issue").matchAll(/#(\d+)/g)].map((m) => m[1]) });
          break;
        }
        default:
          if (d.doc === "concept") conceptRow(concepts.at(-1), kind, table, row, rawId, file, at);
      }
      if (kind === "stages") break;
    }
  }
}

function conceptRow(concept, kind, table, row, id, file, at) {
  if (!kind || kind === "users" || kind === "signals" || kind === "nongoals" || kind === "roadmap" || kind === "stages" || kind === "stack") return;
  if (kind === "untested") {
    for (const ref of ids(row.cells[0])) {
      concept.untested.add(ref);
      refs.push({ id: ref, file, line: at, from: "Untested" });
    }
    return;
  }
  const expectKind = { stories: ["US"], requirements: ["F", "U", "NF", "C", "E"], tests: ["T"] }[kind];
  if (kind === "acs") {
    const m = id.match(AC_ID);
    if (!m || m[1] !== concept.prefix) return report("error", "ID", file, at, id, `an acceptance criterion ID must be ${concept.prefix}-AC-<story>.<n>`);
    define(id, file, at);
    concept.acs.push({ id, story: `${m[1]}-US-${m[2]}`, file, line: at });
    return;
  }
  const m = id.match(CONCEPT_ID);
  if (!m || m[1] !== concept.prefix || !expectKind.includes(m[2]))
    return report("error", "ID", file, at, id, `expected ${expectKind.map((k) => `${concept.prefix}-${k}-<n>`).join(" or ")}`);
  define(id, file, at);
  if (kind === "stories") {
    concept.stories.push({ id, asA: bare(col(table, row, "as a")).toLowerCase(), file, line: at });
  } else if (kind === "requirements") {
    const parents = ids(col(table, row, "derives from"));
    if (!parents.length) report("error", "ORPHAN", file, at, id, "Derives from names no parent");
    for (const p of parents) refs.push({ id: p, file, line: at, from: "Derives from" });
    concept.reqs.push({ id, kind: m[2], parents, file, line: at });
  } else if (kind === "tests") {
    concept.hasTests = true;
    const covers = ids(col(table, row, "covers"));
    if (!covers.length) report("error", "ORPHAN", file, at, id, "Covers names nothing");
    for (const c of covers) refs.push({ id: c, file, line: at, from: "Covers" });
    concept.tests.push({ id, covers, file, line: at });
  }
}

// ---------- work-item tree (P-DOC-6) ----------

// Stories and acceptance criteria live in documentation/work-items/<feature>/; they join the concept
// with the same id-prefix, so the derivation checks below see one feature, wherever its rows stand.
for (const f of features) {
  const concept = concepts.find((c) => c.prefix === f.prefix);
  if (!concept) report("error", "WI", f.file, 1, f.prefix, "no concept document has this id-prefix");
  else if (posix.basename(concept.file) !== f.concept) report("error", "WI", f.file, 1, f.concept, `concept names ${f.concept}, but the ${f.prefix} concept is ${concept.file}`);
}
for (const s of storyFiles) {
  const concept = concepts.find((c) => c.prefix === s.prefix);
  const feature = features.find((f) => f.dir === s.dir);
  if (!concept) report("error", "WI", s.file, 1, s.prefix, "no concept document has this id-prefix");
  if (!feature) report("error", "WI", s.file, 1, "", "no feature.md in this folder");
  else {
    if (feature.prefix !== s.prefix) report("error", "WI", s.file, 1, s.prefix, `id-prefix differs from feature.md (${feature.prefix})`);
    if (!feature.links.includes(s.file)) report("error", "WI", feature.file, 1, s.stories[0]?.id ?? s.file, "feature.md does not list this story file");
  }
  if (s.stories.length !== 1) report("error", "WI", s.file, 1, "", `a story file holds exactly one user story, found ${s.stories.length}`);
  for (const a of s.acs) {
    if (s.stories.length === 1 && a.story !== s.stories[0].id) report("error", "WI", a.file, a.line, a.id, `belongs to ${a.story}, not to this file's ${s.stories[0].id}`);
  }
  if (concept && !concept.legacy) {
    concept.stories.push(...s.stories);
    concept.acs.push(...s.acs);
  }
}
for (const c of concepts) {
  if (c.legacy) continue;
  const inConcept = c.stories.filter((s) => s.file === c.file);
  if (inConcept.length) report("warning", "WI", c.file, inConcept[0].line, inConcept[0].id, "stories belong in documentation/work-items/ (P-DOC-6); move them on the next change (P-DOC-5)");
}

// ---------- checks ----------

for (const ref of refs) {
  if (!defined.has(ref.id)) report("error", "REF", ref.file, ref.line, ref.id, `${ref.from} names an ID that does not exist`);
}

const stageOf = (title) => roadmapRows.find((r) => r.feature.toLowerCase() === (title || "").toLowerCase())?.stage;

for (const c of concepts) {
  const stage = stageOf(c.title);
  if (stage === undefined) report("error", "ORPHAN", c.file, 1, c.title, "title matches no Feature in ROADMAP.md");
  if (c.legacy) continue;
  const late = stage !== undefined && !EARLY_STAGES.includes(stage);
  const lateSeverity = late ? "error" : "warning";

  for (const s of c.stories) {
    if (!c.acs.some((a) => a.story === s.id)) report("error", "COVER", s.file, s.line, s.id, "story has no acceptance criterion");
    if (roles.length && !roles.some((r) => r && (s.asA.includes(r) || r.includes(s.asA))))
      report("warning", "ROLE", s.file, s.line, s.id, `"As a ${s.asA}" names no target-user role of GOAL.md`);
  }
  for (const a of c.acs) {
    if (!c.stories.some((s) => s.id === a.story)) report("error", "ORPHAN", a.file, a.line, a.id, `its story ${a.story} does not exist`);
    if (!c.reqs.some((r) => r.parents.includes(a.id))) report("error", "COVER", a.file, a.line, a.id, "no requirement derives from this acceptance criterion");
    if (c.hasTests && !c.tests.some((t) => t.covers.includes(a.id)))
      report(lateSeverity, "COVER", a.file, a.line, a.id, "no test covers this acceptance criterion");
  }
  if (!c.hasTests && c.acs.length) report(lateSeverity, "COVER", c.file, 1, "", "§17 has no test table yet");
  for (const r of c.reqs) {
    if (r.kind === "C") {
      if (!stackIds.some((s) => s.id === r.id)) report(lateSeverity, "STACK", r.file, r.line, r.id, "capability has no mapping in STACK.md §2");
      continue;
    }
    if (c.hasTests && !c.tests.some((t) => t.covers.includes(r.id)) && !c.untested.has(r.id))
      report("warning", "UNTESTED", r.file, r.line, r.id, "no test covers this requirement and no untested justification names it");
  }
}

for (const s of stackIds) {
  if (!defined.has(s.id)) report("warning", "STACK", s.file, s.line, s.id, "mapping without a capability requirement (dead weight)");
}
if (!goalFound) report("error", "FM", root, 0, "", "no document with doc: goal (GOAL.md) found");
checkAcceptanceTests();
if (statusMode) checkStatus();

// ---------- acceptance criteria against the test names in code (AC-TEST) ----------

// Definition of Done item 1: every acceptance criterion is demonstrated by a test whose name carries
// its AC ID. Test files are *.test.* and *.spec.* scripts under tests/, apps/, and packages/ of the
// folder that holds the documentation folder; a test name is the first string argument of
// describe, it, test, suite, or test.describe (also with .only). Skipped and todo tests and
// comments do not count. Severity: error once the feature is in dev or released, or when the
// merge request (--pending-branch feature/<issue>-…) is the issue of a slice that delivers the
// criterion; warning while the feature is in progress; nothing before. An untested justification
// in the concept (§17, ID | Reason) lowers the error to a warning.
function checkAcceptanceTests() {
  const pendingIssue = pendingBranch.match(/^(?:feature|fix)\/(\d+)-/)?.[1];
  const delivered = new Set(slices.filter((s) => pendingIssue && s.issues.includes(pendingIssue)).flatMap((s) => s.acs));
  let tested = null;
  for (const c of concepts) {
    if (c.legacy) continue;
    const stage = stageOf(c.title);
    const done = DONE_STAGES.includes(stage);
    for (const a of c.acs) {
      const due = done || delivered.has(a.id);
      if (!due && stage !== "in progress") continue;
      tested ??= testedCriteria(dirname(resolve(root)));
      if (tested.has(a.id)) continue;
      const why = done ? `the feature is ${stage}` : delivered.has(a.id) ? `this merge request (#${pendingIssue}) delivers it` : "";
      const justified = due && c.untested.has(a.id);
      const note = justified ? `; ${why}, but an untested justification names it` : why ? `, and ${why}` : "";
      report(due && !justified ? "error" : "warning", "AC-TEST", a.file, a.line, a.id, `no test name in tests/, apps/, or packages/ carries this ID${note}`);
    }
  }
}

function testedCriteria(codeRoot) {
  const tested = new Set();
  const walk = (dir) => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!entry.name.startsWith(".") && !SKIPPED_DIRS.has(entry.name)) walk(join(dir, entry.name));
      } else if (entry.isFile() && TEST_FILE.test(entry.name)) {
        for (const call of withoutComments(readFileSync(join(dir, entry.name), "utf8")).matchAll(TEST_CALL))
          for (const id of call[2].match(AC_IN_NAME) ?? []) tested.add(id);
      }
    }
  };
  for (const top of ["tests", "apps", "packages"]) walk(join(codeRoot, top));
  return tested;
}

// Removes // and /* */ comments; strings, template literals, and regular-expression literals stay
// as they are, so a "//" inside them is not taken for a comment.
function withoutComments(source) {
  let out = "";
  let i = 0;
  let last = ""; // last significant character outside strings and comments
  while (i < source.length) {
    const c = source[i];
    const next = source[i + 1];
    if (c === "/" && next === "/") {
      while (i < source.length && source[i] !== "\n") i++;
    } else if (c === "/" && next === "*") {
      const end = source.indexOf("*/", i + 2);
      i = end < 0 ? source.length : end + 2;
    } else if (c === '"' || c === "'" || c === "`" || (c === "/" && (last === "" || "(,=:[!&|?{};+-*%<>~^".includes(last)))) {
      let j = i + 1;
      let inClass = false;
      while (j < source.length) {
        const d = source[j];
        if (d === "\\") j++;
        else if (c === "/" && d === "[") inClass = true;
        else if (c === "/" && d === "]") inClass = false;
        else if (d === c && !inClass) break;
        else if (c !== "`" && d === "\n") break;
        j++;
      }
      out += source.slice(i, j + 1);
      i = j + 1;
      last = c;
    } else {
      out += c;
      if (!/\s/.test(c)) last = c;
      i++;
    }
  }
  return out;
}

// ---------- status against git (--status) ----------

// Mechanical part of consistency-check step 5. A story counts as merged when a merge commit on HEAD
// names its ID (the MR title carries it, P-MR-1, and both hosts put the title into the merge commit),
// and as released when a v* tag contains that merge. In an MR pipeline, --pending-title and
// --pending-branch count as merged, because the MR carries the status for the state after the merge
// (P-ROAD-4). Whether issues are closed needs the host API and stays with the agent's check.
function checkStatus() {
  const rootFile = relative(process.cwd(), root).replace(/\\/g, "/") || ".";
  const git = (...a) => execFileSync("git", a, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 1 << 28 });
  let shallow;
  try {
    shallow = git("rev-parse", "--is-shallow-repository").trim() === "true";
  } catch {
    return report("error", "STATUS", rootFile, 0, "", "--status needs git and a checkout with history");
  }
  if (shallow) return report("error", "STATUS", rootFile, 0, "", "the clone is shallow; fetch the full history (GitLab: GIT_DEPTH: 0, GitHub: fetch-depth: 0)");

  const merges = git("log", "--merges", "--format=%H%n%B%x1e", "HEAD")
    .split("\x1e")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [sha, ...body] = entry.split(/\r?\n/);
      return { sha, body: body.join("\n") };
    });
  if (pendingTitle) merges.push({ sha: null, body: pendingTitle });

  const mergedBranches = new Set(pendingBranch ? [pendingBranch] : []);
  for (const m of merges) {
    const subject = m.body.split("\n")[0];
    const branch = subject.match(/^Merge branch '([^']+)'/)?.[1] ?? subject.match(/^Merge pull request #\d+ from [^/\s]+\/(\S+)/)?.[1];
    if (branch && branch !== "dev" && branch !== "main") mergedBranches.add(branch);
  }

  const tagged = new Map();
  const inTag = (sha) => {
    if (!sha) return false;
    if (!tagged.has(sha)) tagged.set(sha, git("tag", "--list", "v*", "--contains", sha).trim() !== "");
    return tagged.get(sha);
  };

  for (const c of concepts) {
    if (c.legacy || !c.stories.length) continue;
    const row = roadmapRows.find((r) => r.feature.toLowerCase() === (c.title || "").toLowerCase());
    if (!row || !STAGES.includes(row.stage)) continue;
    const evidence = c.stories.map((s) => {
      const named = new RegExp(`(?<![\\w-])${s.id}(?!\\w)`);
      return merges.filter((m) => named.test(m.body));
    });
    const total = c.stories.length;
    const merged = evidence.filter((e) => e.length).length;
    const released = evidence.filter((e) => e.some((m) => inTag(m.sha))).length;
    let allowed;
    if (released === total) allowed = ["released"];
    else if (merged === total) allowed = ["in dev"];
    else if (merged > 0) allowed = ["in progress"];
    else allowed = ["concept", "ready", "in progress"];
    if (!allowed.includes(row.stage))
      report("error", "STATUS", row.file, row.line, row.feature,
        `stage "${row.stage}", but git shows ${merged} of ${total} stories merged and ${released} in a release tag; expected ${allowed.join(" or ")}`);
  }

  for (const p of positions) {
    if (mergedBranches.has(p.branch))
      report("error", "STATUS", p.file, p.line, p.feature, `position row still names branch ${p.branch}, which is already merged`);
  }
}

// ---------- output ----------

const errors = findings.filter((f) => f.severity === "error").length;
const warnings = findings.length - errors;
findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);

if (asJson) {
  console.log(JSON.stringify({ ok: errors === 0, errors, warnings, findings }, null, 2));
} else {
  for (const f of findings) {
    const where = f.line ? `${f.file}:${f.line}` : f.file;
    console.log(`${f.severity.toUpperCase().padEnd(7)} ${f.code.padEnd(8)} ${where}  ${f.id ? `${f.id} — ` : ""}${f.message}`);
  }
  console.log(`\ndoc-check: ${errors} error(s), ${warnings} warning(s) in ${root}`);
}
process.exit(errors ? 1 : 0);
