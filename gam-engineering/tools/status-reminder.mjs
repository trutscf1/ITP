// Stop hook of the gam-engineering skill (P-ROAD-4).
// Blocks the end of a turn once when the newest merge on the integration branch (dev, or main in trunk mode,
// P-GIT-9) left the status files untouched,
// so the agent updates ROADMAP-DETAILS.md / STATUS.md and ROADMAP.md. Never loops.
// A merge whose commits all end in [no-req] is a pure chore without a story or stage: it needs no status.
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

function isChoreMerge(root, merge) {
  const subjects = git(root, ["log", "--format=%s", `${merge.sha}^1..${merge.sha}^2`]).split("\n").filter(Boolean);
  return subjects.length > 0 && subjects.every((subject) => subject.trimEnd().endsWith("[no-req]"));
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

const input = readInput();
if (input.stop_hook_active) process.exit(0);

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
useFolder(root);
if (!existsSync(join(root, STATUS_FILE))) process.exit(0);

const branch = integrationBranch(root);
const merge = newestMerge(root, branch);
if (!merge || statusIsCurrent(root, merge)) process.exit(0);

const docs = STATUS_FILE.replace(/\/ROADMAP-DETAILS\.md$/, "");
process.stderr.write(
  `gam-engineering (P-ROAD-4): the newest merge on ${merge.ref} (${merge.sha.slice(0, 8)}) did not update the status. ` +
    `Update the position in ${docs}/ROADMAP-DETAILS.md (or your team/<handle>/STATUS.md), the stage in ` +
    `${docs}/ROADMAP.md, and close the issue — through an MR, since ${branch} takes no direct commits (P-GIT-1).\n`,
);
process.exit(2);
