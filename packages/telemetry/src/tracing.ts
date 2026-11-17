import { AsyncLocalStorage } from "node:async_hooks";
import { randomBytes } from "node:crypto";
import type {
  Clock,
  IdGenerator,
  SpanContext,
  SpanKind,
  SpanRecord,
} from "./types.ts";

const traceContextPattern = /^00-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})$/;

/** Parses a `traceparent` value (W3C Trace Context, `TraceContext` of §8); undefined if invalid. */
export function parseTraceContext(value: unknown): SpanContext | undefined {
  if (typeof value !== "string") return undefined;
  const match = traceContextPattern.exec(value);
  if (!match) return undefined;
  const [, traceId, spanId, flags] = match as unknown as [
    string,
    string,
    string,
    string,
  ];
  if (/^0+$/.test(traceId) || /^0+$/.test(spanId)) return undefined;
  return { traceId, spanId, sampled: (Number.parseInt(flags, 16) & 1) === 1 };
}

export function formatTraceContext(context: SpanContext): string {
  return `00-${context.traceId}-${context.spanId}-${context.sampled ? "01" : "00"}`;
}

export const randomIds: IdGenerator = {
  traceId: () => randomBytes(16).toString("hex"),
  spanId: () => randomBytes(8).toString("hex"),
};

/** A span that has been started and not yet ended. */
export interface OpenSpan {
  context: SpanContext;
  /** Ends the span and keeps it for export when its trace is kept. */
  end(attributes?: Record<string, string>): void;
}

export interface Tracing {
  active(): SpanContext | undefined;
  /** Runs `fn` with `context` as the active span context. */
  within<T>(context: SpanContext, fn: () => T): T;
  start(
    name: string,
    kind: SpanKind,
    parent: SpanContext | undefined,
    attributes: Record<string, string>,
  ): OpenSpan;
}

/** Span bookkeeping: the active span follows the asynchronous call chain of a request or a job. */
export function createTracing(deps: {
  clock: Clock;
  ids: IdGenerator;
  random: () => number;
  ratio: number;
  onEnd: (span: SpanRecord) => void;
}): Tracing {
  const storage = new AsyncLocalStorage<SpanContext>();
  return {
    active: () => storage.getStore(),
    within: (context, fn) => storage.run(context, fn),
    start(name, kind, parent, attributes) {
      // A root is kept with probability `ratio`; a child follows its parent (OBS-C-1).
      const sampled = parent ? parent.sampled : deps.random() < deps.ratio;
      const context: SpanContext = {
        traceId: parent ? parent.traceId : deps.ids.traceId(),
        spanId: deps.ids.spanId(),
        sampled,
      };
      const startMs = deps.clock.now();
      let ended = false;
      return {
        context,
        end(extra = {}) {
          if (ended) return;
          ended = true;
          if (!sampled) return;
          deps.onEnd({
            traceId: context.traceId,
            spanId: context.spanId,
            ...(parent ? { parentSpanId: parent.spanId } : {}),
            name,
            kind,
            startMs,
            endMs: deps.clock.now(),
            attributes: { ...attributes, ...extra },
          });
        },
      };
    },
  };
}
