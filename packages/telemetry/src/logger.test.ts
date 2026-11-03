import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { data, harness, parsed } from "./test-support/harness.ts";

const secrets = data<{
  example1: { input: Record<string, string> };
  logLine: string;
}>("redaction-secrets.json");

const context = "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01";

describe("M2 Logger", () => {
  it("OBS-T-23 OBS-F-4 OBS-AC-1.4 writes the JSON line of example 1 inside a span", () => {
    const h = harness();
    h.telemetry.tracer.withTraceContext(context, () => {
      h.telemetry.log.warn("login refused", secrets.example1.input);
    });
    assert.deepEqual(h.lines, [secrets.logLine]);
  });

  it("OBS-T-23 OBS-F-4 OBS-F-25 OBS-AC-1.4 leaves out traceId and spanId outside a span", () => {
    const h = harness();
    h.telemetry.log.info("unit started", {});
    const [entry] = parsed(h.lines);
    assert.ok(entry);
    assert.equal("traceId" in entry, false);
    assert.equal("spanId" in entry, false);
    assert.deepEqual(entry, {
      time: "2026-11-03T09:15:02.417Z",
      level: "info",
      unit: "identity",
      version: "0.2.0",
      message: "unit started",
      attributes: {},
    });
  });

  it("OBS-T-24 OBS-F-4 cuts a message of 2500 characters to 1999 characters and an ellipsis", () => {
    const h = harness();
    h.telemetry.log.info("a".repeat(2500));
    const [entry] = parsed(h.lines);
    assert.equal(entry?.message, `${"a".repeat(1999)}…`);
  });

  it("OBS-T-25 OBS-F-30 writes and exports only entries at or above LOG_LEVEL", async () => {
    const h = harness({ logLevel: "warn" });
    h.telemetry.log.info("quiet");
    h.telemetry.log.error("loud");
    await h.tick();
    assert.deepEqual(
      parsed(h.lines).map((line) => line.message),
      ["loud"],
    );
    assert.deepEqual(
      h.received.logs.map((entry) => entry.message),
      ["loud"],
    );
  });

  it("OBS-F-4 exports the same entry as the line on standard output", async () => {
    const h = harness();
    h.telemetry.tracer.withTraceContext(context, () => {
      h.telemetry.log.warn("login refused", secrets.example1.input);
    });
    await h.tick();
    assert.equal(h.received.logs.length, 1);
    assert.equal(JSON.stringify(h.received.logs[0]), h.lines[0]);
  });

  it("OBS-F-4 keeps keys to 1..64 characters of [a-zA-Z0-9._-] and values to 500 characters", () => {
    const h = harness();
    h.telemetry.log.info("x", { "job id": "j-1", ok: "y".repeat(600) });
    const [entry] = parsed(h.lines);
    const attributes = entry?.attributes as Record<string, string>;
    assert.equal(attributes.job_id, "j-1");
    assert.equal(attributes.ok?.length, 500);
  });

  it("OBS-AC-1.6 OBS-NF-2 replaces an e-mail address and an IP address in the message and in values", () => {
    const h = harness();
    h.telemetry.log.error("share link opened by ada@example.org", {
      detail: "from 203.0.113.7",
    });
    assert.equal(h.lines[0]?.includes("ada@example.org"), false);
    assert.equal(h.lines[0]?.includes("203.0.113.7"), false);
    assert.match(h.lines[0] ?? "", /share link opened by \[redacted\]/);
  });

  it("OBS-AC-1.7 OBS-F-31 writes JSON lines to standard output while telemetry is off", async () => {
    const h = harness({ enabled: false });
    h.telemetry.log.warn("login refused", secrets.example1.input);
    h.telemetry.log.debug("below the level");
    await h.tick();
    assert.equal(h.lines.length, 1);
    const [entry] = parsed(h.lines);
    assert.equal(entry?.message, "login refused");
    assert.deepEqual(entry?.attributes, {
      password: "[redacted]",
      sessionToken: "[redacted]",
      "X-Api-Key": "[redacted]",
      reason: "locked",
    });
    assert.deepEqual(h.received, { metrics: [], logs: [], spans: [] });
  });
});
