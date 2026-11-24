// The install line of a folder by the lock file in it. One module for two callers (plan 2026-11-14-worktree-isolation,
// A247): pipeline.mjs renders the install step of a CI job from it (render-ci), worktree-setup.mjs installs the
// dependencies of a new worktree with it. Node, no dependencies.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

// The install line of a Node job by the lock file in its folder: the catalog's `npm ci` stands for it, because npm ci
// fails without package-lock.json (schoolquiz 0.26.0). A folder without a lock file gets no install step. One line each,
// so it runs in the check's folder as a whole. These three are the ones a CI job renders.
export const NODE_INSTALL = {
  "package-lock.json": "npm ci",
  "pnpm-lock.yaml": "corepack enable && pnpm install --frozen-lockfile",
  "yarn.lock": "corepack enable && yarn install --immutable",
};
export const LOCK_FILES = Object.keys(NODE_INSTALL);
export const findLockFile = (repoRoot) => (cwd) => LOCK_FILES.find((name) => existsSync(join(repoRoot, cwd || "", name))) ?? "";

// A local install (worktree-setup.mjs) runs `corepack enable` only when the package manager is missing: it writes into
// the Node folder, which fails without write rights (EPERM on C:\Program Files\nodejs, EROFS in /nix/store) although
// pnpm or yarn is often on the PATH already (PowerFlow 2026-11-19, 2026-11-22). The CI line above stays as it is: in a
// CI container the Node folder is writable and the manager usually missing (QA0062).
const COREPACK_PREFIX = /^corepack enable && (pnpm|yarn) /;

export function onPath(name) {
  return spawnSync(name, ["--version"], { stdio: "ignore", shell: process.platform === "win32" }).status === 0;
}

// A command → the steps a local install runs: [{ command, manager? }], the corepack step carrying the manager it enables.
export function installSteps(command, has = onPath) {
  const match = COREPACK_PREFIX.exec(command);
  if (!match) return [{ command }];
  const rest = command.slice("corepack enable && ".length);
  return has(match[1]) ? [{ command: rest }] : [{ command: "corepack enable", manager: match[1] }, { command: rest }];
}

// What a new worktree also installs with (A247, A261): Bun, which the CI catalog does not render, and Python.
const BUN_INSTALL = { "bun.lock": "bun install --frozen-lockfile", "bun.lockb": "bun install --frozen-lockfile" };

// requirements.txt: a virtual environment in .venv and the venv's own pip, so nothing lands in the global Python.
export function venvInstall(platform = process.platform) {
  const python = platform === "win32" ? ".venv\\Scripts\\python.exe" : ".venv/bin/python";
  return `python -m venv .venv && ${python} -m pip install -r requirements.txt`;
}

// The Node lock files in the order of the first match, then Bun, then Python.
const NODE_LOCKS = [...LOCK_FILES, ...Object.keys(BUN_INSTALL)];
const PYTHON_LOCKS = ["uv.lock", "requirements.txt"];

// Folder → [{ lock, command }]: at most one Node line and one Python line, so a folder with package-lock.json and
// requirements.txt gets both; an empty list for a folder without a lock file.
export function detectInstall(folder, platform = process.platform) {
  const lineOf = {
    ...NODE_INSTALL,
    ...BUN_INSTALL,
    "uv.lock": "uv sync",
    "requirements.txt": venvInstall(platform),
  };
  return [NODE_LOCKS, PYTHON_LOCKS]
    .map((names) => names.find((name) => existsSync(join(folder, name))))
    .filter(Boolean)
    .map((lock) => ({ lock, command: lineOf[lock] }));
}
