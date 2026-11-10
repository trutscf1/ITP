---
doc: concept
format: gam-ai-knowledge/1
title: "Offline mode: installable web app with sync and conflict handling"
audience: [product, developer, reviewer, agent]
id-prefix: "OFF"
serves: "G-1"
---
# Offline mode: installable web app with sync and conflict handling Concept

The specification of roadmap feature R12, for its owner, its reviewers, and the agents that will implement it. **This is a first draft made on 2026-10-06 from the team's tracker issues, before any grilling:** it holds the feature goal, the link to the user stories, and one requirement per acceptance criterion. Its owner (trutscf1) sharpens it with `/gam-engineering offline-mode`.

## 0. Synthesis Context

Path A (frontloaded). Phase 1 (grill) has not started; nothing in this document is approved.

Open before Phase 4: the requirements below repeat their acceptance criterion one to one and still name technology, which belongs in `STACK.md` (P-DES-4); user interaction, non-functional, and capability requirements, the data model, error conditions, worked examples, architecture, and the test concept (§5–§17) are not written yet.

## 1. Purpose & Goal Trace

**Feature goal:** Members install the web app, keep selected files available offline, and get their offline changes synchronized without losing data.

**Serves:** `G-1` in [GOAL.md](../GOAL.md), as stated in the *Serves* column of [ROADMAP.md](../ROADMAP.md).

## 3. User Stories & Acceptance Criteria

The user stories and their acceptance criteria are the work items in [work-items/offline-mode/](../work-items/offline-mode/feature.md); they are not repeated here (P-DOC-6).

## 4. Functional Requirements

Draft, derived one to one from the acceptance criteria.

| ID | Title | Requirement | Derives from |
| --- | --- | --- | --- |
| OFF-F-1 | Manifest | Given the web client, when a browser reads the web app manifest, the system MUST ensure that it holds name, icons, and theme colour. | OFF-AC-1.1 (Manifest) |
| OFF-F-2 | Start without network | Given an installed app whose service worker cached the app shell, when a member starts it without a network, the system MUST ensure that the app starts. | OFF-AC-1.2 (Start without network) |
| OFF-F-3 | Installation | Given a member, when they install the app in Chrome or Edge, or through "Add to Home Screen" on iOS, the system MUST ensure that the installation works. | OFF-AC-1.3 (Installation) |
| OFF-F-4 | Offline status | Given a member whose device is offline, when they look at the interface, the system MUST ensure that the offline status is shown. | OFF-AC-1.4 (Offline status) |
| OFF-F-5 | Mark for offline | Given a file or folder, when a member chooses "available offline", the system MUST ensure that it is marked as available offline. | OFF-AC-2.1 (Mark for offline) |
| OFF-F-6 | Local storage | Given a file marked for offline, when it is synchronized, the system MUST ensure that its content is stored in the browser (Cache Storage or IndexedDB) and its metadata is replicated through CouchDB and PouchDB. | OFF-AC-2.2 (Local storage) |
| OFF-F-7 | Open offline | Given a file marked for offline on a device without a network, when a member opens it, the system MUST ensure that it can be opened and viewed. | OFF-AC-2.3 (Open offline) |
| OFF-F-8 | Usage and removal | Given a member with files marked for offline, when they open the offline overview, the system MUST ensure that the used offline storage is shown and each mark can be removed. | OFF-AC-2.4 (Usage and removal) |
| OFF-F-9 | Queue | Given a member who is offline, when they rename, move, delete, or upload, the system MUST ensure that the action is put into a queue. | OFF-AC-3.1 (Queue) |
| OFF-F-10 | Automatic sync | Given queued actions, when the connection returns, the system MUST ensure that they are synchronized automatically and the progress is visible. | OFF-AC-3.2 (Automatic sync) |
| OFF-F-11 | Conflicts | Given a file changed on the server in the meantime, when the member's queued change is synchronized, the system MUST ensure that the conflict is detected and the member chooses their own version, the server version, or keep both. | OFF-AC-3.3 (Conflicts) |
| OFF-F-12 | No data loss | Given the documented test scenarios, when they are run, the system MUST ensure that no data is lost. | OFF-AC-3.4 (No data loss) |
