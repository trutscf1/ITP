// Database access of `identity` (gam-ai-knowledge/concepts/identity.md §16 M2, WORKFLOW.md
// Definition of Done 17, SCF-C-19): the lookup of the `users` row and the database probe of the
// health report go through the access layer `@stash/db`, not through a pool of their own. The
// authentication library keeps its own `pg` pool (STACK.md IDN-C-1); nothing else of `identity`
// writes SQL.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(path: string): string {
  return readFileSync(join(root, path), "utf8");
}

const authCore = read("apps/identity/src/auth-core.ts");

describe("SCF-C-19 identity reads the relational database through @stash/db", () => {
  it("SCF-C-19 declares the package db as a dependency of identity", () => {
    const manifest = JSON.parse(read("apps/identity/package.json")) as {
      dependencies: Record<string, string>;
    };
    assert.equal(manifest.dependencies["@stash/db"], "workspace:*");
  });

  it("SCF-C-19 imports the access layer into the AuthCore", () => {
    assert.match(authCore, /from "@stash\/db"/);
  });

  it("SCF-C-19 hands the pool only to the authentication library, never queries it with its own SQL", () => {
    assert.doesNotMatch(authCore, /pool\.query\(/);
    assert.doesNotMatch(authCore, /SELECT id FROM users/);
  });
});
