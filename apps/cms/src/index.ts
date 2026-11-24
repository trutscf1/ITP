import { seedIfEmpty } from "./content-seed/index.ts";
import {
  createStrapiSeedStore,
  type StrapiLike,
} from "./content-seed/strapi-store.ts";

export const name = "cms" as const;
export { boot, unitVersion } from "./boot.ts";

/** What Strapi hands to `bootstrap`: the instance, with the i18n plugin the unit adds a language to. */
type Strapi = StrapiLike & {
  plugin(name: "i18n"): {
    service(name: "locales"): {
      find(): Promise<Array<{ code: string }>>;
      create(locale: { code: string; name: string }): Promise<unknown>;
    };
  };
};

/**
 * Strapi loads this default export: after the content store answers, the languages German
 * (default) and English exist, and the seed content is written when the store is empty (PUB-F-7).
 * A failure leaves no entry and ends the start with an error (the unit exits non-zero).
 */
export default {
  register() {},
  async bootstrap({ strapi }: { strapi: Strapi }) {
    const locales = strapi.plugin("i18n").service("locales");
    const present = (await locales.find()).map((locale) => locale.code);
    for (const [code, label] of [
      ["de", "Deutsch (de)"],
      ["en", "English (en)"],
    ] as const) {
      if (!present.includes(code)) await locales.create({ code, name: label });
    }
    await seedIfEmpty(createStrapiSeedStore(strapi));
  },
};
