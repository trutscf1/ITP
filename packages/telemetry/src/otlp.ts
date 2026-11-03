import type {
  Exporter,
  LogEntry,
  LogLevel,
  MetricItem,
  MetricPoint,
  SpanKind,
  SpanRecord,
  UnitName,
} from "./types.ts";

/**
 * OTLP over HTTP with JSON bodies (`STACK.md` §1, OBS-C-1): the exporter of the units. It needs no
 * dependency; the neutral attribute names of §8 are mapped to the semantic conventions here.
 */

interface KeyValue {
  key: string;
  value: { stringValue: string };
}

const spanAttributeKeys: Record<string, string> = {
  route: "http.route",
  method: "http.request.method",
  "status code": "http.response.status_code",
  "peer unit": "server.address",
  queue: "messaging.destination.name",
  "job name": "messaging.operation.name",
  "job id": "messaging.message.id",
  "error type": "error.type",
};

const metricAttributeKeys: Record<string, string> = {
  route: "http.route",
  method: "http.request.method",
  "status code": "http.response.status_code",
  queue: "messaging.destination.name",
};

function keyValues(
  attributes: Record<string, string>,
  mapping: Record<string, string>,
): KeyValue[] {
  return Object.entries(attributes).map(([key, value]) => ({
    key: mapping[key] ?? key,
    value: { stringValue: value },
  }));
}

/** Nanoseconds since the epoch as a decimal string, as OTLP/JSON wants 64-bit integers. */
function nanos(ms: number): string {
  return (BigInt(Math.round(ms * 1000)) * 1000n).toString();
}

const severity: Record<LogLevel, number> = {
  debug: 5,
  info: 9,
  warn: 13,
  error: 17,
};
const spanKinds: Record<SpanKind, number> = {
  internal: 1,
  server: 2,
  client: 3,
  consumer: 5,
};

function resource(unit: UnitName, version: string) {
  return {
    attributes: [
      { key: "service.name", value: { stringValue: unit } },
      { key: "service.version", value: { stringValue: version } },
    ],
  };
}

const scope = { name: "@stash/telemetry" };

export function encodeLogs(unit: UnitName, version: string, items: LogEntry[]) {
  return {
    resourceLogs: [
      {
        resource: resource(unit, version),
        scopeLogs: [
          {
            scope,
            logRecords: items.map((entry) => ({
              timeUnixNano: nanos(Date.parse(entry.time)),
              severityNumber: severity[entry.level],
              severityText: entry.level,
              body: { stringValue: entry.message },
              attributes: keyValues(entry.attributes, {}),
              ...(entry.traceId ? { traceId: entry.traceId } : {}),
              ...(entry.spanId ? { spanId: entry.spanId } : {}),
            })),
          },
        ],
      },
    ],
  };
}

export function encodeSpans(
  unit: UnitName,
  version: string,
  items: SpanRecord[],
) {
  return {
    resourceSpans: [
      {
        resource: resource(unit, version),
        scopeSpans: [
          {
            scope,
            spans: items.map((span) => ({
              traceId: span.traceId,
              spanId: span.spanId,
              ...(span.parentSpanId ? { parentSpanId: span.parentSpanId } : {}),
              name: span.name,
              kind: spanKinds[span.kind],
              startTimeUnixNano: nanos(span.startMs),
              endTimeUnixNano: nanos(span.endMs),
              attributes: keyValues(span.attributes, spanAttributeKeys),
              status: { code: span.attributes.outcome === "error" ? 2 : 0 },
            })),
          },
        ],
      },
    ],
  };
}

function encodePoint(item: MetricItem, point: MetricPoint) {
  const base = {
    attributes: keyValues(point.attributes, metricAttributeKeys),
    startTimeUnixNano: nanos(item.startMs),
    timeUnixNano: nanos(item.timeMs),
  };
  if (item.kind === "histogram")
    return {
      ...base,
      count: String(point.count ?? 0),
      sum: point.sum ?? 0,
      bucketCounts: (point.bucketCounts ?? []).map(String),
      explicitBounds: point.bounds ?? [],
    };
  return { ...base, asDouble: point.value ?? 0 };
}

export function encodeMetrics(
  unit: UnitName,
  version: string,
  items: MetricItem[],
) {
  return {
    resourceMetrics: [
      {
        resource: resource(unit, version),
        scopeMetrics: [
          {
            scope,
            metrics: items.map((item) => {
              const dataPoints = item.points.map((p) => encodePoint(item, p));
              const common = { name: item.name, unit: item.unit };
              if (item.kind === "gauge")
                return { ...common, gauge: { dataPoints } };
              if (item.kind === "counter")
                return {
                  ...common,
                  sum: {
                    aggregationTemporality: 2,
                    isMonotonic: true,
                    dataPoints,
                  },
                };
              return {
                ...common,
                histogram: { aggregationTemporality: 2, dataPoints },
              };
            }),
          },
        ],
      },
    ],
  };
}

/** The exporter of the units: POST `<endpoint>/v1/{metrics,logs,traces}`; any answer but 2xx fails. */
export function createOtlpExporter(
  endpoint: string,
  unit: UnitName,
  version: string,
  fetcher: typeof fetch = fetch,
): Exporter {
  const base = endpoint.replace(/\/+$/, "");
  const post = async (path: string, body: unknown, signal: AbortSignal) => {
    const response = await fetcher(`${base}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
    await response.arrayBuffer();
    if (!response.ok) throw new Error(`collector answered ${response.status}`);
  };
  return {
    metrics: (items, signal) =>
      post("/v1/metrics", encodeMetrics(unit, version, items), signal),
    logs: (items, signal) =>
      post("/v1/logs", encodeLogs(unit, version, items), signal),
    spans: (items, signal) =>
      post("/v1/traces", encodeSpans(unit, version, items), signal),
  };
}
