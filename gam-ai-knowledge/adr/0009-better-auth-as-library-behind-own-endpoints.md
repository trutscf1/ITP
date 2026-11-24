---
doc: adr
format: gam-ai-knowledge/1
title: "identity uses Better Auth as a library behind its own endpoints"
audience: [product, developer, reviewer, agent]
status: proposed
date: "2026-11-17"
deciders: ["tschudea07"]
overrides: []
supersedes: []
---
# ADR-0009 — identity uses Better Auth as a library behind its own endpoints

## In plain words

`identity` keeps its accounts in the tables of the authentication library Better Auth and hashes passwords through it, but answers every request with its own endpoints. The library's ready-made web endpoints are not switched on, because its confirmation link could be opened more than once.

## Context

The school requires Better Auth (`docs/anforderungen_software_projekte.md`, "better-auth ≥1.76"), and `STACK.md` §3 planned its e-mail-and-password flow with its own HTTP handler ([IDN-C-1]). While building IDN-US-1 (#45) it turned out that the library's e-mail verification link is a signed token that stays valid until it expires and is stored nowhere, so it can be opened twice. The Identity concept requires single-use confirmation and reset tokens of at least 128 random bits, stored only as a hash ([IDN-NF-5]), and a test that a second use fails ([IDN-AC-1.4] e-mail confirmation, IDN-T-4). It also requires the same answer for every registration ([IDN-F-6]) and a fixed order of throttle, bot check, and validation, which the library's handler does not offer. Decided on 2026-11-17 (Q342).

## Decision

`identity` uses Better Auth as a library: its table mapping onto `auth_users`, `auth_accounts`, and `auth_verifications`, its Argon2id password hashing ([IDN-C-2]), and its internal adapter to create, find, and delete accounts and to consume a verification row once. The endpoints of `concepts/identity.md` §8 are `identity`'s own Hono routes; tokens are created and hashed by `identity` (§8, "Confirmation tokens"); sessions live in the session store under the keys of §8. The school's version "≥1.76" is read as 1.7.6, since no release 1.76 exists; `better-auth` 1.7.19 is pinned, and the reading is confirmed with the teacher in the merge request of #45.

## Consequences

- The confirmation, reset, and registration answers follow the concept exactly and are tested at the HTTP seam.
- Accepted risk (review of !62): a registration again with the address of an unconfirmed account replaces its name and password ([IDN-F-6], A15). Someone who knows the address can therefore set the password of a pending registration of another person; the account is confirmed only through a link sent to that mailbox, every older link is deleted, and the owner who cannot log in afterwards resets the password ([IDN-F-33]). An account is never taken over after its confirmation.
- Accepted risk (review of !62): `GET /confirm` changes state, so a link scanner of a mail provider that opens the link uses it. The account is then confirmed through the owner's mailbox all the same; the person who opens the link afterwards sees the invalid-link page ([IDN-U-7]) and can log in.
- `identity` depends on the library's internal adapter, which is not a documented public interface: an update of `better-auth` must run the identity tests before it is merged, and the version stays pinned exactly.
- External login, one-time codes, and passkeys (IDN-US-3, -4, -5) are decided again when those stories are grilled: they may mount the library's plugins for their own routes where those meet the concept.

## Considered options

- **Mount the library's handler and make its links single-use.** Less own code. Rejected: it needs a store of used tokens beside the library and still leaves the token itself unhashed in the e-mail flow's state, and the answer order of IDN-F-5, IDN-F-6, and IDN-F-35 would be bent around the handler.
- **Drop Better Auth and use only an Argon2id package.** No internal-API risk. Rejected: the school requires Better Auth, and the later stories need its plugins.
