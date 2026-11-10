/** The configuration of the unit `web` (M1 of `gam-ai-knowledge/concepts/scaffolding.track-web.md`). */
export interface WebConfig {
  PORT: number;
  APP_VERSION: string;
  HEALTH_TIMEOUT_MS: number;
  IDENTITY_HEALTH_URL: string;
  STORAGE_HEALTH_URL: string;
  WORKER_HEALTH_URL: string;
  CMS_HEALTH_URL: string;
  OPENAPI_FILE: string;
}

/** One invalid variable; it names the variable and the reason, never the value (SCF-NF-4). */
export interface ConfigProblem {
  name: keyof WebConfig;
  reason: string;
}

export type WebConfigResult =
  | { ok: true; config: WebConfig }
  | { ok: false; problems: ConfigProblem[] };

type Parse<T> = (value: string) => T | undefined;

interface Rule<T> {
  fallback: T;
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

function text(min: number, max: number): Parse<string> {
  return (value) =>
    value.length >= min && value.length <= max ? value : undefined;
}

const httpUrl: Parse<string> = (value) => {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:" ? value : undefined;
  } catch {
    return undefined;
  }
};

function url(fallback: string): Rule<string> {
  return { fallback, parse: httpUrl, reason: "expected an http or https URL" };
}

const rules: { [K in keyof WebConfig]: Rule<WebConfig[K]> } = {
  PORT: {
    fallback: 3000,
    parse: integer(1, 65535),
    reason: "expected an integer between 1 and 65535",
  },
  APP_VERSION: {
    fallback: "0.0.0-dev",
    parse: text(1, 64),
    reason: "expected 1 to 64 characters",
  },
  HEALTH_TIMEOUT_MS: {
    fallback: 2000,
    parse: integer(1, 60000),
    reason: "expected an integer between 1 and 60000",
  },
  IDENTITY_HEALTH_URL: url("http://identity:3001/health"),
  STORAGE_HEALTH_URL: url("http://storage:3002/health"),
  WORKER_HEALTH_URL: url("http://worker:3003/health"),
  CMS_HEALTH_URL: url("http://cms:1337/health"),
  OPENAPI_FILE: {
    fallback: "../../packages/contracts/dist/openapi.json",
    parse: text(1, 512),
    reason: "expected 1 to 512 characters",
  },
};

export type WebConfigValueResult<K extends keyof WebConfig> =
  | { ok: true; value: WebConfig[K] }
  | { ok: false; problem: ConfigProblem };

/**
 * Reads one variable of `web` and checks only that one, so a handler that needs a single value
 * is not broken by an invalid other one; the whole check is made at startup (M7, SCF-F-11).
 */
export function loadWebConfigValue<K extends keyof WebConfig>(
  environment: Readonly<Record<string, string | undefined>>,
  name: K,
): WebConfigValueResult<K> {
  const rule: Rule<WebConfig[K]> = rules[name];
  const value = environment[name];
  if (value === undefined || value === "")
    return { ok: true, value: rule.fallback };
  const parsed = rule.parse(value);
  return parsed === undefined
    ? { ok: false, problem: { name, reason: rule.reason } }
    : { ok: true, value: parsed };
}

/**
 * Reads the configuration of `web` from the environment (SCF-F-11, SCF-F-17). A variable that
 * is missing or empty takes its default. Local stand-in for the configuration helper of the
 * contracts core, with the same signature; it is replaced when that helper is merged.
 */
export function loadWebConfig(
  environment: Readonly<Record<string, string | undefined>>,
): WebConfigResult {
  const config: Partial<Record<keyof WebConfig, unknown>> = {};
  const problems: ConfigProblem[] = [];
  for (const name of Object.keys(rules) as (keyof WebConfig)[]) {
    const result = loadWebConfigValue(environment, name);
    if (result.ok) config[name] = result.value;
    else problems.push(result.problem);
  }
  return problems.length > 0
    ? { ok: false, problems }
    : { ok: true, config: config as WebConfig };
}
