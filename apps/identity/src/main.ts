// Entry point of the unit `identity`: checks the configuration (SCF-F-11, SCF-E-1), then serves
// the routes of app.ts on PORT and starts the hourly clean-up (IDN-F-31). A failure to start or
// to stop is logged through the redacting logger, without values or stack trace (SCF-NF-4), and
// ends the process with a non-zero exit code.
import { serve } from "@hono/node-server";
import { formatConfigProblems, loadIdentityConfig } from "@stash/contracts";
import { createIdentity, type Identity } from "./identity.ts";
import { createLogger } from "./logger.ts";

const logger = createLogger();

async function closeQuietly(identity: Identity | undefined): Promise<void> {
  try {
    await identity?.close();
  } catch (error) {
    logger.error("identity failed to stop", { error });
  }
}

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
  let identity: Identity | undefined;
  const failStart = async (error: unknown) => {
    logger.error("identity failed to start", { error });
    await closeQuietly(identity);
    process.exit(1);
  };

  try {
    identity = await createIdentity({ config, logger });
  } catch (error) {
    await failStart(error);
    return;
  }
  const running = identity;
  const server = serve(
    { fetch: running.app.fetch, port: config.PORT, hostname: "0.0.0.0" },
    (info) => {
      logger.info("identity listening", { port: info.port });
      running.startCleanup();
    },
  );
  // Listening fails asynchronously, for example when the port is taken.
  server.once("error", (error) => void failStart(error));

  const stop = () => {
    server.close(() => {
      running.close().then(
        () => process.exit(0),
        (error: unknown) => {
          logger.error("identity failed to stop", { error });
          process.exit(1);
        },
      );
    });
  };
  process.on("SIGTERM", stop);
  process.on("SIGINT", stop);
}

await main();
