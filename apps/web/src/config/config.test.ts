import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadWebConfig } from "@stash/contracts/web";

describe("M1 configuration of web", () => {
  it("W-1 SCF-AC-2.6: an environment without any variable gives every default", () => {
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
});
