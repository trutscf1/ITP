import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

type Rule = { if?: string; when?: string };
type Cache = { key?: string | { files?: string[] }; paths?: string[] };
type Job = {
  image?: string | { name: string };
  services?: (string | { name: string; alias?: string })[];
  stage?: string;
  needs?: string[];
  release?: { tag_name?: string; description?: string };
  script?: string[];
  cache?: Cache[];
  rules?: unknown;
  only?: unknown;
  except?: unknown;
  allow_failure?: unknown;
};
type CiConfig = {
  workflow?: { rules?: Rule[] };
  default?: { timeout?: string };
  stages?: string[];
};
type CiVariables = Record<string, string | undefined>;
type PreCommitHook = {
  id: string;
  args?: string[];
  entry?: string;
  stages?: string[];
};
type PreCommitConfig = {
  default_install_hook_types?: string[];
  repos: { repo: string; rev?: string; hooks: PreCommitHook[] }[];
};

function readCi(): CiConfig {
  return parse(readFileSync(join(root, ".gitlab-ci.yml"), "utf8")) as CiConfig;
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as T;
}

function readJob(name: string): Job {
  const job = (readCi() as Record<string, Job | undefined>)[name];
  assert.ok(job, `job ${name} missing`);
  return job;
}

function imageOf(name: string): string {
  const image = readJob(name).image;
  return typeof image === "string" ? image : (image?.name ?? "");
}

function scriptOf(name: string): string {
  return (readJob(name).script ?? []).join("\n");
}

function exceptionFiles(): string[] {
  const folder = join(root, ".trivyignore.d");
  const own = existsSync(folder)
    ? readdirSync(folder).map((name) => `.trivyignore.d/${name}`)
    : [];
  return [".trivyignore", ...own];
}

function jobNames(): string[] {
  return Object.keys(readCi()).filter(
    (key) =>
      !key.startsWith(".") &&
      !["workflow", "default", "stages", "include", "variables"].includes(key),
  );
}

function readPreCommitRepo(url: string): PreCommitConfig["repos"][number] {
  const config = parse(
    readFileSync(join(root, ".pre-commit-config.yaml"), "utf8"),
  ) as PreCommitConfig;
  const repo = config.repos.find((entry) => entry.repo === url);
  assert.ok(repo, `pre-commit repo ${url} missing`);
  return repo;
}

// Evaluates the GitLab CI/CD rule expressions this repo uses: `$VAR` and `$VAR == "x"`,
// joined by `&&`.
function evaluate(expression: string, variables: CiVariables): boolean {
  return expression.split("&&").every((term) => {
    const match = term.trim().match(/^\$(\w+)(?:\s*==\s*"([^"]*)")?$/);
    assert.ok(match, `unsupported rule expression: ${term.trim()}`);
    const [, name, literal] = match;
    const value = variables[name as string];
    if (literal !== undefined) return value === literal;
    return value !== undefined && value !== "";
  });
}

function pipelineRuns(variables: CiVariables): boolean {
  const rules = readCi().workflow?.rules;
  assert.ok(rules, "workflow:rules missing");
  for (const rule of rules) {
    if (rule.if === undefined || evaluate(rule.if, variables)) {
      return rule.when !== "never";
    }
  }
  return false;
}

function push(branch: string, openMergeRequest = false): CiVariables {
  return {
    CI_PIPELINE_SOURCE: "push",
    CI_COMMIT_BRANCH: branch,
    CI_OPEN_MERGE_REQUESTS: openMergeRequest ? "group/project!1" : undefined,
  };
}

const checks = [
  ["lint", "pnpm run lint"],
  ["typecheck", "pnpm run typecheck"],
  ["test", "pnpm test"],
  ["build", "pnpm run build"],
] as const;

