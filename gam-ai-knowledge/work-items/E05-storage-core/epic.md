---
doc: epic
format: gam-ai-knowledge/1
title: "Storage core: folders, resumable upload, deduplication"
audience: [product, developer, reviewer, agent]
id-prefix: "STO"
concept: "storage-core.md"
release: "0.4.0"
shipped: ""
---
# Storage core: folders, resumable upload, deduplication

The parent work item of this epic: its user stories in the order they are built, each with its acceptance criteria in its own file. Read it to see what the epic delivers and how far the work is cut; the behavior itself is specified in the concept document (P-DOC-6).

- **Concept document:** [`concepts/storage-core.md`](../../concepts/storage-core.md) — feature goal in §1
- **Epic issue:** #91 (an issue labelled `type::epic`, formerly `type::feature`; to be promoted to a group epic, see `WORKFLOW.md`, "Mode")
- **Roadmap:** R5, owner schauby1
- **Backlog:** the open stories of this epic stand in the [product backlog](../BACKLOG.md) (P-DOC-8)

## User stories

In dependency order; each file holds the story, its acceptance criteria, and its slices.

1. [STO-US-1 Connect the storage backend to the object storage](STO-US-1-connect-the-storage-backend-to-the-object-storage.md)
2. [STO-US-2 Upload files](STO-US-2-upload-files.md)
3. [STO-US-3 Chunked upload with resume](STO-US-3-chunked-upload-with-resume.md)
4. [STO-US-4 Deduplication by file hash](STO-US-4-deduplication-by-file-hash.md)
5. [STO-US-5 Manage folders and files](STO-US-5-manage-folders-and-files.md)
6. [STO-US-6 Trash](STO-US-6-trash.md)
7. [STO-US-7 Download files and folders](STO-US-7-download-files-and-folders.md)
