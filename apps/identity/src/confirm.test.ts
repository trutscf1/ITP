// IDN-T-4 (IDN-AC-1.4) over HTTP: the login answer before and after the confirmation (IDN-E-5,
// IDN-F-7). Locks, logout, and the session check of IDN-US-2 are in login.test.ts.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { after, before, describe, it } from "node:test";
import { Redis } from "ioredis";
import { redisUrl, skip } from "./test-support/database.ts";
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

const hour = 3_600_000;

describe("IDN-US-1 confirm the e-mail address", { skip }, () => {
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

  it("IDN-T-4 IDN-AC-1.4 IDN-F-4 IDN-F-32 IDN-E-5 IDN-E-7 refuses the login before the link, takes the link once, and logs in afterwards", async () => {
    const email = address();
    await running.post("/register", registration(email));
    assert.ok(stack.smtp.to(email)[0]);

    const before = await running.post("/login", { email, password });
    assert.equal(before.status, 403);
    assert.deepEqual(before.body, {
      code: "address-not-confirmed",
      message: "Please confirm your e-mail address first.",
    });
    assert.equal(before.headers.get("set-cookie"), null);
    // The refused login sent a new link (IDN-E-5), which replaced the one of the registration.
    const resent = stack.smtp.to(email)[1];
    assert.ok(resent);
    const token = confirmationToken(resent.text);

    const opened = await running.get(`/confirm?token=${token}`);
    assert.equal(opened.status, 303);
    assert.equal(opened.headers.get("location"), "/login?confirmed=1");

    const again = await running.get(`/confirm?token=${token}`);
    assert.equal(again.status, 303);
    assert.equal(again.headers.get("location"), "/link-invalid?kind=confirm");

    const after = await running.post("/login", { email, password });
    assert.equal(after.status, 200);
    assert.equal(after.body?.email, email);
    assert.equal(after.body?.name, "Ada");
    assert.match(String(after.body?.userId), /^[0-9a-f-]{36}$/);

    const own = await stack.database.query(
      `SELECT 1 FROM users x JOIN auth_users u ON u.id = x.auth_user_id WHERE u.email = $1`,
      [email],
    );
    assert.equal(own.length, 1);
  });

  it("IDN-T-4 IDN-AC-1.4 IDN-E-7 sends an unknown or malformed link to the invalid-link page", async () => {
    for (const query of ["token=nope", "token=", "", "token=a&token=b"]) {
      const reply = await running.get(`/confirm?${query}`);
      assert.equal(reply.status, 303, query);
      assert.equal(reply.headers.get("location"), "/link-invalid?kind=confirm");
    }
  });

  it("IDN-T-4 IDN-NF-5 gives the link at least 128 random bits and stores only a hash of it, deleted on use", async () => {
    const email = address();
    await running.post("/register", registration(email));
    const token = confirmationToken(stack.smtp.to(email)[0]?.text ?? "");
    assert.ok(Buffer.from(token, "base64url").length >= 16);

    const rows = JSON.stringify(
      await stack.database.query("SELECT * FROM auth_verifications"),
    );
    assert.equal(rows.includes(token), false);
    const hash = createHash("sha256").update(token).digest("hex");
    assert.equal(rows.includes(hash), true);

    await running.get(`/confirm?token=${token}`);
    const left = JSON.stringify(
      await stack.database.query("SELECT * FROM auth_verifications"),
    );
    assert.equal(left.includes(hash), false);
  });

  it("IDN-T-4 IDN-AC-1.4 IDN-F-4 puts the link of the e-mail below PUBLIC_ORIGIN and names its validity in hours", async () => {
    const email = address();
    await running.post("/register", registration(email));
    const mail = stack.smtp.to(email)[0];
    assert.match(
      mail?.text ?? "",
      /http:\/\/localhost:8080\/api\/identity\/confirm\?token=[\w-]+/,
    );
    assert.match(mail?.text ?? "", /24/);
  });

  it("IDN-T-4 IDN-AC-1.4 IDN-F-4 refuses a link after CONFIRMATION_LINK_TTL_HOURS", async () => {
    const email = address();
    const old = await startIdentity(stack, {
      clock: () => new Date(Date.now() - 25 * hour),
    });
    await old.post("/register", registration(email));
    await old.close();
    const token = confirmationToken(stack.smtp.to(email)[0]?.text ?? "");
    const reply = await running.get(`/confirm?token=${token}`);
    assert.equal(reply.headers.get("location"), "/link-invalid?kind=confirm");
    const login = await running.post("/login", { email, password });
    assert.equal(login.status, 403);
  });

  it("IDN-T-4 IDN-E-5 Q345 sends a new link with the first refused login, none with the next ones, and replaces the older link", async () => {
    const email = address();
    await running.post("/register", registration(email));
    assert.equal(stack.smtp.to(email).length, 1);
    const registrationLink = confirmationToken(
      stack.smtp.to(email)[0]?.text ?? "",
    );

    const first = await running.post("/login", { email, password });
    assert.equal(first.status, 403);
    assert.equal(first.body?.code, "address-not-confirmed");
    assert.equal(stack.smtp.to(email).length, 2);
    const second = await running.post("/login", { email, password });
    assert.equal(second.status, 403);
    assert.equal(stack.smtp.to(email).length, 2);

    // The link of the registration is invalid now; the new one works.
    assert.equal(
      (await running.get(`/confirm?token=${registrationLink}`)).headers.get(
        "location",
      ),
      "/link-invalid?kind=confirm",
    );
    const token = confirmationToken(stack.smtp.to(email)[1]?.text ?? "");
    assert.equal(
      (await running.get(`/confirm?token=${token}`)).headers.get("location"),
      "/login?confirmed=1",
    );
  });

  it("IDN-T-4 IDN-E-5 Q345 keeps the resend mark for CONFIRMATION_LINK_TTL_HOURS and sends one more link when it is gone", async () => {
    const email = address();
    await running.post("/register", registration(email));
    await running.post("/login", { email, password });
    assert.equal(stack.smtp.to(email).length, 2);

    const id = (
      await stack.database.query<{ id: string }>(
        "SELECT id FROM auth_users WHERE email = $1",
        [email],
      )
    )[0]?.id;
    const redis = new Redis(redisUrl ?? "");
    try {
      const seconds = await redis.ttl(`resend:${id}`);
      assert.ok(
        seconds > 24 * 3600 - 60 && seconds <= 24 * 3600,
        `resend:<id> expires in ${seconds} s`,
      );
      await redis.del(`resend:${id}`);
    } finally {
      redis.disconnect();
    }
    await running.post("/login", { email, password });
    assert.equal(stack.smtp.to(email).length, 3);
  });

  it("IDN-T-4 IDN-E-5 sends a new link with the first refused login after the link of the registration has expired", async () => {
    const email = address();
    const old = await startIdentity(stack, {
      clock: () => new Date(Date.now() - 25 * hour),
    });
    await old.post("/register", registration(email));
    await old.close();
    assert.equal(stack.smtp.to(email).length, 1);

    const first = await running.post("/login", { email, password });
    assert.equal(first.status, 403);
    assert.equal(stack.smtp.to(email).length, 2);
    const token = confirmationToken(stack.smtp.to(email)[1]?.text ?? "");
    assert.equal(
      (await running.get(`/confirm?token=${token}`)).headers.get("location"),
      "/login?confirmed=1",
    );
  });

  it("IDN-T-4 IDN-E-5 sends no new link for a wrong password of an unconfirmed account", async () => {
    const email = address();
    const old = await startIdentity(stack, {
      clock: () => new Date(Date.now() - 25 * hour),
    });
    await old.post("/register", registration(email));
    await old.close();
    const reply = await running.post("/login", {
      email,
      password: "Not-the-right-one-1",
    });
    assert.equal(reply.status, 401);
    assert.equal(stack.smtp.to(email).length, 1);
  });
});

