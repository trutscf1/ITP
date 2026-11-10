#!/usr/bin/env node
// Decision helper of the gam-engineering pipeline (P-PIPE-1; procedure in the gam-setup skill, references/pipeline.md).
// Usage: node gam-engineering/tools/pipeline.mjs recommend [answers.json]   (reads stdin without a file)
//        node gam-engineering/tools/pipeline.mjs detect [folder]            (the current folder without one)
//        node gam-engineering/tools/pipeline.mjs propose [input.json]       (reads stdin without a file)
//        node gam-engineering/tools/pipeline.mjs compare [input.json]       (reads stdin without a file)
//        node gam-engineering/tools/pipeline.mjs validate [pipeline.json]   (from the repo root)
//        node gam-engineering/tools/pipeline.mjs render-ci <host> <integration branch> [--write]   (from the repo root)
//        node gam-engineering/tools/pipeline.mjs inventory [folder]         (the project's own CI jobs; pipeline-merge.mjs)
//        node gam-engineering/tools/pipeline.mjs merge [input.json]         (union with the project's jobs; pipeline-merge.mjs)
// Pure functions: the agent passes in what the host answered and gets the recommendation back; the check knowledge
// comes from the catalog pipeline-catalog.json next to this file; doc-check imports validate for its rule PIPE.
// M3 renderCi turns the decision into the host's CI file.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, posix } from "node:path";
import { pathToFileURL } from "node:url";

// HostAnswers → RunnerProbe. An empty answer means the host did not answer or denied access (PP-E-1).
export function probeFromAnswers({ host, project, runners, permissions }) {
  const probe = { host, answered: false, sharedRunnersEnabled: false, onlineRunners: 0, actionsEnabled: false };
  if (host === "github") {
    if (!permissions) return probe;
    return { ...probe, answered: true, actionsEnabled: permissions.enabled === true };
  }
  if (host !== "gitlab" || !project || !Array.isArray(runners)) return probe;
  const shared = project.shared_runners_enabled === true;
  return {
    ...probe,
    answered: true,
    sharedRunnersEnabled: shared,
    onlineRunners: runners.filter((r) => r.runner_type !== "instance_type" || shared).length,
  };
}

// RunnerProbe → Recommendation (PP-F-2); the reason is the one line the location pop-up shows (PP-U-1).
export function recommendLocation(probe) {
  if (!probe.answered) return { location: "local", reason: "runner state unknown" };
  if (probe.host === "github") {
    return probe.actionsEnabled
      ? { location: "both", reason: "Actions enabled" }
      : { location: "local", reason: "Actions disabled" };
  }
  const online = probe.onlineRunners;
  if (online < 1) return { location: "local", reason: "no runner usable" };
  return { location: "both", reason: online === 1 ? "1 runner online" : `${online} runners online` };
}

// A marker glob (only * is special) as an anchored regular expression.
const globPattern = (marker) => new RegExp(`^${marker.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")}$`);

// Root file names → the catalog languages with a marker among them, once each, in catalog order (PP-F-5).
export function detectLanguages(rootFiles, catalog) {
  const matches = (marker) => rootFiles.some((name) => globPattern(marker).test(name));
  return catalog.languages.filter((language) => language.markers.some(matches)).map((language) => language.name);
}

// The repo's paths (relative, with / and a dir flag, already limited to the catalog's depth and skip folders) → the
// languages with the folder their marker lies in, the folders with integration tests or operations configuration, and the
// Dockerfiles as images (PP-F-31). A marker with a / names a folder path; one without names a file or folder.
export function detectProject(paths, catalog) {
  const detection = catalog.detection ?? {};
  const base = (path) => posix.basename(path);
  const parent = (path) => (posix.dirname(path) === "." ? "" : posix.dirname(path));
  const hits = (markers, { files = true, dirs = true } = {}) =>
    paths.filter((item) => (item.dir ? dirs : files) && (markers ?? []).some((marker) =>
      marker.includes("/") ? item.dir && (item.path === marker || item.path.endsWith(`/${marker}`)) : globPattern(marker).test(base(item.path)),
    ));
  // A folder marker is its own folder; a file marker names the folder it lies in.
  const folders = (markers) => [...new Set(hits(markers).map((item) => (item.dir ? item.path : parent(item.path))))].sort();
  const languages = catalog.languages.flatMap((language) =>
    [...new Set(hits(language.markers, { dirs: false }).map((item) => parent(item.path)))].sort().map((cwd) => ({ name: language.name, cwd })),
  );
  const images = hits(detection.dockerfiles, { dirs: false }).map((item) => {
    const folder = parent(item.path);
    const suffix = base(item.path).replace(/^Dockerfile\.?/i, "").replace(/\.?Dockerfile$/i, "");
    const name = [folder ? base(folder) : "app", suffix].filter(Boolean).join("-").toLowerCase().replace(/[^a-z0-9._-]/g, "-");
    return { name, dockerfile: item.path, context: folder || "." };
  });
  return { languages, integration: folders(detection.integration), stackLint: folders(detection.stackLint), images };
}

