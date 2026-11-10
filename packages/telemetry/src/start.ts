import {
  InvalidConfigurationError,
  type TelemetryConfig,
  validateTelemetryConfig,
} from "./config.ts";
import { ExportBuffer } from "./export-buffer.ts";
import { createJobTrace } from "./job-trace.ts";
import { createLogger } from "./logger.ts";
import { createMeter } from "./meter.ts";
import { createOtlpExporter } from "./otlp.ts";
import { matchRoute, normalizeRoute, pathOnly, unmatched } from "./routes.ts";
import {
  createTracing,
  formatTraceContext,
  parseTraceContext,
  randomIds,
} from "./tracing.ts";
import type {
  Answer,
  Clock,
  Exporter,
  HttpTelemetry,
  JobTrace,
  LogEntry,
  Meter,
  MetricItem,
  SpanRecord,
  Telemetry,
  TelemetryOptions,
  Tracer,
  UnitName,
} from "./types.ts";

const defaultClock: Clock = {
  now: () => performance.timeOrigin + performance.now(),
};

const defaultScheduler: TelemetryOptions["scheduler"] = (run, intervalMs) => {
  const timer = setInterval(() => {
    void run();
  }, intervalMs);
  timer.unref();
  return () => clearInterval(timer);
};

const discardingMeter: Meter = {
  recordRequestDuration: () => undefined,
  addCounter: () => undefined,
  setGauge: () => undefined,
};

const passThroughJobs: JobTrace = {
  inject: (envelope) => envelope,
  async run(envelope, _queue, _jobName, _jobId, handler) {
    await handler(envelope);
  },
};

/** Waits for `promise` at most `ms`; never rejects. */
async function within(promise: Promise<unknown>, ms: number): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      promise,
      new Promise<void>((resolve) => {
        timer = setTimeout(resolve, ms);
      }),
    ]);
  } catch {
    // The deliveries report their own failure.
  } finally {
    clearTimeout(timer);
  }
}

/**
 * M1 startTelemetry: the start call of a unit (`gam-ai-knowledge/concepts/observability.md` §16).
 * Nothing here waits for the collector (OBS-NF-9); an invalid configuration throws
 * `InvalidConfigurationError`, which the unit treats as SCF-E-1 (OBS-E-7).
 */
