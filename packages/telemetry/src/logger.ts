import { redactAttributes, redactText } from "./redactor.ts";
import {
  type Attributes,
  type Clock,
  type LogEntry,
  type Logger,
  type LogLevel,
  logLevels,
  type SpanContext,
  type UnitName,
} from "./types.ts";

const maxMessage = 2000;
const maxKey = 64;
const maxValue = 500;

function cut(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/** Keys are 1..64 characters of [a-zA-Z0-9._-] (§8); anything else becomes `_`. */
function logKey(key: string): string {
  const clean = key.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, maxKey);
  return clean === "" ? "_" : clean;
}

/** M2 Logger: one JSON line on standard output and the same entry to the export buffer. */
export function createLogger(deps: {
  unit: UnitName;
  version: string;
  level: LogLevel;
  clock: Clock;
  stdout: (line: string) => void;
  active: () => SpanContext | undefined;
  /** Receives the entry for export; absent while telemetry is off. */
  collect?: (entry: LogEntry) => void;
}): Logger {
  const threshold = logLevels.indexOf(deps.level);
  const log = (
    level: LogLevel,
    message: string,
    attributes: Attributes = {},
  ) => {
    if (logLevels.indexOf(level) < threshold) return;
    const span = deps.active();
    const keyed = redactAttributes(attributes);
    const clean: Record<string, string> = {};
    for (const [key, value] of Object.entries(keyed))
      clean[logKey(key)] = cut(redactText(String(value)), maxValue);
    const entry: LogEntry = {
      time: new Date(deps.clock.now()).toISOString(),
      level,
      unit: deps.unit,
      version: deps.version,
      message: cut(redactText(message), maxMessage),
      ...(span ? { traceId: span.traceId, spanId: span.spanId } : {}),
      attributes: clean,
    };
    deps.stdout(JSON.stringify(entry));
    deps.collect?.(entry);
  };
  return {
    log,
    debug: (message, attributes) => log("debug", message, attributes),
    info: (message, attributes) => log("info", message, attributes),
    warn: (message, attributes) => log("warn", message, attributes),
    error: (message, attributes) => log("error", message, attributes),
  };
}
