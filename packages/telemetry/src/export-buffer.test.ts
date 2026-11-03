import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ExportBuffer } from "./index.ts";
import { harness, parsed } from "./test-support/harness.ts";

describe("M5 ExportBuffer", () => {
  it("OBS-E-1 drops the oldest item when the limit is reached", () => {
    const buffer = new ExportBuffer<string>(3);
    for (const item of ["L1", "L2", "L3", "L4", "L5"]) buffer.add(item);
    assert.deepEqual(buffer.items, ["L3", "L4", "L5"]);
  });

  it("OBS-E-1 removes delivered items only on success and keeps items added meanwhile", async () => {
    const buffer = new ExportBuffer<string>(5);
    buffer.add("a");
    buffer.add("b");
    const ok = await buffer.deliver(async () => {
      buffer.add("c");
    }, 50);
    assert.equal(ok, true);
    assert.deepEqual(buffer.items, ["c"]);
  });

  it("OBS-E-1 OBS-NF-9 keeps the items after a failure and after 10 seconds without an answer", async () => {
    const buffer = new ExportBuffer<string>(5);
    buffer.add("a");
    assert.equal(
      await buffer.deliver(() => Promise.reject(new Error("down")), 50),
      false,
    );
    assert.equal(
      await buffer.deliver(() => new Promise(() => undefined), 20),
      false,
    );
    assert.deepEqual(buffer.items, ["a"]);
  });
});

describe("OBS-T-29 collector unreachable (example 9)", () => {
  it("OBS-T-29 OBS-E-1 OBS-NF-9 OBS-AC-1.7 keeps L3 to L5, writes L1 to L5 to standard output, and delivers after recovery", async () => {
    const h = harness({}, { bufferLimit: 3 });
    h.mode.value = "silent";
    for (const n of [1, 2, 3, 4, 5]) h.telemetry.log.info(`L${n}`);
    assert.deepEqual(
      parsed(h.lines).map((line) => line.message),
      ["L1", "L2", "L3", "L4", "L5"],
    );
    await h.tick();
    assert.deepEqual(h.received.logs, []);
    h.mode.value = "ok";
    await h.tick();
    assert.deepEqual(
      h.received.logs.map((entry) => entry.message),
      ["L3", "L4", "L5"],
    );
  });

  it("OBS-E-1 writes at most one debug entry per minute about a failed export", async () => {
    const h = harness({ logLevel: "debug" });
    h.mode.value = "fail";
    await h.tick();
    await h.tick();
    h.clock.advance(30_000);
    await h.tick();
    const failures = () =>
      parsed(h.lines).filter(
        (line) => line.message === "telemetry export failed",
      );
    assert.equal(failures().length, 1);
    assert.equal(failures()[0]?.level, "debug");
    h.clock.advance(31_000);
    await h.tick();
    assert.equal(failures().length, 2);
  });
});
