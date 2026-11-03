import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

// Observability stack, slice 1 of OBS-US-1 (documentation/concepts/observability.md §16 and §17).
// The file tests read the stack definition and the files of docker/observability as data; the
// stack tests at the end start the real stack and run only with STACK_TEST=1 (§17, "CI Test
// Constraints": until the pipeline offers a container runtime they run locally and the result is
// stated in the merge request).

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const profile = "observability";
const stackServices = [
  "obs-config",
  "collector",
  "prometheus",
  "loki",
  "tempo",
  "grafana",
];
const longRunning = stackServices.filter((name) => name !== "obs-config");

type Service = {
  image?: string;
  build?: { dockerfile?: string };
  profiles?: string[];
  restart?: string;
  mem_limit?: string;
  ports?: string[];
  command?: string[] | string;
  environment?: Record<string, string>;
  healthcheck?: { test?: string[] };
  depends_on?: Record<string, { condition?: string }>;
};
type Compose = { services: Record<string, Service> };

/** A compose reference such as ${NAME:-default}, written without a template placeholder. */
function reference(before: string, inside: string, after: string): string {
  return `${before}$\{${inside}}${after}`;
}

function readText(path: string): string {
  return readFileSync(join(root, path), "utf8");
}

function readCompose(): Compose {
  return parse(readText("docker-compose.yml")) as Compose;
}

function memoryInMegabytes(limit: string | undefined): number {
  const match = /^(\d+)([mg])$/.exec(limit ?? "");
  assert.ok(match, `memory limit "${limit}" is not of the form 192m or 1g`);
  return Number(match[1]) * (match[2] === "g" ? 1024 : 1);
}

describe("OBS-AC-1.5 Observability profile (OBS-F-5, OBS-T-5)", () => {
  const services = readCompose().services;

  it("OBS-AC-1.5 puts the configuration step, the collector, the three stores, and the dashboard tool into the profile observability and nothing else", () => {
    const inProfile = Object.entries(services)
      .filter(([, service]) => service.profiles?.includes(profile))
      .map(([name]) => name)
      .sort();
    assert.deepEqual(inProfile, [...stackServices].sort());
    for (const name of stackServices) {
      assert.deepEqual(services[name]?.profiles, [profile], name);
    }
  });

  it("OBS-AC-1.5 switches the profile on in the example configuration with COMPOSE_PROFILES=observability", () => {
    assert.match(readText(".env.example"), /^COMPOSE_PROFILES=observability$/m);
  });

  it("OBS-AC-1.5 gives each of the five long-running containers a health check (OBS-F-5, SCF-F-20)", () => {
    for (const name of longRunning) {
      assert.ok(
        services[name]?.healthcheck?.test,
        `${name} has no health check`,
      );
    }
  });

  it("OBS-AC-1.5 runs the configuration step once and lets it end (OBS-F-28, SCF-F-20)", () => {
    assert.equal(services["obs-config"]?.restart, "no");
    assert.equal(services["obs-config"]?.healthcheck, undefined);
  });

  it("OBS-AC-1.5 starts the collector and the stores only after the configuration step has ended with 0 (OBS-F-28)", () => {
    for (const name of [
      "collector",
      "prometheus",
      "loki",
      "tempo",
      "grafana",
    ]) {
      assert.equal(
        services[name]?.depends_on?.["obs-config"]?.condition,
        "service_completed_successfully",
        name,
      );
    }
  });

  it("OBS-AC-1.5 starts the dashboard tool only after the three stores are healthy (OBS-F-5, OBS-NF-7)", () => {
    for (const store of ["prometheus", "loki", "tempo"]) {
      assert.equal(
        services.grafana?.depends_on?.[store]?.condition,
        "service_healthy",
        store,
      );
    }
  });

  it("OBS-AC-1.5 hands the nine variables of the stack to the configuration step by name, with their defaults (OBS-F-28, OBS-E-4)", () => {
    const env = services["obs-config"]?.environment ?? {};
    for (const name of [
      "OBS_METRICS_RETENTION_DAYS",
      "OBS_LOGS_RETENTION_DAYS",
      "OBS_TRACES_RETENTION_DAYS",
      "OBS_ALERT_ERROR_RATE_PERCENT",
      "OBS_ALERT_MIN_REQUESTS",
      "OBS_ALERT_STORAGE_PERCENT",
      "OBS_ALERT_QUEUE_MIN_WAITING",
      "OBS_ALERT_SILENT_MINUTES",
      "OBS_DASHBOARD_PORT",
    ]) {
      assert.match(env[name] ?? "", new RegExp(`^\\$\\{${name}:-`), name);
      assert.match(readText(".env.example"), new RegExp(`^${name}=`, "m"));
    }
  });
});

