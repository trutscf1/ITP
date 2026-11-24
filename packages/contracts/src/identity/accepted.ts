import { z } from "../zod.ts";

/** The answer to a valid registration or reset request, whatever the address (IDN-F-6). */
export const acceptedSchema = z
  .object({ status: z.literal("check-mailbox") })
  .openapi("Accepted");

export type Accepted = z.infer<typeof acceptedSchema>;
