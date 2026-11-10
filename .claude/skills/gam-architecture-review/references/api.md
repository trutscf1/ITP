# API scorecard

Part of area 5 of [score.md](score.md); `n/a` for a project without a network API.

| Item | Met when |
| --- | --- |
| Resources and verbs | Routes name resources, verbs match their meaning, idempotent calls are idempotent |
| Contracts | Request and response shapes are validated at the border and documented (a schema or a contract example) |
| Errors | One error shape, status codes match the cause, no stack trace leaves the server |
| Authorization | Every route states who may call it; the check sits in one place, not in each handler |
| Versioning and change | A breaking change has a version or a migration path |
| Lists | Paging, a stable sort, and a limit on every list |
| References | Records are addressed by surrogate ID (P-DES-5) |
