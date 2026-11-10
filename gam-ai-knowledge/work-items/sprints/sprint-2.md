---
doc: sprint
format: gam-ai-knowledge/1
title: "Sprint 2"
audience: [product, developer, reviewer, agent]
sprint: 2
---
# Sprint 2

The sprint backlog of milestone `Sprint 2`: the stories planned into this sprint and how far each has come. It stays as the record of the sprint after it ends (P-DOC-8). Save it as `sprints/sprint-2.md`.

- **Goal:** Register and log in; folders and upload; telemetry visible; accessibility modes; AC-TEST rule in doc-check.
- **Dates:** 2026-11-03 – 2026-11-23
- **Milestone:** `Sprint 2`

## Stories

Every story whose `sprint` field is 2, in the order of the product backlog. A story carried over to the next sprint moves to that file, and its `sprint` field follows.

| Story | Epic | Status | Weight | Issue |
| --- | --- | --- | --- | --- |
| [SCF-US-4 Data model and Prisma schema](../E01-scaffolding/SCF-US-4-data-model-and-prisma-schema.md) | E01 Scaffolding & shared contracts | in-progress | 5 | #41 |
| [OBS-US-1 Telemetry of every unit](../E02-observability/OBS-US-1-telemetry-of-every-unit.md) | E02 Observability baseline | review | 8 | #82 |
| [OBS-US-2 Operations dashboards and alerts](../E02-observability/OBS-US-2-operations-dashboards-and-alerts.md) | E02 Observability baseline | review | 5 | #83 |
| [IDN-US-1 Register by e-mail](../E03-identity/IDN-US-1-register-by-e-mail.md) | E03 Identity: accounts, external login, MFA | ready | 5 | #45 |
| [IDN-US-2 Log in and log out with rate limiting](../E03-identity/IDN-US-2-log-in-and-log-out-with-rate-limiting.md) | E03 Identity: accounts, external login, MFA | ready | 3 | #46 |
| [IDN-US-6 Reset the password](../E03-identity/IDN-US-6-reset-the-password.md) | E03 Identity: accounts, external login, MFA | ready | 2 | #50 |
| [DSA-US-2 Accessibility modes](../E04-design-system/DSA-US-2-accessibility-modes.md) | E04 Design system & accessibility modes | in-progress | 5 | #71 |
| [DSA-US-3 Keyboard operation and screen reader support](../E04-design-system/DSA-US-3-keyboard-operation-and-screen-reader-support.md) | E04 Design system & accessibility modes | in-progress | 5 | #72 |
| [STO-US-1 Connect the storage backend to SeaweedFS](../E05-storage-core/STO-US-1-connect-the-storage-backend-to-seaweedfs.md) | E05 Storage core: folders, resumable upload, deduplication | ready | 5 | #56 |
| [STO-US-2 Upload files](../E05-storage-core/STO-US-2-upload-files.md) | E05 Storage core: folders, resumable upload, deduplication | ready | 5 | #57 |
| [STO-US-5 Manage folders and files](../E05-storage-core/STO-US-5-manage-folders-and-files.md) | E05 Storage core: folders, resumable upload, deduplication | ready | 5 | #60 |
