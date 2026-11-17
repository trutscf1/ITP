import type { ContentLanguage, LegalKind } from "./languages.ts";

/**
 * The legal templates (`gam-ai-knowledge/concepts/public-content.md` §8, "Legal template outline"),
 * held once here so that the seed of `cms` and the built-in legal text of `web` are the same text
 * (PUB-F-26). Each template starts with the template notice, then has the headings of the outline
 * in order; every value the operator has to supply is written `[[name of the value]]`. The wording
 * is written for a template, it is not legal advice (open question Q14 of the concept).
 *
 * The texts are rich text of the markup of §8: paragraphs, and headings of level 2.
 */

const notices: Record<ContentLanguage, string> = {
  de: "Diese Seite ist eine Vorlage. Der Betreiber dieser Installation hat sie noch nicht ausgefüllt.",
  en: "This page is a template. The operator of this installation has not filled it in yet.",
};

type Section = readonly [heading: string, text: string];

const templates: Record<
  LegalKind,
  Record<ContentLanguage, readonly Section[]>
> = {
  imprint: {
    de: [
      [
        "Betreiber",
        "Diese Installation wird betrieben von [[name of the operator]], [[street and number]], [[postcode and city]].",
      ],
      [
        "Kontakt",
        "Sie erreichen den Betreiber per E-Mail unter [[e-mail address]] und telefonisch unter [[telephone number]].",
      ],
    ],
    en: [
      [
        "Operator",
        "This installation is operated by [[name of the operator]], [[street and number]], [[postcode and city]].",
      ],
      [
        "Contact",
        "You reach the operator by e-mail at [[e-mail address]] and by telephone at [[telephone number]].",
      ],
    ],
  },
  terms: {
    de: [
      [
        "Geltungsbereich",
        "Diese Nutzungsbedingungen gelten für die Nutzung der Installation von [[name of the operator]], Stand [[date of the terms]].",
      ],
      [
        "Nutzung",
        "Die Installation dient dem Speichern, Ordnen, Suchen und Teilen von Dateien. Jede Person nutzt sie nur im Rahmen der geltenden Gesetze.",
      ],
      [
        "Konten",
        "Zugangsdaten sind vertraulich zu behandeln. Der Betreiber darf Konten sperren, wenn diese Bedingungen verletzt werden.",
      ],
      [
        "Haftung",
        "Der Betreiber haftet im Rahmen der gesetzlichen Bestimmungen. Für Inhalte, die Mitglieder hochladen, sind diese selbst verantwortlich.",
      ],
      [
        "Änderungen",
        "Der Betreiber kann diese Bedingungen ändern. Die jeweils geltende Fassung steht auf dieser Seite.",
      ],
      [
        "Anwendbares Recht",
        "Es gilt das Recht von [[country of the applicable law]].",
      ],
    ],
    en: [
      [
        "Scope",
        "These terms apply to the use of the installation of [[name of the operator]], as of [[date of the terms]].",
      ],
      [
        "Use",
        "The installation is for storing, organising, searching, and sharing files. Everyone uses it only within the applicable laws.",
      ],
      [
        "Accounts",
        "Credentials must be kept confidential. The operator may block accounts if these terms are violated.",
      ],
      [
        "Liability",
        "The operator is liable within the limits of the law. Members are responsible for the files they upload.",
      ],
      [
        "Changes",
        "The operator may change these terms. The version in force is the one on this page.",
      ],
      [
        "Applicable law",
        "The law of [[country of the applicable law]] applies.",
      ],
    ],
  },
  privacy: {
    de: [
      [
        "Verantwortlicher",
        "Verantwortlich für die Verarbeitung personenbezogener Daten ist [[name of the operator]]. Bei Fragen zum Datenschutz erreichen Sie [[e-mail address of the data protection contact]].",
      ],
      [
        "Mitgliedskonten",
        "Für ein Mitgliedskonto speichern wir Name, E-Mail-Adresse und das Kennwort als Hash. Wir brauchen diese Daten, um Sie anzumelden und Ihre Dateien Ihnen zuzuordnen.",
      ],
      [
        "Konten der Redakteure",
        "Für das Konto einer Redakteurin oder eines Redakteurs speichern wir Name, E-Mail-Adresse und das Kennwort als Hash. Wir brauchen diese Daten, um die Anmeldung beim Redaktionssystem zu ermöglichen; die Inhalte nennen die Person nicht.",
      ],
      [
        "Hochgeladene Dateien",
        "Wir speichern die Dateien, die Mitglieder hochladen, mit ihren Metadaten wie Name, Größe und Datum. Wir brauchen diese Daten, um die Dateien bereitzustellen, zu durchsuchen und auf Viren zu prüfen.",
      ],
      [
        "Protokoll",
        "Das Protokoll hält fest, welche Aktion ein Konto zu welchem Zeitpunkt ausgeführt hat. Wir brauchen es für die Sicherheit der Installation und speichern es [[retention period of the audit log]].",
      ],
      [
        "IP-Adressen bei der Anmelde-Begrenzung",
        "Bei Anmeldeversuchen merken wir uns kurzzeitig die IP-Adresse. Wir brauchen sie, um wiederholte falsche Anmeldungen zu begrenzen.",
      ],
      [
        "Bot-Schutz",
        "Wenn der Bot-Schutz eingeschaltet ist, übermittelt Ihr Browser Daten zur Prüfung an den Anbieter des Bot-Schutzes. Wir brauchen diese Prüfung, um automatisierte Anmeldungen abzuwehren; diese Verarbeitung gilt nur, wenn der Bot-Schutz eingeschaltet ist.",
      ],
      [
        "Externe Anmeldung",
        "Wenn die externe Anmeldung eingeschaltet ist, erhalten wir von Ihrem Anbieter Name und E-Mail-Adresse. Wir brauchen diese Daten, um Sie ohne eigenes Kennwort anzumelden; diese Verarbeitung gilt nur, wenn die externe Anmeldung eingeschaltet ist.",
      ],
      [
        "E-Mail-Versand",
        "Für den Versand von E-Mails verwenden wir Ihre E-Mail-Adresse. Wir brauchen sie für Nachrichten wie die Bestätigung der Adresse oder das Zurücksetzen des Kennworts.",
      ],
      [
        "Ihre Rechte",
        "Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung sowie auf Beschwerde bei der Datenschutzbehörde. Wenden Sie sich dazu an die oben genannte Stelle.",
      ],
    ],
    en: [
      [
        "Controller",
        "[[name of the operator]] is responsible for the processing of personal data. For questions about data protection, contact [[e-mail address of the data protection contact]].",
      ],
      [
        "Member accounts",
        "For a member account we store the name, the e-mail address, and the password as a hash. We need these data to sign you in and to assign your files to you.",
      ],
      [
        "Editor accounts",
        "For the account of an editor we store the name, the e-mail address, and the password as a hash. We need these data to let the editor sign in to the content management system; the content does not name the person.",
      ],
      [
        "Uploaded files",
        "We store the files members upload together with their metadata such as name, size, and date. We need these data to provide the files, to search them, and to scan them for viruses.",
      ],
      [
        "Audit log",
        "The audit log records which action an account performed at what time. We need it for the security of the installation and keep it for [[retention period of the audit log]].",
      ],
      [
        "IP addresses for the login rate limit",
        "When you try to sign in, we remember the IP address for a short time. We need it to limit repeated failed sign-ins.",
      ],
      [
        "Bot protection",
        "When bot protection is switched on, your browser sends data for a check to the provider of the bot protection. We need this check to keep out automated sign-ins; this processing applies only when bot protection is switched on.",
      ],
      [
        "External login providers",
        "When external login is switched on, we receive your name and e-mail address from your provider. We need these data to sign you in without a password of your own; this processing applies only when external login is switched on.",
      ],
      [
        "E-mail delivery",
        "To send e-mail we use your e-mail address. We need it for messages such as the confirmation of the address or the reset of the password.",
      ],
      [
        "Your rights",
        "You have the right of access, rectification, erasure, and restriction of processing, and the right to complain to the data protection authority. Contact the office named above.",
      ],
    ],
  },
};

/** The first sentence of every legal template, in the given language. */
export function templateNotice(language: ContentLanguage): string {
  return notices[language];
}

/**
 * The legal template of a kind in a language: the template notice, then the headings of the outline
 * with their text (PUB-F-26).
 */
export function legalTemplate(
  kind: LegalKind,
  language: ContentLanguage,
): string {
  const sections = templates[kind][language].map(
    ([heading, text]) => `## ${heading}\n\n${text}`,
  );
  return [notices[language], ...sections].join("\n\n");
}
