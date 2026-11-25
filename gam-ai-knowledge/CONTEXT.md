---
doc: context
format: gam-ai-knowledge/1
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
*Avoid*: login; profile (for the account itself, see *Profile*)

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

**Theme**:
One of exactly four looks of the interface: light, dark, sepia, night. A theme sets the colours of every page; high contrast, alternative colours, and reduced motion are not themes.
*Avoid*: skin, mode, colour scheme (the colour scheme is the system's light or dark setting)

**Colour mode**:
The one choice that changes the colours of the interface for readability, next to the theme: standard, high contrast, alternative colours red-green, or alternative colours blue-yellow. Exactly one is active. Its labels describe the display, never the person.
*Avoid*: accessibility mode, colour-blind mode, contrast mode

**Font size**:
One of three sizes of the text and spacing of the interface: small (87.5 %), normal (100 %), large (125 %) of the base size.
*Avoid*: text size, zoom (zoom is the browser's own setting)

**Reduced motion**:
The state in which no animation and no transition runs on any page. It is on when the member switches it on or the system asks for it.
*Avoid*: animations off, no-animation mode

**Appearance menu**:
The menu in the header of every page of the web client, shown to logged-in members and never to visitors, in which they choose theme, colour mode, font size, and reduced motion, reset each to the system, and see what is stored. It is the only place that changes these four values.
*Avoid*: accessibility menu, accessibility settings, theme switcher (the theme switcher is its theme control)

**Appearance preferences**:
The at most four values a member chose in the appearance menu: theme, colour mode, font size, reduced motion. A kind the member did not choose, or reset to the system, is not stored. They are kept in the member's profile and, while a session exists, on the device; nothing else is derived from them.
*Avoid*: accessibility settings, accessibility profile

**Profile**:
The member's own record in stash, at most one per member and separate from the account; today it holds the appearance preferences. The word names this record only, never the account.
*Avoid*: account (for this record), settings

**Offline mark**:
The choice of a member that a file or folder is available without a network on one device; a folder mark includes everything inside it.
*Avoid*: favourite, pin, sync flag

**Offline copy**:
The content of a marked file that the app keeps on the device.
*Avoid*: cache, download

**Offline overview**:
The screen that lists the offline marks of a member with the used offline storage and lets them remove each mark.
*Avoid*: offline manager

**Queued action**:
A rename, move, delete, or upload that a member made without a network and that waits to be synchronized.
*Avoid*: pending change, outbox entry

**Conflict**:
The case that a file or folder changed on the server after the revision a queued action was made against, or that its name is taken; the member chooses their version, the server version, or keeps both.
*Avoid*: merge problem, sync error

**Offline storage limit**:
The most storage that the offline copies of one device may use, set by the operator.
*Avoid*: quota (the quotas of teams are a different thing)
