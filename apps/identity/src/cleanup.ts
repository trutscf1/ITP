// M7 Cleanup (gam-ai-knowledge/concepts/identity.md §16, IDN-F-31): the hourly removal of
// accounts that stayed unconfirmed for more than UNCONFIRMED_ACCOUNT_TTL_DAYS days.
import type { IdentityConfig } from "@stash/contracts";
import type { AuthCore } from "./auth-core.ts";
import type { Logger } from "./logger.ts";

const hour = 3_600_000;
const day = 86_400_000;

export interface Cleanup {
  /** Removes the stale accounts now; returns how many were removed. */
  run(): Promise<number>;
  /** Runs once now and then every hour, until `stop`. */
  start(): void;
  stop(): void;
}

export function createCleanup(
  auth: AuthCore,
  config: Pick<IdentityConfig, "UNCONFIRMED_ACCOUNT_TTL_DAYS">,
  clock: () => Date,
  logger: Logger,
): Cleanup {
  let timer: NodeJS.Timeout | undefined;

  async function run(): Promise<number> {
    const before = new Date(
      clock().getTime() - config.UNCONFIRMED_ACCOUNT_TTL_DAYS * day,
    );
    const removed = await auth.removeUnconfirmed(before);
    if (removed > 0) {
      logger.info("unconfirmed accounts removed", { count: removed });
    }
    return removed;
  }

  async function runLogged(): Promise<void> {
    try {
      await run();
    } catch (error) {
      logger.error("clean-up of unconfirmed accounts failed", { error });
    }
  }

  return {
    run,
    start() {
      if (timer) return;
      void runLogged();
      timer = setInterval(() => void runLogged(), hour);
      timer.unref();
    },
    stop() {
      if (timer) clearInterval(timer);
      timer = undefined;
    },
  };
}
