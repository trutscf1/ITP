---
doc: concept
format: gam-ai-knowledge/1
title: "Teams, roles, inherited permissions, quotas, audit log"
audience: [product, developer, reviewer, agent]
id-prefix: "TPM"
serves: "G-1"
---
# Teams, roles, inherited permissions, quotas, audit log Concept

The specification of roadmap feature R7, for its owner, its reviewers, and the agents that will implement it. **This is a first draft made on 2026-10-06 from the team's tracker issues, before any grilling:** it holds the feature goal, the link to the user stories, and one requirement per acceptance criterion. Its owner (tschudea07) sharpens it with `/gam-engineering teams-permissions`.

## 0. Synthesis Context

Path A (frontloaded). Phase 1 (grill) has not started; nothing in this document is approved.

Open before Phase 4: the requirements below repeat their acceptance criterion one to one and still name technology, which belongs in `STACK.md` (P-DES-4); user interaction, non-functional, and capability requirements, the data model, error conditions, worked examples, architecture, and the test concept (§5–§17) are not written yet.

## 1. Purpose & Goal Trace

**Feature goal:** Team admins control who may read, write, and manage which folders, limit storage, and see who did what, so that shared data stays under control.

**Serves:** `G-1` in [GOAL.md](../GOAL.md), as stated in the *Serves* column of [ROADMAP.md](../ROADMAP.md).

## 3. User Stories & Acceptance Criteria

The user stories and their acceptance criteria are the work items in [work-items/E07-teams-permissions/](../work-items/E07-teams-permissions/epic.md); they are not repeated here (P-DOC-6).

## 4. Functional Requirements

Draft, derived one to one from the acceptance criteria.

| ID | Title | Requirement | Derives from |
| --- | --- | --- | --- |
| TPM-F-1 | Roles | Given a team, when a member is given a role, the system MUST ensure that the role is one of Owner, Admin, Editor, or Viewer, each with documented rights. | TPM-AC-1.1 (Roles) |
| TPM-F-2 | Invitation | Given a team owner, when they invite a person by e-mail, the system MUST ensure that the person receives an invitation that expires after 7 days. | TPM-AC-1.2 (Invitation) |
| TPM-F-3 | Manage members | Given a team with several members, when an owner or admin changes a role or removes a member, the system MUST ensure that the change takes effect, and the last owner cannot be removed. | TPM-AC-1.3 (Manage members) |
| TPM-F-4 | Team root folder | Given a new team, when it is created, the system MUST ensure that the team has its own root folder. | TPM-AC-1.4 (Team root folder) |
| TPM-F-5 | Server-side check | Given a member without the required right, when they call the action directly, bypassing the interface, the system MUST ensure that the server rejects it. | TPM-AC-1.5 (Server-side check) |
| TPM-F-6 | Permission levels | Given a folder, when a team admin grants a permission, the system MUST ensure that read, write, or manage can be granted per folder to single members or to roles. | TPM-AC-2.1 (Permission levels) |
| TPM-F-7 | Inheritance | Given a folder with a granted permission, when a member opens a subfolder, the system MUST ensure that the subfolder inherits the permission, unless the inheritance is overridden for that folder. | TPM-AC-2.2 (Inheritance) |
| TPM-F-8 | Effective permission | Given a member and a folder, when a team admin opens the folder's permissions, the system MUST ensure that the member's effective permission is shown. | TPM-AC-2.3 (Effective permission) |
| TPM-F-9 | Central check | Given any storage endpoint, when a request arrives, the system MUST ensure that the endpoint uses the one central permission check. | TPM-AC-2.4 (Central check) |
| TPM-F-10 | Tested rules | Given the permission check, when the unit tests run, the system MUST ensure that they cover inheritance and overriding. | TPM-AC-2.5 (Tested rules) |
| TPM-F-11 | Configurable quota | Given a member or a team, when a team admin sets a quota, the system MUST ensure that the quota applies, and without one the default from `.env` applies. | TPM-AC-3.1 (Configurable quota) |
| TPM-F-12 | Upload over quota | Given a member whose upload would exceed the quota, when they start the upload, the system MUST ensure that it is rejected before the upload with a clear message. | TPM-AC-3.2 (Upload over quota) |
| TPM-F-13 | Usage display | Given a member or team with stored files, when they open the storage overview, the system MUST ensure that the current usage is shown as a progress bar. | TPM-AC-3.3 (Usage display) |
| TPM-F-14 | Deduplicated files | Given the project documentation, when a reader looks up quotas, the system MUST ensure that it documents how deduplicated files are counted. | TPM-AC-3.4 (Deduplicated files) |
| TPM-F-15 | Logged actions | Given a team, when a member logs in, uploads, downloads, deletes, shares, or changes permissions, the system MUST ensure that the action is written to the audit log. | TPM-AC-4.1 (Logged actions) |
| TPM-F-16 | Entry content | Given an audit log entry, when it is written, the system MUST ensure that it holds time, member, action, affected resource, and IP address. | TPM-AC-4.2 (Entry content) |
| TPM-F-17 | Team log | Given a team admin, when they open the team's audit log, the system MUST ensure that they see the entries and can filter them by member, action, and period. | TPM-AC-4.3 (Team log) |
| TPM-F-18 | Immutable entries | Given an audit log entry, when anyone tries to change or delete it through the application, the system MUST ensure that the application offers no way to do so. | TPM-AC-4.4 (Immutable entries) |
| TPM-F-19 | Retention | Given entries older than the configurable retention period, when the cleanup job runs, the system MUST ensure that they are removed. | TPM-AC-4.5 (Retention) |
