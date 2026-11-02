# TEMPORARY STOP-GAP — do not build on this file.
# Container build of the `web` unit for the local stack only (SCF-AC-2.1), so that
# `docker compose up` starts `web` before its owner's build exists; accepted as a stop-gap in the
# review of !17 (Q70 of `schwaigc`). It ships the whole repository with its development
# dependencies, runs `next start`, and is not meant for the image scan or a deployment. It is replaced by M9 (container build) of the track plan Web,
# documentation/concepts/scaffolding.track-web.md: `apps/web/Dockerfile` with two stages, the
# standalone output, user `node`, the start command with the configuration check, and a health
# check on `/health`, delivered with slice 1 of SCF-US-8. That change deletes this file and points
# the `web` service of docker-compose.yml at the new one.
#
# The Node.js version equals .tool-versions and the CI image; pnpm comes from the packageManager
# field.
FROM node:24.14.0-alpine

RUN corepack enable
USER node
WORKDIR /app

COPY --chown=node:node . .

# `run build` on `@stash/web...` builds the workspace packages of web first (in order), so the
# API description of `@stash/contracts` exists for `/api/docs` (M6).
RUN pnpm install --frozen-lockfile --filter @stash/web... \
 && pnpm --filter @stash/web... run build

EXPOSE 3000
CMD ["pnpm", "--filter", "@stash/web", "exec", "next", "start"]
