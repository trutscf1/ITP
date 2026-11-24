# The configuration check of the observability stack runs in this image instead of the plain
# Node.js image, so the Alpine packages carry their fixed versions (SCF-AC-2.5, SCF-NF-6, #160),
# as in docker/web.Dockerfile and packages/db/Dockerfile: the contents depend on the build date,
# and the job container-scan rebuilds and scans the image on every pipeline run.
# The npm bundled with Node.js is removed (#172), as in docker/web.Dockerfile: the step runs
# `node` only, and the npm packages inside npm (tar, brace-expansion, minimatch, and others) are
# the ones the scan reports.
FROM node:24.14-alpine
RUN apk upgrade --no-cache \
  && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx
