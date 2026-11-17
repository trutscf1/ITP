import { getConnInfo } from "@hono/node-server/conninfo";
import type { Context } from "hono";

/**
 * The address of the client for the throttle (IDN-F-35). The reverse proxy replaces
 * X-Forwarded-For with the address it saw, and `identity` publishes no port, so the last entry
 * is the one the proxy wrote; without the header the address of the connection is used.
 */
export function clientIp(context: Context): string {
  const forwarded = context.req.header("x-forwarded-for");
  const last = forwarded?.split(",").pop()?.trim();
  if (last) return last.slice(0, 64);
  try {
    return (getConnInfo(context).remote.address ?? "unknown").slice(0, 64);
  } catch {
    return "unknown";
  }
}
