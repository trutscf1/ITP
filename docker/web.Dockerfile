# Container build of the `web` unit for the local stack (SCF-AC-2.1). The Node.js version
# equals .tool-versions and the CI image; pnpm comes from the packageManager field.
FROM node:24.14.0-alpine

RUN corepack enable
USER node
WORKDIR /app

COPY --chown=node:node . .

RUN pnpm install --frozen-lockfile --filter @stash/web... \
 && pnpm --filter @stash/web exec next build

EXPOSE 3000
CMD ["pnpm", "--filter", "@stash/web", "exec", "next", "start"]
