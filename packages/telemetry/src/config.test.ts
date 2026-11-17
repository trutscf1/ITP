import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  InvalidConfigurationError,
  loadTelemetryConfig,
  startTelemetry,
} from "./index.ts";
import { baseConfig } from "./test-support/harness.ts";

describe("TelemetryConfig", () => {
  it("OBS-E-7 loads the defaults of §8 from an empty environment", () => {
    assert.deepEqual(loadTelemetryConfig({}), {
      ok: true,
      config: {
        enabled: true,
        endpoint: "http://collector:4318",
        exportIntervalMs: 15000,
        traceSampleRatio: 1,
        bufferLimit: 2048,
        logLevel: "info",
      },
    });
  });

  it("OBS-E-7 reads every variable", () => {
    const result = loadTelemetryConfig({
      TELEMETRY_ENABLED: "false",
      TELEMETRY_ENDPOINT: "https://otel.example:4318",
      TELEMETRY_EXPORT_INTERVAL_MS: "1000",
      TELEMETRY_TRACE_SAMPLE_RATIO: "0.25",
      TELEMETRY_BUFFER_LIMIT: "100",
      LOG_LEVEL: "debug",
    });
    assert.deepEqual(result, {
      ok: true,
      config: {
        enabled: false,
        endpoint: "https://otel.example:4318",
        exportIntervalMs: 1000,
        traceSampleRatio: 0.25,
        bufferLimit: 100,
        logLevel: "debug",
      },
    });
  });

  it("OBS-E-7 names each invalid variable and its reason, never the value", () => {
    const result = loadTelemetryConfig({
      TELEMETRY_ENABLED: "maybe",
      TELEMETRY_ENDPOINT: "ftp://x",
      TELEMETRY_EXPORT_INTERVAL_MS: "500",
      TELEMETRY_TRACE_SAMPLE_RATIO: "1.5",
      TELEMETRY_BUFFER_LIMIT: "99",
      LOG_LEVEL: "loud",
    });
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.deepEqual(result.problems, [
      { name: "TELEMETRY_ENABLED", reason: "expected true or false" },
      { name: "TELEMETRY_ENDPOINT", reason: "expected an http or https URL" },
      {
        name: "TELEMETRY_EXPORT_INTERVAL_MS",
        reason: "expected an integer between 1000 and 60000",
      },
      {
        name: "TELEMETRY_TRACE_SAMPLE_RATIO",
        reason: "expected a decimal between 0.0 and 1.0",
      },
      {
        name: "TELEMETRY_BUFFER_LIMIT",
        reason: "expected an integer between 100 and 100000",
      },
      {
        name: "LOG_LEVEL",
        reason: "expected one of debug, info, warn, error",
      },
    ]);
  });
});

describe("M1 startTelemetry, configuration", () => {
  it("OBS-T-28 OBS-E-7 fails as SCF-E-1 for an export interval of 500", () => {
    assert.throws(
      () =>
        startTelemetry("web", "0.2.0", {
          ...baseConfig,
          exportIntervalMs: 500,
        }),
      (error: unknown) => {
        assert.ok(error instanceof InvalidConfigurationError);
        assert.equal(
          error.message,
          "TELEMETRY_EXPORT_INTERVAL_MS: expected an integer between 1000 and 60000",
        );
        return true;
      },
    );
  });
});
