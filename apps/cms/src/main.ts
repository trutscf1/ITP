import { fileURLToPath } from "node:url";
import { InvalidConfigurationError } from "@stash/telemetry";
import { createStrapi } from "@strapi/strapi";
import { boot } from "./boot.ts";

// Process entry of the unit `cms` (`pnpm --filter @stash/cms start`). The telemetry starts
// first (M11 UnitWiring, OBS-F-1); Strapi starts afterwards and accepts requests, among them
// GET /health. German is the default language of the content (PUB-F-5).
process.env.STRAPI_TELEMETRY_DISABLED ??= "true";
process.env.STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE ??= "de";
try {
  const telemetry = await boot(process.env, async () => {
    const appDir = fileURLToPath(new URL("..", import.meta.url));
    const strapi = createStrapi({
      appDir,
      distDir: fileURLToPath(new URL(".", import.meta.url)),
      autoReload: false,
      serveAdminPanel: false,
    });
    await strapi.load();
    await strapi.start();
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
