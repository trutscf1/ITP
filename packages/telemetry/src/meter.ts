import type {
  Attributes,
  Clock,
  Meter,
  MetricItem,
  MetricName,
  MetricPoint,
} from "./types.ts";

/** The attributes each metric may carry (§8: "A metric MUST NOT carry an attribute that is not in its row"). */
const allowedAttributes: Record<MetricName, readonly string[]> = {
  "unit.running": [],
  "http.server.request.duration": ["route", "method", "status code"],
  "upload.received": [],
  "queue.jobs.waiting": ["queue"],
  "storage.capacity.used": [],
  "storage.capacity.total": [],
};

const measures: Record<MetricName, string> = {
  "unit.running": "1",
  "http.server.request.duration": "s",
  "upload.received": "By",
  "queue.jobs.waiting": "{job}",
  "storage.capacity.used": "By",
  "storage.capacity.total": "By",
};

export const durationBounds = [
  0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10,
];

interface Series {
  attributes: Record<string, string>;
  value: number;
  count: number;
  sum: number;
  buckets: number[];
}

export interface MeterHandle extends Meter {
  /** Snapshots every metric that has a value (called at every export interval). */
  collect(): MetricItem[];
}

function only(
  name: MetricName,
  attributes: Attributes,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of allowedAttributes[name])
    if (attributes[key] !== undefined) result[key] = String(attributes[key]);
  return result;
}

/** The Meter of M1: it keeps the metrics of §8 for this unit in memory until the next export. */
export function createMeter(clock: Clock): MeterHandle {
  const startMs = clock.now();
  const series = new Map<MetricName, Map<string, Series>>();

  const seriesOf = (
    name: MetricName,
    attributes: Record<string, string>,
  ): Series => {
    let byKey = series.get(name);
    if (!byKey) {
      byKey = new Map();
      series.set(name, byKey);
    }
    const key = JSON.stringify(Object.entries(attributes).sort());
    let entry = byKey.get(key);
    if (!entry) {
      entry = {
        attributes,
        value: 0,
        count: 0,
        sum: 0,
        buckets: new Array(durationBounds.length + 1).fill(0),
      };
      byKey.set(key, entry);
    }
    return entry;
  };

  return {
    recordRequestDuration(seconds, { route, method, statusCode }) {
      const entry = seriesOf("http.server.request.duration", {
        route,
        method,
        "status code": String(statusCode),
      });
      entry.count += 1;
      entry.sum += seconds;
      const index = durationBounds.findIndex((bound) => seconds <= bound);
      entry.buckets[index === -1 ? durationBounds.length : index] += 1;
    },
    addCounter(name, value) {
      seriesOf(name, {}).value += value;
    },
    setGauge(name, value, attributes = {}) {
      seriesOf(name, only(name, attributes)).value = value;
    },
    collect() {
      const timeMs = clock.now();
      const items: MetricItem[] = [];
      for (const [name, byKey] of series) {
        const points: MetricPoint[] = [...byKey.values()].map((s) =>
          name === "http.server.request.duration"
            ? {
                attributes: s.attributes,
                count: s.count,
                sum: Math.round(s.sum * 1e9) / 1e9,
                bounds: durationBounds,
                bucketCounts: [...s.buckets],
              }
            : { attributes: s.attributes, value: s.value },
        );
        items.push({
          name,
          kind:
            name === "http.server.request.duration"
              ? "histogram"
              : name === "upload.received"
                ? "counter"
                : "gauge",
          unit: measures[name],
          startMs,
          timeMs,
          points,
        });
      }
      return items;
    },
  };
}
