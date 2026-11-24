// IDN-F-4, IDN-F-6 (review of !62, schwaigc, the mirror of registration-race.test.ts): a
// registration again that replaces the links of an unconfirmed account while a confirmation is
// under way must not let the old link confirm the account with the new password.
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import pg from "pg";
import { type AuthCore, createAuthCore } from "./auth-core.ts";
import { createLogger } from "./logger.ts";
import { skip } from "./test-support/database.ts";
import { address, type Stack, startStack } from "./test-support/harness.ts";

describe("IDN-F-4 confirmation racing a registration again", { skip }, () => {
  let stack: Stack;
  let auth: AuthCore;

  before(async () => {
    stack = await startStack();
    auth = await createAuthCore({
      databaseUrl: stack.database.url,
      secret: "0123456789abcdef0123456789abcdef",
      publicOrigin: "http://localhost:8080",
      logger: createLogger(() => {}),
    });
  });
  after(async () => {
    await auth?.close();
    await stack?.stop();
  });

  it("IDN-AC-1.4 IDN-F-4 IDN-F-6 refuses a link that a registration again replaced while the confirmation ran", async () => {
    const now = new Date();
    const email = address();
    const { id, token } = await auth.createAccount({
      name: "Ada",
      email,
      passwordHash: await auth.hashPassword("Drei-blaue-Wolken-7"),
      now,
      validityHours: 24,
    });

    // The registration again holds the account row while it replaces the links of the account,
    // as `replaceUnconfirmed` does in its transaction.
    const registeringAgain = new pg.Client({
      connectionString: stack.database.url,
    });
    await registeringAgain.connect();
    try {
      await registeringAgain.query("BEGIN");
      await registeringAgain.query(
        "SELECT id FROM auth_users WHERE id = $1 FOR UPDATE",
        [id],
      );
      // The person opens the old link now; the confirmation waits for the account row.
      const confirming = auth.confirm(token, now);
      await delay(300);
      await registeringAgain.query(
        "DELETE FROM auth_verifications WHERE value = $1 AND identifier LIKE 'confirm:%'",
        [id],
      );
      await registeringAgain.query("COMMIT");

      assert.equal(await confirming, false);
      assert.equal((await auth.findAccount(email))?.emailVerified, false);
    } finally {
      await registeringAgain.end();
    }
  });
});
