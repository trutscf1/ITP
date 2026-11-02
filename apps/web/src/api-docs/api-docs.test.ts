import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { loadWebConfig } from "@stash/contracts/web";
import { serveApiDocs } from "./api-docs.ts";

const fixture = join(import.meta.dirname, "fixture.openapi.json");

describe("M6 API description at /api/docs", () => {
  it("W-13 SCF-AC-3.3: the response is the generated file byte for byte, as JSON", async () => {
    const response = await serveApiDocs(fixture);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "application/json");
    const body = Buffer.from(await response.arrayBuffer());
    assert.deepEqual(body, readFileSync(fixture));
  });

  it("W-13 SCF-AC-3.3: the default OPENAPI_FILE serves the description that the contracts build wrote", async () => {
    const result = loadWebConfig({});
    assert.ok(result.ok);
    const response = await serveApiDocs(result.config.OPENAPI_FILE);
    assert.equal(response.status, 200);
    const body = Buffer.from(await response.arrayBuffer());
    const generated = join(
      import.meta.dirname,
      "../../../../packages/contracts/dist/openapi.json",
    );
    assert.deepEqual(body, readFileSync(generated));
  });

  it("W-15 SCF-AC-3.4: a missing file gives 500 internal-error and names no path", async () => {
    const missing = join(import.meta.dirname, "missing", "openapi.json");
    const response = await serveApiDocs(missing);
    assert.equal(response.status, 500);
    assert.equal(response.headers.get("content-type"), "application/json");
    const text = await response.text();
    assert.deepEqual(JSON.parse(text), {
      code: "internal-error",
      message: "The request could not be processed.",
    });
    assert.ok(!text.includes("missing"), "the body names the path");
    assert.ok(!text.includes("openapi.json"), "the body names the file");
  });
});
