import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { landingSectionProblem } from "./content-model/landing-section.ts";

// PUB-AC-1.2 Content types (concept public-content.md §8 and §16 content-model; tests PUB-T-2,
// PUB-T-36 to PUB-T-42, PUB-T-50). The content types are the Strapi schemas of this unit, read as
// data: Strapi itself enforces the limits of the schema when an editor saves an entry.

const apiDir = fileURLToPath(new URL("./api/", import.meta.url));

type Attribute = {
  type: string;
  required?: boolean;
  unique?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  regex?: string;
  enum?: string[];
  relation?: string;
  target?: string;
  component?: string;
  repeatable?: boolean;
  allowedTypes?: string[];
  multiple?: boolean;
  pluginOptions?: { i18n?: { localized?: boolean } };
};
type Schema = {
  kind: string;
  collectionName: string;
  info: { singularName: string; pluralName: string; displayName: string };
  options: { draftAndPublish?: boolean };
  pluginOptions?: { i18n?: { localized?: boolean } };
  attributes: Record<string, Attribute>;
};

function schemaOf(name: string): Schema {
  const path = join(apiDir, name, "content-types", name, "schema.json");
  return JSON.parse(readFileSync(path, "utf8")) as Schema;
}

const typeNames = [
  "landing-section",
  "help-category",
  "help-article",
  "changelog-entry",
  "legal-page",
  "image",
] as const;

function localized(attribute: Attribute | undefined): boolean {
  return attribute?.pluginOptions?.i18n?.localized === true;
}

