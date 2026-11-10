#!/usr/bin/env node
// prompt-export.mjs — copied into projects by gam-engineering (setup, migrate tools); edit the template in the skill.
// Exports the committer's own AI chat sessions for this repo into docs/prompts/<handle>/<tool>/ (P-TEAM-6,
// gam-ai-memory/plans/2026-11-10-prompt-export.md). Node only, no npm dependencies; SQLite sources need node:sqlite
// (Node 22.13 or later). A missing tool is skipped, a failing adapter only warns, and the command never blocks a commit.
//
//   node gam-engineering/tools/prompt-export.mjs export [--stage] [--home <dir>] [--out <dir>]
//   node gam-engineering/tools/prompt-export.mjs install-hook [--username <name>] [--platform <github|gitlab>]
//   node gam-engineering/tools/prompt-export.mjs check [--strict]
//   node gam-engineering/tools/prompt-export.mjs check-growth [--base <ref>]
//   node gam-engineering/tools/prompt-export.mjs next-q
//
// Mode: env.GAM_ENGINEERING_PROMPT_EXPORT in .claude/settings.json (or the environment): commit | local (default) | off.
// commit stages the export with --stage; local keeps it out of git through .gitignore; off exports nothing.
// An export never shrinks and never disappears: no file is deleted, and a file whose new build has fewer rounds than
// the existing one (the tool trimmed, compacted, or deleted the session) stays as it is.
// install-hook activates the hook in this clone and stores the GitHub/GitLab user name in the local git config; the
// commit hook itself never touches the network.
// check lists every commit author with their folder and newest export; only --strict exits 1 for a missing folder.
// check-growth only warns and always exits 0 (a custom pipeline check, never blocking): in mode commit it names every
// commit author in <base>..HEAD (without a merge base: the last commit) whose docs/prompts/<author>/ did not grow.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { appendFileSync, chmodSync, copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { homedir, platform, tmpdir, userInfo } from "node:os";
import { basename, dirname, isAbsolute, join, posix, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const MODES = ["commit", "local", "off"];
const OUT = "docs/prompts";
const HOOK_MARK = "# gam-engineering prompt-export";
const HOOK_LINE = `node --no-warnings gam-engineering/tools/prompt-export.mjs export --stage || true  ${HOOK_MARK}`;

// ---------- small helpers ----------

function git(args, cwd = process.cwd()) {
  const run = spawnSync("git", ["-c", "core.quotepath=false", ...args], { cwd, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  return run.status === 0 ? run.stdout.trim() : "";
}

const warn = (message) => process.stderr.write(`prompt-export: ${message}\n`);
const isWin = platform() === "win32";

// A path in one comparable form: absolute, forward slashes, no trailing slash, lower case on Windows. A WSL path and
// its Windows form are one path: /mnt/c/x is c:/x, and \\wsl.localhost\<distro>\x (or \\wsl$\<distro>\x) is /x.
export function normPath(path) {
  let value = String(path).replace(/\\/g, "/");
  value = value.replace(/^\/\/wsl(?:\.localhost|\$)\/[^/]+(?=\/|$)/i, "") || (/^\/\/wsl/i.test(value) ? "/" : value);
  value = value.replace(/^\/mnt\/([a-zA-Z])(?=\/|$)/, "$1:");
  value = value.startsWith("/") ? posix.normalize(value) : resolve(value).replace(/\\/g, "/");
  if (value.length > 1) value = value.replace(/\/+$/, "");
  if (isWin || /^[a-zA-Z]:(\/|$)/.test(value)) value = value.toLowerCase();
  return value;
}

const within = (roots, cwd) => {
  if (!cwd) return false;
  const value = normPath(cwd);
  return roots.some((root) => value === root || value.startsWith(`${root}/`));
};

// The local path of a workspace folder URI. A remote one (vscode-remote://wsl+Ubuntu/home/…, ssh-remote+<host>,
// dev-container+<hex>) yields its path part after the host, URL-decoded.
const fileUriToPath = (uri) => {
  const text = String(uri);
  if (/^vscode-remote:/i.test(text)) return decodeURIComponent(text.replace(/^vscode-remote:\/\/[^/]*/i, "") || "/");
  try {
    return fileURLToPath(text);
  } catch {
    return decodeURIComponent(text.replace(/^file:\/\/\/?/, ""));
  }
};

function walk(dir, accept, depth = 6) {
  const found = [];
  if (depth < 0 || !existsSync(dir)) return found;
  let entries = [];
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...walk(path, accept, depth - 1));
    else if (accept(entry.name)) found.push(path);
  }
  return found;
}

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const jsonLines = (path) =>
  readFileSync(path, "utf8")
    .split("\n")
    .filter((line) => line.trim())
    .flatMap((line) => {
      try {
        return [JSON.parse(line)];
      } catch {
        return [];
      }
    });

const toIso = (value) => {
  if (value === undefined || value === null || value === "") return "";
  const date = typeof value === "number" ? new Date(value < 1e12 ? value * 1000 : value) : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
};

// The name of an attached file, never its content.
const attachmentName = (part) => basename(String(part.title ?? part.name ?? part.filename ?? part.fileData?.fileUri ?? part.source?.name ?? "file").replace(/\\/g, "/"));

// Text of a content value: a string, an array of parts, or an object with text/value. An image becomes [Bild], an
// attached file [Datei: <name>]; their content is never written.
function textOf(content) {
  if (content === undefined || content === null) return "";
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map(textOf).filter(Boolean).join("\n\n");
  if (typeof content === "object") {
    if (["tool_use", "tool_result", "thinking", "redacted_thinking", "function_call", "function_call_output"].includes(content.type)) return "";
    if (["image", "input_image", "image_url"].includes(content.type) || /^image\//.test(content.inlineData?.mimeType ?? "")) return "[Bild]";
    if (["document", "file", "input_file"].includes(content.type) || content.inlineData || content.fileData) return `[Datei: ${attachmentName(content)}]`;
    if (typeof content.text === "string") return content.text;
    if (typeof content.value === "string") return content.value;
    if (content.value && typeof content.value === "object") return textOf(content.value);
    if (content.parts) return textOf(content.parts);
  }
  return "";
}

// Wrappers the tools inject into a user turn that are not the user's words.
const INJECTED = [
  /<system-reminder>[\s\S]*?<\/system-reminder>/g,
  /<ide_[a-z_]+>[\s\S]*?<\/ide_[a-z_]+>/g,
  /<local-command-std(?:out|err)>[\s\S]*?<\/local-command-std(?:out|err)>/g,
  /<environment_context>[\s\S]*?<\/environment_context>/g,
  /<user_instructions>[\s\S]*?<\/user_instructions>/g,
  /<command-message>[\s\S]*?<\/command-message>/g,
];
const clean = (text) =>
  INJECTED.reduce((value, pattern) => value.replace(pattern, ""), text)
    .replace(/<command-name>([\s\S]*?)<\/command-name>/g, "$1")
    .replace(/<command-args>([\s\S]*?)<\/command-args>/g, " $1")
    .trim();

// ---------- redaction ----------

const SECRET_PATTERNS = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
  /\bsk-(?:ant-|proj-)?[A-Za-z0-9_-]{20,}/g,
  /\bgh[pousr]_[A-Za-z0-9]{30,}/g,
  /\bgithub_pat_[A-Za-z0-9_]{20,}/g,
  // A GitLab token, with the part after ".01." of the current format, also when the chat shows only its start.
  /\bglpat-[A-Za-z0-9_.-]+/g,
  /\bxox[abprs]-[A-Za-z0-9-]{10,}/g,
  /\bAKIA[0-9A-Z]{16}\b/g,
  /\bAIza[0-9A-Za-z_-]{35}\b/g,
  /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g,
];

export function redact(text, home = homedir()) {
  let value = text;
  for (const pattern of SECRET_PATTERNS) value = value.replace(pattern, "[redacted]");
  value = value.replace(/\b((?:password|passwd|pwd|secret|token|api[_-]?key|client[_-]?secret)\s*[:=]\s*)(["']?)[^\s"']{4,}\2/gi, "$1[redacted]");
  value = value.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[email]");
  if (home) {
    for (const form of new Set([home, home.replace(/\\/g, "/"), home.replace(/\//g, "\\")])) {
      value = value.split(form).join("~");
    }
  }
  return value;
}

// ---------- adapters ----------
// Each adapter: (ctx) → [{ tool, sessionId, startedAt, title, messages: [{ role: "user" | "assistant", text, ts }] }].
// ctx: { roots (normalized repo and worktree paths), home, appData, env }.

const message = (role, text, ts) => ({ role, text: clean(textOf(text)), ts: toIso(ts) });
const keep = (messages) => messages.filter((item) => item.text);
// Every model a session used, in order of first use (a switch within a session names all of them).
const models = (list) => [...new Set(list.filter((name) => typeof name === "string" && name && !name.startsWith("<")))].join(", ");

// A pop-up round (Claude Code AskUserQuestion): every question with its options and the developer's answer verbatim —
// the record that replaced the Q&A log (P-GRILL-2).
export function questionRound(result, ts) {
  const answers = result.answers ?? {};
  const notes = result.annotations ?? {};
  const text = (result.questions ?? [])
    .map((item) => {
      const options = (item.options ?? []).map((option) => option.label).join(", ");
      const answer = answers[item.question];
      const note = notes[item.question]?.notes;
      return [`❓ ${item.question}`, options ? `(Optionen: ${options})` : "", `✅ ${answer === undefined ? "(no answer)" : `"${answer}"`}`, note ? `Notiz: ${note}` : ""].filter(Boolean).join("\n");
    })
    .join("\n\n");
  return { role: "question", text, ts: toIso(ts) };
}

// One line naming a tool call: its name and the command, path, or URL it acted on.
function toolSummary(use) {
  if (!use) return "tool call";
  const input = use.input ?? {};
  const target = input.command ?? input.file_path ?? input.path ?? input.url ?? input.pattern ?? input.description ?? "";
  return `${use.name}${target ? `: ${String(target).replace(/\s+/g, " ").slice(0, 200)}` : ""}`;
}

// Every interaction of the developer in one Claude Code user line besides typed prompts: pop-up answers, plan approval,
// a rejected tool call with its reason, and a permission the developer granted (not one granted by configuration).
function claudeInteractions(line, toolUses) {
  const found = [];
  const result = line.toolUseResult;
  const parts = Array.isArray(line.message.content) ? line.message.content.filter((part) => part.type === "tool_result") : [];
  if (result && typeof result === "object" && Array.isArray(result.questions)) found.push(questionRound(result, line.timestamp));
  for (const part of parts) {
    const use = toolUses.get(part.tool_use_id);
    const text = textOf(part.content) || (typeof part.content === "string" ? part.content : "");
    if (part.is_error && /^The user doesn't want to proceed/.test(text)) {
      const reason = /the user said:\s*([\s\S]*)$/i.exec(text)?.[1]?.trim();
      found.push({ role: "interaction", text: `⛔ Abgelehnt: ${toolSummary(use)}${reason ? `\nBegründung: ${reason}` : ""}`, ts: toIso(line.timestamp) });
    } else if (use?.name === "ExitPlanMode" && result && typeof result === "object" && typeof result.plan === "string") {
      found.push({ role: "interaction", text: `📋 Plan freigegeben:\n\n${result.plan}`, ts: toIso(line.timestamp) });
    }
  }
  const decision = line.permissionDecision;
  const granted = parts.length ? toolUses.get(parts[0].tool_use_id) : undefined;
  if (decision?.decision === "accept" && String(decision.source ?? "").startsWith("user_") && granted && !["AskUserQuestion", "ExitPlanMode"].includes(granted.name)) {
    const scope = decision.source === "user_permanent" ? "dauerhaft" : decision.grantScope === "session" ? "für die Sitzung" : "einmal";
    found.push({ role: "interaction", text: `🔐 Erlaubt (${scope}): ${toolSummary(toolUses.get(parts[0].tool_use_id))}`, ts: toIso(line.timestamp) });
  }
  return found;
}

// Claude Code: ~/.claude/projects/<path with every non-alphanumeric char as ->/*.jsonl, one event per line.
function claudeAdapter(ctx) {
  const base = ctx.env.CLAUDE_CONFIG_DIR && !ctx.fixedHome ? join(ctx.env.CLAUDE_CONFIG_DIR, "projects") : join(ctx.home, ".claude", "projects");
  if (!existsSync(base)) return [];
  const prefixes = ctx.roots.map((root) => root.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase());
  const sessions = [];
  for (const dir of readdirSync(base)) {
    const name = dir.toLowerCase();
    if (!prefixes.some((prefix) => name === prefix || name.startsWith(`${prefix}-`))) continue;
    for (const file of readdirSync(join(base, dir)).filter((item) => item.endsWith(".jsonl"))) {
      const lines = jsonLines(join(base, dir, file));
      const cwd = lines.find((line) => line.cwd)?.cwd;
      if (!within(ctx.roots, cwd)) continue;
      // A message typed while the agent works is stored as a queued_command attachment, not as a user line.
      const queued = (line) => line.type === "attachment" && line.attachment?.type === "queued_command" && line.attachment.origin?.kind !== "agent";
      const main = lines
        .filter((line) => !line.isSidechain && ((((line.type === "user" || line.type === "assistant") && !line.isMeta && line.message) || queued(line))))
        .map((line) => (queued(line) ? { ...line, type: "user", message: { role: "user", content: line.attachment.prompt } } : line));
      const toolUses = new Map();
      for (const line of main) {
        for (const part of Array.isArray(line.message.content) ? line.message.content : []) if (part.type === "tool_use") toolUses.set(part.id, part);
      }
      const messages = keep(main.flatMap((line) => [message(line.message.role ?? line.type, line.message.content, line.timestamp), ...claudeInteractions(line, toolUses)]));
      const model = models(main.filter((line) => line.type === "assistant").map((line) => line.message.model));
      sessions.push({ tool: "claude", sessionId: basename(file, ".jsonl"), startedAt: messages[0]?.ts ?? "", model, messages });
    }
  }
  return sessions;
}

// Codex CLI: ~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl; new format wraps items in { type, payload }.
function codexAdapter(ctx) {
  const base = join(ctx.env.CODEX_HOME && !ctx.fixedHome ? ctx.env.CODEX_HOME : join(ctx.home, ".codex"), "sessions");
  const sessions = [];
  for (const file of walk(base, (name) => name.endsWith(".jsonl"))) {
    const lines = jsonLines(file);
    const meta = lines.find((line) => line.type === "session_meta")?.payload ?? lines[0] ?? {};
    let cwd = meta.cwd;
    if (!cwd) {
      const env = lines.map((line) => JSON.stringify(line)).find((text) => text.includes("<cwd>"));
      cwd = env ? /<cwd>(.*?)<\/cwd>/.exec(env)?.[1]?.replace(/\\\\/g, "\\") : undefined;
    }
    if (!within(ctx.roots, cwd)) continue;
    const messages = keep(
      lines
        .map((line) => ({ item: line.payload ?? line, ts: line.timestamp }))
        .filter(({ item }) => item.type === "message" && (item.role === "user" || item.role === "assistant"))
        .map(({ item, ts }) => message(item.role, item.content, ts)),
    );
    const model = models(lines.filter((line) => line.type === "turn_context").map((line) => line.payload?.model));
    sessions.push({ tool: "codex", sessionId: meta.id ?? basename(file, ".jsonl"), startedAt: toIso(meta.timestamp) || messages[0]?.ts || "", model, messages });
  }
  return sessions;
}

// Gemini CLI: ~/.gemini/tmp/<sha256 of the project root>/chats/*.json (older: logs.json with user prompts only).
function geminiCliAdapter(ctx) {
  const base = join(ctx.home, ".gemini", "tmp");
  if (!existsSync(base)) return [];
  const hashes = new Set();
  for (const root of ctx.rawRoots) {
    for (const form of new Set([root, root.replace(/\//g, "\\"), root.replace(/\\/g, "/"), root.toLowerCase(), root.charAt(0).toLowerCase() + root.slice(1), root.charAt(0).toUpperCase() + root.slice(1)])) {
      hashes.add(createHash("sha256").update(form).digest("hex"));
    }
  }
  const sessions = [];
  for (const dir of readdirSync(base)) {
    const folder = join(base, dir);
    const marker = join(folder, ".project_root");
    const matches = hashes.has(dir) || (existsSync(marker) && within(ctx.roots, readFileSync(marker, "utf8").trim()));
    if (!matches) continue;
    for (const file of walk(join(folder, "chats"), (name) => name.endsWith(".json"), 1)) {
      const data = readJson(file);
      const messages = keep(
        (data.messages ?? []).filter((item) => ["user", "gemini", "model", "assistant"].includes(item.type ?? item.role)).map((item) => message((item.type ?? item.role) === "user" ? "user" : "assistant", item.content ?? item.parts, item.timestamp)),
      );
      const model = models((data.messages ?? []).map((item) => item.model));
      sessions.push({ tool: "gemini-cli", sessionId: data.sessionId ?? basename(file, ".json"), startedAt: toIso(data.startTime) || messages[0]?.ts || "", model, messages });
    }
    const logs = join(folder, "logs.json");
    if (existsSync(logs) && !existsSync(join(folder, "chats"))) {
      const bySession = new Map();
      for (const item of readJson(logs)) {
        if (item.type !== "user") continue;
        if (!bySession.has(item.sessionId)) bySession.set(item.sessionId, []);
        bySession.get(item.sessionId).push(message("user", item.message, item.timestamp));
      }
      for (const [sessionId, list] of bySession) sessions.push({ tool: "gemini-cli", sessionId, startedAt: list[0]?.ts ?? "", messages: keep(list) });
    }
  }
  return sessions;
}

// VS Code-family user folders (Code, Code - Insiders, VSCodium, Cursor, …) for this platform. Inside WSL the editor
// runs on Windows, so its folders under /mnt/c/Users/*/AppData/Roaming/ are searched as well.
function appFolders(ctx, app) {
  let own;
  if (ctx.appData) own = join(ctx.appData, app, "User");
  else if (platform() === "darwin") own = join(ctx.home, "Library", "Application Support", app, "User");
  else own = join(ctx.env.XDG_CONFIG_HOME && !ctx.fixedHome ? ctx.env.XDG_CONFIG_HOME : join(ctx.home, ".config"), app, "User");
  const found = [own];
  if (ctx.env.WSL_DISTRO_NAME && !ctx.fixedHome && existsSync("/mnt/c/Users")) {
    for (const user of readdirSync("/mnt/c/Users")) found.push(join("/mnt/c/Users", user, "AppData", "Roaming", app, "User"));
  }
  return found;
}

// workspaceStorage folders whose workspace.json folder (local or remote URI) lies inside the repo.
function workspaceFolders(ctx, app) {
  return appFolders(ctx, app).flatMap((user) => {
    const base = join(user, "workspaceStorage");
    if (!existsSync(base)) return [];
    return readdirSync(base)
      .map((dir) => join(base, dir))
      .filter((dir) => {
        try {
          const folder = readJson(join(dir, "workspace.json")).folder;
          return folder && within(ctx.roots, fileUriToPath(folder));
        } catch {
          return false;
        }
      });
  });
}

// Replays a VS Code chat session log: kind 0 sets the root, 1 sets the value at path k, 2 appends v to the array at k
// (with i: truncates to i first), 3 deletes the key at k.
export function replayChatLog(lines) {
  let root = {};
  for (const op of lines) {
    if (op.kind === 0) {
      root = op.v;
      continue;
    }
    const path = op.k ?? [];
    if (!path.length) continue;
    let node = root;
    for (const key of path.slice(0, -1)) {
      if (node[key] === undefined || node[key] === null) node[key] = {};
      node = node[key];
    }
    const last = path[path.length - 1];
    if (op.kind === 1) node[last] = op.v;
    else if (op.kind === 2) {
      const list = Array.isArray(node[last]) ? node[last] : [];
      if (Number.isInteger(op.i)) list.length = Math.min(list.length, op.i);
      list.push(...(Array.isArray(op.v) ? op.v : [op.v]));
      node[last] = list;
    } else if (op.kind === 3) delete node[last];
  }
  return root;
}

// The assistant text of one VS Code chat request: the markdown parts of its response.
// An inline file reference becomes its file name; the empty fences around file edits are dropped.
const referenceName = (part) => {
  const target = part.inlineReference ?? {};
  const path = target.path ?? target.fsPath ?? target.uri?.path ?? target.location?.uri?.path ?? target.name ?? "";
  return path ? `\`${basename(String(path))}\`` : "";
};
const responseText = (response) =>
  (Array.isArray(response) ? response : response?.value ?? [])
    .map((part) => {
      if (!part) return "";
      if (part.kind === "inlineReference") return referenceName(part);
      if (part.kind === undefined || part.kind === "markdownContent") return textOf(part.content ?? part.value ?? part);
      return "";
    })
    .join("")
    .replace(/```[\w-]*\s*```/g, "")
    .replace(/\n{3,}/g, "\n\n");

// VS Code tool confirmation kinds that the developer decided: 0 denied, 3 allowed for the session or workspace, 4
// allowed by a click, 5 skipped (1 needed no confirmation, 2 was allowed by a setting).
const CONFIRMED_BY_USER = { 0: "⛔ Abgelehnt", 3: "🔐 Erlaubt (für die Sitzung)", 4: "🔐 Erlaubt", 5: "⏭ Übersprungen" };

// Every interaction of the developer in one Copilot request besides the typed prompt: answers to ask_questions (the
// question carousel), decided tool confirmations, and answered terminal or other elicitations.
function copilotInteractions(request) {
  const found = [];
  const parts = Array.isArray(request.response) ? request.response : request.response?.value ?? [];
  const results = request.result?.metadata?.toolCallResults ?? {};
  const calls = (request.result?.metadata?.toolCallRounds ?? []).flatMap((round) => round.toolCalls ?? []).filter((call) => call.name === "ask_questions");
  for (const call of calls) {
    let asked = [];
    let answers = {};
    try {
      asked = JSON.parse(call.arguments).questions ?? [];
      answers = JSON.parse(textOf(results[call.id]?.content ?? [])).answers ?? {};
    } catch {
      continue;
    }
    const text = asked
      .map((item) => {
        const answer = answers[item.header] ?? answers[item.question] ?? {};
        const given = answer.skipped ? "(übersprungen)" : [...(answer.selected ?? []), answer.freeText].filter(Boolean).map((value) => `"${value}"`).join(", ") || "(no answer)";
        return [`❓ ${item.header ? `${item.header}: ` : ""}${item.question}`, `(Optionen: ${(item.options ?? []).map((option) => option.label).join(", ")})`, `✅ ${given}`].join("\n");
      })
      .join("\n\n");
    if (text) found.push({ role: "question", text, ts: toIso(request.timestamp) });
  }
  for (const part of parts) {
    if (part?.kind === "toolInvocationSerialized" && CONFIRMED_BY_USER[part.isConfirmed?.type] && part.presentation !== "hidden") {
      const past = textOf(part.pastTenseMessage);
      const command = part.toolSpecificData?.commandLine?.original ?? part.toolSpecificData?.command;
      const what = command || (past && !past.startsWith("$(") ? past : "") || textOf(part.invocationMessage) || part.toolId || "tool call";
      found.push({ role: "interaction", text: `${CONFIRMED_BY_USER[part.isConfirmed.type]}: ${what.replace(/\[\]\(file:\/\/\/[^)]*\/([^/)]+)\)/g, "$1").slice(0, 300)}`, ts: "" });
    } else if (part?.kind === "elicitationSerialized" && part.state && part.state !== "pending") {
      found.push({ role: "interaction", text: `❔ ${textOf(part.title)} — ${part.state}${textOf(part.message) ? `\n${textOf(part.message).trim()}` : ""}`, ts: "" });
    }
  }
  return found;
}

// Attachments of a Copilot prompt as placeholders: an image becomes [Bild], a file [Datei: <name>].
const copilotAttachments = (request) =>
  (request.variableData?.variables ?? []).flatMap((variable) => {
    if (variable?.isImage || variable?.kind === "image") return ["[Bild]"];
    if (variable?.kind === "file" || variable?.isFile) return [`[Datei: ${attachmentName({ name: variable.name ?? variable.value?.path ?? variable.value?.fsPath })}]`];
    return [];
  });

const VSCODE_APPS = ["Code", "Code - Insiders", "VSCodium"];

function copilotVscodeAdapter(ctx) {
  const sessions = [];
  for (const app of VSCODE_APPS) {
    for (const folder of workspaceFolders(ctx, app)) {
      const dir = join(folder, "chatSessions");
      if (!existsSync(dir)) continue;
      for (const file of readdirSync(dir)) {
        const path = join(dir, file);
        const session = file.endsWith(".jsonl") ? replayChatLog(jsonLines(path)) : file.endsWith(".json") ? readJson(path) : null;
        if (!session) continue;
        const messages = keep(
          (session.requests ?? []).flatMap((request) => [
            message("user", [request.message?.text ?? request.message, ...copilotAttachments(request)], request.timestamp),
            ...copilotInteractions(request),
            message("assistant", responseText(request.response)),
          ]),
        );
        const model = models((session.requests ?? []).map((request) => request.modelId));
        sessions.push({ tool: "copilot-vscode", sessionId: session.sessionId ?? basename(file).replace(/\.jsonl?$/, ""), startedAt: toIso(session.creationDate) || messages[0]?.ts || "", title: session.customTitle, model, messages });
      }
    }
  }
  return sessions;
}

// GitHub Copilot CLI: ~/.copilot/session-state/** and history-session-state/** — JSONL events or JSON with chatMessages.
function copilotCliAdapter(ctx) {
  const base = join(ctx.home, ".copilot");
  const files = ["session-state", "history-session-state"].flatMap((dir) => walk(join(base, dir), (name) => name.endsWith(".jsonl") || name.endsWith(".json"), 3));
  const roleOf = (item) => {
    const type = String(item.type ?? item.role ?? "");
    if (/^user/.test(type) || item.role === "user") return "user";
    if (/^assistant/.test(type) || item.role === "assistant") return "assistant";
    return "";
  };
  const findCwd = (value, depth = 0) => {
    if (!value || typeof value !== "object" || depth > 4) return undefined;
    if (typeof value.cwd === "string") return value.cwd;
    for (const child of Object.values(value)) {
      const found = findCwd(child, depth + 1);
      if (found) return found;
    }
    return undefined;
  };
  const sessions = [];
  for (const file of files) {
    let items;
    let cwd;
    let sessionId = basename(file).replace(/\.jsonl?$/, "");
    if (file.endsWith(".jsonl")) {
      items = jsonLines(file);
      cwd = items.map((item) => findCwd(item)).find(Boolean);
    } else {
      const data = readJson(file);
      items = data.chatMessages ?? data.messages ?? [];
      cwd = findCwd(data);
      sessionId = data.sessionId ?? sessionId;
    }
    if (basename(file) === "events.jsonl") sessionId = basename(dirname(file));
    if (!within(ctx.roots, cwd)) continue;
    const messages = keep(
      items
        .filter((item) => roleOf(item)).map((item) => message(roleOf(item), item.data?.content ?? item.content ?? item.text, item.timestamp ?? item.data?.timestamp)),
    );
    sessions.push({ tool: "copilot-cli", sessionId, startedAt: messages[0]?.ts ?? "", messages });
  }
  return sessions;
}

// Reads rows of a VS Code-family state.vscdb (SQLite) from a temporary copy, so a running editor's lock does not matter.
async function readVscdb(path, sql, params = []) {
  let sqlite;
  try {
    sqlite = await import("node:sqlite");
  } catch {
    throw new Error("reading SQLite needs Node 22.13 or later (node:sqlite)");
  }
  const temp = mkdtempSync(join(tmpdir(), "prompt-export-"));
  try {
    const copy = join(temp, "state.vscdb");
    copyFileSync(path, copy);
    if (existsSync(`${path}-wal`)) copyFileSync(`${path}-wal`, `${copy}-wal`);
    const db = new sqlite.DatabaseSync(copy, { readOnly: true });
    try {
      return db.prepare(sql).all(...params);
    } finally {
      db.close();
    }
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
}

const parseValue = (value) => {
  try {
    return JSON.parse(typeof value === "string" ? value : Buffer.from(value).toString("utf8"));
  } catch {
    return null;
  }
};

// Cursor: chat tabs in the workspace state.vscdb (ItemTable), composer sessions in the global state.vscdb (cursorDiskKV).
async function cursorAdapter(ctx) {
  const sessions = [];
  const folders = workspaceFolders(ctx, "Cursor").filter((dir) => existsSync(join(dir, "state.vscdb")));
  for (const folder of folders) {
    const globalDb = join(dirname(dirname(folder)), "globalStorage", "state.vscdb");
    const rows = await readVscdb(join(folder, "state.vscdb"), "SELECT key, value FROM ItemTable WHERE key IN ('workbench.panel.aichat.view.aichat.chatdata', 'composer.composerData')");
    for (const row of rows) {
      const data = parseValue(row.value);
      if (!data) continue;
      for (const tab of data.tabs ?? []) {
        const messages = keep((tab.bubbles ?? []).map((bubble) => message(bubble.type === "user" ? "user" : "assistant", bubble.text ?? bubble.rawText, bubble.timestamp ?? tab.lastSendTime)));
        sessions.push({ tool: "cursor", sessionId: tab.tabId, startedAt: messages[0]?.ts || toIso(tab.lastSendTime), title: tab.chatTitle, messages });
      }
      for (const composer of data.allComposers ?? []) {
        if (!existsSync(globalDb)) continue;
        const [entry] = await readVscdb(globalDb, "SELECT value FROM cursorDiskKV WHERE key = ?", [`composerData:${composer.composerId}`]);
        const detail = entry ? parseValue(entry.value) : null;
        let bubbles = detail?.conversation ?? [];
        if (!bubbles.length && detail?.fullConversationHeadersOnly?.length) {
          const keys = detail.fullConversationHeadersOnly.map((header) => `bubbleId:${composer.composerId}:${header.bubbleId}`);
          const found = await readVscdb(globalDb, `SELECT key, value FROM cursorDiskKV WHERE key IN (${keys.map(() => "?").join(",")})`, keys);
          const byKey = new Map(found.map((item) => [item.key, parseValue(item.value)]));
          bubbles = keys.map((key) => byKey.get(key)).filter(Boolean);
        }
        const messages = keep(bubbles.map((bubble) => message(bubble.type === 1 || bubble.type === "user" ? "user" : "assistant", bubble.text ?? bubble.rawText, bubble.createdAt ?? bubble.timestamp)));
        sessions.push({ tool: "cursor", sessionId: composer.composerId, startedAt: toIso(composer.createdAt) || messages[0]?.ts || "", title: composer.name, messages });
      }
    }
  }
  return sessions;
}

// Gemini in the IDE: Gemini Code Assist keeps its chat in the workspace state.vscdb of VS Code; Antigravity keeps its
// conversations encrypted (~/.gemini/antigravity/conversations/*.pb), which no tool can read — it is named, not exported.
async function geminiIdeAdapter(ctx) {
  const sessions = [];
  if (existsSync(join(ctx.home, ".gemini", "antigravity", "conversations"))) {
    warn("Antigravity stores its conversations encrypted; they cannot be exported (copy important prompts by hand)");
  }
  for (const app of VSCODE_APPS) {
    for (const folder of workspaceFolders(ctx, app).filter((dir) => existsSync(join(dir, "state.vscdb")))) {
      const rows = await readVscdb(join(folder, "state.vscdb"), "SELECT key, value FROM ItemTable WHERE key LIKE '%gemini%' OR key LIKE '%cloudcode%'");
      for (const row of rows) {
        const data = parseValue(row.value);
        const threads = Array.isArray(data) ? data : data?.threads ?? data?.conversations ?? data?.chats ?? (data?.messages ? [data] : []);
        threads.forEach((thread, index) => {
          const list = thread?.messages ?? thread?.history ?? thread?.turns ?? [];
          if (!Array.isArray(list)) return;
          const messages = keep(
            list.map((item) => {
              const who = String(item.role ?? item.author ?? item.type ?? item.entity ?? "").toLowerCase();
              return message(who.includes("user") || who === "human" ? "user" : "assistant", item.content ?? item.text ?? item.parts ?? item.markdown, item.timestamp ?? item.createTime);
            }),
          );
          if (messages.length) sessions.push({ tool: "gemini-ide", sessionId: thread.id ?? thread.threadId ?? `${basename(folder)}-${index}`, startedAt: messages[0]?.ts ?? "", title: thread.title, messages });
        });
      }
    }
  }
  return sessions;
}

// Aider: .aider.chat.history.md in the repo root. "# aider chat started at <time>" opens a session, "#### " lines are
// the prompt, "> " lines are tool messages and stay out, the other text is the answer.
export function parseAider(text) {
  const sessions = [];
  let session = null;
  let role = "";
  let buffer = [];
  const flush = () => {
    if (session && buffer.join("\n").trim()) session.messages.push(message(role, buffer.join("\n").trim(), role === "user" ? session.startedAt : ""));
    buffer = [];
  };
  for (const line of text.split(/\r?\n/)) {
    const start = /^# aider chat started at (.+)$/.exec(line);
    if (start) {
      flush();
      session = { tool: "aider", sessionId: `aider-${start[1].trim().replace(/[^0-9]/g, "").slice(0, 14)}`, startedAt: toIso(start[1].trim().replace(" ", "T")), messages: [] };
      sessions.push(session);
      role = "";
      continue;
    }
    if (!session) continue;
    if (line.startsWith("#### ")) {
      if (role !== "user") flush();
      role = "user";
      buffer.push(line.slice(5));
    } else if (!line.startsWith(">")) {
      if (role === "user" && line.trim() === "") continue;
      if (role !== "assistant") flush();
      role = "assistant";
      buffer.push(line);
    }
  }
  flush();
  return sessions.map((item) => ({ ...item, messages: keep(item.messages) }));
}

function aiderAdapter(ctx) {
  return ctx.rawRoots.flatMap((root) => {
    const file = join(root, ".aider.chat.history.md");
    return existsSync(file) ? parseAider(readFileSync(file, "utf8")) : [];
  });
}

// OpenCode (best effort): ~/.local/share/opencode/ keeps JSON files under storage/ (session/<project>/<id>.json,
// message/<session>/<id>.json, part/<message>/<id>.json) or, in newer versions, one SQLite database.
async function opencodeAdapter(ctx) {
  const base = join(ctx.env.XDG_DATA_HOME && !ctx.fixedHome ? ctx.env.XDG_DATA_HOME : join(ctx.home, ".local", "share"), "opencode");
  if (!existsSync(base)) return [];
  const toSession = (info, list) => {
    const messages = keep(list.sort((a, b) => (a.time ?? 0) - (b.time ?? 0)).map((item) => message(item.role === "user" ? "user" : "assistant", item.parts, item.time)));
    return { tool: "opencode", sessionId: info.id, startedAt: toIso(info.time?.created ?? info.time_created) || messages[0]?.ts || "", title: info.title, model: models(list.map((item) => item.model)), messages };
  };
  const textParts = (parts) => parts.filter((part) => part?.type === "text" && !part.synthetic).map((part) => part.text);
  const storage = join(base, "storage");
  const sessions = [];
  if (existsSync(join(storage, "session"))) {
    for (const file of walk(join(storage, "session"), (name) => name.endsWith(".json"), 2)) {
      const info = readJson(file);
      if (!info.id || !within(ctx.roots, info.directory)) continue;
      const list = walk(join(storage, "message", info.id), (name) => name.endsWith(".json"), 0).map((path) => {
        const item = readJson(path);
        const parts = walk(join(storage, "part", item.id), (name) => name.endsWith(".json"), 0).map(readJson);
        return { role: item.role, time: item.time?.created, model: item.modelID, parts: textParts(parts) };
      });
      sessions.push(toSession(info, list));
    }
    return sessions;
  }
  const db = walk(base, (name) => name.endsWith(".db"), 1)[0];
  if (!db) return sessions;
  const tables = (await readVscdb(db, "SELECT name FROM sqlite_master WHERE type = 'table'")).map((row) => row.name);
  if (!["session", "message", "part"].every((name) => tables.includes(name))) throw new Error("unknown OpenCode database layout");
  const data = (row) => ({ ...row, ...(parseValue(row.data) ?? {}) });
  const parts = (await readVscdb(db, "SELECT * FROM part")).map(data);
  const messages = (await readVscdb(db, "SELECT * FROM message")).map(data);
  for (const info of (await readVscdb(db, "SELECT * FROM session")).map(data)) {
    if (!within(ctx.roots, info.directory)) continue;
    const list = messages
      .filter((item) => (item.session_id ?? item.sessionID) === info.id)
      .map((item) => ({ role: item.role, time: item.time?.created ?? item.time_created, model: item.modelID, parts: textParts(parts.filter((part) => (part.message_id ?? part.messageID) === item.id)) }));
    sessions.push(toSession(info, list));
  }
  return sessions;
}

// Tools whose chats cannot be read: they are named once, never exported; the agent logs those chats by hand in
// docs/prompts/<handle>/manual/.
function noticeAdapter(ctx) {
  if (existsSync(join(ctx.home, ".codeium", "windsurf", "cascade"))) warn("Windsurf stores its Cascade chats unreadably; they are not exported (log them in docs/prompts/<handle>/manual/)");
  const jetbrains = [join(ctx.home, ".config", "github-copilot"), ctx.env.LOCALAPPDATA && !ctx.fixedHome ? join(ctx.env.LOCALAPPDATA, "github-copilot") : join(ctx.home, "AppData", "Local", "github-copilot")];
  const chats = jetbrains.some((dir) => existsSync(dir) && readdirSync(dir, { withFileTypes: true }).some((entry) => entry.isDirectory() && walk(join(dir, entry.name), () => true, 2).some((path) => /chat/i.test(path))));
  if (chats) warn("GitHub Copilot in JetBrains stores its chats in a binary database; they are not exported (log them in docs/prompts/<handle>/manual/)");
  const remote = !ctx.env.WSL_DISTRO_NAME && ["REMOTE_CONTAINERS", "CODESPACES", "DEVCONTAINER", "SSH_CONNECTION", "SSH_CLIENT"].some((key) => ctx.env[key]);
  if (remote && !ctx.fixedHome) warn("editor storage not reachable (remote session)");
  return [];
}

export const ADAPTERS = {
  claude: claudeAdapter,
  codex: codexAdapter,
  "gemini-cli": geminiCliAdapter,
  "gemini-ide": geminiIdeAdapter,
  "copilot-vscode": copilotVscodeAdapter,
  "copilot-cli": copilotCliAdapter,
  cursor: cursorAdapter,
  aider: aiderAdapter,
  opencode: opencodeAdapter,
  notices: noticeAdapter,
};

// ---------- core ----------

export function readMode(repo, env = process.env) {
  let value = env.GAM_ENGINEERING_PROMPT_EXPORT;
  if (!value) {
    try {
      value = readJson(join(repo, ".claude", "settings.json")).env?.GAM_ENGINEERING_PROMPT_EXPORT;
    } catch {
      value = undefined;
    }
  }
  return MODES.includes(value) ? value : "local";
}

export const slug = (value) =>
  String(value || "unknown")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "unknown";

// A fence longer than any backtick run in the text, so chat content never breaks the Markdown (and markdownlint
// ignores it).
function fenced(text) {
  const longest = Math.max(2, ...[...text.matchAll(/`+/g)].map((match) => match[0].length));
  const fence = "`".repeat(longest + 1);
  return `${fence}text\n${text}\n${fence}`;
}

// The number of rounds (prompts) of an export file: its "Runden" line, or for an older file its prompt headings.
export function roundsOf(text) {
  const line = /^- Runden: (\d+)$/m.exec(text);
  return line ? Number(line[1]) : (text.match(/^## \d+\. Prompt\b/gm) ?? []).length;
}

// meta: { author, username: { platform, name } } for the file head.
export function toMarkdown(session, home, meta = {}) {
  const first = session.messages.find((item) => item.role === "user")?.text ?? "";
  const title = redact((session.title || first).replace(/\s+/g, " ").trim().slice(0, 80), home).replace(/[#`*_<>[\]]/g, "").replace(/\s+/g, " ").trim() || session.sessionId;
  const lines = [`# ${title}`, "", `- Tool: ${session.tool}`];
  if (session.model) lines.push(`- Model: ${session.model}`);
  lines.push(`- Session: ${session.sessionId}`);
  if (session.startedAt) lines.push(`- Started: ${session.startedAt}`);
  if (meta.author) lines.push(`- Author: ${meta.author}`);
  if (meta.username?.name) lines.push(`- Username: ${meta.username.platform ? `${meta.username.platform}: ` : ""}${meta.username.name}`);
  lines.push(`- Runden: ${session.messages.filter((item) => item.role === "user").length}`);
  let turn = 0;
  for (const item of session.messages) {
    if (item.role === "user") turn += 1;
    const heading = { user: `## ${turn}. Prompt`, question: `### ${turn}. Questions`, interaction: `### ${turn}. Interaction` }[item.role] ?? `### ${turn}. Answer`;
    lines.push("", item.ts ? `${heading} (${item.ts})` : heading, "", fenced(redact(item.text, home)));
  }
  return `${lines.join("\n")}\n`;
}

const repoRoots = (repo) => {
  const raw = [repo];
  for (const line of git(["worktree", "list", "--porcelain"], repo).split("\n")) {
    if (line.startsWith("worktree ")) raw.push(line.slice(9));
  }
  const unique = [...new Set(raw.map((path) => resolve(path)))];
  return { rawRoots: unique, roots: [...new Set(unique.map(normPath))] };
};

function ensureIgnored(repo) {
  const file = join(repo, ".gitignore");
  const current = existsSync(file) ? readFileSync(file, "utf8") : "";
  if (current.split(/\r?\n/).some((line) => ["/docs/prompts/", "docs/prompts/", "/docs/prompts", "docs/prompts"].includes(line.trim()))) return;
  appendFileSync(file, `${current && !current.endsWith("\n") ? "\n" : ""}# AI chat export, kept local (gam-engineering prompt-export)\n/docs/prompts/\n`);
}

// The pseudonymous handle of CLAUDE.local.md (P-TEAM-2) names the folder; without one, git user.name does.
function handleOf(repo) {
  try {
    return /Developer handle:\s*`?([^`\s]+)/.exec(readFileSync(join(repo, "CLAUDE.local.md"), "utf8"))?.[1];
  } catch {
    return undefined;
  }
}

const osUser = (env) => {
  try {
    return userInfo().username;
  } catch {
    return env.USER || env.USERNAME || "";
  }
};

// The GitHub/GitLab user name install-hook stored in the local git config (never committed by git itself).
const usernameOf = (repo) => ({ name: git(["config", "prompt-export.username"], repo), platform: git(["config", "prompt-export.platform"], repo) });

// The developer's folder under docs/prompts/: the handle of CLAUDE.local.md (P-TEAM-2), else git user.name, else the
// operating-system user. When owner.json there names another user name, two people share the name and this one gets
// <name>-<username>. The folder's owner.json records { name, platform, username }.
export function ownerFolder(repo, out, env = process.env) {
  const author = handleOf(repo) || git(["config", "user.name"], repo) || osUser(env);
  const name = slug(author);
  const username = usernameOf(repo);
  let folder = name;
  const ownerFile = (dir) => join(resolve(repo, out), dir, "owner.json");
  try {
    const owner = readJson(ownerFile(name));
    if (owner.username && username.name && owner.username !== username.name) folder = `${name}-${slug(username.name)}`;
  } catch {
    // no owner.json yet: the folder is free
  }
  const owner = { name, platform: username.platform || "", username: username.name || "" };
  return { folder, author, username, owner, ownerFile: ownerFile(folder) };
}

function writeOwner(info) {
  const text = `${JSON.stringify(info.owner, null, 2)}\n`;
  if (existsSync(info.ownerFile)) {
    try {
      const current = readJson(info.ownerFile);
      if (current.username && !info.owner.username) return;
      if (readFileSync(info.ownerFile, "utf8") === text) return;
    } catch {
      // a broken owner.json is rewritten
    }
  }
  mkdirSync(dirname(info.ownerFile), { recursive: true });
  writeFileSync(info.ownerFile, text);
}

export async function exportPrompts({ repo, home, appData, out = OUT, stage = false, env = process.env, fixedHome = false }) {
  const mode = readMode(repo, env);
  if (mode === "off") return { mode, written: [], sessions: 0 };
  const info = ownerFolder(repo, out, env);
  const user = info.folder;
  const ctx = { ...repoRoots(repo), home, appData, env, fixedHome };
  const written = [];
  let count = 0;
  for (const [name, adapter] of Object.entries(ADAPTERS)) {
    let sessions = [];
    try {
      sessions = await adapter(ctx);
    } catch (error) {
      warn(`${name} skipped: ${error.message}`);
      continue;
    }
    for (const session of sessions) {
      if (!session.messages.some((item) => item.role === "user")) continue;
      count += 1;
      const date = (session.startedAt || new Date().toISOString()).slice(0, 10);
      const file = join(resolve(repo, out), user, session.tool, `${date}-${slug(session.sessionId).slice(0, 36)}.md`);
      const text = toMarkdown(session, home, { author: info.author, username: info.username });
      if (existsSync(file)) {
        const current = readFileSync(file, "utf8");
        // Never shrink: a tool that trimmed, compacted, or deleted the session leaves the fuller export in place.
        if (current === text || roundsOf(text) < roundsOf(current)) continue;
      }
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, text);
      written.push(file);
    }
  }
  if (count) writeOwner(info);
  if (mode === "local") ensureIgnored(repo);
  if (mode === "commit" && stage && existsSync(join(resolve(repo, out), user))) git(["add", "--", `${out}/${user}`], repo);
  return { mode, written, sessions: count, user };
}

// ---------- install-hook ----------

// A committed hook folder must keep LF: with core.autocrlf=true a clone would check it out with CRLF and sh fails on "#!/bin/sh\r".
function ensureHookEol(repo, hooksPath) {
  const rel = relative(resolve(repo), resolve(repo, hooksPath)).replaceAll("\\", "/");
  if (!rel || rel.startsWith("..") || isAbsolute(rel) || rel === ".git" || rel.startsWith(".git/")) return;
  const line = `${rel}/* text eol=lf`;
  const file = join(repo, ".gitattributes");
  const current = existsSync(file) ? readFileSync(file, "utf8") : "";
  if (current.split(/\r?\n/).some((entry) => entry.trim() === line)) return;
  appendFileSync(file, `${current && !current.endsWith("\n") ? "\n" : ""}${line}\n`);
}

// The hook must be executable on macOS and Linux: file mode 755 and, inside the repo, index mode 100755.
function ensureExecutable(repo, file) {
  let changed = false;
  try {
    if (!isWin && (statSync(file).mode & 0o111) !== 0o111) {
      chmodSync(file, 0o755);
      changed = true;
    }
  } catch {
    // a file system without modes
  }
  const rel = relative(resolve(repo), file).replaceAll("\\", "/");
  if (rel.startsWith("..") || isAbsolute(rel) || rel.startsWith(".git/")) return changed;
  if (!git(["ls-files", "-s", "--", rel], repo).startsWith("100755")) {
    git(["update-index", "--add", "--chmod=+x", "--", rel], repo);
    changed = true;
  }
  return changed;
}

export function installHook(repo) {
  let hooksPath = git(["config", "core.hooksPath"], repo);
  const gitDir = git(["rev-parse", "--git-dir"], repo);
  if (!gitDir) throw new Error("not a git repository");
  const legacy = join(resolve(repo, gitDir), "hooks", "pre-commit");
  let changed = false;
  if (!hooksPath) {
    if (existsSync(legacy)) hooksPath = join(resolve(repo, gitDir), "hooks");
    else {
      hooksPath = ".githooks";
      git(["config", "core.hooksPath", hooksPath], repo);
      changed = true;
    }
  }
  const attributes = join(repo, ".gitattributes");
  const before = existsSync(attributes) ? readFileSync(attributes, "utf8") : "";
  ensureHookEol(repo, hooksPath);
  if ((existsSync(attributes) ? readFileSync(attributes, "utf8") : "") !== before) changed = true;
  const file = join(resolve(repo, hooksPath), "pre-commit");
  mkdirSync(dirname(file), { recursive: true });
  const current = existsSync(file) ? readFileSync(file, "utf8") : "";
  if (!current.includes(HOOK_MARK)) {
    const head = current ? (current.endsWith("\n") ? current : `${current}\n`) : "#!/bin/sh\n";
    writeFileSync(file, `${head}${HOOK_LINE}\n`, { mode: 0o755 });
    changed = true;
  }
  if (ensureExecutable(repo, file)) changed = true;
  return { file, changed };
}

// ---------- user name on GitHub or GitLab ----------

const platformOf = (url) => (/github/i.test(url) ? "github" : /gitlab/i.test(url) ? "gitlab" : "");

// Runs a CLI for at most 5 seconds; a missing, logged-out, or offline CLI yields "".
function quietRun(command, args) {
  try {
    const result = spawnSync(command, args, { encoding: "utf8", timeout: 5000, windowsHide: true });
    return result.status === 0 ? result.stdout.trim() : "";
  } catch {
    return "";
  }
}

// Finds the developer's user name once and stores it only in the local git config: the platform from the origin URL,
// then gh or glab, then the noreply pattern of user.email. An explicit --username always wins.
export function ensureUsername(repo, { username, platform: given } = {}) {
  const current = usernameOf(repo);
  const platformName = given || current.platform || platformOf(git(["remote", "get-url", "origin"], repo));
  if (username) {
    git(["config", "prompt-export.username", username], repo);
    if (platformName) git(["config", "prompt-export.platform", platformName], repo);
    return { name: username, platform: platformName, found: "given" };
  }
  if (current.name && current.platform) return { ...current, found: "stored" };
  let name = "";
  if (platformName === "github") name = quietRun("gh", ["api", "user", "--jq", ".login"]);
  if (platformName === "gitlab") {
    try {
      name = JSON.parse(quietRun("glab", ["api", "user"]) || "{}").username ?? "";
    } catch {
      name = "";
    }
  }
  let found = platformName;
  if (!name) {
    const email = git(["config", "user.email"], repo);
    const github = /^\d+\+([^@]+)@users\.noreply\.github\.com$/i.exec(email);
    const gitlab = /^\d+-([^@]+)@users\.noreply\.[^@]+$/i.exec(email);
    if (github) [name, found] = [github[1], "github"];
    else if (gitlab) [name, found] = [gitlab[1], "gitlab"];
  }
  if (!name) return { name: "", platform: platformName, found: "" };
  git(["config", "prompt-export.username", name], repo);
  if (found) git(["config", "prompt-export.platform", found], repo);
  return { name, platform: found, found: "detected" };
}

// ---------- check ----------

// Every commit author of the repo with their folder under docs/prompts/ and the date of the newest export. An author
// without a folder is a hint (someone who uses no AI rightly has none); only --strict turns it into exit code 1.
export function checkAuthors(repo, { strict = false, out = OUT } = {}) {
  const base = resolve(repo, out);
  const folders = existsSync(base) ? readdirSync(base, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name) : [];
  const ownerName = (dir) => {
    try {
      return readJson(join(base, dir, "owner.json")).name;
    } catch {
      return undefined;
    }
  };
  const authors = [...new Set(git(["log", "--format=%an"], repo).split("\n").filter(Boolean))];
  const lines = [];
  let missing = 0;
  for (const author of authors) {
    const name = slug(author);
    const own = folders.filter((dir) => dir === name || dir.startsWith(`${name}-`) || ownerName(dir) === name);
    if (!own.length) {
      missing += 1;
      lines.push(`hint ${author}: no folder under ${out}/ (no AI used, or the hook is not active: node gam-engineering/tools/prompt-export.mjs install-hook)`);
      continue;
    }
    for (const dir of own) {
      const dates = walk(join(base, dir), (file) => /^\d{4}-\d{2}-\d{2}/.test(file) && file.endsWith(".md"), 3).map((path) => basename(path).slice(0, 10)).sort();
      lines.push(`ok ${author}: ${out}/${dir}/ (newest export ${dates.at(-1) ?? "none"})`);
    }
  }
  if (!authors.length) lines.push("no commits yet; nothing to check");
  return { status: strict && missing ? 1 : 0, lines };
}

// ---------- check-growth ----------

function growthBase(repo, named) {
  const refExists = (ref) => spawnSync("git", ["rev-parse", "--verify", "--quiet", ref], { cwd: repo }).status === 0;
  let trunk = false;
  try {
    trunk = readJson(join(repo, ".claude", "settings.json")).env?.GAM_ENGINEERING_BRANCHES === "trunk";
  } catch {
    trunk = false;
  }
  const candidates = trunk ? ["origin/main", "origin/master", "main", "master"] : ["origin/dev", "dev", "origin/main", "main", "master"];
  const ref = named || process.env.GAM_PROMPTS_BASE || candidates.find(refExists);
  return ref ? git(["merge-base", ref, "HEAD"], repo) : "";
}

export function checkGrowth(repo, named) {
  if (readMode(repo) !== "commit") return { status: 0, lines: ["prompt-export mode is not commit; nothing to check"] };
  if (!git(["rev-parse", "HEAD"], repo)) return { status: 0, lines: ["git or history not available; check not run (CI image needs git, e.g. node:24)"] };
  const base = growthBase(repo, named);
  const range = base ? [`${base}..HEAD`] : ["-1", "HEAD"];
  const log = git(["log", "--no-merges", "--format=@@%an", "--name-only", ...range], repo);
  const authors = new Map();
  let author = null;
  for (const line of log.split("\n")) {
    if (line.startsWith("@@")) {
      author = slug(line.slice(2));
      if (!authors.has(author)) authors.set(author, { commits: 0, grew: false });
      authors.get(author).commits += 1;
    } else if (author && line.startsWith(`${OUT}/`)) authors.get(author).grew = true;
  }
  const missing = [...authors].filter(([, value]) => !value.grew);
  const lines = missing.map(([name, value]) => `WARN ${name}: ${value.commits} commit(s) without a change in ${OUT}/ — is the pre-commit hook active (node gam-engineering/tools/prompt-export.mjs install-hook)?`);
  if (!missing.length) lines.push(base ? `ok: every author since ${base.slice(0, 8)} exported prompts` : "ok: the last commit exported prompts (no merge base found)");
  return { status: 0, lines };
}

// ---------- next-q ----------

// The next free question number: one counter for every round of the project (P-GRILL-2), from the archived Q&A logs
// (gam-ai-knowledge/qa-log.md, concepts/*.qa-log.md, a root qa-log.md) and the exported question rounds.
export function nextQuestion(repo, out = OUT) {
  const archives = ["gam-ai-knowledge", join("gam-ai-knowledge", "concepts"), "."].flatMap((dir) => {
    const path = join(repo, dir);
    return existsSync(path) ? readdirSync(path).filter((name) => name === "qa-log.md" || name.endsWith(".qa-log.md")).map((name) => join(path, name)) : [];
  });
  const exports = walk(resolve(repo, out), (name) => name.endsWith(".md"), 4);
  let highest = 0;
  for (const file of [...archives, ...exports]) {
    const text = readFileSync(file, "utf8");
    const rounds = exports.includes(file) ? [...text.matchAll(/^❓ Q(\d+)\b/gm)] : [...text.matchAll(/\bQ(\d+)\b/g)];
    for (const match of rounds) highest = Math.max(highest, Number(match[1]));
  }
  return highest + 1;
}

// ---------- CLI ----------

async function main(argv) {
  const [command = "export", ...rest] = argv;
  const flag = (name) => {
    const index = rest.indexOf(name);
    return index >= 0 ? rest[index + 1] : undefined;
  };
  const repo = git(["rev-parse", "--show-toplevel"]) || process.cwd();
  const fixedHome = Boolean(flag("--home"));
  const home = flag("--home") ?? homedir();
  const appData = flag("--appdata") ?? (isWin ? (fixedHome ? join(home, "AppData", "Roaming") : process.env.APPDATA ?? join(home, "AppData", "Roaming")) : undefined);
  const out = flag("--out") ?? OUT;
  if (command === "export") {
    const result = await exportPrompts({ repo, home, appData, out, stage: rest.includes("--stage"), fixedHome });
    if (result.mode !== "off") process.stdout.write(`prompt-export (${result.mode}): ${result.sessions} session(s), ${result.written.length} file(s) updated\n`);
    return 0;
  }
  if (command === "next-q") {
    // Export first (never staging), so the rounds of the running session count too.
    try {
      await exportPrompts({ repo, home, appData, out, stage: false, fixedHome });
    } catch (error) {
      warn(`export before counting failed: ${error.message}`);
    }
    process.stdout.write(`Q${nextQuestion(repo, out)}\n`);
    return 0;
  }
  if (command === "install-hook") {
    const { file, changed } = installHook(repo);
    const rel = relative(resolve(repo), file).replaceAll("\\", "/");
    const shown = rel.startsWith("..") || isAbsolute(rel) ? file.replaceAll("\\", "/") : rel;
    process.stdout.write(`prompt-export: hook ${changed ? "installed" : "already active"} (${shown})\n`);
    const user = ensureUsername(repo, { username: flag("--username"), platform: flag("--platform") });
    if (!user.name) process.stdout.write("prompt-export: username unknown\n");
    else if (user.found !== "stored") process.stdout.write(`prompt-export: username ${user.platform ? `${user.platform}: ` : ""}${user.name}\n`);
    return 0;
  }
  if (command === "check") {
    const { status, lines } = checkAuthors(repo, { strict: rest.includes("--strict"), out });
    process.stdout.write(`${lines.join("\n")}\n`);
    return status;
  }
  if (command === "check-growth") {
    const { status, lines } = checkGrowth(repo, flag("--base"));
    process.stdout.write(`${lines.join("\n")}\n`);
    return status;
  }
  process.stderr.write("usage: prompt-export.mjs export [--stage] | next-q | install-hook [--username <name>] [--platform <github|gitlab>] | check [--strict] | check-growth [--base <ref>]\n");
  return 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).then(
    (code) => process.exit(code),
    (error) => {
      warn(error.message);
      process.exit(["check", "check-growth", "install-hook"].includes(process.argv[2]) ? 1 : 0);
    },
  );
}
