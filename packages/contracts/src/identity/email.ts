import { z } from "../zod.ts";
import { emailPattern, maxEmailLength } from "./email-pattern.ts";

/**
 * An e-mail address (concept §8): 3 to 254 characters after trimming, lower case, one `@` with
 * at least one character before it and a dot with characters on both sides in the part after it.
 */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3)
  .max(maxEmailLength)
  .regex(emailPattern, "not an e-mail address")
  .openapi("Email", { example: "ada@example.org" });

export type Email = z.infer<typeof emailSchema>;
