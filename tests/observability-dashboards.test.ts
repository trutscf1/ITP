import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

// Operations dashboards, slice 1 of OBS-US-2 (documentation/concepts/observability.md §16 and
// §17): the dashboard tool with the data sources, the dashboard, and the links as files of the
// repository. The file tests read those files as data (OBS-T-11, parsing part); the stack tests at
// the end start the real stack and run only with STACK_TEST=1 (§17, "CI Test Constraints": until
// the pipeline offers a container runtime they run locally and the result is stated in the merge
// request).

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = "docker/observability/grafana";

function readText(path: string): string {
  return readFileSync(join(root, path), "utf8");
}

type DataSource = {
  name: string;
  uid: string;
  type: string;
  url: string;
  access?: string;
  editable?: boolean;
  isDefault?: boolean;
  jsonData?: Record<string, unknown>;
};
type Provider = {
  name: string;
  type: string;
  allowUiUpdates?: boolean;
  disableDeletion?: boolean;
  options?: { path?: string };
};
type Link = { title?: string; url?: string };
type Panel = {
  title: string;
  type: string;
  datasource?: { uid?: string };
  targets?: { expr?: string }[];
  fieldConfig?: { defaults?: { unit?: string; links?: Link[] } };
  links?: Link[];
};
type Dashboard = {
  uid: string;
  title: string;
  refresh: string;
  editable?: boolean;
  time: { from: string; to: string };
  panels: Panel[];
  templating?: { list: { name: string }[] };
};
type Compose = {
  services: Record<
    string,
    { volumes?: string[]; environment?: Record<string, string> }
  >;
};

function dataSources(): DataSource[] {
  const file = parse(
    readText(`${base}/provisioning/datasources/datasources.yaml`),
  ) as {
    apiVersion: number;
    datasources: DataSource[];
  };
  return file.datasources;
}

function dashboard(): Dashboard {
  return JSON.parse(
    readText(`${base}/dashboards/operations-overview.json`),
  ) as Dashboard;
}

const logPanels = [
  "Requests per second",
  "Server errors",
  "Latency (95th percentile)",
];

describe("OBS-AC-2.4 Dashboards as code, files (OBS-F-9, OBS-E-8, OBS-T-11)", () => {
  it("OBS-AC-2.4 keeps the data sources, the dashboard provider, and the dashboard as files that parse (OBS-F-9, OBS-E-8)", () => {
    for (const path of [
      "provisioning/datasources/datasources.yaml",
      "provisioning/dashboards/dashboards.yaml",
      "dashboards/operations-overview.json",
    ]) {
      assert.ok(existsSync(join(root, base, path)), path);
    }
    assert.equal(dataSources().length, 3);
    assert.ok(dashboard().panels.length >= 3);
  });

  it("OBS-AC-2.4 provisions the metric, log, and trace store as data sources that the dashboard tool reaches on the internal network and nobody can edit (OBS-F-9, OBS-NF-7)", () => {
    const byUid = new Map(dataSources().map((source) => [source.uid, source]));
    assert.deepEqual([...byUid.keys()].sort(), ["loki", "prometheus", "tempo"]);
    assert.equal(byUid.get("prometheus")?.type, "prometheus");
    assert.equal(byUid.get("prometheus")?.url, "http://prometheus:9090");
    assert.equal(byUid.get("loki")?.type, "loki");
    assert.equal(byUid.get("loki")?.url, "http://loki:3100");
    assert.equal(byUid.get("tempo")?.type, "tempo");
    assert.equal(byUid.get("tempo")?.url, "http://tempo:3200");
    for (const source of byUid.values()) {
      assert.equal(source.access, "proxy", source.uid);
      assert.equal(source.editable, false, source.uid);
    }
    assert.equal(byUid.get("prometheus")?.isDefault, true);
  });

  it("OBS-AC-2.4 loads the dashboards from the folder of the repository and refuses every change made in the dashboard tool (OBS-F-9)", () => {
    const file = parse(
      readText(`${base}/provisioning/dashboards/dashboards.yaml`),
    ) as {
      providers: Provider[];
    };
    assert.equal(file.providers.length, 1);
    const provider = file.providers[0] as Provider;
    assert.equal(provider.type, "file");
    assert.equal(provider.allowUiUpdates, false);
    assert.equal(provider.disableDeletion, true);
    assert.equal(provider.options?.path, "/etc/grafana/dashboards");
  });

  it("OBS-AC-2.4 mounts the provisioning files and the dashboards read-only into the dashboard tool, so the files stay the only source (OBS-F-9)", () => {
    const compose = parse(readText("docker-compose.yml")) as Compose;
    const volumes = compose.services.grafana?.volumes ?? [];
    assert.ok(
      volumes.includes(`./${base}/provisioning:/etc/grafana/provisioning:ro`),
      "provisioning",
    );
    assert.ok(
      volumes.includes(`./${base}/dashboards:/etc/grafana/dashboards:ro`),
      "dashboards",
    );
  });

  it("OBS-F-6 OBS-U-1 stores the dashboard 'Operations overview' with the time range last hour, refresh 30 seconds, and a unit selector", () => {
    const board = dashboard();
    assert.equal(board.title, "Operations overview");
    assert.equal(board.uid, "operations-overview");
    assert.equal(board.time.from, "now-1h");
    assert.equal(board.time.to, "now");
    assert.equal(board.refresh, "30s");
    assert.ok(
      board.templating?.list.some((variable) => variable.name === "unit"),
    );
  });

  it("OBS-NF-1 keeps the update checks, the usage reporting, and the plugin downloads of the dashboard tool off while it loads the files", () => {
    const env =
      (parse(readText("docker-compose.yml")) as Compose).services.grafana
        ?.environment ?? {};
    assert.equal(env.GF_ANALYTICS_CHECK_FOR_UPDATES, "false");
    assert.equal(env.GF_ANALYTICS_REPORTING_ENABLED, "false");
    assert.equal(env.GF_PLUGINS_PREINSTALL_DISABLED, "true");
    assert.equal(env.GF_INSTALL_PLUGINS, undefined);
  });
});

