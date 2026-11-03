// Scan this repository into the SonarQube server shared by every project on this computer (#153).
//   pnpm sonar   → runs the scanner container on the Docker network "sonarqube-shared"
// The server is started outside this repository; the token comes from the ignored .env.sonar
// (copy of .env.sonar.example). Project settings: sonar-project.properties.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

export const scannerImage = "sonarsource/sonar-scanner-cli:12.3.0.4285_8.1.0";
export const network = "sonarqube-shared";
export const tokenFile = ".env.sonar";

export function scannerArgs(repoRoot: string): string[] {
  return [
    "run",
    "--rm",
    "--network",
    network,
    "--env-file",
    tokenFile,
    "-e",
    `SONAR_HOST_URL=http://${network}:9000`,
    "-v",
    `${repoRoot}:/usr/src`,
    "-w",
    "/usr/src",
    scannerImage,
    "-Dsonar.qualitygate.wait=true",
  ];
}

if (import.meta.main) {
  const repoRoot = resolve(import.meta.dirname, "..");
  if (!existsSync(resolve(repoRoot, tokenFile))) {
    console.error(
      `[sonar] ${tokenFile} missing: copy .env.sonar.example and set SONAR_TOKEN.`,
    );
    process.exit(1);
  }
  try {
    execFileSync("docker", scannerArgs(repoRoot), {
      cwd: repoRoot,
      stdio: "inherit",
    });
  } catch {
    process.exit(1);
  }
}
