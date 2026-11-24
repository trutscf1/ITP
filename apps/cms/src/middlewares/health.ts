import { unitVersion } from "../boot.ts";
import { health, loadHealthCheckTimeoutMs } from "../cms-health/index.ts";

// The route GET /health of cms (SCF-F-5, PUB-F-9): the health report of the unit, 200 when the
// status is ok or degraded, 503 when it is down. It reads one row of the content store and counts the admin users.
interface Context {
  method: string;
  path: string;
  status: number;
  body: unknown;
}
interface StrapiLike {
  db: {
    connection: { raw(sql: string): Promise<unknown> };
    query(uid: "admin::user"): { count(): Promise<number> };
  };
}

export default (_config: unknown, { strapi }: { strapi: StrapiLike }) => {
  const timeoutMs = loadHealthCheckTimeoutMs(process.env);
  return async (ctx: Context, next: () => Promise<void>) => {
    if (
      ctx.path !== "/health" ||
      (ctx.method !== "GET" && ctx.method !== "HEAD")
    ) {
      return next();
    }
    // PUB-F-10: Strapi offers registration exactly while its admin user table is empty, so an
    // administrator exists exactly when it holds a row.
    const report = await health(
      () => strapi.db.connection.raw("select 1"),
      async () => (await strapi.db.query("admin::user").count()) > 0,
      { version: unitVersion, timeoutMs },
    );
    ctx.status = report.status === "down" ? 503 : 200;
    ctx.body = report;
  };
};
