import assert from "node:assert/strict";
import { describe, it } from "node:test";
import healthMiddleware from "./middlewares/health.ts";

// PUB-AC-1.7 Unclaimed administrator (concept public-content.md §16 cms-health, PUB-F-9, PUB-F-10):
// the route GET /health wires `health` to the content store and to the admin user table of Strapi.
// The Strapi instance is a stub with the two calls the route makes; the run against a real Strapi
// is PUB-T-7.

function strapiWith(adminUsers: number | Error) {
  const asked: string[] = [];
  const strapi = {
    db: {
      connection: { raw: async (_sql: string) => [] },
      query(uid: "admin::user") {
        asked.push(uid);
        return {
          count: async () => {
            if (adminUsers instanceof Error) throw adminUsers;
            return adminUsers;
          },
        };
      },
    },
  };
  return { strapi, asked };
}

async function get(strapi: ReturnType<typeof strapiWith>["strapi"]) {
  const ctx: { method: string; path: string; status: number; body: unknown } = {
    method: "GET",
    path: "/health",
    status: 404,
    body: undefined,
  };
  await healthMiddleware(undefined, { strapi })(ctx, async () => undefined);
  return ctx as unknown as {
    status: number;
    body: { status: string; checks: unknown };
  };
}

describe("PUB-AC-1.7 Unclaimed administrator: the route /health of cms", () => {
  it("PUB-AC-1.7 PUB-F-10 answers 200 degraded with administrator-account down while the admin user table is empty", async () => {
    const { strapi, asked } = strapiWith(0);
    const ctx = await get(strapi);
    assert.equal(ctx.status, 200);
    assert.equal(ctx.body.status, "degraded");
    assert.deepEqual(ctx.body.checks, [
      { name: "content-store", essential: true, status: "ok" },
      { name: "administrator-account", essential: false, status: "down" },
    ]);
    assert.deepEqual(asked, ["admin::user"]);
  });

  it("PUB-AC-1.7 PUB-F-10 answers 200 ok once the admin user table holds a row", async () => {
    const ctx = await get(strapiWith(1).strapi);
    assert.equal(ctx.status, 200);
    assert.equal(ctx.body.status, "ok");
  });

  it("PUB-AC-1.7 PUB-F-31 answers degraded without the error text when counting the admin users fails", async () => {
    const ctx = await get(
      strapiWith(new Error('relation "admin_users" does not exist')).strapi,
    );
    assert.equal(ctx.status, 200);
    assert.equal(ctx.body.status, "degraded");
    assert.ok(!JSON.stringify(ctx.body).includes("admin_users"));
  });

  it("PUB-AC-1.7 hands every other request to the next middleware", async () => {
    const { strapi, asked } = strapiWith(1);
    let passed = false;
    const ctx = { method: "GET", path: "/api/pages", status: 404, body: 1 };
    await healthMiddleware(undefined, { strapi })(ctx, async () => {
      passed = true;
    });
    assert.equal(passed, true);
    assert.equal(ctx.body, 1);
    assert.deepEqual(asked, []);
  });
});
