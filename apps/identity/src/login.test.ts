// IDN-US-2 slice 1 over HTTP (concept §17): password login, logout, session check, locks, generic
// error, and session lifetime, against the test database, the test Redis, and a clock the test
// sets. The login page and the route guard (IDN-AC-2.4) are slice 2 in `web`.
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { skip } from "./test-support/database.ts";
import {
  address,
  confirmedAccount,
  password,
  type Running,
  randomIp,
  type Stack,
  sessionToken,
  startIdentity,
  startStack,
} from "./test-support/harness.ts";

const wrong = "Not-the-right-one-1";

describe("IDN-US-2 log in and log out", { skip }, () => {
  let stack: Stack;
  let running: Running;
  let now = new Date("2026-11-03T10:00:00Z");
  const at = (time: string) => {
    now = new Date(`2026-11-03T${time}Z`);
  };
  // The authentication library checks the expiry of a confirmation link against the real time,
  // so accounts are confirmed at the real time; the logins then run at the times of §10.
  const confirmed = async (email: string) => {
    const kept = now;
    now = new Date();
    try {
      await confirmedAccount(stack, running, email);
    } finally {
      now = kept;
    }
  };

  before(async () => {
    stack = await startStack();
    running = await startIdentity(stack, { clock: () => now });
  });
  after(async () => {
    await running?.close();
    await stack?.stop();
  });

  it("IDN-T-10 IDN-AC-2.1 IDN-F-7 IDN-F-36 logs a confirmed account in with a session cookie that scripts cannot read", async () => {
    const email = address();
    await confirmed(email);
    const reply = await running.post("/login", { email, password });
    assert.equal(reply.status, 200);
    assert.equal(reply.body?.email, email);
    assert.equal(reply.body?.name, "Ada");
    assert.match(String(reply.body?.userId), /^[0-9a-f-]{36}$/);
    const cookie = reply.headers.get("set-cookie") ?? "";
    assert.match(cookie, /^stash_session=[\w-]{20,};/);
    assert.match(cookie, /HttpOnly/i);
    assert.match(cookie, /SameSite=Lax/i);
    assert.match(cookie, /Path=\//);
    assert.match(cookie, /Max-Age=604800/);
  });

  it("IDN-T-11 IDN-AC-2.2 IDN-F-8 IDN-F-37 IDN-E-9 ends the session on the server at once: 200, 204, then 401 no-session", async () => {
    const email = address();
    await confirmed(email);
    const login = await running.post("/login", { email, password });
    const cookie = `stash_session=${sessionToken(login)}`;

    const before = await running.get("/session", { cookie });
    assert.equal(before.status, 200);
    assert.deepEqual(before.body, login.body);

    const logout = await running.post("/logout", undefined, { cookie });
    assert.equal(logout.status, 204);
    const cleared = logout.headers.get("set-cookie") ?? "";
    assert.match(cleared, /stash_session=;.*Max-Age=0/);
    assert.match(cleared, /HttpOnly/i);
    assert.match(cleared, /SameSite=Lax/i);

    const afterLogout = await running.get("/session", { cookie });
    assert.equal(afterLogout.status, 401);
    assert.deepEqual(afterLogout.body, {
      code: "no-session",
      message: "No valid session.",
    });
  });

  it("IDN-F-8 answers a logout without a valid session with 204 as well", async () => {
    assert.equal((await running.post("/logout", undefined)).status, 204);
    const unknown = await running.post("/logout", undefined, {
      cookie: "stash_session=unknown",
    });
    assert.equal(unknown.status, 204);
  });

  it("IDN-E-9 answers a session check without a cookie with 401 no-session", async () => {
    const reply = await running.get("/session");
    assert.equal(reply.status, 401);
    assert.equal(reply.body?.code, "no-session");
  });

  it("IDN-T-12 IDN-AC-2.3 IDN-F-9 IDN-E-6 follows §10 example 3: IP and address locked until 10:15:30, then the right password works", async () => {
    const email = address();
    await confirmed(email);
    const ip = randomIp();
    const other = randomIp();
    for (const time of ["10:00:00", "10:00:05", "10:00:10", "10:00:20"]) {
      at(time);
      const reply = await running.post(
        "/login",
        { email, password: wrong },
        { ip },
      );
      assert.equal(reply.status, 401, time);
    }
    at("10:00:30");
    assert.equal(
      (await running.post("/login", { email, password: wrong }, { ip })).status,
      401,
    );

    at("10:00:40");
    const locked = await running.post("/login", { email, password }, { ip });
    assert.equal(locked.status, 429);
    assert.equal(locked.headers.get("retry-after"), "890");
    assert.equal(locked.body?.code, "too-many-requests");

    at("10:01:00");
    const elsewhere = await running.post(
      "/login",
      { email, password },
      { ip: other },
    );
    assert.equal(elsewhere.status, 429);
    // The reset request of IDN-US-6 (#50) is counted only by the request throttle, which the
    // lock does not touch; tested at M4 in IDN-T-23.

    at("10:15:31");
    assert.equal(
      (await running.post("/login", { email, password }, { ip })).status,
      200,
    );
  });

  it("IDN-E-6 IDN-F-9 does not check the password of a locked login", async () => {
    const email = address();
    at("11:00:00");
    await confirmed(email);
    for (let i = 0; i < 5; i++) {
      await running.post("/login", { email, password: wrong });
    }
    // Locked, so even a body that would need a long hash run is answered without one.
    const timings: number[] = [];
    for (let i = 0; i < 5; i++) {
      const reply = await running.post("/login", { email, password });
      assert.equal(reply.status, 429);
      timings.push(reply.elapsedMs);
    }
    const unlocked = await running.post("/login", {
      email: address("nobody"),
      password,
    });
    timings.sort((a, b) => a - b);
    assert.ok(
      (timings[2] ?? 0) < unlocked.elapsedMs,
      `locked ${timings[2]} ms, checked ${unlocked.elapsedMs} ms`,
    );
  });

  it("IDN-F-9 Q352 counts a peer other than the reverse proxy by its own address, whatever X-Forwarded-For it sends", async () => {
    at("12:00:00");
    const peer = "172.18.0.9";
    for (let i = 0; i < 5; i++) {
      await running.post(
        "/login",
        { email: address("nobody"), password: wrong },
        { peer, ip: randomIp() },
      );
    }
    const reply = await running.post(
      "/login",
      { email: address("nobody"), password: wrong },
      { peer, ip: randomIp() },
    );
    assert.equal(reply.status, 429);
  });

  it("IDN-T-14 IDN-AC-2.5 IDN-F-11 IDN-E-4 gives an unknown address and a wrong password the same 401 body", async () => {
    at("13:00:00");
    const email = address();
    await confirmed(email);
    const unknown = await running.post("/login", {
      email: address("nobody"),
      password,
    });
    const wrongPassword = await running.post("/login", {
      email,
      password: wrong,
    });
    assert.equal(unknown.status, 401);
    assert.equal(wrongPassword.status, 401);
    assert.deepEqual(unknown.body, wrongPassword.body);
    assert.deepEqual(unknown.body, {
      code: "invalid-credentials",
      message: "E-mail address or password is wrong.",
    });
    assert.equal(unknown.headers.get("set-cookie"), null);
  });

  it("IDN-T-15 IDN-AC-2.6 IDN-F-34 IDN-F-36 follows §10 example 4 over HTTP and renews the cookie with the session", async () => {
    const email = address();
    now = new Date("2026-11-03T10:00:00Z");
    await confirmed(email);
    const login = await running.post("/login", { email, password });
    const cookie = `stash_session=${sessionToken(login)}`;

    now = new Date("2026-11-03T18:00:00Z");
    const sameDay = await running.get("/session", { cookie });
    assert.equal(sameDay.status, 200);
    assert.equal(sameDay.headers.get("set-cookie"), null);

    now = new Date("2026-11-05T09:00:00Z");
    const renewed = await running.get("/session", { cookie });
    assert.equal(renewed.status, 200);
    assert.match(renewed.headers.get("set-cookie") ?? "", /Max-Age=604800/);
    assert.equal(sessionToken(renewed), sessionToken(login));

    now = new Date("2026-11-12T09:01:00Z");
    assert.equal((await running.get("/session", { cookie })).status, 401);
  });

  it("IDN-F-7 answers the methods of /logout and /session with 405 for the wrong method", async () => {
    assert.equal((await running.get("/logout")).status, 405);
    assert.equal((await running.post("/session", undefined)).status, 405);
  });
});

describe("IDN-T-28 IDN-F-11 answer time of a failed login", { skip }, () => {
  let stack: Stack;
  let running: Running;
  before(async () => {
    stack = await startStack();
    running = await startIdentity(stack, { env: { LOGIN_MAX_FAILURES: "20" } });
  });
  after(async () => {
    await running?.close();
    await stack?.stop();
  });

  it("IDN-T-28 IDN-F-11 answers 50 unknown addresses and 50 wrong passwords with medians less than 50 ms apart", async () => {
    const accounts = [address(), address(), address()];
    for (const email of accounts) await confirmedAccount(stack, running, email);
    const median = (values: number[]) => {
      const sorted = [...values].sort((a, b) => a - b);
      return sorted[Math.floor(sorted.length / 2)] ?? 0;
    };
    const unknown: number[] = [];
    const wrongPassword: number[] = [];
    for (let i = 0; i < 50; i++) {
      const a = await running.post("/login", {
        email: address("nobody"),
        password: wrong,
      });
      const b = await running.post("/login", {
        email: accounts[i % accounts.length],
        password: wrong,
      });
      assert.equal(a.status, 401);
      assert.equal(b.status, 401);
      unknown.push(a.elapsedMs);
      wrongPassword.push(b.elapsedMs);
    }
    const difference = Math.abs(median(unknown) - median(wrongPassword));
    assert.ok(difference < 50, `${difference} ms`);
  });
});

describe("IDN-E-10 session store unreachable", { skip }, () => {
  let stack: Stack;
  let running: Running;
  before(async () => {
    stack = await startStack();
    // A port where no session store answers.
    running = await startIdentity(stack, {
      env: { REDIS_URL: "redis://127.0.0.1:1" },
    });
  });
  after(async () => {
    await running?.close();
    await stack?.stop();
  });

  it("IDN-E-10 answers login, logout, and session check with 500 internal-error", async () => {
    const login = await running.post("/login", { email: address(), password });
    const logout = await running.post("/logout", undefined, {
      cookie: "stash_session=abc",
    });
    const session = await running.get("/session", {
      cookie: "stash_session=abc",
    });
    for (const reply of [login, logout, session]) {
      assert.equal(reply.status, 500);
      assert.equal(reply.body?.code, "internal-error");
    }
  });
});