describe("OBS-AC-1.5 Limits, retention, and ports of the stack (OBS-NF-4, OBS-NF-7, OBS-NF-8, OBS-F-5, OBS-T-17)", () => {
  const services = readCompose().services;

  it("OBS-AC-1.5 limits the memory of the six containers to 1536 MB together (OBS-NF-8)", () => {
    const total = stackServices
      .map((name) => memoryInMegabytes(services[name]?.mem_limit))
      .reduce((sum, megabytes) => sum + megabytes, 0);
    assert.ok(total <= 1536, `${total} MB are more than 1536 MB`);
  });

  it("OBS-AC-1.5 publishes no host port except the dashboard tool on 127.0.0.1 and OBS_DASHBOARD_PORT (OBS-NF-7)", () => {
    for (const name of stackServices) {
      if (name === "grafana") continue;
      assert.equal(services[name]?.ports, undefined, name);
    }
    assert.deepEqual(services.grafana?.ports, [
      reference("127.0.0.1:", "OBS_DASHBOARD_PORT:-3300", ":3000"),
    ]);
  });

  it("OBS-AC-1.5 takes the retention of each store from its variable (OBS-NF-4)", () => {
    const prometheus = JSON.stringify(services.prometheus?.command);
    assert.match(
      prometheus,
      /retention\.time=\$\{OBS_METRICS_RETENTION_DAYS:-15\}d/,
    );
    assert.equal(
      services.loki?.environment?.OBS_LOGS_RETENTION_DAYS,
      reference("", "OBS_LOGS_RETENTION_DAYS:-7", ""),
    );
    assert.match(
      readText("docker/observability/loki.yaml"),
      /retention_period: \$\{OBS_LOGS_RETENTION_DAYS\}d/,
    );
    assert.match(
      readText("docker/observability/tempo.template.yaml"),
      /block_retention: __OBS_TRACES_RETENTION_HOURS__h/,
    );
  });

  it("OBS-AC-1.5 pins every image of the stack to a version, never latest (SCF-AC-2.5, SCF-AC-5.3)", () => {
    for (const name of stackServices) {
      const service = services[name];
      if (service?.image === undefined) continue;
      assert.match(service.image.split(":")[1] ?? "", /^v?\d+\.\d+/, name);
    }
  });

  it("OBS-AC-1.5 gives the images without a shell a pinned Dockerfile and lets the container scan cover its base images (SCF-AC-5.2)", () => {
    for (const name of ["collector", "loki", "tempo"]) {
      const dockerfile = services[name]?.build?.dockerfile;
      assert.equal(dockerfile, `docker/observability/${name}.Dockerfile`);
      const text = readText(dockerfile as string);
      for (const from of text.matchAll(/^FROM (\S+)/gm)) {
        assert.match(from[1] as string, /:\d+\.\d+/, `${name}: ${from[1]}`);
      }
    }
    assert.match(
      readText(".gitlab-ci.yml"),
      /docker\/observability\/\*\.Dockerfile/,
    );
  });

  it("OBS-AC-1.5 switches update checks, usage reporting, plugin downloads, login form, and self-registration of the dashboard tool off (OBS-NF-1, OBS-F-10)", () => {
    const env = services.grafana?.environment ?? {};
    assert.equal(env.GF_ANALYTICS_REPORTING_ENABLED, "false");
    assert.equal(env.GF_ANALYTICS_CHECK_FOR_UPDATES, "false");
    assert.equal(env.GF_ANALYTICS_CHECK_FOR_PLUGIN_UPDATES, "false");
    assert.equal(env.GF_PLUGINS_PREINSTALL_DISABLED, "true");
    assert.equal(env.GF_AUTH_DISABLE_LOGIN_FORM, "true");
    assert.equal(env.GF_USERS_ALLOW_SIGN_UP, "false");
    assert.equal(env.GF_AUTH_ANONYMOUS_ORG_ROLE, "Viewer");
  });
});

