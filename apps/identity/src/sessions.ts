// The session store (concept §8 "Session store keys", IDN-C-6): creating a session at login
// (IDN-F-7), reading and renewing it for the session check (IDN-F-34, IDN-F-37), and deleting it
// at logout (IDN-F-8). Only a hash of the token is kept (IDN-NF-2). The expiry of a session is
// read against the clock of the caller; the expiry of the key only removes it afterwards.
import { randomBytes } from "node:crypto";
import type { Redis } from "ioredis";
import { hashToken } from "./token-hash.ts";

export interface SessionRecord {
  accountId: string;
  userId: string;
  expiresAt: string;
  ipAddress: string;
  userAgent: string;
}

export interface ReadSession {
  record: SessionRecord;
  /** Set when this read renewed the session: the new lifetime of its cookie (IDN-F-36). */
  renewedMaxAgeSeconds?: number;
}

export interface SessionStore {
  create(input: {
    accountId: string;
    userId: string;
    ipAddress: string;
    userAgent: string;
    now: Date;
  }): Promise<{ token: string; maxAgeSeconds: number }>;
  /**
   * IDN-F-34: the session of a token, renewed when its last renewal is more than one day ago;
   * undefined for an unknown or expired one, and an expired one is deleted.
   */
  read(token: string, now: Date): Promise<ReadSession | undefined>;
  /** IDN-F-8: deletes the session of a token at once; an unknown token is ignored. */
  delete(token: string): Promise<void>;
  /** IDN-F-27: deletes every session of an account at once. */
  deleteAll(accountId: string): Promise<void>;
}

const daySeconds = 86_400;
const dayMs = daySeconds * 1000;

function parse(value: string | null): SessionRecord | undefined {
  if (!value) return undefined;
  try {
    return JSON.parse(value) as SessionRecord;
  } catch {
    return undefined;
  }
}

export function createSessionStore(
  redis: Redis,
  config: { SESSION_TTL_DAYS: number },
): SessionStore {
  const maxAgeSeconds = config.SESSION_TTL_DAYS * daySeconds;
  const sessionKey = (tokenHash: string) => `session:${tokenHash}`;
  const accountKey = (accountId: string) => `account-sessions:${accountId}`;

  async function remove(tokenHash: string, record?: SessionRecord) {
    const transaction = redis.multi().del(sessionKey(tokenHash));
    if (record) transaction.srem(accountKey(record.accountId), tokenHash);
    await transaction.exec();
  }

  return {
    async create({ accountId, userId, ipAddress, userAgent, now }) {
      const token = randomBytes(32).toString("base64url");
      const tokenHash = hashToken(token);
      const record: SessionRecord = {
        accountId,
        userId,
        expiresAt: new Date(now.getTime() + maxAgeSeconds * 1000).toISOString(),
        ipAddress,
        // A browser string can be long; the record keeps what identifies the browser.
        userAgent: userAgent.slice(0, 256),
      };
      await redis
        .multi()
        .set(sessionKey(tokenHash), JSON.stringify(record), "EX", maxAgeSeconds)
        .sadd(accountKey(accountId), tokenHash)
        .expire(accountKey(accountId), maxAgeSeconds)
        .exec();
      return { token, maxAgeSeconds };
    },

    async read(token, now) {
      if (!token) return undefined;
      const tokenHash = hashToken(token);
      const record = parse(await redis.get(sessionKey(tokenHash)));
      if (!record) return undefined;
      const expiresAt = Date.parse(record.expiresAt);
      if (!(expiresAt > now.getTime())) {
        await remove(tokenHash, record);
        return undefined;
      }
      const lastRenewal = expiresAt - maxAgeSeconds * 1000;
      if (now.getTime() - lastRenewal <= dayMs) return { record };

      const renewed: SessionRecord = {
        ...record,
        expiresAt: new Date(now.getTime() + maxAgeSeconds * 1000).toISOString(),
      };
      // Only if the key still exists (SET … XX): a session deleted by a logout in the meantime
      // is not brought back.
      const results = await redis
        .multi()
        .set(
          sessionKey(tokenHash),
          JSON.stringify(renewed),
          "EX",
          maxAgeSeconds,
          "XX",
        )
        .expire(accountKey(record.accountId), maxAgeSeconds)
        .exec();
      if (results?.[0]?.[1] !== "OK") return undefined;
      return { record: renewed, renewedMaxAgeSeconds: maxAgeSeconds };
    },

    async deleteAll(accountId) {
      const hashes = await redis.smembers(accountKey(accountId));
      const transaction = redis.multi();
      for (const tokenHash of hashes) transaction.del(sessionKey(tokenHash));
      await transaction.del(accountKey(accountId)).exec();
    },

    async delete(token) {
      if (!token) return;
      const tokenHash = hashToken(token);
      const record = parse(await redis.get(sessionKey(tokenHash)));
      await remove(tokenHash, record);
    },
  };
}