// The folder walk behind detectProject: depth and skipped folders from the catalog.
export function listPaths(root, catalog) {
  const { depth = 3, skipFolders = [] } = catalog.detection ?? {};
  const paths = [];
  const walk = (folder, level) => {
    let items;
    try {
      items = readdirSync(join(root, folder), { withFileTypes: true });
    } catch {
      return;
    }
    for (const item of items) {
      const path = folder ? `${folder}/${item.name}` : item.name;
      if (item.isDirectory()) {
        if (skipFolders.includes(item.name) || level >= depth) continue;
        paths.push({ path, dir: true });
        walk(path, level + 1);
      } else if (item.isFile()) {
        paths.push({ path, dir: false });
      }
    }
  };
  walk("", 0);
  return paths;
}

// Confirmed languages (names, or { name, cwd } from detectProject), host, tier, and the detected markers → the options of
// the checks pop-up, in this order (PP-F-6, PP-F-7, PP-F-31): the entries without a language (integration and stack-lint
// once per marker folder, only when found), then sast, lint, and tests per language — a perFolder entry, lint, and tests
// once per folder of the language — then the native variants the tier reaches. A check carries cwd only outside the root.
export function proposeChecks(languages, host, hostTier, catalog, markers = {}) {
  // Portable options are recommended as their catalog entry says, lint and tests always, native variants never.
  const option = (kind, language, tool, { threshold = "", native = false, recommended = !native, cwd = "", entry } = {}) => ({
    check: { kind, language, tool, threshold, native, ...(cwd ? { cwd } : {}) },
    recommended,
    ...(entry ? { entry } : {}),
  });
  const found = languages.map((language) => (typeof language === "string" ? { name: language, cwd: "" } : { name: language.name, cwd: language.cwd ?? "" }));
  const confirmed = catalog.languages.filter((language) => found.some((item) => item.name === language.name));
  const cwdsOf = (name) => [...new Set(found.filter((item) => item.name === name).map((item) => item.cwd))];
  const markerCwds = (entry) => (entry.offeredBy === "marker" ? markers[entry.marker] ?? [] : [""]);
  const general = catalog.checks.filter((entry) => entry.language === "" && entry.offeredBy !== "merge" && entry.offeredBy !== "quality");
  const perLanguage = confirmed.flatMap((language) => catalog.checks.filter((entry) => entry.language === language.name));
  // A projectCommand entry runs the project's command line, which the developer names; its option has no tool yet.
  const portable = (entry, cwd) =>
    option(entry.kind, entry.language, entry.projectCommand ? "" : entry.tool, { threshold: entry.defaultThreshold, recommended: entry.recommended, cwd, entry });
  const options = [
    ...general.flatMap((entry) => markerCwds(entry).map((cwd) => portable(entry, cwd))),
    ...perLanguage.flatMap((entry) => (entry.perFolder ? cwdsOf(entry.language) : [""]).map((cwd) => portable(entry, cwd))),
    ...confirmed.filter((language) => language.lintCommand).flatMap((language) =>
      cwdsOf(language.name).map((cwd) => option("lint", language.name, language.lintCommand, { cwd })),
    ),
    ...confirmed.filter((language) => language.testCommand).flatMap((language) =>
      cwdsOf(language.name).map((cwd) => option("tests", language.name, language.testCommand, { cwd })),
    ),
    ...[...general, ...perLanguage].flatMap((entry) =>
      entry.native
        .filter((variant) => variant.host === host && reachesTier(hostTier, variant.minimumTier, host, catalog))
        .map((variant) => option(entry.kind, entry.language, variant.tool, { threshold: entry.defaultThreshold, native: true })),
    ),
  ];
  // Overlapping catalog checks: an entry that yields to an offered check is offered, not recommended (Q279).
  const offered = (target) => options.some(({ check }) => check.kind === target.kind && (target.language === "*" ? check.language !== "" : check.language === target.language));
  const settled = options.map(({ entry, ...rest }) => (entry?.yieldsTo?.some(offered) ? { ...rest, recommended: false } : rest));
  // An entry with offeredBy quality (the step that reads the quality report, Q354) is offered exactly when the quality check is, and follows its final recommendation (after the yield above).
  const quality = settled.find(({ check }) => check.kind === "quality");
  if (quality) {
    for (const entry of catalog.checks.filter((item) => item.offeredBy === "quality")) settled.push(option(entry.kind, entry.language, entry.tool, { threshold: entry.defaultThreshold, recommended: quality.recommended }));
  }
  return settled;
}

// A tier outside the host's list, such as unknown, reaches no minimum tier, and no tier reaches a minimum outside it.
function reachesTier(hostTier, minimumTier, host, catalog) {
  const tiers = (catalog.hostTiers[host] ?? []).map((tier) => tier.toLowerCase());
  const tier = tiers.indexOf(String(hostTier).toLowerCase());
  const minimum = tiers.indexOf(minimumTier.toLowerCase());
  return tier >= 0 && minimum >= 0 && tier >= minimum;
}

// The CI file and trigger of a decision: ci is a path (trigger merge-request) or { file, trigger } (PP-F-33).
// The trigger names answer the question "when": merge-request = at every merge into dev, release-only = at merges into
// main (and on its tags), release-tag = at the release tag only (P-PIPE-8).
export const CI_TRIGGERS = ["merge-request", "release-only", "release-tag", "both"];
export const ciFileOf = (decision) => (typeof decision?.ci === "object" && decision.ci !== null ? decision.ci.file ?? "" : decision?.ci ?? "");
export const ciTriggerOf = (decision) =>
  (typeof decision?.ci === "object" && decision.ci !== null && decision.ci.trigger) || "merge-request";

