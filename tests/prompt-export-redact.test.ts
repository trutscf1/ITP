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
});