describe(
  "IDN-US-1 minimal login (IDN-F-7, IDN-F-11, IDN-F-36)",
  { skip },
  () => {
    let stack: Stack;
    let running: Running;
    const email = address();

    before(async () => {
      stack = await startStack();
      running = await startIdentity(stack);
      await running.post("/register", registration(email));
      const token = confirmationToken(stack.smtp.to(email)[0]?.text ?? "");
      await running.get(`/confirm?token=${token}`);
    });
    after(async () => {
      await running?.close();
      await stack?.stop();
    });

    it("IDN-F-7 IDN-F-36 sets the cookie stash_session as HttpOnly, SameSite=Lax, Path=/ and without Secure on http", async () => {
      const reply = await running.post("/login", { email, password });
      assert.equal(reply.status, 200);
      const cookie = reply.headers.get("set-cookie") ?? "";
      assert.match(cookie, /^stash_session=[\w-]{20,};/);
      assert.match(cookie, /HttpOnly/i);
      assert.match(cookie, /SameSite=Lax/i);
      assert.match(cookie, /Path=\//);
      assert.doesNotMatch(cookie, /Secure/i);
    });

    it("IDN-F-36 marks the cookie Secure when PUBLIC_ORIGIN starts with https://", async () => {
      const secure = await startIdentity(stack, {
        env: { PUBLIC_ORIGIN: "https://stash.example" },
      });
      const reply = await secure.post("/login", { email, password });
      assert.match(reply.headers.get("set-cookie") ?? "", /Secure/i);
      await secure.close();
    });

    it("IDN-F-7 keeps the session in the session store with the lifetime SESSION_TTL_DAYS and the token only as a hash", async () => {
      const reply = await running.post("/login", { email, password });
      const token = /stash_session=([\w-]+)/.exec(
        reply.headers.get("set-cookie") ?? "",
      )?.[1];
      assert.ok(token);
      const hash = createHash("sha256").update(token).digest("hex");
      const { Redis } = await import("ioredis");
      const redis = new Redis(process.env.TEST_REDIS_URL ?? "");
      try {
        const ttl = await redis.ttl(`session:${hash}`);
        assert.ok(ttl > 6 * 24 * 3600 && ttl <= 7 * 24 * 3600, `${ttl}`);
        assert.equal(await redis.exists(`session:${token}`), 0);
      } finally {
        redis.disconnect();
      }
      assert.equal(
        JSON.stringify(
          await stack.database.query("SELECT * FROM auth_sessions"),
        ),
        "[]",
      );
    });

    it("IDN-F-11 IDN-E-4 answers an unknown address and a wrong password with the same 401 invalid-credentials", async () => {
      const unknown = await running.post("/login", {
        email: address("nobody"),
        password,
      });
      const wrong = await running.post("/login", {
        email,
        password: "Not-the-right-one-1",
      });
      assert.equal(unknown.status, 401);
      assert.equal(wrong.status, 401);
      assert.deepEqual(unknown.body, wrong.body);
      assert.deepEqual(wrong.body, {
        code: "invalid-credentials",
        message: "E-mail address or password is wrong.",
      });
    });

    it("IDN-E-1 answers an invalid login body with 400 validation-failed", async () => {
      const reply = await running.post("/login", { email: "x", password: "" });
      assert.equal(reply.status, 400);
      assert.equal(reply.body?.code, "validation-failed");
    });
  },
);
