---
doc: context
format: engineering-human/2
title: Glossary
audience: [product, developer, reviewer, agent]
---
# Cloud Storage Platform — Glossary

The shared words of this project, for everyone who writes or reads its documents, issues, code, and tests. Every document and every agent uses these terms exactly; a word listed under *Avoid* is never used for the same concept (P-DOC-2, P-HUM-2). Maintained with `/domain-modeling` as terms are resolved.

## Language

**stash**:
The name of the product: the self-hosted cloud storage platform this project builds. Stories and pages name the product only by this word.
*Avoid*: Nimbus, the cloud, the app

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
All units plus the reverse proxy and the data services (databases, stores, virus scanner), started by one command on a developer machine.
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

**Telemetry**:
The metrics, log entries, and traces a unit reports about its own running behaviour. It holds no data that identifies a person.
*Avoid*: monitoring data, analytics

**Observability stack**:
The containers that collect, keep, and show telemetry: a collector, a metric store, a log store, a trace store, and a dashboard tool. It is infrastructure of the local stack, not a unit, and starts with it unless an operator switches its profile off.
*Avoid*: monitoring stack, observability service

**Trace**:
The record of one request or job across all units it passes, made of timed steps that share one trace ID.
*Avoid*: request log, call chain

**Operations dashboard**:
A page of the dashboard tool that shows telemetry to operators. It is not the dashboard of a member, which is the start page of the web client.
*Avoid*: dashboard (alone), monitoring page

**Alert rule**:
A condition on telemetry that is checked at a fixed interval; while it holds, its alert is firing and shown in the alert list of the dashboard tool.
*Avoid*: alarm, notification

**Member**:
A person with a confirmed account of an installation of stash (role `R-1` in `GOAL.md`).
*Avoid*: user (alone), customer

**Account**:
The record by which `identity` knows a member: display name, e-mail address, whether the address is confirmed, and the member's credentials. One account belongs to exactly one member.
*Avoid*: profile, login

**Session**:
The state of being logged in on one device, from a successful login until logout, expiry, or a password reset.
*Avoid*: login (as a noun), token

**Confirmation link**:
The single-use link in the e-mail after registration that proves the member owns the e-mail address.
*Avoid*: activation link, verification mail

**Reset link**:
The single-use link in the e-mail that lets a member set a new password.
*Avoid*: recovery link

**Lock**:
A temporary block of logins from one IP address, or of the password login of one account, after too many failed logins.
*Avoid*: ban, suspension

**Bot check**:
The check before registration and password reset that the request comes from a person, switched off when the system runs without internet.
*Avoid*: captcha (in documents), robot test

**Operator role**:
The right of an account to open the operations dashboards; given to accounts whose address the operator lists in the configuration.
*Avoid*: admin, superuser
