// Merge helper of the gam-engineering pipeline (P-PIPE-5; procedure in the gam-setup skill, references/pipeline.md,
// "Merge with an existing pipeline"). Loaded by pipeline.mjs for its commands inventory and merge, never by doc-check.
// inventory reads the project's own CI files into job rows; mergePipelines unites those rows with the proposed gam
// checks and names every duplicate and overlap (PP-F-37, PP-F-38, Q278).
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// ---- A YAML subset: block mappings and sequences, plain and quoted scalars, flow sequences, block scalars, comments.
// Anchors, aliases, and merge keys are read as plain text; the inventory needs job names, commands, and rules only.

const stripComment = (line) => {
  let quote = "";
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quote) {
      if (c === quote) quote = "";
    } else if (c === "'" || c === '"') {
      quote = c;
    } else if (c === "#" && (i === 0 || /\s/.test(line[i - 1]))) {
      return line.slice(0, i);
    }
  }
  return line;
};

function scalar(text) {
  const value = text.trim();
  if (value.startsWith('"') && value.endsWith('"') && value.length > 1) {
    try {
      return JSON.parse(value);
    } catch {
      return value.slice(1, -1);
    }
  }
  if (value.startsWith("'") && value.endsWith("'") && value.length > 1) return value.slice(1, -1).replaceAll("''", "'");
  if (value.startsWith("[") && value.endsWith("]")) {
    const inner = value.slice(1, -1).trim();
    return inner ? inner.split(",").map((item) => scalar(item)) : [];
  }
  return value;
}

// The index of the colon that ends a mapping key, outside quotes, or -1.
function keyColon(text) {
  let quote = "";
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === quote) quote = "";
    } else if (c === "'" || c === '"') {
      quote = c;
    } else if (c === ":" && (i === text.length - 1 || text[i + 1] === " ")) {
      return i;
    }
  }
  return -1;
}

export function parseYaml(text) {
  const lines = text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((raw) => ({ raw, indent: raw.length - raw.trimStart().length, text: stripComment(raw).trimEnd() }));
  let index = 0;
  const skipBlank = () => {
    while (index < lines.length && lines[index].text.trim() === "") index++;
  };
  // A block scalar: the following lines indented deeper than its owner, joined by newlines (| and >, kept as lines).
  function blockScalar(ownerIndent) {
    const body = [];
    while (index < lines.length && (lines[index].raw.trim() === "" || lines[index].indent > ownerIndent)) {
      body.push(lines[index].raw.trim());
      index++;
    }
    return body.join("\n").trim();
  }
  function value(text, ownerIndent) {
    // An anchor (&name) only names the value that follows; the value is read as if it were not there.
    const rest = text.replace(/^&[^\s]+\s*/, "");
    if (/^[|>][+-]?$/.test(rest)) return blockScalar(ownerIndent);
    if (rest !== "") return scalar(rest);
    skipBlank();
    if (index >= lines.length || lines[index].indent <= ownerIndent) {
      if (index < lines.length && lines[index].indent === ownerIndent && lines[index].text.trim().startsWith("- ")) return node(ownerIndent);
      return "";
    }
    return node(lines[index].indent);
  }
  function node(indent) {
    skipBlank();
    if (index >= lines.length) return "";
    const first = lines[index].text.trim();
    if (first === "-" || first.startsWith("- ")) {
      const list = [];
      while (index < lines.length) {
        skipBlank();
        if (index >= lines.length || lines[index].indent !== indent) break;
        const item = lines[index].text.trim();
        if (!(item === "-" || item.startsWith("- "))) break;
        const rest = item.slice(1).trim();
        const colon = keyColon(rest);
        if (colon > 0 && !rest.startsWith('"') && !rest.startsWith("'")) {
          // A mapping that starts on the dash line: re-read it as a mapping indented past the dash.
          const inner = indent + 2;
          lines[index] = { ...lines[index], indent: inner, text: `${" ".repeat(inner)}${rest}` };
          list.push(node(inner));
        } else {
          index++;
          list.push(value(rest, indent));
        }
      }
      return list;
    }
    const map = {};
    while (index < lines.length) {
      skipBlank();
      // A line indented deeper than any key here belongs to nothing this subset reads; it is skipped, not a stop.
      if (index < lines.length && lines[index].indent > indent) {
        index++;
        continue;
      }
      if (index >= lines.length || lines[index].indent !== indent) break;
      const line = lines[index].text.trim();
      const colon = keyColon(line);
      if (colon < 0 || line.startsWith("- ")) break;
      const key = scalar(line.slice(0, colon));
      index++;
      map[key] = value(line.slice(colon + 1).trim(), indent);
    }
    return map;
  }
  return node(0);
}

