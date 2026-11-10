#!/usr/bin/env node
// Rebuild helper (module M1 of the concept rebuild-from-documentation, §16): the mechanical rules of the
// completeness check behind a CLI. No dependencies; `check` takes a snapshot of the documents and returns
// findings, the CLI reads the snapshot through git and prints them as JSON.
//
// This file holds the rules built so far: legacy concepts, unfinished work, synthesis cycles, done stories
// without slices, blocked slices, stack names, requirements without module (RB-F-15 ... RB-F-18, RB-F-43), contract
// rows without an example, a persisted layout without a golden dump (RB-F-19, RB-F-20), files that have no place in
// STACK.md §4 or lie in a module no §16 names (RB-F-22), and stack files without a Stack files row (RB-F-44).
// Rules that need reading prose, migration files, or code are judged by the agent (rebuild-check.md). `plan` reads the
// state of a rebuild from its branch (RB-F-41): the recorded head, the next step, the deletion set, and the slices in
// build order (RB-F-2, RB-F-3, RB-F-5, RB-F-7). `verdict` gives the outcome of a drill (RB-F-39).
//
// Usage: node rebuild.mjs check                        (from the project folder; prints findings as JSON)
//        node rebuild.mjs plan --integration <branch>  (prints the plan of the commits of <branch>..HEAD as JSON)
//        node rebuild.mjs verdict <file>               (prints the verdict of the DrillRun JSON in <file>)
// Exit codes: 0 no blocking finding, 1 a blocking finding, 2 usage error or not a git repository.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const KNOWLEDGE = "gam-ai-knowledge";
const NEED_GIT = "the rebuild commands need git";
const ID = "[A-Z][A-Z0-9]*";
const STORY_ID = new RegExp(`^${ID}-US-\\d+`);
const SLICE_ID = /^S\d+\.\d+/;

const finding = (document, line, text, blocking = true) => ({ document, line, finding: text, blocking });

// ---------------------------------------------------------------- parsing

const splitLines = (text) => text.split(/\r?\n/);

