import { z } from "../zod.ts";

/** The query of `GET /confirm`: the token of the confirmation link (IDN-F-4). */
export const confirmQuerySchema = z
  .object({ token: z.string().min(1).max(200) })
  .openapi("ConfirmQuery");

export type ConfirmQuery = z.infer<typeof confirmQuerySchema>;
