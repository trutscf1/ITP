import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readYaml<T>(path: string): T {
  return parse(readFileSync(join(root, path), "utf8")) as T;
}

describe("SCF-AC-5.1 Documentation checks in the pipeline", () => {
  it("SCF-AC-5.1 keeps the documentation job of .gitlab/ci/docs.yml included", () => {
    const ci = readYaml<{ include?: { local?: string }[] }>(".gitlab-ci.yml");
    assert.ok(
      ci.include?.some((entry) => entry.local === ".gitlab/ci/docs.yml"),
      ".gitlab/ci/docs.yml not included",
    );
  });

  it("SCF-AC-1.4 runs the documentation job on the Node.js version of .tool-versions", () => {
    const toolVersions = readFileSync(join(root, ".tool-versions"), "utf8");
    const pinned = toolVersions.match(/^nodejs\s+(\S+)$/m)?.[1];
    assert.ok(pinned, "nodejs entry missing");
    const docs = readYaml<{ docs?: { image?: string } }>(".gitlab/ci/docs.yml");
    assert.equal(docs.docs?.image, `node:${pinned}-alpine`);
  });
});
