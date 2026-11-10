import { ZodError } from "zod";
import { z } from "./zod.ts";

/** The stable codes of an error response (`gam-ai-knowledge/concepts/scaffolding.md` §8). */
export const errorCodes = [
  "validation-failed",
  "not-found",
  "method-not-allowed",
  "internal-error",
] as const;

export type ErrorCode = (typeof errorCodes)[number];

/** The one error format of every HTTP endpoint (SCF-F-21): a stable code and a fixed sentence. */
export const errorResponseSchema = z
  .object({
    code: z.enum(errorCodes).openapi({ example: "validation-failed" }),
    message: z
      .string()
      .min(1)
      .openapi({ example: "The request body is not valid." }),
  })
  .openapi("ErrorResponse");

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

/** An HTTP status together with the body that goes with it. */
export interface ErrorReply {
  status: 400 | 404 | 405 | 500;
  body: ErrorResponse;
}

/**
 * The HTTP status and the fixed message of every code (§8, §10 example 6). The message never
 * comes from the failure itself, so no stack trace, SQL, host, port, or input value reaches
 * the caller (SCF-NF-4).
 */
export const errorReplies: Readonly<Record<ErrorCode, ErrorReply>> = {
  "validation-failed": {
    status: 400,
    body: {
      code: "validation-failed",
      message: "The request body is not valid.",
    },
  },
  "not-found": {
    status: 404,
    body: {
      code: "not-found",
      message: "The requested resource does not exist.",
    },
  },
  "method-not-allowed": {
    status: 405,
    body: {
      code: "method-not-allowed",
      message: "The method is not allowed for this path.",
    },
  },
  "internal-error": {
    status: 500,
    body: {
      code: "internal-error",
      message: "The request could not be processed.",
    },
  },
};

/**
 * Turns anything a handler caught into the common error format: a failed schema validation
 * becomes 400 `validation-failed`, every other failure 500 `internal-error`. The cause is the
 * caller's to log; it is never part of the reply (SCF-NF-4).
 */
export function toErrorResponse(error: unknown): ErrorReply {
  return error instanceof ZodError
    ? errorReplies["validation-failed"]
    : errorReplies["internal-error"];
}
