// The registration of IDN-US-1 (IDN-F-6, IDN-F-4, IDN-F-32): what happens to a valid
// registration, whatever the state of the address. The caller answers 202 in every case and
// sends the returned e-mail only after the answer (IDN-F-6, IDN-E-11), so neither the time of
// the answer nor a slow SMTP host tells the state of the address.
import type { RegistrationInput } from "@stash/contracts";
import type { AuthCore } from "./auth-core.ts";
import type { Language, Mailer } from "./mailer.ts";

export interface RegistrationDeps {
  auth: AuthCore;
  mailer: Mailer;
  clock: () => Date;
  confirmationLinkTtlHours: number;
}

/** An e-mail to send after the answer; resolves to false when it was not delivered. */
export type Outgoing = () => Promise<boolean>;

export async function register(
  deps: RegistrationDeps,
  input: RegistrationInput,
  language: Language,
): Promise<Outgoing | undefined> {
  const { auth, mailer, clock } = deps;
  const to = input.email;
  // The password is hashed in every case, so the time of the answer does not tell whether the
  // address already has an account (IDN-F-6).
  const passwordHash = await auth.hashPassword(input.password);
  const existing = await auth.findAccount(input.email);

  if (existing?.emailVerified) {
    return () => mailer.sendNotice({ to, language });
  }

  const now = clock();
  const validityHours = deps.confirmationLinkTtlHours;
  let token: string;
  if (existing) {
    token = await auth.replaceUnconfirmed(existing.id, {
      name: input.name,
      passwordHash,
      now,
      validityHours,
    });
  } else {
    try {
      ({ token } = await auth.createAccount({
        name: input.name,
        email: input.email,
        passwordHash,
        now,
        validityHours,
      }));
    } catch (error) {
      // A concurrent registration of the same address won the race; its e-mail goes out.
      if (await auth.findAccount(input.email)) return undefined;
      throw error;
    }
  }
  return () => mailer.sendConfirmation({ to, language, token });
}
