import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
} from "@asteasolutions/zod-to-openapi";
import { errorResponseSchema } from "./errors.ts";
import { healthReportSchema } from "./health.ts";

/** The generated OpenAPI 3.1 description. */
export type OpenApiDocument = ReturnType<
  OpenApiGeneratorV31["generateDocument"]
>;

/** Builds the OpenAPI 3.1 description of every registered HTTP contract (SCF-F-10). */
export function generateOpenApiDocument(
  version = "0.0.0-dev",
): OpenApiDocument {
  const registry = new OpenAPIRegistry();

  registry.registerPath({
    method: "get",
    path: "/health",
    summary: "Health of one unit",
    responses: {
      200: {
        description: "The unit and its dependencies",
        content: { "application/json": { schema: healthReportSchema } },
      },
      500: {
        description: "The check failed",
        content: { "application/json": { schema: errorResponseSchema } },
      },
    },
  });

  return new OpenApiGeneratorV31(registry.definitions).generateDocument({
    openapi: "3.1.0",
    info: { title: "Stash API", version },
  });
}
