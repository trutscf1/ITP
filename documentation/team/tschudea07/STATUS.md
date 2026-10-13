---
doc: status
format: engineering-human/2
title: Status of one developer
audience: [developer, agent]
handle: "tschudea07"
---
# Status — tschudea07

Session positions of one developer (P-TEAM-3). Precise enough that a fresh session — this developer's or a new owner's — can continue without chat history. The team-wide entry point is `documentation/ROADMAP-DETAILS.md`; it links here and never copies these positions.

## Current positions

| Feature | Concept document | Phase | Branch | MR | Next step |
| --- | --- | --- | --- | --- | --- |
| Scaffolding & shared contracts (R1), track Identity & CI | [concepts/scaffolding.track-identity-ci.md](../../concepts/scaffolding.track-identity-ci.md) | 7, delivery | — | — | SCF-US-5 (#42, #104) and SCF-US-6 (#44) merged into `dev`: the pipeline runs all checks and scans, commit messages are checked, a SemVer tag publishes the GitLab Release; the CI part of the track is done. Next: the `identity` unit with the Identity concept (R3). The exceptions in `.trivyignore` expire on 2026-11-23: by then #103 replaces the images or the entries are renewed with a reason |
| Identity: accounts, external login, MFA (R3) | [concepts/identity.md](../../concepts/identity.md) | 1, grill (draft) | — | — | Review the draft and its work items, then grill it with `/engineering-human identity` |
| Teams, roles, inherited permissions, quotas, audit log (R7) | [concepts/teams-permissions.md](../../concepts/teams-permissions.md) | 1, grill (draft) | — | — | Review the draft and its work items, then grill it with `/engineering-human teams-permissions` |
| Share links with password and expiry (R8) | [concepts/share-links.md](../../concepts/share-links.md) | 1, grill (draft) | — | — | Review the draft and its work items, then grill it with `/engineering-human share-links` |
| Deployment: automatic deploy on push to `main`, TLS (R14) | [concepts/deployment.md](../../concepts/deployment.md) | 1, grill (draft) | — | — | Review the draft and its work items, then grill it with `/engineering-human deployment` |

Sprint 1 (until 2026-10-26), GitLab issues: #42, #44 (shared: #38, #39, #40, #85); #2 Corporate Identity.

## Open questions waiting for others

| Question | Waiting for (handle) | Since |
| --- | --- | --- |
| — | — | — |
