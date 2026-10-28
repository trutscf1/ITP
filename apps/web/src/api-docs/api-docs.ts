import { readFile } from "node:fs/promises";

/**
 * The answer of `GET /api/docs` (M6): the API description the generation command of the
 * contracts wrote, unchanged and read per request (SCF-F-10).
 */
export async function serveApiDocs(file: string): Promise<Response> {
  const bytes = await readFile(file);
  return new Response(bytes, {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
