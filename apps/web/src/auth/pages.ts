import { createElement as h, type ReactElement, type ReactNode } from "react";
import { type Language, texts } from "./messages.ts";
import { RegisterForm } from "./register-form.ts";

/** The frame of every page of M8: one column, its content marked with its language (A19). */
function AuthFrame({
  language,
  title,
  children,
}: {
  language: Language;
  title: string;
  children?: ReactNode;
}): ReactElement {
  return h(
    "div",
    {
      lang: language,
      className:
        "mx-auto flex w-full max-w-md flex-col gap-roomy px-base py-loose",
    },
    h("h1", { className: "text-xl font-semibold" }, title),
    children,
  );
}

export interface RegisterPageViewProps {
  language: Language;
  /** False while `REGISTRATION_ENABLED` is false (IDN-F-30). */
  open: boolean;
  /** The site key of the bot check, or null while `CAPTCHA_ENABLED` is false (IDN-F-5). */
  siteKey: string | null;
}

/** `/register`: the form, or the text of IDN-U-6 while the registration is closed. */
export function RegisterPageView({
  language,
  open,
  siteKey,
}: RegisterPageViewProps): ReactElement {
  const text = texts[language];
  return h(
    AuthFrame,
    { language, title: text.registerTitle },
    open
      ? h(RegisterForm, { language, siteKey })
      : h("p", { role: "status" }, text.outcomes["registration-closed"]),
  );
}

/** `/login`: the notice of IDN-U-8 after a confirmation; slice 2 of IDN-US-2 adds the form. */
export function LoginPageView({
  language,
  confirmed,
}: {
  language: Language;
  confirmed: boolean;
}): ReactElement {
  const text = texts[language];
  return h(
    AuthFrame,
    { language, title: text.loginTitle },
    confirmed
      ? h(
          "p",
          {
            role: "status",
            className:
              "rounded-md border border-status-success bg-surface p-snug",
          },
          text.addressConfirmed,
        )
      : null,
  );
}

export type LinkKind = "confirm" | "other";

/** `/link-invalid`: the text of IDN-U-7 and, for a confirmation link, the way to a new one. */
export function LinkInvalidPageView({
  language,
  kind,
}: {
  language: Language;
  /** `confirm` for a confirmation link; the reset kind gets its action with #170. */
  kind: LinkKind;
}): ReactElement {
  const text = texts[language];
  return h(
    AuthFrame,
    { language, title: text.linkInvalid },
    kind === "confirm"
      ? h(
          "p",
          null,
          h(
            "a",
            { href: "/login", className: "font-medium text-accent underline" },
            text.newConfirmationLink,
          ),
        )
      : null,
  );
}