describe("OBS-AC-2.2 Linked logs and traces, files (OBS-F-7, OBS-T-9)", () => {
  it("OBS-AC-2.2 gives the panels Requests per second, Server errors, and Latency (95th percentile) a link that opens the log entries of the selected unit in the log store (OBS-F-7)", () => {
    const panels = dashboard().panels;
    for (const title of logPanels) {
      const panel = panels.find((candidate) => candidate.title === title);
      assert.ok(panel, `${title} is missing`);
      const links = [
        ...(panel.fieldConfig?.defaults?.links ?? []),
        ...(panel.links ?? []),
      ];
      assert.ok(links.length > 0, `${title} has no link`);
      const url = decodeURIComponent(links[0]?.url ?? "");
      assert.match(url, /explore/, title);
      assert.match(url, /"datasource":"loki"/, title);
      assert.match(url, /service_name/, title);
      assert.match(url, /__from/, title);
      assert.match(url, /__to/, title);
    }
  });

  it("OBS-F-6 OBS-F-12 computes the three panels from the request metric of the metric store, one line per unit", () => {
    const panels = dashboard().panels;
    for (const title of logPanels) {
      const panel = panels.find((candidate) => candidate.title === title);
      assert.equal(panel?.datasource?.uid, "prometheus", title);
      const expression = panel?.targets?.[0]?.expr ?? "";
      assert.match(expression, /http_server_request_duration_seconds/, title);
      assert.match(expression, /by \([^)]*service_name/, title);
    }
  });

  it("OBS-AC-2.2 links a log entry with a trace ID to its trace and a trace to the log entries with that trace ID (OBS-F-7)", () => {
    const byUid = new Map(dataSources().map((source) => [source.uid, source]));
    const derived = (byUid.get("loki")?.jsonData?.derivedFields ?? []) as {
      datasourceUid?: string;
      matcherType?: string;
      matcherRegex?: string;
      url?: string;
    }[];
    assert.ok(derived.length > 0, "no derived field");
    for (const field of derived) {
      assert.equal(field.datasourceUid, "tempo");
      assert.equal(field.matcherType, "label");
      assert.equal(field.url, "$" + "{__value.raw}");
    }
    assert.ok(
      derived.some((field) => /^trace_?[iI]d$/.test(field.matcherRegex ?? "")),
    );
    const traceToLogs = byUid.get("tempo")?.jsonData?.tracesToLogsV2 as
      | { datasourceUid?: string; customQuery?: boolean; query?: string }
      | undefined;
    assert.equal(traceToLogs?.datasourceUid, "loki");
    assert.equal(traceToLogs?.customQuery, true);
    assert.match(traceToLogs?.query ?? "", /\$\{__trace\.traceId\}/);
  });
});

