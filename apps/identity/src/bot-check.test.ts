// IDN-C-5 / IDN-F-5 / IDN-E-2: the real bot check against a local stand-in of the provider's
// verification address. No test calls a service on the internet (IDN-NF-6).
import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import { after, describe, it } from "node:test";
import { createBotCheck, siteverifyUrl } from "./bot-check.ts";

interface Seen {
  body: URLSearchParams;
  contentType: string | undefined;
}

describe("IDN-F-5 IDN-E-2 bot check against the provider", () => {
  const servers: Server[] = [];
  after(() => {
    for (const server of servers) server.close();
  });

  /** A stand-in provider; `handler` decides the answer. */
  async function provider(
    handler: (
      seen: Seen,
      respond: (status: number, body: string) => void,
    ) => void,
  ) {
    const seen: Seen[] = [];
    const server = createServer((request, response) => {
      let data = "";
      request.on("data", (chunk) => {
        data += chunk;
      });
      request.on("end", () => {
        const entry = {
          body: new URLSearchParams(data),
          contentType: request.headers["content-type"],
        };
        seen.push(entry);
        handler(entry, (status, body) => {
          response.writeHead(status, { "content-type": "application/json" });
          response.end(body);
        });
      });
    });
    servers.push(server);
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;
    // The check posts to the real address; the test redirects that one address to the stand-in.
    const fetchStub: typeof fetch = (input, init) => {
      assert.equal(String(input), siteverifyUrl);
      return fetch(`http://127.0.0.1:${port}/siteverify`, init);
    };
    return { seen, fetch: fetchStub };
  }

  it("IDN-F-5 posts secret, token, and the client address to the provider and accepts a success", async () => {
    const stub = await provider((_seen, respond) =>
      respond(200, JSON.stringify({ success: true })),
    );
    const check = createBotCheck({ secret: "s3cret", fetch: stub.fetch });
    assert.equal(await check.verify("tok", "198.51.100.4"), true);
    const request = stub.seen[0];
    assert.match(
      request?.contentType ?? "",
      /application\/x-www-form-urlencoded/,
    );
    assert.equal(request?.body.get("secret"), "s3cret");
    assert.equal(request?.body.get("response"), "tok");
    assert.equal(request?.body.get("remoteip"), "198.51.100.4");
  });

  it("IDN-E-2 refuses a rejected token", async () => {
    const stub = await provider((_seen, respond) =>
      respond(
        200,
        JSON.stringify({
          success: false,
          "error-codes": ["invalid-input-response"],
        }),
      ),
    );
    assert.equal(
      await createBotCheck({ secret: "s", fetch: stub.fetch }).verify("tok"),
      false,
    );
  });

  it("IDN-E-2 refuses an empty token without asking the provider", async () => {
    const stub = await provider((_seen, respond) =>
      respond(200, JSON.stringify({ success: true })),
    );
    assert.equal(
      await createBotCheck({ secret: "s", fetch: stub.fetch }).verify(""),
      false,
    );
    assert.equal(
      await createBotCheck({ secret: "s", fetch: stub.fetch }).verify(
        undefined,
      ),
      false,
    );
    assert.equal(stub.seen.length, 0);
  });

  it("IDN-E-2 never lets a request through when the provider fails: error status, no JSON, wrong shape", async () => {
    for (const [status, body] of [
      [500, JSON.stringify({ success: true })],
      [200, "<html>"],
      [200, JSON.stringify({ success: "yes" })],
      [200, JSON.stringify({})],
    ] as const) {
      const stub = await provider((_seen, respond) => respond(status, body));
      assert.equal(
        await createBotCheck({ secret: "s", fetch: stub.fetch }).verify("tok"),
        false,
        `${status} ${body}`,
      );
    }
  });

  it("IDN-E-2 refuses when the provider does not answer within the time limit", async () => {
    const stub = await provider(() => {
      // never answers
    });
    const check = createBotCheck({
      secret: "s",
      fetch: stub.fetch,
      timeoutMs: 200,
    });
    const started = Date.now();
    assert.equal(await check.verify("tok"), false);
    assert.ok(Date.now() - started < 3000);
  });

  it("IDN-E-2 refuses when the provider is unreachable", async () => {
    const check = createBotCheck({
      secret: "s",
      fetch: () => Promise.reject(new Error("connect ECONNREFUSED")),
    });
    assert.equal(await check.verify("tok"), false);
  });
});
