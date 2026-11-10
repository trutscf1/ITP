import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

// Alert rules, slice 2 of OBS-US-2 (documentation/concepts/observability.md §16, M6 thresholds and
// M9 alert rule; §17): the rule "High error rate" is a template in the repository, the
// configuration step fills in its two thresholds, and the rendered file is tested offline with
// `promtool test rules` against the series of example 5 (OBS-T-33, OBS-T-38). The stack test at
// the end starts the real stack and runs only with STACK_TEST=1 (OBS-T-10; until the pipeline
// offers a container runtime it runs locally and the result is stated in the merge request).

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const obs = join(root, "docker", "observability");
const script = join(obs, "check-config.ts");
const templatePath = join(obs, "alert-rules.template.yml");
const ruleTestPath = join(
  root,
  "tests",
  "data",
  "observability",
  "alert-error-rate.test.yml",
);

type Rule = {
  alert?: string;
  record?: string;
  expr: string;
  for?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
};
type Group = { name: string; interval?: string; rules: Rule[] };
type Compose = {
  services: Record<
    string,
    { image?: string; volumes?: string[]; depends_on?: Record<string, unknown> }
  >;
};

function readText(path: string): string {
  return readFileSync(join(root, path), "utf8");
}

function render(env: Record<string, string>, out: string) {
  return spawnSync(process.execPath, [script], {
    env: {
      PATH: process.env.PATH ?? "",
      OBS_GENERATED_DIR: out,
      OBS_TEMPLATE_DIR: obs,
      ...env,
    },
    encoding: "utf8",
  });
}

function rulesOf(file: string): Rule[] {
  const document = parse(readFileSync(file, "utf8")) as { groups: Group[] };
  return document.groups.flatMap((group) => group.rules);
}

function errorRateAlert(file: string): Rule {
  const alert = rulesOf(file).find((rule) => rule.alert === "High error rate");
  assert.ok(alert, "the alert rule 'High error rate' exists");
  return alert;
}

const prometheusImage = (parse(readText("docker-compose.yml")) as Compose)
  .services.prometheus.image as string;

const localPromtool =
  spawnSync("promtool", ["--version"], { encoding: "utf8" }).status === 0;
const dockerImage =
  !localPromtool &&
  spawnSync("docker", ["image", "inspect", prometheusImage], {
    encoding: "utf8",
  }).status === 0;
const ruleToolSkip =
  localPromtool || dockerImage
    ? false
    : "offline rule test: neither promtool nor the pinned metric store image is available locally (OBS-T-33 runs where one of them is, §17)";

/**
 * The offline rule test of OBS-C-3: a local `promtool`, or the pinned image of the metric store
 * through Docker.
 */
function promtool(dir: string, testFile: string) {
  const result = localPromtool
    ? spawnSync("promtool", ["test", "rules", testFile], {
        cwd: dir,
        encoding: "utf8",
      })
    : spawnSync(
        "docker",
        [
          "run",
          "--rm",
          "--entrypoint",
          "promtool",
          "-v",
          `${dir}:/work`,
          "-w",
          "/work",
          prometheusImage,
          "test",
          "rules",
          testFile,
        ],
        { encoding: "utf8" },
      );
  return { status: result.status, output: `${result.stdout}${result.stderr}` };
}

describe("OBS-AC-2.3 Alert rule file, template (OBS-F-17, OBS-F-8, OBS-U-4)", () => {
  it("OBS-AC-2.3 keeps the alert rule 'High error rate' as a template with the placeholders of its two thresholds (OBS-F-17, OBS-F-28)", () => {
    assert.equal(existsSync(templatePath), true);
    const text = readFileSync(templatePath, "utf8");
    assert.match(text, /__OBS_ALERT_ERROR_RATE_PERCENT__/);
    assert.match(text, /__OBS_ALERT_MIN_REQUESTS__/);
    const alerts = rulesOf(templatePath).filter((rule) => rule.alert);
    assert.deepEqual(
      alerts.map((rule) => rule.alert),
      ["High error rate"],
    );
  });

  it("OBS-AC-2.3 evaluates the rules every 60 seconds and fires at the first evaluation at which the condition holds, without a pending period (OBS-F-8, OBS-F-17)", () => {
    const document = parse(readFileSync(templatePath, "utf8")) as {
      groups: Group[];
    };
    for (const group of document.groups) {
      assert.equal(group.interval, "60s", group.name);
    }
    assert.equal(errorRateAlert(templatePath).for, undefined);
  });

  it("OBS-AC-2.3 counts only status codes from 500 to 599 and compares the share and the request count with the two thresholds (OBS-F-17)", () => {
    const text = readFileSync(templatePath, "utf8");
    assert.match(text, /http_server_request_duration_seconds_count/);
    assert.match(text, /http_response_status_code=~"5\.\."/);
    const { expr } = errorRateAlert(templatePath);
    assert.match(expr, /> __OBS_ALERT_ERROR_RATE_PERCENT__/);
    assert.match(expr, />= __OBS_ALERT_MIN_REQUESTS__/);
  });

  it("OBS-AC-2.3 names the unit in the alert and gives it the summary text of the concept with its values filled in (OBS-F-8, OBS-U-4)", () => {
    const summary = errorRateAlert(templatePath).annotations?.summary ?? "";
    assert.match(summary, /^Unit \{\{ \$labels\.service_name \}\}: /);
    assert.match(summary, /printf "%\.1f"/);
    assert.match(summary, / requests failed in the last 5 minutes\.$/);
  });

  it("OBS-AC-2.3 sends the alert to no address: no alertmanager is configured and the rule file names no receiver (OBS-F-8)", () => {
    const prometheus = readText("docker/observability/prometheus.yml");
    assert.doesNotMatch(prometheus, /alertmanagers?:/);
    assert.doesNotMatch(readFileSync(templatePath, "utf8"), /webhook|mailto/i);
  });
});

