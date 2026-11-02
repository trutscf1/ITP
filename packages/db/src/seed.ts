// Seed command (SCF-F-25): fills a migrated local database with one user, one team with that
// user as owner, the team's root folder, and one folder inside it. Running it again changes
// nothing. Usage: pnpm db:seed (DATABASE_URL from the environment, or built from the PostgreSQL values of the root .env).
import "./env.ts";
import pg from "pg";
import { seedData } from "./seed-data.ts";

export async function seed(connectionString: string): Promise<void> {
  const client = new pg.Client({ connectionString });
  await client.connect();
  const { authUser, team, rootFolder, folder } = seedData;
  try {
    await client.query("BEGIN");
    // The users row follows from the trigger of the first migration (SCF-F-24).
    await client.query(
      `INSERT INTO auth_users (id, name, email, email_verified)
       VALUES ($1, $2, $3, true) ON CONFLICT (id) DO NOTHING`,
      [authUser.id, authUser.name, authUser.email],
    );
    await client.query(
      "INSERT INTO teams (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING",
      [team.id, team.name],
    );
    await client.query(
      `INSERT INTO team_members (team_id, user_id, role)
       SELECT $1, id, 'owner' FROM users WHERE auth_user_id = $2
       ON CONFLICT (team_id, user_id) DO NOTHING`,
      [team.id, authUser.id],
    );
    await client.query(
      `INSERT INTO folders (id, team_id, parent_id, name) VALUES ($1, $2, NULL, $3)
       ON CONFLICT (id) DO NOTHING`,
      [rootFolder.id, team.id, rootFolder.name],
    );
    await client.query(
      `INSERT INTO folders (id, team_id, parent_id, name) VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO NOTHING`,
      [folder.id, team.id, rootFolder.id, folder.name],
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

if (import.meta.main) {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error(
      "DATABASE_URL: missing — set the POSTGRES_ values in .env, or DATABASE_URL in the environment",
    );
    process.exit(1);
  }
  await seed(url);
  console.log("Seed data present: 1 user, 1 team, 2 folders");
}
