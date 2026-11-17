// IDN-T-24 (M4, IDN-F-35): the request counter, against the real Redis of the test stack.
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { Redis } from "ioredis";
import { redisUrl, skipRedis } from "./test-support/database.ts";
import { randomIp } from "./test-support/harness.ts";
import { createThrottle } from "./throttle.ts";

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
      });
      const ip = randomIp();
      assert.equal((await throttle.countRequest(ip)).ok, true);
      assert.equal((await throttle.countRequest(ip)).ok, false);
    });
  },
);
