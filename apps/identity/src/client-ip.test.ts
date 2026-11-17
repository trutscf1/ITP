// IDN-F-9, IDN-F-35, Q352: the address the throttle counts. X-Forwarded-For is read only from a
// connection of the reverse proxy named by TRUSTED_PROXY; every other peer is counted by the
// address of its connection, whatever header it sends.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Hono } from "hono";
import { createClientAddress } from "./client-ip.ts";

function ask(
  clientAddress: ReturnType<typeof createClientAddress>,
  peer: string | undefined,
  forwarded?: string,
) {
  const app = new Hono();
  app.get("/", async (context) => context.text(await clientAddress(context)));
  const headers: Record<string, string> = {};
  if (forwarded !== undefined) headers["x-forwarded-for"] = forwarded;
  const env =
    peer === undefined
      ? undefined
      : { incoming: { socket: { remoteAddress: peer } } };
  return Promise.resolve(app.request("/", { headers }, env)).then((response) =>
    response.text(),
  );
}

/** A resolver stub: the proxy's name resolves to the given addresses, and calls are counted. */
function resolver(addresses: string[]) {
  const stub = Object.assign(
    async (_host: string) => {
      stub.calls += 1;
      return addresses;
    },
    { calls: 0 },
  );
  return stub;
}

describe("IDN-F-9 IDN-F-35 Q352 client address behind the reverse proxy", () => {
  it("IDN-F-9 Q352 takes the last X-Forwarded-For entry from the reverse proxy", async () => {
    const clientAddress = createClientAddress("proxy", {
      resolve: resolver(["172.18.0.5"]),
    });
    assert.equal(
      await ask(clientAddress, "172.18.0.5", "198.51.100.1, 203.0.113.7"),
      "203.0.113.7",
    );
  });

  it("IDN-F-9 Q352 counts another peer by its own address, whatever X-Forwarded-For it sends", async () => {
    const clientAddress = createClientAddress("proxy", {
      resolve: resolver(["172.18.0.5"]),
    });
    assert.equal(
      await ask(clientAddress, "172.18.0.9", "203.0.113.7"),
      "172.18.0.9",
    );
  });

  it("IDN-F-35 Q352 counts the reverse proxy itself by its address when it sends no header", async () => {
    const clientAddress = createClientAddress("proxy", {
      resolve: resolver(["172.18.0.5"]),
    });
    assert.equal(await ask(clientAddress, "172.18.0.5"), "172.18.0.5");
  });

  it("IDN-F-9 Q352 reads an IPv4 peer written as IPv6-mapped address like the plain one", async () => {
    const clientAddress = createClientAddress("172.18.0.5", {
      resolve: resolver([]),
    });
    assert.equal(
      await ask(clientAddress, "::ffff:172.18.0.5", "203.0.113.7"),
      "203.0.113.7",
    );
  });

  it("IDN-F-9 Q352 takes an address in TRUSTED_PROXY without asking the name service", async () => {
    const resolve = resolver(["10.9.9.9"]);
    const clientAddress = createClientAddress("172.18.0.5", { resolve });
    assert.equal(
      await ask(clientAddress, "172.18.0.5", "203.0.113.7"),
      "203.0.113.7",
    );
    assert.equal(resolve.calls, 0);
  });

  it("IDN-F-9 Q352 trusts no header while the name of the proxy does not resolve, and reports it", async () => {
    const errors: unknown[] = [];
    const clientAddress = createClientAddress("proxy", {
      resolve: async () => {
        throw new Error("ENOTFOUND");
      },
      onResolveError: (error) => errors.push(error),
    });
    assert.equal(
      await ask(clientAddress, "172.18.0.5", "203.0.113.7"),
      "172.18.0.5",
    );
    assert.equal(errors.length, 1);
  });

  it("IDN-F-9 Q352 asks the name service at most once within the cache time", async () => {
    let now = 0;
    const resolve = resolver(["172.18.0.5"]);
    const clientAddress = createClientAddress("proxy", {
      resolve,
      cacheMs: 30_000,
      now: () => now,
    });
    await ask(clientAddress, "172.18.0.5", "203.0.113.7");
    await ask(clientAddress, "172.18.0.5", "203.0.113.7");
    assert.equal(resolve.calls, 1);
    now = 30_001;
    await ask(clientAddress, "172.18.0.5", "203.0.113.7");
    assert.equal(resolve.calls, 2);
  });

  it("IDN-F-35 answers unknown without a connection address", async () => {
    const clientAddress = createClientAddress("proxy", {
      resolve: resolver(["172.18.0.5"]),
    });
    assert.equal(await ask(clientAddress, undefined, "203.0.113.7"), "unknown");
  });
});
