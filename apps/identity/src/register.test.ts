// Acceptance tests of IDN-US-1 slice 1 over HTTP (gam-ai-knowledge/concepts/identity.md §17):
// IDN-T-1, IDN-T-2, IDN-T-3, IDN-T-5, IDN-T-6, IDN-T-7, IDN-T-9. They need TEST_DATABASE_URL and
// TEST_REDIS_URL and are skipped without them.
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { registrationInputSchema } from "@stash/contracts";
import type { Mailer } from "./mailer.ts";
import { skip } from "./test-support/database.ts";
import {
  address,
  botCheckStub,
  confirmationToken,
  password,
  type Running,
  randomIp,
  registration,
  type Stack,
  startIdentity,
  startStack,
} from "./test-support/harness.ts";

const accepted = { status: "check-mailbox" };

describe("IDN-US-1 register by e-mail", { skip }, () => {
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

  const count = async (table: string) =>
    Number(
      (
        await stack.database.query<{ n: string }>(
          `SELECT count(*) AS n FROM ${table}`,
        )
      )[0]?.n,
    );

  describe("IDN-T-1 IDN-AC-1.1 IDN-F-1 IDN-E-1 same rules on both sides", () => {
    const invalid: [string, Record<string, unknown>][] = [
      ["an empty name", { name: "   " }],
      ["a name of 101 characters", { name: "a".repeat(101) }],
      ["the address ada@example", { email: "ada@example" }],
    ];
    for (const [title, change] of invalid) {
      it(`IDN-T-1 IDN-AC-1.1 refuses ${title} in M3 and with 400 validation-failed, storing nothing`, async () => {
        const body = registration(address(), change);
        assert.equal(registrationInputSchema.safeParse(body).success, false);
        const before = await count("auth_users");
        const mails = stack.smtp.mails.length;
        const reply = await running.post("/register", body);
        assert.equal(reply.status, 400);
        assert.deepEqual(reply.body, {
          code: "validation-failed",
          message: "The request body is not valid.",
        });
        assert.equal(await count("auth_users"), before);
        assert.equal(stack.smtp.mails.length, mails);
      });
    }

    it("IDN-T-1 IDN-AC-1.1 refuses a body that is not JSON and one that is not an object", async () => {
      for (const body of ["{not json", "[]", "null"]) {
        const response = await running.identity.app.request("/register", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-forwarded-for": randomIp(),
          },
          body,
        });
        assert.equal(response.status, 400, body);
        assert.equal(
          ((await response.json()) as { code: string }).code,
          "validation-failed",
        );
      }
    });
  });

  describe("IDN-T-2 IDN-AC-1.2 IDN-F-2 password rules", () => {
    const refused = [
      "kurz123",
      "password1234",
      "Password1234",
      "a".repeat(129),
    ];
    const allowed = [
      "meinkatzenbaum",
      "Katzenbaum42x",
      "dreiblauewolkenziehen",
      "Drei-blaue-Wolken-7",
    ];
    for (const value of refused) {
      it(`IDN-T-2 IDN-AC-1.2 answers 400 for the password of ${value.length} characters starting ${value.slice(0, 6)}`, async () => {
        const reply = await running.post(
          "/register",
          registration(address(), { password: value }),
        );
        assert.equal(reply.status, 400);
        assert.equal(reply.body?.code, "validation-failed");
      });
    }
    for (const value of allowed) {
      it(`IDN-T-2 IDN-AC-1.2 answers 202 for the password ${value}`, async () => {
        const reply = await running.post(
          "/register",
          registration(address(), { password: value }),
        );
        assert.equal(reply.status, 202);
        assert.deepEqual(reply.body, accepted);
      });
    }
  });

  describe("IDN-T-3 IDN-AC-1.3 IDN-F-3 IDN-NF-1 IDN-NF-4 only a hash is stored", () => {
    it("IDN-T-3 IDN-AC-1.3 stores an Argon2id hash with the parameters of STACK.md, never the password, and logs neither password nor token", async () => {
      const email = address();
      const reply = await running.post("/register", registration(email));
      assert.equal(reply.status, 202);
      const token = confirmationToken(stack.smtp.to(email)[0]?.text ?? "");

      const rows = await stack.database.query<{
        password: string;
        provider_id: string;
      }>(
        `SELECT a.password, a.provider_id FROM auth_accounts a
         JOIN auth_users u ON u.id = a.user_id WHERE u.email = $1`,
        [email],
      );
      assert.equal(rows.length, 1);
      assert.equal(rows[0]?.provider_id, "credential");
      assert.match(
        rows[0]?.password ?? "",
        /^\$argon2id\$v=19\$m=19456,t=2,p=1\$/,
      );

      const everything = JSON.stringify([
        await stack.database.query("SELECT * FROM auth_users"),
        await stack.database.query("SELECT * FROM auth_accounts"),
        await stack.database.query("SELECT * FROM auth_verifications"),
      ]);
      assert.equal(everything.includes(password), false);
      assert.equal(JSON.stringify(reply.body).includes(password), false);
      const log = running.logs.join("\n");
      assert.equal(log.includes(password), false);
      assert.equal(log.includes(token), false);
      assert.equal(log.includes(rows[0]?.password ?? "x"), false);
    });

    it("IDN-NF-1 IDN-F-32 keeps only name, address, confirmation state, and time stamps, and one users row", async () => {
      const email = address();
      await running.post("/register", registration(email, { name: "Grace" }));
      const users = await stack.database.query<Record<string, unknown>>(
        "SELECT * FROM auth_users WHERE email = $1",
        [email],
      );
      assert.deepEqual(Object.keys(users[0] ?? {}).sort(), [
        "created_at",
        "email",
        "email_verified",
        "id",
        "image",
        "name",
        "updated_at",
      ]);
      assert.equal(users[0]?.name, "Grace");
      assert.equal(users[0]?.email_verified, false);
      assert.equal(users[0]?.image, null);
      const own = await stack.database.query(
        "SELECT 1 FROM users WHERE auth_user_id = $1",
        [users[0]?.id],
      );
      assert.equal(own.length, 1);
    });
  });

  describe("IDN-T-6 IDN-AC-1.6 IDN-F-6 no account disclosure", () => {
    it("IDN-T-6 IDN-AC-1.6 answers 202 check-mailbox for a new, an unconfirmed, and a confirmed address, with the e-mails of example 2", async () => {
      const ada = address("ada");
      const bob = address("bob");

      // bob has a confirmed account.
      assert.equal(
        (await running.post("/register", registration(bob))).status,
        202,
      );
      const bobLink = confirmationToken(stack.smtp.to(bob)[0]?.text ?? "");
      assert.equal(
        (await running.get(`/confirm?token=${bobLink}`)).status,
        303,
      );
      const bobBefore = await stack.database.query(
        "SELECT * FROM auth_accounts a JOIN auth_users u ON u.id = a.user_id WHERE u.email = $1",
        [bob],
      );

      // ada is new.
      const first = await running.post(
        "/register",
        registration(ada, { name: "Ada" }),
      );
      assert.equal(first.status, 202);
      assert.deepEqual(first.body, accepted);
      assert.equal(stack.smtp.to(ada).length, 1);
      assert.match(
        stack.smtp.to(ada)[0]?.subject ?? "",
        /Bestätige deine E-Mail-Adresse für stash/,
      );
      const oldLink = confirmationToken(stack.smtp.to(ada)[0]?.text ?? "");
      const firstHash = (
        await stack.database.query<{ password: string }>(
          "SELECT a.password FROM auth_accounts a JOIN auth_users u ON u.id = a.user_id WHERE u.email = $1",
          [ada],
        )
      )[0]?.password;

      // ada registers again while unconfirmed: name and hash replaced, new link, old one invalid.
      const second = await running.post(
        "/register",
        registration(ada, { name: "Ada Lovelace" }),
      );
      assert.equal(second.status, 202);
      assert.deepEqual(second.body, accepted);
      assert.equal(stack.smtp.to(ada).length, 2);
      const row = (
        await stack.database.query<{
          name: string;
          password: string;
          n: string;
        }>(
          `SELECT u.name, a.password,
             (SELECT count(*) FROM auth_users WHERE email = $1) AS n
           FROM auth_accounts a JOIN auth_users u ON u.id = a.user_id WHERE u.email = $1`,
          [ada],
        )
      )[0];
      assert.equal(row?.n, "1");
      assert.equal(row?.name, "Ada Lovelace");
      assert.notEqual(row?.password, firstHash);
      const stale = await running.get(`/confirm?token=${oldLink}`);
      assert.equal(stale.headers.get("location"), "/link-invalid?kind=confirm");
      const newLink = confirmationToken(stack.smtp.to(ada)[1]?.text ?? "");
      assert.equal(
        (await running.get(`/confirm?token=${newLink}`)).headers.get(
          "location",
        ),
        "/login?confirmed=1",
      );

      // bob registers again: same answer, nothing changed, a notice without a link.
      const third = await running.post(
        "/register",
        registration(bob, { name: "Mallory" }),
      );
      assert.equal(third.status, 202);
      assert.deepEqual(third.body, accepted);
      const bobAfter = await stack.database.query(
        "SELECT * FROM auth_accounts a JOIN auth_users u ON u.id = a.user_id WHERE u.email = $1",
        [bob],
      );
      assert.deepEqual(bobAfter, bobBefore);
      const notice = stack.smtp.to(bob)[1];
      assert.match(
        notice?.subject ?? "",
        /Jemand wollte sich mit deiner Adresse registrieren/,
      );
      assert.doesNotMatch(notice?.text ?? "", /https?:\/\//);
      assert.equal(stack.smtp.to(bob).length, 2);
    });

    it("IDN-T-6 IDN-AC-1.6 answers an address that differs only in case like the same address", async () => {
      const email = address("case");
      await running.post("/register", registration(email));
      const again = await running.post(
        "/register",
        registration(email.toUpperCase()),
      );
      assert.equal(again.status, 202);
      assert.equal(
        Number(
          (
            await stack.database.query<{ n: string }>(
              "SELECT count(*) AS n FROM auth_users WHERE email = $1",
              [email],
            )
          )[0]?.n,
        ),
        1,
      );
    });
  });

  describe("IDN-F-38 IDN-T-26 language of the e-mail over HTTP", () => {
    it("IDN-F-38 sends the confirmation in English for Accept-Language en-GB,de;q=0.5 and in German for fr", async () => {
      const english = address("en");
      const german = address("fr");
      const en = await running.post("/register", registration(english), {
        language: "en-GB,de;q=0.5",
      });
      const fr = await running.post("/register", registration(german), {
        language: "fr",
      });
      assert.equal(en.status, 202);
      assert.equal(fr.status, 202);
      assert.equal(
        stack.smtp.to(english)[0]?.subject,
        "Confirm your e-mail address for stash",
      );
      assert.equal(
        stack.smtp.to(german)[0]?.subject,
        "Bestätige deine E-Mail-Adresse für stash",
      );
    });
  });

  describe("IDN-F-6 IDN-E-11 the answer does not wait for the e-mail and does not tell the state of the address", () => {
    it("IDN-F-6 IDN-E-11 answers 202 while the SMTP host has not taken the e-mail yet, and sends it afterwards", async () => {
      let release: () => void = () => {};
      const gate = new Promise<void>((resolve) => {
        release = resolve;
      });
      const handed: string[] = [];
      const slow: Mailer = {
        async sendConfirmation({ to }) {
          await gate;
          handed.push(to);
          return true;
        },
        async sendNotice({ to }) {
          await gate;
          handed.push(to);
          return true;
        },
        async sendReset({ to }) {
          await gate;
          handed.push(to);
          return true;
        },
      };
      const email = address("slow");
      const instance = await startIdentity(stack, { mailer: slow });
      try {
        const answered = await Promise.race([
          instance.post("/register", registration(email)),
          new Promise<"waited">((resolve) =>
            setTimeout(() => resolve("waited"), 3000),
          ),
        ]);
        assert.notEqual(answered, "waited", "the answer waited for the e-mail");
        assert.equal((answered as { status: number }).status, 202);
        assert.deepEqual(handed, []);
      } finally {
        release();
      }
      for (let tries = 0; handed.length === 0 && tries < 100; tries += 1) {
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
      assert.deepEqual(handed, [email]);
      await instance.close();
    });

    it("IDN-F-6 answers a new, an unconfirmed, and a confirmed address in comparable time (median difference below 50 ms)", async () => {
      const median = (values: number[]) =>
        [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)] ?? 0;
      const confirmed = address("known");
      await running.post("/register", registration(confirmed));
      await running.get(
        `/confirm?token=${confirmationToken(stack.smtp.to(confirmed)[0]?.text ?? "")}`,
      );
      const pending = address("pending");
      await running.post("/register", registration(pending));

      const times = {
        fresh: [] as number[],
        pending: [] as number[],
        known: [] as number[],
      };
      for (let round = 0; round < 15; round += 1) {
        times.fresh.push(
          (await running.post("/register", registration(address("fresh"))))
            .elapsedMs,
        );
        times.pending.push(
          (await running.post("/register", registration(pending))).elapsedMs,
        );
        times.known.push(
          (await running.post("/register", registration(confirmed))).elapsedMs,
        );
      }
      const [fresh, unconfirmed, known] = [
        median(times.fresh),
        median(times.pending),
        median(times.known),
      ];
      for (const [name, a, b] of [
        ["new and unconfirmed", fresh, unconfirmed],
        ["new and confirmed", fresh, known],
        ["unconfirmed and confirmed", unconfirmed, known],
      ] as const) {
        assert.ok(
          Math.abs(a - b) < 50,
          `${name}: ${a.toFixed(1)} ms against ${b.toFixed(1)} ms`,
        );
      }
    });
  });

  describe("IDN-E-1 SCF-F-21 body size limit", () => {
    it("IDN-E-1 answers 400 validation-failed for a registration body above 16 KiB and still accepts one below it", async () => {
      const big = await running.post(
        "/register",
        registration(address(), { padding: "x".repeat(17 * 1024) }),
      );
      assert.equal(big.status, 400);
      assert.deepEqual(big.body, {
        code: "validation-failed",
        message: "The request body is not valid.",
      });
      const small = await running.post(
        "/register",
        registration(address(), { padding: "x".repeat(8 * 1024) }),
      );
      assert.equal(small.status, 202);
    });

    it("IDN-E-1 answers 400 validation-failed for a login body above 16 KiB and stores nothing for an oversized registration", async () => {
      const login = await running.post("/login", {
        email: address(),
        password,
        padding: "x".repeat(17 * 1024),
      });
      assert.equal(login.status, 400);
      assert.equal(login.body?.code, "validation-failed");
      const email = address("oversize");
      await running.post(
        "/register",
        registration(email, { padding: "x".repeat(17 * 1024) }),
      );
      assert.equal(
        (
          await stack.database.query(
            "SELECT 1 FROM auth_users WHERE email = $1",
            [email],
          )
        ).length,
        0,
      );
    });
  });

  describe("IDN-T-9 IDN-AC-1.9 IDN-F-35 IDN-E-3 registration throttled", () => {
    it("IDN-T-9 IDN-AC-1.9 refuses the 6th registration of one address within a minute with 429 too-many-requests and Retry-After", async () => {
      const ip = randomIp();
      const answers = [];
      for (let i = 0; i < 6; i++) {
        answers.push(
          await running.post("/register", registration(address()), { ip }),
        );
      }
      assert.deepEqual(
        answers.map((reply) => reply.status),
        [202, 202, 202, 202, 202, 429],
      );
      assert.deepEqual(answers[5]?.body, {
        code: "too-many-requests",
        message: "Too many requests. Try again later.",
      });
      const retry = Number(answers[5]?.headers.get("retry-after"));
      assert.ok(
        Number.isInteger(retry) && retry >= 1 && retry <= 60,
        `${retry}`,
      );
    });

    it("IDN-T-9 IDN-AC-1.9 counts every address on its own", async () => {
      const busy = randomIp();
      for (let i = 0; i < 6; i++) {
        await running.post("/register", registration(address()), { ip: busy });
      }
      const other = await running.post("/register", registration(address()), {
        ip: randomIp(),
      });
      assert.equal(other.status, 202);
    });

    it("IDN-T-9 IDN-AC-1.9 counts invalid registrations too", async () => {
      const ip = randomIp();
      for (let i = 0; i < 5; i++) {
        await running.post("/register", { nonsense: true }, { ip });
      }
      const reply = await running.post("/register", registration(address()), {
        ip,
      });
      assert.equal(reply.status, 429);
    });
  });
});

