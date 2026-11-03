/** Record types of `documentation/concepts/observability.md` §8 and the seams of §16. */

export const unitNames = [
  "web",
  "identity",
  "storage",
  "worker",
  "cms",
] as const;
export type UnitName = (typeof unitNames)[number];

export const logLevels = ["debug", "info", "warn", "error"] as const;
export type LogLevel = (typeof logLevels)[number];

/** One log entry (§8 `LogEntry`); the key order is the order of the JSON line. */
export interface LogEntry {
  time: string;
  level: LogLevel;
  unit: UnitName;
  version: string;
  message: string;
  traceId?: string;
  spanId?: string;
  attributes: Record<string, string>;
}

/** The trace ID and span ID of the span that is active, and whether its trace is kept. */
export interface SpanContext {
  traceId: string;
  spanId: string;
  sampled: boolean;
}

export type SpanKind = "internal" | "server" | "client" | "consumer";

/**
 * One finished span. The attributes use the neutral names of §8 ("route", "status code",
 * "peer unit", "job id", ...); the exporter maps them to the protocol (`STACK.md` §1, OBS-C-1).
 */
export interface SpanRecord {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  kind: SpanKind;
  startMs: number;
  endMs: number;
  attributes: Record<string, string>;
}

export interface MetricPoint {
  /** Neutral attribute names of the metric's row in §8. */
  attributes: Record<string, string>;
  /** Gauge and counter value. */
  value?: number;
  /** Histogram values. */
  count?: number;
  sum?: number;
  bounds?: number[];
  bucketCounts?: number[];
}

/** A snapshot of one metric at one export interval (cumulative for counters and histograms). */
export interface MetricItem {
  name: MetricName;
  kind: "gauge" | "counter" | "histogram";
  unit: string;
  startMs: number;
  timeMs: number;
  points: MetricPoint[];
}

export const metricNames = [
  "unit.running",
  "http.server.request.duration",
  "upload.received",
  "queue.jobs.waiting",
  "storage.capacity.used",
  "storage.capacity.total",
] as const;
export type MetricName = (typeof metricNames)[number];

/** The telemetry protocol seam: tests pass a stub, units get the OTLP/HTTP exporter. */
export interface Exporter {
  metrics(items: MetricItem[], signal: AbortSignal): Promise<void>;
  logs(items: LogEntry[], signal: AbortSignal): Promise<void>;
  spans(items: SpanRecord[], signal: AbortSignal): Promise<void>;
}

export interface Clock {
  /** Milliseconds since the epoch; may have a fraction. */
  now(): number;
}

export interface IdGenerator {
  /** 32 lowercase hexadecimal characters. */
  traceId(): string;
  /** 16 lowercase hexadecimal characters. */
  spanId(): string;
}

/** The seams of the package (§16, "Design for Testability"); every one has a production default. */
export interface TelemetryOptions {
  /** Receives one JSON line per log entry. Default: standard output. */
  stdout: (line: string) => void;
  clock: Clock;
  exporter: Exporter;
  /** Calls `run` every `intervalMs`; returns a function that stops it. Default: an unref'd timer. */
  scheduler: (
    run: () => void | Promise<void>,
    intervalMs: number,
  ) => () => void;
  ids: IdGenerator;
  /** Random number in [0, 1) for the sampling decision. */
  random: () => number;
  /** Route patterns of the unit, e.g. `/api/storage/files/{id}`; used when a request names none. */
  routes: readonly string[];
  /** Overrides `config.bufferLimit` (tests; the configuration allows 100 and more). */
  bufferLimit: number;
  /** How long a delivery may take (OBS-E-1). Default 10000. */
  deliveryTimeoutMs: number;
  /** How long `shutdown` waits for the buffers. Default 5000. */
  shutdownTimeoutMs: number;
}

export type Attributes = Readonly<Record<string, string>>;

/** The request a unit has received, as far as telemetry may know it (OBS-NF-2: no address, no agent). */
export interface IncomingRequest {
  method: string;
  /** The raw path, with or without query. It is never recorded. */
  path: string;
  /** The route pattern the framework matched, if it knows one. */
  route?: string;
  /** The value of the request header `traceparent`, if any. */
  traceparent?: string | null;
}

export interface Answer {
  status: number;
}

export interface Logger {
  log(level: LogLevel, message: string, attributes?: Attributes): void;
  debug(message: string, attributes?: Attributes): void;
  info(message: string, attributes?: Attributes): void;
  warn(message: string, attributes?: Attributes): void;
  error(message: string, attributes?: Attributes): void;
}

export interface Meter {
  recordRequestDuration(
    seconds: number,
    attributes: { route: string; method: string; statusCode: number },
  ): void;
  addCounter(name: "upload.received", value: number): void;
  setGauge(
    name: Exclude<
      MetricName,
      "http.server.request.duration" | "upload.received"
    >,
    value: number,
    attributes?: Attributes,
  ): void;
}

export interface JobTrace {
  inject<T extends object>(envelope: T): T;
  run<T extends object>(
    envelope: T,
    queue: string,
    jobName: string,
    jobId: string,
    handler: (envelope: T) => unknown,
  ): Promise<void>;
}

export interface Tracer {
  /** Makes a received trace context ("traceparent" value) the active one while `fn` runs. */
  withTraceContext<T>(traceContext: string, fn: () => T): T;
}

export interface HttpTelemetry {
  /** Instruments one incoming request (M1 step 4). */
  serve<T extends Answer>(
    request: IncomingRequest,
    handler: () => T | Promise<T>,
  ): Promise<T>;
  /** Instruments one outgoing request to another unit (M1 step 5); `fn` sends `headers` with it. */
  call<T extends Answer | undefined>(
    target: { peerUnit: UnitName; method: string },
    fn: (headers: Record<string, string>) => T | Promise<T>,
  ): Promise<T>;
}

export interface Telemetry {
  log: Logger;
  meter: Meter;
  jobs: JobTrace;
  tracer: Tracer;
  http: HttpTelemetry;
  /** Delivers all buffers now (what the export interval does). */
  flush(): Promise<void>;
  /** Stops the interval and delivers the buffers once, waiting at most 5 seconds. */
  shutdown(): Promise<void>;
}
