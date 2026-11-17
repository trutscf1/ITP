// Unit tests of module M3 IdentityRules (gam-ai-knowledge/concepts/identity.md §16, §17):
// IDN-T-21 (password rules and strength), IDN-T-22 (registration input) and the shared half of
// IDN-T-1. The values are those of §10, example 1.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { errorReplies } from "../errors.ts";
import {
  commonPasswords,
  emailSchema,
  loginInputSchema,
  passwordProblems,
  registrationInputSchema,
  strength,
} from "./index.ts";

const valid = {
  name: "Ada",
  email: "ada@example.org",
  password: "Drei-blaue-Wolken-7",
};

describe("IDN-T-21 IDN-AC-1.2 IDN-F-2 password rules and strength", () => {
  const rows: [string, string[], string][] = [
    ["kurz123", ["too-short"], "weak"],
    ["password1234", ["common"], "weak"],
    ["Password1234", ["common"], "weak"],
    ["meinkatzenbaum", [], "fair"],
    ["Katzenbaum42x", [], "good"],
    ["dreiblauewolkenziehen", [], "good"],
    ["Drei-blaue-Wolken-7", [], "strong"],
    ["a".repeat(129), ["too-long"], "weak"],
  ];

  for (const [password, problems, level] of rows) {
    const shown = password.length > 20 ? `${password.length} x a` : password;
    it(`IDN-T-21 IDN-AC-1.2 ${shown} has the problems [${problems}] and the strength ${level}`, () => {
      assert.deepEqual(passwordProblems(password), problems);
      assert.equal(strength(password), level);
    });
  }

  it("IDN-T-21 IDN-AC-1.2 counts characters, not UTF-16 units: 12 emoji are long enough", () => {
    assert.deepEqual(passwordProblems("🔑".repeat(12)), []);
    assert.deepEqual(passwordProblems("🔑".repeat(11)), ["too-short"]);
  });

  it("IDN-T-21 IDN-AC-1.2 bundles the 10,000 most common passwords, in lower case", () => {
    assert.equal(commonPasswords.size, 10_000);
    assert.ok(commonPasswords.has("password1234"));
    for (const entry of commonPasswords)
      assert.equal(entry, entry.toLowerCase());
  });
});

describe("IDN-T-22 IDN-AC-1.1 IDN-F-1 registration input", () => {
  it("IDN-T-22 IDN-AC-1.1 accepts the example of the concept and normalises name and address", () => {
    const parsed = registrationInputSchema.parse({
      ...valid,
      name: "  Ada  ",
      email: "  Ada@Example.ORG ",
    });
    assert.equal(parsed.name, "Ada");
    assert.equal(parsed.email, "ada@example.org");
    assert.equal(parsed.botToken, undefined);
  });

  const cases: [string, Record<string, unknown>, string][] = [
    ["a name of spaces only", { name: "   " }, "name"],
    ["a name of 101 characters", { name: "a".repeat(101) }, "name"],
    ["the address ada@example", { email: "ada@example" }, "email"],
  ];
  for (const [title, change, field] of cases) {
    it(`IDN-T-22 IDN-AC-1.1 refuses ${title} and names the field ${field}`, () => {
      const result = registrationInputSchema.safeParse({ ...valid, ...change });
      assert.equal(result.success, false);
      assert.deepEqual(
        result.error?.issues.map((issue) => issue.path[0]),
        [field],
      );
    });
  }

  it("IDN-T-22 IDN-AC-1.1 accepts a name of exactly 100 characters", () => {
    const result = registrationInputSchema.safeParse({
      ...valid,
      name: "a".repeat(100),
    });
    assert.equal(result.success, true);
  });

  it("IDN-T-22 IDN-AC-1.2 refuses the passwords the rules refuse, naming the field password", () => {
    for (const password of ["kurz123", "password1234", "a".repeat(129)]) {
      const result = registrationInputSchema.safeParse({ ...valid, password });
      assert.equal(result.success, false, password);
      assert.deepEqual(
        result.error?.issues.map((issue) => issue.path[0]),
        ["password"],
      );
    }
  });

  it("IDN-T-22 IDN-AC-1.1 refuses an address longer than 254 characters", () => {
    const long = `${"a".repeat(250)}@example.org`;
    assert.equal(emailSchema.safeParse(long).success, false);
  });

  it("IDN-T-22 IDN-AC-1.1 refuses an address without a part before the @ or without a dot after it", () => {
    for (const email of [
      "@example.org",
      "ada.example.org",
      "a@b",
      "a@@b.org",
    ]) {
      assert.equal(emailSchema.safeParse(email).success, false, email);
    }
  });

  it("IDN-T-22 IDN-AC-1.5 passes an optional bot token through", () => {
    const parsed = registrationInputSchema.parse({ ...valid, botToken: "t" });
    assert.equal(parsed.botToken, "t");
  });
});

describe("IDN-F-7 login input", () => {
  it("IDN-F-7 takes any password of 1 to 128 characters, because the login must not reveal the rules", () => {
    assert.equal(
      loginInputSchema.safeParse({ email: "Ada@Example.org", password: "x" })
        .success,
      true,
    );
    assert.equal(
      loginInputSchema.safeParse({ email: "ada@example.org", password: "" })
        .success,
      false,
    );
    assert.equal(
      loginInputSchema.safeParse({
        email: "ada@example.org",
        password: "x".repeat(129),
      }).success,
      false,
    );
  });
});

describe("IDN-E-1 to IDN-E-9 error codes of the identity endpoints", () => {
  it("IDN-E-2 IDN-E-3 IDN-E-4 IDN-E-5 IDN-E-7 IDN-E-8 IDN-E-9 gives each code the status and the sentence of scaffolding.md §8", () => {
    const rows: [keyof typeof errorReplies, number, string][] = [
      ["bot-check-failed", 400, "The bot check failed."],
      ["too-many-requests", 429, "Too many requests. Try again later."],
      ["invalid-credentials", 401, "E-mail address or password is wrong."],
      [
        "address-not-confirmed",
        403,
        "Please confirm your e-mail address first.",
      ],
      ["registration-closed", 403, "Registration is closed."],
      ["link-invalid", 400, "This link is invalid or has expired."],
      ["no-session", 401, "No valid session."],
    ];
    for (const [code, status, message] of rows) {
      assert.deepEqual(errorReplies[code], { status, body: { code, message } });
    }
  });
});
