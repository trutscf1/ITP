import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadWebConfig, loadWebConfigValue } from "@stash/contracts/web";

describe("M1 configuration of web", () => {
  it("W-1 M1: an environment without any variable gives every default", () => {
    assert.deepEqual(loadWebConfig({}), {
      ok: true,
      config: {
        PORT: 3000,
        APP_VERSION: "0.0.0-dev",
        HEALTH_TIMEOUT_MS: 2000,
        IDENTITY_HEALTH_URL: "http://identity:3001/health",
        STORAGE_HEALTH_URL: "http://storage:3002/health",
        WORKER_HEALTH_URL: "http://worker:3003/health",
        CMS_HEALTH_URL: "http://cms:1337/health",
        OPENAPI_FILE: "../../packages/contracts/dist/openapi.json",
        REGISTRATION_ENABLED: true,
        CAPTCHA_ENABLED: false,
        CAPTCHA_SITE_KEY: "",
      },
    });
  });

  it("W-22 SCF-F-10: reading one variable ignores an invalid value of another", () => {
    assert.deepEqual(
      loadWebConfigValue({ CMS_HEALTH_URL: "ftp://cms" }, "OPENAPI_FILE"),
      { ok: true, value: "../../packages/contracts/dist/openapi.json" },
    );
  });

  it("W-22 SCF-F-10: reading one variable reports its own invalid value", () => {
    assert.deepEqual(
      loadWebConfigValue({ OPENAPI_FILE: "x".repeat(513) }, "OPENAPI_FILE"),
      {
        ok: false,
        problem: {
          name: "OPENAPI_FILE",
          reason: "expected 1 to 512 characters",
        },
      },
    );
  });

  it("IDN-T-51 IDN-AC-1.7 IDN-F-30: REGISTRATION_ENABLED=false closes the registration page", () => {
    assert.deepEqual(
      loadWebConfigValue(
        { REGISTRATION_ENABLED: "false" },
        "REGISTRATION_ENABLED",
      ),
      { ok: true, value: false },
    );
  });

  it("IDN-T-49 IDN-AC-1.5 IDN-F-5: a switch other than true or false is a problem", () => {
    assert.deepEqual(
      loadWebConfigValue({ CAPTCHA_ENABLED: "yes" }, "CAPTCHA_ENABLED"),
      {
        ok: false,
        problem: { name: "CAPTCHA_ENABLED", reason: "expected true or false" },
      },
    );
  });

  it("IDN-T-49 IDN-AC-1.5 IDN-F-5: the bot check switched on needs a site key", () => {
    assert.deepEqual(loadWebConfig({ CAPTCHA_ENABLED: "true" }), {
      ok: false,
      problems: [
        {
          name: "CAPTCHA_SITE_KEY",
          reason: "required when CAPTCHA_ENABLED is true",
        },
      ],
    });
  });

  it("IDN-T-49 IDN-AC-1.5 IDN-F-5: the bot check switched on with a site key is valid", () => {
    const result = loadWebConfig({
      CAPTCHA_ENABLED: "true",
      CAPTCHA_SITE_KEY: "0x4AAAAAAA-site",
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.config.CAPTCHA_ENABLED, true);
      assert.equal(result.config.CAPTCHA_SITE_KEY, "0x4AAAAAAA-site");
    }
  });
});
