// Configuration of `identity` (gam-ai-knowledge/concepts/identity.md §8 "Configuration of
// `identity`", SCF-F-11, SCF-E-1).
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatConfigProblems, loadIdentityConfig } from "./index.ts";

const required = {
  DATABASE_URL: "postgresql://stash:change-me@postgres:5432/stash_db",
  IDENTITY_AUTH_SECRET: "0123456789abcdef0123456789abcdef",
  REDIS_URL: "redis://:change-me@redis:6379",
};

describe("SCF-F-11 IDN-AC-1.7 configuration of identity", () => {
  it("SCF-F-11 gives every default of §8 when only the required variables are set", () => {
    assert.deepEqual(loadIdentityConfig(required), {
      ok: true,
      config: {
        ...required,
        PORT: 3001,
        APP_VERSION: "0.0.0-dev",
        HEALTH_CHECK_TIMEOUT_MS: 1000,
        PUBLIC_ORIGIN: "http://localhost:8080",
        REGISTRATION_ENABLED: true,
        CONFIRMATION_LINK_TTL_HOURS: 24,
        UNCONFIRMED_ACCOUNT_TTL_DAYS: 7,
        RESET_LINK_TTL_MINUTES: 30,
        SESSION_TTL_DAYS: 7,
        LOGIN_MAX_FAILURES: 5,
        LOGIN_FAILURE_WINDOW_SECONDS: 60,
        LOGIN_LOCK_MINUTES: 15,
        REQUEST_LIMIT_PER_MINUTE: 5,
        CAPTCHA_ENABLED: false,
        CAPTCHA_SITE_KEY: "",
        CAPTCHA_SECRET_KEY: "",
        SMTP_HOST: "mailpit",
        SMTP_PORT: 1025,
        SMTP_FROM: "no-reply@stash.local",
        SESSION_CHECK_TIMEOUT_MS: 1000,
      },
    });
  });

  it("IDN-AC-1.7 reads REGISTRATION_ENABLED=false as the closed registration", () => {
    const result = loadIdentityConfig({
      ...required,
      REGISTRATION_ENABLED: "false",
    });
    assert.ok(result.ok);
    assert.equal(result.config.REGISTRATION_ENABLED, false);
  });

  it("SCF-E-1 reports each missing or invalid variable with its reason and never its value", () => {
    const result = loadIdentityConfig({
      DATABASE_URL: "",
      IDENTITY_AUTH_SECRET: "too-short-secret",
      REDIS_URL: "http://redis",
      PUBLIC_ORIGIN: "ftp://x",
      REGISTRATION_ENABLED: "maybe",
      CONFIRMATION_LINK_TTL_HOURS: "169",
      SMTP_PORT: "70000",
      SMTP_FROM: "nobody",
    });
    assert.equal(result.ok, false);
    assert.deepEqual(
      result.ok ? [] : result.problems.map((problem) => problem.name).sort(),
      [
        "CONFIRMATION_LINK_TTL_HOURS",
        "DATABASE_URL",
        "IDENTITY_AUTH_SECRET",
        "PUBLIC_ORIGIN",
        "REDIS_URL",
        "REGISTRATION_ENABLED",
        "SMTP_FROM",
        "SMTP_PORT",
      ],
    );
    const text = formatConfigProblems(
      "identity",
      result.ok ? [] : result.problems,
    );
    assert.match(
      text,
      /^Invalid configuration for unit "identity":\n {2}\w+: /,
    );
    assert.doesNotMatch(text, /too-short-secret|ftp:|maybe|70000|nobody/);
  });

  it("IDN-F-5 requires both bot-check keys while CAPTCHA_ENABLED is true", () => {
    const missing = loadIdentityConfig({
      ...required,
      CAPTCHA_ENABLED: "true",
    });
    assert.equal(missing.ok, false);
    assert.deepEqual(
      missing.ok ? [] : missing.problems.map((problem) => problem.name).sort(),
      ["CAPTCHA_SECRET_KEY", "CAPTCHA_SITE_KEY"],
    );
    const present = loadIdentityConfig({
      ...required,
      CAPTCHA_ENABLED: "true",
      CAPTCHA_SITE_KEY: "site",
      CAPTCHA_SECRET_KEY: "secret",
    });
    assert.ok(present.ok);
  });
});
