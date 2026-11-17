// M6 Mailer (gam-ai-knowledge/concepts/identity.md §16, IDN-C-8, IDN-F-38, IDN-E-11): the e-mails
// of the stories over SMTP. A failed delivery never fails the request: it is logged without the
// address and the link, and reported as `false`.
import { type IdentityConfig, identityApiPath } from "@stash/contracts";
import { createTransport } from "nodemailer";
import type { Logger } from "./logger.ts";
import {
  confirmationTemplate,
  type Language,
  noticeTemplate,
  resetTemplate,
  type Template,
} from "./mail-templates.ts";

export type { Language };

const supported: readonly Language[] = ["de", "en"];

/**
 * The language of an e-mail: the first supported language of the `Accept-Language` header,
 * highest weight first, else German (IDN-F-38, A13).
 */
export function chooseLanguage(header: string | undefined): Language {
  const candidates = (header ?? "")
    .split(",")
    .map((part, position) => {
      const [tag = "", ...parameters] = part.trim().split(";");
      const weight = parameters
        .map((parameter) => /^\s*q\s*=\s*([\d.]+)\s*$/i.exec(parameter)?.[1])
        .find((value) => value !== undefined);
      return {
        language: tag.trim().toLowerCase().split("-")[0] ?? "",
        weight: weight === undefined ? 1 : Number(weight),
        position,
      };
    })
    .filter((entry) => entry.weight > 0)
    .sort((a, b) => b.weight - a.weight || a.position - b.position);
  for (const entry of candidates) {
    const match = supported.find((language) => language === entry.language);
    if (match) return match;
  }
  return "de";
}

export interface Mailer {
  /** The confirmation link of a registration (IDN-F-4). */
  sendConfirmation(message: {
    to: string;
    language: Language;
    token: string;
  }): Promise<boolean>;
  /** The notice, without a link, for the address of a confirmed account (IDN-F-6). */
  sendNotice(message: { to: string; language: Language }): Promise<boolean>;
  /** The reset link of IDN-US-6. */
  sendReset(message: {
    to: string;
    language: Language;
    token: string;
    validityMinutes: number;
  }): Promise<boolean>;
}

type MailerConfig = Pick<
  IdentityConfig,
  | "SMTP_HOST"
  | "SMTP_PORT"
  | "SMTP_FROM"
  | "PUBLIC_ORIGIN"
  | "CONFIRMATION_LINK_TTL_HOURS"
>;

export function createMailer(
  config: MailerConfig,
  logger: Logger,
  options: { timeoutMs?: number } = {},
): Mailer {
  // IDN-E-11: the host has 10 seconds to refuse or to answer.
  const timeout = options.timeoutMs ?? 10_000;
  const transport = createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: false,
    connectionTimeout: timeout,
    greetingTimeout: timeout,
    socketTimeout: timeout,
  });

  async function deliver(
    kind: string,
    to: string,
    template: Template,
  ): Promise<boolean> {
    try {
      await transport.sendMail({
        from: config.SMTP_FROM,
        to,
        subject: template.subject,
        text: template.text,
      });
      return true;
    } catch (error) {
      logger.error("e-mail not delivered", { kind, error });
      return false;
    }
  }

  return {
    sendConfirmation: ({ to, language, token }) =>
      deliver(
        "confirmation",
        to,
        confirmationTemplate(
          language,
          `${config.PUBLIC_ORIGIN}${identityApiPath("confirm")}?token=${encodeURIComponent(token)}`,
          config.CONFIRMATION_LINK_TTL_HOURS,
        ),
      ),
    sendNotice: ({ to, language }) =>
      deliver("notice", to, noticeTemplate(language)),
    sendReset: ({ to, language, token, validityMinutes }) =>
      deliver(
        "reset",
        to,
        resetTemplate(
          language,
          `${config.PUBLIC_ORIGIN}/reset-password?token=${encodeURIComponent(token)}`,
          validityMinutes,
        ),
      ),
  };
}
