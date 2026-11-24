# Container build of the `cms` unit (PUB-AC-1.1): Strapi with the content types of this unit.
# The build context is the repository root (.dockerignore keeps node_modules out). The Node.js
# version equals .tool-versions and the CI image; pnpm comes from the packageManager field.
FROM node:24.14.0-alpine

# The Alpine packages are upgraded to their fixed versions and the npm bundled with Node.js is
# removed (SCF-AC-2.5, SCF-NF-6), as in packages/db/Dockerfile: the image runs pnpm through
# corepack and never npm.
RUN apk upgrade --no-cache \
  && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx \
  && corepack enable
USER node
WORKDIR /app

COPY --chown=node:node . .

# `run build` on `@stash/cms...` builds the workspace packages of cms first, then the unit. The
# development dependencies are needed only to build; the installed folders are deleted afterwards
# and the production dependencies are installed again (as in docker/web.Dockerfile).
RUN pnpm install --frozen-lockfile --filter @stash/cms... \
 && pnpm --filter @stash/cms... run build \
 && rm -rf node_modules apps/*/node_modules packages/*/node_modules tests/node_modules \
 && CI=1 pnpm install --frozen-lockfile --prod --prefer-offline --filter @stash/cms...

ENV NODE_ENV=production STRAPI_TELEMETRY_DISABLED=true
EXPOSE 1337
WORKDIR /app/apps/cms
CMD ["pnpm", "run", "start"]
