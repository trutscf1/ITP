/**
 * Rule of module content-model that a schema cannot express (`gam-ai-knowledge/concepts/
 * public-content.md` §8, §9 PUB-E-11): a landing section of kind `call-to-action` has no image.
 * The lifecycle of the content type calls it before every save.
 */

/** The first broken field of a refused save, as PUB-E-11 names it. */
export interface LandingSectionProblem {
  field: "imageId";
}

export function landingSectionProblem(
  kind: string | undefined,
  hasImage: boolean,
): LandingSectionProblem | undefined {
  if (kind === "call-to-action" && hasImage) return { field: "imageId" };
  return undefined;
}

/**
 * Whether the `image` value of a save request names an image. Strapi hands a relation as an id, a
 * document id, `null`, or an object with `connect` and `disconnect` lists.
 */
export function namesImage(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") {
    const { connect, set } = value as { connect?: unknown; set?: unknown };
    if (Array.isArray(set)) return set.length > 0;
    if (Array.isArray(connect)) return connect.length > 0;
    return false;
  }
  return true;
}
