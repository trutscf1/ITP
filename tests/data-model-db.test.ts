// Acceptance tests of SCF-US-4 that run against a PostgreSQL server
// (documentation/concepts/scaffolding.md §17, SCF-T-19 to SCF-T-22). TEST_DATABASE_URL names a
// database on that server whose user may create databases; every test works in a database of
// its own that is created empty and dropped afterwards. Without the variable the tests are
// skipped; the CI job `test` sets it.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { after, describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { seed } from "@stash/db/seed";
import { seedData } from "@stash/db/seed-data";
import pg from "pg";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dbPackage = join(root, "packages", "db");
const adminUrl = process.env.TEST_DATABASE_URL;
const skip = adminUrl ? false : "TEST_DATABASE_URL is not set";

const prismaCli = join(
  dirname(
    createRequire(join(dbPackage, "package.json")).resolve(
      "prisma/package.json",
    ),
  ),
  "dist",
  "prisma.js",
);

/** Runs the Prisma CLI of packages/db against one database. */
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

/** The command of the migrating service (`migrate`), split at `&&` like the shell does. */
function migrate(url: string) {
  const scripts = (
    JSON.parse(readFileSync(join(dbPackage, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    }
  ).scripts;
  let output = "";
  for (const command of (scripts.migrate ?? "").split("&&")) {
    const [, ...args] = command.trim().split(/\s+/);
    const run = prisma(url, ...args);
    output += run.output;
    if (run.status !== 0) return { status: run.status, output };
  }
  return { status: 0, output };
}

const created: string[] = [];

function urlOf(database: string): string {
  const url = new URL(adminUrl ?? "postgresql://localhost");
  url.pathname = `/${database}`;
  return url.toString();
}

async function admin<T>(work: (client: pg.Client) => Promise<T>): Promise<T> {
  const client = new pg.Client({ connectionString: adminUrl });
  await client.connect();
  try {
    return await work(client);
  } finally {
    await client.end();
  }
}

async function emptyDatabase(): Promise<string> {
  const name = `stash_test_${randomBytes(6).toString("hex")}`;
  await admin((c) => c.query(`CREATE DATABASE ${name}`));
  created.push(name);
  return urlOf(name);
}

async function query<R extends pg.QueryResultRow>(
  url: string,
  sql: string,
  params: unknown[] = [],
): Promise<R[]> {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    return (await client.query<R>(sql, params)).rows;
  } finally {
    await client.end();
  }
}

async function migratedDatabase(): Promise<string> {
  const url = await emptyDatabase();
  const run = migrate(url);
  assert.equal(run.status, 0, run.output);
  return url;
}

after(async () => {
  if (!adminUrl) return;
  for (const name of created) {
    await admin((c) => c.query(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`));
  }
});

describe("SCF-AC-4.2 Schema matches diagram", { skip }, () => {
  it("SCF-T-19 the migrations applied to an empty database match the schema definition [SCF-F-23]", async () => {
    const url = await migratedDatabase();
    const verify = prisma(url, "db", "verify", "--strict");
    assert.equal(verify.status, 0, verify.output);
    const tables = await query<{ table_name: string }>(
      url,
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
    );
    const contract = JSON.parse(
      readFileSync(join(dbPackage, "src", "prisma", "contract.json"), "utf8"),
    ) as {
      storage: { namespaces: { public: { entries: { table: object } } } };
    };
    assert.deepEqual(
      tables.map((t) => t.table_name),
      Object.keys(contract.storage.namespaces.public.entries.table).sort(),
    );
  });
});

describe("SCF-AC-4.3 Own users table", { skip }, () => {
  it("SCF-T-20 creating an auth user creates exactly one row in users, and deleting it removes the row [SCF-F-24]", async () => {
    const url = await migratedDatabase();
    // The insert the authentication library performs when it creates a user.
    await query(
      url,
      "INSERT INTO auth_users (id, name, email) VALUES ('auth-1', 'Ada', 'ada@example.test')",
    );
    const rows = await query<{ auth_user_id: string }>(
      url,
      "SELECT auth_user_id FROM users",
    );
    assert.deepEqual(rows, [{ auth_user_id: "auth-1" }]);

    await assert.rejects(
      query(url, "INSERT INTO users (auth_user_id) VALUES ('auth-1')"),
      /users_auth_user_id_key/,
      "a second users row for the same auth user was accepted",
    );

    await query(url, "DELETE FROM auth_users WHERE id = 'auth-1'");
    assert.deepEqual(await query(url, "SELECT id FROM users"), []);
  });
});

describe("SCF-AC-4.4 Seed data", { skip }, () => {
  it("SCF-T-21 the seed command creates a user, a team, and a folder, and a second run adds nothing [SCF-F-25]", async () => {
    const url = await migratedDatabase();
    await seed(url);
    await seed(url);
    const counts = await query<{
      users: string;
      teams: string;
      members: string;
      folders: string;
    }>(
      url,
      `SELECT (SELECT count(*) FROM users) AS users, (SELECT count(*) FROM teams) AS teams,
              (SELECT count(*) FROM team_members WHERE role = 'owner') AS members,
              (SELECT count(*) FROM folders) AS folders`,
    );
    assert.deepEqual(counts, [
      { users: "1", teams: "1", members: "1", folders: "2" },
    ]);
    const folder = await query<{ name: string; parent: string }>(
      url,
      "SELECT f.name, p.name AS parent FROM folders f JOIN folders p ON p.id = f.parent_id",
    );
    assert.deepEqual(folder, [
      { name: seedData.folder.name, parent: seedData.rootFolder.name },
    ]);
  });
});

describe("SCF-AC-4.5 Migrations at start", { skip }, () => {
  it("SCF-T-22 the command of the migrating service applies every migration to an empty database [SCF-F-26]", async () => {
    const url = await emptyDatabase();
    const run = migrate(url);
    assert.equal(run.status, 0, run.output);
    const status = prisma(url, "db", "verify");
    assert.equal(status.status, 0, status.output);
  });

  it("SCF-T-22 a migration that cannot be applied ends the command with a non-zero code that names it [SCF-E-7]", async () => {
    const url = await emptyDatabase();
    // A table in the way: the first migration cannot add its foreign keys.
    await query(url, "CREATE TABLE teams (x integer)");
    const run = migrate(url);
    assert.notEqual(run.status, 0, "the command succeeded");
    assert.match(run.output, /create_relational_schema/);
    assert.match(run.output, /MIGRATION\.EXECUTION_FAILED/);
    assert.deepEqual(
      await query(
        url,
        "SELECT 1 FROM information_schema.tables WHERE table_name = 'users'",
      ),
      [],
      "a failed run left tables behind",
    );
  });
});
