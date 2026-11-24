// IDN-T-25 (M7) and IDN-T-8 (IDN-AC-1.8): the hourly removal of unconfirmed accounts.
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { setTimeout as sleep } from "node:timers/promises";
import pg from "pg";
import { skip } from "./test-support/database.ts";
import {
  address,
  confirmationToken,
  type Running,
  registration,
  type Stack,
  startIdentity,
  startStack,
} from "./test-support/harness.ts";

const day = 86_400_000;

describe("IDN-US-1 clean-up of unconfirmed accounts", { skip }, () => {
  let stack: Stack;
  let running: Running;

  before(async () => {
    stack = await startStack();
    running = await startIdentity(stack);
  });
  after(async () => {
    await running?.close();
    await stack?.stop();
  });

  /** Registers an address as if it were `age` ago. */
  async function registerAged(email: string, age: number): Promise<void> {
    const aged = await startIdentity(stack, {
      clock: () => new Date(Date.now() - age),
    });
    const reply = await aged.post("/register", registration(email));
    assert.equal(reply.status, 202);
    await aged.close();
  }

  async function exists(email: string) {
    const rows = await stack.database.query<{ id: string }>(
      "SELECT id FROM auth_users WHERE email = $1",
      [email],
    );
    return rows[0]?.id;
  }

  it("IDN-T-25 IDN-F-31 removes only the account unconfirmed for 8 days, with its users row, credentials, and open links", async () => {
    const six = address("six");
    const eight = address("eight");
    const confirmed = address("confirmed");
    await registerAged(six, 6 * day);
    await registerAged(eight, 8 * day);
    await registerAged(confirmed, 30 * day);
    await stack.database.query(
      "UPDATE auth_users SET email_verified = true WHERE email = $1",
      [confirmed],
    );

    const eightId = await exists(eight);
    assert.ok(eightId);
    const removed = await running.identity.runCleanup();
    assert.equal(removed, 1);

    assert.equal(await exists(eight), undefined);
    assert.ok(await exists(six));
    assert.ok(await exists(confirmed));
    assert.equal(
      (
        await stack.database.query(
          "SELECT 1 FROM auth_accounts WHERE user_id = $1",
          [eightId],
        )
      ).length,
      0,
    );
    assert.equal(
      (
        await stack.database.query(
          "SELECT 1 FROM users WHERE auth_user_id = $1",
          [eightId],
        )
      ).length,
      0,
    );
    assert.equal(
      (
        await stack.database.query(
          "SELECT 1 FROM auth_verifications WHERE value = $1",
          [eightId],
        )
      ).length,
      0,
    );
    // The open links of the two remaining accounts stay.
    const links = await stack.database.query(
      "SELECT value FROM auth_verifications",
    );
    assert.equal(links.length >= 1, true);
  });

  it("IDN-T-25 IDN-AC-1.8 IDN-F-31 removes the reset link of a removed account too, and keeps the links of the accounts that stay", async () => {
    const gone = address("link-gone");
    const stays = address("link-stays");
    await registerAged(gone, 8 * day);
    await registerAged(stays, 6 * day);
    for (const email of [gone, stays]) {
      const reply = await running.post("/password-reset/request", { email });
      assert.equal(reply.status, 202);
    }
    const goneId = await exists(gone);
    const staysId = await exists(stays);
    assert.ok(goneId);
    assert.ok(staysId);
    const links = (id: string) =>
      stack.database.query<{ identifier: string }>(
        "SELECT identifier FROM auth_verifications WHERE value = $1",
        [id],
      );
    // A confirmation link and a reset link each.
    assert.equal((await links(goneId)).length, 2);

    await running.identity.runCleanup();

    assert.equal(await exists(gone), undefined);
    assert.equal((await links(goneId)).length, 0);
    assert.equal((await links(staysId)).length, 2);
  });

  it("IDN-T-8 IDN-AC-1.8 IDN-F-31 lets the address register again after the clean-up, as a fresh account", async () => {
    const email = address();
    await registerAged(email, 8 * day);
    const oldId = await exists(email);
    assert.ok(oldId);
    assert.equal(stack.smtp.to(email).length, 1);

    await running.identity.runCleanup();
    assert.equal(await exists(email), undefined);

    const reply = await running.post("/register", registration(email));
    assert.equal(reply.status, 202);
    const freshId = await exists(email);
    assert.ok(freshId);
    assert.notEqual(freshId, oldId);
    assert.equal(stack.smtp.to(email).length, 2);
    const link = confirmationToken(stack.smtp.to(email)[1]?.text ?? "");
    assert.equal(
      (await running.get(`/confirm?token=${link}`)).headers.get("location"),
      "/login?confirmed=1",
    );
  });

  it("IDN-F-31 Q346 restarts the period with a new registration of the unconfirmed address: re-registered 6.9 days ago it stays, re-registered 7.1 days ago it goes", async () => {
    const stays = address("again-stays");
    const goes = address("again-goes");
    for (const [email, second] of [
      [stays, 6.9],
      [goes, 7.1],
    ] as const) {
      await registerAged(email, 8 * day);
      await registerAged(email, second * day);
    }
    await running.identity.runCleanup();
    assert.ok(await exists(stays));
    assert.equal(await exists(goes), undefined);
  });

  it("IDN-T-25 IDN-AC-1.8 IDN-F-31 Q346 keeps an account that is registered again or confirmed while the clean-up is deleting, with its links", async () => {
    // The clean-up is one conditional delete (no read of candidates before it): the row lock of
    // the test holds the delete back, the change of the other request commits, and the delete
    // finds the row no longer matching.
    for (const change of [
      "created_at = now()",
      "email_verified = true",
    ] as const) {
      const email = address("races");
      await registerAged(email, 8 * day);
      const id = await exists(email);
      assert.ok(id);
      const other = new pg.Client({ connectionString: stack.database.url });
      await other.connect();
      try {
        await other.query("BEGIN");
        await other.query(
          "SELECT id FROM auth_users WHERE id = $1 FOR UPDATE",
          [id],
        );
        const cleanup = running.identity.runCleanup();
        const deadline = Date.now() + 5000;
        for (;;) {
          const waiting = await stack.database.query(
            "SELECT 1 FROM pg_stat_activity WHERE wait_event_type = 'Lock' AND datname = current_database() AND query LIKE '%DELETE FROM auth_users%' AND pid <> pg_backend_pid()",
          );
          if (waiting.length > 0) break;
          assert.ok(
            Date.now() < deadline,
            "the clean-up never waited for the lock",
          );
          await sleep(20);
        }
        await other.query(`UPDATE auth_users SET ${change} WHERE id = $1`, [
          id,
        ]);
        await other.query("COMMIT");
        assert.equal(await cleanup, 0);
      } finally {
        await other.end();
      }
      assert.equal(await exists(email), id);
      assert.equal(
        (
          await stack.database.query(
            "SELECT 1 FROM auth_verifications WHERE value = $1",
            [id],
          )
        ).length,
        1,
      );
    }
  });

  it("IDN-F-31 never removes an account that was confirmed in the meantime, however old", async () => {
    const email = address("confirmed-late");
    await registerAged(email, 20 * day);
    await stack.database.query(
      "UPDATE auth_users SET email_verified = true WHERE email = $1",
      [email],
    );
    await running.identity.runCleanup();
    assert.ok(await exists(email));
  });

  it("IDN-F-31 honours UNCONFIRMED_ACCOUNT_TTL_DAYS", async () => {
    const email = address();
    await registerAged(email, 2 * day);
    const short = await startIdentity(stack, {
      env: { UNCONFIRMED_ACCOUNT_TTL_DAYS: "1" },
    });
    assert.ok((await short.identity.runCleanup()) >= 1);
    assert.equal(await exists(email), undefined);
    await short.close();
  });
});
