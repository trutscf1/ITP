import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  type Exporter,
  type LogEntry,
  type MetricItem,
  type SpanRecord,
  startTelemetry,
  type Telemetry,
  type TelemetryConfig,
  type TelemetryOptions,
} from "../index.ts";

const here = dirname(fileURLToPath(import.meta.url));

/** Reads a data file of the test data strategy (concept §17: test data lives next to the tests). */
export function data<T>(name: string): T {
  return JSON.parse(readFileSync(join(here, "data", name), "utf8")) as T;
}

export const baseConfig: TelemetryConfig = {
  enabled: true,
  endpoint: "http://collector.test:4318",
  exportIntervalMs: 15000,
  traceSampleRatio: 1,
  bufferLimit: 2048,
  logLevel: "info",
};

export type ExporterMode = "ok" | "fail" | "silent";

export interface Harness {
  telemetry: Telemetry;
  /** Lines written to standard output. */
  lines: string[];
  /** What the stub exporter received. */
  received: { metrics: MetricItem[]; logs: LogEntry[]; spans: SpanRecord[] };
  mode: { value: ExporterMode };
  clock: { now: () => number; advance: (ms: number) => void };
  /** Runs what the scheduler would run at each export interval. */
  tick: () => Promise<void>;
}

let counter = 0;
function hex(length: number): string {
  counter += 1;
  return counter.toString(16).padStart(length, "0");
}

/** A unit started with a recording sink, a fixed clock, and a stub exporter (concept §16). */
export function harness(
  overrides: Partial<TelemetryConfig> = {},
  options: Partial<TelemetryOptions> = {},
  unit: "web" | "identity" | "storage" | "worker" | "cms" = "identity",
  version = "0.2.0",
): Harness {
  const lines: string[] = [];
  const received: Harness["received"] = { metrics: [], logs: [], spans: [] };
  const mode: Harness["mode"] = { value: "ok" };
  let now = Date.parse("2026-11-03T09:15:02.417Z");
  const clock = {
    now: () => now,
    advance: (ms: number) => {
      now += ms;
    },
  };
  const send =
    <T>(sink: T[]) =>
    (items: T[], signal: AbortSignal): Promise<void> => {
      if (mode.value === "fail") return Promise.reject(new Error("refused"));
      if (mode.value === "silent")
        return new Promise((_, reject) => {
          signal.addEventListener("abort", () => reject(signal.reason));
        });
      sink.push(...items);
      return Promise.resolve();
    };
  const exporter: Exporter = {
    metrics: send(received.metrics),
    logs: send(received.logs),
    spans: send(received.spans),
  };
  const scheduled: (() => void | Promise<void>)[] = [];
  const telemetry = startTelemetry(
    unit,
    version,
    { ...baseConfig, ...overrides },
    {
      stdout: (line) => lines.push(line),
      clock,
      exporter,
      scheduler: (run) => {
        scheduled.push(run);
        return () => undefined;
      },
      ids: { traceId: () => hex(32), spanId: () => hex(16) },
      random: () => 0.5,
      deliveryTimeoutMs: 50,
      ...options,
    },
  );
  return {
    telemetry,
    lines,
    received,
    mode,
    clock,
    tick: async () => {
      for (const run of scheduled) await run();
    },
  };
}

export function parsed(lines: string[]): Record<string, unknown>[] {
  return lines.map((line) => JSON.parse(line) as Record<string, unknown>);
}
