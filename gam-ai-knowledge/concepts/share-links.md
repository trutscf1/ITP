---
doc: concept
format: gam-ai-knowledge/1
title: "Share links with password and expiry"
audience: [product, developer, reviewer, agent]
id-prefix: "SHR"
serves: "G-1"
---
# Share links with password and expiry Concept

The specification of roadmap feature R8, for its owner, its reviewers, and the agents that will implement it. **This is a first draft made on 2026-10-06 from the team's tracker issues, before any grilling:** it holds the feature goal, the link to the user stories, and one requirement per acceptance criterion. Its owner (tschudea07) sharpens it with `/engineering-human share-links`.

## 0. Synthesis Context

Path A (frontloaded). Phase 1 (grill) has not started; nothing in this document is approved.

Open before Phase 4: the requirements below repeat their acceptance criterion one to one and still name technology, which belongs in `STACK.md` (P-DES-4); user interaction, non-functional, and capability requirements, the data model, error conditions, worked examples, architecture, and the test concept (§5–§17) are not written yet.

## 1. Purpose & Goal Trace

**Feature goal:** Members share files and folders through protected links, so that people without an account reach exactly what was shared.

**Serves:** `G-1` in [GOAL.md](../GOAL.md), as stated in the *Serves* column of [ROADMAP.md](../ROADMAP.md).

## 3. User Stories & Acceptance Criteria

The user stories and their acceptance criteria are the work items in [work-items/share-links/](../work-items/share-links/feature.md); they are not repeated here (P-DOC-6).

## 4. Functional Requirements

Draft, derived one to one from the acceptance criteria.

| ID | Title | Requirement | Derives from |
| --- | --- | --- | --- |
| SHR-F-1 | Unguessable token | Given a file or folder, when a member creates a share link, the system MUST ensure that the link holds a random token of at least 128 bits. | SHR-AC-1.1 (Unguessable token) |
| SHR-F-2 | Password and expiry | Given a member creating a share link, when they set a password or an expiry date, the system MUST ensure that the password is stored as an Argon2id hash and the link stops working after the expiry date. | SHR-AC-1.2 (Password and expiry) |
| SHR-F-3 | Permission choice | Given a member creating a share link, when they choose the permission, the system MUST ensure that the link allows either viewing only or viewing and downloading. | SHR-AC-1.3 (Permission choice) |
| SHR-F-4 | Invalid link | Given an expired or revoked share link, when a link recipient opens it, the system MUST ensure that an understandable error page is shown. | SHR-AC-1.4 (Invalid link) |
| SHR-F-5 | Own links | Given a member with share links, when they open the overview of their links, the system MUST ensure that all their links are listed and each can be revoked. | SHR-AC-1.5 (Own links) |
| SHR-F-6 | Rate-limited password | Given a password-protected share link, when wrong passwords are entered repeatedly, the system MUST ensure that the password prompt is rate-limited. | SHR-AC-1.6 (Rate-limited password) |
