/** M3 Redactor (`gam-ai-knowledge/concepts/observability.md` §8 and §16). No side effect, no dependency. */

export const redacted = "[redacted]";

/** Secret key fragments (OBS-F-14): a key that contains one of them, ignoring case, is redacted. */
export const secretKeyFragments: readonly string[] = [
  "password",
  "passwd",
  "secret",
  "token",
  "authorization",
  "cookie",
  "apikey",
  "api_key",
  "api-key",
  "session",
  "credential",
  "totp",
  "otp",
  "backupcodes",
  "recoverycode",
];

/** Secret keys (OBS-F-14): only a key that equals one of them, ignoring case, is redacted. */
export const secretKeys: readonly string[] = ["code", "state"];

function isSecretKey(key: string): boolean {
  const lower = key.toLowerCase();
  return (
    secretKeys.includes(lower) ||
    secretKeyFragments.some((fragment) => lower.includes(fragment))
  );
}

/** Replaces the value of every secret attribute with `[redacted]`; every other pair is unchanged. */
export function redactAttributes(
  attributes: Readonly<Record<string, string>>,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(attributes))
    result[key] = isSecretKey(key) ? redacted : value;
  return result;
}

const email = /[^\s@]+@[^\s@]+\.[^\s@]+/g;
const ipv4 = /(?<!\d)(?<!\d\.)\d{1,3}(?:\.\d{1,3}){3}(?!\d)(?!\.\d)/g;
// Not directly preceded or followed by a letter, digit, underscore, or colon (section 8), so that
// `std::vector` and `Foo::bar` are kept; the colon before an address is part of the boundary.
const colonRun =
  /(?<![0-9A-Za-z_:])[0-9a-fA-F]*(?::[0-9a-fA-F]*)+(?![0-9A-Za-z_:])/g;

function isIpv6(candidate: string): boolean {
  const groups = candidate.split(":");
  if (groups.length < 3 || groups.length > 8) return false;
  const compressed = candidate.includes("::");
  if (!compressed && groups.length !== 8) return false;
  return (
    groups.every((group) => /^[0-9a-fA-F]{0,4}$/.test(group)) &&
    (compressed || groups.every((group) => group.length > 0))
  );
}

/**
 * Replaces an e-mail address, an IPv4 address, and an IPv6 address in a text with `[redacted]`
 * (the patterns of §8 "Redaction patterns"; the collector applies them again, OBS-F-29).
 */
export function redactText(text: string): string {
  return text
    .replace(email, redacted)
    .replace(ipv4, redacted)
    .replace(colonRun, (run) => (isIpv6(run) ? redacted : run));
}
