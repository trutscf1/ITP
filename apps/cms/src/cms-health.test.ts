import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { healthReportSchema } from "@stash/contracts";
import { health } from "./cms-health/index.ts";

// PUB-AC-1.1 CMS container and PUB-AC-1.7 Unclaimed administrator (concept public-content.md §16
// cms-health, §17; tests PUB-T-1 (report), PUB-T-76, PUB-T-77, PUB-T-7). `health` takes the probe of
// the content store and the question "does an administrator exist" as stubs.

const claimed = async () => true;

const options = { version: "0.0.0-dev", timeoutMs: 50 };

describe("PUB-AC-1.1 CMS container: the health report of cms", () => {
  it("PUB-AC-1.1 PUB-T-1 reports the unit cms with the essential check content-store ok when the content store answers", async () => {
    const report = await health(async () => undefined, claimed, options);
    assert.deepEqual(report, {
      unit: "cms",
      version: "0.0.0-dev",
      status: "ok",
      checks: [
        { name: "content-store", essential: true, status: "ok" },
        { name: "administrator-account", essential: false, status: "ok" },
      ],
    });
    assert.ok(healthReportSchema.safeParse(report).success);
  });

  it("PUB-AC-1.1 PUB-T-76 reports content-store down and the status down when the probe does not answer within the timeout", async () => {
    const report = await health(
      () => new Promise<void>(() => undefined),
      claimed,
      options,
    );
    assert.equal(report.status, "down");
    assert.deepEqual(report.checks, [
      { name: "content-store", essential: true, status: "down" },
      { name: "administrator-account", essential: false, status: "down" },
    ]);
  });

  it("PUB-AC-1.1 PUB-T-76 reports content-store down when the probe fails", async () => {
    const report = await health(
      async () => {
        throw new Error("connect ECONNREFUSED 10.0.0.7:5432");
      },
      claimed,
      options,
    );
    assert.equal(report.status, "down");
    assert.equal(report.checks[0]?.status, "down");
  });

  it("PUB-AC-1.1 PUB-T-77 PUB-F-31 holds no host, port, credential, or version of a dependency in any report", async () => {
    const failing = await health(
      async () => {
        throw new Error(
          "password authentication failed for user stash at cms-db:5432 (PostgreSQL 18.1)",
        );
      },
      claimed,
      options,
    );
    const working = await health(async () => undefined, claimed, options);
    for (const report of [failing, working]) {
      const text = JSON.stringify(report);
      assert.ok(!/cms-db|5432|password|PostgreSQL|18\.1|ECONN/.test(text));
      assert.deepEqual(Object.keys(report).sort(), [
        "checks",
        "status",
        "unit",
        "version",
      ]);
    }
  });
});

describe("PUB-AC-1.7 Unclaimed administrator: the check administrator-account", () => {
  it("PUB-AC-1.7 PUB-T-7 reports degraded and names administrator-account while nobody registered", async () => {
    const report = await health(
      async () => undefined,
      async () => false,
      options,
    );
    assert.equal(report.status, "degraded");
    assert.deepEqual(report.checks, [
      { name: "content-store", essential: true, status: "ok" },
      { name: "administrator-account", essential: false, status: "down" },
    ]);
    assert.ok(healthReportSchema.safeParse(report).success);
  });

  it("PUB-AC-1.7 reports ok after the first administrator registered", async () => {
    const report = await health(async () => undefined, claimed, options);
    assert.equal(report.status, "ok");
  });

  it("PUB-AC-1.7 reports administrator-account down when the question fails or does not answer in time", async () => {
    const failing = await health(
      async () => undefined,
      async () => {
        throw new Error("relation admin_users does not exist");
      },
      options,
    );
    const silent = await health(
      async () => undefined,
      () => new Promise<boolean>(() => undefined),
      options,
    );
    for (const report of [failing, silent]) {
      assert.equal(report.status, "degraded");
      assert.equal(report.checks[1]?.status, "down");
    }
  });

  it("PUB-AC-1.7 reports administrator-account down while content-store is down, whatever the question answers", async () => {
    const report = await health(
      async () => {
        throw new Error("down");
      },
      claimed,
      options,
    );
    assert.equal(report.status, "down");
    assert.equal(report.checks[1]?.status, "down");
  });

  it("PUB-AC-1.7 SCF-NF-3 runs both checks at the same time, so a slow content store and a silent question take one timeout, not two", async () => {
    const timeoutMs = 200;
    const started = performance.now();
    const report = await health(
      () => new Promise<void>((resolve) => setTimeout(resolve, 150)),
      () => new Promise<boolean>(() => undefined),
      { version: "0.0.0-dev", timeoutMs },
    );
    const elapsed = performance.now() - started;
    assert.equal(report.status, "degraded");
    assert.equal(report.checks[0]?.status, "ok");
    assert.equal(report.checks[1]?.status, "down");
    assert.ok(
      elapsed < timeoutMs + 100,
      `took ${Math.round(elapsed)} ms, more than one timeout of ${timeoutMs} ms`,
    );
  });

  it("PUB-AC-1.7 PUB-T-77 PUB-F-31 holds nothing of a failed administrator question in the report", async () => {
    const report = await health(
      async () => undefined,
      async () => {
        throw new Error(
          'relation "admin_users" does not exist at cms-db:5432 (PostgreSQL 18.1)',
        );
      },
      options,
    );
    const text = JSON.stringify(report);
    assert.ok(!/admin_users|relation|cms-db|5432|PostgreSQL|18\.1/.test(text));
    assert.equal(report.checks[1]?.status, "down");
  });
});
