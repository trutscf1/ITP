import { type LogLevel, logLevels } from "./types.ts";

/** §8 `TelemetryConfig`: part of the configuration contract of every unit. */
export interface TelemetryConfig {
  enabled: boolean; // TELEMETRY_ENABLED
  endpoint: string; // TELEMETRY_ENDPOINT
  exportIntervalMs: number; // TELEMETRY_EXPORT_INTERVAL_MS
  traceSampleRatio: number; // TELEMETRY_TRACE_SAMPLE_RATIO
  bufferLimit: number; // TELEMETRY_BUFFER_LIMIT
  logLevel: LogLevel; // LOG_LEVEL
}

/** One invalid variable; it names the variable and the reason, never the value (SCF-E-1). */
export interface ConfigProblem {
  name: string;
  reason: string;
}

export type TelemetryConfigResult =
  | { ok: true; config: TelemetryConfig }
  | { ok: false; problems: ConfigProblem[] };

/** Thrown by `startTelemetry` for an invalid configuration; the message holds one line per problem. */
export class InvalidConfigurationError extends Error {
  readonly problems: ConfigProblem[];
  constructor(problems: ConfigProblem[]) {
    super(problems.map((p) => `${p.name}: ${p.reason}`).join("\n"));
    this.name = "InvalidConfigurationError";
    this.problems = problems;
  }
}

interface Rule<K extends keyof TelemetryConfig> {
  variable: string;
  field: K;
  fallback: TelemetryConfig[K];
  parse(text: string): unknown;
  valid(value: unknown): value is TelemetryConfig[K];
  reason: string;
}

function rule<K extends keyof TelemetryConfig>(r: Rule<K>): Rule<K> {
  return r;
}

const isInt =
  (min: number, max: number) =>
  (value: unknown): value is number =>
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= min &&
    value <= max;

const parseInteger = (text: string): number =>
  /^\d+$/.test(text) ? Number(text) : Number.NaN;

const isHttpUrl = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
};

const isLogLevel = (value: unknown): value is LogLevel =>
  typeof value === "string" && (logLevels as readonly string[]).includes(value);

const isRatio = (value: unknown): value is number =>
  typeof value === "number" && value >= 0 && value <= 1;

const rules = [
  rule({
    variable: "TELEMETRY_ENABLED",
    field: "enabled",
    fallback: true,
    parse: (text) =>
      text === "true" ? true : text === "false" ? false : undefined,
    valid: (value): value is boolean => typeof value === "boolean",
    reason: "expected true or false",
  }),
  rule({
    variable: "TELEMETRY_ENDPOINT",
    field: "endpoint",
    fallback: "http://collector:4318",
    parse: (text) => text,
    valid: isHttpUrl,
    reason: "expected an http or https URL",
  }),
  rule({
    variable: "TELEMETRY_EXPORT_INTERVAL_MS",
    field: "exportIntervalMs",
    fallback: 15000,
    parse: parseInteger,
    valid: isInt(1000, 60000),
    reason: "expected an integer between 1000 and 60000",
  }),
  rule({
    variable: "TELEMETRY_TRACE_SAMPLE_RATIO",
    field: "traceSampleRatio",
    fallback: 1,
    parse: (text) => (/^\d+(\.\d+)?$/.test(text) ? Number(text) : Number.NaN),
    valid: isRatio,
    reason: "expected a decimal between 0.0 and 1.0",
  }),
  rule({
    variable: "TELEMETRY_BUFFER_LIMIT",
    field: "bufferLimit",
    fallback: 2048,
    parse: parseInteger,
    valid: isInt(100, 100000),
    reason: "expected an integer between 100 and 100000",
  }),
  rule({
    variable: "LOG_LEVEL",
    field: "logLevel",
    fallback: "info",
    parse: (text) => text,
    valid: isLogLevel,
    reason: "expected one of debug, info, warn, error",
  }),
];

/** Reads the telemetry variables of §8 from the environment; a missing or empty one takes its default. */
export function loadTelemetryConfig(
  environment: Readonly<Record<string, string | undefined>>,
): TelemetryConfigResult {
  const config: Record<string, unknown> = {};
  const problems: ConfigProblem[] = [];
  for (const r of rules) {
    const text = environment[r.variable];
    const value =
      text === undefined || text === "" ? r.fallback : r.parse(text);
    if (r.valid(value)) config[r.field] = value;
    else problems.push({ name: r.variable, reason: r.reason });
  }
  return problems.length > 0
    ? { ok: false, problems }
    : { ok: true, config: config as unknown as TelemetryConfig };
}

/** Checks a configuration object against the valid values of §8; the names are those of the variables. */
export function validateTelemetryConfig(
  config: TelemetryConfig,
): ConfigProblem[] {
  return rules
    .filter((r) => !r.valid(config[r.field]))
    .map((r) => ({ name: r.variable, reason: r.reason }));
}
