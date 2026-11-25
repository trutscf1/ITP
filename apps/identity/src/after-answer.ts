// Work that runs after the answer of a request, such as the e-mails of IDN-F-6 and IDN-E-5: the
// request does not wait for the SMTP host (IDN-E-11), a failure is logged and never reaches the
// person, and `close` waits for what is still running so no e-mail is lost at shutdown.
import type { Logger } from "./logger.ts";

export interface AfterAnswer {
  /** Runs `task` once the current request has been answered. */
  run(kind: string, task: () => Promise<unknown>): void;
  /** Resolves when every task started so far has ended. */
  settled(): Promise<void>;
}

export function createAfterAnswer(logger: Logger): AfterAnswer {
  const running = new Set<Promise<void>>();
  return {
    run(kind, task) {
      const done: Promise<void> = new Promise<void>((resolve) =>
        setImmediate(resolve),
      )
        .then(task)
        .then(
          () => undefined,
          (error: unknown) => {
            logger.error("work after the answer failed", { kind, error });
          },
        )
        .finally(() => {
          running.delete(done);
        });
      running.add(done);
    },
    async settled() {
      while (running.size > 0) await Promise.all(running);
    },
  };
}
