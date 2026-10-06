---
doc: context
format: engineering-human/2
title: Glossary
audience: [product, developer, reviewer, agent]
---
# Cloud Storage Platform — Glossary

The shared words of this project, for everyone who writes or reads its documents, issues, code, and tests. Every document and every agent uses these terms exactly; a word listed under *Avoid* is never used for the same concept (P-DOC-2, P-HUM-2). Maintained with `/domain-modeling` as terms are resolved.

## Language

**Unit**:
A separately running process of the system, built and started as its own container. There are exactly five: `web`, `identity`, `storage`, `worker`, `cms`.
*Avoid*: service, app, microservice

**Contract**:
A shared, machine-checked definition of a data shape that crosses a unit boundary: an HTTP request or response, a job payload, or a unit's configuration.
*Avoid*: schema, DTO, interface

**Health report**:
The response of a unit's health endpoint, with the unit's status and one dependency check per thing it depends on.
*Avoid*: status response, ping

**Dependency check**:
One entry of a health report: the state of one thing the unit depends on.

**Local stack**:
All units plus reverse proxy and relational database, started by one command on a developer machine.
*Avoid*: dev environment

**Track**:
One person's exclusive part of a feature: own paths, own plan file, own issues. Tracks meet only at interfaces fixed in the concept document.
*Avoid*: area, workstream
