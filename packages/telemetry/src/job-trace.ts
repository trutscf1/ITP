import {
  formatTraceContext,
  parseTraceContext,
  type Tracing,
} from "./tracing.ts";
import type { JobTrace, Logger } from "./types.ts";

/** M4 JobTrace: the trace context into and out of a job envelope (OBS-F-15, OBS-E-6). */
export function createJobTrace(deps: {
  tracing: Tracing;
  log: Logger;
}): JobTrace {
  const { tracing, log } = deps;
  return {
    inject(envelope) {
      const active = tracing.active();
      const { traceContext: _previous, ...rest } = envelope as {
        traceContext?: unknown;
      };
      return (
        active ? { ...rest, traceContext: formatTraceContext(active) } : rest
      ) as typeof envelope;
    },
    async run(envelope, queue, jobName, jobId, handler) {
      const carried = (envelope as { traceContext?: unknown }).traceContext;
      const present = carried !== undefined;
      const parent = parseTraceContext(carried);
      if (present && !parent)
        log.warn("invalid trace context in job payload", { queue, jobId });
      const span = tracing.start(
        `job ${queue}/${jobName}`,
        "consumer",
        parent,
        {
          queue,
          "job name": jobName,
          "job id": jobId,
        },
      );
      try {
        await tracing.within(span.context, () => handler(envelope));
        span.end({ outcome: "ok" });
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
}
