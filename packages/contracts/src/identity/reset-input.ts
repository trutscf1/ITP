import { z } from "../zod.ts";
import { emailSchema } from "./email.ts";
import { passwordSchema } from "./password.ts";

/** The body of `POST /password-reset/request` (IDN-F-25, IDN-F-28). */
export const resetRequestInputSchema = z
  .object({
    email: emailSchema,
    botToken: z.string().min(1).optional(),
  })
  .openapi("ResetRequestInput");

export type ResetRequestInput = z.infer<typeof resetRequestInputSchema>;

/** The body of `POST /password-reset`: the token of the reset link and the new password (IDN-F-26). */
export const newPasswordInputSchema = z
  .object({
    token: z.string().min(1).max(200),
    password: passwordSchema,
  })
  .openapi("NewPasswordInput");

export type NewPasswordInput = z.infer<typeof newPasswordInputSchema>;
