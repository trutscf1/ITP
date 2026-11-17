// M2 AuthCore (gam-ai-knowledge/concepts/identity.md §16): the configuration of the
// authentication library — its tables mapped onto auth_users, auth_accounts, auth_sessions, and
// auth_verifications (scaffolding.md §8), the password hash of IDN-C-2 — and the few operations
// of IDN-US-1 on top of it: accounts, confirmation links, and the removal of unconfirmed
// accounts. Sessions are kept in the session store (sessions.ts), not by the library. The
// `users` row is written only by the database trigger of SCF-F-24 (concept §14); nothing here
// writes it, and `memberId` only reads it.
import { randomBytes } from "node:crypto";
import { hash, verify } from "@node-rs/argon2";
import { maxPasswordLength, minPasswordLength } from "@stash/contracts";
import { betterAuth, type Where } from "better-auth";
import pg from "pg";
import type { Logger } from "./logger.ts";
import { hashToken } from "./token-hash.ts";

/** OWASP parameters for Argon2id (STACK.md §3): 19 MiB, 2 iterations, parallelism 1. */
const argon2 = { memoryCost: 19_456, timeCost: 2, parallelism: 1 } as const;

const confirmationPrefix = "confirm:";

/** The open confirmation links of one account (concept §8, "Confirmation tokens"). */
function confirmationLinksOf(id: string): Where[] {
  return [
    { field: "value", value: id },
    { field: "identifier", operator: "starts_with", value: confirmationPrefix },
  ];
}

export interface Account {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  /** The hash of the credential account, if the account has one. */
  passwordHash: string | undefined;
}

export interface AuthCore {
  hashPassword(password: string): Promise<string>;
  /** True when the password matches the hash; false for a malformed hash. */
  verifyPassword(passwordHash: string, password: string): Promise<boolean>;
  /** Spends the time of a verification on a dummy hash, for an address without an account (IDN-F-11). */
  verifyDummy(password: string): Promise<void>;
  findAccount(email: string): Promise<Account | undefined>;
  /**
   * Creates an unconfirmed account with its credential and its confirmation link, in one
   * transaction (IDN-F-4); the database creates its `users` row. Returns the id and the token.
   */
  createAccount(input: {
    name: string;
    email: string;
    passwordHash: string;
    now: Date;
    validityHours: number;
  }): Promise<{ id: string; token: string }>;
  /**
   * IDN-F-6, IDN-F-31: replaces name and hash of an unconfirmed account, restarts its clean-up
   * period, and replaces its links by a new one, in one transaction. Returns the new token.
   */
  replaceUnconfirmed(
    id: string,
    input: {
      name: string;
      passwordHash: string;
      now: Date;
      validityHours: number;
    },
  ): Promise<string>;
  /**
   * IDN-E-5: replaces the confirmation links of the account by a new one, valid for
   * `validityHours`; only its hash is stored (IDN-NF-5). Returns the token.
   */
  replaceConfirmationLink(
    id: string,
    now: Date,
    validityHours: number,
  ): Promise<string>;
  /** Uses the link once: confirms the address and returns true, or returns false for an invalid link. */
  confirm(token: string, now: Date): Promise<boolean>;
  /** The id of the `users` row of an account (SCF-F-24). */
  memberId(accountId: string): Promise<string | undefined>;
  /**
   * IDN-F-31: deletes the accounts still unconfirmed whose registration (`created_at`, set again
   * by every new registration of the address) is older than `before`; returns how many.
   */
  removeUnconfirmed(before: Date): Promise<number>;
  /** An essential dependency check (SCF-F-7): rejects when the database does not answer. */
  checkDatabase(): Promise<void>;
  close(): Promise<void>;
}

export interface AuthCoreOptions {
  databaseUrl: string;
  secret: string;
  publicOrigin: string;
  logger: Logger;
}

