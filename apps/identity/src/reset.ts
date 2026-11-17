// The password reset of IDN-US-6 (concept §8 and §9; IDN-F-25 to IDN-F-28, IDN-F-33, IDN-E-7).
// The request answers alike for every address and sends the e-mail only after the answer
// (IDN-F-28, IDN-E-11); the new password checks the link before it runs the password hash, so a
// wrong token costs no hash run, and uses the link only in the transaction that replaces the hash.
import type { NewPasswordInput, ResetRequestInput } from "@stash/contracts";
import type { AuthCore } from "./auth-core.ts";
import type { Language, Mailer } from "./mailer.ts";
import type { Outgoing } from "./registration.ts";
import type { SessionStore } from "./sessions.ts";

export interface ResetDeps {
  auth: AuthCore;
  sessions: SessionStore;
  mailer: Mailer;
  clock: () => Date;
  resetLinkTtlMinutes: number;
}

/** IDN-F-25, IDN-F-28: the e-mail to send after the answer, or none for an unknown address. */
export async function requestReset(
  deps: ResetDeps,
  input: ResetRequestInput,
  language: Language,
): Promise<Outgoing | undefined> {
  const account = await deps.auth.findAccount(input.email);
  if (!account) return undefined;
  const validityMinutes = deps.resetLinkTtlMinutes;
  const token = await deps.auth.replaceResetLink(
    account.id,
    deps.clock(),
    validityMinutes,
  );
  const to = account.email;
  return () => deps.mailer.sendReset({ to, language, token, validityMinutes });
}

/**
 * IDN-F-25 to IDN-F-27, IDN-F-33: sets the new password with a valid link, confirms the address,
 * and ends every session of the account. False for an unknown, used, or expired link (IDN-E-7).
 */
export async function completeReset(
  deps: ResetDeps,
  input: NewPasswordInput,
): Promise<boolean> {
  const { auth, sessions, clock } = deps;
  if (!(await auth.resetLinkAccount(input.token, clock()))) return false;
  const passwordHash = await auth.hashPassword(input.password);
  const accountId = await auth.resetPassword(
    input.token,
    passwordHash,
    clock(),
  );
  if (!accountId) return false;
  await sessions.deleteAll(accountId);
  return true;
}
