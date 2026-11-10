---
doc: feature
format: gam-ai-knowledge/1
title: "Identity: accounts, external login, MFA"
audience: [product, developer, reviewer, agent]
id-prefix: "IDN"
concept: "identity.md"
---
# Identity: accounts, external login, MFA

The parent work item of this feature: its user stories in the order they are built, each with its acceptance criteria in its own file. Read it to see what the feature delivers and how far the work is cut; the behavior itself is specified in the concept document (P-DOC-6).

- **Concept document:** [`concepts/identity.md`](../../concepts/identity.md) — feature goal in §1
- **Feature issue:** #89 (an issue labelled `type::feature`; to be promoted to a group epic, see `WORKFLOW.md`, "Mode")
- **Roadmap:** R3, owner tschudea07

## User stories

In dependency order; each file holds the story, its acceptance criteria, and its slices.

1. [IDN-US-1 Register by e-mail](IDN-US-1-register-by-e-mail.md)
2. [IDN-US-2 Log in and log out with rate limiting](IDN-US-2-log-in-and-log-out-with-rate-limiting.md)
3. [IDN-US-3 Log in with OAuth2 (GitHub, Google, Microsoft)](IDN-US-3-log-in-with-oauth2-github-google-microsoft.md)
4. [IDN-US-4 Two-factor authentication with TOTP](IDN-US-4-two-factor-authentication-with-totp.md)
5. [IDN-US-5 Log in with passkeys (WebAuthn)](IDN-US-5-log-in-with-passkeys-webauthn.md)
6. [IDN-US-6 Reset the password](IDN-US-6-reset-the-password.md)
7. [IDN-US-7 Operator role and session check](IDN-US-7-operator-role-and-session-check.md) — draft
8. [IDN-US-8 Delete my account](IDN-US-8-delete-my-account.md) — draft

Ready for generation (2026-11-03): IDN-US-1, IDN-US-2, IDN-US-6. IDN-US-3 to -5, -7, -8 are grilled before Sprint 3 (concept, Q3).