describe("PUB-AC-1.2 Content types: exactly the six types of the data model exist", () => {
  it("PUB-AC-1.2 PUB-T-2 PUB-F-2 offers exactly landing section, help category, help article, changelog entry, legal page, and image", () => {
    const found = readdirSync(apiDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
    assert.deepEqual(found, [...typeNames].sort());
    for (const name of typeNames) {
      const schema = schemaOf(name);
      assert.equal(schema.kind, "collectionType", name);
      assert.equal(schema.info.singularName, name);
    }
  });

  it("PUB-AC-1.2 PUB-T-50 PUB-F-2 gives each type exactly the fields of the data model (a reference to another type is a relation named without the Id suffix)", () => {
    const expected: Record<(typeof typeNames)[number], string[]> = {
      "landing-section": ["kind", "position", "heading", "body", "image"],
      "help-category": ["position", "name"],
      "help-article": [
        "category",
        "helpContext",
        "title",
        "body",
        "description",
      ],
      "changelog-entry": ["version", "releaseDate", "title", "body"],
      "legal-page": ["kind", "title", "body"],
      image: ["file", "alternativeText", "source", "licence"],
    };
    for (const name of typeNames) {
      assert.deepEqual(
        Object.keys(schemaOf(name).attributes).sort(),
        [...expected[name]].sort(),
        name,
      );
    }
  });

  it("PUB-AC-1.2 PUB-T-50 PUB-NF-6 no content type names or references an editor account", () => {
    for (const name of typeNames) {
      const text = JSON.stringify(schemaOf(name)).toLowerCase();
      assert.ok(!text.includes("admin::user"), name);
      assert.ok(!/author|createdby|updatedby|editor/.test(text), name);
    }
  });

  it("PUB-AC-1.2 PUB-F-5 PUB-T-41 PUB-T-42 keeps a draft or published state per language for the four types that have one", () => {
    for (const name of [
      "landing-section",
      "help-article",
      "changelog-entry",
      "legal-page",
    ] as const) {
      const schema = schemaOf(name);
      assert.equal(schema.options.draftAndPublish, true, name);
      assert.equal(schema.pluginOptions?.i18n?.localized, true, name);
    }
    for (const name of ["help-category", "image"] as const) {
      assert.notEqual(schemaOf(name).options.draftAndPublish, true, name);
    }
  });

  it("PUB-AC-1.2 PUB-T-36 limits the heading of a landing section to 1 to 120 characters, per language", () => {
    const { attributes } = schemaOf("landing-section");
    assert.equal(attributes.heading?.minLength, 1);
    assert.equal(attributes.heading?.maxLength, 120);
    assert.equal(attributes.heading?.required, true);
    assert.ok(localized(attributes.heading));
    assert.equal(attributes.body?.maxLength, 2000);
    assert.ok(localized(attributes.body));
    assert.deepEqual(attributes.kind?.enum, [
      "hero",
      "feature",
      "text-with-image",
      "call-to-action",
    ]);
    assert.equal(attributes.position?.min, 1);
    assert.equal(attributes.position?.unique, true);
    assert.ok(!localized(attributes.position));
    assert.ok(!localized(attributes.kind));
  });

  it("PUB-AC-1.2 PUB-T-37 refuses an image on a landing section of kind call-to-action naming imageId", () => {
    assert.deepEqual(landingSectionProblem("call-to-action", true), {
      field: "imageId",
    });
    assert.equal(landingSectionProblem("call-to-action", false), undefined);
    assert.equal(landingSectionProblem("hero", true), undefined);
    assert.equal(landingSectionProblem("text-with-image", true), undefined);
    const { attributes } = schemaOf("landing-section");
    assert.equal(attributes.image?.type, "relation");
    assert.equal(attributes.image?.target, "api::image.image");
  });

  it("PUB-AC-1.2 PUB-T-38 requires the name of a help category in both languages, each of 1 to 60 characters", () => {
    const { attributes } = schemaOf("help-category");
    assert.equal(attributes.name?.type, "component");
    assert.equal(attributes.name?.required, true);
    assert.equal(attributes.name?.repeatable, false);
    assert.equal(attributes.position?.min, 1);
    assert.equal(attributes.position?.unique, true);
    const componentPath = fileURLToPath(
      new URL("./components/shared/localized-name.json", import.meta.url),
    );
    assert.ok(existsSync(componentPath));
    const component = JSON.parse(readFileSync(componentPath, "utf8")) as {
      attributes: Record<string, Attribute>;
    };
    assert.deepEqual(Object.keys(component.attributes).sort(), ["de", "en"]);
    for (const language of ["de", "en"]) {
      const field = component.attributes[language];
      assert.equal(field?.required, true, language);
      assert.equal(field?.minLength, 1, language);
      assert.equal(field?.maxLength, 60, language);
    }
  });

  it("PUB-AC-1.2 PUB-T-39 keeps the version of a changelog entry unique and of the form integer.integer.integer", () => {
    const { attributes } = schemaOf("changelog-entry");
    assert.equal(attributes.version?.unique, true);
    assert.equal(attributes.version?.required, true);
    const pattern = new RegExp(attributes.version?.regex ?? "(?!)");
    assert.ok(pattern.test("0.1.0"));
    assert.ok(pattern.test("0.10.0"));
    assert.ok(!pattern.test("0.1"));
    assert.ok(!pattern.test("v0.1.0"));
    assert.equal(attributes.releaseDate?.type, "date");
    assert.equal(attributes.releaseDate?.required, true);
    assert.equal(attributes.title?.maxLength, 120);
    assert.equal(attributes.body?.maxLength, 5000);
    assert.ok(!localized(attributes.version));
    assert.ok(!localized(attributes.releaseDate));
  });

  it("PUB-AC-1.2 PUB-T-40 keeps the help context of a help article unique and of the form [a-z0-9-]{1,64}", () => {
    const { attributes } = schemaOf("help-article");
    assert.equal(attributes.helpContext?.unique, true);
    assert.equal(attributes.helpContext?.required, undefined);
    const pattern = new RegExp(attributes.helpContext?.regex ?? "(?!)");
    assert.ok(pattern.test("upload-files"));
    assert.ok(pattern.test("a".repeat(64)));
    assert.ok(!pattern.test("Upload Files"));
    assert.ok(!pattern.test("a".repeat(65)));
    assert.ok(!pattern.test(""));
    assert.equal(attributes.category?.type, "relation");
    assert.equal(attributes.category?.relation, "manyToOne");
    assert.equal(attributes.title?.maxLength, 120);
    assert.equal(attributes.body?.maxLength, 20000);
    assert.equal(attributes.description?.maxLength, 160);
  });

  it("PUB-AC-1.2 PUB-F-24 keeps one legal page per kind (imprint, terms, privacy) with title and body of the data model", () => {
    const { attributes } = schemaOf("legal-page");
    assert.deepEqual(attributes.kind?.enum, ["imprint", "terms", "privacy"]);
    assert.equal(attributes.kind?.unique, true);
    assert.equal(attributes.title?.maxLength, 120);
    assert.equal(attributes.body?.maxLength, 50000);
    assert.ok(localized(attributes.title));
    assert.ok(localized(attributes.body));
  });

  it("PUB-AC-1.2 PUB-F-13 requires source and licence of an image and keeps the file out of the language versions", () => {
    const { attributes } = schemaOf("image");
    assert.equal(attributes.file?.type, "media");
    assert.equal(attributes.file?.required, true);
    assert.equal(attributes.file?.multiple, false);
    assert.equal(attributes.source?.required, true);
    assert.equal(attributes.source?.minLength, 1);
    assert.equal(attributes.source?.maxLength, 300);
    assert.equal(attributes.licence?.required, true);
    assert.equal(attributes.licence?.minLength, 1);
    assert.equal(attributes.licence?.maxLength, 100);
    assert.equal(attributes.alternativeText?.maxLength, 200);
    assert.ok(localized(attributes.alternativeText));
    assert.ok(!localized(attributes.file));
    assert.ok(!localized(attributes.source));
  });
});
