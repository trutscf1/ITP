import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ContentLanguage } from "@stash/contracts/cms";
import type { SeedContent, SeedStore } from "./index.ts";

/**
 * The content store of the unit as `SeedStore`: it counts the entries of the six content types,
 * runs the seed inside one database transaction, and writes every entry through the document
 * service of Strapi, German first (the default language), then the English version.
 */

const contentTypes = [
  "api::landing-section.landing-section",
  "api::help-category.help-category",
  "api::help-article.help-article",
  "api::changelog-entry.changelog-entry",
  "api::legal-page.legal-page",
  "api::image.image",
] as const;

type Language = ContentLanguage;
const languages: Language[] = ["de", "en"];

interface DocumentService {
  count(params?: Record<string, unknown>): Promise<number>;
  create(params: Record<string, unknown>): Promise<{ documentId: string }>;
  update(params: Record<string, unknown>): Promise<unknown>;
}

/** The part of the Strapi instance the store uses. */
export interface StrapiLike {
  documents(uid: string): DocumentService;
  db: { transaction<T>(work: () => Promise<T>): Promise<T> };
  plugin(name: "upload"): {
    service(name: "upload"): {
      upload(input: {
        data: Record<string, unknown>;
        files: {
          filepath: string;
          originalFilename: string;
          mimetype: string;
          size: number;
        };
      }): Promise<Array<{ id: number }>>;
    };
  };
}

export function createStrapiSeedStore(strapi: StrapiLike): SeedStore {
  /** Creates the default-language version, then the other versions of one document. */
  async function write(
    uid: (typeof contentTypes)[number],
    byLanguage: Record<Language, Record<string, unknown>>,
    published: Record<Language, boolean> | undefined,
    shared: Record<string, unknown> = {},
  ): Promise<string> {
    const documents = strapi.documents(uid);
    const status = (language: Language) =>
      published === undefined
        ? {}
        : { status: published[language] ? "published" : "draft" };
    const [first, ...others] = languages as [Language, ...Language[]];
    const { documentId } = await documents.create({
      locale: first,
      data: { ...shared, ...byLanguage[first] },
      ...status(first),
    });
    for (const language of others) {
      await documents.update({
        documentId,
        locale: language,
        data: byLanguage[language],
        ...status(language),
      });
    }
    return documentId;
  }

  async function uploadPng(key: string, bytes: Uint8Array): Promise<number> {
    const folder = await mkdtemp(join(tmpdir(), "cms-seed-"));
    try {
      const filepath = join(folder, `${key}.png`);
      await writeFile(filepath, bytes);
      const [file] = await strapi
        .plugin("upload")
        .service("upload")
        .upload({
          data: {},
          files: {
            filepath,
            originalFilename: `${key}.png`,
            mimetype: "image/png",
            size: bytes.length,
          },
        });
      if (file === undefined) throw new Error("the seed image was not stored");
      return file.id;
    } finally {
      await rm(folder, { recursive: true, force: true });
    }
  }

  return {
    async countEntries() {
      let total = 0;
      for (const uid of contentTypes) {
        total += await strapi.documents(uid).count({ locale: "*" });
      }
      return total;
    },

    transaction: (work) => strapi.db.transaction(work),

    async insert(content: SeedContent) {
      const imageIds = new Map<string, string>();
      for (const image of content.images) {
        const file = await uploadPng(image.key, image.bytes);
        const id = await write(
          "api::image.image",
          {
            de: { alternativeText: image.alternativeText.de },
            en: { alternativeText: image.alternativeText.en },
          },
          undefined,
          { file, source: image.source, licence: image.licence },
        );
        imageIds.set(image.key, id);
      }
      for (const section of content.landingSections) {
        const image =
          section.imageKey === undefined
            ? undefined
            : imageIds.get(section.imageKey);
        await write(
          "api::landing-section.landing-section",
          { de: section.text.de, en: section.text.en },
          section.published,
          { kind: section.kind, position: section.position, image },
        );
      }
      for (const category of content.helpCategories) {
        const categoryId = await write(
          "api::help-category.help-category",
          { de: { name: category.name.de }, en: { name: category.name.en } },
          undefined,
          { position: category.position },
        );
        for (const article of category.articles) {
          await write(
            "api::help-article.help-article",
            { de: article.text.de, en: article.text.en },
            article.published,
            { category: categoryId, helpContext: article.helpContext },
          );
        }
      }
      for (const entry of content.changelogEntries) {
        await write(
          "api::changelog-entry.changelog-entry",
          { de: entry.text.de, en: entry.text.en },
          entry.published,
          { version: entry.version, releaseDate: entry.releaseDate },
        );
      }
      for (const page of content.legalPages) {
        await write(
          "api::legal-page.legal-page",
          { de: page.text.de, en: page.text.en },
          page.published,
          { kind: page.kind },
        );
      }
    },
  };
}
