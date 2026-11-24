import {
  loadWebConfigValue,
  siteKeyProblem,
  type WebConfig,
} from "@stash/contracts/web";

/** What `/register` needs from the configuration of `web` (`concepts/identity.md` §8). */
export interface RegistrationSettings {
  open: boolean;
  siteKey: string | null;
}

/**
 * Reads only the three variables of the registration page, so an invalid other variable does
 * not break it (SCF-F-10). An invalid one of these throws with its name and reason, never its
 * value (SCF-NF-4).
 */
function read<
  K extends "REGISTRATION_ENABLED" | "CAPTCHA_ENABLED" | "CAPTCHA_SITE_KEY",
>(
  environment: Readonly<Record<string, string | undefined>>,
  name: K,
): WebConfig[K] {
  const result = loadWebConfigValue(environment, name);
  if (!result.ok)
    throw new Error(`${result.problem.name}: ${result.problem.reason}`);
  return result.value;
}

export function registrationSettings(
  environment: Readonly<Record<string, string | undefined>>,
): RegistrationSettings {
  const open = read(environment, "REGISTRATION_ENABLED");
  const captcha = read(environment, "CAPTCHA_ENABLED");
  const siteKey = read(environment, "CAPTCHA_SITE_KEY");
  const problem = siteKeyProblem(captcha, siteKey);
  if (problem !== null) throw new Error(`${problem.name}: ${problem.reason}`);
  return { open, siteKey: captcha ? siteKey : null };
}