// The events each trigger runs the host pipeline on, as the loosening line names them.
const TRIGGER_EVENTS = {
  "merge-request": ["merge requests", "the integration branch"],
  "release-only": ["merge requests into main", "main", "tags"],
  "release-tag": ["tags"],
  both: ["merge requests", "the integration branch", "main", "tags"],
};

// When the local pipeline is due (P-PIPE-8): dev = at every merge into the integration branch (default), main = only at
// the merge into main, release = only at the release. In branch model trunk, dev and main are the same merge.
export const LOCAL_WHEN = ["dev", "main", "release"];
export const localWhenOf = (decision) => decision?.localWhen || "dev";
const LOCAL_EVENTS = {
  dev: ["merges into dev", "merges into main", "releases"],
  main: ["merges into main", "releases"],
  release: ["releases"],
};

// Is the pipeline of a location due at this moment (merge-dev, merge-main, release)? The host side follows ci.trigger, the
// local side localWhen. A location the decision does not record is never due; a pipeline not due counts as green (P-MR-3).
const MOMENTS = ["merge-dev", "merge-main", "release"];
const HOST_MOMENTS = {
  "merge-request": MOMENTS,
  "release-only": ["merge-main", "release"],
  "release-tag": ["release"],
  both: MOMENTS,
};
const LOCAL_MOMENTS = { dev: MOMENTS, main: ["merge-main", "release"], release: ["release"] };
export function dueAt(decision, moment, trunk = false) {
  if (!MOMENTS.includes(moment)) throw new Error(`moment must be ${MOMENTS.join(", ")}`);
  const location = decision?.location ?? "none";
  // In branch model trunk the merge into the integration branch is the merge into main.
  const at = trunk && moment === "merge-dev" ? "merge-main" : moment;
  return {
    local: (location === "local" || location === "both") && LOCAL_MOMENTS[localWhenOf(decision)].includes(at),
    host: (location === "host" || location === "both") && (HOST_MOMENTS[ciTriggerOf(decision)] ?? MOMENTS).includes(at),
  };
}

// The identity of a recorded check: kind, language, and folder.
const sameCheck = (check) => (other) =>
  other.kind === check.kind && other.language === check.language && (other.cwd ?? "") === (check.cwd ?? "");
const named = ({ kind, language, cwd }) => [kind, language, cwd ? `(${cwd})` : ""].filter(Boolean).join(" ");

// Previous and next decision → the loosenings the confirmation pop-up names (PP-F-19, PP-F-36), in the order threshold,
// removed checks (in the previous order), a dropped lintOnCommitted, location, trigger. No previous decision, none.
export function compare(previous, next, catalog) {
  if (!previous) return [];
  const checksOf = (decision) => (Array.isArray(decision.checks) ? decision.checks : []);
  const red = (findings) => `${findings} will no longer turn the pipeline red`;
  const thresholds = [];
  const removed = [];
  const committed = [];
  for (const check of checksOf(previous)) {
    const kept = checksOf(next).find(sameCheck(check));
    if (!kept) {
      const where = [check.language && `for ${check.language}`, check.cwd && `in ${check.cwd}`].filter(Boolean).join(" ");
      removed.push({ change: `check ${named(check)} removed`, noLongerRed: red(`${check.kind} findings${where ? ` ${where}` : ""}`) });
      continue;
    }
    if (check.lintOnCommitted === true && kept.lintOnCommitted !== true) {
      committed.push({
        change: `${named(check)} lintOnCommitted dropped`,
        noLongerRed: red("findings hidden by the working tree's line endings"),
      });
    }
    const from = catalog.thresholds.indexOf(check.threshold);
    const to = catalog.thresholds.indexOf(kept.threshold);
    if (from < 0 || to <= from) continue;
    const levels = catalog.thresholds.slice(from, to);
    const listed = levels.length < 3 ? levels.join(" and ") : `${levels.slice(0, -1).join(", ")}, and ${levels.at(-1)}`;
    thresholds.push({ change: `${named(check)} threshold ${check.threshold} → ${kept.threshold}`, noLongerRed: red(`${listed} findings`) });
  }
  // both stands for host and local; a dropped one no longer blocks a merge when it is red.
  const places = (location) => (location === "both" ? ["host", "local"] : [location]);
  const dropped = places(previous.location).filter((place) => !places(next.location).includes(place));
  const location = dropped.map((place) => ({
    change: `location ${previous.location} → ${next.location}`,
    noLongerRed: `a red ${place} pipeline will no longer block a merge`,
  }));
  // Every changed trigger is named; the line lists the events the host pipeline no longer runs on.
  const trigger = [];
  const [from, to] = [ciTriggerOf(previous), ciTriggerOf(next)];
  if (from !== to) {
    const lost = TRIGGER_EVENTS[from].filter((event) => !TRIGGER_EVENTS[to].includes(event));
    trigger.push({
      change: `ci trigger ${from} → ${to}`,
      noLongerRed: lost.length ? `the host pipeline no longer runs on ${lost.join(", ")}` : "the host pipeline runs on other events",
    });
  }
  // A later localWhen drops the merges (or the merge into dev) the local pipeline was due at.
  const when = [];
  const [fromWhen, toWhen] = [localWhenOf(previous), localWhenOf(next)];
  if (fromWhen !== toWhen && LOCAL_EVENTS[fromWhen] && LOCAL_EVENTS[toWhen]) {
    const lost = LOCAL_EVENTS[fromWhen].filter((event) => !LOCAL_EVENTS[toWhen].includes(event));
    if (lost.length) when.push({ change: `local when ${fromWhen} → ${toWhen}`, noLongerRed: `the local pipeline no longer runs at ${lost.join(", ")}` });
  }
  return [...thresholds, ...removed, ...committed, ...location, ...trigger, ...when];
}

