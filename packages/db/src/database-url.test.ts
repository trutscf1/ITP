import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { databaseUrl } from "./database-url.ts";

describe("SCF-AC-2.2 connection of the schema commands", () => {
  const postgres = {
    POSTGRES_USER: "stash",
    POSTGRES_PASSWORD: "change-me",
    POSTGRES_PORT: "5432",
    POSTGRES_DB: "stash_db",
  };

  it("SCF-AC-2.2 builds the connection from the PostgreSQL values of .env with the host localhost", () => {
    assert.equal(
      databaseUrl(postgres),
      "postgresql://stash:change-me@localhost:5432/stash_db",
    );
  });

  it("SCF-AC-2.2 keeps a DATABASE_URL that the environment sets", () => {
    assert.equal(
      databaseUrl({ ...postgres, DATABASE_URL: "postgresql://a:b@db:6543/x" }),
      "postgresql://a:b@db:6543/x",
    );
  });

  it("SCF-AC-2.2 encodes user and password, so special characters stay part of them", () => {
    assert.equal(
      databaseUrl({ ...postgres, POSTGRES_PASSWORD: "p@ss/word" }),
      "postgresql://stash:p%40ss%2Fword@localhost:5432/stash_db",
    );
  });

  it("SCF-AC-2.2 encodes the database name, so special characters stay part of it", () => {
    assert.equal(
      databaseUrl({ ...postgres, POSTGRES_DB: "stash db?x#1" }),
      "postgresql://stash:change-me@localhost:5432/stash%20db%3Fx%231",
    );
  });

  it("SCF-AC-2.2 gives no connection while a PostgreSQL value is missing", () => {
    assert.equal(
      databaseUrl({ ...postgres, POSTGRES_DB: undefined }),
      undefined,
    );
  });
});
