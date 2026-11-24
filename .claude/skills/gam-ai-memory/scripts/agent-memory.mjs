#!/usr/bin/env node
// agent-memory-version: 1
//
// gam-ai-memory takes as much as possible from the memory each AI agent already keeps, by script
// (plan 2026-11-16-agent-memory-first, Q444-Q453). Node, ESM, no dependencies.
//
//   agent-memory.mjs read         print the agents' memories and the Claude Code transcripts since the reference point
//   agent-memory.mjs detect       decide the entry point of /gam-ai-memory: entry: init|recover|start|report
//   agent-memory.mjs compare      report what an agent memory names that the repo no longer has
//   agent-memory.mjs hook         pre-commit step: update the auto block of PROJECT_STATE.md, print warnings, never block
//   agent-memory.mjs install-hook add one marked line to .git/hooks/pre-commit (idempotent)
//
// Options: --since <YYYY-MM-DD>, --json, --full, --home <dir> (a home folder instead of the real one, for tests),
// --repo <dir>, --project-path <path> (the path the Claude Code folder name is derived from), --idle <minutes>.
// The script never writes into an agent's memory. Only `hook` and `install-hook` write: the auto block of the
// project's own memory file, and the pre-commit hook.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const VERSION = 1;
const AUTO_START = "<!-- agent-memory:auto -->";
const AUTO_END = "<!-- /agent-memory:auto -->";
const HOOK_MARK = "# agent-memory:hook";
const MEMORY_FOLDERS = ["gam-ai-memory", "aigamdocs"];
// A commit that changes only these paths is bookkeeping, not work the memory has to catch up on.
const BOOKKEEPING = ["gam-ai-memory/", "aigamdocs/", "gam-ai-knowledge/", "gam-engineering/documentation/", "humanengineering/documentation/", "docs/prompts/"];
const SKIP_BRANCH_WORDS = new Set(["main", "master", "dev", "develop"]);
const TRANSCRIPT_GRACE_MIN = 30; // a transcript keeps growing a little after the handover was written
const DEFAULT_IDLE_MIN = 15; // a transcript touched more recently than this is the running session

// ---------- small helpers ----------

