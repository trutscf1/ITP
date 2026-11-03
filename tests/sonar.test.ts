import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { scannerArgs } from "../scripts/sonar.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readProperties(path: string): Map<string, string> {
  const entries = readFileSync(join(root, path), "utf8")
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "" && !line.trimStart().startsWith("#"))
    .map((line) => {
      const at = line.indexOf("=");
      return [line.slice(0, at).trim(), line.slice(at + 1).trim()] as const;
    });
  return new Map(entries);
}

// Applies the root .gitignore to a file in the repository root: the last matching pattern
// wins, and a pattern starting with ! re-includes. It reads the file instead of asking git,
// because the CI image of the test job (node:alpine) has no git.
function isIgnored(path: string): boolean {
  let ignored = false;
  for (const raw of readFileSync(join(root, ".gitignore"), "utf8").split(
    /\r?\n/,
  )) {
    const line = raw.trim();
    if (line === "" || line.startsWith("#")) continue;
    const negated = line.startsWith("!");
    const pattern = (negated ? line.slice(1) : line)
      .replace(/^\//, "")
      .replace(/\/$/, "");
    const source = pattern
      .split("*")
      .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
      .join("[^/]*");
    if (new RegExp(`^${source}$`).test(path)) ignored = !negated;
  }
  return ignored;
}

describe("#153 Scan into the shared SonarQube", () => {
  it("scans under the project key stash without a coverage report", () => {
    const properties = readProperties("sonar-project.properties");
    assert.equal(properties.get("sonar.projectKey"), "stash");
    assert.ok(properties.get("sonar.sources"), "sonar.sources missing");
    assert.equal(properties.has("sonar.javascript.lcov.reportPaths"), false);
  });

  it("runs the scanner container on the network sonarqube-shared with the token file", () => {
    const pkg = JSON.parse(
      readFileSync(join(root, "package.json"), "utf8"),
    ) as {
      scripts: Record<string, string>;
    };
    assert.equal(pkg.scripts.sonar, "node scripts/sonar.ts");
    const args = scannerArgs("/repo").join(" ");
    assert.match(args, /--network sonarqube-shared/);
    assert.match(args, /--env-file \.env\.sonar/);
    assert.match(args, /SONAR_HOST_URL=http:\/\/sonarqube-shared:9000/);
    assert.match(args, /-v \/repo:\/usr\/src/);
  });

  it("keeps .env.sonar out of git and ships .env.sonar.example", () => {
    assert.equal(isIgnored(".env.sonar"), true);
    assert.equal(isIgnored(".env.sonar.example"), false);
    const example = readFileSync(join(root, ".env.sonar.example"), "utf8");
    assert.match(example, /^SONAR_TOKEN=$/m);
  });
});
