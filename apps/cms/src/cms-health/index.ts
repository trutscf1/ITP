import type { DependencyCheck, HealthReport } from "@stash/contracts";

/**
 * Module cms-health (`gam-ai-knowledge/concepts/public-content.md` §16, PUB-F-9, PUB-F-31). Slice 1
 * of PUB-US-1 holds the essential check `content-store`; the check `administrator-account` joins
 * with slice 2 (PUB-AC-1.7).
 */

/** What asks the content store a question; resolves when it answers, rejects when it cannot. */
export type ContentStoreProbe = () => Promise<unknown>;

export interface HealthOptions {
  /** The release version of the build (`0.0.0-dev` for local builds). */
  version: string;
  /** The time a check may take before it counts as `down` (HEALTH_CHECK_TIMEOUT_MS, SCF-NF-3). */
  timeoutMs: number;
}

/** The default of `HEALTH_CHECK_TIMEOUT_MS` (SCF-NF-3). */
export const defaultHealthCheckTimeoutMs = 1000;

/**
 * The time one check may take, from the environment. An unset or empty value takes the default; a
 * value that is not an integer from 100 to 30000 is refused naming the variable, never its value.
 */
export function loadHealthCheckTimeoutMs(
  environment: Readonly<Record<string, string | undefined>>,
): number {
  const raw = environment.HEALTH_CHECK_TIMEOUT_MS;
  if (raw === undefined || raw.trim() === "") {
    return defaultHealthCheckTimeoutMs;
  }
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 100 || value > 30000) {
    throw new Error(
      "HEALTH_CHECK_TIMEOUT_MS: must be an integer from 100 to 30000",
    );
  }
  return value;
}

/** A check is `ok` when the probe answers within the timeout, otherwise `down` (SCF-E-2). */
async function runCheck(
  name: string,
  essential: boolean,
  probe: ContentStoreProbe,
  timeoutMs: number,
): Promise<DependencyCheck> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<"timeout">((resolve) => {
    timer = setTimeout(() => resolve("timeout"), timeoutMs);
  });
  try {
    const outcome = await Promise.race([
      probe().then(() => "answered" as const),
      timeout,
    ]);
    return {
      name,
      essential,
      status: outcome === "answered" ? "ok" : "down",
    };
  } catch {
    return { name, essential, status: "down" };
  } finally {
    clearTimeout(timer);
  }
}

/** The status by SCF-F-6: ok, degraded (only non-essential checks down), or down. */
function statusOf(checks: DependencyCheck[]): HealthReport["status"] {
  if (checks.some((check) => check.essential && check.status === "down")) {
    return "down";
  }
  return checks.some((check) => check.status === "down") ? "degraded" : "ok";
}

/**
 * The health report of `cms`. It holds the unit, the version, the status, and the names of the
 * checks, never a host, a port, a credential, or a version of a dependency (PUB-F-31, SCF-NF-4).
 */
export async function health(
  probeContentStore: ContentStoreProbe,
  options: HealthOptions,
): Promise<HealthReport> {
  const checks = [
    await runCheck("content-store", true, probeContentStore, options.timeoutMs),
  ];
  return {
    unit: "cms",
    version: options.version,
    status: statusOf(checks),
    checks,
  };
}
