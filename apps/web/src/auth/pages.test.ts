import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  LinkInvalidPageView,
  LoginPageView,
  RegisterPageView,
} from "./pages.ts";
import {
  RegistrationView,
  type RegistrationViewProps,
} from "./registration-view.ts";

const viewProps: RegistrationViewProps = {
  language: "en",
  values: { name: "   ", email: "ada@example", password: "kurz123" },
  problems: {
    name: "name-empty",
    email: "email-invalid",
    password: "too-short",
  },
  outcome: null,
  pending: false,
  botCheck: null,
  onChange: () => {},
  onSubmit: () => {},
};

describe("M8 registration page", () => {
  it("IDN-T-46 IDN-AC-1.1: each error stands next to its field and is linked to it", () => {
    const html = renderToStaticMarkup(
      createElement(RegistrationView, viewProps),
    );
    for (const [field, text] of [
      ["name", "Enter your name."],
      ["email", "Enter an e-mail address such as ada@example.org."],
      ["password", "Use at least 12 characters."],
    ]) {
      assert.match(
        html,
        new RegExp(`id="register-${field}"[^>]*aria-invalid="true"`),
      );
      assert.match(
        html,
        new RegExp(`aria-describedby="[^"]*register-${field}-error[^"]*"`),
      );
      // The error paragraph comes right after its input, inside the same field group.
      assert.match(
        html,
        new RegExp(
          `id="register-${field}"[^>]*/><p id="register-${field}-error"[^>]*>${text.replaceAll(".", "\\.")}</p>`,
        ),
      );
    }
  });

  it("IDN-T-46 IDN-AC-1.1: the entered name and e-mail address are kept", () => {
    const html = renderToStaticMarkup(
      createElement(RegistrationView, viewProps),
    );
    assert.match(html, /id="register-name"[^>]*value=" {3}"/);
    assert.match(html, /id="register-email"[^>]*value="ada@example"/);
  });

  it("IDN-T-47 IDN-AC-1.2: the strength bar shows its level as text", () => {
    const strong = renderToStaticMarkup(
      createElement(RegistrationView, {
        ...viewProps,
        problems: {},
        values: { ...viewProps.values, password: "Drei-blaue-Wolken-7" },
      }),
    );
    assert.ok(strong.includes("Password strength: <strong>Strong</strong>"));
    const weak = renderToStaticMarkup(
      createElement(RegistrationView, { ...viewProps, language: "de" }),
    );
    assert.ok(weak.includes("Passwortstärke: <strong>Schwach</strong>"));
  });

  it("IDN-T-49 IDN-AC-1.5: switched off, no bot-check widget is shown or loaded", () => {
    const html = renderToStaticMarkup(
      createElement(RegisterPageView, {
        language: "en",
        open: true,
        siteKey: null,
      }),
    );
    assert.ok(html.includes("<form"));
    assert.ok(!html.includes("data-sitekey"));
    assert.ok(!html.includes("challenges.cloudflare.com"));
  });

  it("IDN-T-49 IDN-AC-1.5: switched on, the widget is shown with the site key", () => {
    const html = renderToStaticMarkup(
      createElement(RegisterPageView, {
        language: "en",
        open: true,
        siteKey: "0x4AAAAAAA-site",
      }),
    );
    assert.ok(html.includes('data-sitekey="0x4AAAAAAA-site"'));
  });

  it("IDN-T-50 IDN-AC-1.6: the answer 202 replaces the form by the mailbox message", () => {
    const html = renderToStaticMarkup(
      createElement(RegistrationView, {
        ...viewProps,
        outcome: "check-mailbox",
      }),
    );
    assert.ok(
      html.includes(
        "Check your mailbox. If the address can be used, we have sent you an e-mail.",
      ),
    );
    assert.ok(!html.includes("<form"));
  });

  it("IDN-T-46 IDN-AC-1.1 IDN-U-1: an error answer of identity is shown above the form", () => {
    const html = renderToStaticMarkup(
      createElement(RegistrationView, {
        ...viewProps,
        problems: {},
        outcome: "too-many-requests",
      }),
    );
    assert.match(
      html,
      /role="alert"[^>]*>Too many attempts. Please wait a minute and try again.</,
    );
  });

  it("IDN-T-51 IDN-AC-1.7: closed, the page shows the notice instead of the form", () => {
    for (const [language, text] of [
      [
        "en",
        "Registration is closed. Ask the operator of this installation for an account.",
      ],
      [
        "de",
        "Die Registrierung ist geschlossen. Frag den Betreiber dieser Installation nach einem Konto.",
      ],
    ] as const) {
      const html = renderToStaticMarkup(
        createElement(RegisterPageView, {
          language,
          open: false,
          siteKey: null,
        }),
      );
      assert.ok(html.includes(text), language);
      assert.ok(!html.includes("<form"));
      assert.ok(html.includes(`lang="${language}"`));
    }
  });
});

describe("M8 confirmation result", () => {
  it("IDN-T-48 IDN-AC-1.4: /login?confirmed=1 shows the confirmation", () => {
    const html = renderToStaticMarkup(
      createElement(LoginPageView, { language: "en", confirmed: true }),
    );
    assert.ok(
      html.includes("Your e-mail address is confirmed. You can log in now."),
    );
    const plain = renderToStaticMarkup(
      createElement(LoginPageView, { language: "en", confirmed: false }),
    );
    assert.ok(!plain.includes("is confirmed"));
  });

  it("IDN-T-48 IDN-AC-1.4: /link-invalid?kind=confirm says so and offers a new link", () => {
    const html = renderToStaticMarkup(
      createElement(LinkInvalidPageView, { language: "en", kind: "confirm" }),
    );
    assert.ok(html.includes("This link is invalid or has expired."));
    assert.match(
      html,
      /<a [^>]*href="\/login"[^>]*>Log in to get a new link.<\/a>/,
    );
    const german = renderToStaticMarkup(
      createElement(LinkInvalidPageView, { language: "de", kind: "confirm" }),
    );
    assert.ok(german.includes("Dieser Link ist ungültig oder abgelaufen."));
  });
});
