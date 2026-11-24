// The address of the client for the throttle (IDN-F-9, IDN-F-35; concept §8 "Client address").
// The reverse proxy replaces X-Forwarded-For with the address it saw, so the last entry is the
// one it wrote. That header is read only from a connection of the reverse proxy named by
// TRUSTED_PROXY (Q352); every other peer, such as another unit on the same network, is counted by
// the address of its own connection, so it cannot choose the counted address.
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { getConnInfo } from "@hono/node-server/conninfo";
import type { Context } from "hono";

export type ClientAddress = (context: Context) => Promise<string>;

export interface ClientAddressOptions {
  /** Told when TRUSTED_PROXY does not resolve, so a misconfiguration is visible. */
  onResolveError?: (error: unknown) => void;
  /** Resolves a host name to its addresses; the name service by default. */
  resolve?: (host: string) => Promise<string[]>;
  /** How long a resolved address of the proxy is used, so a restarted proxy is found again. */
  cacheMs?: number;
  now?: () => number;
}

const resolveAll = async (host: string) =>
  (await lookup(host, { all: true })).map((entry) => entry.address);

/** An IPv4 address written as IPv6-mapped address (`::ffff:a.b.c.d`) as the plain one. */
function plain(address: string): string {
  return address.startsWith("::ffff:") && isIP(address.slice(7)) === 4
    ? address.slice(7)
    : address;
}

function connectionAddress(context: Context): string | undefined {
  try {
    const address = getConnInfo(context).remote.address;
    return address ? plain(address) : undefined;
  } catch {
    return undefined;
  }
}

export function createClientAddress(
  trustedProxy: string,
  options: ClientAddressOptions = {},
): ClientAddress {
  const resolve = options.resolve ?? resolveAll;
  const cacheMs = options.cacheMs ?? 30_000;
  const now = options.now ?? Date.now;
  const literal = isIP(trustedProxy) ? plain(trustedProxy) : undefined;
  let cached: { addresses: Set<string>; until: number } | undefined;

  async function proxyAddresses(): Promise<Set<string>> {
    if (literal) return new Set([literal]);
    if (cached && cached.until > now()) return cached.addresses;
    try {
      const addresses = new Set((await resolve(trustedProxy)).map(plain));
      cached = { addresses, until: now() + cacheMs };
      return addresses;
    } catch (error) {
      // Without an answer of the name service no peer is trusted, so every request through the
      // proxy counts as the proxy's own address; the next request asks again.
      options.onResolveError?.(error);
      return new Set();
    }
  }

  return async (context) => {
    const peer = connectionAddress(context);
    if (!peer) return "unknown";
    const forwarded = context.req.header("x-forwarded-for");
    const last = forwarded?.split(",").pop()?.trim();
    if (last && (await proxyAddresses()).has(peer)) return last.slice(0, 64);
    return peer.slice(0, 64);
  };
}