describe("OBS-AC-2.3 Configuration step writes the thresholds into the alert rule file (OBS-F-28, OBS-T-38)", () => {
  let out = "";
  before(() => {
    out = mkdtempSync(join(tmpdir(), "obs-alerts-"));
  });
  after(() => rmSync(out, { recursive: true, force: true }));

  it("OBS-AC-2.3 writes the rule file with the defaults 5 and 20 and leaves no placeholder (OBS-F-28)", () => {
    const result = render({}, out);
    assert.equal(result.status, 0, result.stdout);
    const file = join(out, "alert-rules.yml");
    assert.doesNotMatch(readFileSync(file, "utf8"), /__OBS_/);
    const { expr } = errorRateAlert(file);
    assert.match(expr, /> 5\b/);
    assert.match(expr, />= 20\b/);
  });

  it("OBS-AC-2.3 holds 7.5 as the threshold of 'High error rate' when OBS_ALERT_ERROR_RATE_PERCENT=7.5 and the other threshold at its default (OBS-T-38)", () => {
    const result = render({ OBS_ALERT_ERROR_RATE_PERCENT: "7.5" }, out);
    assert.equal(result.status, 0, result.stdout);
    const { expr } = errorRateAlert(join(out, "alert-rules.yml"));
    assert.match(expr, /> 7\.5\b/);
    assert.match(expr, />= 20\b/);
  });

  it("OBS-AC-2.3 writes a threshold with a leading zero as the number it means, never as an octal literal of PromQL (OBS-F-28, OBS-E-4)", () => {
    const result = render(
      { OBS_ALERT_ERROR_RATE_PERCENT: "010", OBS_ALERT_MIN_REQUESTS: "020" },
      out,
    );
    assert.equal(result.status, 0, result.stdout);
    const { expr } = errorRateAlert(join(out, "alert-rules.yml"));
    assert.match(expr, /> 10\b/);
    assert.match(expr, />= 20\b/);
    assert.doesNotMatch(expr, /\b0\d/);
  });

  it("OBS-AC-2.3 writes no rule file when a variable is invalid (OBS-E-4)", () => {
    const empty = mkdtempSync(join(tmpdir(), "obs-alerts-bad-"));
    try {
      const result = render({ OBS_ALERT_MIN_REQUESTS: "0" }, empty);
      assert.equal(result.status, 1);
      assert.equal(existsSync(join(empty, "alert-rules.yml")), false);
    } finally {
      rmSync(empty, { recursive: true, force: true });
    }
  });
});

describe("OBS-AC-2.3 Rules reach the metric store and the alert list (OBS-F-8, OBS-F-9, OBS-C-3)", () => {
  const composeFile = parse(readText("docker-compose.yml")) as Compose;

  it("OBS-AC-2.3 lets the metric store load the rendered rule file after the configuration step has written it (OBS-F-28)", () => {
    const prometheus = parse(
      readText("docker/observability/prometheus.yml"),
    ) as { rule_files?: string[] };
    assert.ok(prometheus.rule_files?.length);
    const file = prometheus.rule_files[0];
    const service = composeFile.services.prometheus;
    const mount = (service.volumes ?? []).find((volume) =>
      volume.startsWith("obs-generated:"),
    );
    assert.ok(mount, "the metric store mounts the generated volume");
    const target = mount.split(":")[1];
    assert.ok(file.startsWith(`${target}/`), `${file} is under ${target}`);
    assert.ok(file.endsWith("/alert-rules.yml"));
    assert.ok(mount.endsWith(":ro"));
    assert.ok(service.depends_on && "obs-config" in service.depends_on);
  });

  it("OBS-AC-2.3 shows the rules of the metric store in the alert list of the dashboard tool without a manual step (OBS-F-8, OBS-F-9)", () => {
    const sources = parse(
      readText(
        "docker/observability/grafana/provisioning/datasources/datasources.yaml",
      ),
    ) as {
      datasources: { uid: string; jsonData?: { manageAlerts?: boolean } }[];
    };
    const metrics = sources.datasources.find((s) => s.uid === "prometheus");
    assert.equal(metrics?.jsonData?.manageAlerts, true);
  });
});

