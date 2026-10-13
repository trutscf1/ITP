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
    const [, type, scope, bang, description] = match;
    const breaking = body.match(/^BREAKING[ -]CHANGE: (.+)$/m)?.[1];
    if (bang || breaking) {
      const note = breaking ? ` — BREAKING: ${breaking}` : " — BREAKING";
      sections.Changed.push(entry(scope, `${description}${note}`));
    } else if (type === "feat") {
      sections.Added.push(entry(scope, description as string));
    } else if (type === "fix") {
      sections.Fixed.push(entry(scope, description as string));
    }
  }
  const lines: string[] = ["## [Unreleased]", ""];
  for (const [title, entries] of Object.entries(sections)) {
    if (entries.length === 0) continue;
    lines.push(`### ${title}`, ...entries, "");
  }
  return lines.join("\n").replace(/\n\n$/, "\n");
}

export function releaseNotes(changelog: string, tag: string): string {
  const version = tag.match(semverTag)?.[1];
  if (!version) throw new Error(`${tag} is not a SemVer tag such as v1.0.0`);
  const lines = changelog.split("\n");
  const start = lines.findIndex((line) => line.startsWith(`## [${version}]`));
  if (start === -1)
    throw new Error(`CHANGELOG.md has no section for ${version}`);
  const end = lines.findIndex(
    (line, index) => index > start && /^## \[|^\[[^\]]+\]: /.test(line),
  );
  const section = lines.slice(start + 1, end === -1 ? undefined : end);
  return `${section.join("\n").trim()}\n`;
}

function git(args: string[]): string {
  return execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
}

function commitsSinceLastTag(): Commit[] {
  let range = "HEAD";
  try {
    range = `${git(["describe", "--tags", "--abbrev=0", "--match", "v*"]).trim()}..HEAD`;
  } catch {
    // No release tag yet: every commit counts.
  }
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