export async function createAuthCore(
  options: AuthCoreOptions,
): Promise<AuthCore> {
  const pool = new pg.Pool({ connectionString: options.databaseUrl, max: 10 });
  // An idle connection that breaks is not a failure of a request; the pool replaces it.
  pool.on("error", (error) => {
    options.logger.warn("database connection lost", { error });
  });

  const auth = betterAuth({
    baseURL: options.publicOrigin,
    secret: options.secret,
    database: pool,
    telemetry: { enabled: false },
    // The library's own messages carry no arguments here: they could hold values (IDN-NF-4).
    logger: {
      level: "warn",
      log: (level, message) => {
        if (level === "error" || level === "warn") {
          options.logger[level]("authentication library", { message });
        }
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength,
      maxPasswordLength,
      password: {
        hash: (password) => hash(password, argon2),
        verify: async ({ hash: stored, password }) => {
          try {
            return await verify(stored, password);
          } catch {
            return false;
          }
        },
      },
    },
    user: {
      modelName: "auth_users",
      fields: {
        emailVerified: "email_verified",
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
    },
    account: {
      modelName: "auth_accounts",
      fields: {
        userId: "user_id",
        accountId: "account_id",
        providerId: "provider_id",
        accessToken: "access_token",
        refreshToken: "refresh_token",
        idToken: "id_token",
        accessTokenExpiresAt: "access_token_expires_at",
        refreshTokenExpiresAt: "refresh_token_expires_at",
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
    },
    session: {
      modelName: "auth_sessions",
      fields: {
        userId: "user_id",
        expiresAt: "expires_at",
        ipAddress: "ip_address",
        userAgent: "user_agent",
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
    },
    verification: {
      modelName: "auth_verifications",
      fields: {
        expiresAt: "expires_at",
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
    },
  });
  const context = await auth.$context;
  const { internalAdapter, adapter } = context;

  const dummyHash = await hash(randomBytes(16).toString("hex"), argon2);

  /** Stores a new confirmation link of the account through `db`; returns its token. */
  async function insertConfirmationLink(
    db: Pick<typeof adapter, "create">,
    id: string,
    now: Date,
    validityHours: number,
  ): Promise<string> {
    const token = randomBytes(32).toString("base64url");
    await db.create({
      model: "verification",
      data: {
        identifier: `${confirmationPrefix}${hashToken(token)}`,
        value: id,
        expiresAt: new Date(now.getTime() + validityHours * 3_600_000),
        createdAt: now,
        updatedAt: now,
      },
    });
    return token;
  }

  return {
    hashPassword: (password) => context.password.hash(password),
    verifyPassword: (passwordHash, password) =>
      context.password.verify({ hash: passwordHash, password }),
    async verifyDummy(password) {
      await context.password.verify({ hash: dummyHash, password });
    },

    async findAccount(email) {
      const found = await internalAdapter.findUserByEmail(email, {
        includeAccounts: true,
      });
      if (!found) return undefined;
      const credential = found.accounts.find(
        (account) => account.providerId === "credential",
      );
      return {
        id: found.user.id,
        name: found.user.name,
        email: found.user.email,
        emailVerified: found.user.emailVerified,
        passwordHash: credential?.password ?? undefined,
      };
    },

    createAccount: ({ name, email, passwordHash, now, validityHours }) =>
      adapter.transaction(async (db) => {
        const user = await db.create<Record<string, unknown>, { id: string }>({
          model: "user",
          data: {
            name,
            email,
            emailVerified: false,
            createdAt: now,
            updatedAt: now,
          },
        });
        await db.create({
          model: "account",
          data: {
            userId: user.id,
            providerId: "credential",
            accountId: user.id,
            password: passwordHash,
            createdAt: now,
            updatedAt: now,
          },
        });
        const token = await insertConfirmationLink(
          db,
          user.id,
          now,
          validityHours,
        );
        return { id: user.id, token };
      }),

    replaceUnconfirmed: (id, { name, passwordHash, now, validityHours }) =>
      adapter.transaction(async (db) => {
        // Only while the account is still unconfirmed; `createdAt` restarts the clean-up
        // period of IDN-F-31 (Q346).
        await db.update({
          model: "user",
          where: [
            { field: "id", value: id },
            { field: "emailVerified", value: false },
          ],
          update: { name, createdAt: now, updatedAt: now },
        });
        await db.updateMany({
          model: "account",
          where: [
            { field: "userId", value: id },
            { field: "providerId", value: "credential" },
          ],
          update: { password: passwordHash, updatedAt: now },
        });
        await db.deleteMany({
          model: "verification",
          where: confirmationLinksOf(id),
        });
        return insertConfirmationLink(db, id, now, validityHours);
      }),

    replaceConfirmationLink: (id, now, validityHours) =>
      adapter.transaction(async (db) => {
        await db.deleteMany({
          model: "verification",
          where: confirmationLinksOf(id),
        });
        return insertConfirmationLink(db, id, now, validityHours);
      }),

    async confirm(token, now) {
      const link = await internalAdapter.consumeVerificationValue(
        `${confirmationPrefix}${hashToken(token)}`,
      );
      if (!link || link.expiresAt.getTime() <= now.getTime()) return false;
      const user = await internalAdapter.findUserById(link.value);
      if (!user) return false;
      if (!user.emailVerified) {
        await internalAdapter.updateUser(user.id, {
          emailVerified: true,
          updatedAt: now,
        });
      }
      return true;
    },

    async memberId(accountId) {
      const rows = await pool.query<{ id: string }>(
        "SELECT id FROM users WHERE auth_user_id = $1",
        [accountId],
      );
      return rows.rows[0]?.id;
    },

    removeUnconfirmed: (before) =>
      adapter.transaction(async (db) => {
        const stale: Where[] = [
          { field: "emailVerified", value: false },
          { field: "createdAt", operator: "lt", value: before },
        ];
        const candidates = (
          await db.findMany<{ id: string }>({ model: "user", where: stale })
        ).map(({ id }) => id);
        if (candidates.length === 0) return 0;
        // One conditional delete: an account confirmed or registered again since the read
        // above no longer matches and stays. Credentials and `users` row go with the account
        // (foreign keys with ON DELETE CASCADE).
        const removed = await db.deleteMany({
          model: "user",
          where: [{ field: "id", operator: "in", value: candidates }, ...stale],
        });
        const kept = new Set(
          (
            await db.findMany<{ id: string }>({
              model: "user",
              where: [{ field: "id", operator: "in", value: candidates }],
            })
          ).map(({ id }) => id),
        );
        const gone = candidates.filter((id) => !kept.has(id));
        if (gone.length > 0) {
          await db.deleteMany({
            model: "verification",
            where: [
              { field: "value", operator: "in", value: gone },
              {
                field: "identifier",
                operator: "starts_with",
                value: confirmationPrefix,
              },
            ],
          });
        }
        return removed;
      }),

    async checkDatabase() {
      await pool.query("SELECT 1");
    },

    close: () => pool.end(),
  };
}
