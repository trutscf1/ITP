import { commonPasswordList } from "./common-passwords.ts";

/** The 10,000 most common passwords, lower case (IDN-F-2). */
export const commonPasswords: ReadonlySet<string> = new Set(commonPasswordList);

export const minPasswordLength = 12;
export const maxPasswordLength = 128;

export type PasswordProblem = "too-short" | "too-long" | "common";

export const strengthLevels = ["weak", "fair", "good", "strong"] as const;
export type Strength = (typeof strengthLevels)[number];

/** The characters of a text as a person counts them, not as UTF-16 units. */
function length(text: string): number {
  return Array.from(text).length;
}

/**
 * The rules of IDN-F-2, module M3 of `gam-ai-knowledge/concepts/identity.md` §16: 12 to 128
 * characters, and not an entry of the common-password list, ignoring case.
 */
export function passwordProblems(password: string): PasswordProblem[] {
  const problems: PasswordProblem[] = [];
  const characters = length(password);
  if (characters < minPasswordLength) problems.push("too-short");
  if (characters > maxPasswordLength) problems.push("too-long");
  if (commonPasswords.has(password.toLowerCase())) problems.push("common");
  return problems;
}

/** Lower-case letters, upper-case letters, digits, everything else (§8). */
function characterClasses(password: string): number {
  const classes = new Set<string>();
  for (const character of password) {
    if (/\p{Ll}/u.test(character)) classes.add("lower");
    else if (/\p{Lu}/u.test(character)) classes.add("upper");
    else if (/\p{Nd}/u.test(character)) classes.add("digit");
    else classes.add("other");
  }
  return classes.size;
}

/** The four-step advice of the strength bar (IDN-F-2); it blocks nothing by itself. */
export function strength(password: string): Strength {
  if (passwordProblems(password).length > 0) return "weak";
  const classes = characterClasses(password);
  const characters = length(password);
  if (characters >= 16 && classes >= 2) return "strong";
  if (characters >= 16 || classes >= 2) return "good";
  return "fair";
}
