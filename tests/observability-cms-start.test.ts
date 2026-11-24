import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

// OBS-AC-1.1 for the unit `cms` in the started stack (OBS-T-1, concept observability.md §17; issue
// #165 of slice 3 of OBS-US-1). The file tests read the stack definition as data; the stack test
// at the end starts the profile `observability` together with the service `cms` and runs only with
// STACK_TEST=1 ("CI Test Constraints": until the pipeline offers a container runtime it runs
// locally and the result is stated in the merge request).

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

type Service = {
  profiles?: string[];
  environment?: Record<string, string>;
  networks?: string[];
};
const services = (
  parse(readFileSync(join(root, "docker-compose.yml"), "utf8")) as {
    services: Record<string, Service>;
  }
).services;

describe("OBS-AC-1.1 cms reports to the collector (OBS-F-1, OBS-F-25, OBS-T-1)", () => {
  it("OBS-AC-1.1 runs cms outside the profile observability, so it also starts without the stack", () => {
    assert.ok(services.cms, "the service cms is missing");
    assert.equal(services.cms.profiles, undefined);
  });

  it("OBS-AC-1.1 lets cms send its telemetry to the collector by default, on the network the collector listens on", () => {
    const environment = services.cms?.environment ?? {};
    assert.match(
      environment.TELEMETRY_ENDPOINT ?? "",
      /TELEMETRY_ENDPOINT:-http:\/\/collector:4318\}$/,
    );
    assert.match(environment.TELEMETRY_ENABLED ?? "", /:-true\}$/);
    for (const network of services.collector?.networks ?? []) {
      assert.ok(
        services.cms?.networks?.includes(network),
        `cms is not on the network ${network} of the collector`,
      );
    }
  });
});

// ---------------------------------------------------------------------------------------------
// Stack test: starts the real stack. STACK_TEST=1 switches it on (needs Docker with Compose v2).
// ---------------------------------------------------------------------------------------------

const stackTestOn = process.env.STACK_TEST === "1";
const skipReason = stackTestOn
  ? false
  : "stack test: set STACK_TEST=1 to start the stack with Docker (OBS-T-1 for cms runs locally until CI offers a container runtime, §17)";
const composeArgs = [
  "compose",
  "-p",
  "stash-obs-cms-test",
  "--env-file",
  ".env.example",
  "-f",
  "docker-compose.yml",
];

function compose(args: string[]): string {
  return execFileSync("docker", [...composeArgs, ...args], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
}

function get(url: string, query: Record<string, string>): string {
  const args = ["exec", "-T", "grafana", "curl", "-s", "-G", url];
  for (const [key, value] of Object.entries(query)) {
    args.push("--data-urlencode", `${key}=${value}`);
  }
  return compose(args);
}

async function eventually(
  check: () => boolean,
  seconds: number,
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

describe(
  "OBS-AC-1.1 cms in the started stack (OBS-T-1)",
  { skip: skipReason },
  () => {
    before(() => {
      compose([
        "up",
        "-d",
        "--build",
        "--wait",
        "--wait-timeout",
        "420",
        "grafana",
        "collector",
        "cms",
      ]);
    });
    after(() => {
      compose(["down", "-v"]);
    });

    it("OBS-AC-1.1 holds the log entry `unit started` with service.name cms in the log store and the heartbeat of cms in the metric store within 60 seconds of its start (OBS-F-1, OBS-F-11, OBS-F-25, OBS-T-1)", async () => {
      const log = await eventually(() => {
        const answer = get("http://loki:3100/loki/api/v1/query_range", {
          query: '{service_name="cms"} |= "unit started"',
        });
        return answer.includes("unit started") && answer.includes('"cms"');
      }, 60);
      const heartbeat = await eventually(
        () =>
          get("http://prometheus:9090/api/v1/query", {
            query: 'unit_running{service_name="cms"}',
          }).includes('"value"'),
        60,
      );
      assert.ok(log, "the start entry of cms did not reach the log store");
      assert.ok(
        heartbeat,
        "the heartbeat of cms did not reach the metric store",
      );
    });
  },
);
