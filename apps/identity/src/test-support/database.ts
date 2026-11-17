// A throwaway PostgreSQL database for one test file: created empty on the server named by
// TEST_DATABASE_URL, migrated with the command of the migrating container (SCF-F-26), dropped
// afterwards. Tests that need it are skipped while TEST_DATABASE_URL or TEST_REDIS_URL is unset;
// the CI job `test` sets both (.gitlab-ci.yml).
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const dbPackage = fileURLToPath(
  new URL("../../../../packages/db/", import.meta.url),
);

export const adminUrl = process.env.TEST_DATABASE_URL;
export const redisUrl = process.env.TEST_REDIS_URL;

/** The `skip` option of a `describe`: why the tests cannot run here, or false. */
export const skip: string | false = !adminUrl
  ? "TEST_DATABASE_URL is not set"
  : !redisUrl
    ? "TEST_REDIS_URL is not set"
    : false;

/** The `skip` option of a `describe` that needs only the Redis. */
export const skipRedis: string | false = !redisUrl
  ? "TEST_REDIS_URL is not set"
  : false;

const prismaCli = join(
  dirname(
    createRequire(join(dbPackage, "package.json")).resolve(
      "prisma/package.json",
    ),
  ),
  "dist",
  "prisma.js",
);

function prisma(url: string, ...args: string[]) {
  const run = spawnSync(
    process.execPath,
    [prismaCli, ...args, "--format", "human"],
    {
      cwd: dbPackage,
      encoding: "utf8",
      env: {
        ...process.env,
        DATABASE_URL: url,
        CI: "1",
        PRISMA_DISABLE_TELEMETRY: "1",
      },
      timeout: 120_000,
    },
  );
  return { status: run.status, output: `${run.stdout}${run.stderr}` };
}

/** Runs the script `migrate` of packages/db, split at `&&` like the shell does. */
function migrate(url: string): void {
  const scripts = (
    JSON.parse(readFileSync(join(dbPackage, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    }
  ).scripts;
  for (const command of (scripts.migrate ?? "").split("&&")) {
    const [, ...args] = command.trim().split(/\s+/);
    const run = prisma(url, ...args);
    assert.equal(run.status, 0, run.output);
  }
}

export interface TestDatabase {
  url: string;
  /** Plain SQL on the test database, for reading what `identity` stored and for set-up. */
  query<R extends pg.QueryResultRow>(
    sql: string,
    params?: unknown[],
  ): Promise<R[]>;
  drop(): Promise<void>;
}

export async function createTestDatabase(): Promise<TestDatabase> {
  const name = `stash_test_${randomBytes(6).toString("hex")}`;
  const admin = new pg.Client({ connectionString: adminUrl });
  await admin.connect();
  try {
    await admin.query(`CREATE DATABASE ${name}`);
  } finally {
    await admin.end();
  }
  const url = new URL(adminUrl ?? "postgresql://localhost");
  url.pathname = `/${name}`;
  migrate(url.toString());
  const pool = new pg.Pool({ connectionString: url.toString(), max: 2 });
  return {
    url: url.toString(),
    async query<R extends pg.QueryResultRow>(
      sql: string,
      params: unknown[] = [],
    ) {
      return (await pool.query<R>(sql, params)).rows;
    },
    async drop() {
      await pool.end();
      const client = new pg.Client({ connectionString: adminUrl });
      await client.connect();
      try {
        await client.query(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`);
      } finally {
        await client.end();
      }
    },
  };
}
