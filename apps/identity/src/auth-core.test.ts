// M2 AuthCore (concept §16): the set-up of the authentication library. Needs no database, because
// the pool connects only with the first statement.
import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";
import pg from "pg";
import { createAuthCore } from "./auth-core.ts";
import { createLogger } from "./logger.ts";

describe("IDN-C-1 AuthCore set-up", () => {
  it("IDN-C-1 closes the pool it opened when the set-up of the authentication library fails", async () => {
    const end = mock.method(pg.Pool.prototype, "end", async () => {});
    try {
      await assert.rejects(
        createAuthCore({
          databaseUrl: "postgresql://nobody:nothing@127.0.0.1:1/none",
          secret: "0123456789abcdef0123456789abcdef",
          publicOrigin: "not a url",
          logger: createLogger(() => {}),
        }),
        /base URL/,
      );
      assert.equal(end.mock.callCount(), 1);
    } finally {
      end.mock.restore();
    }
  });
});
