import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DELETE, PATCH, POST, PUT } from "../app/api/docs/route.ts";

describe("M6 methods of /api/docs", () => {
  const handlers = { POST, PUT, PATCH, DELETE };
  for (const [method, handler] of Object.entries(handlers)) {
    it(`W-21 SCF-AC-3.4: ${method} /api/docs gives 405 method-not-allowed with Allow`, async () => {
      const response = await handler(
        new Request("http://localhost/api/docs", { method }),
      );
      assert.equal(response.status, 405);
      assert.equal(response.headers.get("allow"), "GET, HEAD");
      assert.deepEqual(await response.json(), {
        code: "method-not-allowed",
        message: "The method is not allowed for this path.",
      });
    });
  }
});