function frontmatter(text) {
  const lines = splitLines(text);
  const values = {};
  if (lines[0]?.trim() !== "---") return values;
  for (const line of lines.slice(1)) {
    if (line.trim() === "---") break;
    const match = /^([A-Za-z_-]+):\s*(.*)$/.exec(line);
    if (match) values[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
  }
  return values;
}

const cellsOf = (line) =>
  line.trim().replace(/^\|/, "").replace(/\|$/, "").split(/(?<!\\)\|/).map((cell) => cell.trim());
const isSeparator = (line) => /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?$/.test(line.trim());

// Every table of a document with its header, its rows (1-based line numbers), and the headings above it.
function parseTables(lines) {
  const tables = [];
  let h2 = null;
  let h3 = "";
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const heading2 = /^##\s+(\d+)\./.exec(line);
    if (heading2) { h2 = Number(heading2[1]); h3 = ""; continue; }
    if (/^##\s/.test(line)) { h2 = null; h3 = ""; continue; }
    const heading3 = /^###\s+(.*)$/.exec(line);
    if (heading3) { h3 = heading3[1].trim(); continue; }
    if (!line.trim().startsWith("|") || !isSeparator(lines[index + 1] ?? "")) continue;
    const table = { header: cellsOf(line), rows: [], h2, h3, startLine: index + 1 };
    let next = index + 2;
    while (next < lines.length && lines[next].trim().startsWith("|")) {
      table.rows.push({ line: next + 1, cells: cellsOf(lines[next]) });
      next++;
    }
    tables.push(table);
    index = next - 1;
  }
  return tables;
}

// The text lines below a `###` heading in a `## <number>.` chapter, up to the next heading.
function sectionLines(lines, chapter, title) {
  const result = [];
  let h2 = null;
  let inside = false;
  for (const line of lines) {
    const heading2 = /^##\s+(\d+)\./.exec(line);
    if (heading2) { h2 = Number(heading2[1]); inside = false; continue; }
    if (/^##\s/.test(line)) { h2 = null; inside = false; continue; }
    const heading3 = /^###\s+(.*)$/.exec(line);
    if (heading3) { inside = h2 === chapter && heading3[1].trim() === title; continue; }
    if (/^#\s/.test(line)) { h2 = null; inside = false; continue; }
    if (inside) result.push(line);
  }
  return result;
}

// Ids in a "Traces to" line; `A-F-1 … A-F-3` stands for the ids between.
function idsOf(text) {
  const ids = [];
  const pattern = new RegExp(`${ID}-[A-Z]+-\\d+|…`, "g");
  let range = false;
  for (const [token] of text.matchAll(pattern)) {
    if (token === "…") { range = true; continue; }
    if (range && ids.length > 0) {
      const from = /^(.*-)(\d+)$/.exec(ids[ids.length - 1]);
      const to = /^(.*-)(\d+)$/.exec(token);
      if (from && to && from[1] === to[1]) {
        for (let n = Number(from[2]) + 1; n < Number(to[2]); n++) ids.push(`${from[1]}${n}`);
      }
    }
    range = false;
    ids.push(token);
  }
  return ids;
}

function readConcept(path, text) {
  const lines = splitLines(text);
  const tables = parseTables(lines);
  const front = frontmatter(text);
  const requirements = [];
  for (const table of tables) {
    if (table.h2 !== 4 && table.h2 !== 5) continue;
    for (const row of table.rows) {
      if (new RegExp(`^${ID}-(F|U)-\\d+$`).test(row.cells[0] ?? "")) {
        requirements.push({ id: row.cells[0], title: row.cells[1] ?? "", line: row.line });
      }
    }
  }
  const traced = new Set();
  let inChapter16 = false;
  for (const line of lines) {
    const heading2 = /^##\s+(\d+)\./.exec(line);
    if (heading2) inChapter16 = Number(heading2[1]) === 16;
    const traces = /^Traces to:\s*(.*?)(?:\s+Requires:.*)?$/.exec(line.trim());
    if (inChapter16 && traces) idsOf(traces[1]).forEach((id) => traced.add(id));
  }
  const slices = [];
  for (const table of tables) {
    const sliceColumn = table.header.indexOf("Slice");
    const storyColumn = table.header.indexOf("Story");
    const blockedColumn = table.header.indexOf("Blocked by");
    if (table.h2 !== 16 || sliceColumn < 0 || storyColumn < 0 || blockedColumn < 0) continue;
    for (const row of table.rows) {
      const id = SLICE_ID.exec(row.cells[sliceColumn] ?? "")?.[0];
      if (!id) continue;
      slices.push({
        id,
        line: row.line,
        stories: [...(row.cells[storyColumn] ?? "").matchAll(new RegExp(`${ID}-US-\\d+`, "g"))].map((m) => m[0]),
        blockedBy: [...(row.cells[blockedColumn] ?? "").matchAll(/S\d+\.\d+/g)].map((m) => m[0]),
      });
    }
  }
  const dependencies = [];
  for (const line of sectionLines(lines, 0, "Synthesis Dependencies")) {
    for (const match of line.matchAll(/([A-Za-z0-9._-]+)\.md\b/g)) dependencies.push(match[1]);
  }
  const contracts = [];
  let layout = null;
  for (const table of tables) {
    if (table.h2 === 11 && table.h3 === "External contracts" && table.header.includes("Contract")) {
      const exampleColumn = table.header.indexOf("Example");
      for (const row of table.rows) {
        const example = /`([^`]+)`/.exec(row.cells[exampleColumn] ?? "")?.[1] ?? null;
        contracts.push({ name: row.cells[0], line: row.line, example });
      }
    }
    if (table.h2 === 8 && table.h3 === "Persisted layout" && table.header.includes("Stored as") && table.rows.length > 0) {
      layout = { line: table.startLine };
    }
  }
  // The modules a concept's §16 names: the `####` headings of its module specifications (whole, and the first word)
  // and the cells of the slice table's Modules column.
  const modules = new Set();
  let inChapter = false;
  for (const line of lines) {
    const heading2 = /^##\s+(\d+)\./.exec(line);
    if (heading2) inChapter = Number(heading2[1]) === 16;
    const heading4 = /^####\s+(.*?)\s*$/.exec(line);
    if (inChapter && heading4) { modules.add(heading4[1]); modules.add(heading4[1].split(/\s+/)[0]); }
  }
  for (const table of tables) {
    const column = table.header.indexOf("Modules");
    if (table.h2 !== 16 || column < 0) continue;
    for (const row of table.rows) for (const name of (row.cells[column] ?? "").split(/[,;]/)) if (name.trim()) modules.add(name.trim());
  }
  return {
    path,
    stem: path.replace(/^concepts\//, "").replace(/\.md$/, ""),
    lines,
    tables,
    legacy: front.format === "legacy",
    requirements,
    traced,
    slices,
    dependencies,
    contracts,
    layout,
    modules,
  };
}

function readModel(documents) {
  const concepts = new Map();
  const stories = [];
  const folders = new Map();
  for (const [path, text] of Object.entries(documents)) {
    if (/^concepts\/[^/]+\.md$/.test(path) && !path.endsWith(".qa-log.md")) {
      concepts.set(path, readConcept(path, text));
      continue;
    }
    const inFolder = /^work-items\/([^/]+)\/([^/]+\.md)$/.exec(path);
    if (!inFolder) continue;
    const [, folder, file] = inFolder;
    const entry = folders.get(folder) ?? { epic: false, feature: false };
    if (file === "epic.md") entry.epic = true;
    if (file === "feature.md") entry.feature = true;
    folders.set(folder, entry);
    const front = frontmatter(text);
    if (front.doc === "story") {
      const id = STORY_ID.exec(front.title ?? "")?.[0] ?? STORY_ID.exec(file)?.[0] ?? file.replace(/\.md$/, "");
      stories.push({ path, folder, slug: folder.replace(/^E\d+-/, ""), id, status: front.status ?? "" });
    }
  }
  return { concepts, stories, folders };
}

// ---------------------------------------------------------------- rules

function legacyFindings(model) {
  return [...model.concepts.values()]
    .filter((concept) => concept.legacy)
    .map((concept) => finding(concept.path, null, `legacy concept; migrate it with /gam-engineering migrate ${concept.stem}`));
}

function unfinishedFindings(model) {
  const result = [];
  for (const story of model.stories) {
    if (story.status === "in-progress" || story.status === "review") {
      const state = story.status === "review" ? "in review" : "in progress";
      result.push(finding(story.path, null, `${story.id} is ${state}; finish it before a rebuild`));
    }
  }
  for (const [folder, entry] of model.folders) {
    if (entry.feature && !entry.epic) {
      result.push(finding(`work-items/${folder}/feature.md`, null, "work-item folder in the old layout; migrate it with /gam-engineering migrate"));
    }
  }
  return result;
}

// The concepts the check reads: every concept with at least one done story (RB-F-15), legacy ones excluded.
function checkedConcepts(model) {
  const done = new Set(model.stories.filter((story) => story.status === "done").map((story) => story.slug));
  return [...model.concepts.values()].filter((concept) => done.has(concept.stem) && !concept.legacy);
}

function cycleFindings(model, roadmapOrder) {
  const checked = new Map(checkedConcepts(model).map((concept) => [concept.stem, concept]));
  const rank = (stem) => {
    const index = roadmapOrder.indexOf(`${stem}.md`);
    return index < 0 ? Number.MAX_SAFE_INTEGER : index;
  };
  const stems = [...checked.keys()].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
  const found = new Map();
  const done = new Set();
  const walk = (stem, path) => {
    path.push(stem);
    for (const next of checked.get(stem).dependencies) {
      if (!checked.has(next)) continue;
      const at = path.indexOf(next);
      if (at >= 0) {
        const cycle = path.slice(at);
        const key = [...cycle].sort().join(",");
        if (!found.has(key)) found.set(key, cycle);
      } else if (!done.has(next)) {
        walk(next, path);
      }
    }
    path.pop();
    done.add(stem);
  };
  for (const stem of stems) if (!done.has(stem)) walk(stem, []);
  return [...found.values()].map((cycle) =>
    finding(`concepts/${cycle[0]}.md`, null, `the synthesis dependencies form a cycle ${[...cycle, cycle[0]].join(" → ")}; break it in §0`));
}

function sliceFindings(model) {
  const result = [];
  const statusOf = (folder, id) => model.stories.find((story) => story.folder === folder && story.id === id)?.status;
  for (const story of model.stories.filter((entry) => entry.status === "done")) {
    const concept = model.concepts.get(`concepts/${story.slug}.md`);
    if (!concept) {
      result.push(finding(story.path, null, `${story.id} is done but concepts/${story.slug}.md does not exist; write the concept it belongs to`));
    } else if (!concept.legacy && !concept.slices.some((slice) => slice.stories.includes(story.id))) {
      result.push(finding(concept.path, null, `${story.id} is done but §16 lists no slice for it; add its slices to §16`));
    }
  }
  for (const story of model.stories.filter((entry) => entry.status === "done")) {
    const concept = model.concepts.get(`concepts/${story.slug}.md`);
    if (!concept || concept.legacy) continue;
    for (const slice of concept.slices.filter((entry) => entry.stories.includes(story.id))) {
      for (const blocker of slice.blockedBy) {
        const blocking = concept.slices.find((entry) => entry.id === blocker);
        for (const owner of blocking?.stories ?? []) {
          if (statusOf(story.folder, owner) === "done") continue;
          result.push(finding(concept.path, slice.line,
            `${slice.id} of the done story ${story.id} is blocked by ${blocker} of ${owner}, which is not done; finish ${owner} or remove the dependency in §16`));
        }
      }
    }
  }
  return result;
}

// The names of the Names column of STACK.md §2: technology the concepts must not mention.
function stackNames(documents) {
  const lines = splitLines(documents["STACK.md"] ?? "");
  const names = [];
  for (const table of parseTables(lines)) {
    const column = table.header.indexOf("Names");
    if (table.h2 !== 2 || column < 0) continue;
    for (const row of table.rows) {
      for (const [, name] of (row.cells[column] ?? "").matchAll(/`([^`]+)`/g)) if (!names.includes(name)) names.push(name);
    }
  }
  return names;
}

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function nameFindings(concept, names) {
  const result = [];
  const start = Math.max(0, concept.lines.findIndex((line) => /^#\s+Part S\b/.test(line)));
  // Rows that are searched whole, searched without one cell, or skipped (RB-F-16).
  const rows = new Map();
  for (const table of concept.tables) {
    const encoding = table.h2 === 8 ? table.header.indexOf("Encoding") : -1;
    for (const row of table.rows) {
      if (table.h2 === 11 && table.h3 === "External contracts") rows.set(row.line, null);
      else if (encoding >= 0) rows.set(row.line, row.cells.filter((_, index) => index !== encoding).join(" | "));
    }
  }
  for (let index = start; index < concept.lines.length; index++) {
    const text = rows.has(index + 1) ? rows.get(index + 1) : concept.lines[index];
    if (text === null) continue;
    for (const name of names) {
      if (new RegExp(`(?<![A-Za-z0-9_])${escapeRegExp(name)}(?![A-Za-z0-9_])`).test(text)) {
        result.push(finding(concept.path, index + 1, `"${name}" is named in STACK.md; declare a capability in §7 instead`));
      }
    }
  }
  return result;
}

function traceFindings(concept) {
  return concept.requirements
    .filter((requirement) => !concept.traced.has(requirement.id))
    .map((requirement) => finding(concept.path, requirement.line,
      `${requirement.id} (${requirement.title}) has no module in §16; add it to the Traces to of the module that implements it`));
}

function contractFindings(concept, trackedPaths) {
  const result = [];
  const tracked = new Set(trackedPaths);
  for (const contract of concept.contracts) {
    if (contract.example && tracked.has(`${KNOWLEDGE}/${contract.example}`)) continue;
    const example = contract.example ?? `under test-data/${concept.stem}/`;
    result.push(finding(concept.path, contract.line, `contract "${contract.name}" has no example ${example}; write it in the format of §8`));
  }
  return result;
}

// A golden dump is a tracked .json file directly in test-data/<concept>/ that no contract row names as its Example.
function layoutFindings(concept, trackedPaths) {
  if (!concept.layout) return [];
  const folder = `${KNOWLEDGE}/test-data/${concept.stem}/`;
  const examples = new Set(concept.contracts.map((contract) => `${KNOWLEDGE}/${contract.example}`));
  const hasDump = trackedPaths.some((path) => path.startsWith(folder) && path.endsWith(".json") && !path.slice(folder.length).includes("/") && !examples.has(path));
  return hasDump ? [] : [finding(concept.path, concept.layout.line, `the persisted layout has no golden dump in test-data/${concept.stem}/; add one`)];
}

// ---------------------------------------------------------------- paths of STACK.md §4

// A git pathspec glob as a regular expression: `**` crosses folders, `*` and `?` stay in one, `<module>` is one name
// (the first one is the capture group `module`).
function globToRegExp(pattern) {
  let source = "";
  let named = false;
  for (let index = 0; index < pattern.length; index++) {
    if (pattern.startsWith("**/", index)) { source += "(?:.*/)?"; index += 2; }
    else if (pattern.startsWith("**", index)) { source += ".*"; index += 1; }
    else if (pattern[index] === "*") source += "[^/]*";
    else if (pattern[index] === "?") source += "[^/]";
    else if (pattern.startsWith("<module>", index)) { source += named ? "[^/]+" : "(?<module>[^/]+)"; named = true; index += 7; }
    else source += escapeRegExp(pattern[index]);
  }
  return new RegExp(`^${source}$`);
}

// The fixed keep list of RB-F-1; the patterns of STACK.md §4 and §11 and the submodules are added by `readStack`.
const KEEP_PATTERNS = [
  "gam-ai-knowledge/**", "gam-engineering/**", "gam-ai-memory/**", ".claude/**", ".git*", ".git*/**", "CLAUDE.md",
  "CONTEXT-MAP.md", "README.md", "LICENSE*", ".markdownlint.jsonc", ".deployignore", ".npmignore", ".dockerignore", "MANIFEST.in",
];

// The lock files each package manager writes (RB-F-22); a lock file is no file without a place, at any depth.
const LOCK_FILES = {
  npm: ["package-lock.json", "npm-shrinkwrap.json"], yarn: ["yarn.lock"], pnpm: ["pnpm-lock.yaml"], bun: ["bun.lock", "bun.lockb"],
  composer: ["composer.lock"], poetry: ["poetry.lock"], uv: ["uv.lock"], pipenv: ["Pipfile.lock"], cargo: ["Cargo.lock"],
  go: ["go.sum"], bundler: ["Gemfile.lock"], nuget: ["packages.lock.json"],
};

// The path patterns, the migration files, the lock files, and the Stack files rows of STACK.md.
function readStack(documents) {
  const stack = { patterns: { keep: [...KEEP_PATTERNS], module: [], test: [], stack: [] }, stackFiles: new Set(), lockFiles: new Set() };
  for (const table of parseTables(splitLines(documents["STACK.md"] ?? ""))) {
    if (table.h2 === 1 && table.header.includes("Package manager")) {
      for (const row of table.rows) {
        for (const word of (row.cells[table.header.indexOf("Package manager")] ?? "").toLowerCase().split(/[^a-z0-9]+/)) {
          for (const file of LOCK_FILES[word] ?? []) stack.lockFiles.add(file);
        }
      }
    }
    const ticks = (cell) => [...(cell ?? "").matchAll(/`([^`]+)`/g)].map((match) => match[1]);
    if (table.h2 === 4 && table.header.includes("Kind") && table.header.includes("Pattern")) {
      for (const row of table.rows) {
        const kind = row.cells[table.header.indexOf("Kind")];
        if (Object.hasOwn(stack.patterns, kind)) stack.patterns[kind].push(...ticks(row.cells[table.header.indexOf("Pattern")]));
      }
    }
    if (table.h2 === 4 && table.header[0] === "Path" && table.header.includes("Content")) {
      for (const row of table.rows) for (const path of ticks(row.cells[0])) stack.stackFiles.add(path);
    }
    if (table.h2 === 11 && table.header.includes("Migration files")) {
      for (const row of table.rows) stack.patterns.keep.push(...ticks(row.cells[table.header.indexOf("Migration files")]));
    }
  }
  return stack;
}

// The class of a path, in the order of RB-F-1 and RB-F-2: keep, module (with the module the pattern matched), test, stack;
// `unplaced` otherwise.
function classOf(path, stack, submodules) {
  if (submodules.some((folder) => path === folder || path.startsWith(`${folder}/`))) return { kind: "keep" };
  for (const kind of ["keep", "module", "test", "stack"]) {
    for (const pattern of stack.patterns[kind]) {
      const match = globToRegExp(pattern).exec(path);
      if (match) return { kind, module: match.groups?.module };
    }
  }
  return { kind: "unplaced" };
}

const isLockFile = (path, stack) => stack.lockFiles.has(path.slice(path.lastIndexOf("/") + 1));

// Files of the code tree with no place (RB-F-22): under no pattern, or under a module pattern with a module no §16 names.
function placementFindings(stack, checked, trackedPaths, submodules) {
  const modules = new Set(checked.flatMap((concept) => [...concept.modules]));
  const result = [];
  for (const path of trackedPaths) {
    const { kind, module } = classOf(path, stack, submodules);
    if (kind === "unplaced" && !isLockFile(path, stack)) {
      result.push(finding(path, null, "matches no module, test-file, or stack-file pattern; describe it in the §16 of the concept whose behaviour it implements and add a module, test-file, or stack-file pattern to STACK.md §4"));
    } else if (kind === "module" && module && !modules.has(module)) {
      result.push(finding(path, null, `module ${module} is named by no concept's §16; describe it in the §16 of the concept whose behaviour it implements`));
    }
  }
  return result;
}

function stackFileFindings(stack, trackedPaths, submodules) {
  return trackedPaths
    .filter((path) => classOf(path, stack, submodules).kind === "stack" && !stack.stackFiles.has(path))
    .map((path) => finding(path, null, "stack file without a row in the Stack files table; record its content in STACK.md §4"));
}

// ---------------------------------------------------------------- the rebuild plan

const SUBJECT = {
  tests: "Add the contract and data tests [no-req]",
  deletion: "Remove the code before the rebuild [no-req]",
  scaffold: "Set up the stack from STACK.md [no-req]",
};

// The slices of the stories with status done, concept by concept in build order (RB-F-5, RB-F-7): a concept follows
// every concept its §0 names, ties go in ROADMAP order, slices stay in the order of §16.
function plannedSlices(model, roadmapOrder) {
  const rank = (concept) => {
    const index = roadmapOrder.indexOf(`${concept.stem}.md`);
    return index < 0 ? Number.MAX_SAFE_INTEGER : index;
  };
  const pending = checkedConcepts(model).sort((a, b) => rank(a) - rank(b) || a.stem.localeCompare(b.stem));
  const ordered = [];
  while (pending.length > 0) {
    const ready = pending.findIndex((concept) =>
      concept.dependencies.every((name) => ordered.some((placed) => placed.stem === name) || !pending.some((other) => other.stem === name)));
    ordered.push(...pending.splice(Math.max(ready, 0), 1));
  }
  const isDone = (concept, id) => model.stories.some((entry) => entry.slug === concept.stem && entry.id === id && entry.status === "done");
  return ordered.flatMap((concept) =>
    concept.slices
      .filter((slice) => slice.stories.length > 0 && slice.stories.every((id) => isDone(concept, id)))
      .map((slice) => ({ concept: `${concept.stem}.md`, slice: slice.id, story: slice.stories[0], built: false })));
}

// A commit subject ending with a slice ID builds that slice; the requirement IDs it names pick the concept when several
// concepts have a slice of that ID (RB-F-8).
function markBuilt(slices, branch) {
  for (const { subject } of branch) {
    const id = /\((S\d+\.\d+)\)\s*$/.exec(subject)?.[1];
    if (!id) continue;
    const prefixes = [...subject.matchAll(new RegExp(`\\b(${ID})-[A-Z]+-\\d+\\b`, "g"))].map((match) => match[1]);
    for (const entry of slices) {
      if (entry.slice === id && (prefixes.length === 0 || prefixes.includes(entry.story.split("-US-")[0]))) entry.built = true;
    }
  }
}

// snapshot: as for `check`, with the tracked paths of the recorded head (of the head itself before the branch exists);
// branch: the commits of the rebuild branch, oldest first, each { id, parent, subject, addedPaths } (addedPaths for the first only).
export function plan(snapshot, branch) {
  const documents = snapshot.documents ?? {};
  const stack = readStack(documents);
  const submodules = snapshot.submodules ?? [];
  const added = new Set(branch[0]?.addedPaths ?? []);
  const deletion = (snapshot.trackedPaths ?? []).filter((path) => !added.has(path) && classOf(path, stack, submodules).kind !== "keep");
  const slices = plannedSlices(readModel(documents), snapshot.roadmapOrder ?? []);
  markBuilt(slices, branch);
  const subjects = branch.map((entry) => entry.subject.trim());
  let next;
  if (branch.length === 0) next = "start";
  else if (!subjects.includes(SUBJECT.deletion)) next = branch.length === 1 ? "cross-check" : "deletion";
  else if (!subjects.includes(SUBJECT.scaffold)) next = "scaffold";
  else next = slices.some((entry) => !entry.built) ? "slice" : "green";
  return { recordedHead: branch[0]?.parent ?? null, next, deletion, slices };
}

// snapshot: { trackedPaths, submodules, documents: { "<path relative to gam-ai-knowledge/>": text }, roadmapOrder: [concept file names] }
export function check(snapshot) {
  const documents = snapshot.documents ?? {};
  if (Object.keys(documents).length === 0) {
    return [finding(`${KNOWLEDGE}/`, null, `the project has no documents in ${KNOWLEDGE}/; run /gam-engineering setup or migrate`)];
  }
  const model = readModel(documents);
  const names = stackNames(documents);
  const checked = checkedConcepts(model);
  const trackedPaths = snapshot.trackedPaths ?? [];
  const submodules = snapshot.submodules ?? [];
  const stack = readStack(documents);
  return [
    ...legacyFindings(model),
    ...unfinishedFindings(model),
    ...cycleFindings(model, snapshot.roadmapOrder ?? []),
    ...sliceFindings(model),
    ...checked.flatMap((concept) => [
      ...nameFindings(concept, names),
      ...traceFindings(concept),
      ...contractFindings(concept, trackedPaths),
      ...layoutFindings(concept, trackedPaths),
    ]),
    ...placementFindings(stack, checked, trackedPaths, submodules),
    ...stackFileFindings(stack, trackedPaths, submodules),
  ];
}

// ---------------------------------------------------------------- snapshot and CLI

// The verdict of a drill (RB-F-39): `blocked` when a stop rule ended it, `rebuildable` only for no question, at least one
// test, and no failing test, `not rebuildable` otherwise. `run` is a DrillRun of the concept's §16 (M1).
export function verdict(run) {
  if (run.stop) return "blocked";
  const clean = (run.questions ?? []).length === 0 && (run.testsRun ?? 0) >= 1 && (run.failingTests ?? []).length === 0;
  return clean ? "rebuildable" : "not rebuildable";
}

function git(root, ...args) {
  return spawnSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

// The tracked Markdown documents of the knowledge folder, read from the working tree; ignored files are never read.
export function readSnapshot(root) {
  const tracked = git(root, "ls-files", "-z").stdout.split("\0").filter(Boolean);
  const documents = {};
  for (const path of tracked) {
    if (!path.startsWith(`${KNOWLEDGE}/`) || !path.endsWith(".md")) continue;
    const file = join(root, path);
    if (existsSync(file)) documents[path.slice(KNOWLEDGE.length + 1)] = readFileSync(file, "utf8");
  }
  const gitmodules = existsSync(join(root, ".gitmodules")) ? readFileSync(join(root, ".gitmodules"), "utf8") : "";
  const submodules = [...gitmodules.matchAll(/^s*paths*=s*(.+?)s*$/gm)].map((match) => match[1]);
  const roadmap = documents["ROADMAP.md"] ?? "";
  const roadmapOrder = [];
  for (const [, name] of roadmap.matchAll(/concepts\/([A-Za-z0-9._-]+\.md)/g)) {
    if (!roadmapOrder.includes(name)) roadmapOrder.push(name);
  }
  return { trackedPaths: tracked, submodules, documents, roadmapOrder };
}

// The commits of <integration>..HEAD, oldest first; the first one with the paths it added.
function readBranch(root, integration) {
  const log = git(root, "log", "--reverse", "--format=%H%x1f%P%x1f%s", `${integration}..HEAD`);
  if (log.status !== 0) return null;
  const commits = log.stdout.split(/\r?\n/).filter(Boolean).map((line) => {
    const [id, parents, subject] = line.split("\x1f");
    return { id, parent: parents.split(" ")[0] || null, subject, addedPaths: [] };
  });
  if (commits.length > 0) {
    const added = git(root, "diff-tree", "--root", "--no-commit-id", "--name-only", "-r", "--diff-filter=A", "-z", commits[0].id);
    commits[0].addedPaths = added.stdout.split("\0").filter(Boolean);
  }
  return commits;
}

function main(argv) {
  const root = git(process.cwd(), "rev-parse", "--show-toplevel");
  if (root.status !== 0) {
    console.error(NEED_GIT);
    return 2;
  }
  const usage = "usage: rebuild.mjs check | plan --integration <branch> | verdict <file>";
  const top = root.stdout.trim();
  if (argv[0] === "plan") {
    const integration = argv[1] === "--integration" ? argv[2] : undefined;
    if (!integration) {
      console.error(usage);
      return 2;
    }
    const branch = readBranch(top, integration);
    if (!branch) {
      console.error(`the integration branch ${integration} does not exist`);
      return 2;
    }
    const snapshot = readSnapshot(top);
    const tree = git(top, "ls-tree", "-r", "-z", "--name-only", branch[0]?.parent ?? "HEAD");
    snapshot.trackedPaths = tree.stdout.split("\0").filter(Boolean);
    console.log(JSON.stringify(plan(snapshot, branch), null, 2));
    return 0;
  }
  if (argv[0] === "verdict") {
    let run;
    try {
      run = JSON.parse(readFileSync(argv[1], "utf8"));
    } catch {
      console.error(usage);
      return 2;
    }
    console.log(verdict(run));
    return 0;
  }
  if (argv[0] !== "check") {
    console.error(usage);
    return 2;
  }
  const findings = check(readSnapshot(top));
  console.log(JSON.stringify(findings, null, 2));
  return findings.some((entry) => entry.blocking) ? 1 : 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
