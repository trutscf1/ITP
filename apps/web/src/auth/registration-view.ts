import {
  strengthLevels,
  strength as strengthOf,
} from "@stash/contracts/identity";
import {
  type FormEvent,
  createElement as h,
  type ReactElement,
  type ReactNode,
} from "react";
import { type Language, type RegistrationOutcome, texts } from "./messages.ts";
import {
  type RegistrationField,
  type RegistrationProblems,
  type RegistrationValues,
  registrationFields,
  strengthText,
} from "./registration.ts";

export interface RegistrationViewProps {
  language: Language;
  values: RegistrationValues;
  problems: RegistrationProblems;
  /** The answer of `identity` to the last registration sent, if any. */
  outcome: RegistrationOutcome | null;
  pending: boolean;
  /** The bot-check widget, or nothing while the bot check is switched off (IDN-F-5). */
  botCheck: ReactNode;
  onChange: (field: RegistrationField, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

const inputs: Record<
  RegistrationField,
  { type: string; autoComplete: string }
> = {
  name: { type: "text", autoComplete: "name" },
  email: { type: "email", autoComplete: "email" },
  password: { type: "password", autoComplete: "new-password" },
};

/** The level as text, with four marks beside it that only repeat it (IDN-U-2). */
function StrengthBar({
  language,
  password,
  id,
}: {
  language: Language;
  password: string;
  id: string;
}): ReactElement | null {
  const text = strengthText(password, language);
  if (text === null) return null;
  const filled = strengthLevels.indexOf(strengthOf(password)) + 1;
  return h(
    "div",
    { className: "flex flex-col gap-tight" },
    h(
      "div",
      { className: "flex gap-tight", "aria-hidden": true },
      strengthLevels.map((level, index) =>
        h("span", {
          key: level,
          className: `h-1 flex-1 rounded-md ${index < filled ? "bg-accent" : "bg-border"}`,
        }),
      ),
    ),
    h(
      "p",
      { id, className: "text-sm text-muted" },
      `${texts[language].strengthLabel} `,
      h("strong", null, text),
    ),
  );
}

function Field({
  field,
  props,
}: {
  field: RegistrationField;
  props: RegistrationViewProps;
}): ReactElement {
  const { language, values, problems, onChange } = props;
  const id = `register-${field}`;
  const problem = problems[field];
  const errorId = `${id}-error`;
  const strengthId = `${id}-strength`;
  const showStrength = field === "password" && values.password !== "";
  const describedBy = [
    problem === undefined ? null : errorId,
    showStrength ? strengthId : null,
  ]
    .filter((part) => part !== null)
    .join(" ");
  return h(
    "div",
    { className: "flex flex-col gap-tight" },
    h(
      "label",
      { htmlFor: id, className: "font-medium" },
      texts[language].fields[field],
    ),
    h("input", {
      id,
      name: field,
      ...inputs[field],
      value: values[field],
      "aria-invalid": problem === undefined ? undefined : true,
      "aria-describedby": describedBy === "" ? undefined : describedBy,
      onChange: (event: { currentTarget: { value: string } }) =>
        onChange(field, event.currentTarget.value),
      className:
        "rounded-md border border-border bg-background px-snug py-tight text-foreground",
    }),
    problem === undefined
      ? null
      : h(
          "p",
          {
            id: errorId,
            className:
              "border-l-2 border-status-danger pl-snug text-sm text-foreground",
          },
          texts[language].problems[problem],
        ),
    field === "password"
      ? h(StrengthBar, {
          language,
          password: values.password,
          id: strengthId,
        })
      : null,
  );
}

/**
 * The registration form of M8 (IDN-U-1 to IDN-U-3), without state: the values, problems, and
 * answer come in as props, so the server renders every state the tests check.
 */
export function RegistrationView(props: RegistrationViewProps): ReactElement {
  const { language, outcome, pending, botCheck, onSubmit } = props;
  const text = texts[language];
  if (outcome === "check-mailbox")
    return h(
      "p",
      { role: "status", className: "text-lg" },
      text.outcomes["check-mailbox"],
    );
  return h(
    "form",
    {
      noValidate: true,
      onSubmit,
      className: "flex flex-col gap-base",
    },
    outcome === null
      ? null
      : h(
          "p",
          {
            role: "alert",
            className:
              "rounded-md border border-status-danger bg-surface p-snug text-foreground",
          },
          text.outcomes[outcome],
        ),
    registrationFields.map((field) => h(Field, { key: field, field, props })),
    botCheck,
    h(
      "button",
      {
        type: "submit",
        disabled: pending,
        className:
          "self-start rounded-md bg-accent px-base py-snug font-medium text-accent-foreground disabled:opacity-60",
      },
      pending ? text.sending : text.submit,
    ),
  );
}
