---
doc: sprint
format: gam-ai-knowledge/1
title: "Sprint 3"
audience: [product, developer, reviewer, agent]
sprint: 3
---
# Sprint 3

The sprint backlog of milestone `Sprint 3`: the stories planned into this sprint and how far each has come. It stays as the record of the sprint after it ends (P-DOC-8). Save it as `sprints/sprint-3.md`.

- **Goal:** Login complete (OAuth, TOTP, passkeys); teams with roles; resumable uploads, trash, download; file browser; account settings; installable app; landing page; concept R12 with conflict rules.
- **Dates:** 2026-11-24 – 2027-01-11
- **Milestone:** `Sprint 3`

## Stories

Every story whose `sprint` field is 3, in the order of the product backlog. A story carried over to the next sprint moves to that file, and its `sprint` field follows.

| Story | Epic | Status | Weight | Issue |
| --- | --- | --- | --- | --- |
| [IDN-US-3 Log in with OAuth2 (GitHub, Google, Microsoft)](../E03-identity/IDN-US-3-log-in-with-oauth2-github-google-microsoft.md) | E03 Identity: accounts, external login, MFA | backlog | 3 | #47 |
| [IDN-US-4 Two-factor authentication with TOTP](../E03-identity/IDN-US-4-two-factor-authentication-with-totp.md) | E03 Identity: accounts, external login, MFA | backlog | 3 | #48 |
| [IDN-US-5 Log in with passkeys (WebAuthn)](../E03-identity/IDN-US-5-log-in-with-passkeys-webauthn.md) | E03 Identity: accounts, external login, MFA | backlog | 3 | #49 |
| [STO-US-3 Chunked upload with resume](../E05-storage-core/STO-US-3-chunked-upload-with-resume.md) | E05 Storage core: folders, resumable upload, deduplication | backlog | 8 | #58 |
| [STO-US-6 Trash](../E05-storage-core/STO-US-6-trash.md) | E05 Storage core: folders, resumable upload, deduplication | backlog | 3 | #61 |
| [STO-US-7 Download files and folders](../E05-storage-core/STO-US-7-download-files-and-folders.md) | E05 Storage core: folders, resumable upload, deduplication | ready | 3 | #62 |
| [WEB-US-1 File browser](../E06-web-client/WEB-US-1-file-browser.md) | E06 Web client: dashboard, file browser, preview | backlog | 8 | #69 |
| [WEB-US-3 Account settings](../E06-web-client/WEB-US-3-account-settings.md) | E06 Web client: dashboard, file browser, preview | backlog | 5 | #73 |
| [TPM-US-1 Teams with roles](../E07-teams-permissions/TPM-US-1-teams-with-roles.md) | E07 Teams, roles, inherited permissions, quotas, audit log | backlog | 5 | #51 |
| [PUB-US-1 Set up the headless CMS with Strapi](../E11-public-content/PUB-US-1-set-up-the-headless-cms-with-strapi.md) | E11 Public content: landing page, help center, changelog, legal pages | ready | 8 | #78 |
| [PUB-US-4 Legal pages (imprint, terms, privacy)](../E11-public-content/PUB-US-4-legal-pages-imprint-terms-privacy.md) | E11 Public content: landing page, help center, changelog, legal pages | ready | 3 | #81 |