export function startTelemetry(
  unit: UnitName,
  version: string,
  config: TelemetryConfig,
  options: Partial<TelemetryOptions> = {},
): Telemetry {
  const problems = validateTelemetryConfig(config);
  if (problems.length > 0) throw new InvalidConfigurationError(problems);

  const clock = options.clock ?? defaultClock;
  const stdout =
    options.stdout ??
    ((line: string) => void process.stdout.write(`${line}\n`));
  const noop = async () => undefined;

  // OBS-F-31, step 2: telemetry off. The Logger writes to standard output only.
  if (!config.enabled) {
    return {
      log: createLogger({
        unit,
        version,
        level: config.logLevel,
        clock,
        stdout,
        active: () => undefined,
      }),
      meter: discardingMeter,
      jobs: passThroughJobs,
      tracer: { withTraceContext: (_context, fn) => fn() },
      http: {
        serve: async (_request, handler) => handler(),
        call: async (_target, fn) => fn({}),
      },
      flush: noop,
      shutdown: noop,
    };
  }

  const limit = options.bufferLimit ?? config.bufferLimit;
  const logs = new ExportBuffer<LogEntry>(limit);
  const spans = new ExportBuffer<SpanRecord>(limit);
  const metrics = new ExportBuffer<MetricItem>(limit);
  const exporter: Exporter =
    options.exporter ?? createOtlpExporter(config.endpoint, unit, version);
  const deliveryTimeoutMs = options.deliveryTimeoutMs ?? 10_000;
  const routes = (options.routes ?? []).map(normalizeRoute);

  const tracing = createTracing({
    clock,
    ids: options.ids ?? randomIds,
    random: options.random ?? Math.random,
    ratio: config.traceSampleRatio,
    onEnd: (span) => spans.add(span),
  });
  const log = createLogger({
    unit,
    version,
    level: config.logLevel,
    clock,
    stdout,
    active: tracing.active,
    collect: (entry) => logs.add(entry),
  });
  const meter = createMeter(clock);

  // OBS-E-1: at most one debug entry per minute about a failed delivery.
  let lastFailureLog = Number.NEGATIVE_INFINITY;
  const reportFailure = () => {
    const now = clock.now();
    if (now - lastFailureLog < 60_000) return;
    lastFailureLog = now;
    log.debug("telemetry export failed");
  };

  const flush = async (): Promise<void> => {
    meter.setGauge("unit.running", 1);
    for (const item of meter.collect()) metrics.add(item);
    const results = await Promise.all([
      metrics.deliver(
        (items, signal) => exporter.metrics(items, signal),
        deliveryTimeoutMs,
      ),
      logs.deliver(
        (items, signal) => exporter.logs(items, signal),
        deliveryTimeoutMs,
      ),
      spans.deliver(
        (items, signal) => exporter.spans(items, signal),
        deliveryTimeoutMs,
      ),
    ]);
    if (results.includes(false)) reportFailure();
  };

  // Step 6: the heartbeat and the delivery run in the background; nothing waits for them.
  const stop = (options.scheduler ?? defaultScheduler)(
    flush,
    config.exportIntervalMs,
  );

  const tracer: Tracer = {
    withTraceContext(traceContext, fn) {
      const context = parseTraceContext(traceContext);
      return context ? tracing.within(context, fn) : fn();
    },
  };

  const http: HttpTelemetry = {
    async serve<T extends Answer>(
      request: Parameters<HttpTelemetry["serve"]>[0],
      handler: () => T | Promise<T>,
    ): Promise<T> {
      const path = pathOnly(request.path);
      if (path === "/health") return handler(); // OBS-F-12: nothing is recorded
      const route = request.route
        ? normalizeRoute(request.route)
        : matchRoute(path, routes);
      const method = request.method.toUpperCase();
      const startMs = clock.now();
      const span = tracing.start(
        `${method} ${route || unmatched}`,
        "server",
        parseTraceContext(request.traceparent),
        { route: route || unmatched, method },
      );
      const finish = (status: number, extra: Record<string, string>) => {
        meter.recordRequestDuration((clock.now() - startMs) / 1000, {
          route: route || unmatched,
          method,
          statusCode: status,
        });
        span.end({
          "status code": String(status),
          outcome: status < 500 ? "ok" : "error",
          ...extra,
        });
      };
      try {
        const answer = await tracing.within(span.context, async () =>
          handler(),
        );
        finish(answer.status, {});
        return answer;
      } catch (error) {
        finish(500, {
          "error type":
            error instanceof Error ? error.constructor.name : "Error",
        });
        throw error;
      }
    },
    async call(target, fn) {
      const parent = tracing.active();
      const span = tracing.start(
        `${target.method.toUpperCase()} ${target.peerUnit}`,
        "client",
        parent,
        { "peer unit": target.peerUnit, method: target.method.toUpperCase() },
      );
      try {
        const answer = await tracing.within(span.context, async () =>
          fn({ traceparent: formatTraceContext(span.context) }),
        );
        const status = answer ? answer.status : undefined;
        span.end({
          ...(status === undefined ? {} : { "status code": String(status) }),
          outcome: status === undefined || status < 500 ? "ok" : "error",
        });
        return answer;
      } catch (error) {
        span.end({
          outcome: "error",
          "error type":
            error instanceof Error ? error.constructor.name : "Error",
        });
        throw error;
      }
    },
  };

  return {
    log,
    meter,
    jobs: createJobTrace({ tracing, log }),
    tracer,
    http,
    flush,
    async shutdown() {
      stop();
      await within(flush(), options.shutdownTimeoutMs ?? 5000);
    },
  };
}
