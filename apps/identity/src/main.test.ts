// SCF-E-1 / SCF-T-11: `identity` started with an invalid configuration prints one line per
// invalid variable, never its value, and does not accept requests. Needs no database.
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const main = fileURLToPath(new URL("./main.ts", import.meta.url));

describe("SCF-E-1 SCF-F-11 invalid configuration stops identity", () => {
  it("SCF-T-11 exits non-zero and names the variables without their values", () => {
    const run = spawnSync(process.execPath, [main], {
      encoding: "utf8",
      timeout: 20_000,
      env: {
        PATH: process.env.PATH,
        PORT: "abc",
        IDENTITY_AUTH_SECRET: "too-short-secret",
        REDIS_URL: "redis://localhost:6379",
        DATABASE_URL: "postgresql://localhost/none",
      },
    });
    assert.notEqual(run.status, 0);
    const output = `${run.stdout}${run.stderr}`;
    assert.match(output, /Invalid configuration for unit "identity":/);
    assert.match(
      output,
      /^ {2}PORT: expected an integer between 1 and 65535$/m,
    );
    assert.match(output, /^ {2}IDENTITY_AUTH_SECRET: /m);
    assert.doesNotMatch(output, /abc|too-short-secret/);
  });

  it("SCF-E-1 SCF-NF-4 exits non-zero with one redacted error line when the server cannot start", async () => {
    // The port is taken, so the server of identity cannot listen on it.
    const taken = createServer();
    await new Promise<void>((resolve) => taken.listen(0, "0.0.0.0", resolve));
    const address = taken.address();
    const port = typeof address === "object" && address ? address.port : 0;
    try {
      const run = spawn(process.execPath, [main], {
        env: {
          PATH: process.env.PATH,
          PORT: String(port),
          IDENTITY_AUTH_SECRET: "0123456789abcdef0123456789abcdef",
          REDIS_URL: "redis://:hunter2@127.0.0.1:1",
          DATABASE_URL: "postgresql://stash:hunter2@127.0.0.1:1/none",
        },
      });
      let output = "";
      run.stdout.on("data", (chunk: Buffer) => {
        output += chunk;
      });
      run.stderr.on("data", (chunk: Buffer) => {
        output += chunk;
      });
      const code = await new Promise<number | null>((resolve) => {
        const timer = setTimeout(() => {
          run.kill();
          resolve(null);
        }, 20_000);
        run.on("exit", (status) => {
          clearTimeout(timer);
          resolve(status);
        });
      });
      assert.notEqual(code, null, "identity kept running");
      assert.notEqual(code, 0);
      const entries = output
        .split("\n")
        .filter((line) => line.startsWith("{"))
        .map((line) => JSON.parse(line) as Record<string, unknown>);
      assert.ok(
        entries.some(
          (entry) =>
            entry.level === "error" && entry.msg === "identity failed to start",
        ),
        output,
      );
      assert.doesNotMatch(output, /hunter2/);
      assert.doesNotMatch(output, /\n\s+at /, "no stack trace");
    } finally {
      taken.close();
    }
  });
});
