// The one hash of every token `identity` stores (IDN-NF-2, IDN-NF-5): SHA-256 as 64 hex
// characters. Confirmation links and sessions keep only this value, never the token.
import { createHash } from "node:crypto";

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
