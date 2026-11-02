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
});
