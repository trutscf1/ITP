// The session store of IDN-US-2 as far as IDN-US-1 needs it: creating a session at login
// (IDN-F-7, concept §8 "Session store keys"). Reading, renewing, and deleting sessions, the
// session check, and logout are IDN-US-2. Only a hash of the token is kept (IDN-NF-2).
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

export interface SessionStore {
  create(input: {
    accountId: string;
    userId: string;
    ipAddress: string;
    userAgent: string;
    now: Date;
  }): Promise<{ token: string; maxAgeSeconds: number }>;
}

export function createSessionStore(
  redis: Redis,
  config: { SESSION_TTL_DAYS: number },
): SessionStore {
  const maxAgeSeconds = config.SESSION_TTL_DAYS * 86_400;
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
        .set(
          `session:${tokenHash}`,
          JSON.stringify(record),
          "EX",
          maxAgeSeconds,
        )
        .sadd(`account-sessions:${accountId}`, tokenHash)
        .expire(`account-sessions:${accountId}`, maxAgeSeconds)
        .exec();
      return { token, maxAgeSeconds };
    },
  };
}
