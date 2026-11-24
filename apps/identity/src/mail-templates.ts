// The three e-mails of IDN-US-1 and IDN-US-6 in German and English (IDN-F-38, concept §8
// "E-mails"). Texts only; the mailer fills in the links and the validity.
export type Language = "de" | "en";

export interface Template {
  subject: string;
  text: string;
}

function hours(count: number, language: Language): string {
  if (language === "de")
    return `${count} ${count === 1 ? "Stunde" : "Stunden"}`;
  return `${count} ${count === 1 ? "hour" : "hours"}`;
}

function minutes(count: number, language: Language): string {
  if (language === "de")
    return `${count} ${count === 1 ? "Minute" : "Minuten"}`;
  return `${count} ${count === 1 ? "minute" : "minutes"}`;
}

export function confirmationTemplate(
  language: Language,
  link: string,
  validityHours: number,
): Template {
  if (language === "en") {
    return {
      subject: "Confirm your e-mail address for stash",
      text: [
        "Hello,",
        "",
        `please confirm your e-mail address to finish your registration for stash. The link is valid for ${hours(validityHours, "en")} and works once:`,
        "",
        link,
        "",
        "If you did not register, you can ignore this e-mail.",
      ].join("\n"),
    };
  }
  return {
    subject: "Bestätige deine E-Mail-Adresse für stash",
    text: [
      "Hallo,",
      "",
      `bitte bestätige deine E-Mail-Adresse, um deine Registrierung bei stash abzuschließen. Der Link ist ${hours(validityHours, "de")} gültig und kann nur einmal verwendet werden:`,
      "",
      link,
      "",
      "Wenn du dich nicht registriert hast, kannst du diese E-Mail ignorieren.",
    ].join("\n"),
  };
}

export function noticeTemplate(language: Language): Template {
  if (language === "en") {
    return {
      subject: "Someone tried to register with your address",
      text: [
        "Hello,",
        "",
        "someone tried to register for stash with this e-mail address, but an account with it already exists. Nothing was changed.",
        "",
        "If it was you, log in as usual, or use the forgotten-password function on the login page to set a new password.",
        "If it was not you, you can ignore this e-mail.",
      ].join("\n"),
    };
  }
  return {
    subject: "Jemand wollte sich mit deiner Adresse registrieren",
    text: [
      "Hallo,",
      "",
      "jemand wollte sich mit dieser E-Mail-Adresse bei stash registrieren, aber es gibt dazu schon ein Konto. Es wurde nichts verändert.",
      "",
      "Wenn du das warst, melde dich wie gewohnt an oder setze über die Funktion „Passwort vergessen“ auf der Anmeldeseite ein neues Passwort.",
      "Wenn du das nicht warst, kannst du diese E-Mail ignorieren.",
    ].join("\n"),
  };
}

export function resetTemplate(
  language: Language,
  link: string,
  validityMinutes: number,
): Template {
  if (language === "en") {
    return {
      subject: "Reset your stash password",
      text: [
        "Hello,",
        "",
        `use this link to set a new password for stash. It is valid for ${minutes(validityMinutes, "en")} and works once:`,
        "",
        link,
        "",
        "If you did not ask for it, you can ignore this e-mail.",
      ].join("\n"),
    };
  }
  return {
    subject: "Setze dein stash-Passwort zurück",
    text: [
      "Hallo,",
      "",
      `mit diesem Link kannst du ein neues Passwort für stash setzen. Er ist ${minutes(validityMinutes, "de")} gültig und kann nur einmal verwendet werden:`,
      "",
      link,
      "",
      "Wenn du das nicht angefordert hast, kannst du diese E-Mail ignorieren.",
    ].join("\n"),
  };
}
