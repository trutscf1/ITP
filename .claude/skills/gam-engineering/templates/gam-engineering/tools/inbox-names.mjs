// PostToolUse hook of the gam-engineering skill (P-ROAD-3, short names of inbox entries).
// After a Read of an inbox file (next.md), every entry under ## Urgent or ## Open without a `- **Kurzname:**` line gets
// one: a short, unique, lowercase kebab-case name derived from its title. Names already written by hand are kept. The
// file is rewritten only when a name was added, keeps its line endings, and the hook stays silent otherwise.
import { readFileSync, writeFileSync } from "node:fs";
import { basename } from "node:path";
import { pathToFileURL } from "node:url";

const UMLAUTS = { ä: "ae", ö: "oe", ü: "ue", ß: "ss" };
const NAME_LINE = /^\s*-\s*\*\*Kurzname:\*\*\s*(\S.*)$/;

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
  const path = process.argv[2] || readInput().tool_input?.file_path || "";
  if (basename(path) !== "next.md") return;
  try {
    const original = readFileSync(path, "utf8");
    const { text, added } = addShortNames(original);
    if (added.length > 0) {
      writeFileSync(path, text);
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
