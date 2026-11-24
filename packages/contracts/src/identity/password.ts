import { z } from "../zod.ts";
import {
  maxPasswordLength,
  minPasswordLength,
  type PasswordProblem,
  passwordProblems,
} from "./rules.ts";

const reasons: Record<PasswordProblem, string> = {
  "too-short": `at least ${minPasswordLength} characters`,
  "too-long": `at most ${maxPasswordLength} characters`,
  common: "not one of the 10,000 most common passwords",
};

/** A new password (IDN-F-2): 12 to 128 characters, not on the common-password list. */
export const passwordSchema = z
  .string()
  .superRefine((value, context) => {
    for (const problem of passwordProblems(value)) {
      context.addIssue({ code: "custom", message: reasons[problem] });
    }
  })
  .openapi("Password", { example: "Drei-blaue-Wolken-7" });

export type Password = z.infer<typeof passwordSchema>;
