import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { healthReportSchema } from "@stash/contracts";
import { health } from "./cms-health/index.ts";

// PUB-AC-1.1 CMS container (concept public-content.md §16 cms-health, §17; tests PUB-T-1 (report),
// PUB-T-76, PUB-T-77). Slice 1 holds the check `content-store`; the check `administrator-account`
// joins with slice 2 (PUB-AC-1.7). `health` takes the probe of the content store as a stub.

const options = { version: "0.0.0-dev", timeoutMs: 50 };

describe("PUB-AC-1.1 CMS container: the health report of cms", () => {
  it("PUB-AC-1.1 PUB-T-1 reports the unit cms with the essential check content-store ok when the content store answers", async () => {
    const report = await health(async () => undefined, options);
    assert.deepEqual(report, {
      unit: "cms",
      version: "0.0.0-dev",
      status: "ok",
      checks: [{ name: "content-store", essential: true, status: "ok" }],
    });
    assert.ok(healthReportSchema.safeParse(report).success);
  });

  it("PUB-AC-1.1 PUB-T-76 reports content-store down and the status down when the probe does not answer within the timeout", async () => {
    const report = await health(
      () => new Promise<void>(() => undefined),
      options,
    );
    assert.equal(report.status, "down");
    assert.deepEqual(report.checks, [
      { name: "content-store", essential: true, status: "down" },
    ]);
  });

  it("PUB-AC-1.1 PUB-T-76 reports content-store down when the probe fails", async () => {
    const report = await health(async () => {
      throw new Error("connect ECONNREFUSED 10.0.0.7:5432");
    }, options);
    assert.equal(report.status, "down");
    assert.equal(report.checks[0]?.status, "down");
  });

  it("PUB-AC-1.1 PUB-T-77 PUB-F-31 holds no host, port, credential, or version of a dependency in any report", async () => {
    const failing = await health(async () => {
      throw new Error(
        "password authentication failed for user stash at cms-db:5432 (PostgreSQL 18.1)",
      );
    }, options);
    const working = await health(async () => undefined, options);
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
