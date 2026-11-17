// The registration of IDN-US-1 (IDN-F-6, IDN-F-4, IDN-F-32): what happens to a valid
// registration, whatever the state of the address. The caller answers 202 in every case.
import type { RegistrationInput } from "@stash/contracts";
import type { AuthCore } from "./auth-core.ts";
import type { Logger } from "./logger.ts";
import type { Language, Mailer } from "./mailer.ts";

export interface RegistrationDeps {
  auth: AuthCore;
  mailer: Mailer;
  logger: Logger;
  clock: () => Date;
  confirmationLinkTtlHours: number;
}

export async function register(
  deps: RegistrationDeps,
  input: RegistrationInput,
  language: Language,
): Promise<void> {
  const { auth, mailer, clock } = deps;
  // The password is hashed in every case, so the time of the answer does not tell whether the
  // address already has an account (IDN-F-6).
  const passwordHash = await auth.hashPassword(input.password);
  const existing = await auth.findAccount(input.email);

  if (existing?.emailVerified) {
    await mailer.sendNotice({ to: input.email, language });
    return;
  }

  const now = clock();
  let id: string;
  if (existing) {
    id = existing.id;
    await auth.replaceUnconfirmed(id, {
      name: input.name,
      passwordHash,
      now,
    });
  } else {
    try {
      id = await auth.createAccount({
        name: input.name,
        email: input.email,
        passwordHash,
        now,
      });
    } catch (error) {
      // A concurrent registration of the same address won the race; its e-mail goes out.
      if (await auth.findAccount(input.email)) return;
      throw error;
    }
  }

  const token = await auth.issueConfirmationToken(
    id,
    now,
    deps.confirmationLinkTtlHours,
  );
  await mailer.sendConfirmation({ to: input.email, language, token });
}
