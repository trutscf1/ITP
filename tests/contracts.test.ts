import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  errorCodes,
  errorReplies,
  errorResponseSchema,
  generateOpenApiDocument,
  healthReportSchema,
  toErrorResponse,
} from "../packages/contracts/src/index.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const contractsSrc = join(root, "packages/contracts/src");

/** TypeScript's compiler script, run with Node.js (a `.bin` shim needs a shell on Windows). */
const tsc = createRequire(join(root, "package.json")).resolve(
  "typescript/bin/tsc",
);

/** Every `.ts` file below a folder, without tests. */
function sourceFiles(folder: string): string[] {
  return readdirSync(folder, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".ts"))
    .filter((entry) => !entry.name.endsWith(".test.ts"))
    .map((entry) => join(entry.parentPath, entry.name));
}

describe("SCF-AC-3.1 Contracts package", () => {
  it("is the workspace package @stash/contracts with Zod 4 or newer [SCF-F-9]", () => {
    const manifest = JSON.parse(
      readFileSync(join(root, "packages/contracts/package.json"), "utf8"),
    ) as { name: string; dependencies?: Record<string, string> };
    assert.equal(manifest.name, "@stash/contracts");
    const zod = manifest.dependencies?.zod ?? "";
    const major = Number.parseInt(zod.replace(/^[^\d]*/, ""), 10);
    assert.ok(major >= 4, `zod must be 4 or newer, found "${zod}"`);
  });

  it("keeps every request or response schema in a file of its own [SCF-F-9]", () => {
    const schemaFiles = sourceFiles(contractsSrc).filter((file) =>
      /\.object\(/.test(readFileSync(file, "utf8")),
    );
    assert.ok(schemaFiles.length >= 2, "health and error schemas are expected");
    for (const file of schemaFiles) {
      assert.doesNotMatch(file, /index\.ts$/, "index.ts only re-exports");
      assert.match(
        readFileSync(file, "utf8"),
        /export const \w+Schema\b/,
        `${file} must export its schema as <name>Schema`,
      );
    }
  });

  it("describes the HealthReport of the concept as a schema [SCF-F-5]", () => {
    const report = {
      unit: "storage",
      version: "0.0.0-dev",
      status: "ok",
      checks: [{ name: "relational-database", essential: true, status: "ok" }],
    };
    assert.deepEqual(healthReportSchema.parse(report), report);
    assert.equal(
      healthReportSchema.safeParse({ ...report, unit: "gateway" }).success,
      false,
    );
  });
});

describe("SCF-AC-3.2 Same schema on both sides", () => {
  it("keeps the schema files free of server-only modules, so a browser can import them [SCF-F-9]", () => {
    for (const file of sourceFiles(contractsSrc)) {
      if (/openapi|generate/.test(file)) continue;
      const text = readFileSync(file, "utf8");
      assert.doesNotMatch(text, /from "node:/, `${file} imports a node module`);
    }
  });

  it("lets no unit declare a contract shape locally or use Zod directly [SCF-F-9]", () => {
    const offenders: string[] = [];
    for (const unit of readdirSync(join(root, "apps"))) {
      let files: string[] = [];
      try {
        files = sourceFiles(join(root, "apps", unit, "src"));
      } catch {
        continue;
      }
      for (const file of files) {
        if (/from "zod"/.test(readFileSync(file, "utf8"))) offenders.push(file);
      }
    }
    assert.deepEqual(offenders, []);
  });

  it("validates the same input identically wherever the schema is imported [SCF-F-9]", () => {
    const input = { code: "internal-error", message: "x" };
    assert.equal(
      errorResponseSchema.safeParse(input).success,
      errorResponseSchema.safeParse(structuredClone(input)).success,
    );
  });
});

describe("SCF-AC-3.3 Generated OpenAPI", () => {
  it("generates an OpenAPI 3 document from the registered schemas [SCF-F-10]", () => {
    const document = generateOpenApiDocument();
    assert.match(document.openapi, /^3\./);
    assert.ok(document.paths?.["/health"], "GET /health is described");
    const names = Object.keys(document.components?.schemas ?? {});
    assert.ok(names.includes("HealthReport"));
    assert.ok(names.includes("ErrorResponse"));
  });

  it("writes the description with one command, and every build writes it too [SCF-F-10]", () => {
    const manifest = JSON.parse(
      readFileSync(join(root, "packages/contracts/package.json"), "utf8"),
    ) as { scripts: Record<string, string> };
    const command = "node src/generate-openapi.ts";
    assert.equal(manifest.scripts["openapi:generate"], command);
    assert.ok(manifest.scripts.build?.includes(command), "build generates it");
  });

  it("writes a file that equals the generated document and names the contract (SCF-T-15) [SCF-F-10]", () => {
    const dir = mkdtempSync(join(tmpdir(), "contracts-openapi-"));
    try {
      const file = join(dir, "openapi.json");
      const run = spawnSync(
        process.execPath,
        [join(contractsSrc, "generate-openapi.ts"), file],
        { encoding: "utf8" },
      );
      assert.equal(run.status, 0, run.stderr);
      const written = JSON.parse(readFileSync(file, "utf8")) as unknown;
      assert.deepEqual(written, generateOpenApiDocument());
      assert.match(readFileSync(file, "utf8"), /"HealthReport"/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("keeps no generated copy in the repository [SCF-F-10]", () => {
    const ignored = readFileSync(join(root, ".gitignore"), "utf8");
    assert.match(ignored, /^dist\/$/m, "dist/ holds the generated file");
  });
});

describe("SCF-AC-3.4 Uniform error format", () => {
  it("answers a validation failure with status 400 and the body of example 6 (SCF-T-16) [SCF-F-21]", () => {
    const failure = healthReportSchema.safeParse({ unit: "gateway" });
    if (failure.success) assert.fail("must not validate");
    assert.deepEqual(toErrorResponse(failure.error), {
      status: 400,
      body: {
        code: "validation-failed",
        message: "The request body is not valid.",
      },
    });
  });

  it("answers a failure inside the unit with status 500 and hides its cause (SCF-T-16) [SCF-NF-4]", () => {
    const secret = new Error(
      "select * from users where password = 'x' -- at /srv/app/db.ts:12 db:5432",
    );
    const reply = toErrorResponse(secret);
    assert.deepEqual(reply, {
      status: 500,
      body: {
        code: "internal-error",
        message: "The request could not be processed.",
      },
    });
    assert.doesNotMatch(
      JSON.stringify(reply.body),
      /select|password|\/srv|\.ts:\d+|5432|at /i,
    );
  });

  it("does not take over values of the failed input [SCF-NF-4]", () => {
    const failure = healthReportSchema.safeParse({ unit: "hunter2-secret" });
    if (failure.success) assert.fail("must not validate");
    const { body } = toErrorResponse(failure.error);
    assert.doesNotMatch(JSON.stringify(body), /hunter2-secret|unit/);
  });

  it("gives every code one status and a body of the flat format { code, message } [SCF-F-21]", () => {
    const statuses = Object.fromEntries(
      errorCodes.map((code) => [code, errorReplies[code].status]),
    );
    assert.deepEqual(statuses, {
      "validation-failed": 400,
      "not-found": 404,
      "method-not-allowed": 405,
      "internal-error": 500,
    });
    for (const code of errorCodes) {
      const { body } = errorReplies[code];
      assert.equal(body.code, code);
      assert.deepEqual(Object.keys(body).sort(), ["code", "message"]);
      assert.deepEqual(errorResponseSchema.parse(body), body);
    }
    assert.equal(
      errorResponseSchema.safeParse({
        error: { code: "internal-error", message: "x" },
      }).success,
      false,
      "the nested shape is not an ErrorResponse",
    );
  });
});

describe("SCF-AC-3.5 Breaking change fails", () => {
  const entry = join(contractsSrc, "index.ts").replaceAll("\\", "/");

  /** Typechecks a consumer of the contracts package; returns the compiler's exit code and output. */
  function typecheck(consumer: string): { status: number | null; out: string } {
    const dir = mkdtempSync(join(tmpdir(), "contracts-consumer-"));
    try {
      const file = join(dir, "consumer.ts");
      writeFileSync(file, consumer.replace("@contracts", entry));
      const run = spawnSync(
        process.execPath,
        [
          tsc,
          "--noEmit",
          "--strict",
          "--skipLibCheck",
          "--target",
          "ES2023",
          "--module",
          "nodenext",
          "--allowImportingTsExtensions",
          file,
        ],
        { encoding: "utf8" },
      );
      return { status: run.status, out: run.stdout + run.stderr };
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }

  it("passes for a consumer written against the current shape [SCF-NF-7]", () => {
    const result = typecheck(`
      import type { HealthReport } from "@contracts";
      export const status = (r: HealthReport): string => r.checks[0]?.status ?? r.status;
    `);
    assert.equal(result.status, 0, result.out);
  });

  it("fails for a consumer written against a removed field [SCF-NF-7]", () => {
    const result = typecheck(`
      import type { HealthReport } from "@contracts";
      export const healthy = (r: HealthReport): boolean => r.checks[0]?.ok === true;
    `);
    assert.notEqual(result.status, 0);
    assert.match(result.out, /ok/);
  });

  it("fails for a consumer that sends a value the schema no longer allows [SCF-NF-7]", () => {
    const result = typecheck(`
      import type { HealthReport } from "@contracts";
      export const report: HealthReport = { unit: "gateway", version: "1", status: "ok", checks: [] };
    `);
    assert.notEqual(result.status, 0);
  });
});
