// Stop hook of the gam-engineering skill (P-GIT-11).
// Blocks the end of a turn once per state when work is still open in git: uncommitted changes, commits not pushed,
// or a work branch not merged into the integration branch (dev, or main in trunk mode, P-GIT-9). The agent then
// checks what else is open and asks the developer with an AskUserQuestion pop-up. Never loops, never repeats for an
// unchanged state (a developer who answered "Later" is not nagged again on the next turn).
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { isAbsolute, join } from "node:path";

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

function projectEnv(root) {
  try {
    return JSON.parse(readFileSync(join(root, ".claude", "settings.json"), "utf8"))?.env ?? {};
  } catch {
    return {};
  }
}

const input = readInput();
if (input.stop_hook_active) process.exit(0);

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
if (git(root, ["rev-parse", "--is-inside-work-tree"]) !== "true") process.exit(0);

const branch = git(root, ["rev-parse", "--abbrev-ref", "HEAD"]);
if (!branch || branch === "HEAD") process.exit(0);
const env = projectEnv(root);
const integration = env.GAM_ENGINEERING_BRANCHES === "trunk" ? "main" : "dev";
// Under merge policy auto the agent merges without a pop-up (P-MR-4), so an unmerged branch alone is no reason to ask.
const mergeAsks = env.GAM_ENGINEERING_MERGE !== "auto";

const dirty = git(root, ["status", "--porcelain"]);
const hasUpstream = git(root, ["rev-parse", "--abbrev-ref", "@{u}"]) !== "";
const hasRemote = git(root, ["remote"]) !== "";
const unpushed = hasUpstream
  ? Number(git(root, ["rev-list", "--count", "@{u}..HEAD"]) || 0)
  : hasRemote ? Number(git(root, ["rev-list", "--count", "HEAD"]) || 0) : 0;
const unmerged =
  branch !== integration && git(root, ["rev-parse", "--verify", "-q", integration]) !== ""
    ? Number(git(root, ["rev-list", "--count", `${integration}..HEAD`]) || 0)
    : 0;

const open = [];
if (dirty) open.push(`${dirty.split("\n").length} uncommitted file(s) on ${branch} (commit)`);
if (unpushed) open.push(`${hasUpstream ? `${unpushed} commit(s) not pushed` : `branch ${branch} not on the remote`} (push)`);
if (unmerged && mergeAsks) open.push(`${unmerged} commit(s) of ${branch} not merged into ${integration} (merge)`);
if (open.length === 0) process.exit(0);

// One reminder per state: the fingerprint is kept in the git directory, so it is never committed.
const gitDir = git(root, ["rev-parse", "--git-dir"]);
const stateFile = join(isAbsolute(gitDir) ? gitDir : join(root, gitDir), "gam-open-work");
const fingerprint = createHash("sha1").update([branch, git(root, ["rev-parse", "HEAD"]), dirty, unpushed, mergeAsks ? unmerged : 0].join("\n")).digest("hex");
if (existsSync(stateFile) && readFileSync(stateFile, "utf8").trim() === fingerprint) process.exit(0);
try {
  writeFileSync(stateFile, `${fingerprint}\n`);
} catch {
  // Without a writable git directory the reminder simply repeats once per turn.
}

const check = `(inbox entries handled, status and docs updated, P-GIT-5 and P-ROAD-4; tests and pipeline green, P-MR-3)`;
// Under merge policy auto the developer has decided in advance: commit and push without a pop-up.
const action = mergeAsks
  ? `then ask the developer with an AskUserQuestion pop-up, never in chat: commit, push, or merge now, later, or not. ` +
    `A merge follows the merge policy (P-MR-4).`
  : `then commit and push without asking (merge policy auto, P-GIT-11); if the check fails, report what is missing instead.`;
process.stderr.write(
  `gam-engineering (P-GIT-11): work is open in git — ${open.join("; ")}. Before you stop, check what else is open ${check}, ${action}\n`,
);
process.exit(2);
