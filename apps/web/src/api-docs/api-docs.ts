import { readFile } from "node:fs/promises";
import { errorResponse } from "../errors.ts";

/**
 * The answer of `GET /api/docs` (M6): the API description the generation command of the
 * contracts wrote, unchanged and read per request (SCF-F-10). If it cannot be read, the cause
 * goes to the log and the caller gets `internal-error` without the path (SCF-NF-4).
 */
export async function serveApiDocs(file: string): Promise<Response> {
  try {
    const bytes = await readFile(file);
    return new Response(bytes, {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error("GET /api/docs: the API description cannot be read", error);
    return errorResponse("internal-error");
  }
}