describe("SCF-AC-5.1 Pipeline triggers", () => {
  for (const branch of ["feature/42-ci-pipeline", "dev", "main"]) {
    it(`SCF-AC-5.1 runs the pipeline on a push to ${branch}`, () => {
      assert.equal(pipelineRuns(push(branch)), true);
    });
  }

  it("SCF-AC-5.1 runs one pipeline, not two, for a push to a branch with an open merge request", () => {
    assert.equal(pipelineRuns(push("feature/42-ci-pipeline", true)), false);
  });

  for (const [name, command] of checks) {
    it(`SCF-AC-5.1 runs the job ${name} in every pipeline`, () => {
      const job = readJob(name);
      assert.equal(job.rules, undefined, `job ${name} sets rules`);
      assert.equal(job.only, undefined, `job ${name} sets only`);
      assert.equal(job.except, undefined, `job ${name} sets except`);
      assert.ok(
        job.script?.includes(command),
        `${name} does not run ${command}`,
      );
    });
  }
});

function minutes(duration: string): number {
  const match = duration.match(/^(\d+)\s*(?:m|min|minutes?)$/);
  assert.ok(match, `unsupported duration: ${duration}`);
  return Number.parseInt(match[1] as string, 10);
}

describe("SCF-AC-5.4 Run time", () => {
  it("SCF-AC-5.4 stops every job after at most 10 minutes", () => {
    const timeout = readCi().default?.timeout;
    assert.ok(timeout, "default:timeout missing");
    assert.ok(minutes(timeout) <= 10);
  });

  it("SCF-AC-5.4 runs all checks in parallel in the first stage", () => {
    assert.equal(readCi().stages?.[0], "test");
    for (const name of jobNames()) {
      if (readJob(name).rules !== undefined) continue;
      assert.equal(readJob(name).stage, "test", `${name} is not in stage test`);
    }
  });

  it("SCF-AC-5.4 caches the pnpm store by lockfile and the Turborepo cache", () => {
    const caches = readJob(".pnpm").cache ?? [];
    const store = caches.find((cache) => cache.paths?.includes(".pnpm-store"));
    assert.ok(store, "pnpm store not cached");
    assert.deepEqual(store.key, { files: ["pnpm-lock.yaml"] });
    assert.ok(
      caches.some((cache) => cache.paths?.includes(".turbo/cache")),
      "Turborepo cache not cached",
    );
  });
});

describe("SCF-AC-5.5 Visible status", () => {
  it("SCF-AC-5.5 runs the checks as a merge request pipeline, whose status the merge request shows", () => {
    assert.equal(
      pipelineRuns({ CI_PIPELINE_SOURCE: "merge_request_event" }),
      true,
    );
  });
});

describe("SCF-AC-1.4 Pinned versions in CI", () => {
  it("SCF-AC-1.4 runs the pipeline on the Node.js version of .tool-versions", () => {
    const toolVersions = readFileSync(join(root, ".tool-versions"), "utf8");
    const pinned = toolVersions.match(/^nodejs\s+(\S+)$/m)?.[1];
    assert.ok(pinned, "nodejs entry missing");
    for (const name of [".pnpm", "release-notes"]) {
      assert.equal(imageOf(name), `node:${pinned}-alpine`, name);
    }
  });

  it("SCF-AC-1.4 checks the Node.js major version inside the Playwright image", () => {
    assert.match(scriptOf("accessibility"), /\.tool-versions/);
    assert.match(scriptOf("accessibility"), /process\.versions\.node/);
  });
});

describe("SCF-AC-5.2 Pipeline steps", () => {
  it("SCF-AC-5.2 runs the Biome check over the whole repository", () => {
    assert.match(scriptOf("lint"), /pnpm exec biome ci \./);
  });

  it("SCF-AC-5.2 runs the unit tests of every unit and package once, through the root task", () => {
    // `pnpm test` is `turbo run test` (SCF-F-12), so it also runs the acceptance tests.
    assert.match(scriptOf("test"), /^pnpm test$/m);
    assert.doesNotMatch(scriptOf("test"), /turbo run test/);
  });

  it("SCF-AC-5.2 runs the accessibility check (axe) against the built web client", () => {
    assert.match(scriptOf("accessibility"), /pnpm run test:accessibility/);
  });

  it("SCF-AC-5.2 runs the accessibility check on the Playwright image of the pinned version", () => {
    const pkg = readJson<{ devDependencies: Record<string, string> }>(
      "package.json",
    );
    const version = pkg.devDependencies.playwright;
    assert.match(version ?? "", /^\d+\.\d+\.\d+$/, "Playwright not pinned");
    assert.equal(
      imageOf("accessibility"),
      `mcr.microsoft.com/playwright:v${version}-noble`,
    );
  });

  it("SCF-AC-5.2 runs the dependency audit on production dependencies", () => {
    assert.match(scriptOf("dependency-audit"), /pnpm audit --prod/);
  });

  it("SCF-AC-5.2 scans the images of the stack with the pinned Trivy version", () => {
    assert.match(scriptOf("container-scan"), /aquasec\/trivy:\d+\.\d+\.\d+/);
    assert.match(scriptOf("container-scan"), /trivy image/);
  });

  it("SCF-F-15 runs the secret scan with Gitleaks", () => {
    assert.match(imageOf("secret-scan"), /gitleaks:v\d/);
    assert.match(scriptOf("secret-scan"), /--config \.gitleaks\.toml/);
  });

  it("SCF-F-15 runs the code scan with Semgrep", () => {
    assert.match(imageOf("code-scan"), /semgrep:\d/);
    assert.match(scriptOf("code-scan"), /--config \.semgrep\.yml/);
  });
});

