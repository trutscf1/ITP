// `identity` in the local stack and in CI (gam-ai-knowledge/concepts/identity.md §8, §14,
// IDN-US-1 slice 1): the service of docker-compose.yml, its route at the reverse proxy, its
// configuration in .env.example, and the Redis service of the CI job `test`.
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { loadIdentityConfig } from "../packages/contracts/src/identity/config.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

type Service = {
  build?: { dockerfile?: string };
  environment?: Record<string, string>;
  healthcheck?: { test?: string | string[] };
  depends_on?: Record<string, { condition?: string }>;
  ports?: unknown;
  networks?: string[];
};

function read(path: string): string {
  return readFileSync(join(root, path), "utf8");
}

const compose = parse(read("docker-compose.yml")) as {
  services: Record<string, Service>;
};
const identity = compose.services.identity;

/** The variables of the table "Configuration of `identity`" (concept §8) the stack sets. */
const configured = [
  "PUBLIC_ORIGIN",
  "IDENTITY_AUTH_SECRET",
  "REGISTRATION_ENABLED",
  "CONFIRMATION_LINK_TTL_HOURS",
  "UNCONFIRMED_ACCOUNT_TTL_DAYS",
  "RESET_LINK_TTL_MINUTES",
  "SESSION_TTL_DAYS",
  "LOGIN_MAX_FAILURES",
  "LOGIN_FAILURE_WINDOW_SECONDS",
  "LOGIN_LOCK_MINUTES",
  "REQUEST_LIMIT_PER_MINUTE",
  "CAPTCHA_ENABLED",
  "CAPTCHA_SITE_KEY",
  "CAPTCHA_SECRET_KEY",
  "SMTP_FROM",
  "SESSION_CHECK_TIMEOUT_MS",
];

