import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { legalTemplate, templateNotice } from "@stash/contracts/cms";
import {
  type SeedContent,
  type SeedStore,
  seedContent,
  seedIfEmpty,
} from "./content-seed/index.ts";

// PUB-AC-1.5 Seed content (concept public-content.md §16 content-seed, §17; tests PUB-T-5 (store
// side), PUB-T-70 to PUB-T-73). `seedIfEmpty` is the seam: the store of the unit is replaced by a
// stub that counts entries and records what is written.

/** A store stub: holds a number of entries, records the written content, can fail on insert. */
function stubStore(options: { entries: number; failOnInsert?: boolean }) {
  const state = {
    entries: options.entries,
    inserted: [] as SeedContent[],
    transactions: 0,
    committed: 0,
  };
  const store: SeedStore = {
    countEntries: async () => state.entries,
    transaction: async (work) => {
      state.transactions += 1;
      const snapshot = state.entries;
      try {
        const result = await work();
        state.committed += 1;
        return result;
      } catch (error) {
        state.entries = snapshot;
        state.inserted.length = 0;
        throw error;
      }
    },
    insert: async (content) => {
      state.inserted.push(content);
      state.entries += 1;
      if (options.failOnInsert) throw new Error("insert failed");
    },
  };
  return { state, store };
}

describe("PUB-AC-1.5 Seed content: example content in German and English on the first start", () => {
  it("PUB-AC-1.5 PUB-T-70 PUB-F-7 writes, on an empty store, one landing section of each kind, 2 help categories with 2 articles each, changelog entry 0.1.0, and 3 legal pages", async () => {
    const { state, store } = stubStore({ entries: 0 });
    assert.equal(await seedIfEmpty(store), "seeded");
    assert.equal(state.inserted.length, 1);
    const content = state.inserted[0] as SeedContent;
    assert.deepEqual(
      content.landingSections.map((section) => section.kind).sort(),
      ["call-to-action", "feature", "hero", "text-with-image"],
    );
    assert.deepEqual(
      content.landingSections.map((section) => section.position),
      [1, 2, 3, 4],
    );
    assert.equal(content.helpCategories.length, 2);
    for (const category of content.helpCategories) {
      assert.equal(category.articles.length, 2);
    }
    assert.deepEqual(
      content.changelogEntries.map((entry) => entry.version),
      ["0.1.0"],
    );
    assert.deepEqual(content.legalPages.map((page) => page.kind).sort(), [
      "imprint",
      "privacy",
      "terms",
    ]);
  });

  it("PUB-AC-1.5 PUB-T-70 PUB-F-7 gives every entry a German and an English version, all published", () => {
    const content = seedContent();
    const entries = [
      ...content.landingSections,
      ...content.helpCategories.flatMap((category) => category.articles),
      ...content.changelogEntries,
      ...content.legalPages,
    ];
    for (const entry of entries) {
      assert.deepEqual(Object.keys(entry.text).sort(), ["de", "en"]);
      for (const language of ["de", "en"] as const) {
        const text = entry.text[language];
        assert.ok(
          Object.values(text).every(
            (value) => value.length > 0 || value === "",
          ),
        );
        assert.equal(entry.published[language], true);
      }
    }
    for (const category of content.helpCategories) {
      assert.ok(category.name.de.length >= 1 && category.name.de.length <= 60);
      assert.ok(category.name.en.length >= 1 && category.name.en.length <= 60);
    }
  });

  it("PUB-AC-1.5 PUB-T-71 PUB-F-7 creates, changes, and deletes nothing when the store holds one help category", async () => {
    const { state, store } = stubStore({ entries: 1 });
    assert.equal(await seedIfEmpty(store), "skipped");
    assert.equal(state.inserted.length, 0);
    assert.equal(state.transactions, 0);
    assert.equal(state.entries, 1);
  });

  it("PUB-AC-1.5 PUB-T-5 seeds once: a second start after the first changes nothing", async () => {
    const { state, store } = stubStore({ entries: 0 });
    assert.equal(await seedIfEmpty(store), "seeded");
    const after = state.entries;
    assert.equal(await seedIfEmpty(store), "skipped");
    assert.equal(state.entries, after);
    assert.equal(state.inserted.length, 1);
  });

  it("PUB-AC-1.5 PUB-T-72 PUB-F-13 PUB-F-35 gives every seed image a source, the licence CC0-1.0, and a PNG of at most 2097152 bytes", () => {
    const { images } = seedContent();
    assert.ok(images.length >= 2);
    for (const image of images) {
      assert.ok(image.source.length >= 1 && image.source.length <= 300);
      assert.equal(image.source, "created for this project");
      assert.equal(image.licence, "CC0-1.0");
      assert.equal(image.mediaType, "image/png");
      assert.ok(image.bytes.length > 0 && image.bytes.length <= 2_097_152);
      assert.deepEqual(
        [...image.bytes.subarray(0, 8)],
        [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
      );
      assert.ok(image.alternativeText.de.length <= 200);
      assert.ok(image.alternativeText.en.length <= 200);
    }
  });

  it("PUB-AC-1.5 PUB-F-13 lets every image used by a landing section be one of the seed images, none on the call to action", () => {
    const content = seedContent();
    const keys = new Set(content.images.map((image) => image.key));
    for (const section of content.landingSections) {
      if (section.kind === "call-to-action") {
        assert.equal(section.imageKey, undefined);
      }
      if (section.imageKey !== undefined) assert.ok(keys.has(section.imageKey));
    }
    assert.ok(
      content.landingSections.some((section) => section.imageKey !== undefined),
    );
  });

  it("PUB-AC-1.5 PUB-T-73 PUB-F-14 PUB-F-26 holds one call-to-action section and legal pages equal to the legal template of their kind", () => {
    const content = seedContent();
    assert.equal(
      content.landingSections.filter(
        (section) => section.kind === "call-to-action",
      ).length,
      1,
    );
    for (const page of content.legalPages) {
      for (const language of ["de", "en"] as const) {
        assert.equal(
          page.text[language].body,
          legalTemplate(page.kind, language),
        );
        assert.ok(
          page.text[language].body.startsWith(templateNotice(language)),
        );
      }
    }
  });

  it("PUB-AC-1.5 PUB-T-70 keeps the seed texts inside the limits of the data model", () => {
    const content = seedContent();
    for (const section of content.landingSections) {
      for (const language of ["de", "en"] as const) {
        const { heading, body } = section.text[language];
        assert.ok(heading.length >= 1 && heading.length <= 120);
        assert.ok(body.length <= 2000);
      }
    }
    for (const article of content.helpCategories.flatMap((c) => c.articles)) {
      for (const language of ["de", "en"] as const) {
        const { title, body, description } = article.text[language];
        assert.ok(title.length >= 1 && title.length <= 120);
        assert.ok(body.length >= 1 && body.length <= 20000);
        assert.ok(description.length <= 160);
      }
    }
    const contexts = content.helpCategories
      .flatMap((category) => category.articles)
      .map((article) => article.helpContext)
      .filter((value) => value !== undefined);
    assert.equal(new Set(contexts).size, contexts.length);
  });

  it("PUB-AC-1.5 PUB-F-7 writes all-or-nothing: a failed insert leaves no entry and the error reaches the caller", async () => {
    const { state, store } = stubStore({ entries: 0, failOnInsert: true });
    await assert.rejects(() => seedIfEmpty(store), /insert failed/);
    assert.equal(state.entries, 0);
    assert.equal(state.committed, 0);
  });
});
