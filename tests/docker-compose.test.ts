import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

type Healthcheck = { test?: string | string[] };
type Service = {
  image?: string;
  build?: unknown;
  environment?: Record<string, string> | string[];
  healthcheck?: Healthcheck;
  depends_on?: Record<string, { condition?: string }>;
};
type Compose = { services: Record<string, Service> };

function readText(path: string): string {
  return readFileSync(join(root, path), "utf8");
}

function readCompose(): Compose {
  return parse(readText("docker-compose.yml")) as Compose;
}

/** The names `${NAME}`, `${NAME:-default}`, and `${NAME:?message}` refer to. */
function referencedVariables(compose: string): string[] {
  const names = new Set<string>();
  for (const match of compose.matchAll(/\$\{([A-Z][A-Z0-9_]*)[^}]*\}/g)) {
    names.add(match[1] as string);
  }
  return [...names].sort();
}

/** The variable names of `.env.example`: lines of the form `NAME=value`. */
function documentedVariables(): Map<string, string> {
  const variables = new Map<string, string>();
  for (const line of readText(".env.example").split(/\r?\n/)) {
    const match = /^([A-Z][A-Z0-9_]*)=(.*)$/.exec(line);
    if (match) variables.set(match[1] as string, match[2] as string);
  }
  return variables;
}

function environmentOf(service: Service): Record<string, string> {
  const env = service.environment ?? {};
  if (Array.isArray(env)) {
    return Object.fromEntries(
      env.map((entry) => {
        const at = entry.indexOf("=");
        return [entry.slice(0, at), entry.slice(at + 1)];
      }),
    );
  }
  return env;
}

describe("SCF-AC-2.1 One start command (slice 1: data services, reverse proxy, web)", () => {
  const services = readCompose().services;

  for (const name of [
    "postgres",
    "redis",
    "mongodb",
    "couchdb",
    "seaweedfs",
    "clamav",
    "proxy",
    "web",
  ]) {
    it(`SCF-AC-2.1 defines the service ${name}`, () => {
      assert.ok(services[name], `service ${name} is missing`);
    });
  }

  it("SCF-AC-2.1 runs PostgreSQL 18 as postgres:18-alpine", () => {
    assert.equal(services.postgres?.image, "postgres:18-alpine");
  });

  it("SCF-AC-2.1 builds web from a Dockerfile of the stack definition", () => {
    assert.ok(services.web?.build, "web has no build section");
    assert.ok(existsSync(join(root, "docker", "web.Dockerfile")));
  });

  it("SCF-AC-2.1 routes the single origin to web through the reverse proxy", () => {
    const caddyfile = readText("docker/Caddyfile");
    assert.match(caddyfile, /reverse_proxy\s+web:/);
  });
});

describe("SCF-AC-2.2 Configuration by environment", () => {
  const compose = readText("docker-compose.yml");

  it("SCF-AC-2.2 documents every variable of docker-compose.yml in .env.example", () => {
    const documented = documentedVariables();
    const missing = referencedVariables(compose).filter(
      (name) => !documented.has(name),
    );
    assert.deepEqual(missing, []);
  });

  it("SCF-AC-2.2 uses every variable of .env.example in docker-compose.yml", () => {
    const used = new Set(referencedVariables(compose));
    const unused = [...documentedVariables().keys()].filter(
      (name) => !used.has(name),
    );
    assert.deepEqual(unused, []);
  });

  it("SCF-AC-2.2 takes every credential from a variable, never a literal", () => {
    const literal: string[] = [];
    for (const [name, service] of Object.entries(readCompose().services)) {
      for (const [key, value] of Object.entries(environmentOf(service))) {
        if (/PASSWORD|SECRET|TOKEN|KEY/.test(key) && !/^\$\{/.test(value)) {
          literal.push(`${name}.${key}`);
        }
      }
    }
    assert.deepEqual(literal, []);
  });

  it("SCF-AC-2.2 keeps only placeholders as secrets in .env.example", () => {
    for (const [name, value] of documentedVariables()) {
      if (/PASSWORD|SECRET|TOKEN|KEY/.test(name)) {
        assert.equal(value, "change-me", `${name} is not a placeholder`);
      }
    }
  });

  it("SCF-AC-2.2 lets git ignore .env but track .env.example", () => {
    const ignore = readText(".gitignore").split(/\r?\n/);
    assert.ok(ignore.includes(".env*"));
    assert.ok(ignore.includes("!.env.example"));
  });
});

describe("SCF-AC-2.4 Health checks", () => {
  const services = readCompose().services;

  for (const [name, service] of Object.entries(services)) {
    it(`SCF-AC-2.4 gives the service ${name} a health check`, () => {
      assert.ok(service.healthcheck?.test, `${name} has no healthcheck.test`);
    });
  }

  it("SCF-AC-2.4 starts web only after the database is healthy", () => {
    assert.equal(
      services.web?.depends_on?.postgres?.condition,
      "service_healthy",
    );
  });

  it("SCF-AC-2.4 starts the reverse proxy only after web is healthy", () => {
    assert.equal(services.proxy?.depends_on?.web?.condition, "service_healthy");
  });

  it("SCF-AC-2.4 lets every dependency of every service wait for health", () => {
    const weak: string[] = [];
    for (const [name, service] of Object.entries(services)) {
      for (const [dependency, rule] of Object.entries(
        service.depends_on ?? {},
      )) {
        if (rule.condition !== "service_healthy") {
          weak.push(`${name} -> ${dependency}`);
        }
      }
    }
    assert.deepEqual(weak, []);
  });
});