// Decision text → PIPE findings (PP-F-17, PP-E-2).
export function validate(decisionText, fileExists) {
  const pipe = (message) => ({ code: "PIPE", message });
  let decision;
  try {
    decision = JSON.parse(decisionText) ?? {};
  } catch {
    return [pipe("pipeline.json is not valid JSON")];
  }
  const findings = [];
  if (!["host", "local", "both", "none"].includes(decision.location)) findings.push(pipe("location must be host, local, both, or none"));
  if (decision.version !== 1) findings.push(pipe("version must be 1"));
  if (decision.docsOnly !== undefined && !["slim", "full"].includes(decision.docsOnly)) findings.push(pipe("docsOnly must be slim or full"));
  if (decision.localWhen !== undefined && !LOCAL_WHEN.includes(decision.localWhen)) findings.push(pipe(`localWhen must be ${LOCAL_WHEN.join(", ")}`));
  if (typeof decision.ci === "object" && decision.ci !== null && !CI_TRIGGERS.includes(ciTriggerOf(decision))) {
    findings.push(pipe(`ci.trigger must be ${CI_TRIGGERS.join(", ")}`));
  }
  // An empty path names no file: `ci` is empty for `local`, `localScript` until the local script ships (A45).
  for (const path of [ciFileOf(decision), decision.localScript]) {
    if (typeof path === "string" && path !== "" && !fileExists(path)) findings.push(pipe(`file not found: ${path}`));
  }
  // A folder is relative to the repo root and stays inside it (PP-F-32).
  const badFolder = (path) => typeof path !== "string" || /^([a-z]:|[\\/])/i.test(path) || path.split(/[\\/]/).includes("..");
  for (const check of Array.isArray(decision.checks) ? decision.checks : []) {
    const label = named(check);
    if (check.cwd !== undefined && check.cwd !== "") {
      if (badFolder(check.cwd)) findings.push(pipe(`${label}: cwd must be a folder inside the repo`));
      else if (!fileExists(check.cwd)) findings.push(pipe(`${label}: folder not found: ${check.cwd}`));
    }
    if (check.tier !== undefined && !["merge", "release"].includes(check.tier)) findings.push(pipe(`${label}: tier must be merge or release`));
    if (check.after !== undefined && !(Array.isArray(check.after) && check.after.every((kind) => typeof kind === "string" && kind))) {
      findings.push(pipe(`${label}: after must be a list of check kinds`));
    }
    if (check.lintOnCommitted !== undefined && !["lint", "format"].includes(check.kind)) {
      findings.push(pipe(`${label}: lintOnCommitted applies to lint and format checks only`));
    }
    for (const service of check.kind === "integration" ? check.services ?? [] : []) {
      if (!service?.name || !service?.image || !Number.isInteger(service?.port)) findings.push(pipe(`${label}: every service needs name, image, and port`));
    }
  }
  for (const image of Array.isArray(decision.images) ? decision.images : []) {
    if (!image?.name || !image?.dockerfile) findings.push(pipe("every image needs name and dockerfile"));
    else if (!fileExists(image.dockerfile)) findings.push(pipe(`file not found: ${image.dockerfile}`));
  }
  return findings;
}

// The CI file per host (PP-F-12); includeIn is the root CI file that must include it, render the host's dialect.
const CI_FILES = {
  gitlab: { path: "gam-engineering/ci/gitlab-pipeline.yml", includeIn: ".gitlab-ci.yml", render: renderGitlab },
  github: { path: ".github/workflows/gam-engineering-pipeline.yml", includeIn: "", render: renderGithub },
};

// Decision → CiFile (PP-F-12, PP-F-13, PP-F-14, PP-F-33, PP-F-35): one job per recorded check in their order, the docs job
// always, triggers from ci.trigger (merge requests and the integration branch by default), then one build job per image.
// A check the catalog cannot render fails the whole file (A63).
// The project's copy of doc-check: gam-ai-knowledge/tools/, or a former folder in a project not yet moved (P-DOC-10,
// P-DOC-11). The CI file names the copy that exists when it is rendered; the move regenerates it.
export const DOC_CHECK_PATHS = ["gam-ai-knowledge/tools/doc-check.mjs", "gam-engineering/tools/doc-check.mjs", "humanengineering/tools/doc-check.mjs"];
export const findDocCheck = (repoRoot) => DOC_CHECK_PATHS.find((path) => existsSync(join(repoRoot, path))) ?? DOC_CHECK_PATHS[0];

// The install line of a Node job by the lock file in its folder: the catalog's `npm ci` stands for it, because npm ci
// fails without package-lock.json (schoolquiz 0.26.0). A folder without a lock file gets no install step. One line each,
// so it runs in the check's folder as a whole.
export const NODE_INSTALL = {
  "package-lock.json": "npm ci",
  "pnpm-lock.yaml": "corepack enable && pnpm install --frozen-lockfile",
  "yarn.lock": "corepack enable && yarn install --immutable",
};
export const LOCK_FILES = Object.keys(NODE_INSTALL);
export const findLockFile = (repoRoot) => (cwd) => LOCK_FILES.find((name) => existsSync(join(repoRoot, cwd || "", name))) ?? "";

