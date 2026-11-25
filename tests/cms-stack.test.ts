import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { after, before, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

// PUB-AC-1.1 CMS container (concept public-content.md §17, PUB-T-1, static half): the resolved stack
// definition and the example configuration. The half that starts the stack and requests
// `/cms/health` through the proxy needs a container runtime and runs locally (CI Test Constraints).

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

type Service = {
  image?: string;
  build?: { context?: string; dockerfile?: string };
  environment?: Record<string, string> | string[];
  healthcheck?: { test?: string | string[] };
  depends_on?: Record<string, { condition?: string }>;
  networks?: string[];
  ports?: string[];
  volumes?: string[];
};
type Compose = {
  services: Record<string, Service>;
  volumes: Record<string, unknown>;
};

function readText(path: string): string {
  return readFileSync(join(root, path), "utf8");
}

const compose = parse(readText("docker-compose.yml")) as Compose;
const cms = compose.services.cms;
const cmsDb = compose.services["cms-db"];

function environmentOf(service: Service | undefined): Record<string, string> {
  const env = service?.environment ?? {};
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

describe("PUB-AC-1.1 CMS container: Strapi runs as a container with its own PostgreSQL database", () => {
  it("PUB-AC-1.1 PUB-T-1 runs cms as its own container built from the Dockerfile of the unit", () => {
    assert.ok(cms, "the service cms is missing");
    assert.equal(cms.build?.dockerfile, "apps/cms/Dockerfile");
    assert.ok(existsSync(join(root, "apps/cms/Dockerfile")));
  });

  it("PUB-AC-1.1 PUB-F-1 gives the content store its own PostgreSQL container with its own volume", () => {
    assert.ok(cmsDb, "the service cms-db is missing");
    assert.equal(cmsDb.image, "postgres:18-alpine");
    assert.deepEqual(cmsDb.volumes, ["cms-db-data:/var/lib/postgresql"]);
    assert.ok("cms-db-data" in compose.volumes);
    assert.notEqual(cmsDb, compose.services.postgres);
  });

  it("PUB-AC-1.1 SCF-AC-2.4 asks the health check of cms-db for its own user and database inside the container", () => {
    const test = cmsDb?.healthcheck?.test;
    const command = Array.isArray(test) ? test.join(" ") : String(test);
    assert.match(command, /pg_isready/);
    assert.doesNotMatch(
      command,
      /(^|[^$])\$\{POSTGRES_/,
      "a single dollar is replaced on the host, use two",
    );
    assert.match(command, /\$\$\{?POSTGRES_USER/);
  });

  it("PUB-AC-1.1 PUB-F-1 lets cms start only after its content store is healthy", () => {
    assert.equal(cms?.depends_on?.["cms-db"]?.condition, "service_healthy");
    assert.ok(cmsDb?.healthcheck?.test, "cms-db has no health check");
  });

  it("PUB-AC-1.1 PUB-F-1 names the content store through variables of its own, in cms only", () => {
    const env = environmentOf(cms);
    assert.match(env.DATABASE_HOST ?? "", /^cms-db$/);
    for (const key of [
      "DATABASE_NAME",
      "DATABASE_USERNAME",
      "DATABASE_PASSWORD",
    ]) {
      assert.match(env[key] ?? "", /\$\{CMS_DB_/, `cms ${key}`);
    }
    for (const [name, service] of Object.entries(compose.services)) {
      if (name === "cms" || name === "cms-db") continue;
      const text = JSON.stringify(service);
      assert.ok(
        !text.includes("CMS_DB_") && !text.includes("cms-db"),
        `${name} names the content store of cms`,
      );
    }
    assert.ok(
      !JSON.stringify(cms).includes("POSTGRES_"),
      "cms names the database of the other units",
    );
  });

  it("PUB-AC-1.1 PUB-F-1 keeps the content store on the backend network and publishes no port of it", () => {
    assert.deepEqual(cmsDb?.networks, ["backend"]);
    assert.equal(cmsDb?.ports, undefined);
    assert.ok(!cms?.networks?.includes("frontend"));
  });

  it("PUB-AC-1.1 PUB-T-1 gives cms a health check on its own /health at port 1337", () => {
    const test = JSON.stringify(cms?.healthcheck?.test);
    assert.match(test, /127\.0\.0\.1:1337\/health/);
  });

  it("PUB-AC-1.1 PUB-T-1 routes /cms/health through the proxy to cms:1337/health", () => {
    const caddy = readText("docker/Caddyfile");
    assert.match(caddy, /\/cms\/health/);
    assert.match(caddy, /reverse_proxy cms:1337/);
  });

  it("PUB-AC-1.1 PUB-T-1 hands the telemetry configuration to cms", () => {
    const env = environmentOf(cms);
    assert.match(env.TELEMETRY_ENDPOINT ?? "", /TELEMETRY_ENDPOINT/);
  });

  it("PUB-AC-1.1 PUB-F-1 documents the variables of the content store and the secrets of Strapi in .env.example as placeholders", () => {
    const example = readText(".env.example");
    for (const name of [
      "CMS_DB_NAME",
      "CMS_DB_USER",
      "CMS_DB_PASSWORD",
      "CMS_APP_KEYS",
      "CMS_API_TOKEN_SALT",
      "CMS_ADMIN_JWT_SECRET",
      "CMS_TRANSFER_TOKEN_SALT",
      "CMS_ENCRYPTION_KEY",
      "CMS_JWT_SECRET",
    ]) {
      assert.match(example, new RegExp(`^${name}=`, "m"), name);
    }
  });
});

// ---------------------------------------------------------------------------------------------
// Stack test (PUB-T-1, dynamic half): starts the real stack. STACK_TEST=1 switches it on (needs
// Docker with Compose v2); until the pipeline offers a container runtime it runs locally and the
// result is stated in the merge request ("CI Test Constraints").
// ---------------------------------------------------------------------------------------------

const stackTestOn = process.env.STACK_TEST === "1";
const composeArgs = [
  "compose",
  "-p",
  "stash-cms-test",
  "--env-file",
  ".env.example",
  "-f",
  "docker-compose.yml",
];

function dockerCompose(args: string[]): string {
  return execFileSync("docker", [...composeArgs, ...args], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
}

function rows(table: string): number {
  const sql = `select count(*) from ${table}`;
  return Number(
    dockerCompose([
      "exec",
      "-T",
      "cms-db",
      "sh",
      "-c",
      `psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "${sql}"`,
    ]).trim(),
  );
}

describe(
  "PUB-AC-1.1 CMS in the started stack (PUB-T-1)",
  {
    skip: stackTestOn
      ? false
      : "stack test: set STACK_TEST=1 to start the stack with Docker (PUB-T-1 runs locally until CI offers a container runtime)",
  },
  () => {
    before(() => {
      dockerCompose([
        "up",
        "-d",
        "--build",
        "--wait",
        "--wait-timeout",
        "600",
        "cms",
        "proxy",
      ]);
    });
    after(() => {
      dockerCompose(["down", "-v"]);
    });

    it("PUB-AC-1.1 PUB-T-1 answers /cms/health through the proxy with the report of cms, the content store essential and ok", () => {
      const answer = JSON.parse(
        dockerCompose([
          "exec",
          "-T",
          "proxy",
          "wget",
          "-qO-",
          "http://127.0.0.1:80/cms/health",
        ]),
      ) as {
        unit: string;
        checks: { name: string; essential: boolean; status: string }[];
      };
      assert.equal(answer.unit, "cms");
      const store = answer.checks.find(
        (check) => check.name === "content-store",
      );
      assert.equal(store?.essential, true);
      assert.equal(store?.status, "ok");
    });

    it("PUB-AC-1.5 PUB-F-7 holds the example content of the first start in the content store, in every content type", () => {
      for (const table of [
        "landing_sections",
        "help_categories",
        "help_articles",
        "changelog_entries",
        "legal_pages",
        "images",
      ]) {
        assert.ok(rows(table) > 0, `${table} holds no seeded row`);
      }
    });
  },
);
