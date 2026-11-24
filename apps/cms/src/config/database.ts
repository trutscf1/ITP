import type { StrapiEnv } from "./server.ts";

// The content store: the own PostgreSQL database of cms (PUB-F-1). The names come from the
// variables DATABASE_* that docker-compose.yml fills from the CMS_DB_* values.
export default ({ env }: { env: StrapiEnv }) => ({
  connection: {
    client: "postgres",
    connection: {
      host: env("DATABASE_HOST", "cms-db"),
      port: env.int("DATABASE_PORT", 5432),
      database: env("DATABASE_NAME"),
      user: env("DATABASE_USERNAME"),
      password: env("DATABASE_PASSWORD"),
    },
  },
});
