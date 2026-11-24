// IDN-US-6 slice 1 over HTTP (concept §17, IDN-T-16 to IDN-T-20): the reset request and the new
// password, against the test database, the test Redis, the SMTP stub, and a clock the test moves.
// The forgot-password and new-password pages are slice 2 in `web`.
import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import { skip } from "./test-support/database.ts";
import {
  address,
  botCheckStub,
  confirmedAccount,
  password,
  type Running,
  randomIp,
  registration,
  type Stack,
  sessionToken,
  startIdentity,
  startStack,
} from "./test-support/harness.ts";
import { hashToken } from "./token-hash.ts";

const newPassword = "Vier-gruene-Baeume-8";
const minute = 60_000;

/** The token of the reset link in the text of an e-mail. */
function resetToken(text: string): string {
  const match = /\/reset-password\?token=([\w-]+)/.exec(text);
  if (!match?.[1]) throw new Error(`no reset link in: ${text}`);
  return match[1];
}

describe("IDN-US-6 reset the password", { skip }, () => {
  let stack: Stack;
  let running: Running;
  // The authentication library checks link expiry against the real time, so the clock starts
  // at the real time and the tests move it forward.
  let offset = 0;
  const later = (minutes: number) => {
    offset = minutes * minute;
  };

  before(async () => {
    stack = await startStack();
    running = await startIdentity(stack, {
      clock: () => new Date(Date.now() + offset),
    });
  });
  after(async () => {
    await running?.close();
    await stack?.stop();
  });
  // A test that moved the clock and failed early leaves it moved; every test starts at zero.
  beforeEach(() => later(0));

  async function requestResetLink(email: string): Promise<string> {
    const reply = await running.post("/password-reset/request", { email });
    assert.equal(reply.status, 202);
    return resetToken(stack.smtp.to(email).at(-1)?.text ?? "");
  }

  it("IDN-T-16 IDN-AC-6.1 IDN-F-25 IDN-E-7 accepts a link once within 30 minutes and refuses an older, a used, and a late one", async () => {
    later(0);
    const email = address();
    await confirmedAccount(stack, running, email);
    const first = await requestResetLink(email);
    const second = await requestResetLink(email);

    const replaced = await running.post("/password-reset", {
      token: first,
      password: newPassword,
    });
    assert.equal(replaced.status, 400);
    assert.deepEqual(replaced.body, {
      code: "link-invalid",
      message: "This link is invalid or has expired.",
    });

    later(31);
    const late = await running.post("/password-reset", {
      token: second,
      password: newPassword,
    });
    assert.equal(late.status, 400);
    assert.equal(late.body?.code, "link-invalid");

    later(0);
    const fresh = await requestResetLink(email);
    later(29);
    const used = await running.post("/password-reset", {
      token: fresh,
      password: newPassword,
    });
    assert.equal(used.status, 204);
    const again = await running.post("/password-reset", {
      token: fresh,
      password: "Fuenf-rote-Haeuser-9",
    });
    assert.equal(again.status, 400);
    assert.equal(again.body?.code, "link-invalid");
    later(0);
  });

  it("IDN-T-16 IDN-F-25 names the validity of RESET_LINK_TTL_MINUTES in the e-mail and links below PUBLIC_ORIGIN", async () => {
    const email = address();
    await confirmedAccount(stack, running, email);
    await running.post("/password-reset/request", { email });
    const mail = stack.smtp.to(email).at(-1);
    assert.match(
      mail?.text ?? "",
      /http:\/\/localhost:8080\/reset-password\?token=/,
    );
    assert.match(mail?.text ?? "", /30/);
  });

  it("IDN-T-16 IDN-NF-5 gives the reset link at least 128 random bits and stores only a hash of it", async () => {
    const email = address();
    await confirmedAccount(stack, running, email);
    const token = await requestResetLink(email);
    assert.ok(Buffer.from(token, "base64url").length >= 16);
    const rows = await stack.database.query<{ identifier: string }>(
      "SELECT identifier FROM auth_verifications WHERE identifier LIKE 'reset:%'",
    );
    const identifiers = rows.map((row) => row.identifier);
    assert.ok(identifiers.includes(`reset:${hashToken(token)}`));
    assert.ok(!identifiers.some((identifier) => identifier.includes(token)));
  });

  it("IDN-T-17 IDN-AC-6.2 IDN-F-26 IDN-E-1 refuses password1234 like the registration and keeps the link", async () => {
    const email = address();
    await confirmedAccount(stack, running, email);
    const token = await requestResetLink(email);
    const weak = await running.post("/password-reset", {
      token,
      password: "password1234",
    });
    assert.equal(weak.status, 400);
    assert.equal(weak.body?.code, "validation-failed");
    const strong = await running.post("/password-reset", {
      token,
      password: newPassword,
    });
    assert.equal(strong.status, 204);
  });

  it("IDN-T-18 IDN-AC-6.3 IDN-F-27 ends the sessions on both devices, and only the new password logs in", async () => {
    const email = address();
    await confirmedAccount(stack, running, email);
    const one = await running.post("/login", { email, password });
    const two = await running.post("/login", { email, password });
    const token = await requestResetLink(email);
    assert.equal(
      (await running.post("/password-reset", { token, password: newPassword }))
        .status,
      204,
    );
    for (const login of [one, two]) {
      const check = await running.get("/session", {
        cookie: `stash_session=${sessionToken(login)}`,
      });
      assert.equal(check.status, 401);
    }
    assert.equal(
      (await running.post("/login", { email, password })).status,
      401,
    );
    assert.equal(
      (await running.post("/login", { email, password: newPassword })).status,
      200,
    );
  });

  it("IDN-T-19 IDN-AC-6.4 IDN-F-28 answers a known and an unknown address alike and mails only the known one", async () => {
    const known = address();
    const unknown = address("nobody");
    await confirmedAccount(stack, running, known);
    const sentBefore = stack.smtp.to(known).length;
    const a = await running.post("/password-reset/request", { email: known });
    const b = await running.post("/password-reset/request", { email: unknown });
    assert.equal(a.status, 202);
    assert.equal(b.status, 202);
    assert.deepEqual(a.body, { status: "check-mailbox" });
    assert.deepEqual(b.body, a.body);
    assert.equal(stack.smtp.to(known).length, sentBefore + 1);
    assert.equal(stack.smtp.to(unknown).length, 0);
  });

  it("IDN-T-20 IDN-AC-6.6 IDN-F-33 lets a never confirmed account log in after the reset", async () => {
    const email = address();
    await running.post("/register", registration(email));
    const token = await requestResetLink(email);
    assert.equal(
      (await running.post("/password-reset", { token, password: newPassword }))
        .status,
      204,
    );
    assert.equal(
      (await running.post("/login", { email, password: newPassword })).status,
      200,
    );
  });

  it("IDN-T-16 IDN-F-25 IDN-NF-5 lets only one of two parallel uses of one link through", async () => {
    const email = address();
    await confirmedAccount(stack, running, email);
    const token = await requestResetLink(email);
    const replies = await Promise.all([
      running.post("/password-reset", { token, password: newPassword }),
      running.post("/password-reset", {
        token,
        password: "Fuenf-rote-Haeuser-9",
      }),
    ]);
    assert.deepEqual(replies.map((reply) => reply.status).sort(), [204, 400]);
  });

  it("IDN-T-18 IDN-F-27 sets a password for an account that has no password credential yet", async () => {
    const email = address();
    await confirmedAccount(stack, running, email);
    await stack.database.query(
      "DELETE FROM auth_accounts WHERE provider_id = 'credential' AND user_id = (SELECT id FROM auth_users WHERE email = $1)",
      [email],
    );
    const token = await requestResetLink(email);
    assert.equal(
      (await running.post("/password-reset", { token, password: newPassword }))
        .status,
      204,
    );
    assert.equal(
      (await running.post("/login", { email, password: newPassword })).status,
      200,
    );
  });

  it("IDN-AC-2.3 IDN-F-9 keeps the reset working while the password login of the address is locked", async () => {
    const email = address();
    await confirmedAccount(stack, running, email);
    for (let i = 0; i < 5; i++) {
      await running.post("/login", { email, password: "Not-the-right-one-1" });
    }
    assert.equal(
      (await running.post("/login", { email, password })).status,
      429,
    );
    const token = await requestResetLink(email);
    assert.equal(
      (await running.post("/password-reset", { token, password: newPassword }))
        .status,
      204,
    );
  });

  it("IDN-E-1 answers an invalid reset request or new-password body with 400 validation-failed", async () => {
    const request = await running.post("/password-reset/request", {
      email: "x",
    });
    assert.equal(request.status, 400);
    assert.equal(request.body?.code, "validation-failed");
    const reset = await running.post("/password-reset", {
      token: "",
      password: newPassword,
    });
    assert.equal(reset.status, 400);
    assert.equal(reset.body?.code, "validation-failed");
  });

  it("IDN-F-25 answers the methods of the reset paths with 405 for the wrong method", async () => {
    assert.equal((await running.get("/password-reset/request")).status, 405);
    assert.equal((await running.get("/password-reset")).status, 405);
  });
});

