---
doc: concept
format: gam-ai-knowledge/1
title: "Storage core: folders, resumable upload, deduplication"
audience: [product, developer, reviewer, agent]
id-prefix: "STO"
serves: "G-1"
---
# Storage core: folders, resumable upload, deduplication Concept

The specification of roadmap feature R5, for its owner, its reviewers, and the agents that will implement it. **This is a first draft made on 2026-10-06 from the team's tracker issues, before any grilling:** it holds the feature goal, the link to the user stories, and one requirement per acceptance criterion. Its owner (schauby1) sharpens it with `/gam-engineering storage-core`.

## 0. Synthesis Context

Path A (frontloaded). Phase 1 (grill) has not started; nothing in this document is approved.

Open before Phase 4: the requirements below repeat their acceptance criterion one to one and still name technology, which belongs in `STACK.md` (P-DES-4); user interaction, non-functional, and capability requirements, the data model, error conditions, worked examples, architecture, and the test concept (§5–§17) are not written yet.

## 1. Purpose & Goal Trace

**Feature goal:** Members upload, organize, restore, and download files of any size, so that their data lives reliably on their own server.

**Serves:** `G-1` in [GOAL.md](../GOAL.md), as stated in the *Serves* column of [ROADMAP.md](../ROADMAP.md).

## 3. User Stories & Acceptance Criteria

The user stories and their acceptance criteria are the work items in [work-items/storage-core/](../work-items/storage-core/feature.md); they are not repeated here (P-DOC-6).

## 4. Functional Requirements

Draft, derived one to one from the acceptance criteria.

