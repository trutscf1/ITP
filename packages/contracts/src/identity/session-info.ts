import { z } from "../zod.ts";
import { emailSchema } from "./email.ts";

/** The member behind a session: the answer of the login and of the session check (IDN-F-7). */
export const sessionInfoSchema = z
  .object({
    userId: z.uuid(),
    name: z.string().min(1).max(100),
    email: emailSchema,
  })
  .openapi("SessionInfo");

export type SessionInfo = z.infer<typeof sessionInfoSchema>;