describe(
  "IDN-T-20 IDN-AC-6.5 IDN-F-29 protected reset request",
  { skip },
  () => {
    let stack: Stack;
    before(async () => {
      stack = await startStack();
    });
    after(async () => {
      await stack?.stop();
    });

    it("IDN-T-20 IDN-AC-6.5 IDN-F-29 IDN-E-2 refuses a reset request without a passing bot check", async () => {
      const stub = botCheckStub(false);
      const running = await startIdentity(stack, {
        env: {
          CAPTCHA_ENABLED: "true",
          CAPTCHA_SITE_KEY: "site",
          CAPTCHA_SECRET_KEY: "secret",
        },
        botCheck: stub,
      });
      const email = address();
      const missing = await running.post("/password-reset/request", { email });
      assert.equal(missing.status, 400);
      assert.equal(missing.body?.code, "bot-check-failed");
      assert.equal(stub.calls, 0);
      const rejected = await running.post("/password-reset/request", {
        email,
        botToken: "token",
      });
      assert.equal(rejected.status, 400);
      assert.equal(rejected.body?.code, "bot-check-failed");
      assert.equal(stub.calls, 1);
      assert.equal(stack.smtp.to(email).length, 0);
      await running.close();
    });

    it("IDN-T-20 IDN-AC-6.5 IDN-F-35 IDN-E-3 refuses the 6th reset request from one IP address within 60 s", async () => {
      const running = await startIdentity(stack);
      const ip = randomIp();
      for (let i = 0; i < 5; i++) {
        const reply = await running.post(
          "/password-reset/request",
          { email: address() },
          { ip },
        );
        assert.equal(reply.status, 202);
      }
      const sixth = await running.post(
        "/password-reset/request",
        { email: address() },
        { ip },
      );
      assert.equal(sixth.status, 429);
      assert.equal(sixth.body?.code, "too-many-requests");
      assert.ok(Number(sixth.headers.get("retry-after")) >= 1);
      await running.close();
    });
  },
);

describe(
  "IDN-AC-1.7 IDN-F-30 reset with the registration closed",
  { skip },
  () => {
    let stack: Stack;
    before(async () => {
      stack = await startStack();
    });
    after(async () => {
      await stack?.stop();
    });

    it("IDN-AC-1.7 IDN-F-30 IDN-T-7 still sends a reset link and sets the new password while REGISTRATION_ENABLED=false", async () => {
      const email = address();
      const open = await startIdentity(stack);
      await confirmedAccount(stack, open, email);
      await open.close();

      const closed = await startIdentity(stack, {
        env: { REGISTRATION_ENABLED: "false" },
      });
      try {
        const refused = await closed.post("/register", registration(address()));
        assert.equal(refused.body?.code, "registration-closed");

        const requested = await closed.post("/password-reset/request", {
          email,
        });
        assert.equal(requested.status, 202);
        const token = resetToken(stack.smtp.to(email).at(-1)?.text ?? "");
        const done = await closed.post("/password-reset", {
          token,
          password: newPassword,
        });
        assert.equal(done.status, 204);
        const login = await closed.post("/login", {
          email,
          password: newPassword,
        });
        assert.equal(login.status, 200);
      } finally {
        await closed.close();
      }
    });
  },
);
