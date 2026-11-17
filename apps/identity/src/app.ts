// M1 Server (gam-ai-knowledge/concepts/identity.md §16): the HTTP routes of `identity` below the
// prefix /api/identity, which the reverse proxy strips (scaffolding.md §8), the error responses
// of SCF-F-21, and the health report of SCF-F-5. Everything the routes need is passed in, so the
// tests start the same app with a stub for the bot check and a clock of their own.
import {
  type ErrorCode,
  errorReplies,
  type HealthReport,
  type IdentityConfig,
  loginInputSchema,
  registrationInputSchema,
  type SessionInfo,
} from "@stash/contracts";
import { type Context, Hono } from "hono";
import { setCookie } from "hono/cookie";
import type { AuthCore } from "./auth-core.ts";
import type { BotCheck } from "./bot-check.ts";
import { clientIp } from "./client-ip.ts";
import type { Logger } from "./logger.ts";
import { chooseLanguage, type Mailer } from "./mailer.ts";
import { register } from "./registration.ts";
import type { SessionStore } from "./sessions.ts";
import type { Throttle } from "./throttle.ts";

export const sessionCookie = "stash_session";

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
  logger: Logger;
  clock: () => Date;
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
  const { config, auth, sessions, throttle, botCheck, mailer, logger, clock } =
    deps;
  const app = new Hono();

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

  app.get("/health", async (context) => {
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

  // IDN-F-1 to IDN-F-6, IDN-F-30, IDN-F-35. Order: the request throttle counts every request,
  // then the closed registration, then the bot check "before anything else" of the input
  // (IDN-F-5), then the input (IDN-E-1).
  app.post("/register", async (context) => {
    const ip = clientIp(context);
    const counted = await throttle.countRequest(ip);
    if (!counted.ok) {
      return fail(context, "too-many-requests", {
        "Retry-After": String(counted.retryAfterSeconds),
      });
    }
    if (!config.REGISTRATION_ENABLED)
      return fail(context, "registration-closed");

    const body = await readObject(context);
    if (config.CAPTCHA_ENABLED) {
      const token =
        typeof body?.botToken === "string" ? body.botToken : undefined;
      // A missing token is refused without asking the provider.
      if (!token || !(await botCheck.verify(token, ip))) {
        return fail(context, "bot-check-failed");
      }
    }

    const parsed = registrationInputSchema.safeParse(body);
    if (!parsed.success) return fail(context, "validation-failed");

    await register(
      {
        auth,
        mailer,
        logger,
        clock,
        confirmationLinkTtlHours: config.CONFIRMATION_LINK_TTL_HOURS,
      },
      parsed.data,
      chooseLanguage(context.req.header("accept-language")),
    );
    return context.json({ status: "check-mailbox" as const }, 202);
  });

  // IDN-F-4, IDN-E-7: the link works once; every other case leads to the invalid-link page.
  app.get("/confirm", async (context) => {
    const token = context.req.query("token");
    const confirmed =
      token !== undefined && token.length > 0 && token.length <= 200
        ? await auth.confirm(token, clock())
        : false;
    return context.redirect(
      confirmed ? "/login?confirmed=1" : "/link-invalid?kind=confirm",
      303,
    );
  });

  // The login of IDN-US-2 as far as IDN-US-1 needs it (IDN-F-7, IDN-F-11, IDN-E-4, IDN-E-5):
  // validate, verify the password (a dummy hash for an unknown address, so both take the same
  // time), then refuse an unconfirmed account or open the session. The throttle steps of the
  // login order (concept §16) are IDN-US-2.
  app.post("/login", async (context) => {
    const parsed = loginInputSchema.safeParse(await readObject(context));
    if (!parsed.success) return fail(context, "validation-failed");
    const { email, password } = parsed.data;

    const account = await auth.findAccount(email);
    let correct = false;
    if (account?.passwordHash) {
      correct = await auth.verifyPassword(account.passwordHash, password);
    } else {
      await auth.verifyDummy(password);
    }
    if (!account || !correct) return fail(context, "invalid-credentials");

    if (!account.emailVerified) {
      // IDN-E-5: a new link, at most once per validity period.
      const now = clock();
      if (!(await auth.hasValidConfirmationLink(account.id, now))) {
        const token = await auth.issueConfirmationToken(
          account.id,
          now,
          config.CONFIRMATION_LINK_TTL_HOURS,
        );
        await mailer.sendConfirmation({
          to: account.email,
          language: chooseLanguage(context.req.header("accept-language")),
          token,
        });
      }
      return fail(context, "address-not-confirmed");
    }

    const userId = await auth.memberId(account.id);
    if (!userId) throw new Error("account without a users row");
    const session = await sessions.create({
      accountId: account.id,
      userId,
      ipAddress: clientIp(context),
      userAgent: context.req.header("user-agent") ?? "",
      now: clock(),
    });
    setCookie(context, sessionCookie, session.token, {
      httpOnly: true,
      sameSite: "Lax",
      path: "/",
      secure: config.PUBLIC_ORIGIN.startsWith("https://"),
      maxAge: session.maxAgeSeconds,
    });
    const info: SessionInfo = {
      userId,
      name: account.name,
      email: account.email,
    };
    return context.json(info);
  });

  // A known path with another method is 405, an unknown path 404, a failure inside 500; none of
  // them carries internals (SCF-F-21, SCF-NF-4).
  const methods: Record<string, string> = {
    "/health": "GET",
    "/register": "POST",
    "/confirm": "GET",
    "/login": "POST",
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
