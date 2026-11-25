import {
  passwordProblems,
  type RegistrationInput,
  registrationInputSchema,
  strength,
} from "@stash/contracts/identity";
import {
  type FieldProblem,
  type Language,
  type RegistrationOutcome,
  texts,
} from "./messages.ts";

/** What a person typed into the registration form. */
export interface RegistrationValues {
  name: string;
  email: string;
  password: string;
}

export type RegistrationField = keyof RegistrationValues;

export type RegistrationProblems = Partial<
  Record<RegistrationField, FieldProblem>
>;

/** The fields in the order of the form; the first one with a problem gets the focus. */
export const registrationFields: readonly RegistrationField[] = [
  "name",
  "email",
  "password",
];

/**
 * The rule violations of a registration before it is sent (IDN-F-1, IDN-U-1). Whether a field
 * is valid is decided by `RegistrationInput` of the shared contract, so the page and `identity`
 * apply the same rules; the problem names which field text of §8 is shown.
 */
export function registrationProblems(
  values: RegistrationValues,
): RegistrationProblems {
  const result = registrationInputSchema.safeParse(values);
  if (result.success) return {};
  const invalid = new Set(result.error.issues.map((issue) => issue.path[0]));
  const problems: RegistrationProblems = {};
  if (invalid.has("name"))
    problems.name =
      values.name.trim().length === 0 ? "name-empty" : "name-too-long";
  if (invalid.has("email")) problems.email = "email-invalid";
  if (invalid.has("password"))
    problems.password = passwordProblems(values.password)[0] ?? "too-short";
  return problems;
}

/** The level of the strength bar as text (IDN-U-2), or nothing while the field is empty. */
export function strengthText(
  password: string,
  language: Language,
): string | null {
  return password === "" ? null : texts[language].strength[strength(password)];
}

/**
 * The body of `POST /api/identity/register`. `botToken` is only present when the bot check is
 * switched on (IDN-F-5): switched off, the page sends no token at all.
 */
export function registrationBody(
  values: RegistrationValues,
  botToken: string | null,
): RegistrationInput {
  const body: RegistrationInput = {
    name: values.name,
    email: values.email,
    password: values.password,
  };
  if (botToken !== null) body.botToken = botToken;
  return body;
}

const knownCodes = new Set<RegistrationOutcome>([
  "validation-failed",
  "bot-check-failed",
  "too-many-requests",
  "registration-closed",
]);

/**
 * The outcome of the answer of `identity` (concept §8): 202 `check-mailbox` for every address
 * (IDN-F-6), a known error code as its form text, and anything else as `failed`.
 */
export function registrationOutcome(
  status: number,
  body: unknown,
): RegistrationOutcome {
  const record =
    typeof body === "object" && body !== null
      ? (body as Record<string, unknown>)
      : {};
  if (status === 202)
    return record.status === "check-mailbox" ? "check-mailbox" : "failed";
  const code = record.code;
  return typeof code === "string" && knownCodes.has(code as RegistrationOutcome)
    ? (code as RegistrationOutcome)
    : "failed";
}
