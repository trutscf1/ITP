import { z } from "../zod.ts";
import {
  contentGroups,
  contentLanguages,
  landingSectionKinds,
  legalKinds,
} from "./languages.ts";

/**
 * The shapes that cross the content interface of `cms` (`gam-ai-knowledge/concepts/public-content.md`
 * §16, "Shared records"). A text map holds only the languages whose version is published.
 */

const language = z.enum(contentLanguages);
const textMap = <T extends z.ZodType>(text: T) =>
  z.partialRecord(language, text);

const landingText = z.object({ heading: z.string(), body: z.string() });
const helpText = z.object({
  title: z.string(),
  body: z.string(),
  description: z.string(),
});
const changelogText = z.object({ title: z.string(), body: z.string() });
const legalText = z.object({ title: z.string(), body: z.string() });

export const publishedLandingSectionSchema = z.object({
  id: z.uuid(),
  kind: z.enum(landingSectionKinds),
  position: z.number().int().min(1),
  imageId: z.uuid().optional(),
  text: textMap(landingText),
});

export const publishedImageSchema = z.object({
  id: z.uuid(),
  mediaType: z.string(),
  alternativeText: textMap(z.string()),
});

export const publishedHelpCategorySchema = z.object({
  id: z.uuid(),
  position: z.number().int().min(1),
  name: textMap(z.string()),
});

export const publishedHelpArticleSchema = z.object({
  id: z.uuid(),
  categoryId: z.uuid(),
  helpContext: z.string().optional(),
  text: textMap(helpText),
});

export const publishedChangelogEntrySchema = z.object({
  id: z.uuid(),
  version: z.string(),
  releaseDate: z.string(),
  text: textMap(changelogText),
});

export const publishedLegalPageSchema = z.object({
  id: z.uuid(),
  kind: z.enum(legalKinds),
  text: textMap(legalText),
});

/** One content group as the content interface returns it; the lists of the other groups are empty. */
export const contentGroupDataSchema = z.object({
  group: z.enum(contentGroups),
  landingSections: z.array(publishedLandingSectionSchema),
  images: z.array(publishedImageSchema),
  helpCategories: z.array(publishedHelpCategorySchema),
  helpArticles: z.array(publishedHelpArticleSchema),
  changelogEntries: z.array(publishedChangelogEntrySchema),
  legalPages: z.array(publishedLegalPageSchema),
});

export type ContentGroupData = z.infer<typeof contentGroupDataSchema>;