describe("OBS-AC-1.2 Collector routing (OBS-F-2, OBS-F-29, OBS-NF-3, OBS-T-2, OBS-T-32)", () => {
  type Pipeline = {
    receivers: string[];
    processors: string[];
    exporters: string[];
  };
  const collector = parse(readText("docker/observability/collector.yaml")) as {
    receivers: Record<string, unknown>;
    service: { pipelines: Record<string, Pipeline> };
  };
  const pipelines = collector.service.pipelines;

  it("OBS-AC-1.2 routes metrics only to the metric store, log entries only to the log store, and spans only to the trace store (OBS-F-2)", () => {
    assert.deepEqual(pipelines.metrics?.exporters, ["otlphttp/prometheus"]);
    assert.deepEqual(pipelines.logs?.exporters, ["otlphttp/loki"]);
    assert.deepEqual(pipelines.traces?.exporters, ["otlp/tempo"]);
  });

  it("OBS-AC-1.2 receives all three kinds over the telemetry protocol on the internal network (OBS-F-2, OBS-NF-7)", () => {
    for (const pipeline of Object.values(pipelines)) {
      assert.deepEqual(pipeline.receivers, ["otlp"]);
    }
    assert.ok(collector.receivers.otlp);
  });

  it("OBS-AC-1.2 removes person identifiers before forwarding: span attributes by allowed list, log attributes by client detail list, secrets, and patterns in text (OBS-F-29)", () => {
    const text = readText("docker/observability/collector.yaml");
    assert.deepEqual(pipelines.traces?.processors.slice(0, 1), [
      "memory_limiter",
    ]);
    assert.ok(pipelines.traces?.processors.includes("transform/spans"));
    assert.ok(pipelines.logs?.processors.includes("transform/logs"));
    assert.ok(pipelines.logs?.processors.includes("redaction/logs"));
    assert.match(text, /keep_matching_keys\(span\.attributes/);
    assert.match(text, /delete_matching_keys\(log\.attributes/);
    assert.match(text, /\[redacted\]/);
  });

  it("OBS-AC-1.2 batches for at most 5 seconds and keeps items for at most 5 minutes when a store is unreachable (OBS-NF-3, OBS-E-2)", () => {
    const text = readText("docker/observability/collector.yaml");
    assert.match(text, /timeout: 5s/);
    for (const exporter of [
      "otlphttp/prometheus",
      "otlphttp/loki",
      "otlp/tempo",
    ]) {
      assert.match(text, new RegExp(`${exporter.replace("/", "\\/")}:`));
    }
    assert.match(text, /max_elapsed_time: 300s/);
    assert.match(text, /max_interval: 30s/);
  });
});

describe("OBS-AC-1.5 Configuration step, check part (OBS-F-28, OBS-E-4, OBS-T-37)", () => {
  const script = join(root, "docker", "observability", "check-config.ts");
  const template = join(root, "docker", "observability", "tempo.template.yaml");

  function run(env: Record<string, string>, out: string) {
    return spawnSync(process.execPath, [script], {
      env: {
        PATH: process.env.PATH ?? "",
        OBS_GENERATED_DIR: out,
        OBS_TEMPLATE_DIR: dirname(template),
        ...env,
      },
      encoding: "utf8",
    });
  }

  let out = "";
  before(() => {
    out = mkdtempSync(join(tmpdir(), "obs-config-"));
  });
  after(() => rmSync(out, { recursive: true, force: true }));

  it("OBS-AC-1.5 prints one line per invalid variable with name and reason, never the value, and exits with 1 (OBS-E-4, OBS-T-37)", () => {
    const result = run(
      { OBS_LOGS_RETENTION_DAYS: "45", OBS_DASHBOARD_PORT: "80" },
      out,
    );
    assert.equal(result.status, 1);
    const printed = `${result.stdout}${result.stderr}`;
    assert.equal(
      printed,
      [
        "Invalid configuration for the observability stack:",
        "  OBS_LOGS_RETENTION_DAYS: expected an integer between 1 and 30",
        "  OBS_DASHBOARD_PORT: expected an integer between 1024 and 65535",
        "",
      ].join("\n"),
    );
    assert.doesNotMatch(printed, /\b45\b|\b80\b/);
  });

  it("OBS-AC-1.5 names every invalid value of the decimal and integer variables with its range and writes nothing (OBS-E-4)", () => {
    const result = run(
      {
        OBS_METRICS_RETENTION_DAYS: "0",
        OBS_ALERT_ERROR_RATE_PERCENT: "abc",
        OBS_ALERT_STORAGE_PERCENT: "100.5",
        OBS_ALERT_SILENT_MINUTES: "2.5",
      },
      out,
    );
    assert.equal(result.status, 1);
    assert.equal(
      result.stdout,
      [
        "Invalid configuration for the observability stack:",
        "  OBS_METRICS_RETENTION_DAYS: expected an integer between 1 and 90",
        "  OBS_ALERT_ERROR_RATE_PERCENT: expected a number between 0.1 and 100",
        "  OBS_ALERT_STORAGE_PERCENT: expected a number between 1 and 100",
        "  OBS_ALERT_SILENT_MINUTES: expected an integer between 1 and 60",
        "",
      ].join("\n"),
    );
    assert.equal(existsSync(join(out, "tempo.yaml")), false);
  });

  it("OBS-AC-1.5 exits with 0 for the defaults and writes the trace store configuration with the retention in hours (OBS-F-28, OBS-NF-4)", () => {
    const result = run({}, out);
    assert.equal(result.status, 0, result.stdout);
    assert.equal(result.stdout, "");
    const tempo = readFileSync(join(out, "tempo.yaml"), "utf8");
    assert.match(tempo, /block_retention: 168h/);
    assert.doesNotMatch(tempo, /__OBS_/);
  });

  it("OBS-AC-1.5 takes an empty value as missing and uses the default; accepts the limits of the valid range (OBS-F-28)", () => {
    const result = run(
      {
        OBS_TRACES_RETENTION_DAYS: "30",
        OBS_LOGS_RETENTION_DAYS: "",
        OBS_DASHBOARD_PORT: "1024",
        OBS_ALERT_ERROR_RATE_PERCENT: "0.1",
      },
      out,
    );
    assert.equal(result.status, 0, result.stdout);
    assert.match(
      readFileSync(join(out, "tempo.yaml"), "utf8"),
      /block_retention: 720h/,
    );
  });
});

describe("OBS-AC-1.5 Proxy removes outside trace headers (OBS-F-16)", () => {
  it("OBS-AC-1.5 removes traceparent, tracestate, and baggage from every incoming request before forwarding it (OBS-F-16)", () => {
    const caddyfile = readText("docker/Caddyfile");
    for (const header of ["traceparent", "tracestate", "baggage"]) {
      assert.match(
        caddyfile,
        new RegExp(`request_header -${header}\\b`),
        header,
      );
    }
  });
});

// ---------------------------------------------------------------------------------------------
// Stack tests: start the real stack. STACK_TEST=1 switches them on (needs Docker with Compose v2
// and the images; the first run pulls and builds them).
// ---------------------------------------------------------------------------------------------

const stackTestOn = process.env.STACK_TEST === "1";
const skipReason = stackTestOn
  ? false
  : "stack test: set STACK_TEST=1 to start the stack with Docker (OBS-T-2, OBS-T-5, OBS-T-32 run locally until CI offers a container runtime, §17)";
const project = "stash-obs-test";
const composeArgs = [
  "compose",
  "-p",
  project,
  "--env-file",
  ".env.example",
  "-f",
  "docker-compose.yml",
];

function compose(
  args: string[],
  input?: string,
  env?: Record<string, string>,
): string {
  return execFileSync("docker", [...composeArgs, ...args], {
    cwd: root,
    encoding: "utf8",
    input,
    env: { ...process.env, ...env },
    maxBuffer: 32 * 1024 * 1024,
  });
}

function inStack(command: string[], input?: string): string {
  return compose(["exec", "-T", "grafana", ...command], input);
}

function postOtlp(kind: "logs" | "metrics" | "traces", body: unknown): string {
  return inStack(
    [
      "curl",
      "-s",
      "-o",
      "/dev/null",
      "-w",
      "%{http_code}",
      "-X",
      "POST",
      "-H",
      "Content-Type: application/json",
      "--data-binary",
      "@-",
      `http://collector:4318/v1/${kind}`,
    ],
    JSON.stringify(body),
  );
}

function get(url: string, query?: Record<string, string>): string {
  const args = ["curl", "-s", "-G", url];
  for (const [key, value] of Object.entries(query ?? {})) {
    args.push("--data-urlencode", `${key}=${value}`);
  }
  return inStack(args);
}

async function eventually(
  check: () => boolean,
  seconds = 60,
): Promise<boolean> {
  const end = Date.now() + seconds * 1000;
  while (Date.now() < end) {
    try {
      if (check()) return true;
    } catch {
      // the store is not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
  return false;
}

const attribute = (key: string, value: string) => ({
  key,
  value: { stringValue: value },
});
const resource = (unit: string) => ({
  attributes: [
    attribute("service.name", unit),
    attribute("service.version", "0.0.0-test"),
  ],
});
const nanos = () => `${Date.now()}000000`;

describe("OBS-AC-1.5 Started stack (OBS-T-5)", { skip: skipReason }, () => {
  before(() => {
    compose([
      "up",
      "-d",
      "--build",
      "--wait",
      "--wait-timeout",
      "240",
      "grafana",
      "collector",
    ]);
  });
  after(() => {
    compose(["down", "-v"]);
  });

  it("OBS-AC-1.5 starts the configuration step with exit code 0 and the five long-running containers healthy (OBS-F-5, OBS-T-5)", () => {
    const states = compose(["ps", "-a", "--format", "json"])
      .trim()
      .split("\n")
      .map(
        (line) =>
          JSON.parse(line) as {
            Service: string;
            State: string;
            Health: string;
            ExitCode: number;
          },
      );
    const byService = new Map(states.map((state) => [state.Service, state]));
    assert.equal(byService.get("obs-config")?.State, "exited");
    assert.equal(byService.get("obs-config")?.ExitCode, 0);
    for (const name of longRunning) {
      assert.equal(byService.get(name)?.Health, "healthy", name);
    }
  });

  it("OBS-AC-1.5 starts none of the six containers when the profile is removed from the configuration (OBS-F-5, OBS-T-5)", () => {
    const services = compose(["config", "--services"], undefined, {
      COMPOSE_PROFILES: "",
    })
      .trim()
      .split("\n");
    for (const name of stackServices) {
      assert.ok(
        !services.includes(name),
        `${name} is part of the stack without the profile`,
      );
    }
  });

  it("OBS-AC-1.5 publishes the dashboard tool on 127.0.0.1 only and no other port of the profile (OBS-NF-7, OBS-T-39)", () => {
    const published = compose(["ps", "--format", "json"])
      .trim()
      .split("\n")
      .map(
        (line) =>
          JSON.parse(line) as {
            Service: string;
            Publishers: { URL: string; PublishedPort: number }[] | null;
          },
      );
    for (const container of published) {
      if (!stackServices.includes(container.Service)) continue;
      for (const publisher of container.Publishers ?? []) {
        if (publisher.PublishedPort === 0) continue;
        assert.equal(container.Service, "grafana");
        assert.equal(publisher.URL, "127.0.0.1");
      }
    }
  });

  it("OBS-AC-1.2 delivers a metric only to the metric store, a log entry only to the log store, and a span only to the trace store within 60 seconds (OBS-F-2, OBS-NF-3, OBS-T-2)", async () => {
    const marker = `routing${Date.now()}`;
    const traceId = "4bf92f3577b34da6a3ce929d0e0e4736";
    assert.equal(
      postOtlp("metrics", {
        resourceMetrics: [
          {
            resource: resource("web"),
            scopeMetrics: [
              {
                metrics: [
                  {
                    name: "unit.running",
                    gauge: {
                      dataPoints: [{ asInt: "1", timeUnixNano: nanos() }],
                    },
                  },
                ],
              },
            ],
          },
        ],
      }),
      "200",
    );
    assert.equal(
      postOtlp("logs", {
        resourceLogs: [
          {
            resource: resource("web"),
            scopeLogs: [
              {
                logRecords: [
                  {
                    timeUnixNano: nanos(),
                    severityText: "info",
                    body: { stringValue: `unit started ${marker}` },
                  },
                ],
              },
            ],
          },
        ],
      }),
      "200",
    );
    assert.equal(
      postOtlp("traces", {
        resourceSpans: [
          {
            resource: resource("web"),
            scopeSpans: [
              {
                spans: [
                  {
                    traceId,
                    spanId: "00f067aa0ba902b7",
                    name: "GET /health-probe",
                    kind: 2,
                    startTimeUnixNano: nanos(),
                    endTimeUnixNano: nanos(),
                  },
                ],
              },
            ],
          },
        ],
      }),
      "200",
    );

    const metric = await eventually(() =>
      get("http://prometheus:9090/api/v1/query", {
        query: 'unit_running{service_name="web"}',
      }).includes('"value"'),
    );
    const log = await eventually(() =>
      get("http://loki:3100/loki/api/v1/query_range", {
        query: '{service_name="web"}',
      }).includes(marker),
    );
    const span = await eventually(() =>
      get(`http://tempo:3200/api/traces/${traceId}`).includes(
        "GET /health-probe",
      ),
    );
    assert.ok(metric, "the metric did not reach the metric store");
    assert.ok(log, "the log entry did not reach the log store");
    assert.ok(span, "the span did not reach the trace store");
  });

  it("OBS-AC-1.2 stores exactly the Stored column of the redaction table: addresses in text, client details, and attributes outside the allowed list are removed (OBS-F-29, OBS-NF-2, OBS-T-32)", async () => {
    const marker = `redaction${Date.now()}`;
    const traceId = "5bf92f3577b34da6a3ce929d0e0e4737";
    const message = (text: string) => ({
      timeUnixNano: nanos(),
      severityText: "error",
      body: { stringValue: `${marker} ${text}` },
      attributes: [] as { key: string; value: { stringValue: string } }[],
    });
    const first = message(
      "share link opened by ada@example.org from 203.0.113.7 at 10:00:00",
    );
    const second = message("upstream fe80::1 refused");
    const third = message("retry 1.2.3.4");
    const fourth = message("attributes");
    fourth.attributes = [
      attribute("client.address", "203.0.113.7"),
      attribute("user_agent", "Firefox/140"),
      attribute("jobId", "j-881"),
      attribute("password", "hunter2hunter2"),
    ];
    assert.equal(
      postOtlp("logs", {
        resourceLogs: [
          {
            resource: resource("web"),
            scopeLogs: [{ logRecords: [first, second, third, fourth] }],
          },
        ],
      }),
      "200",
    );
    assert.equal(
      postOtlp("traces", {
        resourceSpans: [
          {
            resource: resource("web"),
            scopeSpans: [
              {
                spans: [
                  {
                    traceId,
                    spanId: "11f067aa0ba902b7",
                    name: "GET /s/{token}",
                    kind: 2,
                    startTimeUnixNano: nanos(),
                    endTimeUnixNano: nanos(),
                    attributes: [
                      attribute("url.full", "https://example.org/s/AbCdEf?x=1"),
                      attribute("http.route", "/s/{token}"),
                    ],
                  },
                ],
              },
            ],
          },
        ],
      }),
      "200",
    );

    let logs = "";
    assert.ok(
      await eventually(() => {
        logs = get("http://loki:3100/loki/api/v1/query_range", {
          query: `{service_name="web"} |= "${marker}"`,
          limit: "50",
        });
        return (logs.match(new RegExp(marker, "g")) ?? []).length >= 4;
      }),
      "the log entries did not reach the log store",
    );
    assert.match(
      logs,
      new RegExp(
        `${marker} share link opened by \\[redacted\\] from \\[redacted\\] at 10:00:00`,
      ),
    );
    assert.match(logs, new RegExp(`${marker} upstream \\[redacted\\] refused`));
    assert.match(logs, new RegExp(`${marker} retry \\[redacted\\]`));
    for (const secret of [
      "ada@example.org",
      "203.0.113.7",
      "fe80::1",
      "1.2.3.4",
      "Firefox/140",
      "hunter2hunter2",
    ]) {
      assert.ok(!logs.includes(secret), `${secret} is in the log store`);
    }
    assert.match(logs, /j-881/);

    let trace = "";
    assert.ok(
      await eventually(() => {
        trace = get(`http://tempo:3200/api/traces/${traceId}`);
        return trace.includes("GET /s/{token}");
      }),
      "the span did not reach the trace store",
    );
    assert.ok(!trace.includes("url.full"), "url.full is in the trace store");
    assert.ok(
      !trace.includes("AbCdEf?x=1"),
      "the query string is in the trace store",
    );
    assert.match(trace, /\/s\/\{token\}/);
  });
});