// ---------------------------------------------------------------------------------------------
// Stack tests: start the real stack. STACK_TEST=1 switches them on (needs Docker with Compose v2).
// ---------------------------------------------------------------------------------------------

const stackTestOn = process.env.STACK_TEST === "1";
const skipReason = stackTestOn
  ? false
  : "stack test: set STACK_TEST=1 to start the stack with Docker (OBS-T-9, OBS-T-11 run locally until CI offers a container runtime, §17)";
const project = "stash-obs-dash-test";
const composeArgs = [
  "compose",
  "-p",
  project,
  "--env-file",
  ".env.example",
  "-f",
  "docker-compose.yml",
];

function compose(args: string[], input?: string): string {
  return execFileSync("docker", [...composeArgs, ...args], {
    cwd: root,
    encoding: "utf8",
    input,
    env: { ...process.env, OBS_DASHBOARD_PORT: "3391" },
    maxBuffer: 32 * 1024 * 1024,
  });
}

/** Calls the dashboard tool from inside its own container; returns status code and body. */
function call(
  method: string,
  path: string,
  options: { admin?: boolean; body?: unknown } = {},
): { status: number; body: string } {
  const args = [
    "exec",
    "-T",
    "grafana",
    "curl",
    "-s",
    "-w",
    "\n%{http_code}",
    "-X",
    method,
    "-H",
    "Content-Type: application/json",
  ];
  if (options.admin) args.push("-u", "admin:admin");
  if (options.body !== undefined) args.push("--data-binary", "@-");
  args.push(`http://127.0.0.1:3000${path}`);
  const output = compose(
    args,
    options.body === undefined ? undefined : JSON.stringify(options.body),
  );
  const cut = output.lastIndexOf("\n");
  return { status: Number(output.slice(cut + 1)), body: output.slice(0, cut) };
}

