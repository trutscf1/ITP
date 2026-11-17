// M4 Throttle (gam-ai-knowledge/concepts/identity.md §16), the part IDN-US-1 needs: the request
// counter of IDN-F-35 and the resend mark of IDN-E-5 (Q345). The failure counters and locks of
// IDN-F-9 belong to IDN-US-2.
import type { IdentityConfig } from "@stash/contracts";
import type { Redis } from "ioredis";

export type RequestCount =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

export interface Throttle {
  /** Counts a registration or reset request of one IP address (IDN-F-35). */
  countRequest(ip: string): Promise<RequestCount>;
  /**
   * IDN-E-5 (Q345): true for the first refused login of an unconfirmed account, which then sends
   * a new link; false for every further one until CONFIRMATION_LINK_TTL_HOURS have passed.
   */
  claimResend(accountId: string): Promise<boolean>;
  /** Gives the mark back when the new link could not be stored, so the next login tries again. */
  releaseResend(accountId: string): Promise<void>;
}

const windowSeconds = 60;

export function createThrottle(
  redis: Redis,
  config: Pick<
    IdentityConfig,
    "REQUEST_LIMIT_PER_MINUTE" | "CONFIRMATION_LINK_TTL_HOURS"
  >,
): Throttle {
  const resendKey = (accountId: string) => `resend:${accountId}`;
  return {
    async claimResend(accountId) {
      const set = await redis.set(
        resendKey(accountId),
        1,
        "EX",
        config.CONFIRMATION_LINK_TTL_HOURS * 3600,
        "NX",
      );
      return set === "OK";
    },
    async releaseResend(accountId) {
      await redis.del(resendKey(accountId));
    },
    async countRequest(ip) {
      const key = `req:ip:${ip}`;
      // One transaction: the key gets its expiry before it is first incremented, so a crash
      // between the two commands can never leave a counter that does not expire (IDN-NF-3).
      const results = await redis
        .multi()
        .set(key, 0, "EX", windowSeconds, "NX")
        .incr(key)
        .pttl(key)
        .exec();
      const count = Number(results?.[1]?.[1]);
      const milliseconds = Number(results?.[2]?.[1]);
      if (count <= config.REQUEST_LIMIT_PER_MINUTE) return { ok: true };
      const seconds = Math.ceil(milliseconds / 1000);
      return {
        ok: false,
        retryAfterSeconds: Math.min(
          windowSeconds,
          Math.max(1, Number.isFinite(seconds) ? seconds : windowSeconds),
        ),
      };
    },
  };
}
