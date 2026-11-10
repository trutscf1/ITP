#!/usr/bin/env node
// M8 SonarQube check (concept pipeline-proposal PP-F-24, PP-F-25, PP-F-52; Q376, Q377): the check holds no Sonar knowledge of its own.
// It runs the two scripts of the installed skill gam-sonar: scripts/scan.ps1 (scanner image tag, network, container, quality gate; owns the
// version) and scripts/export-report.ps1 (the report, written into this project's run folder). Dependency-free; run by the local pipeline as
// `node ... sonar-check.mjs scan`, with --version=<version> from the check's version (PP-F-41); without it, the next MINOR after the newest
// release tag, because SonarQube counts everything since the previous version as new code.
// The scripts are read from ~/.claude/skills/gam-sonar (env GAM_SONAR_DIR overrides it, used by the tests).
// Exit 0: the quality gate passed and the report is written. Exit 1: the scan, the gate, or the report failed.
// Exit 3: the check could not run (reason on stdout).
import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const NOT_RUN = 3;

const notRun = (reason) => {
  console.log(`sonarqube not run: ${reason}`);
  return NOT_RUN;
};

// The tags of the repo → the next MINOR after the newest v<major>.<minor>.<patch>, 0.1.0 without one.
export function nextMinor(tags) {
  const versions = tags
    .map((tag) => /^v(\d+)\.(\d+)\.(\d+)$/.exec(tag.trim()))
    .filter(Boolean)
    .map((match) => match.slice(1).map(Number))
    .sort((a, b) => b[0] - a[0] || b[1] - a[1] || b[2] - a[2]);
  return versions.length ? `${versions[0][0]}.${versions[0][1] + 1}.0` : "0.1.0";
}

const releaseVersion = () => {
  const run = spawnSync("git", ["tag", "--list", "v*"], { encoding: "utf8" });
  return nextMinor(run.status === 0 ? run.stdout.split(/\r?\n/) : []);
};

// KEY=value lines of .env.sonar → an object; comments and blank lines are skipped.
export function parseEnv(text) {
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
    if (match) env[match[1]] = match[2].replace(/^(["'])(.*)\1$/, "$2");
  }
  return env;
}

export const projectKeyOf = (properties) => /^\s*sonar\.projectKey\s*=\s*(.+?)\s*$/m.exec(properties)?.[1];

export const REPORTS_KEPT = 4;
export const REPORT_NAME = /^quality-sonarqube-\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.md$/;
const pad = (number) => String(number).padStart(2, "0");

// Local date and time → quality-sonarqube-<YYYY-MM-DD>_<HH-MM-SS>.md; the fixed width keeps the names in time order.
export function reportName(date = new Date()) {
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return `quality-sonarqube-${day}_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}.md`;
}

// The names of a folder that are reports of this check and older than the newest `keep`; other files are never listed.
export function reportsToRemove(names, keep = REPORTS_KEPT) {
  return names.filter((name) => REPORT_NAME.test(name)).sort().reverse().slice(keep);
}

// The scripts of the installed gam-sonar skill; the version is pinned there, not here.
export const gamSonarDir = () => process.env.GAM_SONAR_DIR || join(homedir(), ".claude", "skills", "gam-sonar");

export async function scan(cwd = process.cwd(), version = releaseVersion(), sonarDir = gamSonarDir()) {
  const scanScript = join(sonarDir, "scripts", "scan.ps1");
  const exportScript = join(sonarDir, "scripts", "export-report.ps1");
  if (!existsSync(scanScript) || !existsSync(exportScript)) {
    return notRun(`skill gam-sonar not found at ${sonarDir} (deploy it; the scan and the report come from its scripts)`);
  }
  // The scan prints its own reason when it cannot run (exit 3); its gate result is exit 0 or 1.
  const scanned = spawnSync("pwsh", ["-NoProfile", "-File", scanScript, "-ProjectDir", cwd, "-Version", version], { stdio: "inherit" });
  if (scanned.status === NOT_RUN) return NOT_RUN;
  // The report is written even when the gate failed: that is when its issues are needed.
  const folder = process.env.GAM_PIPELINE_RUN_FOLDER || join(cwd, "gam-engineering", "reports");
  mkdirSync(folder, { recursive: true });
  const path = join(folder, reportName());
  const exported = spawnSync("pwsh", ["-NoProfile", "-File", exportScript, "-ProjectDir", cwd, "-EnvFile", join(cwd, ".env.sonar"), "-OutFile", path], { stdio: "inherit" });
  if (exported.status === 0) {
    for (const name of reportsToRemove(readdirSync(folder))) rmSync(join(folder, name));
    console.log(`sonarqube report: ${path}`);
  } else {
    console.log(`sonarqube failed: no report (export-report.ps1 exit ${exported.status})`);
  }
  if (scanned.status !== 0) console.log("sonarqube failed: the scan or the quality gate; evaluate it with the skill gam-sonar");
  return scanned.status === 0 && exported.status === 0 ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const version = process.argv.find((arg) => arg.startsWith("--version="))?.slice("--version=".length);
  if (process.argv[2] === "scan") {
    process.exitCode = await scan(process.cwd(), version || releaseVersion());
  } else {
    console.error("usage: sonar-check.mjs scan [--version=<version>]");
    process.exitCode = 2;
  }
}
