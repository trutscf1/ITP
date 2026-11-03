import assert from "node:assert/strict";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { describe, it } from "node:test";
import { startTelemetry } from "./index.ts";
import { baseConfig, data, harness, parsed } from "./test-support/harness.ts";

const routes = data<{
  patterns: string[];
  rows: { method: string; path: string; route: string; span: string }[];
}>("routes.json");

const ok = () => ({ status: 200 });

describe("M1 startTelemetry, requests", () => {
  it("OBS-T-26 OBS-F-13 records the route pattern and the span name of example 3", async () => {
    const h = harness({}, { routes: routes.patterns });
    for (const row of routes.rows)
      await h.telemetry.http.serve({ method: row.method, path: row.path }, ok);
    await h.tick();
    assert.deepEqual(
      h.received.spans.map((span) => span.name),
      routes.rows.map((row) => row.span),
    );
    assert.deepEqual(
      h.received.spans.map((span) => span.attributes.route),
      routes.rows.map((row) => row.route),
    );
    const duration = h.received.metrics.filter(
      (metric) => metric.name === "http.server.request.duration",
    );
    const recorded = duration
      .flatMap((metric) => metric.points)
      .map((point) => point.attributes.route)
      .sort();
    assert.deepEqual(recorded, routes.rows.map((row) => row.route).sort());
  });

  it("OBS-F-13 takes the route a framework matched and writes its parameters as {name}", async () => {
    const h = harness();
    await h.telemetry.http.serve(
      { method: "GET", path: "/files/42", route: "/files/:id" },
      ok,
    );
    await h.telemetry.http.serve(
      { method: "GET", path: "/s/abc", route: "/s/[token]" },
      ok,
    );
    await h.tick();
    assert.deepEqual(
      h.received.spans.map((span) => span.name),
      ["GET /files/{id}", "GET /s/{token}"],
    );
  });

  it("OBS-T-27 OBS-F-12 records nothing for /health", async () => {
    const h = harness({}, { routes: routes.patterns });
    for (let i = 0; i < 10; i++)
      await h.telemetry.http.serve({ method: "GET", path: "/health" }, ok);
    await h.telemetry.http.serve(
      { method: "GET", path: "/api/storage/files/7c9e6679" },
      ok,
    );
    await h.tick();
    assert.equal(h.received.spans.length, 1);
    const points = h.received.metrics
      .filter((metric) => metric.name === "http.server.request.duration")
      .flatMap((metric) => metric.points);
    assert.equal(points.length, 1);
    assert.equal(points[0]?.count, 1);
    assert.equal(h.lines.length, 0);
  });

  it("OBS-F-12 puts the duration into the buckets of §8 with unit, route, method, and status code", async () => {
    const h = harness({}, { routes: routes.patterns });
    await h.telemetry.http.serve({ method: "GET", path: "/s/x" }, async () => {
      h.clock.advance(30);
      return { status: 404 };
    });
    await h.tick();
    const metric = h.received.metrics.find(
      (item) => item.name === "http.server.request.duration",
    );
    assert.ok(metric);
    assert.equal(metric.kind, "histogram");
    assert.equal(metric.unit, "s");
    const [point] = metric.points;
    assert.deepEqual(point?.attributes, {
      route: "/s/{token}",
      method: "GET",
      "status code": "404",
    });
    assert.deepEqual(
      point?.bounds,
      [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    );
    assert.equal(point?.sum, 0.03);
    assert.deepEqual(point?.bucketCounts, [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it("OBS-F-12 records status 500 and outcome error when the handler throws, and rethrows", async () => {
    const h = harness({}, { routes: routes.patterns });
    const failure = new RangeError("bad");
    await assert.rejects(
      h.telemetry.http.serve({ method: "GET", path: "/s/x" }, () => {
        throw failure;
      }),
      (error: unknown) => error === failure,
    );
    await h.tick();
    assert.equal(h.received.spans[0]?.attributes.outcome, "error");
    assert.equal(h.received.spans[0]?.attributes["status code"], "500");
    assert.equal(h.received.spans[0]?.attributes["error type"], "RangeError");
  });

  it("OBS-F-12 ends the span with outcome error for status 500 and ok below", async () => {
    const h = harness();
    await h.telemetry.http.serve({ method: "GET", path: "/a" }, () => ({
      status: 499,
    }));
    await h.telemetry.http.serve({ method: "GET", path: "/b" }, () => ({
      status: 500,
    }));
    await h.tick();
    assert.deepEqual(
      h.received.spans.map((span) => span.attributes.outcome),
      ["ok", "error"],
    );
  });
});

describe("M1 startTelemetry, trace context", () => {
  const incoming = "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01";

  it("OBS-F-3 makes the request span a child of the incoming trace context", async () => {
    const h = harness();
    await h.telemetry.http.serve(
      { method: "GET", path: "/a", traceparent: incoming },
      ok,
    );
    await h.tick();
    assert.equal(
      h.received.spans[0]?.traceId,
      "4bf92f3577b34da6a3ce929d0e0e4736",
    );
    assert.equal(h.received.spans[0]?.parentSpanId, "00f067aa0ba902b7");
  });

  it("OBS-F-3 starts a new trace for an invalid incoming trace context", async () => {
    const h = harness();
    await h.telemetry.http.serve(
      { method: "GET", path: "/a", traceparent: "not-a-traceparent" },
      ok,
    );
    await h.tick();
    assert.equal(h.received.spans[0]?.parentSpanId, undefined);
  });

  it("OBS-F-3 sends the trace context of a child span with an outgoing request", async () => {
    const h = harness();
    let sent: Record<string, string> = {};
    await h.telemetry.http.serve(
      { method: "GET", path: "/a", traceparent: incoming },
      async () => {
        await h.telemetry.http.call(
          { peerUnit: "storage", method: "GET" },
          (headers) => {
            sent = headers;
            return { status: 200 };
          },
        );
        return { status: 200 };
      },
    );
    await h.tick();
    const client = h.received.spans.find(
      (span) => span.attributes["peer unit"],
    );
    const server = h.received.spans.find(
      (span) => !span.attributes["peer unit"],
    );
    assert.ok(client && server);
    assert.equal(client.parentSpanId, server.spanId);
    assert.equal(client.attributes["peer unit"], "storage");
    assert.equal(sent.traceparent, `00-${client.traceId}-${client.spanId}-01`);
    assert.equal(client.traceId, "4bf92f3577b34da6a3ce929d0e0e4736");
  });

  it("OBS-C-1 keeps no span at ratio 0 but still gives log entries a trace ID", async () => {
    const h = harness({ traceSampleRatio: 0 });
    await h.telemetry.http.serve({ method: "GET", path: "/a" }, () => {
      h.telemetry.log.info("inside");
      return { status: 200 };
    });
    await h.tick();
    assert.deepEqual(h.received.spans, []);
    assert.match(String(parsed(h.lines)[0]?.traceId), /^[0-9a-f]{32}$/);
  });

  it("OBS-C-1 samples a root by the ratio and a child follows its parent", async () => {
    const h = harness({ traceSampleRatio: 0.25 }, { random: () => 0.1 });
    await h.telemetry.http.serve({ method: "GET", path: "/root" }, ok);
    await h.telemetry.http.serve(
      {
        method: "GET",
        path: "/child",
        traceparent: "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-00",
      },
      ok,
    );
    await h.tick();
    assert.deepEqual(
      h.received.spans.map((span) => span.name),
      ["GET unmatched"],
    );
  });
});

describe("M1 startTelemetry, heartbeat and shutdown", () => {
  it("OBS-F-11 sets unit.running to 1 at every export interval", async () => {
    const h = harness({}, {}, "worker", "0.2.0");
    await h.tick();
    await h.tick();
    const beats = h.received.metrics.filter(
      (metric) => metric.name === "unit.running",
    );
    assert.equal(beats.length, 2);
    assert.equal(beats[0]?.kind, "gauge");
    assert.equal(beats[0]?.points[0]?.value, 1);
  });

  it("OBS-C-1 accepts only the metrics of §8 and drops attributes that are not in their row", async () => {
    const h = harness();
    h.telemetry.meter.setGauge("queue.jobs.waiting", 4, {
      queue: "processing",
      email: "ada@example.org",
    });
    await h.tick();
    const metric = h.received.metrics.find(
      (item) => item.name === "queue.jobs.waiting",
    );
    assert.deepEqual(metric?.points[0]?.attributes, { queue: "processing" });
    assert.equal(metric?.points[0]?.value, 4);
  });

  it("OBS-E-1 delivers the buffers once at shutdown", async () => {
    const h = harness();
    h.telemetry.log.info("last words");
    await h.telemetry.shutdown();
    assert.deepEqual(
      h.received.logs.map((entry) => entry.message),
      ["last words"],
    );
  });

  it("OBS-F-31 exports nothing while telemetry is off", async () => {
    const h = harness({ enabled: false });
    let ran = false;
    await h.telemetry.http.serve({ method: "GET", path: "/a" }, () => {
      ran = true;
      h.telemetry.meter.setGauge("unit.running", 1);
      return { status: 200 };
    });
    await h.tick();
    await h.telemetry.shutdown();
    assert.equal(ran, true);
    assert.deepEqual(h.received, { metrics: [], logs: [], spans: [] });
  });
});

describe("OBS-AC-1.4 Structured logs", () => {
  it("OBS-AC-1.4 writes one JSON object with the trace ID of the request and redacted secrets, and none at start", async () => {
    const h = harness({}, { routes: routes.patterns }, "identity", "0.2.0");
    h.telemetry.log.info("unit started", {});
    await h.telemetry.http.serve({ method: "POST", path: "/s/x" }, () => {
      h.telemetry.log.warn("login refused", {
        password: "hunter2hunter2",
        sessionToken: "s3cr3t",
      });
      return { status: 401 };
    });
    await h.tick();
    const [start, inside] = parsed(h.lines);
    assert.ok(start && inside);
    assert.equal("traceId" in start, false);
    const span = h.received.spans[0];
    assert.ok(span);
    assert.deepEqual(Object.keys(inside), [
      "time",
      "level",
      "unit",
      "version",
      "message",
      "traceId",
      "spanId",
      "attributes",
    ]);
    assert.equal(inside.traceId, span.traceId);
    assert.equal(inside.spanId, span.spanId);
    assert.deepEqual(inside.attributes, {
      password: "[redacted]",
      sessionToken: "[redacted]",
    });
    assert.equal(h.lines[1]?.includes("hunter2hunter2"), false);
    assert.equal(JSON.stringify(h.received.logs).includes("s3cr3t"), false);
  });
});

describe("OBS-AC-1.6 No person identifiers", () => {
  it("OBS-AC-1.6 OBS-F-13 OBS-NF-2 holds no IP address, e-mail address, share-link token, or query string anywhere", async () => {
    const h = harness({ logLevel: "debug" }, { routes: routes.patterns });
    await h.telemetry.http.serve(
      { method: "GET", path: "/s/AbCdEf123?x=1" },
      () => {
        h.telemetry.log.error("share link opened by ada@example.org", {
          detail: "from 203.0.113.7",
        });
        return { status: 500 };
      },
    );
    await h.tick();
    const everything = JSON.stringify([h.lines, h.received]);
    for (const secret of ["203.0.113.7", "ada@example.org", "AbCdEf123", "x=1"])
      assert.equal(everything.includes(secret), false, secret);
    assert.equal(h.received.spans[0]?.attributes.route, "/s/{token}");
  });
});

async function closedPort(): Promise<number> {
  const server = createServer();
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  await new Promise<void>((resolve) => server.close(() => resolve()));
  return port;
}

describe("OBS-AC-1.7 Units without the stack", () => {
  it("OBS-AC-1.7 OBS-NF-9 OBS-E-1 answers at once and keeps writing JSON lines while the collector does not answer", async () => {
    const port = await closedPort();
    const lines: string[] = [];
    const telemetry = startTelemetry(
      "storage",
      "0.2.0",
      { ...baseConfig, endpoint: `http://127.0.0.1:${port}` },
      { stdout: (line) => lines.push(line), scheduler: () => () => undefined },
    );
    const started = Date.now();
    const answer = await telemetry.http.serve(
      { method: "GET", path: "/a" },
      () => {
        telemetry.log.info("handled");
        return { status: 200 };
      },
    );
    assert.equal(answer.status, 200);
    assert.ok(Date.now() - started < 500);
    await telemetry.flush();
    await telemetry.shutdown();
    assert.equal(lines.length, 1);
    assert.equal(parsed(lines)[0]?.message, "handled");
  });

  it("OBS-F-1 OBS-C-1 sends the three kinds as OTLP/JSON to the endpoint of the collector", async () => {
    const received: { url: string; body: Record<string, unknown> }[] = [];
    const server = createServer((request, response) => {
      const chunks: Buffer[] = [];
      request.on("data", (chunk: Buffer) => chunks.push(chunk));
      request.on("end", () => {
        received.push({
          url: request.url ?? "",
          body: JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<
            string,
            unknown
          >,
        });
        response.writeHead(200, { "content-type": "application/json" });
        response.end("{}");
      });
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const { port } = server.address() as AddressInfo;
    try {
      const telemetry = startTelemetry(
        "cms",
        "0.2.0",
        { ...baseConfig, endpoint: `http://127.0.0.1:${port}` },
        { stdout: () => undefined, scheduler: () => () => undefined },
      );
      await telemetry.http.serve({ method: "GET", path: "/a" }, () => {
        telemetry.log.info("inside");
        return { status: 200 };
      });
      await telemetry.flush();
      await telemetry.shutdown();
      assert.deepEqual(received.map((r) => r.url).sort(), [
        "/v1/logs",
        "/v1/metrics",
        "/v1/traces",
      ]);
      const logs = received.find((r) => r.url === "/v1/logs")?.body as {
        resourceLogs: {
          resource: {
            attributes: { key: string; value: { stringValue: string } }[];
          };
          scopeLogs: {
            logRecords: { body: { stringValue: string }; traceId: string }[];
          }[];
        }[];
      };
      const resource = logs.resourceLogs[0]?.resource.attributes;
      assert.deepEqual(
        resource?.map((a) => [a.key, a.value.stringValue]),
        [
          ["service.name", "cms"],
          ["service.version", "0.2.0"],
        ],
      );
      const record = logs.resourceLogs[0]?.scopeLogs[0]?.logRecords[0];
      assert.equal(record?.body.stringValue, "inside");
      assert.match(record?.traceId ?? "", /^[0-9a-f]{32}$/);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});