// lockOf(cwd) names the lock file of a check's folder; without it every Node job keeps npm ci.
export function renderCi(decision, host, integrationBranch, catalog, docCheck = DOC_CHECK_PATHS[0], lockOf = () => "package-lock.json") {
  const file = CI_FILES[host];
  if (!file) throw new Error(`host ${host}: no CI dialect`);
  const checks = Array.isArray(decision.checks) ? decision.checks : [];
  const recorded = checks.some((check) => check.kind === "docs")
    ? checks
    : [...checks, { kind: "docs", language: "", tool: "doc-check", threshold: "", native: false }];
  const entryOf = (check) => catalog.checks.find((item) => item.kind === check.kind && item.language === check.language);
  // A check the catalog marks localOnly has no CI job (PP-F-24); a project command without a language image runs on the host
  // only when the decision names its ciImage (PP-F-34).
  const runsOnHost = (check) => {
    const entry = entryOf(check);
    if (entry?.localOnly) return false;
    return !(entry?.projectCommand && !check.ciImage);
  };
  const jobs = recorded.filter(runsOnHost).map((check) => ({ name: jobName(check), ...ciJob(check, host, decision.hostTier, catalog, docCheck, lockOf) }));
  const images = (Array.isArray(decision.images) ? decision.images : []).map((image) => ({ ...image, job: `gam-build-${image.name}` }));
  const events = ciEvents(ciTriggerOf(decision), integrationBranch, images.length > 0);
  const { render, ...ciFile } = file;
  return { ...ciFile, content: render(jobs, events, images) };
}

// The events of a trigger (PP-F-33): the branches whose pushes run the checks, whether merge requests run them (into
// main only for release-only), whether release tags run them, and the branches whose pushes build the images.
const RELEASE_BRANCH = "main";
function ciEvents(trigger, integrationBranch, hasImages) {
  const unique = (branches) => [...new Set(branches)];
  const byTrigger = {
    "merge-request": { mergeRequests: "all", branches: [integrationBranch], tags: hasImages },
    "release-only": { mergeRequests: RELEASE_BRANCH, branches: [RELEASE_BRANCH], tags: true },
    "release-tag": { mergeRequests: null, branches: [], tags: true },
    both: { mergeRequests: "all", branches: unique([integrationBranch, RELEASE_BRANCH]), tags: true },
  }[trigger];
  return { trigger, ...byTrigger };
}

// gam-<kind> or gam-<kind>-<language>, the language in lower case and C# as csharp, then the folder of a check outside the
// root (PP-F-32).
const jobName = ({ kind, language, cwd }) =>
  ["gam", kind, language ? language.toLowerCase().replace("c#", "csharp") : "", cwd ? cwd.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : ""]
    .filter(Boolean)
    .join("-");

// A command line run in the check's folder: in a subshell, so a later line of the same job starts in the root again.
const inFolder = (cwd, line) => (cwd ? `(cd ${/^[\w./-]+$/.test(cwd) ? cwd : `'${cwd.replaceAll("'", "'\\''")}'`} && ${line})` : line);

// {cwdFlag} and {versionFlag} become --cwd=<folder> and --version=<version>, or vanish when the check has none (PP-F-32).
const expandFlags = (line, check) =>
  line
    .replaceAll(" {cwdFlag}", check.cwd ? ` --cwd=${check.cwd}` : "")
    .replaceAll("{cwdFlag}", check.cwd ? `--cwd=${check.cwd}` : "")
    .replaceAll(" {versionFlag}", check.version ? ` --version=${check.version}` : "")
    .replaceAll("{versionFlag}", check.version ? `--version=${check.version}` : "");

// The CiJobTemplate of a check, its script ready to run: lint and tests run the recorded command in their language's job,
// a project command without a language in its ciImage, a native check its host's variant when the tier reaches it (the
// portable job otherwise, A70), every other check its entry's job. A command with {cwdFlag} runs from the root and is
// told the folder; every other line of a check with cwd runs in that folder.
function ciJob(check, host, hostTier, catalog, docCheck, lockOf = () => "package-lock.json") {
  const missing = () => new Error(`no catalog entry for ${check.kind} ${check.language}`.trim());
  const entry = catalog.checks.find((item) => item.kind === check.kind && item.language === check.language);
  const install = (line) => (line === "npm ci" ? NODE_INSTALL[lockOf(check.cwd ?? "")] ?? "" : line);
  const placed = (template, script) => ({
    ...template,
    setup: (template.setup ?? []).map(install).filter(Boolean).map((line) => inFolder(check.cwd, line)),
    script: script.map((line) => (line.includes("{cwdFlag}") ? expandFlags(line, check) : inFolder(check.cwd, expandFlags(line, check)))),
  });
  if (check.kind === "lint" || check.kind === "tests") {
    const template = catalog.languages.find((language) => language.name === check.language)?.ciJob?.[host];
    if (!template) throw missing();
    return placed(template, [check.tool]);
  }
  if (entry?.projectCommand) {
    return placed({ image: check.ciImage, variables: {}, setup: [], sastReport: "" }, [check.tool]);
  }
  const variant = check.native
    ? entry?.native.find((item) => item.host === host && reachesTier(hostTier, item.minimumTier, host, catalog))
    : undefined;
  const template = variant?.ciJob ?? entry?.ciJob?.[host];
  if (!template) throw missing();
  const script = template.script.map((line) => {
    if (line.includes("{threshold}")) {
      if (!catalog.thresholds.includes(check.threshold)) throw new Error(`unknown threshold: ${check.threshold}`);
      const levels = catalog.thresholds.slice(catalog.thresholds.indexOf(check.threshold));
      line = line.replaceAll("{threshold}", levels.map((level) => level.toUpperCase()).join(","));
    }
    return line.replaceAll("{repoRoot}", ".").replaceAll("{docCheck}", docCheck);
  });
  return entry?.perFolder
    ? placed(template, script)
    : { ...template, setup: (template.setup ?? []).map(install).filter(Boolean), script: script.map((line) => expandFlags(line, check)) };
}

