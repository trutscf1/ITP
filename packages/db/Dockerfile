# One-shot container of the local stack that applies the pending migrations of the relational
# schema and exits (documentation/concepts/scaffolding.md, SCF-F-26, SCF-E-7). It lists the
# migrations it will run, applies them in one transaction, and exits non-zero if one fails;
# docker-compose.yml starts every unit that uses the database only after it succeeded.
#
# The Node.js version equals .tool-versions and the CI image; pnpm comes from the packageManager
# field. The build context is the repository root (.dockerignore keeps node_modules out).
FROM node:24.14.0-alpine

# The image carries no known high or critical vulnerability that has a fix (SCF-AC-2.5,
# SCF-NF-6): the Alpine packages are upgraded to their fixed versions, and the npm bundled with
# Node.js is removed, since the container runs pnpm through corepack and never npm. The upgrade
# makes the contents depend on the build date; the container scan rebuilds and checks the image
# on every pipeline run.
RUN apk upgrade --no-cache \
  && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx \
  && corepack enable
USER node
WORKDIR /app

COPY --chown=node:node . .

RUN pnpm install --frozen-lockfile --filter @stash/db...

ENV CI=1 PRISMA_DISABLE_TELEMETRY=1
WORKDIR /app/packages/db
CMD ["pnpm", "run", "migrate"]
