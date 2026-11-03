import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

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

function isIgnored(path: string): boolean {
  try {
    execFileSync("git", ["check-ignore", "-q", path], { cwd: root });
    return true;
  } catch {
    return false;
  }
}

describe("#153 Scan into the shared SonarQube", () => {
  it("scans under the project key stash without a coverage report", () => {
    const properties = readProperties("sonar-project.properties");
    assert.equal(properties.get("sonar.projectKey"), "stash");
    assert.ok(properties.get("sonar.sources"), "sonar.sources missing");
    assert.equal(properties.has("sonar.javascript.lcov.reportPaths"), false);
  });

  it("runs the scanner container on the network sonarqube-shared with the token file", () => {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    const sonar = pkg.scripts.sonar ?? "";
    assert.match(sonar, /--network sonarqube-shared/);
    assert.match(sonar, /--env-file \.env\.sonar/);
    assert.match(sonar, /SONAR_HOST_URL=http:\/\/sonarqube-shared:9000/);
  });

  it("keeps .env.sonar out of git and ships .env.sonar.example", () => {
    assert.equal(isIgnored(".env.sonar"), true);
    assert.equal(isIgnored(".env.sonar.example"), false);
    const example = readFileSync(join(root, ".env.sonar.example"), "utf8");
    assert.match(example, /^SONAR_TOKEN=$/m);
  });
});