// A YAML list item or value, plain where YAML reads it as the same text, else in single quotes.
const yamlText = (text) =>
  /^[\s\-?:,[\]{}#&*!|>'"%@`]|: | #|:$|\s$|^$|^(true|false|null|yes|no|on|off|~|[-+.\d][\d._]*)$/i.test(text)
    ? `'${text.replaceAll("'", "''")}'`
    : text;

// The first header line is the same for every file; the second names the events.
const HEADER = "# Generated by gam-engineering from gam-engineering/pipeline.json; regenerate it with /gam-engineering pipeline";
function eventsLine(events, request) {
  if (events.trigger === "merge-request" && !events.tags) return `# instead of editing it. Runs for ${request}s and on the integration branch only.`;
  if (events.trigger === "release-tag") return "# instead of editing it. Runs on release tags only (trigger release-tag).";
  const requests = events.mergeRequests === "all" ? `${request}s` : `${request}s into ${events.mergeRequests}`;
  return `# instead of editing it. Runs for ${requests}, on ${events.branches.join(" and ")}${events.tags ? ", and on release tags" : ""} (trigger ${events.trigger}).`;
}

const RELEASE_TAG_GITLAB = "$CI_COMMIT_TAG =~ /^v[0-9]+\\.[0-9]+\\.[0-9]+$/";

function renderGitlab(jobs, events, images) {
  const mergeRequestRule =
    events.mergeRequests === "all"
      ? '$CI_PIPELINE_SOURCE == "merge_request_event"'
      : `$CI_PIPELINE_SOURCE == "merge_request_event" && $CI_MERGE_REQUEST_TARGET_BRANCH_NAME == ${JSON.stringify(events.mergeRequests)}`;
  const branchRules = events.branches.map((branch) => `$CI_COMMIT_BRANCH == ${JSON.stringify(branch)}`);
  const tagRules = events.tags ? [RELEASE_TAG_GITLAB] : [];
  const lines = [HEADER, eventsLine(events, "merge request"), "", ".gam-engineering:", "  stage: test", "  rules:"];
  // release-tag has no merge request event at all.
  lines.push(...[events.mergeRequests ? mergeRequestRule : null, ...branchRules, ...tagRules].filter(Boolean).map((rule) => `    - if: ${rule}`));
  for (const job of jobs) {
    lines.push("", `${job.name}:`, "  extends: .gam-engineering", "  image:", `    name: ${yamlText(job.image)}`, '    entrypoint: [""]');
    const variables = Object.entries(job.variables ?? {});
    if (variables.length) lines.push("  variables:", ...variables.map(([key, value]) => `    ${key}: ${JSON.stringify(value)}`));
    if (job.setup?.length) lines.push("  before_script:", ...job.setup.map((line) => `    - ${yamlText(line)}`));
    lines.push("  script:", ...job.script.map((line) => `    - ${yamlText(line)}`));
    if (job.sastReport) lines.push("  artifacts:", "    reports:", `      sast: ${yamlText(job.sastReport)}`);
  }
  // One build job per image after every check job, on pushes only, pushed to the project's registry (PP-F-35).
  for (const image of images) {
    const target = `$CI_REGISTRY_IMAGE/${image.name}`;
    lines.push(
      "",
      `${image.job}:`,
      "  stage: test",
      `  needs: [${jobs.map((job) => job.name).join(", ")}]`,
      "  image: docker:27",
      "  services: [docker:27-dind]",
      "  variables:",
      '    DOCKER_TLS_CERTDIR: "/certs"',
      "  rules:",
      ...[...branchRules, RELEASE_TAG_GITLAB].map((rule) => `    - if: ${rule}`),
      "  before_script:",
      `    - ${yamlText('echo "$CI_REGISTRY_PASSWORD" | docker login -u "$CI_REGISTRY_USER" --password-stdin "$CI_REGISTRY"')}`,
      "  script:",
      `    - ${yamlText(`docker build -f ${image.dockerfile} -t "${target}:$CI_COMMIT_SHORT_SHA" ${image.context ?? "."}`)}`,
      `    - ${yamlText(`docker push "${target}:$CI_COMMIT_SHORT_SHA"`)}`,
      `    - ${yamlText(`if [ -n "$CI_COMMIT_TAG" ]; then docker tag "${target}:$CI_COMMIT_SHORT_SHA" "${target}:$CI_COMMIT_TAG" && docker push "${target}:$CI_COMMIT_TAG"; fi`)}`,
    );
  }
  return `${lines.join("\n")}\n`;
}

// Every job runs in its catalog image and checks out the full history with the tags first (A84). The checkout action is
// part of the dialect, like GitLab's empty entrypoint, not a check tool, so its pinned tag lives here and not in the catalog.
function renderGithub(jobs, events, images) {
  const lines = [HEADER, eventsLine(events, "pull request"), "", "name: gam-engineering", "", "on:"];
  if (events.mergeRequests) {
    lines.push("  pull_request:");
    if (events.mergeRequests !== "all") lines.push(`    branches: [${JSON.stringify(events.mergeRequests)}]`);
  }
  lines.push("  push:");
  if (events.branches.length) lines.push(`    branches: [${events.branches.map((branch) => JSON.stringify(branch)).join(", ")}]`);
  if (events.tags) lines.push('    tags: ["v*.*.*"]');
  lines.push("", "permissions:", "  contents: read", "", "jobs:");
  jobs.forEach((job, index) => {
    if (index > 0) lines.push("");
    lines.push(`  ${job.name}:`, "    runs-on: ubuntu-latest", "    container:", `      image: ${yamlText(job.image)}`);
    const variables = Object.entries(job.variables ?? {});
    if (variables.length) lines.push("    env:", ...variables.map(([key, value]) => `      ${key}: ${JSON.stringify(value)}`));
    lines.push("    steps:", "      - uses: actions/checkout@v5.0.0", "        with:", "          fetch-depth: 0");
    lines.push(...[...(job.setup ?? []), ...job.script].map((line) => `      - run: ${yamlText(line)}`));
  });
  // One build job per image after every check job, on pushes only, pushed to the GitHub registry (PP-F-35).
  for (const image of images) {
    const target = `ghcr.io/$(echo "$GITHUB_REPOSITORY" | tr '[:upper:]' '[:lower:]')/${image.name}`;
    lines.push(
      "",
      `  ${image.job}:`,
      "    runs-on: ubuntu-latest",
      `    needs: [${jobs.map((job) => job.name).join(", ")}]`,
      "    if: github.event_name == 'push'",
      "    permissions:",
      "      contents: read",
      "      packages: write",
      "    steps:",
      "      - uses: actions/checkout@v5.0.0",
      `      - run: ${yamlText('echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_ACTOR" --password-stdin')}`,
      "        env:",
      "          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}",
      `      - run: ${yamlText(`image="${target}" && docker build -f ${image.dockerfile} -t "$image:$GITHUB_SHA" ${image.context ?? "."} && docker push "$image:$GITHUB_SHA"`)}`,
      `      - run: ${yamlText(`if [ "$GITHUB_REF_TYPE" = tag ]; then image="${target}" && docker tag "$image:$GITHUB_SHA" "$image:$GITHUB_REF_NAME" && docker push "$image:$GITHUB_REF_NAME"; fi`)}`,
    );
  }
  return `${lines.join("\n")}\n`;
}

// CLI: JSON in, JSON out; exit code 1 when validate finds an error, runner-gaps finds a gap, or render-ci cannot render the decision,
// 2 on a usage error.
// Each command reads its input as JSON, as text, or as a folder path (detect, inventory). validate takes the decision text as
// it is, since unparsable text is one of its findings; it resolves the paths the decision names against the current
// folder, the repo root. render-ci reads gam-engineering/pipeline.json from there and, with --write, writes the CI file
// there, so the agent never copies YAML out of JSON (A64). The catalog is read only by the commands that need it, so
// doc-check needs no catalog copy.
const readCatalog = () => JSON.parse(readFileSync(new URL("./pipeline-catalog.json", import.meta.url), "utf8"));

// What a local runner copy lacks that the decision needs (PP-F-47): an edited copy is kept (PP-F-18), so an older runner
// may miss a feature a recorded check relies on. Each feature is found by a marker the template has carried since it
// came in; the result names what the old runner does instead, for the question that offers the template.
const RUNNER_FEATURES = [
  {
    feature: "tier",
    marker: /\$Tier\b/,
    needed: (checks, catalog) => checks.filter((check) => checkTier(check, catalog) === "release"),
    consequence: (names) => `runs the release-tier checks ${names} on every merge`,
  },
  {
    feature: "not-run",
    marker: /'not run'/,
    needed: (checks, catalog) => checks.filter((check) => catalogEntry(check, catalog)?.skipExit !== undefined),
    consequence: (names) => `counts the skip exit code of ${names} as red instead of not run`,
  },
  {
    feature: "skip",
    marker: /\$Skip\b/,
    needed: (checks) => checks.filter((check) => check.kind === "quality"),
    consequence: (names) => `does not know -Skip, which leaves out ${names} when gam-sonar is missing`,
  },
  {
    feature: "live-report",
    marker: /New-RunFolder/,
    needed: (checks) => checks,
    consequence: () => "writes the report only when the whole run ends, so a hanging check shows nothing",
  },
];

function catalogEntry(check, catalog) {
  if (check.kind === "lint" || check.kind === "tests") return undefined;
  return catalog.checks.find((entry) => entry.kind === check.kind && `${entry.language ?? ""}` === `${check.language ?? ""}`);
}

function checkTier(check, catalog) {
  if (check.tier === "merge" || check.tier === "release") return check.tier;
  return catalogEntry(check, catalog)?.tier ?? "merge";
}

export function runnerGaps(scriptText, decision, catalog) {
  const checks = Array.isArray(decision?.checks) ? decision.checks : [];
  const gaps = [];
  for (const { feature, marker, needed, consequence } of RUNNER_FEATURES) {
    if (marker.test(scriptText)) continue;
    const relying = needed(checks, catalog);
    if (relying.length === 0) continue;
    const names = relying.map((check) => [check.kind, check.language].filter(Boolean).join(" ")).join(", ");
    gaps.push({ feature, checks: relying.map((check) => [check.kind, check.language].filter(Boolean).join(" ")), consequence: consequence(names) });
  }
  return gaps;
}

const COMMANDS = {
  recommend: { read: "json", run: (answers) => [recommendLocation(probeFromAnswers(answers)), 0] },
  detect: {
    read: "path",
    run: (folder) => {
      const catalog = readCatalog();
      return [detectProject(listPaths(folder, catalog), catalog), 0];
    },
  },
  propose: {
    read: "json",
    run: ({ languages, host, hostTier, markers }) => [proposeChecks(languages ?? [], host, hostTier, readCatalog(), markers ?? {}), 0],
  },
  // The merge commands live in pipeline-merge.mjs, loaded only here, so doc-check, which imports validate, never needs it.
  inventory: {
    read: "path",
    run: async (folder) => [(await import("./pipeline-merge.mjs")).inventory(folder, readCatalog()), 0],
  },
  merge: {
    read: "json",
    run: async ({ rows, proposed }) => {
      if (!Array.isArray(rows) || !Array.isArray(proposed)) throw new UsageError('usage: node pipeline.mjs merge [input.json] with { "rows", "proposed" }');
      return [(await import("./pipeline-merge.mjs")).mergePipelines(rows, proposed, readCatalog()), 0];
    },
  },
  compare: {
    read: "json",
    run: ({ previous, next }) => {
      if (!next || typeof next !== "object") throw new UsageError('usage: node pipeline.mjs compare [input.json] with { "previous", "next" }');
      return [compare(previous ?? null, next, readCatalog()), 0];
    },
  },
  validate: {
    read: "text",
    run: (text) => {
      const findings = validate(text, existsSync);
      return [findings, findings.length ? 1 : 0];
    },
  },
  // `due <moment> [--trunk]`: which pipelines the recorded decision makes due at merge-dev, merge-main, or release (P-PIPE-8).
  due: {
    read: "decision",
    run: (decision, [moment, flag]) => {
      if (!MOMENTS.includes(moment) || (flag !== undefined && flag !== "--trunk")) {
        throw new UsageError(`usage: node pipeline.mjs due <${MOMENTS.join(" | ")}> [--trunk]`);
      }
      return [dueAt(decision, moment, flag === "--trunk"), 0];
    },
  },
  "runner-gaps": {
    read: "decision",
    run: (decision) => {
      const script = decision.localScript || "gam-engineering/local-pipeline.ps1";
      if (!existsSync(script)) return [[], 0];
      const gaps = runnerGaps(readFileSync(script, "utf8"), decision, readCatalog());
      return [gaps, gaps.length ? 1 : 0];
    },
  },
  "render-ci": {
    read: "decision",
    run: (decision, [host, integrationBranch, flag]) => {
      if (!CI_FILES[host] || !integrationBranch || (flag !== undefined && flag !== "--write")) {
        throw new UsageError(
          CI_FILES[host] || !host
            ? "usage: node pipeline.mjs render-ci <host> <integration branch> [--write]"
            : `host ${host}: no CI dialect; supported: ${Object.keys(CI_FILES).join(", ")}`,
        );
      }
      let file;
      try {
        file = renderCi(decision, host, integrationBranch, readCatalog(), findDocCheck("."), findLockFile("."));
      } catch (err) {
        console.error(`pipeline.mjs render-ci: ${err.message}`);
        return [null, 1];
      }
      if (flag === "--write") {
        mkdirSync(dirname(file.path), { recursive: true });
        writeFileSync(file.path, file.content);
      }
      return [file, 0];
    },
  },
};

class UsageError extends Error {}

async function main([command, file, ...rest]) {
  const entry = COMMANDS[command];
  if (!entry) {
    console.error(`usage: node pipeline.mjs <${Object.keys(COMMANDS).join(" | ")}> [input]`);
    return 2;
  }
  let input;
  try {
    input =
      entry.read === "path"
        ? file ?? "."
        : readFileSync(entry.read === "decision" ? "gam-engineering/pipeline.json" : file ?? 0, "utf8");
  } catch (err) {
    console.error(`pipeline.mjs ${command}: cannot read the input (${err.message})`);
    return 2;
  }
  if (entry.read === "json" || entry.read === "decision") {
    try {
      input = JSON.parse(input);
    } catch (err) {
      console.error(`pipeline.mjs ${command}: input is not valid JSON (${err.message})`);
      return 2;
    }
  }
  let output, status;
  try {
    [output, status] = await entry.run(input, [file, ...rest]);
  } catch (err) {
    if (!(err instanceof UsageError)) throw err;
    console.error(err.message);
    return 2;
  }
  if (output !== null) console.log(JSON.stringify(output, null, 2));
  return status;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await main(process.argv.slice(2));
}
