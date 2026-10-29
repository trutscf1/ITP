// The connection of the schema commands (pnpm db:migrate, db:seed) outside containers. It is
// built from the PostgreSQL values of .env with the host localhost, so user and password are
// set in one place only (SCF-F-17); a DATABASE_URL from the environment wins, as inside the
// stack, where docker-compose.yml sets it with the host postgres.
type Environment = Record<string, string | undefined>;

export function databaseUrl(env: Environment): string | undefined {
  if (env.DATABASE_URL) return env.DATABASE_URL;
  const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_PORT, POSTGRES_DB } = env;
  if (!POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_PORT || !POSTGRES_DB) {
    return undefined;
  }
  const user = encodeURIComponent(POSTGRES_USER);
  const password = encodeURIComponent(POSTGRES_PASSWORD);
  return `postgresql://${user}:${password}@localhost:${POSTGRES_PORT}/${POSTGRES_DB}`;
}
