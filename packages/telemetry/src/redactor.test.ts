import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { redactAttributes, redactText } from "./index.ts";
import { data } from "./test-support/harness.ts";

interface Case {
  input: Record<string, string>;
  expected: Record<string, string>;
}
const cases = data<{ example1: Case; table22: Case }>("redaction-secrets.json");

describe("M3 Redactor", () => {
  it("OBS-T-21 OBS-F-14 OBS-AC-1.4 replaces the values of password, session token, and key", () => {
    assert.deepEqual(
      redactAttributes(cases.example1.input),
      cases.example1.expected,
    );
  });

  it("OBS-T-22 OBS-F-14 OBS-AC-1.4 matches fragments ignoring case and the keys code and state as a whole", () => {
    assert.deepEqual(
      redactAttributes(cases.table22.input),
      cases.table22.expected,
    );
  });

  it("OBS-F-14 keeps the key state only as a whole key", () => {
    assert.deepEqual(
      redactAttributes({ state: "x", stateful: "y", STATE: "z" }),
      { state: "[redacted]", stateful: "y", STATE: "[redacted]" },
    );
  });

  it("OBS-F-14 has no side effect on its input", () => {
    const input = { password: "p" };
    redactAttributes(input);
    assert.deepEqual(input, { password: "p" });
  });
});

describe("M3 Redactor, text patterns", () => {
  it("OBS-AC-1.6 OBS-NF-2 replaces an e-mail address and an IPv4 address", () => {
    assert.equal(
      redactText(
        "share link opened by ada@example.org from 203.0.113.7 at 10:00:00",
      ),
      "share link opened by [redacted] from [redacted] at 10:00:00",
    );
  });

  it("OBS-AC-1.6 OBS-NF-2 replaces an IPv6 address and keeps a time", () => {
    assert.equal(
      redactText("upstream fe80::1 refused"),
      "upstream [redacted] refused",
    );
    assert.equal(
      redactText("2001:db8:0:0:0:0:0:1 and 10:00:00"),
      "[redacted] and 10:00:00",
    );
  });

  it("OBS-AC-1.6 OBS-F-14 keeps a C++ scope, a time, and a MAC address, which are no IPv6 addresses", () => {
    assert.equal(redactText("std::vector overflow"), "std::vector overflow");
    assert.equal(redactText("Foo::bar failed"), "Foo::bar failed");
    assert.equal(
      redactText("at 10:00:00 and 12:30:45"),
      "at 10:00:00 and 12:30:45",
    );
    assert.equal(
      redactText("mac 00:1a:2b:3c:4d:5e seen"),
      "mac 00:1a:2b:3c:4d:5e seen",
    );
  });

  it("OBS-AC-1.6 OBS-F-14 redacts an IPv6 address at the end of a sentence, after an equals sign, and in brackets", () => {
    assert.equal(redactText("from 2001:db8::1."), "from [redacted].");
    assert.equal(redactText("client=2001:db8::1"), "client=[redacted]");
    assert.equal(redactText("[2001:db8::1]:443"), "[[redacted]]:443");
  });

  it("OBS-F-14 does not redact an address written directly after a colon, because that colon is part of the boundary (section 8)", () => {
    assert.equal(redactText("ip:2001:db8::1"), "ip:2001:db8::1");
  });

  it("OBS-AC-1.6 takes a four-part number as an address and keeps a version", () => {
    assert.equal(redactText("retry 1.2.3.4"), "retry [redacted]");
    assert.equal(redactText("retry 1.2.3.4."), "retry [redacted].");
    assert.equal(
      redactText("version 0.2.0 and 1.2.3.4.5"),
      "version 0.2.0 and 1.2.3.4.5",
    );
  });
});
