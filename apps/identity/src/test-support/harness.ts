// The seams of gam-ai-knowledge/concepts/identity.md §16 "Design for Testability": `identity`
// started with the test database, the test Redis, a recording SMTP stub, a bot-check stub, and a
// clock the test sets. Requests go straight into the Hono app, so no port is needed.
import { randomInt } from "node:crypto";
import { type IdentityConfig, loadIdentityConfig } from "@stash/contracts";
import type { BotCheck } from "../bot-check.ts";
import { createIdentity, type Identity } from "../identity.ts";
import { createLogger } from "../logger.ts";
import type { Mailer } from "../mailer.ts";
import { createTestDatabase, redisUrl, type TestDatabase } from "./database.ts";
import { type SmtpStub, startSmtpStub } from "./smtp-stub.ts";

export const password = "Drei-blaue-Wolken-7";

/** The address of the reverse proxy in the tests (TRUSTED_PROXY, Q352). */
export const proxyAddress = "192.0.2.1";

/** A connection as @hono/node-server describes it, so the app sees the peer (Q352). */
export function connectionFrom(peer: string) {
  return { incoming: { socket: { remoteAddress: peer } } };
}

export interface Stack {
  database: TestDatabase;
  smtp: SmtpStub;
  /** Every `identity` started on this stack; `stop` closes the ones the test left open. */
  started: Running[];
  stop(): Promise<void>;
}

/** The database and the SMTP stub of one test file. */
export async function startStack(): Promise<Stack> {
  const database = await createTestDatabase();
  const smtp = await startSmtpStub();
  const started: Running[] = [];
  return {
    database,
    smtp,
    started,
    async stop() {
      // Closing twice is harmless, so a test may close its instance itself.
      for (const running of started) await running.close();
      await smtp.close();
      await database.drop();
    },
  };
}

export interface Reply {
  status: number;
  headers: Headers;
  /** The parsed JSON body, or undefined for an empty one. */
  body: Record<string, unknown> | undefined;
  /** Milliseconds from the request to its answer (the answer, not what runs after it). */
  elapsedMs: number;
}

export interface RequestOptions {
  /** The client address the proxy would put into X-Forwarded-For; a fresh one by default. */
  ip?: string;
  /** The address of the connection; the reverse proxy by default. */
  peer?: string;
  language?: string;
  cookie?: string;
}

export interface Running {
  identity: Identity;
  config: IdentityConfig;
  /** Every line `identity` logged. */
  logs: string[];
  post(path: string, body: unknown, options?: RequestOptions): Promise<Reply>;
  get(path: string, options?: RequestOptions): Promise<Reply>;
  close(): Promise<void>;
}

export interface StartOptions {
  env?: Record<string, string>;
  clock?: () => Date;
  botCheck?: BotCheck;
  mailer?: Mailer;
  probes?: Parameters<typeof createIdentity>[0]["probes"];
}

export function randomIp(): string {
  return `10.${randomInt(1, 255)}.${randomInt(1, 255)}.${randomInt(1, 255)}`;
}

export async function startIdentity(
  stack: Stack,
  options: StartOptions = {},
): Promise<Running> {
  const loaded = loadIdentityConfig({
    DATABASE_URL: stack.database.url,
    REDIS_URL: redisUrl,
    IDENTITY_AUTH_SECRET: "0123456789abcdef0123456789abcdef",
    SMTP_HOST: "127.0.0.1",
    SMTP_PORT: String(stack.smtp.port),
    TRUSTED_PROXY: proxyAddress,
    ...options.env,
  });
  if (!loaded.ok) throw new Error(JSON.stringify(loaded.problems));
  const logs: string[] = [];
  const identity = await createIdentity({
    config: loaded.config,
    clock: options.clock,
    botCheck: options.botCheck,
    mailer: options.mailer,
    probes: options.probes,
    logger: createLogger((line: string) => logs.push(line)),
  });

  async function send(
    method: "GET" | "POST",
    path: string,
    body: unknown,
    requestOptions: RequestOptions,
  ): Promise<Reply> {
    const headers: Record<string, string> = {
      "x-forwarded-for": requestOptions.ip ?? randomIp(),
    };
    if (body !== undefined) headers["content-type"] = "application/json";
    if (requestOptions.language)
      headers["accept-language"] = requestOptions.language;
    if (requestOptions.cookie) headers.cookie = requestOptions.cookie;
    const started = performance.now();
    const connection = connectionFrom(requestOptions.peer ?? proxyAddress);
    const response = await identity.app.request(
      path,
      {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        redirect: "manual",
      },
      connection,
    );
    const elapsedMs = performance.now() - started;
    const text = await response.text();
    // The e-mails go out after the answer. With the real mailer the test reads them from the SMTP
    // stub right after the request, so wait for them; a test with its own mailer waits itself.
    if (!options.mailer) await identity.settled();
    let parsed: Record<string, unknown> | undefined;
    try {
      parsed = text ? (JSON.parse(text) as Record<string, unknown>) : undefined;
    } catch {
      parsed = undefined;
    }
    return {
      status: response.status,
      headers: response.headers,
      body: parsed,
      elapsedMs,
    };
  }

  const running: Running = {
    identity,
    config: loaded.config,
    logs,
    post: (path, body, requestOptions = {}) =>
      send("POST", path, body, requestOptions),
    get: (path, requestOptions = {}) =>
      send("GET", path, undefined, requestOptions),
    close: () => identity.close(),
  };
  stack.started.push(running);
  return running;
}

/** A bot-check stub that answers yes or no and counts its calls (IDN-T-5). */
export function botCheckStub(answer: boolean): BotCheck & { calls: number } {
  const stub = {
    calls: 0,
    async verify() {
      stub.calls += 1;
      return answer;
    },
  };
  return stub;
}

/** The token of the confirmation link in the text of an e-mail. */
export function confirmationToken(text: string): string {
  const match = /\/api\/identity\/confirm\?token=([\w-]+)/.exec(text);
  if (!match?.[1]) throw new Error(`no confirmation link in: ${text}`);
  return match[1];
}

export function registration(
  email: string,
  overrides: Record<string, unknown> = {},
) {
  return { name: "Ada", email, password, ...overrides };
}

/** A new address under example.org, so tests never share accounts. */
export function address(prefix = "ada"): string {
  return `${prefix}-${randomInt(1_000_000_000)}@example.org`;
}

/** Registers the address and opens its confirmation link, so it can log in. */
export async function confirmedAccount(
  stack: Stack,
  running: Running,
  email: string,
): Promise<void> {
  await running.post("/register", registration(email));
  const token = confirmationToken(stack.smtp.to(email).at(-1)?.text ?? "");
  const reply = await running.get(`/confirm?token=${token}`);
  if (reply.headers.get("location") !== "/login?confirmed=1") {
    throw new Error(
      `confirmation failed: ${reply.status} ${reply.headers.get("location")}`,
    );
  }
}

/** The value of the session cookie a reply sets, or undefined. */
export function sessionToken(reply: Reply): string | undefined {
  return /stash_session=([\w-]*)/.exec(
    reply.headers.get("set-cookie") ?? "",
  )?.[1];
}
