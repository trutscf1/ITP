import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
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
});
