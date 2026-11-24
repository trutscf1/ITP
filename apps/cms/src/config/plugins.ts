import type { StrapiEnv } from "./server.ts";

// The users-and-permissions plugin signs its tokens with its own secret.
export default ({ env }: { env: StrapiEnv }) => ({
  "users-permissions": { config: { jwtSecret: env("JWT_SECRET") } },
});
