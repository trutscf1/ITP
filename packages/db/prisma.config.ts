import "./src/env.ts";
import { definePrismaConfig } from "@prisma/cli-engine";
import { defineConfig as ormConfig } from "@prisma/orm-postgres/config";

// Prisma 8 configuration of the relational schema (SCF-F-23): the contract source, the
// connection, and — by default — the migrations in ./migrations/app.
export default definePrismaConfig({
  orm: ormConfig({
    contract: "./src/prisma/contract.prisma",
    db: {
      connection: process.env.DATABASE_URL ?? "",
    },
  }),
});
