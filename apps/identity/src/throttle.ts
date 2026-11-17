// M4 Throttle (gam-ai-knowledge/concepts/identity.md §16), the part IDN-US-1 needs: the request
// counter of IDN-F-35. The failure counters and locks of IDN-F-9 belong to IDN-US-2.
import type { IdentityConfig } from "@stash/contracts";
import type { Redis } from "ioredis";

export type RequestCount =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

export interface Throttle {
  /** Counts a registration or reset request of one IP address (IDN-F-35). */
  countRequest(ip: string): Promise<RequestCount>;
}

const windowSeconds = 60;

export function createThrottle(
  redis: Redis,
  config: Pick<IdentityConfig, "REQUEST_LIMIT_PER_MINUTE">,
): Throttle {
  return {
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
