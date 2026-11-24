"use client";

import {
  createElement as h,
  type ReactElement,
  useEffect,
  useRef,
} from "react";
import type { Language } from "./messages.ts";

/** The script of the bot-check widget of IDN-C-5, loaded only while the bot check is on. */
const botCheckScript =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

interface Turnstile {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      language: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ) => string;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

let scriptLoading: Promise<Turnstile> | null = null;

function loadTurnstile(): Promise<Turnstile> {
  if (window.turnstile !== undefined) return Promise.resolve(window.turnstile);
  scriptLoading ??= new Promise<Turnstile>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = botCheckScript;
    script.async = true;
    script.onload = () =>
      window.turnstile === undefined
        ? reject(new Error("bot check not available"))
        : resolve(window.turnstile);
    script.onerror = () => {
      scriptLoading = null;
      reject(new Error("bot check not available"));
    };
    document.head.append(script);
  });
  return scriptLoading;
}

export interface BotCheckProps {
  siteKey: string;
  language: Language;
  /** Called with the token once the check passed, and with null when it expires or fails. */
  onToken: (token: string | null) => void;
  /** A new value draws a fresh widget, for a new token after a refused registration. */
  round: number;
}

/**
 * The bot-check widget of IDN-F-5. It is only part of the page while `CAPTCHA_ENABLED` is
 * true, so a page with the bot check switched off neither shows nor loads it.
 */
export function BotCheck({
  siteKey,
  language,
  onToken,
  round,
}: BotCheckProps): ReactElement {
  const container = useRef<HTMLDivElement>(null);
  const tokenCallback = useRef(onToken);
  tokenCallback.current = onToken;

  useEffect(() => {
    // `round` is read so that a new round draws a fresh widget with a fresh token.
    void round;
    let widget: string | null = null;
    let active = true;
    loadTurnstile()
      .then((turnstile) => {
        if (!active || container.current === null) return;
        widget = turnstile.render(container.current, {
          sitekey: siteKey,
          language,
          callback: (token) => tokenCallback.current(token),
          "expired-callback": () => tokenCallback.current(null),
          "error-callback": () => tokenCallback.current(null),
        });
      })
      .catch(() => tokenCallback.current(null));
    return () => {
      active = false;
      if (widget !== null) window.turnstile?.remove(widget);
    };
  }, [siteKey, language, round]);

  return h("div", { ref: container, "data-sitekey": siteKey });
}
