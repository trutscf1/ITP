---
doc: concept
format: engineering-human/2
title: "Identity: accounts, external login, MFA"
audience: [product, developer, reviewer, agent]
id-prefix: "IDN"
serves: "G-1"
---
# Identity: accounts, external login, MFA Concept

The specification of roadmap feature R3, for its owner, its reviewers, and the agents that will implement it. **This is a first draft made on 2026-10-06 from the team's tracker issues, before any grilling:** it holds the feature goal, the link to the user stories, and one requirement per acceptance criterion. Its owner (tschudea07) sharpens it with `/engineering-human identity`.

## 0. Synthesis Context

Path A (frontloaded). Phase 1 (grill) has not started; nothing in this document is approved.

Open before Phase 4: the requirements below repeat their acceptance criterion one to one and still name technology, which belongs in `STACK.md` (P-DES-4); user interaction, non-functional, and capability requirements, the data model, error conditions, worked examples, architecture, and the test concept (§5–§17) are not written yet.

## 1. Purpose & Goal Trace

**Feature goal:** Members register and log in with password, external account, second factor, or passkey, so that only they reach their files.

**Serves:** `G-1` in [GOAL.md](../GOAL.md), as stated in the *Serves* column of [ROADMAP.md](../ROADMAP.md).

## 3. User Stories & Acceptance Criteria

The user stories and their acceptance criteria are the work items in [work-items/identity/](../work-items/identity/feature.md); they are not repeated here (P-DOC-6).

## 4. Functional Requirements

Draft, derived one to one from the acceptance criteria.