async function eventually(
  check: () => boolean,
  seconds = 90,
): Promise<boolean> {
  const end = Date.now() + seconds * 1000;
  while (Date.now() < end) {
    try {
      if (check()) return true;
    } catch {
      // not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
  return false;
}

describe(
  "OBS-AC-2.4 and OBS-AC-2.2 Started stack (OBS-T-9, OBS-T-11, OBS-T-39)",
  { skip: skipReason },
  () => {
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

    it("OBS-AC-2.4 loads the three data sources and the dashboard 'Operations overview' at the start without a manual step, and the three data sources answer (OBS-F-9)", () => {
      const sources = JSON.parse(
        call("GET", "/api/datasources", { admin: true }).body,
      ) as {
        uid: string;
      }[];
      assert.deepEqual(sources.map((source) => source.uid).sort(), [
        "loki",
        "prometheus",
        "tempo",
      ]);
      for (const uid of ["prometheus", "loki", "tempo"]) {
        const health = call("GET", `/api/datasources/uid/${uid}/health`, {
          admin: true,
        });
        assert.equal(health.status, 200, `${uid}: ${health.body}`);
      }
      const found = call("GET", "/api/search?query=Operations%20overview");
      assert.equal(found.status, 200);
      assert.match(found.body, /"uid":"operations-overview"/);
      const loaded = JSON.parse(
        call("GET", "/api/dashboards/uid/operations-overview").body,
      ) as {
        meta: { provisioned: boolean };
      };
      assert.equal(loaded.meta.provisioned, true);
    });

    it("OBS-AC-2.4 refuses to save a change to the loaded dashboard and to a data source, even from an administrator (OBS-F-9, OBS-T-11)", () => {
      const loaded = JSON.parse(
        call("GET", "/api/dashboards/uid/operations-overview", { admin: true })
          .body,
      ) as { dashboard: { title: string } };
      loaded.dashboard.title = "Changed in the dashboard tool";
      const save = call("POST", "/api/dashboards/db", {
        admin: true,
        body: { dashboard: loaded.dashboard, overwrite: true },
      });
      assert.equal(save.status, 400, save.body);
      assert.match(save.body, /provisioned/i);
      const sourceChange = call("PUT", "/api/datasources/uid/prometheus", {
        admin: true,
        body: {
          name: "Renamed",
          type: "prometheus",
          url: "http://elsewhere:9090",
          access: "proxy",
        },
      });
      assert.ok(sourceChange.status >= 400, sourceChange.body);
      const after = JSON.parse(
        call("GET", "/api/dashboards/uid/operations-overview").body,
      ) as {
        dashboard: { title: string };
      };
      assert.equal(after.dashboard.title, "Operations overview");
    });

    it("OBS-AC-2.4 lets nobody without an administrator account save anything, and shows the dashboard read-only without a login (OBS-F-10, OBS-T-39)", () => {
      const anonymous = call("POST", "/api/dashboards/db", {
        body: {
          dashboard: { title: "Anonymous", panels: [] },
          overwrite: true,
        },
      });
      assert.ok(
        anonymous.status === 401 || anonymous.status === 403,
        String(anonymous.status),
      );
      assert.equal(
        call("GET", "/api/dashboards/uid/operations-overview").status,
        200,
      );
    });

    it("OBS-F-7 OBS-T-9 finds the log entries of one unit in the log store by its service name, the query behind the panel link", async () => {
      const marker = `dashlink${Date.now()}`;
      const resource = (unit: string) => ({
        attributes: [{ key: "service.name", value: { stringValue: unit } }],
      });
      const post = (kind: string, body: unknown) =>
        compose(
          [
            "exec",
            "-T",
            "grafana",
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
      const nanos = `${Date.now()}000000`;
      const traceId = "6bf92f3577b34da6a3ce929d0e0e4738";
      assert.equal(
        post("logs", {
          resourceLogs: [
            {
              resource: resource("storage"),
              scopeLogs: [
                {
                  logRecords: [
                    {
                      timeUnixNano: nanos,
                      severityText: "error",
                      body: { stringValue: marker },
                      traceId,
                      spanId: "00f067aa0ba902b8",
                    },
                  ],
                },
              ],
            },
          ],
        }),
        "200",
      );
      const found = await eventually(() => {
        const query = {
          queries: [
            {
              refId: "A",
              datasource: { uid: "loki", type: "loki" },
              expr: '{service_name="storage"}',
              queryType: "range",
              maxLines: 50,
            },
          ],
          from: "now-1h",
          to: "now",
        };
        return call("POST", "/api/ds/query", { body: query }).body.includes(
          marker,
        );
      });
      assert.ok(
        found,
        "the log entry of storage was not found through the log store data source",
      );
      const panel = dashboard().panels.find(
        (candidate) => candidate.title === "Latency (95th percentile)",
      );
      const link = decodeURIComponent(
        panel?.fieldConfig?.defaults?.links?.[0]?.url ?? "",
      );
      assert.match(
        link,
        /\{service_name=\\?"\$\{__field\.labels\.service_name\}\\?"\}/,
      );
    });

    it("OBS-AC-2.2 keeps the trace ID of a log entry where the link of the log store data source finds it (OBS-F-7, OBS-T-9)", () => {
      const query = {
        queries: [
          {
            refId: "A",
            datasource: { uid: "loki", type: "loki" },
            expr: '{service_name="storage"}',
            queryType: "range",
            maxLines: 50,
          },
        ],
        from: "now-1h",
        to: "now",
      };
      const body = call("POST", "/api/ds/query", { body: query }).body;
      const source = JSON.parse(
        call("GET", "/api/datasources/uid/loki", { admin: true }).body,
      ) as {
        jsonData: { derivedFields: { matcherRegex: string }[] };
      };
      const names = source.jsonData.derivedFields.map(
        (field) => field.matcherRegex,
      );
      assert.ok(
        names.some((name) => body.includes(`"${name}"`)),
        `none of ${names.join(", ")} is a structured metadata key of the stored log entry`,
      );
    });
  },
);
