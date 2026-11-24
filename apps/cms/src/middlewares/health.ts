import { unitVersion } from "../boot.ts";
import { health, loadHealthCheckTimeoutMs } from "../cms-health/index.ts";

// The route GET /health of cms (SCF-F-5, PUB-F-9): the health report of the unit, 200 when the
// status is ok or degraded, 503 when it is down. It reads one row of the content store.
interface Context {
  method: string;
  path: string;
  status: number;
  body: unknown;
}
interface StrapiLike {
  db: { connection: { raw(sql: string): Promise<unknown> } };
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
    const report = await health(() => strapi.db.connection.raw("select 1"), {
      version: unitVersion,
      timeoutMs,
    });
    ctx.status = report.status === "down" ? 503 : 200;
    ctx.body = report;
  };
};
