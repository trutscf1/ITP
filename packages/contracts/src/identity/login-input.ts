import { z } from "../zod.ts";
import { emailSchema } from "./email.ts";

/** The body of `POST /login` (IDN-F-7). The password is not checked against the rules of IDN-F-2. */
export const loginInputSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1).max(128),
  })
  .openapi("LoginInput");

export type LoginInput = z.infer<typeof loginInputSchema>;
