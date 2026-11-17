// The health endpoint of `identity` (SCF-F-5 to SCF-F-7, SCF-NF-3, SCF-T-37, SCF-T-38) and the
// error responses of unknown paths (SCF-F-21).
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { healthReportSchema } from "@stash/contracts";
import { skip } from "./test-support/database.ts";
import {
  type Running,
  type Stack,
  startIdentity,
  startStack,
} from "./test-support/harness.ts";

describe("SCF-F-5 SCF-F-7 IDN-E-10 health of identity", { skip }, () => {
  let stack: Stack;
  before(async () => {
    stack = await startStack();
  });
  after(async () => {
    await stack?.stop();
  });

  it("SCF-T-37 SCF-F-5 reports ok with the checks relational-database and session-store, and nothing of their hosts", async () => {
    const running = await startIdentity(stack, {
      env: { APP_VERSION: "0.1.0" },
    });
    const reply = await running.get("/health");
    assert.equal(reply.status, 200);
    assert.deepEqual(reply.body, {
      unit: "identity",
      version: "0.1.0",
      status: "ok",
      checks: [
        { name: "relational-database", essential: true, status: "ok" },
        { name: "session-store", essential: true, status: "ok" },
      ],
    });
    assert.ok(healthReportSchema.safeParse(reply.body).success);
    await running.close();
  });

  it("SCF-T-38 SCF-F-6 SCF-E-2 reports down within 2000 ms when the database check does not answer", async () => {
    const running: Running = await startIdentity(stack, {
      probes: { database: () => new Promise(() => {}) },
    });
    const started = Date.now();
    const reply = await running.get("/health");
    assert.ok(Date.now() - started < 2000);
    assert.equal(reply.status, 200);
    assert.equal(reply.body?.status, "down");
    assert.deepEqual(reply.body?.checks, [
      { name: "relational-database", essential: true, status: "down" },
      { name: "session-store", essential: true, status: "ok" },
    ]);
    await running.close();
  });

  it("IDN-E-10 marks the session store down when its check fails", async () => {
    const running = await startIdentity(stack, {
      probes: { sessionStore: () => Promise.reject(new Error("redis down")) },
    });
    const reply = await running.get("/health");
    assert.equal(reply.body?.status, "down");
    assert.deepEqual(reply.body?.checks, [
      { name: "relational-database", essential: true, status: "ok" },
      { name: "session-store", essential: true, status: "down" },
    ]);
    await running.close();
  });

  it("SCF-F-21 answers an unknown path with 404 not-found and a wrong method with 405 method-not-allowed", async () => {
    const running = await startIdentity(stack);
    const unknown = await running.get("/nothing-here");
    assert.equal(unknown.status, 404);
    assert.equal(unknown.body?.code, "not-found");
    const wrong = await running.get("/register");
    assert.equal(wrong.status, 405);
    assert.equal(wrong.body?.code, "method-not-allowed");
    await running.close();
  });
});
