"use client";

import { identityApiPath } from "@stash/contracts/identity";
import {
  type FormEvent,
  createElement as h,
  type ReactElement,
  useState,
} from "react";
import { BotCheck } from "./bot-check.ts";
import type { Language, RegistrationOutcome } from "./messages.ts";
import {
  type RegistrationField,
  type RegistrationProblems,
  type RegistrationValues,
  registrationBody,
  registrationFields,
  registrationOutcome,
  registrationProblems,
} from "./registration.ts";
import { RegistrationView } from "./registration-view.ts";

export interface RegisterFormProps {
  language: Language;
  /** The site key of the bot check, or null while it is switched off (IDN-F-5). */
  siteKey: string | null;
}

async function send(
  values: RegistrationValues,
  botToken: string | null,
): Promise<RegistrationOutcome> {
  try {
    const response = await fetch(identityApiPath("register"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(registrationBody(values, botToken)),
    });
    const body: unknown = await response.json().catch(() => null);
    return registrationOutcome(response.status, body);
  } catch {
    return "failed";
  }
}

/**
 * The registration form of M8 with its state: it checks the fields with the shared rules
 * before sending (IDN-U-1) and sends the registration only when none is broken.
 */
export function RegisterForm({
  language,
  siteKey,
}: RegisterFormProps): ReactElement {
  const [values, setValues] = useState<RegistrationValues>({
    name: "",
    email: "",
    password: "",
  });
  const [problems, setProblems] = useState<RegistrationProblems>({});
  const [checked, setChecked] = useState(false);
  const [outcome, setOutcome] = useState<RegistrationOutcome | null>(null);
  const [pending, setPending] = useState(false);
  const [botToken, setBotToken] = useState<string | null>(null);
  const [round, setRound] = useState(0);

  function change(field: RegistrationField, value: string): void {
    const next = { ...values, [field]: value };
    setValues(next);
    // After the first attempt, a fixed field loses its error while the person types.
    if (checked) setProblems(registrationProblems(next));
  }

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (pending) return;
    const found = registrationProblems(values);
    setChecked(true);
    setProblems(found);
    const first = registrationFields.find((field) => field in found);
    if (first !== undefined) {
      document.getElementById(`register-${first}`)?.focus();
      return;
    }
    setPending(true);
    const result = await send(values, siteKey === null ? null : botToken);
    setPending(false);
    setOutcome(result);
    if (siteKey !== null && result !== "check-mailbox") {
      // A token is used up by one request; the next attempt needs a fresh check.
      setBotToken(null);
      setRound(round + 1);
    }
  }

  return h(RegistrationView, {
    language,
    values,
    problems,
    outcome,
    pending,
    botCheck:
      siteKey === null
        ? null
        : h(BotCheck, { siteKey, language, onToken: setBotToken, round }),
    onChange: change,
    onSubmit: (event) => void submit(event),
  });
}
