import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const readme = readFileSync(join(root, "README.md"), "utf8").replace(
  /\r\n/g,
  "\n",
);

/** The body of the "## <title>" section of the README. */
function section(title: string): string {
  const body = readme.match(
    new RegExp(`^## ${title}\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "m"),
  )?.[1];
  assert.ok(body, `README has no '## ${title}' section`);
  return body;
}

function readJson(path: string): {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
} {
  return JSON.parse(readFileSync(join(root, path), "utf8"));
}

const workspaceManifests = [
  "package.json",
  ...["apps", "packages"].flatMap((folder) =>
    ["web", "identity", "storage", "worker", "cms", "contracts", "ui", "config"]
      .map((name) => `${folder}/${name}/package.json`)
      .filter((path) => existsSync(join(root, path))),
  ),
  "tests/package.json",
];

/** The name under which the licence table lists a dependency; undefined if it needs no entry. */
function licenceLabel(name: string): string | undefined {
  if (name.startsWith("@types/") || name.startsWith("@stash/")) {
    return undefined;
  }
  if (
    name === "@axe-core/playwright" ||
    name === "@tailwindcss/postcss" ||
    name === "@tailwindcss/vite"
  ) {
    return name;
  }
  if (name === "prisma" || name.startsWith("@prisma/")) return "Prisma";
  if (name.startsWith("@commitlint/")) return "commitlint";
  if (name === "storybook" || name.startsWith("@storybook/"))
    return "Storybook";
  const labels: Record<string, string> = {
    "@asteasolutions/zod-to-openapi": "zod-to-openapi",
    "@biomejs/biome": "Biome",
    dotenv: "dotenv",
    next: "Next.js",
    playwright: "Playwright",
    "radix-ui": "Radix UI",
    react: "React",
    "react-dom": "React",
    tailwindcss: "Tailwind CSS",
    turbo: "Turborepo",
    typescript: "TypeScript",
    vite: "Vite",
    yaml: "yaml",
    zod: "Zod",
  };
  const label = labels[name];
  assert.ok(label, `dependency ${name} has no known name in the licence table`);
  return label;
}

describe("SCF-AC-7.1 Architecture overview", () => {
  it("SCF-AC-7.1 has an architecture section with a diagram", () => {
    assert.match(section("Architecture overview"), /```mermaid\n/);
  });

  it("SCF-AC-7.1 the diagram shows every database", () => {
    const body = section("Architecture overview");
    for (const database of [
      "PostgreSQL",
      "MongoDB",
      "Redis",
      "CouchDB",
      "Object storage",
    ]) {
      assert.ok(body.includes(database), `diagram misses ${database}`);
    }
  });
});

describe("SCF-AC-7.2 Setup guide", () => {
  it("SCF-AC-7.2 has a local setup, an offline start, and operation notes", () => {
    assert.ok(section("Quick start"));
    assert.ok(section("Start without internet access"));
    assert.ok(section("Operation and deployment"));
  });

  it("SCF-AC-7.2 every variable of docker-compose.yml is in .env.example", () => {
    const compose = readFileSync(join(root, "docker-compose.yml"), "utf8");
    const example = readFileSync(join(root, ".env.example"), "utf8");
    for (const [, name] of compose.matchAll(/\$\{(\w+)\}/g)) {
      assert.match(example, new RegExp(`^${name}=`, "m"), `${name} missing`);
    }
  });

  it("SCF-AC-7.2 the DATABASE_URL named by the quick start is in .env.example", () => {
    assert.match(section("Quick start"), /DATABASE_URL/);
    const example = readFileSync(join(root, ".env.example"), "utf8");
    assert.match(example, /^DATABASE_URL=\S+/m);
  });
});

describe("SCF-AC-7.3 Definition of Done", () => {
  it("SCF-AC-7.3 the README links the binding Definition of Done", () => {
    const body = section("Definition of Done");
    assert.match(body, /documentation\/WORKFLOW\.md/);
    assert.match(body, /binding/);
    const workflow = readFileSync(
      join(root, "documentation/WORKFLOW.md"),
      "utf8",
    );
    assert.match(workflow, /^#+ Definition of Done/m);
  });
});

describe("SCF-AC-7.5 Licence notes", () => {
  it("SCF-AC-7.5 lists every dependency of the workspace", () => {
    const licences = section("Licence notes");
    for (const manifest of workspaceManifests) {
      const json = readJson(manifest);
      for (const name of Object.keys({
        ...json.dependencies,
        ...json.devDependencies,
      })) {
        const label = licenceLabel(name);
        if (label) {
          assert.ok(
            licences.includes(label),
            `${name} (${manifest}) is not in the licence table`,
          );
        }
      }
    }
  });

  it("SCF-AC-7.5 lists the Docker images of docker-compose.yml", () => {
    const licences = section("Licence notes");
    const compose = readFileSync(join(root, "docker-compose.yml"), "utf8");
    for (const [, image] of compose.matchAll(/image:\s*(\w+):/g)) {
      const label = image === "postgres" ? "PostgreSQL" : "MongoDB";
      assert.ok(licences.includes(label), `${image} image not listed`);
    }
  });

  it("SCF-AC-7.5 names the images shipped in apps/web/public", () => {
    const licences = section("Licence notes");
    for (const file of ["next.svg", "vercel.svg"]) {
      assert.ok(existsSync(join(root, "apps/web/public", file)));
      assert.ok(licences.includes(file), `${file} not listed`);
    }
  });
});