describe(
  "OBS-AC-2.3 Offline rule test (OBS-T-33, OBS-C-3)",
  { skip: ruleToolSkip },
  () => {
    let dir = "";
    before(() => {
      dir = mkdtempSync(join(tmpdir(), "obs-rule-test-"));
      const result = render({}, dir);
      assert.equal(result.status, 0, result.stdout);
      copyFileSync(ruleTestPath, join(dir, "alert-error-rate.test.yml"));
    });
    after(() => rmSync(dir, { recursive: true, force: true }));

    it("OBS-AC-2.3 shows the states and the summary text of the five rows of example 5 with promtool test rules (OBS-F-17, OBS-F-8, OBS-U-4, OBS-T-33)", () => {
      const check = promtool(dir, "alert-error-rate.test.yml");
      assert.equal(check.status, 0, check.output);
      assert.match(check.output, /SUCCESS/);
    });
  },
);

// ---------------------------------------------------------------------------------------------
// Stack test (OBS-T-10): the started stack with the profile. STACK_TEST=1 switches it on.
// ---------------------------------------------------------------------------------------------

const stackSkip =
  process.env.STACK_TEST === "1"
    ? false
    : "stack test: set STACK_TEST=1 to start the stack with Docker (OBS-T-10 runs locally until CI offers a container runtime, §17)";
const composeArgs = [
  "compose",
  "-p",
  "stash-obs-alerts",
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
    maxBuffer: 32 * 1024 * 1024,
  });
}

function inGrafana(command: string[], input?: string): string {
  return compose(["exec", "-T", "grafana", ...command], input);
}

const attribute = (key: string, value: string) => ({
  key,
  value: { stringValue: value },
});

/** One cumulative data point of the request metric of `storage` with a status code. */
function requestPoint(status: string, count: number) {
  return {
    attributes: [attribute("http.response.status_code", status)],
    timeUnixNano: `${Date.now()}000000`,
    startTimeUnixNano: `${Date.now() - 600000}000000`,
    count: String(count),
    sum: count * 0.01,
    bucketCounts: ["0", String(count), "0"],
    explicitBounds: [0.005, 0.01],
  };
}

describe("OBS-AC-2.3 Started stack (OBS-T-10)", { skip: stackSkip }, () => {
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

  it("OBS-AC-2.3 shows 'High error rate' for storage as firing in the alert list of the dashboard tool after storage answered 6 of 100 requests with status 500 (OBS-F-17, OBS-F-8, OBS-U-4, OBS-T-10)", async () => {
    const body = {
      resourceMetrics: [
        {
          resource: {
            attributes: [
              attribute("service.name", "storage"),
              attribute("service.version", "0.0.0-test"),
            ],
          },
          scopeMetrics: [
            {
              metrics: [
                {
                  name: "http.server.request.duration",
                  unit: "s",
                  histogram: {
                    aggregationTemporality: 2,
                    dataPoints: [
                      requestPoint("200", 94),
                      requestPoint("500", 6),
                    ],
                  },
                },
              ],
            },
          ],
        },
      ],
    };
    const status = inGrafana(
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
        "http://collector:4318/v1/metrics",
      ],
      JSON.stringify(body),
    );
    assert.equal(status, "200");

    type Alert = {
      state: string;
      labels: Record<string, string>;
      annotations: Record<string, string>;
    };
    type Rules = {
      data?: {
        groups: { rules: { name: string; alerts?: Alert[] }[] }[];
      };
    };
    const end = Date.now() + 240000;
    let firing: Alert | undefined;
    while (Date.now() < end && !firing) {
      try {
        const answer = inGrafana([
          "curl",
          "-s",
          "http://127.0.0.1:3000/api/prometheus/prometheus/api/v1/rules",
        ]);
        const rules = JSON.parse(answer) as Rules;
        firing = rules.data?.groups
          .flatMap((group) => group.rules)
          .filter((rule) => rule.name === "High error rate")
          .flatMap((rule) => rule.alerts ?? [])
          .find(
            (alert) =>
              alert.state === "firing" &&
              alert.labels.service_name === "storage",
          );
      } catch {
        // the stack is not ready yet
      }
      if (!firing) await new Promise((resolve) => setTimeout(resolve, 5000));
    }
    assert.ok(firing, "the alert list shows 'High error rate' for storage");
    assert.equal(
      firing.annotations.summary,
      "Unit storage: 6.0 % of 100 requests failed in the last 5 minutes.",
    );
  });
});
