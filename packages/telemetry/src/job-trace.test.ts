import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { harness, parsed } from "./test-support/harness.ts";

const context = "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01";

describe("M4 JobTrace", () => {
  it("OBS-T-30 OBS-F-3 OBS-F-15 carries the active trace context into the envelope and into the job span", async () => {
    const h = harness();
    const envelope = h.telemetry.tracer.withTraceContext(context, () =>
      h.telemetry.jobs.inject({ jobId: "j-881" }),
    );
    assert.deepEqual(envelope, { jobId: "j-881", traceContext: context });
    let ran = false;
    await h.telemetry.jobs.run(envelope, "processing", "scan", "j-881", () => {
      ran = true;
    });
    assert.equal(ran, true);
    await h.tick();
    const [span] = h.received.spans;
    assert.ok(span);
    assert.equal(span.traceId, "4bf92f3577b34da6a3ce929d0e0e4736");
    assert.equal(span.parentSpanId, "00f067aa0ba902b7");
    assert.equal(span.name, "job processing/scan");
    assert.deepEqual(span.attributes, {
      queue: "processing",
      "job name": "scan",
      "job id": "j-881",
      outcome: "ok",
    });
  });

  it("OBS-F-15 leaves traceContext out when no span is active", () => {
    const h = harness();
    const envelope = h.telemetry.jobs.inject({ jobId: "j-1" });
    assert.equal("traceContext" in envelope, false);
  });

  it("OBS-T-31 OBS-E-6 runs the job as a new trace and warns for an invalid trace context", async () => {
    const h = harness();
    let ran = false;
    await h.telemetry.jobs.run(
      { traceContext: "garbage" },
      "processing",
      "scan",
      "j-881",
      () => {
        ran = true;
      },
    );
    assert.equal(ran, true);
    await h.tick();
    const [span] = h.received.spans;
    assert.ok(span);
    assert.equal(span.parentSpanId, undefined);
    assert.notEqual(span.traceId, "4bf92f3577b34da6a3ce929d0e0e4736");
    const warnings = parsed(h.lines).filter((line) => line.level === "warn");
    assert.equal(warnings.length, 1);
    assert.equal(warnings[0]?.message, "invalid trace context in job payload");
    assert.deepEqual(warnings[0]?.attributes, {
      queue: "processing",
      jobId: "j-881",
    });
  });

  it("OBS-F-15 starts a new trace without a warning when traceContext is missing", async () => {
    const h = harness();
    await h.telemetry.jobs.run(
      {},
      "processing",
      "scan",
      "j-2",
      () => undefined,
    );
    assert.equal(h.lines.length, 0);
  });

  it("OBS-E-6 ends the span with outcome error and passes the failure on unchanged", async () => {
    const h = harness();
    const failure = new TypeError("boom");
    await assert.rejects(
      h.telemetry.jobs.run({}, "processing", "scan", "j-3", () => {
        throw failure;
      }),
      (error: unknown) => error === failure,
    );
    await h.tick();
    assert.equal(h.received.spans[0]?.attributes.outcome, "error");
    assert.equal(h.received.spans[0]?.attributes["error type"], "TypeError");
  });

  it("OBS-F-31 passes the envelope through and runs the handler while telemetry is off", async () => {
    const h = harness({ enabled: false });
    const envelope = { jobId: "j-4" };
    assert.equal(h.telemetry.jobs.inject(envelope), envelope);
    let ran = false;
    await h.telemetry.jobs.run(
      { traceContext: "garbage" },
      "q",
      "n",
      "j-4",
      () => {
        ran = true;
      },
    );
    assert.equal(ran, true);
    assert.equal(h.lines.length, 0);
  });
});
