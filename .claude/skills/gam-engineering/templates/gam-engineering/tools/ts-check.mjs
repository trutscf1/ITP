#!/usr/bin/env node
// The TypeScript checks of the local pipeline (pipeline-proposal PP-F-27 … PP-F-30; plan 2026-10-28-typescript-quality-stack).
// Usage: node gam-engineering/tools/ts-check.mjs <biome | tsc | vitest | audit | playwright | trivy-image> [severity list] [--cwd=<folder>]
// --cwd names the folder of the TypeScript part relative to the current folder (a monorepo, PP-F-32); without it, the
// current folder. The configuration is looked for there and the tool runs there.
// Each command first looks for the configuration its tool needs. A missing file exits with SKIP_EXIT and names the file, so
// the runner reports the check as 'not run' (PP-F-25); every other exit code is the tool's own.
import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export const SKIP_EXIT = 3;

const hasFile = (names, folderFiles) => names.find((name) => folderFiles.includes(name));
const CONFIG_EXTENSIONS = ["ts", "mts", "cts", "js", "mjs", "cjs"];
const configNames = (stem) => CONFIG_EXTENSIONS.map((extension) => `${stem}.${extension}`);

// folder files → { call } (argument list, run in order) or { missing } (the file that is not there), per command.
export function plan(command, folderFiles, severity = "HIGH,CRITICAL") {
  switch (command) {
    case "biome":
      return hasFile(["biome.json", "biome.jsonc"], folderFiles)
        ? { calls: [["npx", "biome", "check", "."]] }
        : { missing: "biome.json" };
    case "tsc":
      return folderFiles.includes("tsconfig.json") ? { calls: [["npx", "tsc", "--noEmit"]] } : { missing: "tsconfig.json" };
    case "vitest":
      return hasFile(configNames("vitest.config"), folderFiles)
        ? { calls: [["npx", "vitest", "run", "--coverage"]] }
        : { missing: "vitest.config.ts" };
    case "playwright":
      return hasFile(configNames("playwright.config"), folderFiles)
        ? { calls: [["npx", "playwright", "test"]] }
        : { missing: "playwright.config.ts" };
    case "audit":
      if (folderFiles.includes("pnpm-lock.yaml")) return { calls: [["pnpm", "audit"]] };
      if (folderFiles.includes("package-lock.json")) return { calls: [["npm", "audit"]] };
      return { missing: "pnpm-lock.yaml or package-lock.json" };
    case "trivy-image": {
      if (!folderFiles.includes("Dockerfile")) return { missing: "Dockerfile" };
      const tag = `gam-trivy-scan:${process.pid}`;
      return {
        calls: [["docker", "build", "-t", tag, "."], ["trivy", "image", "--severity", severity, "--exit-code", "1", tag]],
        cleanup: [["docker", "rmi", "-f", tag]],
      };
    }
    default:
      return null;
  }
}

function run(call, cwd) {
  // npx, npm, and pnpm are .cmd files on Windows and need the shell to be found.
  return spawnSync(call[0], call.slice(1), { cwd, stdio: "inherit", shell: process.platform === "win32" }).status ?? 1;
}

export function main(args) {
  const cwd = args.find((arg) => arg.startsWith("--cwd="))?.slice("--cwd=".length) || ".";
  const [command, severity] = args.filter((arg) => !arg.startsWith("--cwd="));
  let folderFiles;
  try {
    folderFiles = readdirSync(cwd);
  } catch {
    console.log(`not run: folder ${cwd} is missing; correct cwd in gam-engineering/pipeline.json`);
    return SKIP_EXIT;
  }
  const step = plan(command, folderFiles, severity);
  if (!step) {
    console.error("usage: node ts-check.mjs <biome | tsc | vitest | audit | playwright | trivy-image> [severity list] [--cwd=<folder>]");
    return 2;
  }
  if (step.missing) {
    console.log(`not run: ${step.missing} is missing; /gam-engineering pipeline offers to create it`);
    return SKIP_EXIT;
  }
  let code = 0;
  try {
    for (const call of step.calls) {
      code = run(call, cwd);
      if (code !== 0) break;
    }
  } finally {
    // The throwaway image is removed whatever the scan found (Q274).
    for (const call of step.cleanup ?? []) run(call, cwd);
  }
  return code;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv.slice(2));
}