describe("IDN-US-1 identity in the local stack (SCF-F-1, SCF-F-20, IDN-F-4)", () => {
  it("IDN-AC-1.4 defines the service identity, built from the Dockerfile of its unit", () => {
    assert.ok(identity, "service identity is missing");
    assert.equal(identity.build?.dockerfile, "apps/identity/Dockerfile");
    assert.ok(existsSync(join(root, "apps/identity/Dockerfile")));
  });

  it("IDN-AC-1.4 gives it a health check on /health that fails for a report with status down [SCF-F-5]", () => {
    const test = identity?.healthcheck?.test;
    const command = Array.isArray(test) ? test.join(" ") : (test ?? "");
    assert.match(command, /\/health/);
    assert.match(command, /"status":"down"/);
  });

  it("IDN-AC-1.4 starts it after the database, the migrations, the session store, and the mail catcher [SCF-F-26]", () => {
    const needs = identity?.depends_on ?? {};
    assert.equal(needs.postgres?.condition, "service_healthy");
    assert.equal(needs.redis?.condition, "service_healthy");
    assert.equal(needs.mailpit?.condition, "service_healthy");
    assert.equal(
      needs["db-migrate"]?.condition,
      "service_completed_successfully",
    );
  });

  it("IDN-NF-6 sends e-mail to the mail catcher and reaches the session store with its password", () => {
    const env = identity?.environment ?? {};
    assert.equal(env.SMTP_HOST, "mailpit");
    assert.equal(env.SMTP_PORT, "1025");
    assert.match(
      env.REDIS_URL ?? "",
      /^redis:\/\/:\$\{REDIS_PASSWORD[^}]*\}@redis:6379/,
    );
    assert.match(env.DATABASE_URL ?? "", /@postgres:5432\//);
  });

  it("IDN-AC-1.4 publishes no port; it shares the frontend network with the proxy and the backend network with the data services", () => {
    assert.equal(identity?.ports, undefined);
    assert.deepEqual([...(identity?.networks ?? [])].sort(), [
      "backend",
      "frontend",
    ]);
    assert.ok(compose.services.proxy?.networks?.includes("frontend"));
  });

  it("IDN-AC-1.7 takes every variable of the identity configuration from the environment of the stack, with the secrets as required values", () => {
    const env = identity?.environment ?? {};
    for (const name of configured) {
      assert.match(env[name] ?? "", /^\$\{/, `${name} is not read from .env`);
    }
    assert.match(
      env.IDENTITY_AUTH_SECRET ?? "",
      /^\$\{IDENTITY_AUTH_SECRET:\?/,
    );
  });

  it("IDN-AC-1.5 documents every variable in .env.example, with the bot check off and the registration open", () => {
    const documented = new Map<string, string>();
    for (const line of read(".env.example").split(/\r?\n/)) {
      const match = /^([A-Z][A-Z0-9_]*)=(.*)$/.exec(line);
      if (match) documented.set(match[1] as string, match[2] as string);
    }
    for (const name of [...configured, "IDENTITY_PORT"]) {
      assert.ok(documented.has(name), `${name} is missing in .env.example`);
    }
    assert.equal(documented.get("CAPTCHA_ENABLED"), "false");
    assert.equal(documented.get("REGISTRATION_ENABLED"), "true");
    assert.equal(documented.get("PUBLIC_ORIGIN"), "http://localhost:8080");
    assert.ok(
      (documented.get("IDENTITY_AUTH_SECRET") ?? "").length >= 32,
      "the placeholder of IDENTITY_AUTH_SECRET must pass the check of 32 characters",
    );
  });

  it("IDN-AC-1.5 documents every variable that loadIdentityConfig reads in .env.example, as a setting or as a commented default [SCF-F-11]", () => {
    const loaded = loadIdentityConfig({
      DATABASE_URL: "postgresql://localhost/none",
      REDIS_URL: "redis://localhost:6379",
      IDENTITY_AUTH_SECRET: "0123456789abcdef0123456789abcdef",
    });
    assert.ok(loaded.ok);
    const names = Object.keys(loaded.config);
    assert.ok(names.length > 20, "the configuration lists its variables");
    const text = read(".env.example");
    for (const name of names) {
      assert.match(
        text,
        new RegExp(`^(# )?${name}=`, "m"),
        `${name} is missing in .env.example`,
      );
    }
  });

  it("IDN-AC-1.4 routes /api/identity to identity without the prefix, so /api/identity/health reaches /health [SCF-F-4]", () => {
    const caddyfile = read("docker/Caddyfile");
    assert.match(
      caddyfile,
      /handle_path\s+\/api\/identity\/\*\s*\{[^}]*reverse_proxy\s+identity:\{\$IDENTITY_PORT\}/s,
    );
    assert.match(
      compose.services.proxy?.environment?.IDENTITY_PORT ?? "",
      /\$\{IDENTITY_PORT/,
    );
  });

  it("IDN-AC-1.4 builds the image of identity on the Node.js of .tool-versions and runs it as the user node", () => {
    const dockerfile = read("apps/identity/Dockerfile");
    assert.match(dockerfile, /^FROM node:24\.14\.0-alpine$/m);
    assert.match(dockerfile, /^USER node$/m);
    assert.match(dockerfile, /HEALTHCHECK|CMD \[/);
  });
});

describe("IDN-US-1 identity in CI (IDN-C-6, concept §17 CI Test Constraints)", () => {
  const pipeline = parse(read(".gitlab-ci.yml")) as {
    test: {
      services: { name: string; alias?: string }[];
      variables: Record<string, string>;
    };
  };

  it("IDN-AC-1.9 gives the job test a Redis service and its address in TEST_REDIS_URL", () => {
    const names = pipeline.test.services.map((service) => service.name);
    assert.ok(names.includes("redis:8.8-alpine"));
    assert.match(
      pipeline.test.variables.TEST_REDIS_URL ?? "",
      /^redis:\/\/redis:6379/,
    );
  });

  it("IDN-AC-1.9 lets Turborepo pass TEST_REDIS_URL through to the tests", () => {
    const turbo = JSON.parse(read("turbo.json")) as {
      tasks: { test: { passThroughEnv: string[] } };
    };
    assert.ok(turbo.tasks.test.passThroughEnv.includes("TEST_REDIS_URL"));
    assert.ok(turbo.tasks.test.passThroughEnv.includes("TEST_DATABASE_URL"));
  });

  it("IDN-AC-1.9 documents TEST_REDIS_URL in .env.example", () => {
    assert.match(read(".env.example"), /^# TEST_REDIS_URL=/m);
  });
});
