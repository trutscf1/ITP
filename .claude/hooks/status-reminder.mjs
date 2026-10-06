// Stop hook of the engineering-human skill (P-ROAD-4).
// Blocks the end of a turn once when the newest merge on dev left the status files untouched,
// so the agent updates ROADMAP-DETAILS.md / STATUS.md and ROADMAP.md. Never loops.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const STATUS_FILE = "documentation/ROADMAP-DETAILS.md";
const PATHSPECS = [STATUS_FILE, ":(glob)documentation/team/*/STATUS.md"];

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

function newestMerge(root) {
  let newest = null;
  for (const ref of ["dev", "origin/dev"]) {
    const [sha, time] = git(root, ["log", "-1", "--merges", "--format=%H %ct", ref, "--"]).split(" ");
    if (sha && (!newest || Number(time) > newest.time)) newest = { ref, sha, time: Number(time) };
  }
  return newest;
}

function statusIsCurrent(root, merge) {
  if (!git(root, ["ls-files", STATUS_FILE])) {
    // documentation/ is outside git: the status is applied right after the merge, so file times decide.
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
if (!existsSync(join(root, STATUS_FILE))) process.exit(0);

const merge = newestMerge(root);
if (!merge || statusIsCurrent(root, merge)) process.exit(0);

process.stderr.write(
  `engineering-human (P-ROAD-4): the newest merge on ${merge.ref} (${merge.sha.slice(0, 8)}) did not update the status. ` +
    "Update the position in documentation/ROADMAP-DETAILS.md (or your team/<handle>/STATUS.md), the stage in " +
    "documentation/ROADMAP.md, and close the issue — through an MR, since dev takes no direct commits (P-GIT-1).\n",
);
process.exit(2);
