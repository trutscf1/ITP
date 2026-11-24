// IDN-NF-4: log entries of `identity` hold no secret.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createLogger } from "./logger.ts";

describe("IDN-NF-4 IDN-F-3 no secrets in logs", () => {
  it("IDN-NF-4 writes one JSON line with level, time, and message", () => {
    const lines: string[] = [];
    createLogger(
      (line) => lines.push(line),
      () => new Date("2026-11-17T10:00:00Z"),
    ).info("started", { port: 3001 });
    assert.deepEqual(JSON.parse(lines[0] ?? ""), {
      time: "2026-11-17T10:00:00.000Z",
      level: "info",
      msg: "started",
      port: 3001,
    });
  });

  it("IDN-NF-4 redacts every key of the secret list, at any depth and in any case", () => {
    const lines: string[] = [];
    createLogger((line) => lines.push(line)).info("x", {
      password: "p1",
      passwordHash: "p2",
      hash: "p3",
      token: "p4",
      sessionToken: "p5",
      confirmationToken: "p6",
      resetToken: "p7",
      botToken: "p8",
      secret: "p9",
      authorization: "p10",
      cookie: "p11",
      nested: { Password: "p12", list: [{ botToken: "p13" }] },
      fine: "visible",
    });
    const text = lines[0] ?? "";
    for (let i = 1; i <= 13; i++)
      assert.equal(text.includes(`"p${i}"`), false, `p${i}`);
    assert.match(text, /visible/);
    assert.match(text, /\[redacted\]/);
  });

  it("IDN-NF-4 never throws on an attribute it cannot serialise", () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    const lines: string[] = [];
    createLogger((line) => lines.push(line)).error("x", { circular });
    assert.equal(lines.length, 1);
  });
});
