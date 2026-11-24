// Stop hook of the gam-engineering skill (P-WS-9, P-ROAD-4).
// First checks the run status line against the background runs of the session (see "Run status" below).
// Then blocks the end of a turn once when the newest merge on the integration branch (dev, or main in trunk mode,
// P-GIT-9) left the status files untouched,
// so the agent updates ROADMAP-DETAILS.md / STATUS.md and ROADMAP.md. Never loops.
// A merge whose commits all carry [no-req] among the tags that end their subject ([no-req] [guide-ok]) is a pure chore
// without a story or stage: it needs no status.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// The knowledge folder is gam-ai-knowledge/, or a former folder in a project not yet moved (P-DOC-10, P-DOC-11).
const FOLDERS = ["gam-ai-knowledge", "gam-engineering/documentation", "humanengineering/documentation"];
let STATUS_FILE = "gam-ai-knowledge/ROADMAP-DETAILS.md";
let PATHSPECS = [STATUS_FILE, ":(glob)gam-ai-knowledge/team/*/STATUS.md"];
function useFolder(root) {
  const folder = FOLDERS.find((f) => existsSync(join(root, f))) ?? FOLDERS[0];
  STATUS_FILE = `${folder}/ROADMAP-DETAILS.md`;
  PATHSPECS = [STATUS_FILE, `:(glob)${folder}/team/*/STATUS.md`];
}

function readInput() {
  try {
    return JSON.parse(readFileSync(0, "utf8") || "{}");
  } catch {
    return {};
  }
}

