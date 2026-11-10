// PostToolUse hook of the gam-engineering skill (P-DES-10).
// Runs `biome check --write` on the file an agent has just written or edited, so line endings, formatting, and imports
// are right the moment the file exists, not only after the next lint run. Does nothing in a project without
// biome.json or biome.jsonc, for a file outside the project, or where Biome is not installed in node_modules; it never
// downloads Biome. Problems Biome cannot fix itself are handed back to the agent (exit code 2).
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";

function readInput() {
  try {
    return JSON.parse(readFileSync(0, "utf8") || "{}");
  } catch {
    return {};
  }
}

const input = readInput();
const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const file = input.tool_input?.file_path;
if (!file || !["biome.json", "biome.jsonc"].some((name) => existsSync(join(root, name)))) process.exit(0);

const path = relative(root, resolve(root, file));
if (!path || path.startsWith("..") || isAbsolute(path)) process.exit(0);

// The package's own launcher, started with this Node, so no shell and no .cmd shim is needed on Windows.
const biome = join(root, "node_modules", "@biomejs", "biome", "bin", "biome");
if (!existsSync(biome)) process.exit(0);

const run = spawnSync(
  process.execPath,
  [biome, "check", "--write", "--no-errors-on-unmatched", "--files-ignore-unknown=true", path],
  { cwd: root, encoding: "utf8" },
);
if (run.status !== 0) {
  process.stderr.write(`Biome still reports problems in ${path} after --write:\n${run.stdout ?? ""}${run.stderr ?? ""}`);
  process.exit(2);
}
