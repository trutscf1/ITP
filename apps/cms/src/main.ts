import { InvalidConfigurationError } from "@stash/telemetry";
import { boot } from "./boot.ts";

// Process entry of the unit `cms` (`pnpm --filter @stash/cms start`). The telemetry starts
// first (M11 UnitWiring, OBS-F-1); the callback below is where the content management system
// starts to accept requests once the unit has one (#19). Until then the unit has no server and
// the process ends after the start entry, as the unit does not run as a container yet.
try {
  const telemetry = await boot(process.env, () => {
    // The content management system starts here.
  });
  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.once(signal, () => {
      void telemetry.shutdown().finally(() => process.exit(0));
    });
  }
} catch (error) {
  if (!(error instanceof InvalidConfigurationError)) throw error;
  // SCF-E-1: one line per invalid variable, name and reason, never the value; no request is accepted.
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
}
