/**
 * The configuration of the unit `identity` (`gam-ai-knowledge/concepts/identity.md` §8,
 * "Configuration of `identity`"; SCF-F-11, SCF-F-17). Same shape and signature as the
 * configuration of `web`: a problem names the variable and the reason, never the value
 * (SCF-E-1, SCF-NF-4).
 */
export interface IdentityConfig {
  PORT: number;
  APP_VERSION: string;
  HEALTH_CHECK_TIMEOUT_MS: number;
  DATABASE_URL: string;
  PUBLIC_ORIGIN: string;
  IDENTITY_AUTH_SECRET: string;
  REDIS_URL: string;
  REGISTRATION_ENABLED: boolean;
  CONFIRMATION_LINK_TTL_HOURS: number;
  UNCONFIRMED_ACCOUNT_TTL_DAYS: number;
  RESET_LINK_TTL_MINUTES: number;
  SESSION_TTL_DAYS: number;
  LOGIN_MAX_FAILURES: number;
  LOGIN_FAILURE_WINDOW_SECONDS: number;
  LOGIN_LOCK_MINUTES: number;
  REQUEST_LIMIT_PER_MINUTE: number;
  CAPTCHA_ENABLED: boolean;
  CAPTCHA_SITE_KEY: string;
  CAPTCHA_SECRET_KEY: string;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_FROM: string;
  SESSION_CHECK_TIMEOUT_MS: number;
}

export interface IdentityConfigProblem {
  name: keyof IdentityConfig;
  reason: string;
}

export type IdentityConfigResult =
  | { ok: true; config: IdentityConfig }
  | { ok: false; problems: IdentityConfigProblem[] };

type Parse<T> = (value: string) => T | undefined;

/** A variable without a default is required: `fallback` is then undefined. */
interface Rule<T> {
  fallback: T | undefined;
  parse: Parse<T>;
  reason: string;
}

function integer(min: number, max: number): Parse<number> {
  return (value) => {
    if (!/^\d+$/.test(value)) return undefined;
    const number = Number(value);
    return number >= min && number <= max ? number : undefined;
  };
}

function range(fallback: number, min: number, max: number): Rule<number> {
  return {
    fallback,
    parse: integer(min, max),
    reason: `expected an integer between ${min} and ${max}`,
  };
}

function text(min: number, max: number): Parse<string> {
  return (value) =>
    value.length >= min && value.length <= max ? value : undefined;
}

function urlWith(protocols: string[]): Parse<string> {
  return (value) => {
    try {
      return protocols.includes(new URL(value).protocol) ? value : undefined;
    } catch {
      return undefined;
    }
  };
}

const origin: Parse<string> = (value) => {
  const parsed = urlWith(["http:", "https:"])(value);
  return parsed === undefined ? undefined : parsed.replace(/\/+$/, "");
};

const boolean: Parse<boolean> = (value) =>
  value === "true" ? true : value === "false" ? false : undefined;

const emailAddress: Parse<string> = (value) =>
  value.length <= 254 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)
    ? value
    : undefined;

const rules: { [K in keyof IdentityConfig]: Rule<IdentityConfig[K]> } = {
  PORT: range(3001, 1, 65535),
  APP_VERSION: {
    fallback: "0.0.0-dev",
    parse: text(1, 64),
    reason: "expected 1 to 64 characters",
  },
  HEALTH_CHECK_TIMEOUT_MS: range(1000, 1, 60000),
  DATABASE_URL: {
    fallback: undefined,
    parse: urlWith(["postgres:", "postgresql:"]),
    reason: "expected a postgresql:// URL",
  },
  PUBLIC_ORIGIN: {
    fallback: "http://localhost:8080",
    parse: origin,
    reason: "expected an absolute http or https URL",
  },
  IDENTITY_AUTH_SECRET: {
    fallback: undefined,
    parse: text(32, 4096),
    reason: "expected at least 32 characters",
  },
  REDIS_URL: {
    fallback: undefined,
    parse: urlWith(["redis:"]),
    reason: "expected a redis:// URL",
  },
  REGISTRATION_ENABLED: {
    fallback: true,
    parse: boolean,
    reason: "expected true or false",
  },
  CONFIRMATION_LINK_TTL_HOURS: range(24, 1, 168),
  UNCONFIRMED_ACCOUNT_TTL_DAYS: range(7, 1, 90),
  RESET_LINK_TTL_MINUTES: range(30, 5, 1440),
  SESSION_TTL_DAYS: range(7, 1, 90),
  LOGIN_MAX_FAILURES: range(5, 3, 20),
  LOGIN_FAILURE_WINDOW_SECONDS: range(60, 10, 3600),
  LOGIN_LOCK_MINUTES: range(15, 1, 1440),
  REQUEST_LIMIT_PER_MINUTE: range(5, 1, 100),
  CAPTCHA_ENABLED: {
    fallback: false,
    parse: boolean,
    reason: "expected true or false",
  },
  CAPTCHA_SITE_KEY: {
    fallback: "",
    parse: text(1, 512),
    reason: "expected 1 to 512 characters",
  },
  CAPTCHA_SECRET_KEY: {
    fallback: "",
    parse: text(1, 512),
    reason: "expected 1 to 512 characters",
  },
  SMTP_HOST: {
    fallback: "mailpit",
    parse: text(1, 255),
    reason: "expected 1 to 255 characters",
  },
  SMTP_PORT: range(1025, 1, 65535),
  SMTP_FROM: {
    fallback: "no-reply@stash.local",
    parse: emailAddress,
    reason: "expected an e-mail address",
  },
  SESSION_CHECK_TIMEOUT_MS: range(1000, 100, 5000),
};

/**
 * Reads the configuration of `identity` from the environment. A variable that is missing or
 * empty takes its default; the three without a default are required, and the bot-check keys
 * are required while `CAPTCHA_ENABLED` is true (IDN-F-5).
 */
export function loadIdentityConfig(
  environment: Readonly<Record<string, string | undefined>>,
): IdentityConfigResult {
  const config: Partial<Record<keyof IdentityConfig, unknown>> = {};
  const problems: IdentityConfigProblem[] = [];
  for (const name of Object.keys(rules) as (keyof IdentityConfig)[]) {
    const rule: Rule<unknown> = rules[name];
    const value = environment[name];
    if (value === undefined || value === "") {
      if (rule.fallback === undefined) {
        problems.push({ name, reason: "required, but not set" });
      } else {
        config[name] = rule.fallback;
      }
      continue;
    }
    const parsed = rule.parse(value);
    if (parsed === undefined) problems.push({ name, reason: rule.reason });
    else config[name] = parsed;
  }
  if (config.CAPTCHA_ENABLED === true) {
    for (const name of ["CAPTCHA_SITE_KEY", "CAPTCHA_SECRET_KEY"] as const) {
      if (config[name] === "") {
        problems.push({
          name,
          reason: "required while CAPTCHA_ENABLED is true",
        });
      }
    }
  }
  return problems.length > 0
    ? { ok: false, problems }
    : { ok: true, config: config as IdentityConfig };
}

/** The output of SCF-E-1 (scaffolding.md §10, example 3): one line per invalid variable. */
export function formatConfigProblems(
  unit: string,
  problems: readonly { name: string; reason: string }[],
): string {
  return [
    `Invalid configuration for unit "${unit}":`,
    ...problems.map((problem) => `  ${problem.name}: ${problem.reason}`),
  ].join("\n");
}
