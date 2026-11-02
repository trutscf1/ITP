// Acceptance tests of SCF-US-4 that read the repository (documentation/concepts/scaffolding.md
// §17, SCF-T-18, SCF-T-19, SCF-T-22): the entity-relationship diagram, the schema definition and
// its migrations, and the migrating service of the local stack.
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dbPackage = join(root, "packages", "db");

type Column = { type: string };
type Table = Map<string, Column>;

/** The tables and columns of the erDiagram block in §8 of the scaffolding concept. */
function diagramTables(): Map<string, Table> {
  const concept = readFileSync(
    join(root, "documentation", "concepts", "scaffolding.md"),
    "utf8",
  );
  const block = concept.match(/```mermaid\n(erDiagram\n[\s\S]*?)```/);
  assert.ok(block?.[1], "scaffolding.md holds no mermaid erDiagram block");
  const tables = new Map<string, Table>();
  let current: Table | undefined;
  for (const line of block[1].split("\n")) {
    const open = line.match(/^\s*([a-z_]+)\s*\{\s*$/);
    if (open?.[1]) {
      current = new Map();
      tables.set(open[1], current);
      continue;
    }
    if (/^\s*\}\s*$/.test(line)) {
      current = undefined;
      continue;
    }
    const attribute = line.match(/^\s*([a-z]+)\s+([a-z_]+)\b/);
    if (current && attribute?.[1] && attribute[2]) {
      current.set(attribute[2], { type: attribute[1] });
    }
  }
  return tables;
}

type StorageColumn = { nativeType: string };
type Contract = {
  storage: {
    storageHash: string;
    namespaces: {
      public: {
        entries: {
          table: Record<string, { columns: Record<string, StorageColumn> }>;
        };
      };
    };
  };
};

function contract(): Contract {
  return JSON.parse(
    readFileSync(join(dbPackage, "src", "prisma", "contract.json"), "utf8"),
  ) as Contract;
}

type MigrationManifest = { from: string | null; to: string };

function migrations(): { dir: string; manifest: MigrationManifest }[] {
  const app = join(dbPackage, "migrations", "app");
  return readdirSync(app, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "refs")
    .map((entry) => entry.name)
    .sort()
    .map((dir) => ({
      dir,
      manifest: JSON.parse(
        readFileSync(join(app, dir, "migration.json"), "utf8"),
      ) as MigrationManifest,
    }));
}

describe("SCF-AC-4.1 ER diagram", () => {
  it("SCF-T-18 every table of the diagram has a plural name, and users, teams, and folders exist [SCF-F-22]", () => {
    const names = [...diagramTables().keys()];
    for (const name of names) {
      assert.match(
        name,
        /^[a-z]+(_[a-z]+)*s$/,
        `${name} is not a plural snake_case name`,
      );
    }
    for (const required of ["users", "teams", "folders"]) {
      assert.ok(
        names.includes(required),
        `the diagram has no table ${required}`,
      );
    }
  });

  it(
    "SCF-T-18 the diagram drawn in Vertabelo is embedded as an export [SCF-F-22]",
    {
      todo: "slice 2 of SCF-US-4 (#SLICE2): draw the diagram of §8 in Vertabelo and embed the export",
    },
    () => {
      assert.ok(
        existsSync(join(root, "documentation", "images", "er-diagram.png")),
      );
    },
  );
});

describe("SCF-AC-4.2 Schema matches diagram", () => {
  it("SCF-T-19 the schema definition holds exactly the tables and columns of the diagram [SCF-F-23]", () => {
    const diagram = diagramTables();
    const tables = contract().storage.namespaces.public.entries.table;
    assert.deepEqual(
      Object.keys(tables).sort(),
      [...diagram.keys()].sort(),
      "tables of the schema and of the diagram differ",
    );
    for (const [name, columns] of diagram) {
      const schemaColumns = tables[name]?.columns ?? {};
      assert.deepEqual(
        Object.fromEntries(
          Object.entries(schemaColumns)
            .map(([column, c]) => [column, c.nativeType])
            .sort(),
        ),
        Object.fromEntries(
          [...columns].map(([column, c]) => [column, c.type]).sort(),
        ),
        `columns of ${name} differ between schema and diagram`,
      );
    }
  });

  it("SCF-T-19 the migrations are versioned in the repository and lead to the current schema [SCF-F-23]", () => {
    const chain = migrations();
    assert.ok(
      chain.length > 0,
      "packages/db/migrations/app holds no migration",
    );
    assert.equal(
      chain[0]?.manifest.from,
      null,
      "the first migration does not start empty",
    );
    for (let i = 1; i < chain.length; i++) {
      assert.equal(
        chain[i]?.manifest.from,
        chain[i - 1]?.manifest.to,
        `${chain[i]?.dir} does not continue ${chain[i - 1]?.dir}`,
      );
    }
    assert.equal(
      chain.at(-1)?.manifest.to,
      contract().storage.storageHash,
      "the schema definition has changes without a migration",
    );
    for (const { dir } of chain) {
      for (const file of ["migration.ts", "migration.json", "ops.json"]) {
        assert.ok(
          existsSync(join(dbPackage, "migrations", "app", dir, file)),
          `${dir}/${file} is missing`,
        );
      }
    }
  });
});

type Service = {
  build?: { context?: string; dockerfile?: string };
  environment?: Record<string, string> | string[];
  depends_on?: Record<string, { condition?: string }> | string[];
  restart?: string;
};

function services(): Record<string, Service> {
  const compose = parse(
    readFileSync(join(root, "docker-compose.yml"), "utf8"),
  ) as { services: Record<string, Service> };
  return compose.services;
}

function usesDatabase(service: Service): boolean {
  const env = service.environment ?? {};
  return Array.isArray(env)
    ? env.some((entry) => entry.startsWith("DATABASE_URL="))
    : "DATABASE_URL" in env;
}

describe("SCF-AC-4.5 Migrations at start", () => {
  it("SCF-T-22 a one-shot service applies the migrations once the database is healthy [SCF-F-26]", () => {
    const migrate = services()["db-migrate"];
    assert.ok(migrate, "docker-compose.yml has no service db-migrate");
    assert.equal(migrate.build?.dockerfile, "packages/db/Dockerfile");
    assert.equal(migrate.restart, "no");
    assert.ok(usesDatabase(migrate), "db-migrate gets no DATABASE_URL");
    const dependsOn = migrate.depends_on as Record<
      string,
      { condition?: string }
    >;
    assert.equal(dependsOn?.postgres?.condition, "service_healthy");

    const dockerfile = readFileSync(join(dbPackage, "Dockerfile"), "utf8");
    assert.match(dockerfile, /CMD \["pnpm", "run", "migrate:deploy"\]/);
    const scripts = (
      JSON.parse(readFileSync(join(dbPackage, "package.json"), "utf8")) as {
        scripts: Record<string, string>;
      }
    ).scripts;
    assert.equal(
      scripts["migrate:deploy"],
      "prisma db migrate --show && prisma db migrate",
    );
  });

  it("SCF-T-22 every other service that uses the database starts only after the migrations succeeded [SCF-F-26, SCF-E-7]", () => {
    for (const [name, service] of Object.entries(services())) {
      if (name === "db-migrate" || !usesDatabase(service)) continue;
      const dependsOn = service.depends_on as
        | Record<string, { condition?: string }>
        | undefined;
      assert.equal(
        dependsOn?.["db-migrate"]?.condition,
        "service_completed_successfully",
        `${name} uses the database but does not wait for db-migrate`,
      );
    }
  });
});
