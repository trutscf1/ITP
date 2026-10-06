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

**Public page**:
A page of the web client that anyone reads without an account: the landing page, a page of the help center, the changelog page, or a legal page.
*Avoid*: marketing page, static page

**Legal page**:
One of exactly three public pages every installation has: imprint, terms, privacy policy.
*Avoid*: legal notice, policy page

**Content entry**:
One piece of content a content editor maintains for a public page, in one or both content languages, as a draft or published.
*Avoid*: post, document, record

**Content language**:
A language in which public pages are written: German or English. German is the default.
*Avoid*: locale

**Editor account**:
The login of a content editor for the admin panel of the `cms` unit. It is separate from a member's account.
*Avoid*: CMS user, backend user

**CMS administrator**:
A content editor who may also create and delete editor accounts.
*Avoid*: admin, super admin

**Help context**:
A named place in the web client from which a help link starts. A help article may be assigned to it.
*Avoid*: help key, help anchor

**Legal template**:
The text of a legal page as shipped with the product: placeholders for the operator's data and a first sentence saying that it is not filled in yet.
*Avoid*: default legal text, sample text

**Built-in legal text**:
The copy of the legal templates held in the web client, shown when no content from the `cms` unit was ever loaded.
*Avoid*: fallback page

**Track**:
One person's exclusive part of a feature: own paths, own plan file, own issues. Tracks meet only at interfaces fixed in the concept document.
*Avoid*: area, workstream