function git(root, args) {
  try {
    return execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

// The integration branch follows env.GAM_ENGINEERING_BRANCHES in the committed settings, or the key under a former
// prefix (P-DOC-10); missing means dev.
function integrationBranch(root) {
  try {
    const settings = JSON.parse(readFileSync(join(root, ".claude", "settings.json"), "utf8"));
    const env = settings?.env ?? {};
    return (env.GAM_ENGINEERING_BRANCHES ?? env.HUMANENGINEERING_BRANCHES ?? env.ENGINEERING_HUMAN_BRANCHES) === "trunk" ? "main" : "dev";
  } catch {
    return "dev";
  }
}

function newestMerge(root, branch) {
  let newest = null;
  for (const ref of [branch, `origin/${branch}`]) {
    const [sha, time] = git(root, ["log", "-1", "--merges", "--format=%H %ct", ref, "--"]).split(" ");
    if (sha && (!newest || Number(time) > newest.time)) newest = { ref, sha, time: Number(time) };
  }
  return newest;
}

// [no-req] counts anywhere in the run of bracket tags at the end of the subject, so later tags such as [guide-ok]
// do not hide it.
const NO_REQ_TAG = /\[no-req\](\s*\[[^\]]*\])*\s*$/;

function isChoreMerge(root, merge) {
  const subjects = git(root, ["log", "--format=%s", `${merge.sha}^1..${merge.sha}^2`]).split("\n").filter(Boolean);
  return subjects.length > 0 && subjects.every((subject) => NO_REQ_TAG.test(subject));
}

// A merge that changes only the inbox, the Q&A logs (archive), the chat export, or the short-term memory has no status to
// update (P-ROAD-4).
const NO_STATUS_FILE = /(^|\/)(next\.md|qa-log\.md|[^/]+\.qa-log\.md)$|^gam-ai-memory\/|^docs\/prompts\//;

function isInboxOnlyMerge(root, merge) {
  const files = git(root, ["diff", "--name-only", `${merge.sha}^1`, merge.sha]).split("\n").filter(Boolean);
  return files.length > 0 && files.every((file) => NO_STATUS_FILE.test(file));
}

function statusIsCurrent(root, merge) {
  if (isChoreMerge(root, merge)) return true;
  if (isInboxOnlyMerge(root, merge)) {
    process.stderr.write(`gam-engineering (P-ROAD-4): the newest merge on ${merge.ref} changed only inbox, Q&A log, chat export, or memory files; no status update needed.\n`);
    return true;
  }
  if (!git(root, ["ls-files", STATUS_FILE])) {
    // The knowledge folder is outside git: the status is applied right after the merge, so file times decide.
    return statSync(join(root, STATUS_FILE)).mtimeMs / 1000 >= merge.time;
  }
  if (git(root, ["diff", "--name-only", `${merge.sha}^1`, merge.sha, "--", ...PATHSPECS])) return true;
  for (const ref of [merge.ref, "HEAD"]) {
    const time = Number(git(root, ["log", "-1", "--format=%ct", ref, "--", ...PATHSPECS]) || 0);
    if (time > merge.time) return true;
  }
  return git(root, ["status", "--porcelain", "--", ...PATHSPECS]) !== "";
}

// --- Run status (P-WS-9) ---------------------------------------------------------------------------------------------
// The last line of the turn must match the background runs of this session, read from the transcript the hook gets:
// a run started in the background (Bash or Agent with run_in_background, a command moved to the background after its
// timeout, an async subagent) is open until a <task-notification> with its tool-use-id reports an end state or a
// TaskStop/KillShell ends it. A log of claude-script-logs/ the session named that has no `exit code` line is a run that
// is still going or died with its subagent.
const RUNNING_LINE = /⏳🟡\s*\*\*Läuft noch/;
const DONE_LINE = /✅🟢\s*\*\*Fertig/;
const NOTIFICATION = /<task-notification>([\s\S]*?)<\/task-notification>/g;
const LOG_PATH = /[^\s()"'`<>[\]|]*claude-script-logs[\\/][^\s()"'`<>[\]|]+?\.log\b/g;

function readTranscript(path) {
  if (!path || !existsSync(path)) return null;
  try {
    return readFileSync(path, "utf8")
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter((entry) => entry && !entry.isSidechain);
  } catch {
    return null;
  }
}

function blocks(entry) {
  const content = entry.message?.content;
  return Array.isArray(content) ? content : typeof content === "string" ? [{ type: "text", text: content }] : [];
}

function texts(entry) {
  const out = [];
  if (typeof entry.content === "string") out.push(entry.content);
  if (typeof entry.attachment?.prompt === "string") out.push(entry.attachment.prompt);
  for (const block of blocks(entry)) {
    if (typeof block.text === "string") out.push(block.text);
    if (typeof block.content === "string") out.push(block.content);
    if (Array.isArray(block.content)) for (const inner of block.content) if (typeof inner.text === "string") out.push(inner.text);
  }
  return out;
}

const tag = (body, name) => body.match(new RegExp(`<${name}>([^<]*)</${name}>`))?.[1]?.trim() ?? "";

// A prompt opens a turn: a message typed by the developer or a queued one such as a task notification.
function isPrompt(entry) {
  if (entry.type === "attachment") return entry.attachment?.type === "queued_command";
  if (entry.type !== "user" || entry.isMeta) return false;
  const content = blocks(entry);
  return content.length > 0 && content.every((block) => block.type !== "tool_result");
}

function backgroundRuns(entries) {
  const uses = new Map();
  const open = new Map();
  const taskToUse = new Map();
  const ended = new Set();
  for (const entry of entries) {
    if (entry.type === "assistant") {
      for (const block of blocks(entry)) {
        if (block.type !== "tool_use") continue;
        const label = block.input?.description || String(block.input?.command ?? block.name).slice(0, 80);
        uses.set(block.id, { name: block.name, label, background: block.input?.run_in_background === true });
        if (/^(TaskStop|KillShell|KillBash)$/.test(block.name)) {
          const task = block.input?.task_id ?? block.input?.shell_id ?? block.input?.id;
          if (task) ended.add(taskToUse.get(task) ?? task);
        }
      }
    }
    if (entry.type === "user") {
      const result = entry.toolUseResult && typeof entry.toolUseResult === "object" ? entry.toolUseResult : {};
      for (const block of blocks(entry)) {
        if (block.type !== "tool_result") continue;
        const use = uses.get(block.tool_use_id);
        const task = result.backgroundTaskId ?? (result.isAsync ? result.agentId : undefined);
        if (task) taskToUse.set(task, block.tool_use_id);
        if (!block.is_error && (task || use?.background)) open.set(block.tool_use_id, use?.label ?? block.tool_use_id);
      }
    }
    for (const text of texts(entry)) {
      for (const [, body] of text.matchAll(NOTIFICATION)) {
        const status = tag(body, "status");
        if (!status || status === "running") continue;
        const id = tag(body, "tool-use-id") || taskToUse.get(tag(body, "task-id")) || tag(body, "task-id");
        if (id) ended.add(id);
      }
    }
  }
  for (const id of ended) open.delete(id);
  return open;
}

function sessionLogs(entries) {
  const first = Date.parse(entries.find((entry) => entry.timestamp)?.timestamp ?? "") || 0;
  const paths = new Set();
  for (const entry of entries) for (const text of texts(entry)) for (const [path] of text.matchAll(LOG_PATH)) paths.add(path);
  const open = [];
  for (const path of paths) {
    try {
      if (statSync(path).mtimeMs < first) continue;
      if (!/exit code/i.test(readFileSync(path, "utf8"))) open.push(path);
    } catch {
      // A log that is gone or unreadable says nothing about the run.
    }
  }
  return open;
}

function runStatusProblem(input) {
  const entries = readTranscript(input.transcript_path);
  if (!entries || entries.length === 0) return null;
  let start = -1;
  entries.forEach((entry, index) => {
    if (isPrompt(entry)) start = index;
  });
  if (start < 0) return null;
  const turn = entries.slice(start + 1);
  const prompt = texts(entries[start]).join("\n");
  const notified = [...prompt.matchAll(NOTIFICATION)].some(([, body]) => !["", "running"].includes(tag(body, "status")));
  let message = typeof input.last_assistant_message === "string" ? input.last_assistant_message : null;
  if (message === null) {
    const last = turn.filter((entry) => entry.type === "assistant" && blocks(entry).some((block) => block.type === "text")).at(-1);
    if (!last && turn.length === 0) return null;
    message = last ? blocks(last).filter((block) => block.type === "text").map((block) => block.text).join("\n") : "";
  }
  const tail = message.trim().split("\n").slice(-3).join("\n");
  const says = DONE_LINE.test(tail) ? "done" : RUNNING_LINE.test(tail) ? "running" : "none";
  const open = backgroundRuns(entries);
  const logs = sessionLogs(entries);
  const runs = [...open.values()].map((label) => `"${label}"`).join(", ");
  if (says === "done" && open.size > 0) {
    return `the last line says Fertig, but ${open.size} background run(s) of this session have not reported yet: ${runs}. ` +
      `Wait for their completion notification (or a Monitor until the log shows \`exit code:\`) and continue the run, or end with ⏳🟡 **Läuft noch:** <what>.`;
  }
  if (says === "done" && logs.length > 0) {
    return `the last line says Fertig, but the log(s) ${logs.join(", ")} have no \`exit code\` line: the run is still going or died ` +
      `(a suite a subagent started in the background dies with it). Check the log, rerun what died, and only then report its result.`;
  }
  if (notified && open.size === 0 && says !== "done") {
    return `this turn was opened by the completion notification of your own background work, and nothing of this session runs any more. ` +
      `The notification is the cue to continue the run (read the result, then the next step: status commit, MR, merge …), never an empty answer` +
      (says === "running" ? ` — and the line ⏳🟡 **Läuft noch** is stale. If something outside the session still runs (host pipeline, delegate), name it and stop again.` : `.`);
  }
  if (says === "none" && message.trim() !== "") {
    return `the message does not end with the run status line: ⏳🟡 **Läuft noch:** <what> ⚠️ nicht schließen` +
      (open.size > 0 ? ` (open: ${runs})` : ` or ✅🟢 **Fertig – nichts läuft mehr**`) + `.`;
  }
  return null;
}

const input = readInput();
if (input.stop_hook_active) process.exit(0);

const runProblem = runStatusProblem(input);
if (runProblem) {
  process.stderr.write(`gam-engineering (P-WS-9): ${runProblem}\n`);
  process.exit(2);
}

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
useFolder(root);
if (!existsSync(join(root, STATUS_FILE))) process.exit(0);

const branch = integrationBranch(root);
const merge = newestMerge(root, branch);
if (!merge) process.exit(0);
// Parallel sessions in worktrees (P-WS-13): only the folder that holds the integration branch, or the session whose own
// branch was just merged, owes the status; another session on its own work branch is not asked for a merge it did not make.
const current = git(root, ["branch", "--show-current"]);
if (current !== branch && git(root, ["rev-parse", "HEAD"]) !== git(root, ["rev-parse", `${merge.sha}^2`])) process.exit(0);
if (statusIsCurrent(root, merge)) process.exit(0);

const docs = STATUS_FILE.replace(/\/ROADMAP-DETAILS\.md$/, "");
process.stderr.write(
  `gam-engineering (P-ROAD-4): the newest merge on ${merge.ref} (${merge.sha.slice(0, 8)}) did not update the status. ` +
    `Update the position in ${docs}/ROADMAP-DETAILS.md (or your team/<handle>/STATUS.md), the stage in ` +
    `${docs}/ROADMAP.md, and close the issue — through an MR, since ${branch} takes no direct commits (P-GIT-1).\n`,
);
process.exit(2);
