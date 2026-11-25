import { z } from "../zod.ts";
import { emailSchema } from "./email.ts";
import { passwordSchema } from "./password.ts";

/** The body of `POST /register` (IDN-F-1), checked by `web` before sending and by `identity`. */
export const registrationInputSchema = z
  .object({
    name: z.string().trim().min(1).max(100).openapi({ example: "Ada" }),
    email: emailSchema,
    password: passwordSchema,
    botToken: z.string().min(1).optional(),
  })
  .openapi("RegistrationInput");

export type RegistrationInput = z.infer<typeof registrationInputSchema>;
