import { type ErrorCode, errorReplies } from "@stash/contracts";

/**
 * The common error response of every HTTP endpoint of `web` (SCF-F-21): the fixed status and
 * body of the code, never details of the failure (SCF-NF-4).
 */
export function errorResponse(
  code: ErrorCode,
  headers: Readonly<Record<string, string>> = {},
): Response {
  const { status, body } = errorReplies[code];
  return Response.json(body, { status, headers });
}
