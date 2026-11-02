import { errorResponse } from "../../../errors.ts";

// Every path under /api without its own route (M6): the common not-found error (SCF-F-21).
// HTML pages keep the normal not-found page (Q59).
function notFound(_request: Request): Response {
  return errorResponse("not-found");
}

export {
  notFound as DELETE,
  notFound as GET,
  notFound as HEAD,
  notFound as OPTIONS,
  notFound as PATCH,
  notFound as POST,
  notFound as PUT,
};
