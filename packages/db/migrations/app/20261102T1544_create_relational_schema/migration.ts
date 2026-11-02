#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/d53d54568adb82119e7091260de3c25ea0dcc6de2123ef822f99d0e9922600ad/contract';
import endContract from '../../snapshots/d53d54568adb82119e7091260de3c25ea0dcc6de2123ef822f99d0e9922600ad/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
  rawSql,
  sql,
} from '@prisma/orm-postgres/migration';

// SCF-F-24: every row of auth_users gets exactly one row in users, whichever way the
// authentication library creates the user. Added by hand to the planned package; the contract
// cannot declare triggers.
const usersTrigger = rawSql({
  id: 'trigger.auth_users_create_user',
  label: 'Create the users row for every new auth user',
  summary: 'Creates function create_user_for_auth_user and trigger auth_users_create_user',
  operationClass: 'additive',
  target: {
    id: 'postgres',
    details: { schema: 'public', objectType: 'table', name: 'auth_users' },
  },
  precheck: [
    {
      description: 'ensure trigger "auth_users_create_user" does not exist',
      sql: "SELECT NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'auth_users_create_user') AS \"result\"",
      params: [],
    },
  ],
  execute: [
    {
      description: 'create function "create_user_for_auth_user"',
      sql: 'CREATE FUNCTION "public"."create_user_for_auth_user"() RETURNS trigger LANGUAGE plpgsql AS $$\nBEGIN\n  INSERT INTO "public"."users" ("auth_user_id") VALUES (NEW."id");\n  RETURN NEW;\nEND;\n$$',
      params: [],
    },
    {
      description: 'create trigger "auth_users_create_user"',
      sql: 'CREATE TRIGGER "auth_users_create_user" AFTER INSERT ON "public"."auth_users" FOR EACH ROW EXECUTE FUNCTION "public"."create_user_for_auth_user"()',
      params: [],
    },
  ],
  postcheck: [
    {
      description: 'verify trigger "auth_users_create_user" exists',
      sql: "SELECT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'auth_users_create_user') AS \"result\"",
      params: [],
    },
  ],
});

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'auth_accounts',
        columns: [
          col('access_token', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('access_token_expires_at', 'timestamptz', {
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('account_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id_token', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('password', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('provider_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('refresh_token', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('refresh_token_expires_at', 'timestamptz', {
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('scope', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('user_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'auth_sessions',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('expires_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('ip_address', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('token', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('user_agent', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('user_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'auth_users',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('email_verified', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('image', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'auth_verifications',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('expires_at', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('identifier', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('value', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'folder_permissions',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('folder_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('id', 'uuid', {
            notNull: true,
            default: fn(sql`gen_random_uuid()`),
            codecRef: { codecId: 'pg/uuid@1' },
          }),
          col('level', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('role', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('user_id', 'uuid', { codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'folder_permissions_level_check_12e36959',
            sql`"level" IN ('read', 'write', 'manage')`,
          ),
          checkExpression(
            'folder_permissions_member_or_role_b68863bf',
            sql`(user_id IS NULL) <> (role IS NULL)`,
          ),
          checkExpression(
            'folder_permissions_role_check_c3e07ca3',
            sql`"role" IN ('owner', 'admin', 'editor', 'viewer')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'folders',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'uuid', {
            notNull: true,
            default: fn(sql`gen_random_uuid()`),
            codecRef: { codecId: 'pg/uuid@1' },
          }),
          col('inherits_permissions', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('parent_id', 'uuid', { codecRef: { codecId: 'pg/uuid@1' } }),
          col('team_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('updated_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'team_members',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('role', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('team_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('user_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [
          primaryKey(['team_id', 'user_id']),
          checkExpression(
            'team_members_role_check_c3e07ca3',
            sql`"role" IN ('owner', 'admin', 'editor', 'viewer')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'teams',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'uuid', {
            notNull: true,
            default: fn(sql`gen_random_uuid()`),
            codecRef: { codecId: 'pg/uuid@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'users',
        columns: [
          col('auth_user_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn(sql`now()`),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'uuid', {
            notNull: true,
            default: fn(sql`gen_random_uuid()`),
            codecRef: { codecId: 'pg/uuid@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'auth_sessions',
        constraint: 'auth_sessions_token_key',
        columns: ['token'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'auth_users',
        constraint: 'auth_users_email_key',
        columns: ['email'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'folder_permissions',
        constraint: 'folder_permissions_folder_id_user_id_key',
        columns: ['folder_id', 'user_id'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'folder_permissions',
        constraint: 'folder_permissions_folder_id_role_key',
        columns: ['folder_id', 'role'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'folders',
        constraint: 'folders_parent_id_name_key',
        columns: ['parent_id', 'name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'users',
        constraint: 'users_auth_user_id_key',
        columns: ['auth_user_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'auth_accounts',
        index: 'auth_accounts_user_id_idx_6c952402',
        columns: ['user_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'auth_sessions',
        index: 'auth_sessions_user_id_idx_6c952402',
        columns: ['user_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'auth_verifications',
        index: 'auth_verifications_identifier_idx_79a0dbb3',
        columns: ['identifier'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'folder_permissions',
        index: 'folder_permissions_folder_id_idx_61252c35',
        columns: ['folder_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'folder_permissions',
        index: 'folder_permissions_user_id_idx_6c952402',
        columns: ['user_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'folders',
        index: 'folders_one_root_per_team_4ec77325',
        columns: ['team_id'],
        extras: { where: sql`parent_id IS NULL`, unique: true },
      }),
      this.createIndex({
        schema: 'public',
        table: 'folders',
        index: 'folders_parent_id_idx_ab33b399',
        columns: ['parent_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'folders',
        index: 'folders_team_id_idx_d177da93',
        columns: ['team_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'team_members',
        index: 'team_members_team_id_idx_d177da93',
        columns: ['team_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'team_members',
        index: 'team_members_user_id_idx_6c952402',
        columns: ['user_id'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'auth_accounts',
        foreignKey: {
          name: 'auth_accounts_user_id_fkey',
          columns: ['user_id'],
          references: { schema: 'public', table: 'auth_users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'auth_sessions',
        foreignKey: {
          name: 'auth_sessions_user_id_fkey',
          columns: ['user_id'],
          references: { schema: 'public', table: 'auth_users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'folder_permissions',
        foreignKey: {
          name: 'folder_permissions_folder_id_fkey',
          columns: ['folder_id'],
          references: { schema: 'public', table: 'folders', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'folder_permissions',
        foreignKey: {
          name: 'folder_permissions_user_id_fkey',
          columns: ['user_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'folders',
        foreignKey: {
          name: 'folders_team_id_fkey',
          columns: ['team_id'],
          references: { schema: 'public', table: 'teams', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'folders',
        foreignKey: {
          name: 'folders_parent_id_fkey',
          columns: ['parent_id'],
          references: { schema: 'public', table: 'folders', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'team_members',
        foreignKey: {
          name: 'team_members_team_id_fkey',
          columns: ['team_id'],
          references: { schema: 'public', table: 'teams', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'team_members',
        foreignKey: {
          name: 'team_members_user_id_fkey',
          columns: ['user_id'],
          references: { schema: 'public', table: 'users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'users',
        foreignKey: {
          name: 'users_auth_user_id_fkey',
          columns: ['auth_user_id'],
          references: { schema: 'public', table: 'auth_users', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      usersTrigger,
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
