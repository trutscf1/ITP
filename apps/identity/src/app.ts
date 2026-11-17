// M1 Server (gam-ai-knowledge/concepts/identity.md §16): the HTTP routes of `identity` below the
// prefix /api/identity, which the reverse proxy strips (scaffolding.md §8), the error responses
// of SCF-F-21, and the health report of SCF-F-5. Everything the routes need is passed in, so the
// tests start the same app with a stub for the bot check and a clock of their own.
import {
  confirmQuerySchema,
  type ErrorCode,
  errorReplies,
  type HealthReport,
  type IdentityConfig,
  identityPaths,
  loginInputSchema,
  newPasswordInputSchema,
  registrationInputSchema,
  resetRequestInputSchema,
  type SessionInfo,
} from "@stash/contracts";
import { type Context, Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import type { AfterAnswer } from "./after-answer.ts";
import type { AuthCore } from "./auth-core.ts";
import type { BotCheck } from "./bot-check.ts";
import type { ClientAddress } from "./client-ip.ts";
import type { Logger } from "./logger.ts";
import { logIn } from "./login.ts";
import { chooseLanguage, type Mailer } from "./mailer.ts";
import { register } from "./registration.ts";
import { completeReset, requestReset } from "./reset.ts";
import type { SessionStore } from "./sessions.ts";
import type { Throttle } from "./throttle.ts";

export const sessionCookie = "stash_session";

/** The largest JSON body a route reads; a larger one is refused as invalid (IDN-E-1). */
export const maxBodyBytes = 16 * 1024;

/** The essential dependencies of `identity`, as checks that reject when the dependency is down. */
export interface Probes {
  database: () => Promise<void>;
  sessionStore: () => Promise<void>;
}

export interface AppDeps {
  config: IdentityConfig;
  auth: AuthCore;
  sessions: SessionStore;
  throttle: Throttle;
  /** Used only while CAPTCHA_ENABLED is true. */
  botCheck: BotCheck;
  mailer: Mailer;
  /** Runs the e-mails after the answer (IDN-F-6, IDN-E-11). */
  afterAnswer: AfterAnswer;
  logger: Logger;
  clock: () => Date;
  /** The address the throttle counts: X-Forwarded-For only from the reverse proxy (Q352). */
  clientAddress: ClientAddress;
  probes: Probes;
}

function fail(
  context: Context,
  code: ErrorCode,
  headers: Record<string, string> = {},
) {
  const { status, body } = errorReplies[code];
  return context.json(body, status, headers);
}

/** The JSON object of a request body, or undefined when there is none or it is not an object. */
async function readObject(
  context: Context,
): Promise<Record<string, unknown> | undefined> {
  try {
    const body: unknown = await context.req.json();
    return typeof body === "object" && body !== null && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : undefined;
  } catch {
    return undefined;
  }
}

async function within(
  check: () => Promise<void>,
  timeoutMs: number,
): Promise<"ok" | "down"> {
  let timer: NodeJS.Timeout | undefined;
  try {
    await Promise.race([
      check(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("timeout")), timeoutMs);
      }),
    ]);
    return "ok";
  } catch {
    return "down";
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function createApp(deps: AppDeps): Hono {
  const {
    config,
    auth,
    sessions,
    throttle,
    botCheck,
    mailer,
    afterAnswer,
    logger,
    clock,
    clientAddress,
  } = deps;
  const app = new Hono();
  const limitBody = bodyLimit({
    maxSize: maxBodyBytes,
    onError: (context) => fail(context, "validation-failed"),
  });

  // One entry per request: the path without its query, because the query of the confirmation
  // link holds the token (IDN-NF-4).
  app.use(async (context, next) => {
    const started = Date.now();
    await next();
    logger.info("request", {
      method: context.req.method,
      path: context.req.path,
      status: context.res.status,
      durationMs: Date.now() - started,
    });
  });

  app.get(identityPaths.health, async (context) => {
    const timeout = config.HEALTH_CHECK_TIMEOUT_MS;
    const [database, sessionStore] = await Promise.all([
      within(deps.probes.database, timeout),
      within(deps.probes.sessionStore, timeout),
    ]);
    const checks: HealthReport["checks"] = [
      { name: "relational-database", essential: true, status: database },
      { name: "session-store", essential: true, status: sessionStore },
    ];
    const report: HealthReport = {
      unit: "identity",
      version: config.APP_VERSION,
      status: checks.some((check) => check.status === "down") ? "down" : "ok",
      checks,
    };
    return context.json(report);
  });

  // IDN-F-5: while CAPTCHA_ENABLED is true, a missing token is refused without asking the
  // provider; while it is false, no token is required.
  async function passesBotCheck(
    body: Record<string, unknown> | undefined,
    ip: string,
  ): Promise<boolean> {
    if (!config.CAPTCHA_ENABLED) return true;
    const token =
      typeof body?.botToken === "string" ? body.botToken : undefined;
    return token !== undefined && (await botCheck.verify(token, ip));
  }

  // IDN-F-1 to IDN-F-6, IDN-F-30, IDN-F-35. Order: a body above maxBodyBytes is refused unread
  // (IDN-E-1), then the request throttle counts every request, then the closed registration,
  // then the bot check "before anything else" of the input (IDN-F-5), then the input (IDN-E-1).
  // The e-mail goes out after the answer (IDN-F-6, IDN-E-11).
  app.post(identityPaths.register, limitBody, async (context) => {
    const ip = await clientAddress(context);
    const counted = await throttle.countRequest(ip);
    if (!counted.ok) {
      return fail(context, "too-many-requests", {
        "Retry-After": String(counted.retryAfterSeconds),
      });
    }
    if (!config.REGISTRATION_ENABLED)
      return fail(context, "registration-closed");

    const body = await readObject(context);
    if (!(await passesBotCheck(body, ip))) {
      return fail(context, "bot-check-failed");
    }

    const parsed = registrationInputSchema.safeParse(body);
    if (!parsed.success) return fail(context, "validation-failed");

    const outgoing = await register(
      {
        auth,
        mailer,
        clock,
        confirmationLinkTtlHours: config.CONFIRMATION_LINK_TTL_HOURS,
      },
      parsed.data,
      chooseLanguage(context.req.header("accept-language")),
    );
    if (outgoing) afterAnswer.run("registration", outgoing);
    return context.json({ status: "check-mailbox" as const }, 202);
  });

  // IDN-F-4, IDN-E-7: the link works once; every other case leads to the invalid-link page.
  app.get(identityPaths.confirm, async (context) => {
    const query = confirmQuerySchema.safeParse({
      token: context.req.query("token"),
    });
    const confirmed = query.success
      ? await auth.confirm(query.data.token, clock())
      : false;
    return context.redirect(
      confirmed ? "/login?confirmed=1" : "/link-invalid?kind=confirm",
      303,
    );
  });

  // The session cookie of IDN-F-36: it expires with the session, and logout clears it with the
  // same attributes.
  const cookieOptions = {
    httpOnly: true,
    sameSite: "Lax",
    path: "/",
    secure: config.PUBLIC_ORIGIN.startsWith("https://"),
  } as const;
  function setSessionCookie(
    context: Context,
    token: string,
    maxAgeSeconds: number,
  ) {
    setCookie(context, sessionCookie, token, {
      ...cookieOptions,
      maxAge: maxAgeSeconds,
    });
  }

  // IDN-F-7, IDN-F-9, IDN-F-11, IDN-E-4 to IDN-E-6: the order of the login is in login.ts.
  app.post(identityPaths.login, limitBody, async (context) => {
    const parsed = loginInputSchema.safeParse(await readObject(context));
    if (!parsed.success) return fail(context, "validation-failed");
    const result = await logIn(
      {
        auth,
        sessions,
        throttle,
        mailer,
        afterAnswer,
        clock,
        confirmationLinkTtlHours: config.CONFIRMATION_LINK_TTL_HOURS,
      },
      parsed.data,
      {
        ip: await clientAddress(context),
        userAgent: context.req.header("user-agent") ?? "",
        language: chooseLanguage(context.req.header("accept-language")),
      },
    );
    switch (result.kind) {
      case "locked":
        return fail(context, "too-many-requests", {
          "Retry-After": String(result.retryAfterSeconds),
        });
      case "invalid-credentials":
      case "address-not-confirmed":
        return fail(context, result.kind);
      case "logged-in": {
        setSessionCookie(context, result.token, result.maxAgeSeconds);
        return context.json(result.info);
      }
    }
  });

  // IDN-F-8: ends the session at once; without a valid session the answer is the same.
  app.post(identityPaths.logout, async (context) => {
    const token = getCookie(context, sessionCookie);
    if (token) await sessions.delete(token);
    deleteCookie(context, sessionCookie, cookieOptions);
    return context.body(null, 204);
  });

  // IDN-F-37, IDN-F-34, IDN-E-9: the session check of every unit (ADR-0007). A renewal sends the
  // cookie again with the new lifetime (IDN-F-36).
  app.get(identityPaths.session, async (context) => {
    const token = getCookie(context, sessionCookie);
    const session = token ? await sessions.read(token, clock()) : undefined;
    if (!token || !session) return fail(context, "no-session");
    const account = await auth.accountById(session.record.accountId);
    if (!account) {
      await sessions.delete(token);
      return fail(context, "no-session");
    }
    if (session.renewedMaxAgeSeconds !== undefined) {
      setSessionCookie(context, token, session.renewedMaxAgeSeconds);
    }
    const info: SessionInfo = {
      userId: session.record.userId,
      name: account.name,
      email: account.email,
    };
    return context.json(info);
  });

  const resetDeps = {
    auth,
    sessions,
    mailer,
    clock,
    resetLinkTtlMinutes: config.RESET_LINK_TTL_MINUTES,
  };

  // IDN-F-25, IDN-F-28, IDN-F-29, IDN-F-35, IDN-F-5: the request throttle, then the bot check, then the input; the
  // answer is the same for every address, and the e-mail goes out after it (IDN-E-11).
  app.post(identityPaths.resetRequest, limitBody, async (context) => {
    const ip = await clientAddress(context);
    const counted = await throttle.countRequest(ip);
    if (!counted.ok) {
      return fail(context, "too-many-requests", {
        "Retry-After": String(counted.retryAfterSeconds),
      });
    }
    const body = await readObject(context);
    if (!(await passesBotCheck(body, ip))) {
      return fail(context, "bot-check-failed");
    }
    const parsed = resetRequestInputSchema.safeParse(body);
    if (!parsed.success) return fail(context, "validation-failed");
    const outgoing = await requestReset(
      resetDeps,
      parsed.data,
      chooseLanguage(context.req.header("accept-language")),
    );
    if (outgoing) afterAnswer.run("reset", outgoing);
    return context.json({ status: "check-mailbox" as const }, 202);
  });

  // IDN-F-25 to IDN-F-27, IDN-F-33, IDN-E-7: a password that breaks the rules is refused before
  // the link is used (IDN-F-26).
  app.post(identityPaths.reset, limitBody, async (context) => {
    const parsed = newPasswordInputSchema.safeParse(await readObject(context));
    if (!parsed.success) return fail(context, "validation-failed");
    const done = await completeReset(resetDeps, parsed.data);
    if (!done) return fail(context, "link-invalid");
    return context.body(null, 204);
  });

  // A known path with another method is 405, an unknown path 404, a failure inside 500; none of
  // them carries internals (SCF-F-21, SCF-NF-4).
  const methods: Record<string, string> = {
    [identityPaths.health]: "GET",
    [identityPaths.register]: "POST",
    [identityPaths.confirm]: "GET",
    [identityPaths.login]: "POST",
    [identityPaths.logout]: "POST",
    [identityPaths.session]: "GET",
    [identityPaths.resetRequest]: "POST",
    [identityPaths.reset]: "POST",
  };
  for (const [path, allowed] of Object.entries(methods)) {
    app.all(path, (context) =>
      fail(context, "method-not-allowed", { Allow: allowed }),
    );
  }
  app.notFound((context) => fail(context, "not-found"));
  app.onError((error, context) => {
    logger.error("request failed", { path: context.req.path, error });
    return fail(context, "internal-error");
  });

  return app;
}