describe("SCF-AC-2.5 Clean images (SCF-NF-6, SCF-T-10)", () => {
  it("SCF-AC-2.5 runs the container scan on a pinned Docker with a Docker daemon of the same version", () => {
    const image = imageOf("container-scan");
    assert.match(image, /^docker:\d+\.\d+\.\d+$/);
    const services = (readJob("container-scan").services ?? []).map(
      (service) => (typeof service === "string" ? service : service.name),
    );
    assert.ok(services.includes(`${image}-dind`), `no service ${image}-dind`);
  });

  it("SCF-AC-2.5 builds every image the stack builds, in every profile, before the scan", () => {
    assert.match(
      scriptOf("container-scan"),
      /docker compose [^\n]*--profile "\*" [^\n]*build/,
    );
  });

  it("SCF-AC-2.5 scans the image list of the stack definition, built and pulled images alike", () => {
    const script = scriptOf("container-scan");
    assert.match(
      script,
      /docker compose [^\n]*--profile "\*" [^\n]*config --images/,
    );
    assert.doesNotMatch(script, /awk/);
  });
});

describe("SCF-AC-2.5 Exceptions of one built image", () => {
  it("SCF-AC-2.5 names the built images after the fixed project name stash", () => {
    const script = scriptOf("container-scan");
    assert.match(script, /docker compose -p stash [^\n]*build/);
    assert.match(script, /docker compose -p stash [^\n]*config --images/);
  });

  it("SCF-AC-2.5 adds the exceptions of .trivyignore.d/<service> only to the image of that service", () => {
    assert.match(
      scriptOf("container-scan"),
      /\.trivyignore\.d\/\$\{image#stash-\}/,
    );
  });

  it("SCF-AC-2.5 keeps an exception file only for a service that builds its image", () => {
    const compose = parse(
      readFileSync(join(root, "docker-compose.yml"), "utf8"),
    ) as {
      services: Record<string, { build?: unknown }>;
    };
    for (const file of exceptionFiles().filter((name) =>
      name.startsWith(".trivyignore.d/"),
    )) {
      const service = file.slice(".trivyignore.d/".length);
      assert.ok(
        compose.services[service]?.build,
        `${file}: no service ${service} with build`,
      );
    }
  });
});

describe("SCF-AC-5.3 Failing conditions", () => {
  it("SCF-AC-5.3 lets no job fail without failing the pipeline", () => {
    for (const name of jobNames()) {
      assert.notEqual(readJob(name).allow_failure, true, `${name} may fail`);
    }
  });

  it("SCF-AC-5.3 fails the dependency audit on high and critical", () => {
    assert.match(scriptOf("dependency-audit"), /--audit-level=high/);
  });

  it("SCF-AC-5.3 fails the container scan on high and critical", () => {
    const script = scriptOf("container-scan");
    assert.match(script, /--severity HIGH,CRITICAL/);
    assert.match(script, /--exit-code 1/);
  });

  it("SCF-AC-5.3 fails the code scan on any finding", () => {
    assert.match(scriptOf("code-scan"), /--error/);
  });

  it("SCF-AC-5.3 ignores a known image vulnerability only with a reason and an expiry date", () => {
    for (const file of exceptionFiles()) {
      const lines = readFileSync(join(root, file), "utf8").split("\n");
      let reason = false;
      lines.forEach((line, index) => {
        if (line.trim() === "") {
          reason = false;
        } else if (line.startsWith("# ")) {
          reason = true;
        } else {
          assert.match(
            line,
            /^\S+ exp:\d{4}-\d{2}-\d{2}$/,
            `${file} line ${index + 1}`,
          );
          assert.ok(reason, `${file} line ${index + 1} has no reason above it`);
        }
      });
    }
  });
});

describe("SCF-F-14 Same scanners before the commit and in the pipeline", () => {
  it("SCF-F-14 uses the Gitleaks version of the pipeline in the pre-commit hook", () => {
    const { rev } = readPreCommitRepo("https://github.com/gitleaks/gitleaks");
    assert.equal(imageOf("secret-scan"), `zricethezav/gitleaks:${rev}`);
  });

  it("SCF-F-14 uses the Semgrep version and rule sets of the pipeline in the pre-commit hook", () => {
    const repo = readPreCommitRepo("https://github.com/semgrep/semgrep");
    assert.equal(
      imageOf("code-scan"),
      `semgrep/semgrep:${repo.rev?.replace(/^v/, "")}`,
    );
    const hookConfigs = (repo.hooks[0]?.args ?? [])
      .filter((arg) => arg.startsWith("--config="))
      .map((arg) => arg.slice("--config=".length));
    const pipelineConfigs = [
      ...scriptOf("code-scan").matchAll(/--config (\S+)/g),
    ].map((match) => match[1]);
    assert.deepEqual(hookConfigs, pipelineConfigs);
  });
});

describe("SCF-AC-6.1 Commit check in the hook and the pipeline", () => {
  it("SCF-AC-6.1 checks the message with commitlint in the commit-msg hook", () => {
    const config = parse(
      readFileSync(join(root, ".pre-commit-config.yaml"), "utf8"),
    ) as PreCommitConfig;
    assert.ok(config.default_install_hook_types?.includes("commit-msg"));
    const hook = readPreCommitRepo("local").hooks.find(
      (entry) => entry.id === "commitlint",
    );
    assert.ok(hook, "commitlint hook missing");
    assert.match(hook.entry ?? "", /commitlint --edit/);
    assert.deepEqual(hook.stages, ["commit-msg"]);
  });

  it("SCF-F-13 checks the commits of the change again in the pipeline", () => {
    const job = readJob("commit-messages");
    assert.equal(job.rules, undefined);
    assert.match(scriptOf("commit-messages"), /pnpm exec commitlint --from/);
  });
});

function onlyOnTags(name: string): boolean {
  const rules = readJob(name).rules as Rule[] | undefined;
  assert.ok(rules, `${name} has no rules`);
  const runs = (variables: CiVariables): boolean =>
    rules.some((rule) => rule.if !== undefined && evaluate(rule.if, variables));
  return (
    runs({ CI_COMMIT_TAG: "v1.0.0" }) &&
    !runs(push("dev")) &&
    !runs({ CI_PIPELINE_SOURCE: "merge_request_event" })
  );
}

describe("SCF-AC-6.3 Release tags", () => {
  it("SCF-AC-6.3 runs a pipeline for a pushed tag", () => {
    assert.equal(pipelineRuns({ CI_COMMIT_TAG: "v1.0.0" }), true);
  });

  it("SCF-AC-6.3 takes the release notes of the tag from CHANGELOG.md, only on tags", () => {
    assert.equal(onlyOnTags("release-notes"), true);
    assert.match(
      scriptOf("release-notes"),
      /node scripts\/changelog\.ts notes "\$CI_COMMIT_TAG"/,
    );
  });

  it("SCF-AC-6.3 publishes a GitLab Release for the tag with those notes, only on tags", () => {
    assert.equal(onlyOnTags("release"), true);
    const job = readJob("release");
    assert.deepEqual(job.needs, ["release-notes"]);
    assert.equal(job.release?.tag_name, "$CI_COMMIT_TAG");
    assert.match(job.release?.description ?? "", /release-notes\.md/);
  });
});
