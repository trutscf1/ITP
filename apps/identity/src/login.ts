// The password login of IDN-US-2 (concept §16, "M2 AuthCore login order"; IDN-F-7, IDN-F-9,
// IDN-F-11, IDN-E-4 to IDN-E-6). The attempt is counted before the password is checked (Q353),
// so a locked login, and every attempt beyond LOGIN_MAX_FAILURES, costs no run of the password
// hash. The caller maps the result to the answer of §8.
import type { LoginInput, SessionInfo } from "@stash/contracts";
import type { AfterAnswer } from "./after-answer.ts";
import type { AuthCore } from "./auth-core.ts";
import type { Language, Mailer } from "./mailer.ts";
import type { SessionStore } from "./sessions.ts";
import type { Throttle } from "./throttle.ts";

export interface LoginDeps {
  auth: AuthCore;
  sessions: SessionStore;
  throttle: Throttle;
  mailer: Mailer;
  afterAnswer: AfterAnswer;
  clock: () => Date;
  confirmationLinkTtlHours: number;
}

export interface LoginRequest {
  ip: string;
  userAgent: string;
  language: Language;
}

export type LoginResult =
  | { kind: "locked"; retryAfterSeconds: number }
  | { kind: "invalid-credentials" }
  | { kind: "address-not-confirmed" }
  | {
      kind: "logged-in";
      info: SessionInfo;
      token: string;
      maxAgeSeconds: number;
    };

export async function logIn(
  deps: LoginDeps,
  input: LoginInput,
  request: LoginRequest,
): Promise<LoginResult> {
  const { auth, sessions, throttle, clock } = deps;
  const { email, password } = input;

  // 1. The lock and the failure counters (IDN-F-9, IDN-E-6): the password is not checked.
  const reservation = await throttle.reserveLogin(request.ip, email, clock());
  if (!reservation.ok) {
    return { kind: "locked", retryAfterSeconds: reservation.retryAfterSeconds };
  }

  // 2. The password; a dummy hash for an unknown address, so both take the same time (IDN-F-11).
  const account = await auth.findAccount(email);
  let correct = false;
  if (account?.passwordHash) {
    correct = await auth.verifyPassword(account.passwordHash, password);
  } else {
    await auth.verifyDummy(password);
  }
  await throttle.settleLogin(reservation, correct, clock());
  if (!account || !correct) return { kind: "invalid-credentials" };

  // 3. IDN-E-5 (Q345): the first refused login sends a new link, which replaces the older ones;
  // the next ones send none until CONFIRMATION_LINK_TTL_HOURS have passed.
  if (!account.emailVerified) {
    if (await throttle.claimResend(account.id)) {
      let token: string;
      try {
        token = await auth.replaceConfirmationLink(
          account.id,
          clock(),
          deps.confirmationLinkTtlHours,
        );
      } catch (error) {
        await throttle.releaseResend(account.id);
        throw error;
      }
      const to = account.email;
      const { language } = request;
      deps.afterAnswer.run("confirmation", () =>
        deps.mailer.sendConfirmation({ to, language, token }),
      );
    }
    return { kind: "address-not-confirmed" };
  }

  // 4. The session (IDN-F-7, IDN-F-34).
  const userId = await auth.memberId(account.id);
  if (!userId) throw new Error("account without a users row");
  const session = await sessions.create({
    accountId: account.id,
    userId,
    ipAddress: request.ip,
    userAgent: request.userAgent,
    now: clock(),
  });
  return {
    kind: "logged-in",
    info: { userId, name: account.name, email: account.email },
    token: session.token,
    maxAgeSeconds: session.maxAgeSeconds,
  };
}
