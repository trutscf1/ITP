// IDN-F-6 (review of !62, schwaigc #1): a confirmation that lands between the lookup of the
// registration and its update must not let the new registration change the confirmed account.
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { type AuthCore, createAuthCore } from "./auth-core.ts";
import { createLogger } from "./logger.ts";
import type { Mailer } from "./mailer.ts";
import { register } from "./registration.ts";
import { skip } from "./test-support/database.ts";
import {
  address,
  confirmationToken,
  password,
  type Running,
  registration,
  type Stack,
  startIdentity,
  startStack,
} from "./test-support/harness.ts";

describe("IDN-F-6 registration racing a confirmation", { skip }, () => {
  let stack: Stack;
  let running: Running;
  let auth: AuthCore;

  before(async () => {
    stack = await startStack();
    running = await startIdentity(stack);
    auth = await createAuthCore({
      databaseUrl: stack.database.url,
      secret: "0123456789abcdef0123456789abcdef",
      publicOrigin: "http://localhost:8080",
      logger: createLogger(() => {}),
    });
  });
  after(async () => {
    await auth?.close();
    await running?.close();
    await stack?.stop();
  });

  it("IDN-AC-1.6 IDN-F-6 keeps the password of an account confirmed after the lookup and sends the notice instead of a link", async () => {
    const email = address();
    await running.post("/register", registration(email));
    // The lookup of the second registration still sees the account unconfirmed …
    const stale = await auth.findAccount(email);
    assert.equal(stale?.emailVerified, false);
    // … and the person opens the link before the update runs.
    const token = confirmationToken(stack.smtp.to(email)[0]?.text ?? "");
    await running.get(`/confirm?token=${token}`);
    const before = (await auth.findAccount(email))?.passwordHash;

    const sent: string[] = [];
    const mailer: Mailer = {
      sendConfirmation: async () => {
        sent.push("confirmation");
        return true;
      },
      sendNotice: async () => {
        sent.push("notice");
        return true;
      },
      sendReset: async () => true,
    };
    const racing: AuthCore = { ...auth, findAccount: async () => stale };
    const outgoing = await register(
      {
        auth: racing,
        mailer,
        clock: () => new Date(),
        confirmationLinkTtlHours: 24,
      },
      { name: "Mallory", email, password: "Fremdes-Passwort-42" },
      "en",
    );
    await outgoing?.();

    const after = await auth.findAccount(email);
    assert.equal(after?.passwordHash, before);
    assert.equal(after?.name, "Ada");
    assert.deepEqual(sent, ["notice"]);
    assert.equal(
      (await running.post("/login", { email, password })).status,
      200,
    );
  });
});
