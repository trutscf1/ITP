---
doc: concept
format: gam-ai-knowledge/1
title: "Full-text search"
audience: [product, developer, reviewer, agent]
id-prefix: "SRC"
serves: "G-1"
---
# Full-text search Concept

The specification of roadmap feature R10, for its owner, its reviewers, and the agents that will implement it. **This is a first draft made on 2026-10-06 from the team's tracker issues, before any grilling:** it holds the feature goal, the link to the user stories, and one requirement per acceptance criterion. Its owner (schauby1) sharpens it with `/gam-engineering search`.

## 0. Synthesis Context

Path A (frontloaded). Phase 1 (grill) has not started; nothing in this document is approved.

Open before Phase 4: the requirements below repeat their acceptance criterion one to one and still name technology, which belongs in `STACK.md` (P-DES-4); user interaction, non-functional, and capability requirements, the data model, error conditions, worked examples, architecture, and the test concept (§5–§17) are not written yet.

## 1. Purpose & Goal Trace

**Feature goal:** Members find files by name and content in under a second, and only the files they may read.

**Serves:** `G-1` in [GOAL.md](../GOAL.md), as stated in the *Serves* column of [ROADMAP.md](../ROADMAP.md).

## 3. User Stories & Acceptance Criteria

The user stories and their acceptance criteria are the work items in [work-items/E10-search/](../work-items/E10-search/epic.md); they are not repeated here (P-DOC-6).

## 4. Functional Requirements

Draft, derived one to one from the acceptance criteria.

| ID | Title | Requirement | Derives from |
| --- | --- | --- | --- |
| SRC-F-1 | Search scope | Given stored files, when a member searches for a term, the system MUST ensure that file names, metadata, and extracted text (PDF, DOCX, TXT, OCR results) are searched. | SRC-AC-1.1 (Search scope) |
| SRC-F-2 | Filters | Given a search result, when a member filters by file type, change date, or folder, the system MUST ensure that the result is narrowed accordingly. | SRC-AC-1.2 (Filters) |
| SRC-F-3 | Permission filter | Given files the member may not read, when the member searches, the system MUST ensure that the result holds only files the member has read permission for. | SRC-AC-1.3 (Permission filter) |
| SRC-F-4 | Speed | Given 10,000 stored files, when a member searches, the system MUST ensure that the result is there in under 1 second. | SRC-AC-1.4 (Speed) |
| SRC-F-5 | Highlighting | Given a search result, when it is shown, the system MUST ensure that the search term is highlighted in it. | SRC-AC-1.5 (Highlighting) |
