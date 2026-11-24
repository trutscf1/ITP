// M4 Throttle (gam-ai-knowledge/concepts/identity.md §16): the request counter of IDN-F-35, the
// resend mark of IDN-E-5 (Q345), and the failure counters and locks of the login (IDN-F-9). A
// login attempt is counted before its password is checked (Q353), so attempts beyond
// LOGIN_MAX_FAILURES, also parallel ones, are refused without a run of the password hash.
import type { IdentityConfig } from "@stash/contracts";
import type { Redis } from "ioredis";

export type RequestCount =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

/** A login attempt counted before its password is checked (IDN-F-9, Q353). */
export interface LoginReservation {
  ok: true;
  ip: string;
  email: string;
  ipCount: number;
  emailCount: number;
}

export type LoginCheck =
  | LoginReservation
  | { ok: false; retryAfterSeconds: number };

export interface Throttle {
  /**
   * IDN-F-9, IDN-E-6: refuses a login while its IP address or e-mail address is locked, or while
   * LOGIN_MAX_FAILURES attempts of either are already counted in the window; otherwise counts the
   * attempt for both and returns the reservation, which `settleLogin` completes.
   */
  reserveLogin(ip: string, email: string, now: Date): Promise<LoginCheck>;
  /**
   * Completes a reservation: a success deletes the counter of the e-mail address and gives the
   * attempt of the IP address back; a failure that reached LOGIN_MAX_FAILURES locks that IP or
   * e-mail address for LOGIN_LOCK_MINUTES and starts its counter afresh.
   */
  settleLogin(
    reservation: LoginReservation,
    success: boolean,
    now: Date,
  ): Promise<void>;
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
    | "REQUEST_LIMIT_PER_MINUTE"
    | "CONFIRMATION_LINK_TTL_HOURS"
    | "LOGIN_MAX_FAILURES"
    | "LOGIN_FAILURE_WINDOW_SECONDS"
    | "LOGIN_LOCK_MINUTES"
  >,
): Throttle {
  const resendKey = (accountId: string) => `resend:${accountId}`;
  const failureWindow = config.LOGIN_FAILURE_WINDOW_SECONDS;
  const lockMs = config.LOGIN_LOCK_MINUTES * 60_000;
  const keys = (ip: string, email: string) => ({
    failIp: `fail:ip:${ip}`,
    failEmail: `fail:email:${email}`,
    lockIp: `lock:ip:${ip}`,
    lockEmail: `lock:email:${email}`,
  });
  /** Takes one attempt back, but never creates a counter without expiry (IDN-NF-3). */
  const giveBack = (key: string) =>
    redis.eval(
      "if redis.call('exists', KEYS[1]) == 1 then return redis.call('decr', KEYS[1]) end return 0",
      1,
      key,
    );
  return {
    async reserveLogin(ip, email, now) {
      const key = keys(ip, email);
      // A lock holds the time it ends, so it is read against the clock of the caller; the expiry
      // of the key only removes it afterwards (IDN-NF-3).
      const locks = await redis.mget(key.lockIp, key.lockEmail);
      const until = Math.max(...locks.map((value) => Number(value ?? 0)));
      if (until > now.getTime()) {
        return {
          ok: false,
          retryAfterSeconds: Math.max(
            1,
            Math.ceil((until - now.getTime()) / 1000),
          ),
        };
      }
      const results = await redis
        .multi()
        .set(key.failIp, 0, "EX", failureWindow, "NX")
        .incr(key.failIp)
        .pttl(key.failIp)
        .set(key.failEmail, 0, "EX", failureWindow, "NX")
        .incr(key.failEmail)
        .pttl(key.failEmail)
        .exec();
      const value = (index: number) => Number(results?.[index]?.[1]);
      const ipCount = value(1);
      const emailCount = value(4);
      const max = config.LOGIN_MAX_FAILURES;
      if (ipCount <= max && emailCount <= max) {
        return { ok: true, ip, email, ipCount, emailCount };
      }
      await Promise.all([giveBack(key.failIp), giveBack(key.failEmail)]);
      const remaining = Math.max(
        ipCount > max ? value(2) : 0,
        emailCount > max ? value(5) : 0,
      );
      const seconds = Math.ceil(remaining / 1000);
      return {
        ok: false,
        retryAfterSeconds: Math.min(
          failureWindow,
          Math.max(1, Number.isFinite(seconds) ? seconds : failureWindow),
        ),
      };
    },
    async settleLogin(reservation, success, now) {
      const key = keys(reservation.ip, reservation.email);
      if (success) {
        await Promise.all([redis.del(key.failEmail), giveBack(key.failIp)]);
        return;
      }
      const max = config.LOGIN_MAX_FAILURES;
      const until = String(now.getTime() + lockMs);
      const transaction = redis.multi();
      if (reservation.ipCount >= max) {
        transaction.set(key.lockIp, until, "PX", lockMs).del(key.failIp);
      }
      if (reservation.emailCount >= max) {
        transaction.set(key.lockEmail, until, "PX", lockMs).del(key.failEmail);
      }
      await transaction.exec();
    },
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
