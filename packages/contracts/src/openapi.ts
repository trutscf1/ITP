import {
  OpenAPIRegistry,
  OpenApiGeneratorV31,
} from "@asteasolutions/zod-to-openapi";
import { errorResponseSchema } from "./errors.ts";
import { healthReportSchema } from "./health.ts";
import { acceptedSchema } from "./identity/accepted.ts";
import { confirmQuerySchema } from "./identity/confirm-query.ts";
import { loginInputSchema } from "./identity/login-input.ts";
import { identityApiPath } from "./identity/paths.ts";
import { registrationInputSchema } from "./identity/registration-input.ts";
import { sessionInfoSchema } from "./identity/session-info.ts";

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

  const error = (description: string) => ({
    description,
    content: { "application/json": { schema: errorResponseSchema } },
  });

  // The endpoints of `identity` (concepts/identity.md §8), below the prefix /api/identity.
  registry.registerPath({
    method: "post",
    path: identityApiPath("register"),
    summary: "Register by e-mail",
    request: {
      body: {
        content: { "application/json": { schema: registrationInputSchema } },
      },
    },
    responses: {
      202: {
        description:
          "Always, for a valid registration: check the mailbox (IDN-F-6)",
        content: { "application/json": { schema: acceptedSchema } },
      },
      400: error("Invalid input or failed bot check"),
      403: error("The registration is closed"),
      429: error("Too many requests from this address"),
    },
  });

  registry.registerPath({
    method: "get",
    path: identityApiPath("confirm"),
    summary: "Open the confirmation link of an e-mail",
    request: { query: confirmQuerySchema },
    responses: {
      303: {
        description:
          "To /login?confirmed=1, or to /link-invalid?kind=confirm for an invalid link",
      },
    },
  });

  registry.registerPath({
    method: "post",
    path: identityApiPath("login"),
    summary: "Log in with e-mail address and password",
    request: {
      body: { content: { "application/json": { schema: loginInputSchema } } },
    },
    responses: {
      200: {
        description: "The member; the session cookie is set",
        content: { "application/json": { schema: sessionInfoSchema } },
      },
      400: error("Invalid input"),
      401: error("Wrong e-mail address or password"),
      403: error("The e-mail address is not confirmed"),
    },
  });

  return new OpenApiGeneratorV31(registry.definitions).generateDocument({
    openapi: "3.1.0",
    info: { title: "Stash API", version },
  });
}
