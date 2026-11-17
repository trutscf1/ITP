// IDN-T-26 (M6, IDN-F-38) and the unit test of IDN-E-11 (e-mail not delivered). The mailer talks
// to the recording SMTP stub of the test, never to a real host. These tests need no database.
import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { createLogger } from "./logger.ts";
import { chooseLanguage, createMailer } from "./mailer.ts";
import { startSmtpStub } from "./test-support/smtp-stub.ts";

const config = {
  SMTP_FROM: "no-reply@stash.local",
  PUBLIC_ORIGIN: "http://localhost:8080",
  CONFIRMATION_LINK_TTL_HOURS: 24,
};

describe("IDN-T-26 IDN-F-38 language of the e-mails", () => {
  it("IDN-T-26 IDN-F-38 takes the first supported language of Accept-Language and falls back to German", () => {
    assert.equal(chooseLanguage("en-GB,de;q=0.5"), "en");
    assert.equal(chooseLanguage("de-AT,en;q=0.9"), "de");
    assert.equal(chooseLanguage("fr"), "de");
    assert.equal(chooseLanguage("fr, en;q=0.8"), "en");
    assert.equal(chooseLanguage("de;q=0.4, en;q=0.9"), "en");
    assert.equal(chooseLanguage(undefined), "de");
    assert.equal(chooseLanguage(""), "de");
    assert.equal(chooseLanguage("*"), "de");
  });

  it("IDN-T-26 IDN-F-38 sends the three e-mails in English for en-GB,de;q=0.5 and in German for fr", async () => {
    const smtp = await startSmtpStub();
    const mailer = createMailer(
      { ...config, SMTP_HOST: "127.0.0.1", SMTP_PORT: smtp.port },
      createLogger(() => {}),
    );
    for (const language of ["en", "de"] as const) {
      await mailer.sendConfirmation({
        to: `${language}@example.org`,
        language,
        token: "tok-1",
      });
      await mailer.sendNotice({ to: `${language}@example.org`, language });
      await mailer.sendReset({
        to: `${language}@example.org`,
        language,
        token: "tok-2",
        validityMinutes: 30,
      });
    }
    const english = smtp.to("en@example.org");
    assert.deepEqual(
      english.map((mail) => mail.subject),
      [
        "Confirm your e-mail address for stash",
        "Someone tried to register with your address",
        "Reset your stash password",
      ],
    );
    const german = smtp.to("de@example.org");
    assert.deepEqual(
      german.map((mail) => mail.subject),
      [
        "Bestätige deine E-Mail-Adresse für stash",
        "Jemand wollte sich mit deiner Adresse registrieren",
        "Setze dein stash-Passwort zurück",
      ],
    );
    assert.match(
      english[0]?.text ?? "",
      /http:\/\/localhost:8080\/api\/identity\/confirm\?token=tok-1/,
    );
    assert.match(english[0]?.text ?? "", /24 hours/);
    assert.match(german[0]?.text ?? "", /24 Stunden/);
    assert.doesNotMatch(english[1]?.text ?? "", /https?:\/\//);
    assert.match(
      english[2]?.text ?? "",
      /http:\/\/localhost:8080\/reset-password\?token=tok-2/,
    );
    assert.match(english[2]?.text ?? "", /30 minutes/);
    assert.equal(english[0]?.from, "no-reply@stash.local");
    await smtp.close();
  });
});

describe("IDN-E-11 IDN-AC-1.4 e-mail not delivered", () => {
  const stubs: { close(): Promise<void> }[] = [];
  after(async () => {
    for (const stub of stubs) await stub.close();
  });

  it("IDN-E-11 reports a refusing SMTP host as not delivered, never throws, and logs an error without the address or the link", async () => {
    const smtp = await startSmtpStub("refuse");
    stubs.push(smtp);
    const lines: string[] = [];
    const mailer = createMailer(
      { ...config, SMTP_HOST: "127.0.0.1", SMTP_PORT: smtp.port },
      createLogger((line) => lines.push(line)),
    );
    const delivered = await mailer.sendConfirmation({
      to: "ada@example.org",
      language: "en",
      token: "secret-token",
    });
    assert.equal(delivered, false);
    assert.equal(lines.length, 1);
    const entry = JSON.parse(lines[0] ?? "{}") as Record<string, unknown>;
    assert.equal(entry.level, "error");
    assert.equal(lines[0]?.includes("ada@example.org"), false);
    assert.equal(lines[0]?.includes("secret-token"), false);
  });

  it("IDN-E-11 gives up on a host that does not answer within the time limit", async () => {
    const smtp = await startSmtpStub("silent");
    stubs.push(smtp);
    const lines: string[] = [];
    const mailer = createMailer(
      { ...config, SMTP_HOST: "127.0.0.1", SMTP_PORT: smtp.port },
      createLogger((line) => lines.push(line)),
      { timeoutMs: 300 },
    );
    const started = Date.now();
    const delivered = await mailer.sendNotice({
      to: "ada@example.org",
      language: "de",
    });
    assert.equal(delivered, false);
    assert.ok(Date.now() - started < 3000);
    assert.equal(JSON.parse(lines[0] ?? "{}").level, "error");
  });

  it("IDN-E-11 reports an unreachable host as not delivered", async () => {
    const mailer = createMailer(
      { ...config, SMTP_HOST: "127.0.0.1", SMTP_PORT: 1 },
      createLogger(() => {}),
    );
    assert.equal(
      await mailer.sendNotice({ to: "ada@example.org", language: "en" }),
      false,
    );
  });
});
