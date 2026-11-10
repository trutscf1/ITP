---
doc: backlog
format: gam-ai-knowledge/1
title: Product backlog
audience: [product, developer, reviewer, agent]
---
# Product backlog

Every user story that is not done yet, across all epics, in the order it will be built. Read it to see what comes next; ROADMAP.md orders the epics, this file orders their stories (P-DOC-8).

The story files are the source: their `status` and `sprint` fields decide what stands here, and a row is updated in the same step as its story file. A story leaves the table when it reaches the integration branch (`done`; `dev`, or `main` in branch model trunk).

| # | Story | Epic | Status | Sprint | Weight | Issue |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | [SCF-US-4 Data model and relational schema](E01-scaffolding/SCF-US-4-data-model-and-relational-schema.md) | E01 Scaffolding & shared contracts | in-progress | 2 | 5 | #41 |
| 2 | [SCF-US-8 Units reachable and visible](E01-scaffolding/SCF-US-8-units-reachable-and-visible.md) | E01 Scaffolding & shared contracts | backlog | — | — | — |
| 3 | [OBS-US-1 Telemetry of every unit](E02-observability/OBS-US-1-telemetry-of-every-unit.md) | E02 Observability baseline | review | 2 | 8 | #82 |
| 4 | [OBS-US-2 Operations dashboards and alerts](E02-observability/OBS-US-2-operations-dashboards-and-alerts.md) | E02 Observability baseline | review | 2 | 5 | #83 |
| 5 | [IDN-US-1 Register by e-mail](E03-identity/IDN-US-1-register-by-e-mail.md) | E03 Identity: accounts, external login, MFA | ready | 2 | 5 | #45 |
| 6 | [IDN-US-2 Log in and log out with rate limiting](E03-identity/IDN-US-2-log-in-and-log-out-with-rate-limiting.md) | E03 Identity: accounts, external login, MFA | ready | 2 | 3 | #46 |
| 7 | [IDN-US-3 Log in with OAuth2 (GitHub, Google, Microsoft)](E03-identity/IDN-US-3-log-in-with-oauth2-github-google-microsoft.md) | E03 Identity: accounts, external login, MFA | backlog | 3 | 3 | #47 |
| 8 | [IDN-US-4 Two-factor authentication with TOTP](E03-identity/IDN-US-4-two-factor-authentication-with-totp.md) | E03 Identity: accounts, external login, MFA | backlog | 3 | 3 | #48 |
| 9 | [IDN-US-5 Log in with passkeys (WebAuthn)](E03-identity/IDN-US-5-log-in-with-passkeys-webauthn.md) | E03 Identity: accounts, external login, MFA | backlog | 3 | 3 | #49 |
| 10 | [IDN-US-6 Reset the password](E03-identity/IDN-US-6-reset-the-password.md) | E03 Identity: accounts, external login, MFA | ready | 2 | 2 | #50 |
| 11 | [IDN-US-7 Operator role and session check](E03-identity/IDN-US-7-operator-role-and-session-check.md) | E03 Identity: accounts, external login, MFA | backlog | — | 2 | — |
| 12 | [IDN-US-8 Delete my account](E03-identity/IDN-US-8-delete-my-account.md) | E03 Identity: accounts, external login, MFA | backlog | — | 3 | — |
| 13 | [DSA-US-2 Accessibility modes](E04-design-system/DSA-US-2-accessibility-modes.md) | E04 Design system & accessibility modes | in-progress | 2 | 5 | #71 |
| 14 | [DSA-US-3 Keyboard operation and screen reader support](E04-design-system/DSA-US-3-keyboard-operation-and-screen-reader-support.md) | E04 Design system & accessibility modes | ready | 3 | 5 | #72 |
| 15 | [STO-US-1 Connect the storage backend to the object storage](E05-storage-core/STO-US-1-connect-the-storage-backend-to-the-object-storage.md) | E05 Storage core: folders, resumable upload, deduplication | ready | 2 | 5 | #56 |
| 16 | [STO-US-2 Upload files](E05-storage-core/STO-US-2-upload-files.md) | E05 Storage core: folders, resumable upload, deduplication | ready | 2 | 5 | #57 |
| 17 | [STO-US-3 Chunked upload with resume](E05-storage-core/STO-US-3-chunked-upload-with-resume.md) | E05 Storage core: folders, resumable upload, deduplication | backlog | 3 | 8 | #58 |
| 18 | [STO-US-4 Deduplication by file hash](E05-storage-core/STO-US-4-deduplication-by-file-hash.md) | E05 Storage core: folders, resumable upload, deduplication | backlog | 4 | 5 | #59 |
| 19 | [STO-US-5 Manage folders and files](E05-storage-core/STO-US-5-manage-folders-and-files.md) | E05 Storage core: folders, resumable upload, deduplication | ready | 3 | 5 | #60 |
| 20 | [STO-US-6 Trash](E05-storage-core/STO-US-6-trash.md) | E05 Storage core: folders, resumable upload, deduplication | backlog | 3 | 3 | #61 |
| 21 | [STO-US-7 Download files and folders](E05-storage-core/STO-US-7-download-files-and-folders.md) | E05 Storage core: folders, resumable upload, deduplication | ready | 3 | 3 | #62 |
| 22 | [WEB-US-1 File browser](E06-web-client/WEB-US-1-file-browser.md) | E06 Web client: dashboard, file browser, preview | backlog | 3 | 8 | #69 |
| 23 | [WEB-US-2 File preview in the browser](E06-web-client/WEB-US-2-file-preview-in-the-browser.md) | E06 Web client: dashboard, file browser, preview | backlog | 4 | 5 | #70 |
| 24 | [WEB-US-3 Account settings](E06-web-client/WEB-US-3-account-settings.md) | E06 Web client: dashboard, file browser, preview | backlog | 3 | 5 | #73 |
| 25 | [WEB-US-4 End-to-end tests of the core flows](E06-web-client/WEB-US-4-end-to-end-tests-of-the-core-flows.md) | E06 Web client: dashboard, file browser, preview | backlog | 5 | 5 | #74 |
| 26 | [TPM-US-1 Teams with roles](E07-teams-permissions/TPM-US-1-teams-with-roles.md) | E07 Teams, roles, inherited permissions, quotas, audit log | backlog | 3 | 5 | #51 |
| 27 | [TPM-US-2 Inherited folder permissions](E07-teams-permissions/TPM-US-2-inherited-folder-permissions.md) | E07 Teams, roles, inherited permissions, quotas, audit log | backlog | 5 | 8 | #52 |
| 28 | [TPM-US-3 Storage quotas](E07-teams-permissions/TPM-US-3-storage-quotas.md) | E07 Teams, roles, inherited permissions, quotas, audit log | backlog | 4 | 3 | #54 |
| 29 | [TPM-US-4 Audit log](E07-teams-permissions/TPM-US-4-audit-log.md) | E07 Teams, roles, inherited permissions, quotas, audit log | backlog | 6 | 3 | #55 |
| 30 | [SHR-US-1 Share links with password and expiry](E08-share-links/SHR-US-1-share-links-with-password-and-expiry.md) | E08 Share links with password and expiry | backlog | 6 | 5 | #53 |
| 31 | [BGP-US-1 Background processing with a job queue](E09-background-processing/BGP-US-1-background-processing-with-a-job-queue.md) | E09 Background processing: thumbnails, virus scan, OCR, scheduled jobs | backlog | 5 | 5 | #63 |
| 32 | [BGP-US-2 Virus scan of uploaded files](E09-background-processing/BGP-US-2-virus-scan-of-uploaded-files.md) | E09 Background processing: thumbnails, virus scan, OCR, scheduled jobs | backlog | 6 | 3 | #64 |
| 33 | [BGP-US-3 Generate thumbnails](E09-background-processing/BGP-US-3-generate-thumbnails.md) | E09 Background processing: thumbnails, virus scan, OCR, scheduled jobs | backlog | 6 | 3 | #65 |
| 34 | [BGP-US-4 Text recognition (OCR)](E09-background-processing/BGP-US-4-text-recognition-ocr.md) | E09 Background processing: thumbnails, virus scan, OCR, scheduled jobs | backlog | 5 | 5 | #66 |
| 35 | [SRC-US-1 Full-text search](E10-search/SRC-US-1-full-text-search.md) | E10 Full-text search | backlog | 6 | 5 | #67 |
| 36 | [PUB-US-1 Set up the headless CMS](E11-public-content/PUB-US-1-set-up-the-headless-cms.md) | E11 Public content: landing page, help center, changelog, legal pages | ready | 3 | 8 | #78 |
| 37 | [PUB-US-2 Public landing page](E11-public-content/PUB-US-2-public-landing-page.md) | E11 Public content: landing page, help center, changelog, legal pages | backlog | 4 | 3 | #79 |
| 38 | [PUB-US-3 Help center and changelog](E11-public-content/PUB-US-3-help-center-and-changelog.md) | E11 Public content: landing page, help center, changelog, legal pages | backlog | 4 | 3 | #80 |
| 39 | [PUB-US-4 Legal pages (imprint, terms, privacy)](E11-public-content/PUB-US-4-legal-pages-imprint-terms-privacy.md) | E11 Public content: landing page, help center, changelog, legal pages | ready | 3 | 3 | #81 |
| 40 | [PUB-US-5 Public pages in German and English](E11-public-content/PUB-US-5-public-pages-in-german-and-english.md) | E11 Public content: landing page, help center, changelog, legal pages | backlog | — | 3 | — |
| 41 | [OFF-US-1 Installable web app (PWA)](E12-offline-mode/OFF-US-1-installable-web-app-pwa.md) | E12 Offline mode: installable web app with sync and conflict handling | backlog | 4 | 3 | #75 |
| 42 | [OFF-US-2 Make files available offline](E12-offline-mode/OFF-US-2-make-files-available-offline.md) | E12 Offline mode: installable web app with sync and conflict handling | backlog | 5 | 8 | #76 |
| 43 | [OFF-US-3 Synchronization and conflict handling](E12-offline-mode/OFF-US-3-synchronization-and-conflict-handling.md) | E12 Offline mode: installable web app with sync and conflict handling | backlog | 6 | 8 | #77 |
| 44 | [LDT-US-1 Load tests](E13-load-tests/LDT-US-1-load-tests.md) | E13 Load tests & operations dashboards | backlog | 6 | 3 | #84 |
| 45 | [DEP-US-1 Automatic deployment on release to main](E14-deployment/DEP-US-1-automatic-deployment-on-release-to-main.md) | E14 Deployment: automatic deploy on push to main, TLS | backlog | 4 | 5 | #43 |
