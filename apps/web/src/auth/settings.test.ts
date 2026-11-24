import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { registrationSettings } from "./settings.ts";

describe("M8 settings of the registration page", () => {
  it("IDN-T-51 IDN-AC-1.7 IDN-F-30: the defaults open the page without bot check", () => {
    assert.deepEqual(registrationSettings({}), { open: true, siteKey: null });
    assert.deepEqual(registrationSettings({ REGISTRATION_ENABLED: "false" }), {
      open: false,
      siteKey: null,
    });
  });

  it("IDN-T-49 IDN-AC-1.5 IDN-F-5: the site key is only handed on while the bot check is on", () => {
    assert.deepEqual(
      registrationSettings({ CAPTCHA_ENABLED: "false", CAPTCHA_SITE_KEY: "k" }),
      { open: true, siteKey: null },
    );
    assert.deepEqual(
      registrationSettings({ CAPTCHA_ENABLED: "true", CAPTCHA_SITE_KEY: "k" }),
      { open: true, siteKey: "k" },
    );
  });

  it("IDN-T-49 IDN-AC-1.5 SCF-NF-4: an invalid value is named without the value", () => {
    assert.throws(
      () => registrationSettings({ CAPTCHA_ENABLED: "secret-yes" }),
      (error: Error) =>
        error.message === "CAPTCHA_ENABLED: expected true or false" &&
        !error.message.includes("secret-yes"),
    );
    assert.throws(
      () => registrationSettings({ CAPTCHA_ENABLED: "true" }),
      /CAPTCHA_SITE_KEY: required when CAPTCHA_ENABLED is true/,
    );
  });
});
