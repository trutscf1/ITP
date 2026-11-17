import { ZodError } from "zod";
import { z } from "./zod.ts";

/** The stable codes of an error response (`gam-ai-knowledge/concepts/scaffolding.md` §8). */
export const errorCodes = [
  "validation-failed",
  "not-found",
  "method-not-allowed",
  "internal-error",
  "bot-check-failed",
  "too-many-requests",
  "invalid-credentials",
  "address-not-confirmed",
  "registration-closed",
  "link-invalid",
  "no-session",
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
  status: 400 | 401 | 403 | 404 | 405 | 429 | 500;
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
  // The codes of `identity` (concepts/identity.md §8), added to the table of scaffolding.md §8.
  "bot-check-failed": {
    status: 400,
    body: { code: "bot-check-failed", message: "The bot check failed." },
  },
  "too-many-requests": {
    status: 429,
    body: {
      code: "too-many-requests",
      message: "Too many requests. Try again later.",
    },
  },
  "invalid-credentials": {
    status: 401,
    body: {
      code: "invalid-credentials",
      message: "E-mail address or password is wrong.",
    },
  },
  "address-not-confirmed": {
    status: 403,
    body: {
      code: "address-not-confirmed",
      message: "Please confirm your e-mail address first.",
    },
  },
  "registration-closed": {
    status: 403,
    body: { code: "registration-closed", message: "Registration is closed." },
  },
  "link-invalid": {
    status: 400,
    body: {
      code: "link-invalid",
      message: "This link is invalid or has expired.",
    },
  },
  "no-session": {
    status: 401,
    body: { code: "no-session", message: "No valid session." },
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
