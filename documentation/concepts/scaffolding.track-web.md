---
doc: concept
format: legacy   # pre-engineering-human section numbers; migrated on the next change (P-DOC-5, ADR-0002)
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

Consumes (interface fixed in `scaffolding.md`; work is never blocked, stub until the code is merged):

- HealthReport, configuration helper, and the generated API description — contracts core (SCF-US-3, #40)
- internal health paths and ports of every unit (§8); tested with stubbed responses
- design tokens of `@stash/ui` (R4, DSA-US-1) for the optional status colour

## Issues

The issues #15 and #16 of the first cut were deleted on 2026-09-29. The work of this track is tracked by the story issues it delivers ([work items](../work-items/scaffolding/feature.md)):

- #113 — this plan (`type::concept`)
- SCF-US-8 (units reachable and visible), slice 1: the `web` part of the health reports; slice 2: the status page. Their issues follow with `/engineering-human tickets scaffolding`.
- SCF-US-3 (shared contracts, #40): serving the generated API description at `/api/docs`

Every issue: feature branch → MR into `dev`, reviewed by another person (`documentation/WORKFLOW.md`).

## Plan

_Written by Christopher before the first MR; decided in `../qa-log.md`, Q45 and Q46._

### Module specification

Neutral pseudocode and types per `MANIFEST.md` Phase 5; each module lists `Traces to:` and `Requires:`. Shapes in capitals (`HealthReport`, `DependencyCheck`) are the ones of `scaffolding.md` §8.

#### M1 — Configuration of `web` (contracts folder `web`)

```text
WebConfig {
  PORT: integer 1..65535,            default 3000
  APP_VERSION: string,                default "0.0.0-dev"
  HEALTH_TIMEOUT_MS: integer > 0,     default 2000
  IDENTITY_HEALTH_URL: url,           default "http://identity:3001/health"
  STORAGE_HEALTH_URL: url,            default "http://storage:3002/health"
  WORKER_HEALTH_URL: url,             default "http://worker:3003/health"
  CMS_HEALTH_URL: url,                default "http://cms:1337/health"
}

loadWebConfig(environment) -> WebConfig
  return configurationHelper(WebConfig, environment)   // exits as SCF-E-1 on an invalid value
```

The defaults follow the routing table of §8; every value comes from the environment ([SCF-NF-8]) and is listed in the example configuration ([SCF-F-17]).
Traces to: SCF-F-11, SCF-F-17, SCF-NF-8, SCF-E-1. Requires: configuration helper (contracts core).

#### M2 — Health endpoint of `web`

```text
GET /health -> HealthReport
  return { unit: "web", version: config.APP_VERSION, status: "ok", checks: [] }
```

`web` has no dependency check, so it always reports `ok` ([SCF-F-6]). The report is built from the configuration only and names no host, port, or dependency version.
Traces to: SCF-F-5, SCF-F-6, SCF-NF-4, SCF-AC-8.1. Requires: HealthReport.

#### M3 — Query of one unit

```text
UnitRow { unit: UnitName, status: enum(ok|degraded|down), failedChecks: list<string> }

queryUnit(unit, url, timeoutMs) -> UnitRow
  response = GET url, aborted after timeoutMs
  if no response (refused, timeout, network error):          return down(unit)   // SCF-E-3
  body = parse response body as JSON, whatever the HTTP status
  if body is not a HealthReport or body.unit != unit:        return down(unit)   // SCF-E-3
  failed = names of body.checks whose status is "down"
  return { unit, status: body.status, failedChecks: body.status == "ok" ? [] : failed }

down(unit) = { unit, status: "down", failedChecks: [] }
```

A unit answers a `down` report with an error status as well, so the body decides, not the HTTP status (A2 of Q46). The timeout of one query is `HEALTH_TIMEOUT_MS`, the time a unit has for its whole report ([SCF-NF-3]).
Traces to: SCF-F-8, SCF-E-3, SCF-NF-3, SCF-AC-8.4. Requires: HealthReport.

#### M4 — Status of all units

```text
collectStatus(config) -> list<UnitRow>          // order: web, identity, storage, worker, cms
  own   = row from M2 without an HTTP request
  other = queryUnit for identity, storage, worker, cms, all at the same time
  return [own] + other
```

One failed query changes only its own row. Nothing is cached: every call queries anew ([SCF-U-3]). `worker` is queried at its internal address like the others (Q12).
Traces to: SCF-F-8, SCF-U-3, SCF-E-3. Requires: M1, M2, M3.

#### M5 — Status page (`/status`, A1 of Q46)

```text
GET /status -> page, rendered on the server for every request
  rows = collectStatus(config)
  table, caption "Status of the units"
    column headers: Unit | Status | Failed checks
    one row per UnitRow: row header = unit name; status as text; failed checks as text, comma-separated
    optional colour of the status from the design tokens, never the only signal
```

Traces to: SCF-F-8, SCF-U-1, SCF-U-2, SCF-U-3, SCF-AC-8.4, SCF-AC-8.5. Requires: M4; design tokens of `@stash/ui` (optional).

#### M6 — API description

```text
GET /api/docs -> the generated OpenAPI file of the contracts package, unchanged, as application/json
```

`web` never edits or rebuilds the file; it serves what the generation command of the contracts core wrote ([SCF-F-10]). Until that command exists, the route is tested against a fixture file.
Traces to: SCF-F-10, SCF-AC-3.3. Requires: generation command and its output path (contracts core).

### Order of work

1. **M1 and M2** — slice 1 of SCF-US-8, the `web` part: `/health` of `web`; the proxy route `/` is the Platform track's.
2. **M3, M4, M5** — slice 2 of SCF-US-8: query and status page. The page list of the accessibility check (`tests/accessibility/axe-check.ts`, Identity & CI track) gets `/status`; that change is requested from `tschudea07` as an issue.
3. **M6** — once the generation command of SCF-US-3 (#40) is merged.

Not in this track: `apps/web/src/prisma` from the first scaffold of `dev` stays untouched; it belongs to the relational schema of SCF-US-4 (Identity & CI track), which decides where it moves (A5 of Q46).

### Test cases

Taken from `scaffolding.md` §10 and the acceptance criteria of SCF-US-8. These are the unit tests of the track, run with `node --test` in `apps/web`; the acceptance tests SCF-T-36 (the `web` row), SCF-T-39, and SCF-T-40 in `tests/` build on them. The health reports of §10 are kept as data next to the tests. A test name starts with the case ID and the acceptance criterion it covers, for example `W-5 SCF-AC-8.4: a down report with HTTP status 503 gives a down row` (`scaffolding.md` §17: test names carry the `AC` ID). A case whose *Covers* column names no acceptance criterion covers requirements only.

| Case | Module | Covers | Given | When | Then |
| --- | --- | --- | --- | --- | --- |
| W-1 | M1 | SCF-AC-2.6, SCF-F-11, SCF-F-17 | an environment without any of the variables of M1 | the configuration is loaded | every value is its default |
| W-2 | M1 | SCF-AC-2.6, SCF-E-1 | `PORT=abc` | the configuration is loaded | it fails with the output of §10, example 3, for the unit `web`: `Invalid configuration for unit "web":` and `  PORT: expected an integer between 1 and 65535`; the output does not hold `abc` |
| W-3 | M2 | SCF-AC-8.1, SCF-AC-8.2, SCF-NF-4 | `APP_VERSION=0.1.0` | `/health` of `web` is requested | the report is `{ unit: "web", version: "0.1.0", status: "ok", checks: [] }` and holds no host or port |
| W-4 | M3 | SCF-AC-8.4, SCF-F-8 | a stub that answers with §10, example 1 | `identity` is queried | the row is `identity`, `ok`, no failed checks |
| W-5 | M3 | SCF-AC-8.4, SCF-F-8, SCF-U-1 | a stub that answers with §10, example 2, with HTTP status 503 | `identity` is queried | the row is `identity`, `down`, failed check `relational-database` |
| W-6 | M3 | SCF-AC-8.4, SCF-F-8, SCF-U-1 | a stub that reports `degraded` with one non-essential check `down` | the unit is queried | the row is `degraded` and names that check |
| W-7 | M3 | SCF-AC-8.4, SCF-E-3, SCF-NF-3 | a stub that does not answer | the unit is queried with a timeout of 200 ms | the row is `down` within 400 ms |
| W-8 | M3 | SCF-AC-8.4, SCF-E-3 | no process at the address (connection refused) | `storage` is queried | the row is `storage`, `down`, no failed checks |
| W-9 | M3 | SCF-AC-8.4, SCF-E-3 | a stub that answers with a body that is not a HealthReport, and one that answers with the report of another unit | the unit is queried | both rows are `down` |
| W-10 | M4 | SCF-AC-8.4, SCF-F-8, SCF-E-3 | the stubs of §10, example 7 | the status is collected | the five rows of example 7 come back in the order `web`, `identity`, `storage`, `worker`, `cms` |
| W-11 | M4 | SCF-AC-8.4, SCF-U-3 | the stubs of W-10, then `storage` answering `ok` | the status is collected twice | the second result shows `storage` as `ok` |
| W-12 | M5 | SCF-AC-8.4, SCF-AC-8.5, SCF-U-1, SCF-U-2 | the rows of example 7 | the page is rendered on the server | it holds one table with a caption, three column header cells, one row header cell per unit, and every status as text |
| W-13 | M6 | SCF-AC-3.3, SCF-F-10 | a fixture file in place of the generated description | `/api/docs` is requested | the response equals the file byte for byte, with the type `application/json` |
