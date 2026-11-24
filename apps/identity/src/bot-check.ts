// M5 BotCheck (gam-ai-knowledge/concepts/identity.md §16, IDN-F-5, IDN-E-2): the server side of
// Cloudflare Turnstile (IDN-C-5). Whatever goes wrong, the request is refused, never let through.
export const siteverifyUrl =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export interface BotCheck {
  /** True only when the provider confirms the token; false for a missing token or any failure. */
  verify(token: string | undefined, ip?: string): Promise<boolean>;
}

export interface BotCheckOptions {
  secret: string;
  /** The HTTP client; the tests replace it, so no test calls the internet. */
  fetch?: typeof fetch;
  /** The time the provider has to answer (IDN-E-2: 5 seconds). */
  timeoutMs?: number;
}

export function createBotCheck(options: BotCheckOptions): BotCheck {
  const send = options.fetch ?? globalThis.fetch.bind(globalThis);
  const timeoutMs = options.timeoutMs ?? 5000;
  return {
    async verify(token, ip) {
      if (!token) return false;
      const form = new URLSearchParams({
        secret: options.secret,
        response: token,
      });
      if (ip) form.set("remoteip", ip);
      try {
        const response = await send(siteverifyUrl, {
          method: "POST",
          headers: { "content-type": "application/x-www-form-urlencoded" },
          body: form,
          signal: AbortSignal.timeout(timeoutMs),
        });
        if (!response.ok) return false;
        const answer: unknown = await response.json();
        return (
          typeof answer === "object" &&
          answer !== null &&
          (answer as { success?: unknown }).success === true
        );
      } catch {
        return false;
      }
    },
  };
}
