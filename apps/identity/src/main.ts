// Entry point of the unit `identity`: checks the configuration (SCF-F-11, SCF-E-1), then serves
// the routes of app.ts on PORT and starts the hourly clean-up (IDN-F-31).
import { serve } from "@hono/node-server";
import { formatConfigProblems, loadIdentityConfig } from "@stash/contracts";
import { createIdentity } from "./identity.ts";
import { createLogger } from "./logger.ts";

async function main(): Promise<void> {
  const loaded = loadIdentityConfig(process.env);
  if (!loaded.ok) {
    process.stderr.write(
      `${formatConfigProblems("identity", loaded.problems)}\n`,
    );
    process.exitCode = 1;
    return;
  }
  const { config } = loaded;
  const logger = createLogger();
  const identity = await createIdentity({ config, logger });
  const server = serve(
    { fetch: identity.app.fetch, port: config.PORT, hostname: "0.0.0.0" },
    (info) => logger.info("identity listening", { port: info.port }),
  );
  identity.startCleanup();

  const stop = () => {
    server.close(() => {
      void identity.close().then(() => process.exit(0));
    });
  };
  process.on("SIGTERM", stop);
  process.on("SIGINT", stop);
}

await main();
