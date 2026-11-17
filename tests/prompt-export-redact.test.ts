import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

// The AI chat export (gam-engineering/tools/prompt-export.mjs, P-TEAM-6) writes chat sessions into
// docs/prompts/, which mode commit pushes to the public repository. Its redaction must remove a
// GitLab token completely, including the part after ".01." of the current token format and a
// token that the chat shows only in part. The fake tokens are built at run time, so no scanner
// mistakes this file for a leak.

const repo = join(dirname(fileURLToPath(import.meta.url)), "..");
const { redact } = (await import(
  pathToFileURL(join(repo, "gam-engineering/tools/prompt-export.mjs")).href
)) as { redact: (text: string, home?: string) => string };

const prefix = "glpat-";
const body = "Ab3dE5fG7hJ9kL1mN3pQ5rS7";
const tail = "1700abcd9";

describe("prompt export redacts GitLab tokens completely", () => {
  it("removes a token of the current format with its part after .01.", () => {
    const out = redact(`export GITLAB_TOKEN='${prefix}${body}.01.${tail}'`, "");
    assert.ok(!out.includes(tail), out);
    assert.ok(!out.includes(body), out);
    assert.match(out, /\[redacted\]/);
  });

  it("removes a token of the older format", () => {
    const out = redact(`PRIVATE-TOKEN: ${prefix}${body}`, "");
    assert.ok(!out.includes(body), out);
  });

  it("removes a token the chat shows only in part", () => {
    const out = redact(`GITLAB_TOKEN='${prefix}_WSx…`, "");
    assert.ok(!out.includes(`${prefix}_WS`), out);
  });

  // Every GitLab token type, not only personal access tokens (review of !56, point 2).
  for (const type of [
    "oas",
    "ptt",
    "dt",
    "rt",
    "rtr",
    "soat",
    "cbt",
    "ft",
    "imt",
    "agent",
    "wt",
    "ffct",
  ]) {
    it(`removes a token with the prefix gl${type}-`, () => {
      const out = redact(`curl -H "Job: gl${type}-${body}"`, "");
      assert.ok(!out.includes(body), out);
      assert.match(out, /\[redacted\]/);
    });
  }
});

// The secret after a name such as CI_JOB_TOKEN, private_token, or Bearer (review of !56, point 3).
describe("prompt export redacts named secrets", () => {
  const secret = "s3cr3tValue42";
  const cases = {
    "a job token variable": `CI_JOB_TOKEN=${secret}`,
    "an exported GitLab token variable": `export GITLAB_TOKEN=${secret}`,
    "a private_token query parameter": `https://gitlab.com/api/v4/projects?private_token=${secret}`,
    "a Bearer header": `Authorization: Bearer ${secret}`,
  };
  for (const [name, text] of Object.entries(cases)) {
    it(`removes ${name}`, () => {
      const out = redact(text, "");
      assert.ok(!out.includes(secret), out);
      assert.match(out, /\[redacted\]/);
    });
  }
});

describe("prompt export keeps prose about secrets readable", () => {
  it("keeps the word after Bearer when it is no credential", () => {
    const text = "The API expects Bearer authentication.";
    assert.equal(redact(text, ""), text);
  });
});

// The home folder in every form a chat can show it, so the user name never reaches the public
// repository (review of !56, point 1).
describe("prompt export removes the home folder in every form", () => {
  const user = "alicewonder";
  const cases: Record<string, [home: string, text: string]> = {
    "the literal macOS path": [
      "/Users/alicewonder",
      "cd /Users/alicewonder/Developer/app",
    ],
    "the folder name Claude Code encodes from a macOS path": [
      "/Users/alicewonder",
      "/private/tmp/claude-501/-Users-alicewonder-Developer-app/scratchpad",
    ],
    "the folder name Claude Code encodes from a Windows path": [
      "C:\\Users\\alicewonder",
      "C:\\Users\\alicewonder\\.claude\\projects\\C--Users-alicewonder-Developer-app",
    ],
    "the Git Bash path": [
      "C:\\Users\\alicewonder",
      "cd /c/Users/alicewonder/Developer/app",
    ],
    "the WSL path": [
      "C:\\Users\\alicewonder",
      "ls /mnt/c/Users/alicewonder/Developer",
    ],
  };
  for (const [name, [home, text]] of Object.entries(cases)) {
    it(`removes ${name}`, () => {
      const out = redact(text, home);
      assert.ok(!out.includes(user), out);
    });
  }

  it("keeps a longer user name that only starts with the home folder's name", () => {
    for (const text of [
      "/Users/alicewonderland/notes",
      "-Users-alicewonderland-x",
    ]) {
      assert.equal(redact(text, "/Users/alicewonder"), text);
    }
  });
});

// An export whose session the tool no longer holds is never rebuilt, so the export run redacts it again
// in place; the developer's hand-written manual/ folder and other developers' folders stay untouched
// (review of !56, point 1: "neu exportieren").
describe("prompt export redacts existing exports again", () => {
  it("redacts an export whose session is gone, and leaves manual/ and other folders alone", async () => {
    const { mkdtempSync, mkdirSync, writeFileSync, readFileSync, realpathSync } = await import("node:fs");
    const { tmpdir } = await import("node:os");
    const { exportPrompts } = (await import(
      pathToFileURL(join(repo, "gam-engineering/tools/prompt-export.mjs")).href
    )) as { exportPrompts: (options: Record<string, unknown>) => Promise<unknown> };
    const root = realpathSync(mkdtempSync(join(tmpdir(), "prompt-export-")));
    const home = join(root, "home");
    const work = join(root, "repo");
    mkdirSync(home, { recursive: true });
    mkdirSync(work, { recursive: true });
    writeFileSync(join(work, "CLAUDE.local.md"), "Developer handle: tester\n");
    const encoded = home.replace(/[^A-Za-z0-9]/g, "-");
    const leak = `<output-file>/private/tmp/claude-501/${encoded}-app/x.output</output-file> gl${"cbt"}-${body}\n`;
    const own = join(work, "docs/prompts/tester/claude/2026-01-01-gone.md");
    const manual = join(work, "docs/prompts/tester/manual/2026-01-01.md");
    const other = join(work, "docs/prompts/someone/claude/2026-01-01-gone.md");
    for (const file of [own, manual, other]) {
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, leak);
    }
    await exportPrompts({
      repo: work,
      home,
      out: "docs/prompts",
      env: { GAM_ENGINEERING_PROMPT_EXPORT: "local" },
      fixedHome: true,
    });
    const redacted = readFileSync(own, "utf8");
    assert.ok(!redacted.includes(encoded), redacted);
    assert.ok(!redacted.includes(body), redacted);
    assert.equal(readFileSync(manual, "utf8"), leak);
    assert.equal(readFileSync(other, "utf8"), leak);
  });
});
