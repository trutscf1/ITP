#!/usr/bin/env node
// session-recover.mjs — copied into projects by gam-engineering (setup, migrate tools); edit the template in the skill.
// Reads a Claude Code session that ended without a handover (session limit, network break, crash) and writes a report for
// the agent that continues it (gam-ai-memory/plans/2026-11-16-session-recovery-script.md). The export of prompt-export.mjs
// skips subagents and holds no tool calls; this report holds the dialog, the pop-ups with their answers, every subagent
// (brief and final report, or its last steps), the open last step, and background commands without a reported end.
// Node only, no dependencies, no shell. It only reads: the Claude profile, and the output files of background commands.
//
//   node gam-engineering/tools/session-recover.mjs [--session <id>] [--list] [--check] [--repo <dir>] [--exclude <id>]
//
// Report: <temp>/claude-session-recover/<YYYYMMDD-HHmmss>-<session id prefix 8>.md, the five newest are kept; stdout gets a
// short summary. --list prints the last ten sessions; --check prints one hint line when the newest session looks cut off
// (it reads at most the last 64 KB of the transcript). Exit 0 when something is printed, 1 when no transcript is found or
// the session id is unknown.
import { existsSync, mkdirSync, openSync, closeSync, readSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { questionRound, redact, repoRoots } from "./prompt-export.mjs";

const TAIL_BYTES = 64 * 1024;
const MAX_LINES = 20;
const KEEP_REPORTS = 5;
const SYSTEM_TEXT = /^\s*<(?:task-notification|agent-message|system-reminder)\b/;

// ---------- finding sessions ----------

export const projectName = (path) => String(path).replace(/[^a-zA-Z0-9]/g, "-");

// <config>/projects, where <config> is CLAUDE_CONFIG_DIR, else <home>/.claude.
export const projectsRoot = ({ env = process.env, home = homedir() } = {}) => join(env.CLAUDE_CONFIG_DIR || join(home, ".claude"), "projects");

// The project folders of the repo and its worktrees (the folder name is the path with every non-alphanumeric character as -;
// compared without case, because Windows paths differ in drive letter case).
export function projectDirs(repo, options = {}) {
  const base = projectsRoot(options);
  if (!existsSync(base)) return [];
  const wanted = new Set([resolve(repo), ...repoRoots(repo).rawRoots].map((path) => projectName(path).toLowerCase()));
  return readdirSync(base)
    .filter((name) => wanted.has(name.toLowerCase()))
    .map((name) => join(base, name));
}

// Every session of the repo, the newest first: { id, file, dir, mtimeMs }.
export function findSessions(repo, options = {}) {
  const sessions = [];
  for (const dir of projectDirs(repo, options)) {
    for (const name of readdirSync(dir).filter((item) => item.endsWith(".jsonl"))) {
      const file = join(dir, name);
      sessions.push({ id: name.slice(0, -".jsonl".length), file, dir, mtimeMs: statSync(file).mtimeMs });
    }
  }
  return sessions.sort((a, b) => b.mtimeMs - a.mtimeMs);
}

// ---------- reading ----------

export function parseLines(text) {
  const lines = [];
  for (const raw of text.split("\n")) {
    if (!raw.trim()) continue;
    try {
      lines.push(JSON.parse(raw));
    } catch {
      // a truncated or damaged line (the cut itself) is skipped
    }
  }
  return lines;
}

export const readLines = (file) => parseLines(readFileSync(file, "utf8"));

// The parsed lines of the last `bytes` of a file; the first, possibly partial, line is dropped when the file was cut.
export function readTail(file, bytes = TAIL_BYTES) {
  const size = statSync(file).size;
  const length = Math.min(size, bytes);
  const buffer = Buffer.alloc(length);
  const fd = openSync(file, "r");
  try {
    readSync(fd, buffer, 0, length, size - length);
  } finally {
    closeSync(fd);
  }
  let text = buffer.toString("utf8");
  if (size > length) text = text.slice(text.indexOf("\n") + 1);
  return parseLines(text);
}

const partsOf = (line) => (Array.isArray(line.message?.content) ? line.message.content : []);
const textOf = (content) => (typeof content === "string" ? content : Array.isArray(content) ? content.filter((part) => part.type === "text").map((part) => part.text).join("\n") : "");
const resultText = (part) => textOf(part.content);
const isTurn = (line) => (line.type === "user" || line.type === "assistant") && line.message && !line.isMeta;

// A prompt typed while the agent works is stored as a queued_command attachment (not a task or agent notification).
const queuedPrompt = (line) => (line.type === "attachment" && line.attachment?.type === "queued_command" && typeof line.attachment.prompt === "string" && line.attachment.origin?.kind !== "agent" && !SYSTEM_TEXT.test(line.attachment.prompt) ? line.attachment.prompt : "");

// Ends of background commands and agents: every <task-notification> in a queue line or a queued command.
function notifications(line) {
  const text = line.type === "queue-operation" ? line.content : line.type === "attachment" && line.attachment?.type === "queued_command" ? line.attachment.prompt : "";
  const found = [];
  for (const match of String(text || "").matchAll(/<task-notification>([\s\S]*?)<\/task-notification>/g)) {
    const id = /<task-id>([^<]+)<\/task-id>/.exec(match[1])?.[1];
    if (id) found.push({ id, status: /<status>([^<]*)<\/status>/.exec(match[1])?.[1] ?? "" });
  }
  return found;
}

const isInterrupted = (entry) => entry.isError && /^\[?Tool call interrupted/.test(entry.text);

// ---------- one agent's own transcript ----------

// The state of a subagent from its lines: its final report (SubagentHandback, or a closing assistant text) and its steps.
export function agentState(lines) {
  const turns = lines.filter(isTurn);
  let report;
  for (const line of turns) {
    for (const part of line.type === "assistant" ? partsOf(line) : []) {
      if (part.type === "tool_use" && part.name === "SubagentHandback") report = String(part.input?.message ?? "");
    }
  }
  if (report === undefined) {
    const tail = [];
    for (let index = turns.length - 1; index >= 0 && turns[index].type === "assistant"; index--) tail.unshift(turns[index]);
    const parts = tail.flatMap(partsOf);
    const text = parts.filter((part) => part.type === "text").map((part) => part.text).join("\n").trim();
    if (text && !parts.some((part) => part.type === "tool_use")) report = text;
  }
  const steps = turns.flatMap((line) => (line.type === "assistant" ? partsOf(line).filter((part) => part.type === "tool_use" && part.name !== "SubagentHandback") : []));
  const last = turns.at(-1);
  const lastResult = last?.type === "user" ? partsOf(last).filter((part) => part.type === "tool_result").map(resultText).join("\n") : "";
  return { done: report !== undefined, report, steps, lastResult, turns };
}

// The subagents of a session folder: { id, file, meta, lines }; lines only when `full`, else the tail.
export function loadAgents(sessionDir, { full = true } = {}) {
  const dir = join(sessionDir, "subagents");
  if (!existsSync(dir)) return [];
  const agents = [];
  for (const name of readdirSync(dir).filter((item) => item.endsWith(".meta.json"))) {
    const stem = name.slice(0, -".meta.json".length);
    const file = join(dir, `${stem}.jsonl`);
    let meta = {};
    try {
      meta = JSON.parse(readFileSync(join(dir, name), "utf8"));
    } catch {
      // a damaged meta file leaves the agent unnamed
    }
    const lines = existsSync(file) ? (full ? readLines(file) : readTail(file)) : [];
    agents.push({ id: stem.replace(/^agent-/, ""), file, meta, lines });
  }
  return agents;
}

// ---------- analysis ----------

const summaryOf = (use) => {
  const input = use.input ?? {};
  const value = typeof input === "string" ? input : (input.command ?? JSON.stringify(input));
  return typeof value === "string" ? value : JSON.stringify(value);
};

// What the session held. `agents` come from loadAgents; background output files are read here.
export function analyse(lines, agents = [], { readOutput = true } = {}) {
  const uses = new Map();
  const results = new Map();
  const ended = new Map();
  const dialog = [];
  let last;
  let first;
  let end;
  let branch;
  let cwd;
  for (const line of lines) {
    if (line.isSidechain) continue;
    if (line.timestamp) {
      first ??= line.timestamp;
      end = line.timestamp;
    }
    for (const item of notifications(line)) ended.set(item.id, item.status);
    const queued = queuedPrompt(line);
    if (queued) {
      dialog.push({ role: "user", text: queued, ts: line.timestamp });
      last = { type: "prompt" };
      continue;
    }
    if (!isTurn(line)) continue;
    branch = line.gitBranch ?? branch;
    cwd = line.cwd ?? cwd;
    last = { type: line.type, line };
    const toolParts = partsOf(line).filter((part) => part.type === "tool_result");
    for (const part of partsOf(line)) {
      if (part.type === "tool_use") uses.set(part.id, { ...part, ts: line.timestamp });
      if (part.type === "tool_result") results.set(part.tool_use_id, { text: resultText(part), isError: Boolean(part.is_error), tur: line.toolUseResult });
    }
    if (line.type === "user") {
      if (line.toolUseResult && typeof line.toolUseResult === "object" && Array.isArray(line.toolUseResult.questions)) dialog.push(questionRound(line.toolUseResult, line.timestamp));
      const text = textOf(line.message.content).trim();
      if (!toolParts.length && text && !SYSTEM_TEXT.test(text)) {
        dialog.push({ role: "user", text, ts: line.timestamp });
        last = { type: "prompt" };
      }
    } else {
      const text = textOf(line.message.content).trim();
      if (text) dialog.push({ role: "assistant", text, ts: line.timestamp });
    }
  }

  const open = [...uses.values()].filter((item) => !results.has(item.id) || isInterrupted(results.get(item.id)));

  const background = [];
  for (const item of uses.values()) {
    const found = results.get(item.id);
    if (!found) continue;
    const match = /Command running in background with ID: (\S+?)\.\s+Output is being written to: (.+?\.output)/.exec(found.text);
    const id = match?.[1] ?? found.tur?.backgroundTaskId;
    if (!id) continue;
    if (ended.has(id)) continue;
    const path = match?.[2];
    const entry = { id, command: summaryOf(item), description: item.input?.description, path };
    if (path && readOutput) {
      if (existsSync(path)) entry.tail = readFileSync(path, "utf8").split("\n").slice(-MAX_LINES - 1).join("\n").replace(/\n+$/, "").split("\n").slice(-MAX_LINES);
      else entry.missing = true;
    }
    background.push(entry);
  }

  // Subagents: the transcripts of the session folder, plus Agent calls that left no transcript.
  const subagents = [];
  const seen = new Set();
  const launches = [...uses.values()].filter((item) => item.name === "Agent" || item.name === "Task");
  for (const agent of agents) {
    const launch = launches.find((item) => item.id === agent.meta.toolUseId) ?? launches.find((item) => results.get(item.id)?.tur?.agentId === agent.id);
    if (launch) seen.add(launch.id);
    const state = agentState(agent.lines);
    const outcome = launch ? results.get(launch.id) : undefined;
    const brief = textOf(agent.lines.find((line) => line.type === "user" && line.message)?.message?.content) || launch?.input?.prompt || "";
    subagents.push({
      id: agent.id,
      description: agent.meta.description ?? launch?.input?.description ?? "(no description)",
      model: [...new Set([agent.meta.model, outcome?.tur?.resolvedModel].filter(Boolean))].join(" / ") || "(unknown)",
      effort: agent.meta.effort,
      brief,
      done: state.done,
      report: state.report,
      steps: state.steps.slice(-3),
      lastResult: state.lastResult,
      file: agent.file,
    });
  }
  for (const launch of launches) {
    if (seen.has(launch.id)) continue;
    const outcome = results.get(launch.id);
    const sync = outcome && !outcome.isError && !outcome.tur?.isAsync && outcome.tur?.status !== "async_launched";
    subagents.push({
      id: outcome?.tur?.agentId ?? launch.id,
      description: launch.input?.description ?? "(no description)",
      model: [launch.input?.model, outcome?.tur?.resolvedModel].filter(Boolean).join(" / ") || "(unknown)",
      effort: launch.input?.effort,
      brief: launch.input?.prompt ?? "",
      done: Boolean(sync),
      report: sync ? outcome.text : undefined,
      steps: [],
      lastResult: "",
      file: undefined,
      noTranscript: true,
    });
  }

  const reasons = [];
  for (const item of open) reasons.push(`open tool call: ${item.name}`);
  for (const item of subagents.filter((entry) => !entry.done)) reasons.push(`subagent without final report: ${item.description}`);
  for (const item of background) reasons.push(`background command without reported end: ${item.id}`);
  if (last?.type === "prompt") reasons.push("the last line is a prompt without an answer");
  return { dialog, open, background, subagents, reasons, cutOff: reasons.length > 0, start: first, end, branch, cwd };
}

// ---------- rendering ----------

// The first `max` lines of a text, each cut to 300 characters, with a note for what was left out.
export function clip(text, max = MAX_LINES) {
  const rows = String(text ?? "").split("\n");
  const shown = rows.slice(0, max).map((row) => (row.length > 300 ? `${row.slice(0, 300)}…` : row));
  if (rows.length > max) shown.push(`… (${rows.length - max} more lines)`);
  return shown.join("\n");
}

// A fence that no run of backticks inside the text can close.
export function fence(text, info = "") {
  const longest = Math.max(2, ...[...String(text).matchAll(/`+/g)].map((match) => match[0].length));
  const ticks = "`".repeat(longest + 1);
  return `${ticks}${info}\n${text}\n${ticks}`;
}

const when = (value) => value ?? "(unknown)";

export function render(analysis, { id, file }) {
  const out = [];
  const state = analysis.cutOff ? `cut off (${analysis.reasons.join("; ")})` : "not cut off";
  out.push(`# Session recovery report ${id}`, "", `- Session: \`${id}\``, `- Transcript: \`${file}\``, `- Started: ${when(analysis.start)}`, `- Last activity: ${when(analysis.end)}`, `- Branch (as the transcript holds it): ${analysis.branch ?? "(unknown)"}`, `- Folder (as the transcript holds it): ${analysis.cwd ?? "(unknown)"}`, `- State: ${state}`, `- Resume the session itself: \`claude --resume ${id}\``, "");

  out.push("## Open step", "");
  if (!analysis.open.length) out.push("No tool call is open.", "");
  for (const item of analysis.open) out.push(`- Tool \`${item.name}\` (started ${when(item.ts)}) has no result. Input:`, "", fence(clip(summaryOf(item))), "");

  out.push("## Dialog", "");
  const lastAnswers = new Set(analysis.dialog.filter((entry) => entry.role === "assistant").slice(-5));
  for (const entry of analysis.dialog) {
    if (entry.role === "assistant" && !lastAnswers.has(entry)) continue;
    const label = { user: "Developer", assistant: "Agent", question: "Pop-up" }[entry.role] ?? entry.role;
    out.push(`### ${label} (${when(entry.ts)})`, "", fence(entry.text), "");
  }
  out.push("Only the last five agent answers are shown; every prompt and pop-up is verbatim.", "");

  out.push("## Subagents", "");
  if (!analysis.subagents.length) out.push("The session started no subagent.", "");
  for (const agent of analysis.subagents) {
    out.push(`### ${agent.description}`, "", `- Agent id: \`${agent.id}\``, `- Model: ${agent.model}${agent.effort ? `, effort ${agent.effort}` : ""}`, `- Status: ${agent.done ? "finished with a final report" : "cut off, no final report"}`);
    if (agent.file) out.push(`- Transcript: \`${agent.file}\``);
    if (agent.noTranscript) out.push("- No transcript of this agent was found.");
    out.push("", "Brief (verbatim):", "", fence(agent.brief || "(none)"), "");
    if (agent.done) out.push("Final report (verbatim):", "", fence(agent.report), "");
    else if (agent.steps.length) {
      out.push("Last steps:", "");
      for (const step of agent.steps) out.push(`- \`${step.name}\`: ${clip(summaryOf(step), 3).replace(/\n/g, " ")}`);
      out.push("");
      if (agent.lastResult) out.push("Last result:", "", fence(clip(agent.lastResult)), "");
    }
  }

  out.push("## Background commands without a reported end", "");
  if (!analysis.background.length) out.push("None.", "");
  for (const item of analysis.background) {
    out.push(`### ${item.description ?? item.command.split("\n")[0].slice(0, 80)}`, "", `- Task id: \`${item.id}\``, `- Output file: ${item.path ? `\`${item.path}\`` : "(path unknown)"}`, "", "Command:", "", fence(clip(item.command)), "");
    if (item.missing) out.push("The output file is missing.", "");
    else if (item.tail) out.push(`Last ${item.tail.length} lines of the output:`, "", fence(item.tail.join("\n")), "");
  }
  // no home replacement: the paths in the report stay usable; secrets and e-mail addresses are redacted
  return redact(`${out.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd()}\n`, "");
}

// ---------- the report file ----------

export const tempRoot = (env = process.env) => env.TEMP || env.TMPDIR || env.TMP || tmpdir();

const pad = (value) => String(value).padStart(2, "0");
export const stampOf = (date = new Date()) => `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;

export function writeReport(text, id, { env = process.env, now = new Date() } = {}) {
  const dir = join(tempRoot(env), "claude-session-recover");
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${stampOf(now)}-${id.slice(0, 8)}.md`);
  writeFileSync(file, text);
  const names = readdirSync(dir).filter((name) => name.endsWith(".md")).sort().reverse();
  for (const name of names.slice(KEEP_REPORTS)) rmSync(join(dir, name), { force: true });
  return file;
}

// ---------- commands ----------

export function sessionAnalysis(session, options) {
  return analyse(readLines(session.file), loadAgents(join(session.dir, session.id)), options);
}

// The cut-off judgement from the tail only (at most 64 KB of the transcript and of each subagent transcript).
export function checkSession(session) {
  const analysis = analyse(readTail(session.file), loadAgents(join(session.dir, session.id), { full: false }), { readOutput: false });
  return analysis;
}

export function summary(analysis, { id, path }) {
  const state = analysis.cutOff ? `cut off (${analysis.reasons.join("; ")})` : "not cut off";
  const next = analysis.cutOff ? "read the report, continue with the open step, or resume the session itself (often possible after a network break)" : "nothing to recover; the report is written anyway for reference";
  return [`session-recover: ${id} (${when(analysis.start)} .. ${when(analysis.end)})`, `state: ${state}`, `report: ${path}`, `next: ${next}`, `resume: claude --resume ${id}`].join("\n");
}

export function main(argv, { env = process.env, home = homedir(), cwd = process.cwd(), out = process.stdout, err = process.stderr } = {}) {
  const flag = (name) => {
    const at = argv.indexOf(name);
    return at >= 0 ? argv[at + 1] : undefined;
  };
  const repo = flag("--repo") ?? cwd;
  const sessions = findSessions(repo, { env, home });
  if (!sessions.length) {
    err.write(`session-recover: no Claude Code transcript found for ${resolve(repo)} under ${projectsRoot({ env, home })}\n`);
    return 1;
  }
  // The running session (Claude Code sets CLAUDE_CODE_SESSION_ID) is never the one to recover: a new session that
  // reads the last one would otherwise judge itself, since its own transcript is the newest.
  const current = flag("--exclude") ?? env.CLAUDE_CODE_SESSION_ID;
  const latest = sessions.find((item) => item.id !== current);
  if (argv.includes("--list")) {
    for (const session of sessions.slice(0, 10)) {
      const analysis = sessionAnalysis(session, { readOutput: false });
      out.write(`${session.id}  ${when(analysis.start)}  ${when(analysis.end)}  ${analysis.cutOff ? "cut off" : "clean"}\n`);
    }
    return 0;
  }
  if (argv.includes("--check")) {
    const session = latest;
    if (!session) return 0;
    const analysis = checkSession(session);
    if (analysis.cutOff) out.write(`session-recover: the last session ${session.id.slice(0, 8)} looks cut off (${analysis.reasons[0]}); report: node gam-engineering/tools/session-recover.mjs --session ${session.id}\n`);
    return 0;
  }
  const wanted = flag("--session");
  const session = wanted ? sessions.find((item) => item.id === wanted || basename(item.file) === wanted) : (latest ?? sessions[0]);
  if (!session) {
    err.write(`session-recover: unknown session id ${wanted}; known: ${sessions.slice(0, 10).map((item) => item.id).join(", ")}\n`);
    return 1;
  }
  const analysis = sessionAnalysis(session);
  const path = writeReport(render(analysis, { id: session.id, file: session.file }), session.id, { env });
  out.write(`${summary(analysis, { id: session.id, path })}\n`);
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.exit(main(process.argv.slice(2)));
  } catch (error) {
    process.stderr.write(`session-recover: ${error.message}\n`);
    process.exit(1);
  }
}
