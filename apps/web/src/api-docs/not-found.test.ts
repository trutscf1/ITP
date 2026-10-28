import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DELETE, GET, PATCH, POST, PUT } from "../app/api/[...path]/route.ts";

describe("M6 errors under /api", () => {
  const handlers = { GET, POST, PUT, PATCH, DELETE };
  for (const [method, handler] of Object.entries(handlers)) {
    it(`W-16 SCF-AC-3.4: ${method} /api/unknown gives 404 not-found`, async () => {
      const response = await handler(
        new Request("http://localhost/api/unknown", { method }),
      );
      assert.equal(response.status, 404);
      assert.deepEqual(await response.json(), {
        code: "not-found",
        message: "The requested resource does not exist.",
      });
    });
  }
});