| ID | Title | Requirement | Derives from |
| --- | --- | --- | --- |
| IDN-F-1 | Shared validation | Given the registration form (TanStack Form or React Hook Form), when a person submits it, the system MUST ensure that client and server validate the input with the same Zod rules. | IDN-AC-1.1 (Shared validation) |
| IDN-F-2 | Password rules | Given the registration form, when a person enters a password, the system MUST ensure that a password shorter than 12 characters or on a list of common passwords is rejected, and a strength indicator is shown. | IDN-AC-1.2 (Password rules) |
| IDN-F-3 | Password hashing | Given a successful registration, when the account is stored, the system MUST ensure that the password is hashed with Argon2id. | IDN-AC-1.3 (Password hashing) |
| IDN-F-4 | E-mail verification | Given a newly registered account, when the person registers, the system MUST ensure that they receive a confirmation e-mail with a time-limited link, and login is possible only after verification. | IDN-AC-1.4 (E-mail verification) |
| IDN-F-5 | Captcha | Given the registration endpoint, when a registration is submitted, the system MUST ensure that the captcha (Cloudflare Turnstile or reCAPTCHA v3) is checked on the server, unless it is switched off by `.env` for offline operation. | IDN-AC-1.5 (Captcha) |
| IDN-F-6 | No account disclosure | Given an e-mail address that is already registered, when a person registers with it, the system MUST ensure that the error message does not reveal whether the address is registered. | IDN-AC-1.6 (No account disclosure) |
| IDN-F-7 | Password login | Given a verified account, when the member enters e-mail address and password, the system MUST ensure that they are logged in through Better Auth (≥ 1.76). | IDN-AC-2.1 (Password login) |
| IDN-F-8 | Server-side sessions | Given a logged-in member whose session is stored in Redis, when they log out, the system MUST ensure that the session is invalidated on the server. | IDN-AC-2.2 (Server-side sessions) |
| IDN-F-9 | Rate limiting | Given an IP address or an account, when 5 failed login attempts happen within one minute, the system MUST ensure that that IP address or account is locked temporarily. | IDN-AC-2.3 (Rate limiting) |
| IDN-F-10 | Protected routes | Given a person who is not logged in, when they open a protected route secured by `proxy.ts`, the system MUST ensure that they are redirected to the login page. | IDN-AC-2.4 (Protected routes) |
| IDN-F-11 | Generic error | Given the login form, when a person enters wrong credentials, the system MUST ensure that a generic error message appears. | IDN-AC-2.5 (Generic error) |
| IDN-F-12 | Provider buttons | Given the login page, when it is shown, the system MUST ensure that a login button is visible for each of the three providers that is configured in `.env`, and for no other. | IDN-AC-3.1 (Provider buttons) |
| IDN-F-13 | Account on first login | Given a person without an account, when they log in through an OAuth provider for the first time, the system MUST ensure that the account is created together with its own `users` row. | IDN-AC-3.2 (Account on first login) |
| IDN-F-14 | Link and unlink | Given a member in the account settings, when they link an OAuth provider to their existing account or unlink it, the system MUST ensure that the link is created or removed. | IDN-AC-3.3 (Link and unlink) |
| IDN-F-15 | Cancelled login | Given a person at the provider's page, when they cancel the login, the system MUST ensure that the login page shows an understandable message. | IDN-AC-3.4 (Cancelled login) |
| IDN-F-16 | Activation | Given a member in the security settings, when they scan the QR code and enter a valid code, the system MUST ensure that TOTP is activated. | IDN-AC-4.1 (Activation) |
| IDN-F-17 | Code at login | Given a member with TOTP activated, when they log in with their password, the system MUST ensure that the TOTP code is requested. | IDN-AC-4.2 (Code at login) |
| IDN-F-18 | Backup codes | Given a member activating TOTP, when the activation succeeds, the system MUST ensure that 10 single-use backup codes are generated and shown exactly once. | IDN-AC-4.3 (Backup codes) |
| IDN-F-19 | Deactivation | Given a member with TOTP activated, when they deactivate it, the system MUST ensure that their password and a current code are required. | IDN-AC-4.4 (Deactivation) |
| IDN-F-20 | Encrypted secrets | Given an activated TOTP, when its secret is stored, the system MUST ensure that the secret is encrypted with AES-256-GCM, with the key from `.env` or a vault. | IDN-AC-4.5 (Encrypted secrets) |
| IDN-F-21 | Manage passkeys | Given a member in the account settings, when they register, name, or delete a passkey, the system MUST ensure that the passkey is added, renamed, or removed. | IDN-AC-5.1 (Manage passkeys) |
| IDN-F-22 | Browser support | Given a member with a registered passkey, when they log in with it in a current version of Chrome, Firefox, or Safari, the system MUST ensure that the login succeeds. | IDN-AC-5.2 (Browser support) |
| IDN-F-23 | Several passkeys | Given a member with one passkey, when they register another one, the system MUST ensure that both passkeys work for the account. | IDN-AC-5.3 (Several passkeys) |
| IDN-F-24 | Counts as MFA | Given a member with multi-factor authentication required, when they log in with a passkey, the system MUST ensure that the multi-factor requirement counts as fulfilled. | IDN-AC-5.4 (Counts as MFA) |
| IDN-F-25 | Limited link | Given a member who requested a reset, when they receive the link, the system MUST ensure that the link is valid for 30 minutes and can be used once. | IDN-AC-6.1 (Limited link) |
| IDN-F-26 | Same password rules | Given the reset form, when the member sets a new password, the system MUST ensure that the same password rules as at registration apply. | IDN-AC-6.2 (Same password rules) |
| IDN-F-27 | Sessions ended | Given a member with active sessions, when the password is reset, the system MUST ensure that all existing sessions are ended. | IDN-AC-6.3 (Sessions ended) |
| IDN-F-28 | Identical answer | Given the reset request form, when a person enters any e-mail address, the system MUST ensure that the answer is identical whether the address exists or not. | IDN-AC-6.4 (Identical answer) |
| IDN-F-29 | Protected endpoint | Given the reset endpoint, when requests arrive, the system MUST ensure that the endpoint is rate-limited and protected by captcha. | IDN-AC-6.5 (Protected endpoint) |
