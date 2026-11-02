import { loadWebConfigValue } from "@stash/contracts/web";
import { connection } from "next/server.js";
import { serveApiDocs } from "../../../api-docs/api-docs.ts";
import { errorResponse } from "../../../errors.ts";

// GET /api/docs (M6). connection() marks the request dynamic, so `next build` never reads the
// file; the path comes from OPENAPI_FILE on every request (A3). Only that variable is checked,
// so an invalid other one cannot break this route (SCF-F-10). HEAD is answered from GET.
export async function GET(_request: Request): Promise<Response> {
  await connection();
  const file = loadWebConfigValue(process.env, "OPENAPI_FILE");
  if (!file.ok) {
    console.error("GET /api/docs: invalid configuration", file.problem.name);
    return errorResponse("internal-error");
  }
  return serveApiDocs(file.value);
}

function methodNotAllowed(_request: Request): Response {
  return errorResponse("method-not-allowed", { allow: "GET, HEAD" });
}

export {
  methodNotAllowed as DELETE,
  methodNotAllowed as OPTIONS,
  methodNotAllowed as PATCH,
  methodNotAllowed as POST,
  methodNotAllowed as PUT,
};
