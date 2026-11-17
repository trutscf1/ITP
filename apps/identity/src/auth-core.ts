// M2 AuthCore (gam-ai-knowledge/concepts/identity.md §16): the configuration of the
// authentication library — its tables mapped onto auth_users, auth_accounts, auth_sessions, and
// auth_verifications (scaffolding.md §8), the password hash of IDN-C-2 — and the few operations
// of IDN-US-1 on top of it: accounts, confirmation links, and the removal of unconfirmed
// accounts. Sessions are kept in the session store (sessions.ts), not by the library. The
// `users` row is written only by the database trigger of SCF-F-24 (concept §14); nothing here
// writes it, and `memberId` only reads it.
import { createHash, randomBytes } from "node:crypto";
import { hash, verify } from "@node-rs/argon2";
import { betterAuth } from "better-auth";
import pg from "pg";
import type { Logger } from "./logger.ts";

/** OWASP parameters for Argon2id (STACK.md §3): 19 MiB, 2 iterations, parallelism 1. */
const argon2 = { memoryCost: 19_456, timeCost: 2, parallelism: 1 } as const;

const confirmationPrefix = "confirm:";

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
  /** Creates an unconfirmed account with its credential; the database creates its `users` row. */
  createAccount(input: {
    name: string;
    email: string;
    passwordHash: string;
    now: Date;
  }): Promise<string>;
  /** IDN-F-6: replaces name and hash of an unconfirmed account and invalidates its links. */
  replaceUnconfirmed(
    id: string,
    input: { name: string; passwordHash: string; now: Date },
  ): Promise<void>;
  /** Creates a confirmation link token, valid for `validityHours`; only its hash is stored (IDN-NF-5). */
  issueConfirmationToken(
    id: string,
    now: Date,
    validityHours: number,
  ): Promise<string>;
  /** True while a confirmation link of the account has not expired. */
  hasValidConfirmationLink(id: string, now: Date): Promise<boolean>;
  /** Uses the link once: confirms the address and returns true, or returns false for an invalid link. */
  confirm(token: string, now: Date): Promise<boolean>;
  /** The id of the `users` row of an account (SCF-F-24). */
  memberId(accountId: string): Promise<string | undefined>;
  /** IDN-F-31: deletes the unconfirmed accounts created before `before`; returns how many. */
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

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
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
      minPasswordLength: 12,
      maxPasswordLength: 128,
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

  async function deleteConfirmationLinks(id: string): Promise<void> {
    await adapter.deleteMany({
      model: "verification",
      where: [
        { field: "value", value: id },
        {
          field: "identifier",
          operator: "starts_with",
          value: confirmationPrefix,
        },
      ],
    });
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

    async createAccount({ name, email, passwordHash, now }) {
      const user = await internalAdapter.createUser(
        { name, email, emailVerified: false, createdAt: now, updatedAt: now },
        { method: "email" },
      );
      await internalAdapter.createAccount({
        userId: user.id,
        providerId: "credential",
        accountId: user.id,
        password: passwordHash,
        createdAt: now,
        updatedAt: now,
      });
      return user.id;
    },

    async replaceUnconfirmed(id, { name, passwordHash, now }) {
      await internalAdapter.updateUser(id, { name, updatedAt: now });
      await internalAdapter.updatePassword(id, passwordHash);
      await deleteConfirmationLinks(id);
    },

    async issueConfirmationToken(id, now, validityHours) {
      const token = randomBytes(32).toString("base64url");
      await internalAdapter.createVerificationValue({
        identifier: `${confirmationPrefix}${hashToken(token)}`,
        value: id,
        expiresAt: new Date(now.getTime() + validityHours * 3_600_000),
      });
      return token;
    },

    async hasValidConfirmationLink(id, now) {
      const links = await adapter.count({
        model: "verification",
        where: [
          { field: "value", value: id },
          {
            field: "identifier",
            operator: "starts_with",
            value: confirmationPrefix,
          },
          { field: "expiresAt", operator: "gt", value: now },
        ],
      });
      return links > 0;
    },

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

    async removeUnconfirmed(before) {
      const stale = await adapter.findMany<{ id: string }>({
        model: "user",
        where: [
          { field: "emailVerified", value: false },
          { field: "createdAt", operator: "lt", value: before },
        ],
      });
      for (const { id } of stale) {
        await deleteConfirmationLinks(id);
        // Removes the credentials; the database removes the `users` row with the account.
        await internalAdapter.deleteUser(id);
      }
      return stale.length;
    },

    async checkDatabase() {
      await pool.query("SELECT 1");
    },

    close: () => pool.end(),
  };
}
