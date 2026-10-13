// Changelog draft and release notes (SCF-F-16, SCF-AC-6.2, SCF-AC-6.3).
//   node scripts/changelog.ts draft         → draft section for the commits since the last v* tag
//   node scripts/changelog.ts notes <tag>   → the CHANGELOG.md section of a SemVer tag
// Mapping (documentation/WORKFLOW.md "Changelog"): feat → Added, fix → Fixed, breaking → Changed;
// other types are left out. The release MR author rewrites the draft for readers.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

export type Commit = { subject: string; body: string };

const header: RegExp = /^(\w+)(?:\(([\w-]+)\))?(!)?: (.+)$/;
const semverTag: RegExp = /^v(\d+\.\d+\.\d+)$/;

function entry(scope: string | undefined, description: string): string {
  return `- ${scope ? `${scope}: ` : ""}${description}`;
}

export function draftChangelog(commits: Commit[]): string {
  const sections: Record<"Added" | "Changed" | "Fixed", string[]> = {
    Added: [],
    Changed: [],
    Fixed: [],
  };
  for (const { subject, body } of commits) {
    const match = subject.match(header);
    if (!match) continue;
    const [, type, scope, bang, description = ""] = match;
    const footers = [...body.matchAll(/^BREAKING[ -]CHANGE: (.+)$/gm)].map(
      (footer) => footer[1],
    );
    if (bang || footers.length > 0) {
      const note =
        footers.length > 0
          ? ` — BREAKING: ${footers.join("; ")}`
          : " — BREAKING";
      sections.Changed.push(entry(scope, `${description}${note}`));
    } else if (type === "feat") {
      sections.Added.push(entry(scope, description));
    } else if (type === "fix") {
      sections.Fixed.push(entry(scope, description));
    }
  }
  const lines: string[] = ["## [Unreleased]", ""];
  for (const [title, entries] of Object.entries(sections)) {
    if (entries.length === 0) continue;
    lines.push(`### ${title}`, ...entries, "");
  }
  return lines.join("\n").replace(/\n\n$/, "\n");
}

// The newest release tag by SemVer order. Tags sit on main, so they are not reachable from dev;
// git describe would not find them there.
export function latestReleaseTag(tags: string[]): string | undefined {
  const versions = tags
    .map((tag) => tag.match(semverTag)?.[1])
    .filter((version): version is string => version !== undefined)
    .map((version) => version.split(".").map(Number));
  versions.sort(
    (a, b) =>
      (b[0] ?? 0) - (a[0] ?? 0) ||
      (b[1] ?? 0) - (a[1] ?? 0) ||
      (b[2] ?? 0) - (a[2] ?? 0),
  );
  const newest = versions[0];
  return newest ? `v${newest.join(".")}` : undefined;
}

export function releaseNotes(changelog: string, tag: string): string {
  const version = tag.match(semverTag)?.[1];
  if (!version) throw new Error(`${tag} is not a SemVer tag such as v1.0.0`);
  const lines = changelog.split("\n");
  const start = lines.findIndex((line) => line.startsWith(`## [${version}]`));
  if (start === -1)
    throw new Error(`the changelog has no section for ${version}`);
  const end = lines.findIndex(
    (line, index) => index > start && /^## \[|^\[[^\]]+\]: /.test(line),
  );
  const section = lines
    .slice(start + 1, end === -1 ? undefined : end)
    .join("\n")
    .trim();
  if (section === "") {
    throw new Error(`the changelog section for ${version} is empty`);
  }
  return `${section}\n`;
}

function git(args: string[]): string {
  return execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
}

function commitsSinceLastTag(): Commit[] {
  const tag = latestReleaseTag(git(["tag", "--list", "v*"]).split("\n"));
  // Before the first release every commit counts.
  const range = tag ? `${tag}..HEAD` : "HEAD";
  return git(["log", "--no-merges", "--format=%s%x1f%b%x1e", range])
    .split("\x1e")
    .map((record) => record.trim())
    .filter((record) => record !== "")
    .map((record) => {
      const [subject = "", body = ""] = record.split("\x1f");
      return { subject, body };
    });
}

if (import.meta.main) {
  const [command, tag] = process.argv.slice(2);
  if (command === "draft") {
    process.stdout.write(draftChangelog(commitsSinceLastTag()));
  } else if (command === "notes" && tag) {
    process.stdout.write(
      releaseNotes(readFileSync("CHANGELOG.md", "utf8"), tag),
    );
  } else {
    console.error("usage: node scripts/changelog.ts draft | notes <tag>");
    process.exitCode = 1;
  }
}
