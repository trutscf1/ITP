---
doc: epic
format: gam-ai-knowledge/1
title: "Background processing: thumbnails, virus scan, OCR, scheduled jobs"
audience: [product, developer, reviewer, agent]
id-prefix: "BGP"
concept: "background-processing.md"
release: "0.6.0"
shipped: ""
---
# Background processing: thumbnails, virus scan, OCR, scheduled jobs

The parent work item of this epic: its user stories in the order they are built, each with its acceptance criteria in its own file. Read it to see what the epic delivers and how far the work is cut; the behavior itself is specified in the concept document (P-DOC-6).

- **Concept document:** [`concepts/background-processing.md`](../../concepts/background-processing.md) — feature goal in §1
- **Epic issue:** #95 (an issue labelled `type::epic`, formerly `type::feature`; to be promoted to a group epic, see `WORKFLOW.md`, "Mode")
- **Roadmap:** R9, owner schauby1
- **Backlog:** the open stories of this epic stand in the [product backlog](../BACKLOG.md) (P-DOC-8)

## User stories

In dependency order; each file holds the story, its acceptance criteria, and its slices.

1. [BGP-US-1 Background processing with BullMQ](BGP-US-1-background-processing-with-bullmq.md)
2. [BGP-US-2 Virus scan of uploaded files](BGP-US-2-virus-scan-of-uploaded-files.md)
3. [BGP-US-3 Generate thumbnails](BGP-US-3-generate-thumbnails.md)
4. [BGP-US-4 Text recognition (OCR)](BGP-US-4-text-recognition-ocr.md)
