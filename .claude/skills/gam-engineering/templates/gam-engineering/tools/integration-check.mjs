#!/usr/bin/env node
// The integration check of the local pipeline (pipeline-proposal PP-F-39; plan 2026-10-29-pipeline-merge).
// Usage: node gam-engineering/tools/integration-check.mjs <index of the check in gam-engineering/pipeline.json>
// Starts each service of the check as a throwaway container on its own network, waits until its port answers, runs the
// project's command line in the check's folder, and removes the containers and the network whatever the result
// (P-PIPE-4). The command sees GAM_NETWORK and, per service, GAM_SERVICE_<NAME>_HOST and _PORT on this computer and
// _ALIAS inside the network. Exit 3 (not run, PP-F-25) without a container runtime; else the command's own exit code.
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { connect } from "node:net";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export const SKIP_EXIT = 3;
// Windows finds docker.exe and a docker.cmd shim alike only through the shell.
const viaShell = process.platform === "win32";
const docker = (args, options = {}) => spawnSync("docker", args, { encoding: "utf8", shell: viaShell, ...options });

// The environment name of a service: GAM_SERVICE_<NAME>, the name in upper case with every other sign as _.
export const serviceVariable = (name) => `GAM_SERVICE_${String(name).toUpperCase().replace(/[^A-Z0-9]/g, "_")}`;

// Check and run id → the docker calls that start the network and the services, and the ones that remove them.
export function plan(check, runId) {
  const network = `gam-it-${runId}`;
  const services = (check.services ?? []).map((service) => ({ ...service, container: `${network}-${service.name}` }));
  const start = [
    ["network", "create", network],
    ...services.map((service) => [
      "run", "-d", "--rm", "--name", service.container, "--network", network, "--network-alias", service.name,
      "-p", `127.0.0.1::${service.port}`,
      ...Object.entries(service.env ?? {}).flatMap(([key, value]) => ["-e", `${key}=${value}`]),
      service.image,
    ]),
  ];
  const stop = [...services.map((service) => ["rm", "-f", service.container]), ["network", "rm", network]];
  return { network, services, start, stop };
}

// The host port docker mapped for a service's container port, from `docker port` ("127.0.0.1:49153").
export const hostPort = (output) => Number(/:(\d+)\s*$/m.exec(String(output).trim())?.[1] ?? 0);

function portAnswers(port) {
  return new Promise((resolve) => {
    const socket = connect({ host: "127.0.0.1", port }, () => {
      socket.destroy();
      resolve(true);
    });
    socket.on("error", () => resolve(false));
    socket.setTimeout(1000, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function waitFor(port, seconds) {
  for (let i = 0; i < seconds; i++) {
    if (await portAnswers(port)) return true;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
}

export async function main([index], root = process.cwd()) {
  let check;
  try {
    check = JSON.parse(readFileSync(join(root, "gam-engineering/pipeline.json"), "utf8")).checks?.[Number(index)];
  } catch (err) {
    console.error(`integration-check: cannot read gam-engineering/pipeline.json (${err.message})`);
    return 2;
  }
  if (!check || check.kind !== "integration" || !check.tool) {
    console.error("usage: node integration-check.mjs <index of an integration check with a tool>");
    return 2;
  }
  if (docker(["info"], { stdio: "ignore" }).status !== 0) {
    console.log("not run: the container runtime does not answer (docker info)");
    return SKIP_EXIT;
  }
  const steps = plan(check, `${process.pid}-${Date.now().toString(36)}`);
  const env = { ...process.env, GAM_NETWORK: steps.network };
  try {
    for (const call of steps.start) {
      const run = docker(call, { stdio: ["ignore", "pipe", "inherit"] });
      if (run.status !== 0) {
        console.error(`integration-check: docker ${call.slice(0, 2).join(" ")} failed`);
        return 1;
      }
    }
    for (const service of steps.services) {
      const port = hostPort(docker(["port", service.container, String(service.port)]).stdout);
      if (!port || !(await waitFor(port, check.readySeconds ?? 60))) {
        console.error(`integration-check: service ${service.name} did not answer on port ${service.port}`);
        return 1;
      }
      const variable = serviceVariable(service.name);
      Object.assign(env, { [`${variable}_HOST`]: "127.0.0.1", [`${variable}_PORT`]: String(port), [`${variable}_ALIAS`]: service.name });
    }
    const cwd = join(root, check.cwd ?? "");
    return spawnSync(check.tool, { cwd, env, stdio: "inherit", shell: true }).status ?? 1;
  } finally {
    for (const call of steps.stop) docker(call, { stdio: "ignore" });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await main(process.argv.slice(2));
}
