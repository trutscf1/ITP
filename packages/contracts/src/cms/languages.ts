/**
 * The content languages and legal kinds of the public content (`gam-ai-knowledge/concepts/
 * public-content.md` §8). Shared by the unit `cms` (content types, seed) and the unit `web`.
 */
export const contentLanguages = ["de", "en"] as const;
export type ContentLanguage = (typeof contentLanguages)[number];

/** The kinds of the three legal pages; exactly one page of each kind exists (PUB-F-24). */
export const legalKinds = ["imprint", "terms", "privacy"] as const;
export type LegalKind = (typeof legalKinds)[number];

export const contentGroups = ["landing", "help", "changelog", "legal"] as const;
export type ContentGroup = (typeof contentGroups)[number];

export const landingSectionKinds = [
  "hero",
  "feature",
  "text-with-image",
  "call-to-action",
] as const;
export type LandingSectionKind = (typeof landingSectionKinds)[number];
