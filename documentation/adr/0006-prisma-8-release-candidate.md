---
doc: adr
format: engineering-human/2
title: "Use the newest consistent Prisma 8 release candidate until Prisma 8 is stable"
audience: [product, developer, reviewer, agent]
status: accepted
date: "2026-11-02"
deciders: ["trutscf1"]
overrides: []
supersedes: []
---
# ADR-0006 — Use the newest consistent Prisma 8 release candidate until Prisma 8 is stable

## In plain words

The school asks for Prisma 8 or later, but Prisma 8 has no finished release yet, only pre-releases. The project uses the newest pre-release whose parts fit together and moves to the finished Prisma 8 as soon as it comes out.

## Context

`docs/anforderungen_software_projekte.md` asks for "prisma ORM (JavaScript Client) (`≥ 8`)". On 2026-11-02 npm has no stable `8.0.0`: the tag `latest` of `prisma` is `8.0.0-rc.29`, the one of `@prisma/orm-postgres` is `8.0.0-rc.22`, and Prisma 7 (`7.10.1`) is below the minimum. Under SemVer a release candidate sorts below `8.0.0`, so the review of !27 by `tschudea07` asked to record the choice as a deviation. The owner decided: "8 wird bald der neue standard, also nutze die aktuellste version mit prisma 8.x.x halte das auch als adr fest" ([qa-log.md](../qa-log.md), Q214).

The command-line package `prisma` and the database package `@prisma/orm-postgres` are numbered separately; they fit together when the command line ships the same `@prisma/orm-toolchain` version as the database package. The workspace also installs a version only after it is seven days old (`minimumReleaseAge` in `pnpm-workspace.yaml`).

## Decision

- Use the newest release candidate of Prisma 8 that satisfies both rules: the command line and the database package share one toolchain version, and every package is at least seven days old. On 2026-11-02 that is `prisma` `8.0.0-rc.27` (toolchain `8.0.0-rc.20`, `@prisma/cli-engine` `0.9.0`) with `@prisma/orm-postgres` `8.0.0-rc.20`. The newer `prisma` `8.0.0-rc.28` and `rc.29` and `@prisma/orm-postgres` `rc.21` and `rc.22` were younger than seven days.
- Pin every Prisma package exactly in `packages/db/package.json`; `STACK.md` §3 (SCF-C-19) names the versions.
- Move to the stable `8.0.0` in its own issue as soon as it is published and seven days old.

## Consequences

- A release candidate can change between versions. The move from `rc.13` to `rc.20` changed the format of the emitted contract, the option of the client (`contract` from `contractFromJson`), the notation of SQL expressions in the schema (`` sql`…` ``), and the name of the failure code (`MIGRATION.EXECUTION_FAILED`); the first migration was planned again, because it had not reached `dev` or any shared database.
- Every later move to a newer release candidate follows the same steps: emit the contract, plan the migrations again only while they are not on `dev`, otherwise add a migration, and run the database tests against PostgreSQL 18.
- The deviation is presented at the final presentation together with the other deviations (`WORKFLOW.md`).
