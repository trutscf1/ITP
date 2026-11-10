#!/usr/bin/env node
// Own step after the SonarQube check `quality` (inbox P2, Q354–Q356, 2026-11-04): reads the newest quality-sonarqube-<date>_<time>.md
// of the run folder (env GAM_PIPELINE_RUN_FOLDER, else gam-engineering/reports/), prints the quality gate, the open issues per severity,
// the path of the file, and always the HIGH-risk issues (BLOCKER, HIGH, CRITICAL). Dependency-free; run by the local pipeline as
// `node ... sonar-summary.mjs`. Exit 0: the gate is OK. Exit 1: the gate is ERROR, so the pipeline is red (Q356). Exit 3: no report
// or no readable gate, the check could not run (reason on stdout), which is neither red nor green.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { REPORT_NAME } from "./sonar-check.mjs";

const NOT_RUN = 3;
const SEVERITY_ORDER = ["BLOCKER", "HIGH", "CRITICAL", "MEDIUM", "MAJOR", "LOW", "MINOR", "INFO"];
export const HIGH_RISK = ["BLOCKER", "HIGH", "CRITICAL"];

// The newest report of a folder: the names carry the local start time in a fixed width, so the last name in order is the newest.
export function newestReportName(names) {
  return names.filter((name) => REPORT_NAME.test(name)).sort().at(-1);
}

// Splits one Markdown table row at its unescaped pipes; `\|` inside a cell stays a pipe of the text.
export function splitRow(line) {
  const cells = line.trim().replace(/^\|/, "").replace(/\|$/, "").split(/(?<!\\)\|/);
  return cells.map((cell) => cell.trim().replaceAll("\\|", "|"));
}

// The Markdown of buildReport (sonar-check.mjs) → the gate, the issues per severity, and the issues themselves. Pure.
export function parseReport(markdown) {
  const gate = /quality gate \*\*([A-Za-z]+)\*\*/.exec(markdown)?.[1]?.toUpperCase() ?? "";
  const issues = [];
  const counts = new Map();
  let severity = "";
  for (const line of markdown.split(/\r?\n/)) {
    const heading = /^### ([A-Z]+) \((\d+)\)\s*$/.exec(line);
    if (heading) {
      severity = heading[1];
      counts.set(severity, Number(heading[2]));
      continue;
    }
    if (/^##\s/.test(line)) {
      severity = "";
      continue;
    }
    if (!severity || !line.startsWith("|") || /^\|\s*(File|-)/.test(line) || /^\|\s*---/.test(line)) continue;
    const [file, lineNumber, rule, message] = splitRow(line);
    issues.push({ severity, file, line: lineNumber, rule, message });
  }
  const bySeverity = [...counts.entries()].sort(([a], [b]) => SEVERITY_ORDER.indexOf(a) - SEVERITY_ORDER.indexOf(b));
  return { gate, counts: bySeverity, issues };
}

const cell = (text) => String(text ?? "").replaceAll("|", "\\|").replace(/\s+/g, " ");

// The text the pipeline prints: gate first, then the counts, the path, and the HIGH-risk table.
export function renderSummary(summary, path) {
  const total = summary.counts.reduce((sum, [, count]) => sum + count, 0);
  const counts = summary.counts.length ? summary.counts.map(([name, count]) => `${name} ${count}`).join(", ") : "none";
  const high = summary.issues.filter((issue) => HIGH_RISK.includes(issue.severity));
  const lines = [
    `sonarqube summary: ${path}`,
    `Quality gate: ${summary.gate}${summary.gate === "ERROR" ? " (red)" : ""}`,
    `Open issues: ${total} (${counts})`,
    `HIGH-risk issues (${HIGH_RISK.join(", ")}): ${high.length}`,
  ];
  if (high.length) {
    lines.push("", "| Severity | File | Line | Rule | Message |", "| --- | --- | --- | --- | --- |");
    for (const issue of high) lines.push(`| ${cell(issue.severity)} | ${cell(issue.file)} | ${cell(issue.line)} | ${cell(issue.rule)} | ${cell(issue.message)} |`);
  }
  return lines.join("\n");
}

// The exit code of a summary: OK → 0, ERROR → 1, anything else (no gate in the report) → 3.
export const exitCodeOf = (gate) => (gate === "OK" ? 0 : gate === "ERROR" ? 1 : NOT_RUN);

export function summarizeFolder(folder) {
  const name = existsSync(folder) ? newestReportName(readdirSync(folder)) : undefined;
  if (!name) return { code: NOT_RUN, text: `sonarqube not run: no quality-sonarqube report in ${folder} (the quality check writes it)` };
  const path = join(folder, name);
  const summary = parseReport(readFileSync(path, "utf8"));
  if (!summary.gate) return { code: NOT_RUN, text: `sonarqube not run: ${path} has no quality gate line` };
  return { code: exitCodeOf(summary.gate), text: renderSummary(summary, path) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const folder = process.env.GAM_PIPELINE_RUN_FOLDER || join(process.cwd(), "gam-engineering", "reports");
  const { code, text } = summarizeFolder(folder);
  console.log(text);
  process.exitCode = code;
}
