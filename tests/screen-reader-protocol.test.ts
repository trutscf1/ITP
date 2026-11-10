import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { root } from "./helpers/tokens-css.ts";

const file = join(root, "gam-ai-knowledge/tests/screen-reader-protocol.md");
const protocol: string = existsSync(file) ? readFileSync(file, "utf8") : "";

/** The text of the `## <title>` section, up to the next `## ` heading. */
function section(title: RegExp): string {
  const parts = protocol.split(/^## /m).slice(1);
  const found = parts.find((part) => title.test(part.split("\n")[0] ?? ""));
  assert.ok(found, `no section for ${title}`);
  return found;
}

/** The `### ` blocks inside a section, each starting with its heading line. */
function subsections(text: string): string[] {
  return text.split(/^### /m).slice(1);
}

/** The rows of the markdown table that follows `heading`, without header and separator. */
function tableRows(text: string): string[] {
  return text
    .split("\n")
    .filter((line) => line.startsWith("|"))
    .slice(2);
}

const readers = [
  { name: "NVDA", title: /NVDA/, setup: /Windows/, browsers: /Firefox|Chrome/ },
  { name: "VoiceOver", title: /VoiceOver/, setup: /macOS/, browsers: /Safari/ },
] as const;

const controls = [
  "skip link",
  "header",
  "theme switcher",
  "accessibility",
  "main content",
] as const;

describe("DSA-AC-3.4 Manual tests with NVDA and VoiceOver (DSA-T-15)", () => {
  it("DSA-AC-3.4 DSA-T-15 documents the protocol in gam-ai-knowledge/tests/screen-reader-protocol.md", () => {
    assert.ok(existsSync(file), "the protocol document does not exist");
    assert.match(protocol, /^---\ndoc: test-strategy\n/);
  });

  for (const reader of readers) {
    describe(reader.name, () => {
      it(`DSA-AC-3.4 DSA-T-15 ${reader.name}: has a section with its setup`, () => {
        const text = section(reader.title);
        assert.match(text, reader.setup);
        assert.match(text, reader.browsers);
        assert.match(text, /setup/i);
      });

      for (const control of controls) {
        it(`DSA-AC-3.4 DSA-T-15 ${reader.name}: has numbered steps and an expected announcement for the ${control}`, () => {
          const block = subsections(section(reader.title)).find((text) =>
            (text.split("\n")[0] ?? "").toLowerCase().includes(control),
          );
          assert.ok(block, `no ### block for the ${control}`);
          assert.match(block, /^\d+\. /m, "no numbered steps");
          assert.match(block, /expect/i, "no expected announcement");
        });
      }
    });
  }

  it("DSA-AC-3.4 DSA-T-15 has an empty result table with the columns date, tester handle, screen reader and version, browser, result, findings", () => {
    const text = section(/results?/i);
    const header = text.split("\n").find((line) => line.startsWith("|")) ?? "";
    const columns = header
      .split("|")
      .map((cell) => cell.trim())
      .filter(Boolean);
    assert.deepEqual(columns, [
      "Date",
      "Tester handle",
      "Screen reader and version",
      "Browser",
      "Result",
      "Findings",
    ]);
    assert.deepEqual(tableRows(text), [], "the table holds invented results");
  });
});