const isDir = (p) => { try { return fs.statSync(p).isDirectory(); } catch { return false; } };
const isFile = (p) => { try { return fs.statSync(p).isFile(); } catch { return false; } };
const readText = (p) => { try { return fs.readFileSync(p, "utf8"); } catch { return ""; } };
const mtimeOf = (p) => { try { return fs.statSync(p).mtime; } catch { return null; } };
const pad = (n) => String(n).padStart(2, "0");
export const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const ymdhm = (d) => `${ymd(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
const norm = (p) => String(p).replace(/\\/g, "/");

function git(args, cwd) {
  const r = spawnSync("git", args, { cwd, encoding: "utf8", windowsHide: true, maxBuffer: 64 * 1024 * 1024 });
  return { ok: r.status === 0, out: (r.stdout || "").trimEnd(), err: r.stderr || "" };
}

export function parseArgs(argv) {
  const options = { command: argv[0] };
  const withValue = new Set(["since", "home", "repo", "project-path", "idle"]);
  for (let i = 1; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    if (withValue.has(key)) options[key] = argv[++i];
    else options[key] = true;
  }
  return options;
}

// Local date and time. A date without a time means the start of that day, or its end with endOfDay (a handover that
// names only a date was written at some time that day).
export function parseWhen(value, endOfDay = false) {
  const m = /(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/.exec(String(value ?? ""));
  if (!m) return null;
  if (m[4] === undefined && endOfDay) return new Date(+m[1], +m[2] - 1, +m[3], 23, 59, 59, 0);
  return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] ?? 0), +(m[5] ?? 0), 0, 0);
}

export function parseFrontmatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(String(text).replace(/^\uFEFF/, ""));
  if (!m) return { data: {}, body: String(text) };
  const unquote = (v) => v.trim().replace(/^(["'])(.*)\1$/, "$2");
  const data = {};
  let section = null;
  for (const line of m[1].split(/\r?\n/)) {
    const top = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    const nested = /^\s+([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (top) {
      if (top[2].trim() === "") { section = top[1]; data[section] = {}; } else { section = null; data[top[1]] = unquote(top[2]); }
    } else if (nested && section) data[section][nested[1]] = unquote(nested[2]);
  }
  return { data, body: m[2] };
}

// The Claude Code folder name of a project: every non-alphanumeric character as "-". On Windows the drive letter
// appears in both cases, so both spellings are returned.
export function slugs(projectPath) {
  const slug = String(projectPath).replace(/[^A-Za-z0-9]/g, "-");
  const all = new Set([slug]);
  if (/^[A-Za-z]:/.test(String(projectPath))) {
    all.add(slug[0].toUpperCase() + slug.slice(1));
    all.add(slug[0].toLowerCase() + slug.slice(1));
  }
  return [...all];
}

// ---------- context ----------

function agentHomes(options) {
  if (options.home) {
    const home = path.resolve(options.home);
    return { claude: path.join(home, ".claude"), gemini: path.join(home, ".gemini"), codex: path.join(home, ".codex") };
  }
  const home = os.homedir();
  return {
    claude: process.env.CLAUDE_CONFIG_DIR || path.join(home, ".claude"),
    gemini: path.join(home, ".gemini"),
    codex: process.env.CODEX_HOME || path.join(home, ".codex"),
  };
}

function context(options) {
  const start = path.resolve(options.repo ?? process.cwd());
  const top = git(["rev-parse", "--show-toplevel"], start);
  const root = top.ok ? path.resolve(top.out) : start;
  const memName = MEMORY_FOLDERS.find((name) => isDir(path.join(root, name))) ?? null;
  return {
    root,
    isGit: top.ok,
    memName,
    memDir: memName ? path.join(root, memName) : null,
    homes: agentHomes(options),
    projectPath: options["project-path"] ?? root,
    idleMin: options.idle !== undefined ? Number(options.idle) : DEFAULT_IDLE_MIN,
  };
}

function branchInfo(ctx) {
  if (!ctx.isGit) return { name: null, linked: false, file: null, useFile: false };
  const name = git(["rev-parse", "--abbrev-ref", "HEAD"], ctx.root).out || null;
  const gitDir = git(["rev-parse", "--git-dir"], ctx.root).out;
  const common = git(["rev-parse", "--git-common-dir"], ctx.root).out;
  const linked = !!gitDir && !!common && path.resolve(ctx.root, gitDir) !== path.resolve(ctx.root, common);
  const onBranch = !!name && name !== "HEAD";
  const file = ctx.memDir && onBranch ? path.join(ctx.memDir, "branches", `${name.replace(/\//g, "-")}.md`) : null;
  return { name, linked, file, useFile: !!file && (isFile(file) || linked) };
}

// ---------- agent memories ----------

function projectDirs(ctx) {
  const seen = new Set();
  const dirs = [];
  for (const slug of slugs(ctx.projectPath)) {
    const dir = path.join(ctx.homes.claude, "projects", slug);
    if (!isDir(dir)) continue;
    let key = dir;
    try { key = fs.realpathSync.native(dir); } catch { /* keep dir */ }
    if (process.platform === "win32") key = key.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    dirs.push(dir);
  }
  return dirs;
}

function readClaudeMemory(ctx) {
  const tried = slugs(ctx.projectPath);
  const entries = [];
  const indexFiles = [];
  for (const dir of projectDirs(ctx)) {
    const memory = path.join(dir, "memory");
    if (!isDir(memory)) continue;
    for (const name of fs.readdirSync(memory).sort()) {
      if (!name.endsWith(".md")) continue;
      const file = path.join(memory, name);
      if (name === "MEMORY.md") { indexFiles.push({ file, text: readText(file) }); continue; }
      const { data, body } = parseFrontmatter(readText(file));
      entries.push({
        file,
        name: data.name || name.replace(/\.md$/, ""),
        description: data.description || "",
        type: data.metadata?.type ?? data.type ?? "",
        modified: mtimeOf(file),
        body: body.trim(),
      });
    }
  }
  return { tried, entries, indexFiles, found: entries.length > 0 || indexFiles.length > 0 };
}

const headingsOf = (text) => text.split(/\r?\n/).filter((line) => /^#{1,6}\s/.test(line));

function readGlobalFile(file) {
  if (!isFile(file)) return { file, skipped: true };
  const text = readText(file);
  return { file, skipped: false, modified: mtimeOf(file), headings: headingsOf(text), text };
}

function readGemini(ctx) {
  const file = path.join(ctx.homes.gemini, "GEMINI.md");
  if (!isFile(file)) return { file, skipped: true, items: [] };
  const text = readText(file);
  const m = /^##\s+Gemini Added Memories\s*$([\s\S]*?)(?=^##\s|(?![\s\S]))/m.exec(text);
  const items = m ? m[1].split(/\r?\n/).filter((line) => /^\s*[-*]\s+\S/.test(line)).map((line) => line.replace(/^\s*[-*]\s+/, "")) : [];
  return { file, skipped: false, modified: mtimeOf(file), hasSection: !!m, items };
}

function readCodex(ctx) {
  const agents = readGlobalFile(path.join(ctx.homes.codex, "AGENTS.md"));
  const dir = path.join(ctx.homes.codex, "memories");
  const files = isDir(dir)
    ? fs.readdirSync(dir).filter((n) => isFile(path.join(dir, n))).sort().map((n) => {
        const file = path.join(dir, n);
        const text = readText(file);
        return { file, modified: mtimeOf(file), first: (text.split(/\r?\n/).find((l) => l.trim()) ?? "").trim(), text };
      })
    : [];
  return { agents, dir, memoriesSkipped: !isDir(dir), files };
}

// ---------- transcripts (Claude Code) ----------

function sessionFiles(ctx) {
  const files = [];
  for (const dir of projectDirs(ctx)) {
    for (const name of fs.readdirSync(dir)) {
      if (!name.endsWith(".jsonl")) continue;
      const file = path.join(dir, name);
      const modified = mtimeOf(file);
      if (modified) files.push({ file, id: name.replace(/\.jsonl$/, ""), modified });
    }
  }
  return files.sort((a, b) => a.modified - b.modified);
}

const textOf = (content) => {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content.filter((c) => c && (c.type === "text" || typeof c.text === "string")).map((c) => c.text).join("\n");
};

// Prompts, pop-up rounds, plan approvals, and declined calls of one session; no tool output.
export function condense(file, { sinceMs = 0, full = false } = {}) {
  const cut = (s) => (full || s.length <= 500 ? s : `${s.slice(0, 500)}...`);
  const events = [];
  for (const line of readText(file).split("\n")) {
    if (!line.trim()) continue;
    let e;
    try { e = JSON.parse(line); } catch { continue; }
    if (e.type !== "user" || e.isSidechain || e.isMeta || !e.message) continue;
    const at = e.timestamp ? new Date(e.timestamp) : null;
    if (at && at.getTime() < sinceMs) continue;
    const tur = e.toolUseResult;
    const blocks = Array.isArray(e.message.content) ? e.message.content : [];
    if (tur && typeof tur === "object" && Array.isArray(tur.questions)) {
      const answers = tur.answers && typeof tur.answers === "object" ? tur.answers : null;
      const text = answers
        ? tur.questions.map((q) => `${q.question} -> ${answers[q.question] ?? "(no answer)"}`).join(" | ")
        : textOf(blocks.map((b) => (b.type === "tool_result" ? { text: textOf(b.content) } : b)));
      events.push({ at, kind: "popup", text: cut(text) });
    } else if (tur && typeof tur === "object" && typeof tur.plan === "string") {
      events.push({ at, kind: "plan", text: cut(tur.plan.trim()) });
    } else if (blocks.some((b) => b.type === "tool_result")) {
      for (const b of blocks) {
        const text = b.type === "tool_result" && b.is_error ? textOf(b.content) : "";
        const i = text.indexOf("the user said:");
        if (i >= 0) events.push({ at, kind: "declined", text: cut(text.slice(i + "the user said:".length).trim()) });
      }
    } else {
      const text = textOf(e.message.content).trim();
      if (!text || text.startsWith("<") || text.startsWith("[Request interrupted") || text.startsWith("Caveat:")) continue;
      events.push({ at, kind: "prompt", text: cut(text) });
    }
  }
  return events;
}

// ---------- reference point and detect ----------

function readSessionLog(ctx) {
  const text = ctx.memDir ? readText(path.join(ctx.memDir, "SESSION_LOG.md")) : "";
  const heads = [...text.matchAll(/^###\s+(\d{4}-\d{2}-\d{2})\b.*$/gm)];
  const blocks = heads.map((h, i) => {
    const start = h.index + h[0].length;
    const next = /^#{1,3}\s/m.exec(text.slice(start));
    const block = text.slice(start, next ? start + next.index : undefined);
    const merges = [];
    const m = /^- \*\*Merges:\*\*[^\n]*\n((?:[ \t]+-[^\n]*\n?)*)/m.exec(block);
    for (const line of (m ? m[1] : "").split("\n")) {
      const item = /^\s+-\s+(.+)$/.exec(line);
      if (!item) continue;
      const name = item[1].split(/\s+[—-]\s+/)[0].replace(/[`\[\]]/g, "").trim();
      if (name && name !== "branch") merges.push(name);
    }
    // Branch names written in backticks anywhere in the entry (for example in its Branch line) count as listed too.
    const tokens = [...block.matchAll(/`([A-Za-z0-9._-]+\/[A-Za-z0-9._/-]+)`/g)].map((x) => x[1]);
    return { date: parseWhen(h[1]), heading: h[0].replace(/^###\s+/, "").trim(), merges, tokens, open: /\*\*Handover:\*\*\s*open/i.test(block), index: i };
  });
  if (!blocks.length) return { date: null, heading: "", merges: [], open: false, blocks };
  return { ...blocks[0], blocks };
}

// The point after which work counts as unrecorded: the newest SESSION_LOG.md entry (an open sync entry included, Q448)
// or the handover when it is newer; in a worktree with a branch file, the `updated:` of that file (A4).
export function computeReference(ctx) {
  const branch = branchInfo(ctx);
  if (!ctx.memDir) return { instant: null, source: "no memory folder", listed: [], branch };
  if (branch.useFile) {
    const file = isFile(branch.file) ? branch.file : null;
    const data = file ? parseFrontmatter(readText(file)).data : {};
    const instant = parseWhen(data.updated ?? data.date);
    return { instant, settled: instant, source: file ? `branch file ${norm(path.relative(ctx.root, file))}` : "branch file not written yet", listed: [], branch, branchFile: true };
  }
  const log = readSessionLog(ctx);
  const handoverFm = parseFrontmatter(readText(path.join(ctx.memDir, "AI_HANDOVER.md"))).data;
  const handover = parseWhen(handoverFm.date, true);
  let instant = null;
  const parts = [];
  if (log.date) { instant = log.date; parts.push(`SESSION_LOG.md entry ${ymd(log.date)}${log.open ? " (open sync entry)" : ""}`); }
  if (handover) {
    const day = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    if (!instant || day(handover) >= day(instant)) { instant = handover; parts.length = 0; parts.push(`AI_HANDOVER.md ${ymdhm(handover)}`); }
    else parts.push(`AI_HANDOVER.md ${ymdhm(handover)} is older`);
  }
  // Later than the entry day: used where only a later day proves the memory is behind (compare).
  const settled = log.date ? new Date(log.date.getFullYear(), log.date.getMonth(), log.date.getDate() + 1) : instant;
  // Merges listed by every entry of the reference day or later, not only the newest one: several sessions can sync on one day.
  const refDay = instant ? new Date(instant.getFullYear(), instant.getMonth(), instant.getDate()) : null;
  const listed = refDay ? log.blocks.filter((x) => x.date && x.date >= refDay).flatMap((x) => [...x.merges, ...x.tokens]) : [];
  return { instant, settled: handover && settled && handover > settled ? handover : settled, source: parts.join("; ") || "none", listed, branch };
}

const listedIn = (subject, listed) => listed.some((name) => {
  const n = name.toLowerCase().replace(/^origin\//, "");
  if (n.length < 3 || SKIP_BRANCH_WORDS.has(n)) return false;
  const s = subject.toLowerCase();
  return s.includes(n) || s.includes(n.replace(/\//g, "-"));
});

export function findWork(ctx, reference) {
  const work = [];
  if (ctx.isGit) {
    const status = git(["status", "--porcelain", "--untracked-files=all"], ctx.root).out;
    const dirty = status.split("\n").filter(Boolean).map((l) => norm(l.slice(3)).replace(/^"|"$/g, "").replace(/^.* -> /, "")).filter((p) => !BOOKKEEPING.some((b) => p.startsWith(b)));
    if (dirty.length) work.push({ kind: "uncommitted", detail: `${dirty.length} uncommitted change(s) outside the memory, e.g. ${dirty[0]}` });
    if (reference.instant) {
      const log = git(["log", "--first-parent", "-n", "400", "--format=%H%x09%ct%x09%s"], ctx.root);
      for (const line of log.out.split("\n").filter(Boolean)) {
        const [sha, ct, ...subject] = line.split("\t");
        if (Number(ct) * 1000 <= reference.instant.getTime()) continue;
        const subj = subject.join("\t");
        if (listedIn(subj, reference.listed)) continue;
        const files = git(["diff-tree", "-r", "--name-only", "--no-commit-id", "-m", "--first-parent", sha], ctx.root).out.split("\n").filter(Boolean);
        if (files.length && files.every((f) => BOOKKEEPING.some((b) => f.startsWith(b)))) continue;
        work.push({ kind: "commit", detail: `commit ${sha.slice(0, 7)} "${subj}" is newer than the reference point and not listed in its merges` });
      }
    }
  }
  if (reference.instant) {
    const after = reference.instant.getTime() + TRANSCRIPT_GRACE_MIN * 60000;
    const idleBefore = Date.now() - ctx.idleMin * 60000;
    for (const s of sessionFiles(ctx)) {
      if (s.modified.getTime() <= after || s.modified.getTime() > idleBefore) continue;
      if (condense(s.file).some((e) => e.kind === "prompt")) work.push({ kind: "transcript", detail: `session ${s.id} (${ymdhm(s.modified)}) is newer than the reference point` });
    }
  }
  return work;
}

function detect(ctx) {
  const reference = computeReference(ctx);
  if (!ctx.memDir) return { entry: "init", reason: "no gam-ai-memory/ folder (and no aigamdocs/)", reference };
  const work = findWork(ctx, reference);
  if (work.length) {
    const more = work.length > 1 ? ` (+${work.length - 1} more)` : "";
    return { entry: "recover", reason: `work after the reference point (${reference.source}): ${work[0].detail}${more}`, reference, work };
  }
  if (reference.instant || reference.branchFile) return { entry: "start", reason: `memory current: ${reference.source}, no unrecorded commits, changes, or sessions`, reference, work };
  const where = reference.branch.useFile ? "branch file not written yet" : "no dated session entry or handover";
  return { entry: "report", reason: `nothing to start from (${where}); state the current task from CURRENT_TASK.md`, reference, work };
}

// ---------- compare ----------

function memoryTexts(claude, gemini, codex) {
  const texts = claude.entries.map((e) => ({ agent: "Claude Code", file: e.file, text: e.body }));
  if (gemini.items.length) texts.push({ agent: "Gemini CLI", file: gemini.file, text: gemini.items.join("\n") });
  for (const f of codex.files) texts.push({ agent: "Codex", file: f.file, text: f.text });
  return texts;
}

const looksLikePath = (s) => !/\s/.test(s) && !/:\/\//.test(s) && !/^[/~.$<]/.test(s) && !/[*<>{}$|:]/.test(s) && /\//.test(s) && /(\.[A-Za-z0-9]{1,6}|\/)$/.test(s);

function candidates(text) {
  const found = new Map();
  const add = (kind, value) => found.set(`${kind}\0${value}`, { kind, value });
  for (const m of text.matchAll(/`([^`\n]{1,200})`/g)) {
    const span = m[1].trim();
    let n;
    if ((n = /^npm run ([\w:.-]+)/.exec(span))) add("script", n[1]);
    else if ((n = /^node\s+(?:--\S+\s+)*([^\s"']+\.(?:mjs|cjs|js))/.exec(span))) add("path", n[1]);
    else if (/^(?:feature|fix|hotfix|bugfix|chore|quick|release|refactor)\/[\w./-]+$/.test(span)) add("branch", span);
    else if (looksLikePath(span)) add("path", span.replace(/[.,;]+$/, ""));
  }
  for (const m of text.matchAll(/\bbranch(?:es)?\s+[`'"]?([A-Za-z0-9][\w./-]*\w)/gi)) if (/[/_.-]/.test(m[1])) add("branch", m[1]);
  return [...found.values()];
}

const branchExists = (ctx, name) => ["", "origin/"].some((p) => git(["rev-parse", "--verify", "--quiet", `${p}${name}^{commit}`], ctx.root).ok);

function compare(ctx, preloaded) {
  const claude = preloaded?.claude ?? readClaudeMemory(ctx);
  const gemini = preloaded?.gemini ?? readGemini(ctx);
  const codex = preloaded?.codex ?? readCodex(ctx);
  const reference = preloaded?.reference ?? computeReference(ctx);
  const findings = [];
  let packageScripts = null;
  const pkg = path.join(ctx.root, "package.json");
  if (isFile(pkg)) { try { packageScripts = JSON.parse(readText(pkg)).scripts ?? {}; } catch { packageScripts = {}; } }
  for (const mem of memoryTexts(claude, gemini, codex)) {
    for (const c of candidates(mem.text)) {
      if (c.kind === "branch" && ctx.isGit && !branchExists(ctx, c.value)) findings.push({ kind: "missing-branch", agent: mem.agent, file: mem.file, detail: `branch ${c.value} does not exist in the repo` });
      else if (c.kind === "path" && !fs.existsSync(path.join(ctx.root, c.value))) findings.push({ kind: "missing-path", agent: mem.agent, file: mem.file, detail: `path ${c.value} does not exist in the repo` });
      else if (c.kind === "script" && packageScripts && !(c.value in packageScripts)) findings.push({ kind: "missing-script", agent: mem.agent, file: mem.file, detail: `npm script ${c.value} is not in package.json` });
    }
  }
  if (reference.settled) {
    const files = [...claude.entries.map((e) => [e.file, e.modified, "Claude Code"]), ...codex.files.map((f) => [f.file, f.modified, "Codex"])];
    if (!gemini.skipped && gemini.items.length) files.push([gemini.file, gemini.modified, "Gemini CLI"]);
    for (const [file, modified, agent] of files) {
      if (modified && modified > reference.settled) findings.push({ kind: "newer-memory", agent, file, detail: `modified ${ymd(modified)}, after the newest SESSION_LOG.md entry; it may hold a fact the shared memory lacks` });
    }
  }
  if (ctx.memDir) {
    const hay = ["CURRENT_TASK.md", "PROJECT_STATE.md", "KNOWN_ISSUES.md"].map((n) => readText(path.join(ctx.memDir, n))).join("\n").toLowerCase().replace(/[-_\s]+/g, " ");
    for (const e of claude.entries.filter((x) => x.type === "project")) {
      if (!hay.includes(e.name.toLowerCase().replace(/[-_\s]+/g, " "))) findings.push({ kind: "no-counterpart", agent: "Claude Code", file: e.file, detail: `project memory "${e.name}" has no counterpart in CURRENT_TASK.md, PROJECT_STATE.md, or KNOWN_ISSUES.md` });
    }
  }
  return findings;
}

// ---------- read ----------

function sinceOf(options, reference) {
  if (options.since) return parseWhen(options.since);
  if (reference.instant) return new Date(reference.instant.getFullYear(), reference.instant.getMonth(), reference.instant.getDate());
  return new Date(Date.now() - 14 * 86400000);
}

function collect(ctx, options) {
  const reference = computeReference(ctx);
  const since = sinceOf(options, reference);
  const claude = readClaudeMemory(ctx);
  const sessions = sessionFiles(ctx).filter((s) => s.modified >= since).map((s) => ({ ...s, events: condense(s.file, { sinceMs: since.getTime(), full: !!options.full }) })).filter((s) => s.events.length);
  return { reference, since, claude, claudeGlobal: readGlobalFile(path.join(ctx.homes.claude, "CLAUDE.md")), gemini: readGemini(ctx), codex: readCodex(ctx), sessions };
}

function renderRead(ctx, data, options) {
  const full = !!options.full;
  const out = [`# Agent memory of ${path.basename(ctx.root)}`, "", `- **Repo:** ${norm(ctx.root)}`, `- **Reference point:** ${data.reference.instant ? ymdhm(data.reference.instant) : "none"} (${data.reference.source})`, `- **Transcripts since:** ${ymd(data.since)}`, ""];
  out.push("## Claude Code memory of this repo", "");
  if (!data.claude.found) out.push(`Skipped: no memory folder under ${norm(path.join(ctx.homes.claude, "projects"))}; folder names tried: ${data.claude.tried.join(", ")}.`, "");
  for (const e of data.claude.entries) {
    const personal = e.type === "user" || e.type === "feedback";
    out.push(`### ${e.name} (${e.type || "no type"}, ${e.modified ? ymd(e.modified) : "?"})`, "", e.description || "(no description)", "");
    if (personal && !full) out.push("Body omitted (personal kind); `--full` prints it.", "");
    else if (e.body) out.push(e.body, "");
  }
  if (full) for (const i of data.claude.indexFiles) out.push("### MEMORY.md (index)", "", i.text.trim(), "");
  out.push("## Claude Code global CLAUDE.md", "");
  if (data.claudeGlobal.skipped) out.push(`Skipped: ${norm(data.claudeGlobal.file)} not found.`, "");
  else out.push(full ? data.claudeGlobal.text.trim() : data.claudeGlobal.headings.join("\n") || "(no headings)", "");
  out.push("## Gemini CLI", "");
  if (data.gemini.skipped) out.push(`Skipped: ${norm(data.gemini.file)} not found.`, "");
  else if (!data.gemini.items.length) out.push(`${norm(data.gemini.file)} has no "Gemini Added Memories" entries.`, "");
  else out.push(`${norm(data.gemini.file)}, section "Gemini Added Memories":`, "", ...data.gemini.items.map((i) => `- ${i}`), "");
  out.push("## Codex", "");
  if (data.codex.agents.skipped) out.push(`Skipped: ${norm(data.codex.agents.file)} not found.`, "");
  else out.push(`${norm(data.codex.agents.file)}:`, "", full ? data.codex.agents.text.trim() : data.codex.agents.headings.join("\n") || "(no headings)", "");
  if (data.codex.memoriesSkipped) out.push(`Skipped: ${norm(data.codex.dir)} not found.`, "");
  for (const f of data.codex.files) out.push(`### ${path.basename(f.file)} (${f.modified ? ymd(f.modified) : "?"})`, "", full ? f.text.trim() : f.first, "");
  out.push("## Claude Code transcripts since the reference point", "");
  if (!data.sessions.length) out.push("None.", "");
  for (const s of data.sessions) {
    out.push(`### Session ${s.id} (last change ${ymdhm(s.modified)})`, "");
    for (const e of s.events) out.push(`- ${e.at ? `${ymdhm(e.at)} ` : ""}**${e.kind}:** ${e.text.replace(/\s*\n\s*/g, " / ")}`);
    out.push("");
  }
  return `${out.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd()}\n`;
}

function jsonReplacer(_k, v) { return v instanceof Date ? v.toISOString() : v; }

// ---------- hook ----------

function autoBlock(ctx, reference, claude, gemini, codex, eol) {
  const today = ymd(new Date());
  const branch = branchInfo(ctx);
  const head = ctx.isGit ? git(["log", "-1", "--format=%h %s"], ctx.root) : { ok: false };
  let count = "n/a (no reference point)";
  if (ctx.isGit && reference.instant) {
    const log = git(["log", "--first-parent", "-n", "400", "--format=%ct"], ctx.root).out.split("\n").filter(Boolean);
    count = String(log.filter((ct) => Number(ct) * 1000 > reference.instant.getTime()).length);
  }
  const files = [];
  for (const e of claude.entries) files.push(`Claude Code: ${path.basename(e.file)} (${e.modified ? ymd(e.modified) : "?"})`);
  if (!gemini.skipped && gemini.items.length) files.push(`Gemini CLI: GEMINI.md (${ymd(gemini.modified)})`);
  for (const f of codex.files) files.push(`Codex: ${path.basename(f.file)} (${f.modified ? ymd(f.modified) : "?"})`);
  const lines = [
    AUTO_START,
    `- **Updated:** ${today}`,
    `- **Branch:** ${branch.name ?? "n/a"}`,
    `- **Builds on:** ${head.ok && head.out ? head.out : "none (first commit)"}`,
    `- **Commits since the reference point:** ${count}${reference.instant ? ` (${ymd(reference.instant)})` : ""}`,
    `- **Agent memory files:** ${files.length ? "" : "none found"}`.trimEnd(),
    ...files.slice(0, 20).map((f) => `  - ${f}`),
    ...(files.length > 20 ? [`  - ... and ${files.length - 20} more`] : []),
    AUTO_END,
  ];
  return lines.join(eol);
}

export function runHook(ctx) {
  const warnings = [];
  if (!ctx.memDir) return { warnings };
  const branch = branchInfo(ctx);
  const target = branch.useFile && isFile(branch.file) ? branch.file : path.join(ctx.memDir, "PROJECT_STATE.md");
  if (!isFile(target)) return { warnings: [`${norm(path.relative(ctx.root, target))} not found, auto block not updated`] };
  const reference = computeReference(ctx);
  const claude = readClaudeMemory(ctx);
  const gemini = readGemini(ctx);
  const codex = readCodex(ctx);
  const text = fs.readFileSync(target, "utf8");
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  const block = autoBlock(ctx, reference, claude, gemini, codex, eol);
  const a = text.indexOf(AUTO_START);
  const b = text.indexOf(AUTO_END);
  let next;
  if (a >= 0 && b > a) next = text.slice(0, a) + block + text.slice(b + AUTO_END.length);
  else next = `${text}${text.endsWith("\n") || text === "" ? "" : eol}${text === "" ? "" : eol}${block}${eol}`;
  if (next !== text) {
    const rel = norm(path.relative(ctx.root, target));
    const unstaged = ctx.isGit && !git(["diff", "--quiet", "--", rel], ctx.root).ok;
    fs.writeFileSync(target, next);
    if (ctx.isGit) {
      if (unstaged) warnings.push(`${rel} has unstaged changes; the auto block is updated but not staged`);
      else git(["add", "--", rel], ctx.root);
    }
  }
  for (const f of compare(ctx, { claude, gemini, codex, reference }).slice(0, 10)) warnings.push(`${f.agent}: ${f.detail} (${path.basename(f.file)})`);
  return { warnings };
}

// ---------- install-hook ----------

export function installHook(ctx) {
  if (!ctx.isGit) throw new Error("not a git repository");
  const hooks = path.resolve(ctx.root, git(["rev-parse", "--git-path", "hooks"], ctx.root).out);
  const file = path.join(hooks, "pre-commit");
  const folder = ctx.memName ?? "gam-ai-memory";
  const script = `${folder}/tools/agent-memory.mjs`;
  const line = `[ -f ${script} ] && node ${script} hook || true  ${HOOK_MARK}`;
  fs.mkdirSync(hooks, { recursive: true });
  const current = isFile(file) ? fs.readFileSync(file, "utf8") : "";
  if (current.includes(HOOK_MARK)) return { file, changed: false };
  const head = current ? (current.endsWith("\n") ? current : `${current}\n`) : "#!/bin/sh\n";
  fs.writeFileSync(file, `${head}${line}\n`, { mode: 0o755 });
  try { fs.chmodSync(file, 0o755); } catch { /* not supported on this file system */ }
  return { file, changed: true };
}

// ---------- main ----------

const USAGE = `agent-memory.mjs ${VERSION}
usage: agent-memory.mjs <read|detect|compare|hook|install-hook> [--since YYYY-MM-DD] [--json] [--full] [--home <dir>] [--repo <dir>]`;

export function main(argv) {
  const options = parseArgs(argv);
  if (!options.command || options.command === "--help" || options.command === "help") { console.log(USAGE); return 0; }
  if (options.command === "--version") { console.log(String(VERSION)); return 0; }
  if (options.command === "hook") {
    // The hook never blocks a commit: any error is one warning line.
    try {
      const { warnings } = runHook(context(options));
      for (const w of warnings) console.error(`agent-memory: warning: ${w}`);
    } catch (error) {
      console.error(`agent-memory: warning: ${String(error?.message ?? error).split("\n")[0]}`);
    }
    return 0;
  }
  const ctx = context(options);
  switch (options.command) {
    case "read": {
      const data = collect(ctx, options);
      console.log(options.json ? JSON.stringify({ repo: ctx.root, ...data }, jsonReplacer, 2) : renderRead(ctx, data, options).trimEnd());
      return 0;
    }
    case "detect": {
      const result = detect(ctx);
      if (options.json) console.log(JSON.stringify({ entry: result.entry, reason: result.reason, reference: result.reference.instant, work: result.work ?? [] }, jsonReplacer, 2));
      else console.log(`entry: ${result.entry} - ${result.reason}`);
      return 0;
    }
    case "compare": {
      const findings = compare(ctx);
      if (options.json) console.log(JSON.stringify(findings, null, 2));
      else if (!findings.length) console.log("compare: no contradiction found");
      else for (const f of findings) console.log(`compare: ${f.kind}: ${f.detail} [${f.agent}, ${norm(f.file)}]`);
      return 0;
    }
    case "install-hook": {
      const { file, changed } = installHook(ctx);
      console.log(`${changed ? "installed" : "already installed"}: ${norm(file)}`);
      return 0;
    }
    default:
      console.error(USAGE);
      return 2;
  }
}

// Node resolves links (junctions, symlinks) for the main module, so compare real paths: a deployed skill folder is
// often a link (~/.claude/skills/<name> -> ~/.agents/skills/<name>).
const realOf = (p) => { try { return fs.realpathSync(p); } catch { return path.resolve(p); } };
if (process.argv[1] && realOf(process.argv[1]) === realOf(fileURLToPath(import.meta.url))) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (error) {
    console.error(`agent-memory: ${error?.message ?? error}`);
    process.exitCode = 1;
  }
}
