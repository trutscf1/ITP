import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

// Adds `.openapi(...)` to every Zod schema. Every schema file imports `z` from here, so the
// extension is applied before the first schema is built.
extendZodWithOpenApi(z);

export { z };
