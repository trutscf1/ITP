---
doc: concept
format: legacy   # pre-gam-engineering section numbers; migrated on the next change (P-DOC-5, ADR-0002)
title: "Scaffolding & shared contracts"
audience: [product, developer, reviewer, agent]
id-prefix: "SCF"
---
# R1 Track: Web — Christopher Schwaiger

Plan file of one track of `scaffolding.md` (§16, Q13). **Only Christopher edits this file.** Requirements, interfaces, and examples come from [scaffolding.md](scaffolding.md); this file never restates them, it references them by ID.

## Owned paths

Nobody else changes these; a needed change here is requested as an issue for Christopher.

- unit folder `web`
- contracts folder `web`
- `STACK.md` §4

## Interfaces

Provides:

- `web` health endpoint (SCF-F-5)
- accessible status page (SCF-F-8, SCF-U-1…3, SCF-E-3)
- the API description at `/api/docs` (SCF-F-10, assumption A19 of `scaffolding.md`)
- the container build of `web` (Dockerfile in the unit folder, `scaffolding.md` §16, SCF-US-2)

Consumes (interface fixed in `scaffolding.md`; work is never blocked, stub until the code is merged):

- HealthReport, ErrorResponse, configuration helper, and the generated API description — contracts core (SCF-US-3, #40)
- internal health paths and ports of every unit (§8); tested with stubbed responses
- **service names** (agreed with the Platform track, Q58): in the container stack every unit runs as a service named like the unit (`identity`, `storage`, `worker`, `cms`), so `http://<unit>:<port>/health` reaches it

Requested from other tracks (one issue each, listed under "Issues"):

| Track | Path | What `web` needs |
| --- | --- | --- |
| Platform & cms | `docker-compose.yml`, reverse proxy | a service `web` built from `apps/web/Dockerfile`, health check on `/health`, proxy route `/` → `web:3000`; services named like the units (SCF-F-4, SCF-F-20) |
| Platform & cms | `.env.example` | the variables of M1 with the container values, and a comment with the values for the native start (SCF-F-17); `OPENAPI_FILE` added as a commented line with #40 |
| Platform & cms | `turbo.json` | the task `test` depends on `^build`, so `@stash/contracts` is built before the tests of `web` import it; done with #40 |
| Contracts, storage & worker | `packages/contracts` | the export path of the contracts folder `web` (`@stash/contracts/web`), the signature of the configuration helper (M1), the output path of the generated API description (M6); export path and output path done with #40, the configuration helper is still open (M1 holds a local stand-in) |
| Identity & CI | `tests/accessibility/axe-check.ts` | `/status` in the page list of the shared check |

## Issues

The issues #15 and #16 of the first cut were deleted on 2026-09-29. The work of this track is tracked by the story issues it delivers ([work items](../work-items/E01-scaffolding/epic.md)):

- #113 — this plan (`type::concept`)
- SCF-US-8 (units reachable and visible), slice 1: the `web` part of the health reports (M1, M2, M7, M8, M9); slice 2: the status page (M3, M4, M5). Their issues follow with `/gam-engineering tickets scaffolding`.
- SCF-US-3 (shared contracts, #40): serving the generated API description at `/api/docs` (M6)
- The requests of the table above, one issue per row, created with the first slice issue.

Every issue: feature branch → MR into `dev`, reviewed by another person (`gam-ai-knowledge/WORKFLOW.md`).

## Plan

_Written by Christopher before the first MR; decided in `../qa-log.md`, Q46, Q47, and Q54 to Q59 (review of !14)._

### Module specification

Neutral pseudocode and types per `MANIFEST.md` Phase 5; each module lists `Traces to:` and `Requires:`. Shapes in capitals (`HealthReport`, `DependencyCheck`, `ErrorResponse`) are the ones of `scaffolding.md` §8. Every function has explicit parameter and return types; no unspecified type ([SCF-NF-5]).

#### Files

```text
apps/web/
├── Dockerfile                       M9  container build
├── next.config.ts                   M9  standalone output
├── scripts/start.ts                 M7  start command: configuration check, then Next.js
├── src/app/layout.tsx               M8  page frame: local font, title, lang
├── src/app/page.tsx                 M8  placeholder start page (no third-party logo)
├── src/app/health/route.ts          M2
├── src/app/status/page.tsx          M5  thin page: calls M4, renders M5's table
├── src/app/api/docs/route.ts        M6  thin: connection(), configuration, then src/api-docs
├── src/app/api/[...path]/route.ts   M6  404 ErrorResponse for unknown /api paths
├── src/api-docs/api-docs.ts         M6  serveApiDocs(file): the file unchanged, or 500
├── src/errors.ts                    M6  errorResponse(code): ErrorResponse from errorReplies
├── src/status/query.ts              M3
├── src/status/collect.ts            M4
├── src/status/table.ts              M5  table component without JSX (React createElement)
├── src/health.ts                    M2  ownReport(config)
└── src/**/*.test.ts                 unit tests W-1 to W-22
packages/contracts/src/web/config.ts M1  WebConfig, loadWebConfig, loadWebConfigValue
```

The route files are thin: they call the module and turn its result into a response. Logic lives in `.ts` files without JSX, so the unit tests import it with `node --test` and type stripping, which compiles no JSX (F3 of the review). Imports between these files are relative with the `.ts` extension, as in `tests/`; the `@/` alias is used only in route files.

Dependencies of `apps/web/package.json` to add: `@stash/contracts` (`workspace:*`), `geist` (exact version, the newest one older than the 7-day minimum release age, today 1.7.2; licence SIL OFL 1.1). The existing tasks `dev`, `build`, `lint`, `typecheck`, `test` stay ([SCF-F-12]); `start` becomes `node scripts/start.ts start`, `dev` becomes `node scripts/start.ts dev`. `apps/web/tsconfig.json` adds `"allowImportingTsExtensions": true` and `"erasableSyntaxOnly": true`, so that `tsc` accepts the `.ts` imports and rejects syntax that type stripping cannot run (A1); the `test` script becomes `node --test "src/**/*.test.ts"` (A2).

#### M1 — Configuration of `web` (contracts folder `web`)

```text
WebConfig {
  PORT: integer 1..65535,            default 3000
  APP_VERSION: string, 1..64 chars,   default "0.0.0-dev"
  HEALTH_TIMEOUT_MS: integer 1..60000, default 2000
  IDENTITY_HEALTH_URL: http(s) url,   default "http://identity:3001/health"
  STORAGE_HEALTH_URL: http(s) url,    default "http://storage:3002/health"
  WORKER_HEALTH_URL: http(s) url,     default "http://worker:3003/health"
  CMS_HEALTH_URL: http(s) url,        default "http://cms:1337/health"
  OPENAPI_FILE: path, 1..512 chars,   default "../../packages/contracts/dist/openapi.json"   // relative to the working directory apps/web (A3)
}

ConfigProblem { name: string, reason: string }        // never the value

loadWebConfig(environment: map<string, string>) -> ok(WebConfig) | failed(list<ConfigProblem>)
  return configurationHelper(WebConfig, environment)

loadWebConfigValue(environment: map<string, string>, name) -> ok(value) | failed(ConfigProblem)
  check only the variable name, with the same default and reason as above
```

A variable that is missing or empty takes its default. A value outside its range is a problem with the reasons `expected an integer between 1 and 65535`, `expected an integer between 1 and 60000`, `expected 1 to 64 characters`, `expected 1 to 512 characters`, `expected an http or https URL`. `OPENAPI_FILE` names the generated API description (M6); its default is the assumed output path of the generation command and is corrected when the contracts core (#8) fixes the path. The defaults of the four URLs are the container addresses (service name = unit name, Q58); the native start ([SCF-F-3]) sets the four URLs to `http://localhost:<port>/health` with the ports of §8. `loadWebConfig` only returns; printing and exiting are M7's job. `loadWebConfigValue` serves a handler that needs one value at request time (M6): an invalid other variable does not break it, because the whole check runs at startup in M7 ([SCF-F-11]); W-22 tests it.

Until the configuration helper of the contracts core exists, `config.ts` holds a local function with the same signature; it is replaced, not kept, when the helper is merged.
Traces to: SCF-F-11, SCF-F-17, SCF-NF-8, SCF-E-1. Requires: configuration helper (contracts core), export path `@stash/contracts/web`.

#### M2 — Health endpoint of `web`

```text
ownReport(config: WebConfig) -> HealthReport
  return { unit: "web", version: config.APP_VERSION, status: "ok", checks: [] }

GET /health -> 200, HealthReport as JSON
  mark the request dynamic; return ownReport(config)
```

`web` has no dependency check, so it always reports `ok` ([SCF-F-6]). The report names no host, port, or dependency version.
Traces to: SCF-F-5, SCF-F-6, SCF-NF-4, SCF-AC-8.1. Requires: HealthReport, M1.

#### M3 — Query of one unit

```text
UnitRow { unit: UnitName, status: enum(ok|degraded|down), failedChecks: list<string> }

queryUnit(unit: UnitName, url: url, timeoutMs: integer) -> UnitRow
  response = GET url, redirects not followed, the whole request including the body aborted after timeoutMs
  if no response (refused, timeout, network error):           return down(unit)   // SCF-E-3
  if response is a redirect or the body is larger than 64 KiB: return down(unit)   // SCF-E-3
  body = parse the body as JSON, whatever the HTTP status
  if body is not a HealthReport or body.unit != unit:         return down(unit)   // SCF-E-3
  failed = names of body.checks whose status is "down"
  return { unit, status: body.status, failedChecks: body.status == "ok" ? [] : failed }

down(unit: UnitName) -> UnitRow = { unit, status: "down", failedChecks: [] }
```

A unit answers a `down` report with an error status as well, so the body decides, not the HTTP status (A2 of Q47). The timeout of one query is `HEALTH_TIMEOUT_MS`, the time a unit has for its whole report ([SCF-NF-3]). A redirect is no HealthReport.
Traces to: SCF-F-8, SCF-E-3, SCF-NF-3, SCF-AC-8.4. Requires: HealthReport.

#### M4 — Status of all units

```text
collectStatus(config: WebConfig) -> list<UnitRow>     // order: web, identity, storage, worker, cms
  own   = row of ownReport(config) (M2), without an HTTP request
  other = queryUnit for identity, storage, worker, cms with their URLs of M1, all at the same time
  return [own] + other
```

One failed query changes only its own row. Nothing is cached: every call queries anew ([SCF-U-3]). `worker` is queried at its internal address like the others (Q12).
Traces to: SCF-F-8, SCF-U-3, SCF-E-3. Requires: M1, M2, M3.

#### M5 — Status page (`/status`, A1 of Q47)

```text
StatusTable(rows: list<UnitRow>) -> table element
  caption "Status of the units"
  column header cells: Unit | Status | Failed checks
  per row: row header cell = unit name; status as text (ok, degraded, down);
           failed checks as text, comma-separated, or "none" when the list is empty

GET /status -> HTML page
  mark the request dynamic
  page title "Status of the units", <main> with <h1> "Status of the units", then StatusTable(collectStatus(config))
```

The status is text only, without colour, in R1 (Q56). Every cell wraps, so the table needs no horizontal scrolling at 320 px width (mobile first). The page language is `en`, set by the layout. An empty failed-checks cell says `none`, so a screen reader reads something.
Traces to: SCF-F-8, SCF-U-1, SCF-U-2, SCF-U-3, SCF-AC-8.4, SCF-AC-8.5. Requires: M4.

#### M6 — API description and errors under `/api`

```text
GET /api/docs
  mark the request dynamic
  bytes = read the generated OpenAPI file at request time
  if it cannot be read: 500, ErrorResponse { code: "internal-error", message: "The request could not be processed." }
  else: 200, Content-Type application/json, bytes unchanged (not parsed and written again)

GET|POST|… /api/<any other path> -> 404, ErrorResponse { code: "not-found", message: "The requested resource does not exist." }
```

The path to the file is `config.OPENAPI_FILE`, read per request, so a test points it at the fixture or at a missing file and the image points it at its own copy (M9). `web` never edits or rebuilds the file; it serves what the generation command of the contracts core wrote ([SCF-F-10]). The error message names no path ([SCF-NF-4]); the cause goes to the log. HTML pages keep the normal not-found page; [SCF-F-21] applies to the HTTP endpoints under `/api` (Q59). `/health` is an HTTP endpoint as well: it builds the report from the configuration only, so it has no failure of its own, but an unexpected exception is caught in the handler and answered with the 500 above, and `/health` and `/api/docs` answer a method other than GET and HEAD with 405, `{ code: "method-not-allowed", message: "The method is not allowed for this path." }`, and the header `Allow: GET, HEAD` (A6, W-21). The tests use the fixture `apps/web/src/api-docs/fixture.openapi.json`. `connection()` throws outside a request of Next.js, so `route.ts` only awaits it, reads only `OPENAPI_FILE` with `loadWebConfigValue` (M1; an invalid value gives the 500 above, an invalid other variable is ignored), and hands the path to `serveApiDocs(file)` in `src/api-docs/api-docs.ts`, which W-13 and W-15 call directly, W-13 once with the fixture and once with the default `OPENAPI_FILE` against the output of the contracts build (SCF-T-15); the handlers of the other methods and of `[...path]` are called directly (W-16, W-21). Route files import `next/server.js`, because `node --test` resolves no import without an extension.
Traces to: SCF-F-10, SCF-F-21, SCF-NF-4, SCF-AC-3.3, SCF-AC-3.4. Requires: generation command and its output path (contracts core), ErrorResponse.

#### M7 — Start command

```text
start(mode: enum(dev|start), environment) -> exit code
  result = loadWebConfig(environment)
  if failed(problems):
    print 'Invalid configuration for unit "web":' and one line per problem, indented by two spaces: "<name>: <reason>"
    return 1                                          // SCF-E-1: no server was started
  run Next.js in mode with the validated PORT; return its exit code
```

Next.js reads `PORT` itself and would either reject `abc` with its own message (`next start`) or fall back to 3000 without a word (the standalone server of the image); only a check before Next.js starts gives example 3 and accepts no request (Q54, F1 of the review). In the image, `start` runs the standalone server.
Traces to: SCF-F-11, SCF-E-1, SCF-AC-2.6. Requires: M1.

#### M8 — Page frame

The starter files of create-next-app are replaced in slice 1: the layout loads Geist from the package `geist` as local font files (no request to the internet at build or run time, [SCF-NF-1]; Q55), the title is the project name instead of "Create Next App", `page.tsx` is a plain placeholder with a link to `/status`, and all template artwork is deleted: `public/next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg`, and `src/app/favicon.ico` (third-party logos, licence notes; a project icon follows with the design system, R4; A4). The template `apps/web/README.md` is replaced by a short one (unit, commands, link to this plan). The README's licence notes get the row for `geist`.
Traces to: SCF-NF-1, SCF-F-28 (licence notes). Requires: —

#### M9 — Container build

```text
apps/web/Dockerfile
  build stage:   node:24-alpine (≥ 24.14), pnpm of the root package.json, install from the lockfile, build @stash/contracts and @stash/web
  runtime stage: node:24-alpine, user node (not root), the standalone output with .next/static and public,
                 scripts/start.ts and what it imports, the generated API description
  HEALTHCHECK:   GET http://127.0.0.1:${PORT}/health answers 200
  CMD:           node scripts/start.ts start
```

`next.config.ts` sets the standalone output and `outputFileTracingRoot` to the repository root, so that `server.js` and the workspace packages are traced in a monorepo. The runtime stage sets `HOSTNAME=0.0.0.0` (the standalone server otherwise binds to the container host name, and the health check at `127.0.0.1` and the proxy would not reach it), `NODE_ENV=production`, `NEXT_TELEMETRY_DISABLED=1`, and `OPENAPI_FILE` to the copy of the generated file in the image (A5). The image needs no internet at start ([SCF-NF-1]). The service in `docker-compose.yml` and its proxy route are requested from the Platform track.
Traces to: SCF-F-1, SCF-F-20, SCF-NF-1, SCF-AC-2.1, SCF-AC-2.4. Requires: workspace root (Platform track).

### Rendering rule

`/health`, `/status`, and `/api/docs` are marked dynamic at the start of the handler (`STACK.md` §4 names the mechanism), so `next build` prerenders none of them. `build` never calls another unit and never reads the generated API description; it only runs at request time (F2 of the review).

### Order of work

1. **Slice 1 of SCF-US-8** — M8 (page frame), M1, M2, M7, M9; requests for compose, proxy, `.env.example`, `turbo.json`, and the contracts export path.
2. **Slice 2 of SCF-US-8** — M3, M4, M5; acceptance tests SCF-T-39 and SCF-T-40; request for the page list of the shared accessibility check.
3. **M6** — once the generation command of SCF-US-3 (#40) is merged; the 404 route for `/api` comes with it. Delivered with #40 on 2026-10-28, together with M1 (moved ahead, because M6 reads `OPENAPI_FILE`; Q179), the export path `@stash/contracts/web`, the task `test` after `^build` in `turbo.json`, and the build of the workspace packages in the stop-gap image `docker/web.Dockerfile`; slice 1 of SCF-US-8 keeps M2, M7, M8, M9.

Not in this track: `apps/web/src/prisma` from the first scaffold of `dev` stays untouched; it belongs to the relational schema of SCF-US-4 (Identity & CI track), which decides where it moves (A5 of Q47).

### Design for testability

The seams of the unit tests, in addition to those of `scaffolding.md` §16:

- **Stub units**: an HTTP server on port 0 per test, answering with a fixed status and body, slowly, with a redirect, or not at all (W-4 to W-11, W-17, W-18).
- **Refused connection**: a port that was opened and closed again, so nothing listens (W-8).
- **Route handlers called directly** with a request object, without starting Next.js (W-3, W-16, W-21). A handler that awaits `connection()` cannot run outside Next.js, so its work sits in a function that the tests call instead: `serveApiDocs(file)` for `/api/docs` (W-13, W-15).
- **Configuration from a given environment object**, never from `process.env` (W-1, W-22).
- **Table component** rendered to a string with React's server renderer (W-12).
- **Start command** run as a child process with a given environment; exit code and output are read (W-2, W-14).
- **Build output**: the prerender manifest of `next build` (W-19).

The flow between `web`, the proxy, and the units is the one of `scaffolding.md` §16, "Pipeline Flow"; this track adds no other path.

### Test cases

Taken from `scaffolding.md` §10 and the acceptance criteria of SCF-US-8. These are the unit tests of the track, in `apps/web/src/**/*.test.ts` (runner: `STACK.md` §4). The acceptance tests SCF-T-39 and SCF-T-40 are written by this track in `tests/status-page.test.ts` (Q57); SCF-T-36 belongs to the Platform track. SCF-T-40 runs axe on `/status` alone and requires 0 violations of any impact; the shared check of the pipeline stays as it is. The health reports of §10 are kept as data next to the tests. A test name starts with the case ID and the acceptance criterion it covers, for example `W-5 SCF-AC-8.4: a down report with HTTP status 503 gives a down row` (`scaffolding.md` §17: test names carry the `AC` ID). A case whose _Covers_ column names no acceptance criterion covers requirements only.

| Case | Module | Covers | Given | When | Then |
| --- | --- | --- | --- | --- | --- |
| W-1 | M1 | SCF-F-11, SCF-F-17 | an environment without any of the variables of M1 | the configuration is loaded | every value is its default |
| W-2 | M7 | SCF-AC-2.6, SCF-E-1 | `PORT=abc` | the start command runs | it exits with 1 and prints the output of §10, example 3, for the unit `web`: `Invalid configuration for unit "web":` and, indented by two spaces, `PORT: expected an integer between 1 and 65535`; the output does not hold `abc`, and no port is opened |
| W-3 | M2 | SCF-AC-8.1, SCF-AC-8.2, SCF-NF-4 | `APP_VERSION=0.1.0` | `/health` of `web` is requested | the report is `{ unit: "web", version: "0.1.0", status: "ok", checks: [] }` and holds no host or port |
| W-4 | M3 | SCF-AC-8.4, SCF-F-8 | a stub that answers with §10, example 1 | `identity` is queried | the row is `identity`, `ok`, no failed checks |
| W-5 | M3 | SCF-AC-8.4, SCF-F-8, SCF-U-1 | a stub that answers with §10, example 2, with HTTP status 503 | `identity` is queried | the row is `identity`, `down`, failed check `relational-database` |
| W-6 | M3 | SCF-AC-8.4, SCF-F-8, SCF-U-1 | a stub that reports `degraded` with one non-essential check `down` | the unit is queried | the row is `degraded` and names that check |
| W-7 | M3 | SCF-AC-8.4, SCF-E-3, SCF-NF-3 | a stub that sends its headers and then no body | the unit is queried with a timeout of 200 ms | the row is `down` within 400 ms |
| W-8 | M3 | SCF-AC-8.4, SCF-E-3 | no process at the address (connection refused) | `storage` is queried | the row is `storage`, `down`, no failed checks |
| W-9 | M3 | SCF-AC-8.4, SCF-E-3 | a stub that answers with a body that is not a HealthReport, and one that answers with the report of another unit | the unit is queried | both rows are `down` |
| W-10 | M4 | SCF-AC-8.4, SCF-F-8, SCF-E-3 | the stubs of §10, example 7 | the status is collected | the five rows of example 7 come back in the order `web`, `identity`, `storage`, `worker`, `cms` |
| W-11 | M4 | SCF-AC-8.4, SCF-U-3 | the stubs of W-10, then `storage` answering `ok` | the status is collected twice | the second result shows `storage` as `ok` |
| W-12 | M5 | SCF-AC-8.4, SCF-AC-8.5, SCF-U-1, SCF-U-2 | the rows of example 7 | the table is rendered to a string | it holds one table with the caption, three column header cells, one row header cell per unit, every status as text, and `none` in the failed-checks cell of `web`, `storage`, `worker`, and `cms` |
| W-13 | M6 | SCF-AC-3.3, SCF-F-10 | the fixture file in place of the generated description | `/api/docs` is requested | the response equals the file byte for byte, with the type `application/json` |
| W-14 | M7 | SCF-AC-2.6 | `HEALTH_TIMEOUT_MS=0` and `CMS_HEALTH_URL=ftp://cms` | the start command runs | it exits with 1 and prints two problem lines, one per variable, without the values |
| W-15 | M6 | SCF-AC-3.4, SCF-F-21, SCF-NF-4 | no file at the path of the generated description | `/api/docs` is requested | the response is 500 with `{ code: "internal-error", message: "The request could not be processed." }` and names no path |
| W-16 | M6 | SCF-AC-3.4, SCF-F-21 | — | `/api/unknown` is requested | the response is 404 with `{ code: "not-found", message: "The requested resource does not exist." }` |
| W-17 | M3 | SCF-AC-8.4, SCF-E-3 | a stub that answers with a redirect to a healthy stub | the unit is queried | the row is `down` and the second stub got no request |
| W-18 | M3 | SCF-AC-8.4, SCF-E-3 | a stub that answers with a body of 100 KiB | the unit is queried | the row is `down` |
| W-19 | Rendering rule | SCF-AC-8.4, SCF-U-3 | the output of `next build` with every unit address pointing to a closed port | the prerender manifest is read | it lists none of `/health`, `/status`, `/api/docs`, and the build made no request to a unit |
| W-20 | M8 | SCF-NF-1 | the source of the layout | it is read | it imports no font from `next/font/google`, and neither `public/` nor `src/app/` holds a file of the create-next-app template (the five `.svg` files, `favicon.ico`) |
| W-21 | M2, M6 | SCF-AC-3.4, SCF-F-21 | `/health` | it is requested with POST | the response is 405 with `{ code: "method-not-allowed", message: "The method is not allowed for this path." }` and the header `Allow: GET, HEAD` |
| W-22 | M1 | SCF-F-10, SCF-F-11 | `CMS_HEALTH_URL=ftp://cms`, then `OPENAPI_FILE` of 513 characters | `OPENAPI_FILE` is read alone | first its default, then the problem `OPENAPI_FILE: expected 1 to 512 characters` |

## Assumptions

The owner decisions of the review are in `../qa-log.md`, Q54 to Q59, and need no assumption. The points below were still open when the plan was checked for generation; each takes the recommended default; `schwaigc` accepted all six (`../qa-log.md`, Q62).

- A1: `apps/web/tsconfig.json` sets `allowImportingTsExtensions` and `erasableSyntaxOnly`. Reason: the plan prescribes `.ts` imports for type stripping, which `tsc` rejects without the first option, and the second keeps enums and namespaces out of the tested files.
- A2: The `test` script lists its glob, `src/**/*.test.ts`. Reason: the generator should not depend on the default file patterns of `node --test`, and `.next/` must not be searched.
- A3: The API description is found through the variable `OPENAPI_FILE` (M1), default `../../packages/contracts/dist/openapi.json`. Reason: a test, the native start, and the image need three different paths, and [SCF-NF-8] forbids a hard-coded one; the contracts core (#8) corrects the default.
- A4: All template artwork and the template README are deleted, and no project icon is added in R1. Reason: only `next.svg` and `vercel.svg` were named, but the other files are template artwork as well and would need licence notes; the icon follows with the design system (R4).
- A5: The runtime stage of the image sets `HOSTNAME=0.0.0.0`, `NODE_ENV=production`, `NEXT_TELEMETRY_DISABLED=1`, and `OPENAPI_FILE`; `outputFileTracingRoot` is the repository root. Reason: the standalone server binds to the container host name by default, so the health check at `127.0.0.1` would fail, and a monorepo needs the tracing root.
- A6: `/health` and `/api/docs` answer other methods with 405 and an unexpected exception with 500, both as `ErrorResponse` (W-21). Reason: [SCF-F-21] speaks of every HTTP endpoint; Q59 decided `/api/*` only, so this is the literal reading for `/health`.

## Changes to the main concept (listed, not made)

For `trutscf1`, the owner of `scaffolding.md`:

- §8 or §16: state the rule that the service name of a unit in the stack definition equals the unit name (Q58 agreed it with the Platform track as an interface; the main concept does not say it).
- §16: `tests/` is in no track's owned paths; name an owner or state that the author of a story's track writes the story's test files (Q57).
- SCF-T-40 asks for 0 violations while `axe-check.ts` fails only on `critical`: say that SCF-T-40 is its own run (Q57).
- `SCF-AC-3.1` (`gam-ai-knowledge/work-items/E01-scaffolding/SCF-US-3-…`) and `DSA-AC-1.1` name `@nimbus/contracts` and `@nimbus/ui`; the packages are `@stash/contracts` and `@stash/ui` (F18).
