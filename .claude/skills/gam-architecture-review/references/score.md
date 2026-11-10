# Score rubric

Loaded by `architecture review`. The score is the sum of the area scores, each area graded against its checklist from evidence the reviewer read.

## Areas and weights

| # | Area | Weight | Looks at |
| --- | --- | --- | --- |
| 1 | Layering and dependency rule | 15 | Layers of the project's chain (P-DES-3), imports point inward only, no cycles, interfaces at layer borders (P-ARCH) |
| 2 | Domain model | 10 | Entities and value objects carry the rules; names match `CONTEXT.md`; no logic in controllers or UI |
| 3 | SOLID and module design | 10 | Single responsibility per module, small interfaces, dependencies injected, size limits of P-ARCH |
| 4 | Security and authentication | 15 | Input validation at the border, authorization on every route, secrets out of code, the auth library used as documented |
| 5 | API design | 10 | [api.md](api.md) |
| 6 | Data and persistence | 10 | [database.md](database.md) |
| 7 | Frontend structure | 10 | Components by role, server state from the bound library (P-DES-11), no business rules in views |
| 8 | Testability | 5 | Tests at the agreed seams (P-DES-2), no test needs a running network |
| 9 | Production readiness | 5 | Errors handled and logged, health check, config per environment, no hardcoded tunables (P-DES-6) |
| 10 | Configuration and delivery | 5 | Pipeline green and recorded, reproducible build, dependencies audited |
| 11 | Documentation and decisions | 5 | Concepts, `STACK.md`, and ADRs match the code; decisions that shaped the code have an ADR |

The weights add up to 100.

## Grading an area

Give each checklist item `met`, `partly`, or `missed` with its evidence, then the area score: `met` counts 1, `partly` 0.5, `missed` 0, the mean of the items times the weight, rounded to a whole number. An area with no evidence read is `not reviewed` and is scaled out like `n/a`, but is named as a gap in the report.

## Scaling

With `n/a` or `not reviewed` areas, the total is the sum of the earned points divided by the sum of the weights that count, times 100, rounded. The table names each excluded area with its reason, so a small project is not punished for areas it does not have.

## Bands

| Score | Band |
| --- | --- |
| 90–100 | Exemplary |
| 75–89 | Sound |
| 55–74 | Needs work |
| 40–54 | Weak |
| 0–39 | Critical |

## Table

`| Area | Weight | Score | Evidence (file:line) | Finding |` — one row per area, `n/a` rows with the reason in *Finding*, a total row with the band.