describe(
  "IDN-T-5 IDN-AC-1.5 IDN-F-5 IDN-E-2 bot check on and off",
  { skip },
  () => {
    let stack: Stack;
    before(async () => {
      stack = await startStack();
    });
    after(async () => {
      await stack?.stop();
    });

    const captcha = {
      CAPTCHA_ENABLED: "true",
      CAPTCHA_SITE_KEY: "site",
      CAPTCHA_SECRET_KEY: "secret",
    };

    it("IDN-T-5 IDN-AC-1.5 refuses with bot-check-failed while the stub answers no, accepts when it answers yes, and asks nothing while switched off", async () => {
      const no = botCheckStub(false);
      const refusing = await startIdentity(stack, {
        env: captcha,
        botCheck: no,
      });
      const email = address();
      const refused = await refusing.post(
        "/register",
        registration(email, { botToken: "t" }),
      );
      assert.equal(refused.status, 400);
      assert.deepEqual(refused.body, {
        code: "bot-check-failed",
        message: "The bot check failed.",
      });
      assert.equal(no.calls, 1);
      const stored = await stack.database.query(
        "SELECT 1 FROM auth_users WHERE email = $1",
        [email],
      );
      assert.equal(stored.length, 0);
      await refusing.close();

      const yes = botCheckStub(true);
      const accepting = await startIdentity(stack, {
        env: captcha,
        botCheck: yes,
      });
      const ok = await accepting.post(
        "/register",
        registration(email, { botToken: "t" }),
      );
      assert.equal(ok.status, 202);
      assert.equal(yes.calls, 1);
      await accepting.close();

      const never = botCheckStub(false);
      const off = await startIdentity(stack, {
        env: { CAPTCHA_ENABLED: "false" },
        botCheck: never,
      });
      const free = await off.post("/register", registration(address()));
      assert.equal(free.status, 202);
      assert.equal(never.calls, 0);
      await off.close();
    });

    it("IDN-T-5 IDN-AC-1.5 IDN-E-2 refuses a missing token without asking the provider", async () => {
      const stub = botCheckStub(true);
      const running = await startIdentity(stack, {
        env: captcha,
        botCheck: stub,
      });
      const reply = await running.post("/register", registration(address()));
      assert.equal(reply.status, 400);
      assert.equal(reply.body?.code, "bot-check-failed");
      assert.equal(stub.calls, 0);
      await running.close();
    });

    it("IDN-T-5 IDN-AC-1.5 IDN-F-5 checks the bot token before the input and before anything is stored", async () => {
      const stub = botCheckStub(false);
      const running = await startIdentity(stack, {
        env: captcha,
        botCheck: stub,
      });
      const reply = await running.post(
        "/register",
        registration(address(), { name: "", botToken: "t" }),
      );
      assert.equal(reply.body?.code, "bot-check-failed");
      await running.close();
    });
  },
);

