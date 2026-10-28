/** The configuration of the unit `web` (M1 of `documentation/concepts/scaffolding.track-web.md`). */
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

type Read<T> = (value: string) => T | undefined;

interface Rule<T> {
  fallback: T;
  read: Read<T>;
  reason: string;
}

function integer(min: number, max: number): Read<number> {
  return (value) => {
    if (!/^\d+$/.test(value)) return undefined;
    const number = Number(value);
    return number >= min && number <= max ? number : undefined;
  };
}

function text(min: number, max: number): Read<string> {
  return (value) =>
    value.length >= min && value.length <= max ? value : undefined;
}

const httpUrl: Read<string> = (value) => {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:" ? value : undefined;
  } catch {
    return undefined;
  }
};

const urlReason = "expected an http or https URL";

const rules: { [K in keyof WebConfig]: Rule<WebConfig[K]> } = {
  PORT: {
    fallback: 3000,
    read: integer(1, 65535),
    reason: "expected an integer between 1 and 65535",
  },
  APP_VERSION: {
    fallback: "0.0.0-dev",
    read: text(1, 64),
    reason: "expected 1 to 64 characters",
  },
  HEALTH_TIMEOUT_MS: {
    fallback: 2000,
    read: integer(1, 60000),
    reason: "expected an integer between 1 and 60000",
  },
  IDENTITY_HEALTH_URL: {
    fallback: "http://identity:3001/health",
    read: httpUrl,
    reason: urlReason,
  },
  STORAGE_HEALTH_URL: {
    fallback: "http://storage:3002/health",
    read: httpUrl,
    reason: urlReason,
  },
  WORKER_HEALTH_URL: {
    fallback: "http://worker:3003/health",
    read: httpUrl,
    reason: urlReason,
  },
  CMS_HEALTH_URL: {
    fallback: "http://cms:1337/health",
    read: httpUrl,
    reason: urlReason,
  },
  OPENAPI_FILE: {
    fallback: "../../packages/contracts/dist/openapi.json",
    read: text(1, 512),
    reason: "expected 1 to 512 characters",
  },
};

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
    const rule: Rule<unknown> = rules[name];
    const value = environment[name];
    if (value === undefined || value === "") {
      config[name] = rule.fallback;
      continue;
    }
    const parsed = rule.read(value);
    if (parsed === undefined) problems.push({ name, reason: rule.reason });
    else config[name] = parsed;
  }
  return problems.length > 0
    ? { ok: false, problems }
    : { ok: true, config: config as WebConfig };
}
