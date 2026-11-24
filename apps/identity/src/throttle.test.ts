// IDN-T-24 (M4, IDN-F-35): the request counter, against the real Redis of the test stack.
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { Redis } from "ioredis";
import { redisUrl, skipRedis } from "./test-support/database.ts";
import { randomIp } from "./test-support/harness.ts";
import { createThrottle } from "./throttle.ts";

const loginDefaults = {
  LOGIN_MAX_FAILURES: 5,
  LOGIN_FAILURE_WINDOW_SECONDS: 60,
  LOGIN_LOCK_MINUTES: 15,
};

describe(
  "IDN-T-24 IDN-AC-1.9 IDN-F-35 request throttle",
  { skip: skipRedis },
  () => {
    let redis: Redis;
    before(() => {
      redis = new Redis(redisUrl ?? "");
    });
    after(() => {
      redis?.disconnect();
    });

    it("IDN-T-24 IDN-F-35 accepts 5 requests of one address within 60 s and refuses the 6th with the remaining seconds", async () => {
      const throttle = createThrottle(redis, {
        REQUEST_LIMIT_PER_MINUTE: 5,
        CONFIRMATION_LINK_TTL_HOURS: 24,
        ...loginDefaults,
      });
      const ip = randomIp();
      for (let i = 0; i < 5; i++) {
        assert.deepEqual(await throttle.countRequest(ip), { ok: true });
      }
      const sixth = await throttle.countRequest(ip);
      assert.equal(sixth.ok, false);
      if (sixth.ok) return;
      assert.ok(sixth.retryAfterSeconds >= 1 && sixth.retryAfterSeconds <= 60);
      assert.equal((await throttle.countRequest(ip)).ok, false);
    });

    it("IDN-T-24 IDN-NF-3 keeps the counter in the key req:ip:<ip> and lets it expire within 60 seconds", async () => {
      const throttle = createThrottle(redis, {
        REQUEST_LIMIT_PER_MINUTE: 2,
        CONFIRMATION_LINK_TTL_HOURS: 24,
        ...loginDefaults,
      });
      const ip = randomIp();
      await throttle.countRequest(ip);
      const ttl = await redis.ttl(`req:ip:${ip}`);
      assert.ok(ttl > 0 && ttl <= 60, `${ttl}`);
    });

    it("IDN-T-24 IDN-F-35 follows REQUEST_LIMIT_PER_MINUTE", async () => {
      const throttle = createThrottle(redis, {
        REQUEST_LIMIT_PER_MINUTE: 1,
        CONFIRMATION_LINK_TTL_HOURS: 24,
        ...loginDefaults,
      });
      const ip = randomIp();
      assert.equal((await throttle.countRequest(ip)).ok, true);
      assert.equal((await throttle.countRequest(ip)).ok, false);
    });
  },
);