describe(
  "IDN-T-7 IDN-AC-1.7 IDN-F-30 IDN-E-8 registration closed",
  { skip },
  () => {
    let stack: Stack;
    before(async () => {
      stack = await startStack();
    });
    after(async () => {
      await stack?.stop();
    });

    it("IDN-T-7 IDN-AC-1.7 refuses a registration with 403 registration-closed while a confirmed account still logs in", async () => {
      const email = address();
      const open = await startIdentity(stack);
      await open.post("/register", registration(email));
      const link = confirmationToken(stack.smtp.to(email)[0]?.text ?? "");
      await open.get(`/confirm?token=${link}`);
      await open.close();

      const closed = await startIdentity(stack, {
        env: { REGISTRATION_ENABLED: "false" },
      });
      const refused = await closed.post("/register", registration(address()));
      assert.equal(refused.status, 403);
      assert.deepEqual(refused.body, {
        code: "registration-closed",
        message: "Registration is closed.",
      });
      const login = await closed.post("/login", { email, password });
      assert.equal(login.status, 200);
      await closed.close();
    });

    it("IDN-T-7 IDN-AC-1.7 refuses even an invalid body with registration-closed and stores nothing", async () => {
      const closed = await startIdentity(stack, {
        env: { REGISTRATION_ENABLED: "false" },
      });
      const email = address();
      const refused = await closed.post(
        "/register",
        registration(email, { name: "", password: "x" }),
      );
      assert.equal(refused.status, 403);
      assert.equal(refused.body?.code, "registration-closed");
      const stored = await stack.database.query(
        "SELECT 1 FROM auth_users WHERE email = $1",
        [email],
      );
      assert.equal(stored.length, 0);
      await closed.close();
    });
  },
);
