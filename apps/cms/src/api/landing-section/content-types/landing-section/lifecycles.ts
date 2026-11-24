import { errors } from "@strapi/utils";
import {
  landingSectionProblem,
  namesImage,
} from "../../../../content-model/landing-section.ts";

// The rule that the schema cannot express: a section of kind call-to-action has no image
// (PUB-F-2, PUB-E-11, PUB-T-37). The refusal names the field and leaves the stored section unchanged.

type Data = { kind?: string; image?: unknown };
type Event = {
  params: { data: Data; where?: Record<string, unknown> };
};
type Existing = { kind?: string; image?: { id: number } | null } | null;

declare const strapi: {
  db: {
    query(uid: string): {
      findOne(options: {
        where: Record<string, unknown>;
        populate: Record<string, boolean>;
      }): Promise<Existing>;
    };
  };
};

function refuse(problem: { field: string }): never {
  throw new errors.ValidationError(
    `${problem.field}: a call-to-action section has no image`,
    { errors: [{ path: [problem.field], message: "not allowed" }] },
  );
}

export default {
  beforeCreate(event: Event) {
    const { data } = event.params;
    const problem = landingSectionProblem(data.kind, namesImage(data.image));
    if (problem) refuse(problem);
  },

  async beforeUpdate(event: Event) {
    const { data, where } = event.params;
    // A partial update names only what changes; the rest comes from the stored section.
    const stored =
      where === undefined
        ? null
        : await strapi.db
            .query("api::landing-section.landing-section")
            .findOne({ where, populate: { image: true } });
    const kind = data.kind ?? stored?.kind;
    const hasImage =
      "image" in data ? namesImage(data.image) : Boolean(stored?.image);
    const problem = landingSectionProblem(kind, hasImage);
    if (problem) refuse(problem);
  },
};
