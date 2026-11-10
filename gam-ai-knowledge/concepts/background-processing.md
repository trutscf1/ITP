---
doc: concept
format: gam-ai-knowledge/1
title: "Background processing: thumbnails, virus scan, OCR, scheduled jobs"
audience: [product, developer, reviewer, agent]
id-prefix: "BGP"
serves: "G-1"
---
# Background processing: thumbnails, virus scan, OCR, scheduled jobs Concept

The specification of roadmap feature R9, for its owner, its reviewers, and the agents that will implement it. **This is a first draft made on 2026-10-06 from the team's tracker issues, before any grilling:** it holds the feature goal, the link to the user stories, and one requirement per acceptance criterion. Its owner (schauby1) sharpens it with `/gam-engineering background-processing`.

## 0. Synthesis Context

Path A (frontloaded). Phase 1 (grill) has not started; nothing in this document is approved.

Open before Phase 4: the requirements below repeat their acceptance criterion one to one and still name technology, which belongs in `STACK.md` (P-DES-4); user interaction, non-functional, and capability requirements, the data model, error conditions, worked examples, architecture, and the test concept (§5–§17) are not written yet.

## 1. Purpose & Goal Trace

**Feature goal:** Uploaded files are scanned for malware and get thumbnails and recognized text in the background, so that they are safe and easy to find.

**Serves:** `G-1` in [GOAL.md](../GOAL.md), as stated in the *Serves* column of [ROADMAP.md](../ROADMAP.md).

## 3. User Stories & Acceptance Criteria

The user stories and their acceptance criteria are the work items in [work-items/background-processing/](../work-items/background-processing/feature.md); they are not repeated here (P-DOC-6).

## 4. Functional Requirements

Draft, derived one to one from the acceptance criteria.

| ID | Title | Requirement | Derives from |
| --- | --- | --- | --- |
| BGP-F-1 | Worker service | Given the running stack, when it starts, the system MUST ensure that BullMQ with Redis and a worker service in its own container are running. | BGP-AC-1.1 (Worker service) |
| BGP-F-2 | Processing chain | Given a file, when its upload succeeds, the system MUST ensure that the chain virus scan → thumbnail → OCR → indexing starts. | BGP-AC-1.2 (Processing chain) |
| BGP-F-3 | Retries | Given a job that fails, when it is retried with backoff, the system MUST ensure that after at most 3 attempts it is marked as failed. | BGP-AC-1.3 (Retries) |
| BGP-F-4 | Processing status | Given a file being processed, when a client asks the API, the system MUST ensure that the processing status of the file is returned. | BGP-AC-1.4 (Processing status) |
| BGP-F-5 | Scheduled jobs | Given the recurring jobs (cleanup, expiry of links and trash), when the worker starts, the system MUST ensure that they are registered in one central place. | BGP-AC-1.5 (Scheduled jobs) |
| BGP-F-6 | Scan every file | Given a new file, when it is uploaded, the system MUST ensure that it is scanned with ClamAV. | BGP-AC-2.1 (Scan every file) |
| BGP-F-7 | Quarantine | Given a file found infected, when the scan finishes, the system MUST ensure that the file is put into quarantine and can be neither downloaded nor shared. | BGP-AC-2.2 (Quarantine) |
| BGP-F-8 | Visible notice | Given a quarantined file, when a member sees it in the list, the system MUST ensure that a clear notice is shown on that file. | BGP-AC-2.3 (Visible notice) |
| BGP-F-9 | Definitions | Given the virus definitions, when the system is online, the system MUST ensure that they update automatically, and offline the scan uses the existing definitions. | BGP-AC-2.4 (Definitions) |
| BGP-F-10 | EICAR test | Given the EICAR test file, when it is uploaded, the system MUST ensure that it is detected as infected. | BGP-AC-2.5 (EICAR test) |
| BGP-F-11 | Supported formats | Given a JPG, PNG, WebP, GIF, PDF, or video file, when it is processed, the system MUST ensure that thumbnails in two sizes are created (first page for PDF, still image for video). | BGP-AC-3.1 (Supported formats) |
| BGP-F-12 | Generated in the worker | Given a file to be processed, when the thumbnail job runs in the worker, the system MUST ensure that the thumbnails are stored in object storage. | BGP-AC-3.2 (Generated in the worker) |
| BGP-F-13 | Placeholder icon | Given a file without a thumbnail yet, when a member sees it in the list, the system MUST ensure that an icon matching the file type is shown. | BGP-AC-3.3 (Placeholder icon) |
| BGP-F-14 | Caching | Given a thumbnail, when it is delivered, the system MUST ensure that the response carries cache headers. | BGP-AC-3.4 (Caching) |
| BGP-F-15 | Languages and formats | Given an image or a scanned PDF in German or English, when it is processed, the system MUST ensure that Tesseract recognizes its text. | BGP-AC-4.1 (Languages and formats) |
| BGP-F-16 | Stored text | Given a file with recognized text, when OCR finishes, the system MUST ensure that the text is stored with the file in MongoDB. | BGP-AC-4.2 (Stored text) |
| BGP-F-17 | Local only | Given a file to be processed, when OCR runs, the system MUST ensure that it runs completely locally, without an external service. | BGP-AC-4.3 (Local only) |
| BGP-F-18 | Size limit | Given a file above the configurable size limit, when it is processed, the system MUST ensure that OCR is skipped for it. | BGP-AC-4.4 (Size limit) |
