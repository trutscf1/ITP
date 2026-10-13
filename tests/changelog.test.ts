import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { draftChangelog, releaseNotes } from "../scripts/changelog.ts";

// Example 5 of documentation/concepts/scaffolding.md §9 and WORKFLOW.md "Changelog".
describe("SCF-AC-6.2 Changelog from commits", () => {
  it("SCF-AC-6.2 drafts Added, Changed, and Fixed from the commits since the last release", () => {
    const draft = draftChangelog([
      {
        subject: "feat(identity): add e-mail registration [IDN-F-1]",
        body: "",
      },
      {
        subject: "fix(web): show status text next to color [SCF-U-1]",
        body: "",
      },
      {
        subject:
          "feat(storage)!: move uploads to /api/storage/uploads [STO-F-2]",
        body: "BREAKING CHANGE: old upload path removed",
      },
      { subject: "chore(deps): update dependencies [no-req]", body: "" },
    ]);
    assert.equal(
      draft,
      [
        "## [Unreleased]",
        "",
        "### Added",
        "- identity: add e-mail registration [IDN-F-1]",
        "",
        "### Changed",
        "- storage: move uploads to /api/storage/uploads [STO-F-2] — BREAKING: old upload path removed",
        "",
        "### Fixed",
        "- web: show status text next to color [SCF-U-1]",
        "",
      ].join("\n"),
    );
  });

  it("SCF-AC-6.2 leaves out chores, CI, build, test, docs, refactor, and style commits", () => {
    const draft = draftChangelog([
      { subject: "docs(repo): explain the setup [no-req]", body: "" },
      { subject: "ci: add a job [SCF-F-15]", body: "" },
      { subject: "Merge branch 'feature/1' into 'dev'", body: "" },
    ]);
    assert.equal(draft, "## [Unreleased]\n");
  });

  it("SCF-AC-6.2 writes an entry without scope as the plain description", () => {
    const draft = draftChangelog([
      { subject: "fix: handle empty folders [STO-F-9]", body: "" },
    ]);
    assert.match(draft, /^- handle empty folders \[STO-F-9\]$/m);
  });
});

describe("SCF-AC-6.3 Release tags", () => {
  const changelog = [
    "# Changelog",
    "",
    "## [Unreleased]",
    "",
    "## [0.2.0] - 2026-11-23",
    "",
    "### Added",
    "- web: file browser [WEB-F-1]",
    "",
    "## [0.1.0] - 2026-10-26",
    "",
    "### Added",
    "- repo: monorepo [SCF-AC-1.1]",
    "",
    "[0.2.0]: https://example.invalid/compare/v0.1.0...v0.2.0",
  ].join("\n");

  it("SCF-AC-6.3 takes the release notes of a SemVer tag from its changelog section", () => {
    assert.equal(
      releaseNotes(changelog, "v0.2.0"),
      "### Added\n- web: file browser [WEB-F-1]\n",
    );
  });

  it("SCF-AC-6.3 refuses a tag that is not SemVer", () => {
    assert.throws(() => releaseNotes(changelog, "v0.2"), /not a SemVer tag/);
    assert.throws(
      () => releaseNotes(changelog, "release-1"),
      /not a SemVer tag/,
    );
  });

  it("SCF-AC-6.3 refuses a release without a changelog section", () => {
    assert.throws(() => releaseNotes(changelog, "v0.3.0"), /no section/);
  });
});
