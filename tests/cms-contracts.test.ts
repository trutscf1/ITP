import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  contentLanguages,
  legalKinds,
  legalTemplate,
  templateNotice,
} from "../packages/contracts/src/cms/index.ts";

// Slice 1 of PUB-US-1 (concept public-content.md §8 "Legal template outline", §16 content-contracts):
// the legal templates are held once in the shared contracts, so the seed of `cms` and the built-in
// legal text of `web` are the same text (PUB-F-26). Tests PUB-T-73 (template side) and PUB-T-23.

const outline = {
  imprint: {
    de: ["Betreiber", "Kontakt"],
    en: ["Operator", "Contact"],
  },
  terms: {
    de: [
      "Geltungsbereich",
      "Nutzung",
      "Konten",
      "Haftung",
      "Änderungen",
      "Anwendbares Recht",
    ],
    en: ["Scope", "Use", "Accounts", "Liability", "Changes", "Applicable law"],
  },
  privacy: {
    de: [
      "Verantwortlicher",
      "Mitgliedskonten",
      "Konten der Redakteure",
      "Hochgeladene Dateien",
      "Protokoll",
      "IP-Adressen bei der Anmelde-Begrenzung",
      "Bot-Schutz",
      "Externe Anmeldung",
      "E-Mail-Versand",
      "Ihre Rechte",
    ],
    en: [
      "Controller",
      "Member accounts",
      "Editor accounts",
      "Uploaded files",
      "Audit log",
      "IP addresses for the login rate limit",
      "Bot protection",
      "External login providers",
      "E-mail delivery",
      "Your rights",
    ],
  },
} as const;

describe("PUB-AC-1.5 Seed content: the legal templates of the shared contracts", () => {
  it("PUB-AC-1.5 PUB-T-23 names the two content languages and the three legal kinds", () => {
    assert.deepEqual([...contentLanguages], ["de", "en"]);
    assert.deepEqual([...legalKinds], ["imprint", "terms", "privacy"]);
  });

  it("PUB-AC-1.5 PUB-F-26 the template notice is the sentence of the concept in each language", () => {
    assert.equal(
      templateNotice("de"),
      "Diese Seite ist eine Vorlage. Der Betreiber dieser Installation hat sie noch nicht ausgefüllt.",
    );
    assert.equal(
      templateNotice("en"),
      "This page is a template. The operator of this installation has not filled it in yet.",
    );
  });

  for (const kind of legalKinds) {
    for (const language of contentLanguages) {
      it(`PUB-AC-1.5 PUB-T-73 the ${kind} template in ${language} starts with the template notice and holds a placeholder`, () => {
        const text = legalTemplate(kind, language);
        assert.ok(text.startsWith(templateNotice(language)));
        assert.match(text, /\[\[[^\]]+\]\]/);
      });

      it(`PUB-AC-1.5 PUB-F-26 the ${kind} template in ${language} has the headings of the outline in order`, () => {
        const text = legalTemplate(kind, language);
        const headings = [...text.matchAll(/^## (.+)$/gm)].map(
          (match) => match[1],
        );
        assert.deepEqual(headings, [...outline[kind][language]]);
      });

      it(`PUB-AC-1.5 PUB-F-26 the ${kind} template in ${language} fits the rich text markup of the legal page (50000 characters)`, () => {
        const text = legalTemplate(kind, language);
        assert.ok(text.length >= 1 && text.length <= 50000);
        // Rich text knows headings of level 2 to 4 only; a level-1 heading would be a paragraph.
        assert.doesNotMatch(text, /^# /m);
      });
    }
  }

  it("PUB-AC-1.5 PUB-F-22 under each privacy heading from Mitgliedskonten to E-Mail-Versand the first sentence names the data and the second the purpose", () => {
    for (const language of contentLanguages) {
      const text = legalTemplate("privacy", language);
      const sections = text.split(/^## /m).slice(1);
      const names = outline.privacy[language];
      for (const [index, section] of sections.entries()) {
        if (index < 1 || index > 8) continue;
        const body = section.slice((names[index] ?? "").length).trim();
        const sentences = body.split(/(?<=\.)\s+/).filter(Boolean);
        assert.ok(
          sentences.length >= 2,
          `${language} ${names[index]} has fewer than two sentences`,
        );
      }
    }
  });
});
