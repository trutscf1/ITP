import type { StrapiEnv } from "./server.ts";

// Secrets of Strapi come from the environment, never from the repository. The admin panel is
// built and served with PUB-US-1 slice 2 (editor roles); slice 1 runs the content store only.
export default ({ env }: { env: StrapiEnv }) => ({
  auth: { secret: env("ADMIN_JWT_SECRET") },
  apiToken: { salt: env("API_TOKEN_SALT") },
  transfer: { token: { salt: env("TRANSFER_TOKEN_SALT") } },
  secrets: { encryptionKey: env("ENCRYPTION_KEY") },
  serveAdminPanel: false,
});
