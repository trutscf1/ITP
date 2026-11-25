# Container build of the unit `identity` (gam-ai-knowledge/concepts/scaffolding.md SCF-F-1,
# concepts/identity.md): installs the workspace packages `identity` needs, builds them, and starts
# the server, which checks its configuration first (SCF-F-11, SCF-E-1). The build context is the
# repository root (.dockerignore keeps node_modules and dist out).
#
# The Node.js version equals .tool-versions and the CI image; pnpm comes from the packageManager
# field.
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

# `run build` on `@stash/identity...` builds the workspace packages it uses first (the contracts).
RUN pnpm install --frozen-lockfile --filter @stash/identity... \
  && pnpm --filter @stash/identity... run build

ENV NODE_ENV=production
WORKDIR /app/apps/identity
EXPOSE 3001
CMD ["node", "dist/main.js"]