| ID | Title | Requirement | Derives from |
| --- | --- | --- | --- |
| STO-F-1 | Object storage | Given the running stack with SeaweedFS as a container, when the storage API stores a file, the system MUST ensure that it uses the S3-compatible interface of SeaweedFS. | STO-AC-1.1 (Object storage) |
| STO-F-2 | Separated data | Given a stored file, when the storage API saves it, the system MUST ensure that the content goes to object storage, the metadata to MongoDB, and structure and permissions to PostgreSQL. | STO-AC-1.2 (Separated data) |
| STO-F-3 | Documented endpoints | Given the storage API, when the OpenAPI specification is generated, the system MUST ensure that every endpoint is documented in it. | STO-AC-1.3 (Documented endpoints) |
| STO-F-4 | Protected endpoints | Given any storage endpoint, when a request arrives, the system MUST ensure that authentication and permission are checked. | STO-AC-1.4 (Protected endpoints) |
| STO-F-5 | Integration test | Given the storage API, when the integration test runs, the system MUST ensure that it stores, reads, and deletes a file. | STO-AC-1.5 (Integration test) |
| STO-F-6 | Several files | Given a member in a folder, when they upload several files at once, the system MUST ensure that each file shows its own progress. | STO-AC-2.1 (Several files) |
| STO-F-7 | Drag and drop or button | Given a member in a folder, when they drop files onto it or use the upload button with the keyboard, the system MUST ensure that the files are uploaded into the current folder. | STO-AC-2.2 (Drag and drop or button) |
| STO-F-8 | Size and type limits | Given the maximum file size and the allowed file types from `.env`, when a member uploads a file that violates them, the system MUST ensure that the server rejects the file. | STO-AC-2.3 (Size and type limits) |
| STO-F-9 | Name conflict | Given a folder that already holds a file of the same name, when a member uploads the file, the system MUST ensure that they choose between replace, keep both, and cancel. | STO-AC-2.4 (Name conflict) |
| STO-F-10 | Live list | Given a member watching a folder, when an upload finishes, the system MUST ensure that the file appears in the list without a reload. | STO-AC-2.5 (Live list) |
| STO-F-11 | Chunked protocol | Given a member uploading a file, when the upload runs, the system MUST ensure that it is sent in chunks over the tus protocol with a configurable chunk size. | STO-AC-3.1 (Chunked protocol) |
| STO-F-12 | Resume | Given an upload in progress, when the connection drops or the page is reloaded, the system MUST ensure that the upload continues where it stopped. | STO-AC-3.2 (Resume) |
| STO-F-13 | Pause | Given an upload in progress, when the member pauses and later resumes it, the system MUST ensure that the upload continues from the paused position. | STO-AC-3.3 (Pause) |
| STO-F-14 | Large files | Given a file of 5 GB, when a member uploads it, the system MUST ensure that the upload completes reliably, and the test is documented. | STO-AC-3.4 (Large files) |
| STO-F-15 | Cleanup | Given an upload that was not completed for 24 hours, when the cleanup job runs, the system MUST ensure that the unfinished upload is removed. | STO-AC-3.5 (Cleanup) |
| STO-F-16 | Hash on upload | Given a file being uploaded, when the upload completes, the system MUST ensure that a SHA-256 hash of the content is calculated. | STO-AC-4.1 (Hash on upload) |
| STO-F-17 | Reference instead of copy | Given a stored file with a given hash, when a file with the same hash is uploaded, the system MUST ensure that only a reference is created and no second object is stored. | STO-AC-4.2 (Reference instead of copy) |
| STO-F-18 | Reference counting | Given an object referenced by several files, when one of the files is deleted, the system MUST ensure that the object is kept until no reference points to it. | STO-AC-4.3 (Reference counting) |
| STO-F-19 | Invisible to members | Given two members who uploaded identical files, when either of them uses their file, the system MUST ensure that deduplication is not visible and permissions stay separate per file. | STO-AC-4.4 (Invisible to members) |
| STO-F-20 | Tested counting | Given the reference counting, when the unit tests run, the system MUST ensure that they cover it. | STO-AC-4.5 (Tested counting) |
| STO-F-21 | Nested folders | Given a member in any folder, when they create a folder inside it, the system MUST ensure that folders can be nested to any depth. | STO-AC-5.1 (Nested folders) |
| STO-F-22 | Rename, move, copy | Given a file or folder, when a member renames, moves (also by drag and drop), or copies it, the system MUST ensure that the change is applied. | STO-AC-5.2 (Rename, move, copy) |
| STO-F-23 | Name validation | Given a name with a forbidden character or over the maximum length, when a member enters it, the system MUST ensure that the shared Zod schema rejects it. | STO-AC-5.3 (Name validation) |
| STO-F-24 | Permissions respected | Given a member without write permission on a folder, when they try one of these actions there, the system MUST ensure that the action is rejected. | STO-AC-5.4 (Permissions respected) |
| STO-F-25 | Breadcrumb | Given a member inside nested folders, when they look at the page, the system MUST ensure that a breadcrumb navigation shows the current path. | STO-AC-5.5 (Breadcrumb) |
| STO-F-26 | Delete to trash | Given a file or folder, when a member deletes it, the system MUST ensure that it is moved to the trash. | STO-AC-6.1 (Delete to trash) |
| STO-F-27 | Restore | Given an item in the trash, when a member restores it, the system MUST ensure that it returns to its original place, or to the root folder if that place no longer exists. | STO-AC-6.2 (Restore) |
| STO-F-28 | Confirm final deletion | Given an item in the trash, when a member deletes it for good, the system MUST ensure that a confirmation dialog must be confirmed first. | STO-AC-6.3 (Confirm final deletion) |
| STO-F-29 | Automatic purge | Given trash entries older than 30 days (configurable), when the cleanup job runs, the system MUST ensure that they are deleted for good. | STO-AC-6.4 (Automatic purge) |
| STO-F-30 | Single file | Given a stored file, when a member downloads it, the system MUST ensure that it is delivered with the correct file name and MIME type. | STO-AC-7.1 (Single file) |
| STO-F-31 | Folder as ZIP | Given a folder or a selection of several items, when a member downloads it, the system MUST ensure that it is streamed as a ZIP archive without holding the whole archive in memory. | STO-AC-7.2 (Folder as ZIP) |
| STO-F-32 | Range requests | Given a stored file, when a client sends an HTTP range request, the system MUST ensure that the requested range is delivered. | STO-AC-7.3 (Range requests) |
| STO-F-33 | Permission check | Given any download, when it is requested, the system MUST ensure that the permission is checked for that download. | STO-AC-7.4 (Permission check) |
