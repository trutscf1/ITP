import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pickLanguage, texts } from "./messages.ts";
import {
  registrationBody,
  registrationOutcome,
  registrationProblems,
  strengthText,
} from "./registration.ts";

const valid = {
  name: "Ada",
  email: "ada@example.org",
  password: "Drei-blaue-Wolken-7",
};

describe("M8 registration rules of the page", () => {
  it("IDN-T-46 IDN-AC-1.1: an empty name, a name of 101 characters, and ada@example are refused before sending", () => {
    assert.deepEqual(registrationProblems({ ...valid, name: "   " }), {
      name: "name-empty",
    });
    assert.deepEqual(
      registrationProblems({ ...valid, name: "x".repeat(101) }),
      {
        name: "name-too-long",
      },
    );
    assert.deepEqual(registrationProblems({ ...valid, email: "ada@example" }), {
      email: "email-invalid",
    });
    assert.deepEqual(registrationProblems(valid), {});
  });

  it("IDN-T-46 IDN-AC-1.1: each problem has its field text in English and German", () => {
    assert.equal(texts.en.problems["name-empty"], "Enter your name.");
    assert.equal(
      texts.de.problems["name-too-long"],
      "Verwende höchstens 100 Zeichen.",
    );
    assert.equal(
      texts.en.problems["email-invalid"],
      "Enter an e-mail address such as ada@example.org.",
    );
  });

  it("IDN-T-47 IDN-AC-1.2: kurz123 and password1234 are refused, Drei-blaue-Wolken-7 is accepted", () => {
    assert.deepEqual(registrationProblems({ ...valid, password: "kurz123" }), {
      password: "too-short",
    });
    assert.deepEqual(
      registrationProblems({ ...valid, password: "password1234" }),
      {
        password: "common",
      },
    );
    assert.deepEqual(registrationProblems(valid), {});
  });

  it("IDN-T-47 IDN-AC-1.2: the strength bar reads Weak, Weak, Strong", () => {
    assert.deepEqual(
      ["kurz123", "password1234", "Drei-blaue-Wolken-7"].map((password) =>
        strengthText(password, "en"),
      ),
      ["Weak", "Weak", "Strong"],
    );
    assert.deepEqual(
      ["kurz123", "password1234", "Drei-blaue-Wolken-7"].map((password) =>
        strengthText(password, "de"),
      ),
      ["Schwach", "Schwach", "Stark"],
    );
    assert.equal(strengthText("", "en"), null);
  });

  it("IDN-T-49 IDN-AC-1.5: without the bot check the body has no botToken", () => {
    assert.deepEqual(registrationBody(valid, null), valid);
    assert.equal("botToken" in registrationBody(valid, null), false);
  });

  it("IDN-T-49 IDN-AC-1.5: with the bot check its token is sent as botToken", () => {
    assert.deepEqual(registrationBody(valid, "token-1"), {
      ...valid,
      botToken: "token-1",
    });
  });

  it("IDN-T-50 IDN-AC-1.6: every answer 202 check-mailbox gives the mailbox message", () => {
    assert.equal(
      registrationOutcome(202, { status: "check-mailbox" }),
      "check-mailbox",
    );
    assert.equal(
      texts.en.outcomes["check-mailbox"],
      "Check your mailbox. If the address can be used, we have sent you an e-mail.",
    );
  });

  it("IDN-T-46 IDN-AC-1.1 IDN-U-1: error answers of identity become form texts", () => {
    assert.equal(
      registrationOutcome(400, { code: "bot-check-failed" }),
      "bot-check-failed",
    );
    assert.equal(
      registrationOutcome(429, { code: "too-many-requests" }),
      "too-many-requests",
    );
    assert.equal(
      registrationOutcome(403, { code: "registration-closed" }),
      "registration-closed",
    );
    assert.equal(
      registrationOutcome(400, { code: "validation-failed" }),
      "validation-failed",
    );
    assert.equal(
      registrationOutcome(500, { code: "internal-error" }),
      "failed",
    );
    assert.equal(registrationOutcome(502, "<html>"), "failed");
    assert.equal(registrationOutcome(202, {}), "failed");
  });
});

describe("M8 language of the pages", () => {
  it("IDN-T-52 IDN-F-38: the first supported language of Accept-Language, German otherwise", () => {
    assert.equal(pickLanguage("en-GB,de;q=0.5"), "en");
    assert.equal(pickLanguage("de-AT,en;q=0.8"), "de");
    assert.equal(pickLanguage("fr-FR,en;q=0.7,de;q=0.9"), "de");
    assert.equal(pickLanguage("fr"), "de");
    assert.equal(pickLanguage("en;q=0,de;q=0.1"), "de");
    assert.equal(pickLanguage(null), "de");
  });
});
