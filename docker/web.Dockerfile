# TEMPORARY STOP-GAP — do not build on this file.
# Container build of the `web` unit for the local stack only (SCF-AC-2.1), so that
# `docker compose up` starts `web` before its owner's build exists; accepted as a stop-gap in the
# review of !17 (Q70 of `schwaigc`). It ships the whole repository, runs `next start`, and is not
# meant for a deployment. Since #157 it carries no known high or critical vulnerability that has a
# fix (SCF-AC-2.5): the container scan builds and scans it like every other image of the stack,
# without exceptions. It is replaced by M9 (container build) of the track plan Web,
# gam-ai-knowledge/concepts/scaffolding.track-web.md: `apps/web/Dockerfile` with two stages, the
# standalone output, user `node`, the start command with the configuration check, and a health
# check on `/health`, delivered with slice 1 of SCF-US-8. That change deletes this file and points
# the `web` service of docker-compose.yml at the new one.
#
# The Node.js version equals .tool-versions and the CI image; pnpm comes from the packageManager
# field.
FROM node:24.14.0-alpine

# The Alpine packages are upgraded to their fixed versions (SCF-AC-2.5, SCF-NF-6, #160), and the
# npm bundled with Node.js is removed (#157), as in packages/db/Dockerfile: the image runs pnpm
# through corepack and never npm. The upgrade makes the contents depend on the build date; the
# container scan rebuilds and checks the image on every pipeline run.
RUN apk upgrade --no-cache \
  && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx \
  && corepack enable
USER node
WORKDIR /app

COPY --chown=node:node . .

# `run build` on `@stash/web...` builds the workspace packages of web first (in order), so the
# API description of `@stash/contracts` exists for `/api/docs` (M6).
# The development dependencies (Storybook of @stash/ui, the TypeScript toolchain) are needed only
# to build. The installed folders are deleted after the build and the production dependencies are
# installed again, because a second install alone leaves them in the virtual store (#157).
RUN pnpm install --frozen-lockfile --filter @stash/web... \
 && pnpm --filter @stash/web... run build \
 && rm -rf node_modules apps/*/node_modules packages/*/node_modules tests/node_modules \
 && CI=1 pnpm install --frozen-lockfile --prod --prefer-offline --filter @stash/web...

EXPOSE 3000
CMD ["pnpm", "--filter", "@stash/web", "exec", "next", "start"]