// IDN-T-23 (M4, IDN-F-9): the failure counters and locks of the login, with a fixed clock. The
// attempt is counted before the password is checked (Q353), so parallel attempts beyond
// LOGIN_MAX_FAILURES are refused without a hash run.
describe(
  "IDN-T-23 IDN-AC-2.3 IDN-F-9 failure counters and locks",
  { skip: skipRedis },
  () => {
    let redis: Redis;
    before(() => {
      redis = new Redis(redisUrl ?? "");
    });
    after(() => {
      redis?.disconnect();
    });

    const config = {
      REQUEST_LIMIT_PER_MINUTE: 5,
      CONFIRMATION_LINK_TTL_HOURS: 24,
      LOGIN_MAX_FAILURES: 5,
      LOGIN_FAILURE_WINDOW_SECONDS: 60,
      LOGIN_LOCK_MINUTES: 15,
    };
    const at = (time: string) => new Date(`2026-11-03T${time}Z`);
    const email = () => `ada-${randomIp()}@example.org`;

    async function attempt(
      throttle: ReturnType<typeof createThrottle>,
      ip: string,
      address: string,
      time: string,
      success: boolean,
    ) {
      const reserved = await throttle.reserveLogin(ip, address, at(time));
      if (!reserved.ok) return reserved;
      await throttle.settleLogin(reserved, success, at(time));
      return reserved;
    }

    it("IDN-T-23 IDN-AC-2.3 IDN-F-9 follows §10 example 3: 5 failures lock IP and address until 10:15:30, the reset request stays possible", async () => {
      const throttle = createThrottle(redis, config);
      const ip = randomIp();
      const other = randomIp();
      const address = email();
      for (const time of ["10:00:00", "10:00:05", "10:00:10", "10:00:20"]) {
        assert.equal(
          (await attempt(throttle, ip, address, time, false)).ok,
          true,
        );
      }
      assert.equal(
        (await attempt(throttle, ip, address, "10:00:30", false)).ok,
        true,
      );
      assert.deepEqual(
        await throttle.reserveLogin(ip, address, at("10:00:40")),
        {
          ok: false,
          retryAfterSeconds: 890,
        },
      );
      assert.deepEqual(
        await throttle.reserveLogin(other, address, at("10:01:00")),
        {
          ok: false,
          retryAfterSeconds: 870,
        },
      );
      // A lock of the address does not touch the request throttle of the reset request.
      assert.deepEqual(await throttle.countRequest(other), { ok: true });
      assert.equal(
        (await attempt(throttle, ip, address, "10:15:31", true)).ok,
        true,
      );
    });

    it("IDN-T-23 IDN-F-9 locks the IP address for every address and the address from every IP address", async () => {
      const throttle = createThrottle(redis, config);
      const ip = randomIp();
      for (let i = 0; i < 5; i++) {
        await attempt(throttle, ip, email(), "10:00:00", false);
      }
      const byIp = await throttle.reserveLogin(ip, email(), at("10:00:01"));
      assert.equal(byIp.ok, false);
      const address = email();
      for (let i = 0; i < 5; i++) {
        await attempt(throttle, randomIp(), address, "10:00:00", false);
      }
      assert.equal(
        (await throttle.reserveLogin(randomIp(), address, at("10:00:01"))).ok,
        false,
      );
    });

    it("IDN-T-23 IDN-F-9 resets the counter of the address after a successful login", async () => {
      const throttle = createThrottle(redis, config);
      const address = email();
      for (let i = 0; i < 4; i++) {
        await attempt(throttle, randomIp(), address, "10:00:00", false);
      }
      await attempt(throttle, randomIp(), address, "10:00:01", true);
      for (let i = 0; i < 4; i++) {
        await attempt(throttle, randomIp(), address, "10:00:02", false);
      }
      assert.equal(
        (await throttle.reserveLogin(randomIp(), address, at("10:00:03"))).ok,
        true,
      );
    });

    it("IDN-F-9 Q353 refuses attempts beyond LOGIN_MAX_FAILURES that run in parallel before any of them is settled", async () => {
      const throttle = createThrottle(redis, config);
      const ip = randomIp();
      const address = email();
      const results = await Promise.all(
        Array.from({ length: 12 }, () =>
          throttle.reserveLogin(ip, address, at("10:00:00")),
        ),
      );
      assert.equal(results.filter((result) => result.ok).length, 5);
      for (const result of results) {
        if (!result.ok)
          assert.ok(
            result.retryAfterSeconds >= 1 && result.retryAfterSeconds <= 60,
          );
      }
    });

    it("IDN-T-23 IDN-NF-3 lets counters expire with their window and locks with the lock", async () => {
      const throttle = createThrottle(redis, config);
      const ip = randomIp();
      const address = email();
      await attempt(throttle, ip, address, "10:00:00", false);
      const windowTtl = await redis.ttl(`fail:ip:${ip}`);
      assert.ok(windowTtl > 0 && windowTtl <= 60, `${windowTtl}`);
      assert.ok((await redis.ttl(`fail:email:${address}`)) > 0);
      for (let i = 0; i < 4; i++)
        await attempt(throttle, ip, address, "10:00:00", false);
      const lockTtl = await redis.ttl(`lock:ip:${ip}`);
      assert.ok(lockTtl > 840 && lockTtl <= 900, `${lockTtl}`);
      assert.ok((await redis.ttl(`lock:email:${address}`)) > 840);
    });
  },
);
