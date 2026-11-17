// SCF-E-1 / SCF-T-11: `identity` started with an invalid configuration prints one line per
// invalid variable, never its value, and does not accept requests. Needs no database.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
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
});
