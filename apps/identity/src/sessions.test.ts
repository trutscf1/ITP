// IDN-T-27 (M2, IDN-F-34): the session store against the real Redis of the test stack, with a
// fixed clock: lifetime, renewal, expiry, and deletion of a session.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, describe, it } from "node:test";
import { Redis } from "ioredis";
import { createSessionStore } from "./sessions.ts";
import { redisUrl, skipRedis } from "./test-support/database.ts";
import { hashToken } from "./token-hash.ts";

const at = (value: string) => new Date(value);

describe(
  "IDN-T-27 IDN-AC-2.6 IDN-F-34 session lifetime",
  { skip: skipRedis },
  () => {
    let redis: Redis;
    before(() => {
      redis = new Redis(redisUrl ?? "");
    });
    after(() => {
      redis?.disconnect();
    });

    function open(now: Date) {
      const store = createSessionStore(redis, { SESSION_TTL_DAYS: 7 });
      const accountId = randomUUID();
      const created = store.create({
        accountId,
        userId: randomUUID(),
        ipAddress: "203.0.113.7",
        userAgent: "test",
        now,
      });
      return { store, accountId, created };
    }

    it("IDN-T-27 IDN-AC-2.6 IDN-F-34 follows §10 example 4: no renewal within a day, renewed on 11-05 09:00 until 11-12 09:00, no session at 11-12 09:01", async () => {
      const { store, created } = open(at("2026-11-03T10:00:00Z"));
      const { token } = await created;

      const sameDay = await store.read(token, at("2026-11-03T18:00:00Z"));
      assert.equal(sameDay?.record.expiresAt, "2026-11-10T10:00:00.000Z");
      assert.equal(sameDay?.renewedMaxAgeSeconds, undefined);

      const renewed = await store.read(token, at("2026-11-05T09:00:00Z"));
      assert.equal(renewed?.record.expiresAt, "2026-11-12T09:00:00.000Z");
      assert.equal(renewed?.renewedMaxAgeSeconds, 7 * 86_400);

      assert.equal(
        await store.read(token, at("2026-11-12T09:01:00Z")),
        undefined,
      );
      // An expired session is deleted from the session store (IDN-F-34).
      assert.equal(await redis.exists(`session:${hashToken(token)}`), 0);
    });

    it("IDN-F-34 IDN-NF-2 keeps the renewed session in the store for SESSION_TTL_DAYS", async () => {
      const { store, created } = open(at("2026-11-03T10:00:00Z"));
      const { token } = await created;
      await store.read(token, at("2026-11-05T09:00:00Z"));
      const ttl = await redis.ttl(`session:${hashToken(token)}`);
      assert.ok(ttl > 7 * 86_400 - 60 && ttl <= 7 * 86_400, `${ttl}`);
    });

    it("IDN-F-8 IDN-NF-2 deletes the session and its entry in the account's set at once", async () => {
      const { store, accountId, created } = open(new Date());
      const { token } = await created;
      await store.delete(token);
      assert.equal(await store.read(token, new Date()), undefined);
      assert.equal(await redis.exists(`session:${hashToken(token)}`), 0);
      assert.equal(
        await redis.sismember(
          `account-sessions:${accountId}`,
          hashToken(token),
        ),
        0,
      );
    });

    it("IDN-F-8 does not bring a deleted session back by a renewal", async () => {
      const { store, created } = open(at("2026-11-03T10:00:00Z"));
      const { token } = await created;
      await store.delete(token);
      assert.equal(
        await store.read(token, at("2026-11-05T09:00:00Z")),
        undefined,
      );
      assert.equal(await redis.exists(`session:${hashToken(token)}`), 0);
    });

    it("IDN-E-9 answers no session for an unknown or malformed token", async () => {
      const store = createSessionStore(redis, { SESSION_TTL_DAYS: 7 });
      assert.equal(await store.read("unknown", new Date()), undefined);
      assert.equal(await store.read("", new Date()), undefined);
      await store.delete("unknown");
    });
  },
);
