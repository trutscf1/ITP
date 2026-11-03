import { readFileSync } from "node:fs";
import {
  InvalidConfigurationError,
  loadTelemetryConfig,
  startTelemetry,
  type Telemetry,
  type TelemetryOptions,
} from "@stash/telemetry";

/** Version of the unit: the version of this package (`apps/cms/package.json`), also next to `dist/`. */
export const unitVersion = (
  JSON.parse(
    readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  ) as { version: string }
).version;

/**
 * M11 UnitWiring for `cms` (documentation/concepts/observability.md §16, OBS-F-1, OBS-F-25):
 * reads the telemetry configuration from the environment, starts the telemetry of the unit
 * (`startTelemetry("cms", …)`), writes the start log entry `unit started`, and only then calls
 * `accept`, the code that accepts requests (the content management system).
 *
 * An invalid telemetry variable throws `InvalidConfigurationError` before anything is accepted
 * (OBS-E-7): the entry point treats it as SCF-E-1.
 */
export async function boot(
  environment: Readonly<Record<string, string | undefined>>,
  accept: (telemetry: Telemetry) => void | Promise<void>,
  options: Partial<TelemetryOptions> = {},
): Promise<Telemetry> {
  const loaded = loadTelemetryConfig(environment);
  if (!loaded.ok) throw new InvalidConfigurationError(loaded.problems);
  const telemetry = startTelemetry("cms", unitVersion, loaded.config, options);
  telemetry.log.info("unit started", {});
  try {
    await accept(telemetry);
  } catch (error) {
    // The start entry must reach the collector although the unit failed to start.
    await telemetry.shutdown();
    throw error;
  }
  return telemetry;
}
