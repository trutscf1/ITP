// Configuration step of the observability stack (concept observability.md §16, M6; OBS-F-28,
// OBS-E-4). It runs once in the container `obs-config` before the stores and the dashboard tool
// start. It checks the nine variables of §8 ("Configuration of the observability stack"), prints
// one line per invalid variable (name and reason, never the value) and exits with 1, or writes the
// configuration of the trace store with its retention in hours and exits with 0. The alert rule
// files with the thresholds follow with the alert rules of OBS-US-2 (slices 2 and 4).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type Kind = "integer" | "number";
type Variable = {
  name: string;
  kind: Kind;
  fallback: string;
  min: number;
  max: number;
};

const variables: Variable[] = [
  { name: "OBS_METRICS_RETENTION_DAYS", kind: "integer", fallback: "15", min: 1, max: 90 },
  { name: "OBS_LOGS_RETENTION_DAYS", kind: "integer", fallback: "7", min: 1, max: 30 },
  { name: "OBS_TRACES_RETENTION_DAYS", kind: "integer", fallback: "7", min: 1, max: 30 },
  { name: "OBS_ALERT_ERROR_RATE_PERCENT", kind: "number", fallback: "5", min: 0.1, max: 100 },
  { name: "OBS_ALERT_MIN_REQUESTS", kind: "integer", fallback: "20", min: 1, max: 100000 },
  { name: "OBS_ALERT_STORAGE_PERCENT", kind: "number", fallback: "90", min: 1, max: 100 },
  { name: "OBS_ALERT_QUEUE_MIN_WAITING", kind: "integer", fallback: "10", min: 1, max: 1000000 },
  { name: "OBS_ALERT_SILENT_MINUTES", kind: "integer", fallback: "2", min: 1, max: 60 },
  { name: "OBS_DASHBOARD_PORT", kind: "integer", fallback: "3300", min: 1024, max: 65535 },
];

/** The reason of one invalid variable, or undefined when the value is valid. */
function problemOf(variable: Variable, value: string): string | undefined {
  const pattern = variable.kind === "integer" ? /^\d+$/ : /^\d+(\.\d+)?$/;
  const number = Number(value);
  if (pattern.test(value) && number >= variable.min && number <= variable.max) {
    return undefined;
  }
  const noun = variable.kind === "integer" ? "an integer" : "a number";
  return `expected ${noun} between ${variable.min} and ${variable.max}`;
}

/**
 * Checks the environment. An empty or missing value takes the default of §8. Returns the checked
 * values, or the output lines of OBS-E-4.
 */
export function checkConfig(
  environment: Record<string, string | undefined>,
): { ok: true; values: Record<string, string> } | { ok: false; lines: string[] } {
  const values: Record<string, string> = {};
  const lines: string[] = [];
  for (const variable of variables) {
    const given = environment[variable.name];
    const value = given === undefined || given === "" ? variable.fallback : given;
    const problem = problemOf(variable, value);
    if (problem === undefined) {
      values[variable.name] = value;
    } else {
      lines.push(`  ${variable.name}: ${problem}`);
    }
  }
  return lines.length === 0 ? { ok: true, values } : { ok: false, lines };
}

function main(): number {
  const result = checkConfig(process.env);
  if (!result.ok) {
    process.stdout.write(
      `${["Invalid configuration for the observability stack:", ...result.lines].join("\n")}\n`,
    );
    return 1;
  }
  const templateDir = process.env.OBS_TEMPLATE_DIR ?? "/obs";
  const outputDir = process.env.OBS_GENERATED_DIR ?? "/generated";
  const hours = Number(result.values.OBS_TRACES_RETENTION_DAYS) * 24;
  const tempo = readFileSync(join(templateDir, "tempo.template.yaml"), "utf8").replace(
    "__OBS_TRACES_RETENTION_HOURS__",
    String(hours),
  );
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(join(outputDir, "tempo.yaml"), tempo, { mode: 0o644 });
  return 0;
}

if (import.meta.main) {
  process.exit(main());
}
