import type { Strength } from "@stash/contracts/identity";

/** The languages of the pages of `identity` (IDN-F-38); German is the fallback. */
export type Language = "de" | "en";

/** A rule violation of one field of the registration form (`concepts/identity.md` §8). */
export type FieldProblem =
  | "name-empty"
  | "name-too-long"
  | "email-invalid"
  | "too-short"
  | "too-long"
  | "common";

/** What the page makes of the answer of `identity` to a registration (IDN-U-1, IDN-U-3). */
export type RegistrationOutcome =
  | "check-mailbox"
  | "validation-failed"
  | "bot-check-failed"
  | "too-many-requests"
  | "registration-closed"
  | "failed";

export interface Texts {
  registerTitle: string;
  fields: { name: string; email: string; password: string };
  submit: string;
  sending: string;
  strengthLabel: string;
  strength: Record<Strength, string>;
  problems: Record<FieldProblem, string>;
  outcomes: Record<RegistrationOutcome, string>;
  loginTitle: string;
  addressConfirmed: string;
  linkInvalid: string;
  newConfirmationLink: string;
}

const registrationClosed = {
  en: "Registration is closed. Ask the operator of this installation for an account.",
  de: "Die Registrierung ist geschlossen. Frag den Betreiber dieser Installation nach einem Konto.",
};

const checkMailbox = {
  en: "Check your mailbox. If the address can be used, we have sent you an e-mail.",
  de: "Prüfe dein Postfach. Wenn die Adresse verwendet werden kann, haben wir dir eine E-Mail geschickt.",
};

/** The texts of §5 and §8 ("Message texts", "Field and form texts") of `concepts/identity.md`. */
export const texts: Readonly<Record<Language, Texts>> = {
  en: {
    registerTitle: "Create an account",
    fields: { name: "Name", email: "E-mail address", password: "Password" },
    submit: "Register",
    sending: "Sending …",
    strengthLabel: "Password strength:",
    strength: { weak: "Weak", fair: "Fair", good: "Good", strong: "Strong" },
    problems: {
      "name-empty": "Enter your name.",
      "name-too-long": "Use at most 100 characters.",
      "email-invalid": "Enter an e-mail address such as ada@example.org.",
      "too-short": "Use at least 12 characters.",
      "too-long": "Use at most 128 characters.",
      common: "This password is too common. Choose another one.",
    },
    outcomes: {
      "check-mailbox": checkMailbox.en,
      "validation-failed": "Please check your entries.",
      "bot-check-failed": "The bot check failed. Please try again.",
      "too-many-requests":
        "Too many attempts. Please wait a minute and try again.",
      "registration-closed": registrationClosed.en,
      failed: "Registration did not work. Please try again later.",
    },
    loginTitle: "Log in",
    addressConfirmed: "Your e-mail address is confirmed. You can log in now.",
    linkInvalid: "This link is invalid or has expired.",
    newConfirmationLink: "Log in to get a new link.",
  },
  de: {
    registerTitle: "Konto erstellen",
    fields: { name: "Name", email: "E-Mail-Adresse", password: "Passwort" },
    submit: "Registrieren",
    sending: "Wird gesendet …",
    strengthLabel: "Passwortstärke:",
    strength: { weak: "Schwach", fair: "Mittel", good: "Gut", strong: "Stark" },
    problems: {
      "name-empty": "Gib deinen Namen ein.",
      "name-too-long": "Verwende höchstens 100 Zeichen.",
      "email-invalid": "Gib eine E-Mail-Adresse wie ada@example.org ein.",
      "too-short": "Verwende mindestens 12 Zeichen.",
      "too-long": "Verwende höchstens 128 Zeichen.",
      common: "Dieses Passwort ist zu verbreitet. Wähle ein anderes.",
    },
    outcomes: {
      "check-mailbox": checkMailbox.de,
      "validation-failed": "Bitte prüfe deine Eingaben.",
      "bot-check-failed":
        "Die Bot-Prüfung ist fehlgeschlagen. Bitte versuche es noch einmal.",
      "too-many-requests":
        "Zu viele Versuche. Warte eine Minute und versuche es noch einmal.",
      "registration-closed": registrationClosed.de,
      failed:
        "Die Registrierung hat nicht geklappt. Bitte versuche es später noch einmal.",
    },
    loginTitle: "Anmelden",
    addressConfirmed:
      "Deine E-Mail-Adresse ist bestätigt. Du kannst dich jetzt anmelden.",
    linkInvalid: "Dieser Link ist ungültig oder abgelaufen.",
    newConfirmationLink: "Melde dich an, um einen neuen Link zu bekommen.",
  },
};

/**
 * The first language of the `Accept-Language` header the pages support, German otherwise
 * (IDN-F-38, A19). Entries are taken by their weight; an entry with weight 0 is refused.
 */
export function pickLanguage(
  acceptLanguage: string | null | undefined,
): Language {
  const entries = (acceptLanguage ?? "")
    .split(",")
    .map((entry, index) => {
      const [tag = "", ...parameters] = entry.trim().split(";");
      const weight = parameters
        .map((parameter) => parameter.trim())
        .find((parameter) => parameter.startsWith("q="));
      const quality = weight === undefined ? 1 : Number(weight.slice(2));
      return {
        language: tag.trim().toLowerCase().split("-")[0],
        quality: Number.isFinite(quality) ? quality : 0,
        index,
      };
    })
    .filter((entry) => entry.quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index);
  for (const { language } of entries) {
    if (language === "de" || language === "en") return language;
  }
  return "de";
}
