// Log entries of `identity` (IDN-NF-4, observability.md OBS-F-4): one JSON line per entry, with
// the attributes whose key names a secret replaced, wherever they sit in the entry.
export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogAttributes = Record<string, unknown>;

export interface Logger {
  debug(message: string, attributes?: LogAttributes): void;
  info(message: string, attributes?: LogAttributes): void;
  warn(message: string, attributes?: LogAttributes): void;
  error(message: string, attributes?: LogAttributes): void;
}

/** The secret key list of IDN-NF-4: password, hash, tokens (session, confirmation, reset, bot check), keys. */
const secretKey =
  /password|hash|token|secret|authorization|cookie|api-?key|credential/i;

const redacted = "[redacted]";

function clean(value: unknown, seen: WeakSet<object>): unknown {
  if (value instanceof Error) {
    // The message of a failure may hold values (an address, a statement), so only its kind is kept.
    const code = (value as { code?: unknown }).code;
    return {
      name: value.name,
      code: typeof code === "string" ? code : undefined,
    };
  }
  if (typeof value !== "object" || value === null) return value;
  if (seen.has(value)) return "[circular]";
  seen.add(value);
  if (Array.isArray(value)) return value.map((entry) => clean(entry, seen));
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      secretKey.test(key) ? redacted : clean(entry, seen),
    ]),
  );
}

export function createLogger(
  write: (line: string) => void = (line) => {
    process.stdout.write(`${line}\n`);
  },
  now: () => Date = () => new Date(),
): Logger {
  function log(
    level: LogLevel,
    message: string,
    attributes: LogAttributes = {},
  ): void {
    const entry = {
      ...(clean(attributes, new WeakSet()) as LogAttributes),
      time: now().toISOString(),
      level,
      msg: message,
    };
    write(JSON.stringify(entry));
  }
  return {
    debug: (message, attributes) => log("debug", message, attributes),
    info: (message, attributes) => log("info", message, attributes),
    warn: (message, attributes) => log("warn", message, attributes),
    error: (message, attributes) => log("error", message, attributes),
  };
}
