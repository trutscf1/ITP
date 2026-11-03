import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { describe, it } from "node:test";
import { InvalidConfigurationError } from "@stash/telemetry";
import { boot, unitVersion } from "./boot.ts";

// Slice 3 of OBS-US-1: the unit `cms` starts its telemetry before it accepts a request and writes
// its start log entry (module M11 UnitWiring, documentation/concepts/observability.md §16, §17).
// `boot` is the seam: the code that accepts requests (the content management system) is handed
// in as `accept` and runs only after the start call and the start log entry.

type Collected = { path: string; body: unknown };

/** A collector stub on a free port: records every telemetry request it receives. */
async function collector(): Promise<{
  endpoint: string;
  requests: Collected[];
  close: () => Promise<void>;
}> {
  const requests: Collected[] = [];
  const server = createServer((request, response) => {
    const chunks: Buffer[] = [];
    request.on("data", (chunk: Buffer) => chunks.push(chunk));
    request.on("end", () => {
      requests.push({
        path: request.url ?? "",
        body: JSON.parse(Buffer.concat(chunks).toString("utf8")),
      });
      response.writeHead(200, { "content-type": "application/json" });
      response.end("{}");
    });
  });
  await new Promise<void>((resolve) =>
    server.listen(0, "127.0.0.1", () => resolve()),
  );
  const { port } = server.address() as AddressInfo;
  return {
    endpoint: `http://127.0.0.1:${port}`,
    requests,
    close: () =>
      new Promise<void>((resolve) => {
        server.close(() => resolve());
        server.closeAllConnections();
      }),
  };
}

/** A scheduler stub: the test runs the export interval itself. */
function manualScheduler() {
  const runs: (() => void | Promise<void>)[] = [];
  return {
    scheduler: (run: () => void | Promise<void>) => {
      runs.push(run);
      return () => undefined;
    },
    tick: async () => {
      for (const run of runs) await run();
    },
  };
}

const resourceAttribute = (body: unknown, key: string): string | undefined => {
  const resource = Object.values(body as Record<string, unknown[]>)[0]?.[0] as
    | { resource: { attributes: { key: string; value: unknown }[] } }
    | undefined;
  const found = resource?.resource.attributes.find((a) => a.key === key);
  return (found?.value as { stringValue?: string } | undefined)?.stringValue;
};

describe("M11 UnitWiring for cms (OBS-AC-1.1)", () => {
  it("OBS-AC-1.1 OBS-T-1 OBS-F-1 starts the telemetry of the unit cms before it accepts a request", async () => {
    const steps: string[] = [];
    await boot(
      {},
      async () => {
        steps.push("accept");
      },
      {
        stdout: () => steps.push("log"),
        scheduler: () => {
          steps.push("scheduler");
          return () => undefined;
        },
      },
    );
    assert.deepEqual(steps, ["scheduler", "log", "accept"]);
  });

  it("OBS-AC-1.1 OBS-F-25 writes the start log entry `unit started` with level info, the unit name cms, and no trace ID before it accepts a request", async () => {
    const lines: string[] = [];
    let linesAtAccept = -1;
    await boot(
      {},
      async () => {
        linesAtAccept = lines.length;
      },
      { stdout: (line) => lines.push(line), scheduler: () => () => undefined },
    );
    assert.equal(linesAtAccept, 1);
    const entry = JSON.parse(lines[0] ?? "{}") as Record<string, unknown>;
    assert.equal(entry.level, "info");
    assert.equal(entry.unit, "cms");
    assert.equal(entry.version, unitVersion);
    assert.equal(entry.message, "unit started");
    assert.equal("traceId" in entry, false);
    assert.equal("spanId" in entry, false);
  });

  it("OBS-AC-1.1 OBS-F-1 OBS-F-11 OBS-F-25 delivers the heartbeat unit.running = 1 and the start log entry to the collector, each with the resource service.name cms", async () => {
    const stub = await collector();
    const timer = manualScheduler();
    try {
      await boot({ TELEMETRY_ENDPOINT: stub.endpoint }, async () => undefined, {
        stdout: () => undefined,
        scheduler: timer.scheduler,
      });
      await timer.tick();

      const metrics = stub.requests.find((r) => r.path === "/v1/metrics");
      assert.ok(metrics, "no metrics request reached the collector");
      assert.equal(resourceAttribute(metrics.body, "service.name"), "cms");
      const metric = (
        metrics.body as {
          resourceMetrics: {
            scopeMetrics: { metrics: { name: string; gauge?: unknown }[] }[];
          }[];
        }
      ).resourceMetrics[0]?.scopeMetrics[0]?.metrics.find(
        (m) => m.name === "unit.running",
      );
      assert.deepEqual(
        (
          metric?.gauge as {
            dataPoints: { asInt?: string; asDouble?: number }[];
          }
        ).dataPoints.map((p) => Number(p.asInt ?? p.asDouble)),
        [1],
      );

      const logs = stub.requests.find((r) => r.path === "/v1/logs");
      assert.ok(logs, "no log request reached the collector");
      assert.equal(resourceAttribute(logs.body, "service.name"), "cms");
      assert.match(JSON.stringify(logs.body), /unit started/);
    } finally {
      await stub.close();
    }
  });

  it("OBS-AC-1.1 OBS-E-7 refuses to start with an invalid telemetry configuration, names the variable and never the value, and accepts no request", async () => {
    let accepted = false;
    await assert.rejects(
      boot(
        { TELEMETRY_EXPORT_INTERVAL_MS: "500" },
        async () => {
          accepted = true;
        },
        { stdout: () => undefined, scheduler: () => () => undefined },
      ),
      (error: unknown) => {
        assert.ok(error instanceof InvalidConfigurationError);
        assert.equal(
          error.message,
          "TELEMETRY_EXPORT_INTERVAL_MS: expected an integer between 1000 and 60000",
        );
        return true;
      },
    );
    assert.equal(accepted, false);
  });

  it("OBS-AC-1.1 OBS-F-31 still writes the start log entry to standard output while telemetry is switched off", async () => {
    const lines: string[] = [];
    await boot({ TELEMETRY_ENABLED: "false" }, async () => undefined, {
      stdout: (line) => lines.push(line),
    });
    assert.equal(lines.length, 1);
    assert.equal(
      (JSON.parse(lines[0] ?? "{}") as { message: string }).message,
      "unit started",
    );
  });

  it("OBS-AC-1.1 reports the version of the package @stash/cms", () => {
    const manifest = JSON.parse(
      readFileSync(new URL("../package.json", import.meta.url), "utf8"),
    ) as { version: string };
    assert.equal(unitVersion, manifest.version);
  });
});