// ---- Inventory

const GITLAB_RESERVED = ["stages", "variables", "default", "include", "workflow", "image", "services", "before_script", "after_script", "cache", "pages"];
const asList = (value) => (Array.isArray(value) ? value : value === undefined || value === "" ? [] : [value]);
const commandText = (lines) => asList(lines).flat().map(String).filter(Boolean).join(" && ");

// The folder a job works in: GitHub's working-directory, else the first cd of its command.
function folderOf(command, workingDirectory = "") {
  if (workingDirectory) return workingDirectory.replace(/^\.\//, "").replace(/\/$/, "");
  const match = /(?:^|&&|;|\()\s*cd\s+["']?([^\s"';&)]+)/.exec(command);
  return match ? match[1].replace(/^\.\//, "").replace(/\/$/, "") : "";
}

// Job name and command → the suggested catalog kind and language; the agent confirms each row (PP-F-37).
const KIND_RULES = [
  ["image-build", /docker (buildx )?build|kaniko|buildah bud|docker push/],
  ["quality", /sonar/],
  ["integration", /\bbats\b|integration|ops-test|\bops\b.*test/],
  ["stack-lint", /compose( -f \S+)* config|hadolint|kubeconform|kubeval|tflint|terraform validate|nginx -t|caddy validate|stack-lint|\bstack\b/],
  ["secrets", /gitleaks|trufflehog/],
  ["sast", /semgrep/],
  ["audit", /\btrivy\b|npm audit|pnpm audit|yarn audit|composer audit|pip-audit|cargo audit/],
  ["docs", /doc-check|markdownlint/],
  ["e2e", /playwright|cypress|\be2e\b/],
  ["types", /\btsc\b|vue-tsc|mypy/],
  ["format", /biome (format|check)|prettier|php-cs-fixer|\bblack\b|format/],
  ["lint", /lint|eslint|biome|pint|phpstan|psalm|ruff|flake8|clippy|golangci|rubocop|go vet/],
  ["tests", /test|phpunit|\bpest\b|vitest|jest|pytest|mocha|rspec/],
];
const LANGUAGE_RULES = [
  ["PHP", /composer|phpunit|\bpest\b|pint|phpstan|psalm|\bphp\b/],
  ["TypeScript", /\btsc\b|vitest|biome|vue-tsc/],
  ["Node", /\bnpm\b|\bpnpm\b|\byarn\b|\bnode\b|jest|eslint/],
  ["Python", /pytest|ruff|flake8|mypy|\bpip\b|python/],
  ["Go", /\bgo (test|vet|build)\b|golangci/],
  ["Rust", /cargo/],
  ["Java", /\bmvn\b|gradle/],
  ["C#", /dotnet/],
];
// The job name decides first, since a test job may also lint; the command decides when the name says nothing.
export function suggestKind(name, command) {
  const text = `${name} ${command}`.toLowerCase();
  const byName = KIND_RULES.find(([, pattern]) => pattern.test(name.toLowerCase()))?.[0];
  const kind = byName ?? KIND_RULES.find(([, pattern]) => pattern.test(command.toLowerCase()))?.[0] ?? "custom";
  const language = ["lint", "tests", "format", "types", "e2e"].includes(kind) ? LANGUAGE_RULES.find(([, pattern]) => pattern.test(text))?.[0] ?? "" : "";
  return { kind, language: kind === "custom" ? "" : language, cwd: folderOf(command) };
}

const describeRules = (job) => {
  const rules = asList(job.rules).map((rule) => (typeof rule === "object" && rule !== null ? rule.if ?? JSON.stringify(rule) : String(rule)));
  if (rules.length) return rules.join("; ");
  if (job.only) return `only ${asList(job.only.refs ?? job.only).join(", ")}`;
  return "every pipeline";
};

function gitlabRows(root, path, seen = new Set()) {
  if (seen.has(path) || !existsSync(join(root, path))) return [];
  seen.add(path);
  const doc = parseYaml(readFileSync(join(root, path), "utf8"));
  if (typeof doc !== "object" || Array.isArray(doc)) return [];
  const includes = asList(doc.include).map((item) => (typeof item === "string" ? item : item?.local)).filter(Boolean);
  const rows = [];
  for (const [name, job] of Object.entries(doc)) {
    if (name.startsWith(".") || GITLAB_RESERVED.includes(name) || typeof job !== "object" || Array.isArray(job)) continue;
    // One level of extends: the template's scripts fill what the job leaves out.
    const base = asList(job.extends).map((parent) => doc[parent]).filter((parent) => typeof parent === "object");
    const merged = Object.assign({}, ...base, job);
    const command = commandText([...asList(merged.before_script), ...asList(merged.script)]);
    if (!command) continue;
    rows.push({ job: name, source: path, checks: merged.stage ?? "", trigger: describeRules(merged), command, suggested: suggestKind(name, command) });
  }
  return [...rows, ...includes.flatMap((include) => gitlabRows(root, include.replace(/^\//, ""), seen))];
}

function githubRows(root) {
  const folder = join(root, ".github/workflows");
  if (!existsSync(folder)) return [];
  return readdirSync(folder)
    .filter((file) => /\.ya?ml$/.test(file) && !file.startsWith("gam-engineering-"))
    .flatMap((file) => {
      const doc = parseYaml(readFileSync(join(folder, file), "utf8"));
      const on = doc.on ?? doc[true] ?? "";
      const trigger = typeof on === "object" && !Array.isArray(on) ? Object.keys(on).join(", ") : asList(on).join(", ");
      return Object.entries(doc.jobs ?? {}).flatMap(([name, job]) => {
        const steps = asList(job?.steps).filter((step) => step?.run);
        if (!steps.length) return [];
        const command = commandText(steps.map((step) => step.run.split("\n")));
        const cwd = steps.find((step) => step["working-directory"])?.["working-directory"] ?? job?.defaults?.run?.["working-directory"] ?? "";
        const suggested = suggestKind(name, command);
        return [{ job: name, source: `.github/workflows/${file}`, checks: job.name ?? "", trigger, command, suggested: { ...suggested, cwd: folderOf(command, cwd) } }];
      });
    });
}

// The project's own CI jobs as rows "job, what it checks, trigger, command" with a suggested kind (PP-F-37). The gam
// files are not the project's own and stay out. Local scripts are read by the agent into rows of the same form.
export function inventory(root) {
  return [...gitlabRows(root, ".gitlab-ci.yml").filter((row) => !row.source.startsWith("gam-engineering/")), ...githubRows(root)];
}

// ---- Merge

// The tool words of a command among the catalog's overlapTools, e.g. biome or phpunit.
const toolWords = (command, catalog) => {
  const words = String(command ?? "").toLowerCase().split(/[^a-z0-9._-]+/);
  return (catalog.detection?.overlapTools ?? []).filter((tool) => words.includes(tool));
};

// What makes a check precise (PP-F-38): its own command, a folder, lintOnCommitted, settings.
function precision(check, catalog) {
  const language = catalog.languages.find((item) => item.name === check.language);
  const entry = catalog.checks.find((item) => item.kind === check.kind && item.language === check.language);
  const defaultTool = check.kind === "lint" ? language?.lintCommand : check.kind === "tests" ? language?.testCommand : entry?.tool;
  const reasons = [];
  if (check.tool && check.tool !== defaultTool) reasons.push(`its own command \`${check.tool}\``);
  if (check.cwd) reasons.push(`folder ${check.cwd}`);
  if (check.lintOnCommitted) reasons.push("lintOnCommitted");
  for (const field of ["settings", "exclude", "services", "version"]) if (check[field] && Object.keys(check[field]).length) reasons.push(field);
  return reasons;
}

const label = ({ kind, language, cwd }) => [kind, language, cwd ? `(${cwd})` : ""].filter(Boolean).join(" ");

// Rows (inventory rows, the agent's confirmed check in row.check, else the suggestion) and the proposed gam checks
// (options or checks) → the union, the gam-only and project-only variants, and one line per duplicate or overlap (Q278).
export function mergePipelines(rows, proposed, catalog) {
  const project = [];
  const images = [];
  for (const row of rows) {
    const chosen = row.check ?? row.suggested ?? suggestKind(row.job, row.command);
    if (chosen.kind === "image-build") {
      images.push(row.job);
      continue;
    }
    const check = { kind: chosen.kind, language: chosen.language ?? "", tool: chosen.tool ?? row.command, threshold: chosen.threshold ?? "", native: false };
    for (const field of ["cwd", "lintOnCommitted", "ciImage", "services", "version", "settings", "exclude"]) {
      if (chosen[field] !== undefined && chosen[field] !== "") check[field] = chosen[field];
    }
    project.push({ job: row.job, check });
  }
  const gam = proposed.map((item) => item.check ?? item);
  const same = (a, b) => a.kind === b.kind && a.language === b.language && (a.cwd ?? "") === (b.cwd ?? "");
  // A partial overlap: the same folder and a shared tool word (Q278).
  const overlaps = (a, b) => (a.cwd ?? "") === (b.cwd ?? "") && toolWords(a.tool, catalog).some((tool) => toolWords(b.tool, catalog).includes(tool));
  const duplicates = [];
  // First within the project: the same job in its CI file and in its local script counts once; the more precise one
  // stays, on a tie the one read first.
  const kept = [];
  for (const entry of project) {
    const index = kept.findIndex((other) => same(other.check, entry.check) || overlaps(other.check, entry.check));
    if (index < 0) {
      kept.push(entry);
      continue;
    }
    const other = kept[index];
    const laterWins = precision(entry.check, catalog).length > precision(other.check, catalog).length;
    const [winner, loser] = laterWins ? [entry, other] : [other, entry];
    duplicates.push({
      job: loser.job,
      gam: "",
      kind: "duplicate in the project",
      winner: winner.job,
      line: `duplicate in the project: ${other.job} and ${entry.job}, ${winner.job} wins, because ${laterWins ? `it has ${precision(winner.check, catalog).join(", ")}` : "it is configured as precisely and was read first"}`,
    });
    kept[index] = winner;
  }
  const projectOnly = project.map(({ check }) => check);
  project.splice(0, project.length, ...kept);
  const replaced = new Map();
  const dropped = new Set();
  for (const { job, check } of project) {
    const match = gam.find((item) => !replaced.has(item) && same(item, check)) ?? gam.find((item) => !replaced.has(item) && overlaps(item, check));
    if (!match) continue;
    const kind = same(match, check) ? "duplicate" : "overlap";
    const [ours, theirs] = [precision(check, catalog), precision(match, catalog)];
    // The more precise check wins; on a tie the project's, which already ran in the project.
    const projectWins = ours.length >= theirs.length;
    const because = projectWins
      ? ours.length > theirs.length
        ? `it has ${ours.join(", ")}`
        : "both are configured alike and the project's already ran there"
      : `it has ${theirs.join(", ")}`;
    duplicates.push({
      job,
      gam: label(match),
      kind,
      winner: projectWins ? "project" : "gam",
      line: `${kind}: ${job} and gam ${label(match)}, ${projectWins ? job : `gam ${label(match)}`} wins, because ${because}`,
    });
    replaced.set(match, projectWins ? check : match);
    if (!projectWins) dropped.add(check);
  }
  const union = [
    ...gam.map((item) => replaced.get(item) ?? item),
    ...project.filter(({ check }) => !dropped.has(check) && ![...replaced.values()].includes(check)).map(({ check }) => check),
  ];
  return {
    union,
    gamOnly: gam.filter((item) => !replaced.has(item)),
    projectOnly,
    duplicates,
    images,
  };
}
