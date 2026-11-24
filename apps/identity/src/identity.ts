// The composition of the unit: the real services behind the routes of app.ts. The tests build
// the same thing with their own clock, bot check, and dependency probes.
import type { IdentityConfig } from "@stash/contracts";
import type { Hono } from "hono";
import { Redis } from "ioredis";
import { createAfterAnswer } from "./after-answer.ts";
import { createApp, type Probes } from "./app.ts";
import { createAuthCore } from "./auth-core.ts";
import { type BotCheck, createBotCheck } from "./bot-check.ts";
import { createCleanup } from "./cleanup.ts";
import { createClientAddress } from "./client-ip.ts";
import { createLogger, type Logger } from "./logger.ts";
import { createMailer, type Mailer } from "./mailer.ts";
import { createSessionStore } from "./sessions.ts";
import { createThrottle } from "./throttle.ts";

export interface IdentityOptions {
  config: IdentityConfig;
  clock?: () => Date;
  logger?: Logger;
  botCheck?: BotCheck;
  mailer?: Mailer;
  probes?: Partial<Probes>;
}

export interface Identity {
  app: Hono;
  /** Removes the stale unconfirmed accounts now (IDN-F-31); returns how many. */
  runCleanup(): Promise<number>;
  /** Starts the hourly clean-up. */
  startCleanup(): void;
  /** Resolves when the e-mails of the requests answered so far have been handed on or failed. */
  settled(): Promise<void>;
  /** Stops the clean-up, waits for the e-mails still being sent, and closes the connections. */
  close(): Promise<void>;
}

export async function createIdentity(
  options: IdentityOptions,
): Promise<Identity> {
  const { config } = options;
  const clock = options.clock ?? (() => new Date());
  const logger = options.logger ?? createLogger();

  // IDN-E-10: the session store has 1 second to answer.
  const redis = new Redis(config.REDIS_URL, {
    commandTimeout: 1000,
    maxRetriesPerRequest: 1,
  });
  redis.on("error", (error) => {
    logger.warn("session store connection failed", { error });
  });

  const auth = await createAuthCore({
    databaseUrl: config.DATABASE_URL,
    secret: config.IDENTITY_AUTH_SECRET,
    publicOrigin: config.PUBLIC_ORIGIN,
    logger,
  });
  const cleanup = createCleanup(auth, config, clock, logger);
  const afterAnswer = createAfterAnswer(logger);

  const app = createApp({
    config,
    auth,
    sessions: createSessionStore(redis, config),
    throttle: createThrottle(redis, config),
    botCheck:
      options.botCheck ?? createBotCheck({ secret: config.CAPTCHA_SECRET_KEY }),
    mailer: options.mailer ?? createMailer(config, logger),
    afterAnswer,
    logger,
    clock,
    clientAddress: createClientAddress(config.TRUSTED_PROXY, {
      onResolveError: (error) =>
        logger.error("TRUSTED_PROXY does not resolve", { error }),
    }),
    probes: {
      database: options.probes?.database ?? (() => auth.checkDatabase()),
      sessionStore:
        options.probes?.sessionStore ??
        (async () => {
          await redis.ping();
        }),
    },
  });

  let closed = false;
  return {
    app,
    runCleanup: () => cleanup.run(),
    startCleanup: () => cleanup.start(),
    settled: () => afterAnswer.settled(),
    async close() {
      if (closed) return;
      closed = true;
      cleanup.stop();
      try {
        await afterAnswer.settled();
      } finally {
        redis.disconnect();
        await auth.close();
      }
    },
  };
}
