# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
the commit messages follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
The release merge request generates a draft of the next section with `pnpm run changelog:draft`
(`documentation/WORKFLOW.md`, "Changelog"); pushing the release tag publishes the section as the
GitLab Release.

## [Unreleased]

## [0.1.0] - 2026-11-02

First release, end of Sprint 1: the foundation of the monorepo, the local stack, the shared
contracts, the CI pipeline, and the design system.

### Added

- Monorepo with pnpm workspaces and Turborepo, strict TypeScript, and a quick start
  (SCF-US-1 Set up the monorepo, #38).
- Local development environment: `docker compose up` starts the data services, the reverse proxy,
  and web, also without internet access; the migrations run in a one-shot container before web
  starts (SCF-US-2 Local development environment with Docker Compose, #39).
- Shared contracts: Zod schemas, one common error response, and a generated OpenAPI description
  served at `/api/docs` (SCF-US-3 Shared contracts with Zod and OpenAPI, #40).
- CI pipeline with lint, typecheck, tests, build, accessibility check, secret scan, code scan,
  dependency audit, and container image scan (SCF-US-5 CI pipeline with quality and security
  checks, #42).
- Commit messages checked in a git hook and in CI, and a changelog draft generated from the
  commits (SCF-US-6 Conventional Commits and generated changelog, #44).
- Design system with design tokens, four themes, a theme switcher that remembers the choice, and
  Storybook (DSA-US-1 Design system with design tokens and four themes, #68).
- Relational data model: the Prisma 8 schema, the first migration, and seed data (first slice of
  SCF-US-4, #41).
- Project documentation and the Definition of Done (SCF-US-7, #85); `doc-check` reports every
  acceptance criterion without a test (#138).

### Fixed

- `docker compose up` works on ARM machines: ClamAV runs as linux/amd64 (#148).
- The acceptance tests and Biome also run on Windows and with Node.js 24.
- The commit check of the release merge request accepts the three commits from before the
  workflow.

### Security

- Next.js updated to 16.4.2 against two critical remote code execution flaws and a high-severity
  SSRF.
- Image vulnerabilities without an upstream fix are accepted only with a reason and an expiry in
  `.trivyignore`.
