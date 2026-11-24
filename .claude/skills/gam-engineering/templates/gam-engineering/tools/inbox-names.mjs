// PostToolUse hook of the gam-engineering skill (P-ROAD-3, short names of inbox entries).
// After a Read of the project's own inbox, every entry under ## Urgent or ## Open without a `- **Kurzname:**` line gets
// one: a short, unique, lowercase kebab-case name derived from its title. Names already written by hand are kept. The
// file is rewritten only when a name was added, keeps its line endings, and the hook stays silent otherwise.
// The project's own inbox is gam-ai-knowledge/next.md and the developer's own team/<handle>/next.md there (QC0013). A
// next.md in another folder or repository, and every inbox in a linked worktree (P-WS-13, QC0014), is left alone.
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const UMLAUTS = { ä: "ae", ö: "oe", ü: "ue", ß: "ss" };
const NAME_LINE = /^\s*-\s*\*\*Kurzname:\*\*\s*(\S.*)$/;
// The folders that hold the inbox: the knowledge folder and its former names of the transition period (P-DOC-10, P-DOC-11).
const INBOX_FOLDERS = ["gam-ai-knowledge", "gam-engineering/documentation", "humanengineering/documentation"];

// Lowercase ASCII words of a title, without the priority prefix ("P1 — ") and parenthetical notes; at most `max` words.
export function slugify(title, max = 3) {
  const words = title
    .replace(/^\s*P\d\s*[—–-]\s*/, "")
    .replace(/\([^)]*\)/g, " ")
    .toLowerCase()
    .replace(/[äöüß]/g, (c) => UMLAUTS[c])
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 1);
  return words.slice(0, max).join("-") || "entry";
}

// Adds a `- **Kurzname:**` line to every entry without one. Returns the new text and the names added (empty if none).
export function addShortNames(text) {
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  const lines = text.split(/\r?\n/);
  const taken = new Set();
  for (const line of lines) {
    const match = NAME_LINE.exec(line);
    if (match) taken.add(match[1].trim());
  }
  const added = [];
  let section = "";
  for (let i = 0; i < lines.length; i++) {
    if (/^## /.test(lines[i])) section = lines[i].replace(/^## /, "").trim();
    if (!/^### /.test(lines[i]) || !["Urgent", "Open"].includes(section)) continue;
    let end = i + 1;
    while (end < lines.length && !/^#{1,3} /.test(lines[end])) end++;
    if (lines.slice(i + 1, end).some((line) => NAME_LINE.test(line))) continue;
    const base = slugify(lines[i].replace(/^### /, ""));
    let name = base;
    for (let n = 2; taken.has(name); n++) name = `${base}-${n}`;
    taken.add(name);
    added.push(name);
    // The name goes before the first bullet of the entry, or right after its heading when it has none.
    const firstBullet = lines.slice(i + 1, end).findIndex((line) => /^\s*-\s/.test(line));
    const at = firstBullet === -1 ? i + 1 : i + 1 + firstBullet;
    lines.splice(at, 0, `- **Kurzname:** ${name}`);
    if (firstBullet === -1) lines.splice(at + 1, 0, "");
    i = at;
  }
  return { text: lines.join(eol), added };
}

// True when `file` is the project's own inbox under `root`: next.md in an inbox folder, or with a handle the developer's
// own team/<handle>/next.md there (P-TEAM-3). On Windows the case of the path does not matter. `pathApi` is node:path;
// the tests pass path.win32 or path.posix.
export function isProjectInbox(file, root, handle, pathApi = path) {
  const fold = (text) => (pathApi.sep === "\\" ? text.toLowerCase() : text);
  const relative = fold(pathApi.relative(pathApi.resolve(root), pathApi.resolve(file)).split(pathApi.sep).join("/"));
  const inboxes = INBOX_FOLDERS.flatMap((folder) => [`${folder}/next.md`, ...(handle ? [`${folder}/team/${handle}/next.md`] : [])]);
  return inboxes.some((inbox) => fold(inbox) === relative);
}

// The handle of `Developer handle: <handle>` in CLAUDE.local.md (P-TEAM-2), read as prompt-export.mjs reads it.
function readHandle(root) {
  try {
    return /Developer handle:\s*`?([^`\s]+)/.exec(readFileSync(path.join(root, "CLAUDE.local.md"), "utf8"))?.[1];
  } catch {
    return undefined;
  }
}

// True in a linked worktree, whose git folder differs from the common one: a session on a work branch there leaves the
// inbox to the merge (P-WS-13). Without git, or outside a repository, the checkout counts as the main folder. Git may
// print one folder absolute and the other relative, so both are resolved, and compared without case on Windows.
function isLinkedWorktree(root) {
  const run = spawnSync("git", ["rev-parse", "--git-dir", "--git-common-dir"], { cwd: root, encoding: "utf8" });
  const [gitDir, commonDir] = run.status === 0 ? run.stdout.split(/\r?\n/) : [];
  const full = (dir) => (path.sep === "\\" ? path.resolve(root, dir).toLowerCase() : path.resolve(root, dir));
  return Boolean(gitDir && commonDir) && full(gitDir) !== full(commonDir);
}

function readInput() {
  try {
    return JSON.parse(readFileSync(0, "utf8") || "{}");
  } catch {
    return {};
  }
}

// Run as a hook: the Read input names the file. Run by hand: node inbox-names.mjs <next.md>. Importing the module
// (the tests do) runs nothing and reads no stdin.
function runHook() {
  const byHand = process.argv[2];
  let file = byHand;
  if (byHand) {
    if (path.basename(byHand) !== "next.md") return;
  } else {
    const input = readInput();
    const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
    file = path.resolve(input.cwd || root, input.tool_input?.file_path || "");
    // Cheapest check first, since every Read runs this hook; git is asked only for the project's own inbox.
    if (path.basename(file).toLowerCase() !== "next.md" || !isProjectInbox(file, root, readHandle(root)) || isLinkedWorktree(root)) return;
  }
  try {
    const original = readFileSync(file, "utf8");
    const { text, added } = addShortNames(original);
    if (added.length > 0) {
      writeFileSync(file, text);
      process.stdout.write(
        JSON.stringify({
          hookSpecificOutput: {
            hookEventName: "PostToolUse",
            additionalContext: `gam-engineering (P-ROAD-3): short names added to the inbox entries: ${added.join(", ")}. Use them with /gam-engineering inbox <name>.`,
          },
        }),
      );
    }
  } catch {
    // An unreadable inbox is not the hook's business; the Read itself already reported it.
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runHook();
  process.exit(0);
}
