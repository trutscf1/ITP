import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { root } from "./helpers/paths.ts";

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

/** The data rows of the first markdown table in `text`, without its header and separator line. */
function tableRows(text: string): string[] {
  return text
    .split("\n")
    .filter((line) => line.startsWith("|"))
    .slice(2);
}

const resultColumns = [
  "Date",
  "Tester handle",
  "Screen reader and version",
  "Browser",
  "Result",
  "Findings",
];

/** The results the protocol allows in the Result column. */
const results = ["pass", "pass with findings", "fail"];

/** The trimmed cells of one markdown table row. */
function cells(row: string): string[] {
  return row
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

/** What is wrong with one result row; an empty list means the row is complete. */
function rowProblems(row: string): string[] {
  const [date, handle, reader, browser, result] = cells(row);
  if (cells(row).length !== resultColumns.length) {
    return [`expected ${resultColumns.length} columns`];
  }
  const problems: string[] = [];
  if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(date ?? "")) {
    problems.push("the date is not YYYY-MM-DD");
  }
  if (!/^[A-Za-z0-9][\w.-]*$/.test(handle ?? ""))
    problems.push("no tester handle");
  if (!/^(NVDA|VoiceOver) \d[\w.]*/.test(reader ?? "")) {
    problems.push("the reader is not NVDA or VoiceOver with a version");
  }
  if ((browser ?? "") === "") problems.push("no browser");
  if (!results.includes(result ?? "")) {
    problems.push(`the result is not one of ${results.join(", ")}`);
  }
  return problems;
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

  it("DSA-AC-3.4 DSA-T-15 has a result table with the columns date, tester handle, screen reader and version, browser, result, findings", () => {
    const text = section(/results?/i);
    const header = text.split("\n").find((line) => line.startsWith("|")) ?? "";
    assert.deepEqual(cells(header), resultColumns);
  });

  it("DSA-AC-3.4 DSA-T-15 records every run in the table with an ISO date, a handle, a reader and version, a browser, and a result", () => {
    const rows = tableRows(section(/results?/i));
    const problems = rows.flatMap((row) =>
      rowProblems(row).map((problem) => `${row}: ${problem}`),
    );
    assert.deepEqual(problems, []);
  });

  it("DSA-AC-3.4 DSA-T-15 recognises a good row and rejects bad ones (so the row check cannot pass for nothing)", () => {
    const good =
      "| 2026-11-12 | schwaigc | NVDA 2025.3 | Firefox 140 | pass | none |";
    assert.deepEqual(rowProblems(good), []);
    const bad: [string, RegExp][] = [
      [
        "| 12.11.2026 | schwaigc | NVDA 2025.3 | Firefox 140 | pass | |",
        /date/,
      ],
      ["| 2026-11-12 | | NVDA 2025.3 | Firefox 140 | pass | |", /handle/],
      [
        "| 2026-11-12 | schwaigc | JAWS 2025 | Firefox 140 | pass | |",
        /reader/,
      ],
      ["| 2026-11-12 | schwaigc | NVDA | Firefox 140 | pass | |", /reader/],
      ["| 2026-11-12 | schwaigc | VoiceOver 15.1 | | pass | |", /browser/],
      [
        "| 2026-11-12 | schwaigc | VoiceOver 15.1 | Safari 18 | maybe | |",
        /result/,
      ],
      [
        "| 2026-11-12 | schwaigc | VoiceOver 15.1 | Safari 18 | pass |",
        /columns/,
      ],
    ];
    for (const [row, expected] of bad) {
      assert.match(rowProblems(row).join("; "), expected, row);
    }
  });

  for (const reader of readers) {
    it(`DSA-AC-3.4 DSA-T-15 ${reader.name}: says that the accessibility popover does not trap focus and that Escape returns it to the button`, () => {
      const block = subsections(section(reader.title)).find((text) =>
        (text.split("\n")[0] ?? "").toLowerCase().includes("accessibility"),
      );
      assert.ok(block, "no accessibility block");
      assert.match(block, /not trapped|does not trap|non-modal/i);
      assert.match(block, /Escape/);
      assert.doesNotMatch(block, /focus stays inside the dialog/i);
    });
  }
});
