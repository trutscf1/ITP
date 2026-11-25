// A registration changes several rows (user, credential, links). When one step fails, none of
// them may stay: the account is created or replaced completely, or not at all (IDN-F-4, IDN-F-6).
// The failure is made by a trigger on auth_accounts that refuses the step in the test database.
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
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

describe(
  "IDN-US-1 a failing step of the registration leaves nothing behind",
  { skip },
  () => {
    let stack: Stack;
    let running: Running;

    before(async () => {
      stack = await startStack();
      running = await startIdentity(stack);
      await stack.database.query(
        `CREATE FUNCTION refuse_step() RETURNS trigger AS $$
       BEGIN RAISE EXCEPTION 'refused by the test'; END $$ LANGUAGE plpgsql`,
      );
    });
    after(async () => {
      await running?.close();
      await stack?.stop();
    });

    const refuse = (operation: "INSERT" | "UPDATE") =>
      stack.database.query(
        `CREATE TRIGGER refuse BEFORE ${operation} ON auth_accounts
       FOR EACH ROW EXECUTE FUNCTION refuse_step()`,
      );
    const allow = () =>
      stack.database.query("DROP TRIGGER IF EXISTS refuse ON auth_accounts");

    it("IDN-F-4 creates no user, users row, or link when the credential cannot be stored, and the address can register afterwards", async () => {
      const email = address("create");
      await refuse("INSERT");
      try {
        const failed = await running.post("/register", registration(email));
        assert.equal(failed.status, 500);
        assert.equal(failed.body?.code, "internal-error");
      } finally {
        await allow();
      }
      assert.equal(
        (
          await stack.database.query(
            "SELECT 1 FROM auth_users WHERE email = $1",
            [email],
          )
        ).length,
        0,
      );
      assert.equal(stack.smtp.to(email).length, 0);

      const retry = await running.post("/register", registration(email));
      assert.equal(retry.status, 202);
      assert.equal(stack.smtp.to(email).length, 1);
    });

    it("IDN-F-6 keeps name, hash, time, and link of an unconfirmed account when the replacement fails half way", async () => {
      const email = address("replace");
      await running.post(
        "/register",
        registration(email, { name: "Old name" }),
      );
      const before = await stack.database.query<{
        name: string;
        created_at: string;
        password: string;
        links: string;
      }>(
        `SELECT u.name, u.created_at::text, a.password,
         (SELECT count(*) FROM auth_verifications v WHERE v.value = u.id) AS links
       FROM auth_users u JOIN auth_accounts a ON a.user_id = u.id WHERE u.email = $1`,
        [email],
      );
      assert.equal(before[0]?.links, "1");
      const link = confirmationToken(stack.smtp.to(email)[0]?.text ?? "");

      await refuse("UPDATE");
      try {
        const failed = await running.post(
          "/register",
          registration(email, { name: "New name" }),
        );
        assert.equal(failed.status, 500);
      } finally {
        await allow();
      }
      const after = await stack.database.query(
        `SELECT u.name, u.created_at::text, a.password,
         (SELECT count(*) FROM auth_verifications v WHERE v.value = u.id) AS links
       FROM auth_users u JOIN auth_accounts a ON a.user_id = u.id WHERE u.email = $1`,
        [email],
      );
      assert.deepEqual(after, before);
      assert.equal(
        (await running.get(`/confirm?token=${link}`)).headers.get("location"),
        "/login?confirmed=1",
      );
    });
  },
);
