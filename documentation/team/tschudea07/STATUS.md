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
| Identity: accounts, external login, MFA (R3) | [concepts/identity.md](../../concepts/identity.md) | 6, ready for IDN-US-1, -2, -6; 1 for IDN-US-3, -4, -5, -7, -8 | — | — | `/engineering-human tickets identity` (slices 2 for `schwaigc`), then `implement` #45, #46, #50; slice 1 of #45 waits for the error codes in `scaffolding.md` §8 (inbox of `trutscf1`). Before Sprint 3: grill IDN-US-3, -4, -5, -7, -8 |
| Teams, roles, inherited permissions, quotas, audit log (R7) | [concepts/teams-permissions.md](../../concepts/teams-permissions.md) | 1, grill (draft) | — | — | Review the draft and its work items, then grill it with `/engineering-human teams-permissions` |
| Share links with password and expiry (R8) | [concepts/share-links.md](../../concepts/share-links.md) | 1, grill (draft) | — | — | Review the draft and its work items, then grill it with `/engineering-human share-links` |
| Deployment: automatic deploy on push to `main`, TLS (R14) | [concepts/deployment.md](../../concepts/deployment.md) | 1, grill (draft) | — | — | Review the draft and its work items, then grill it with `/engineering-human deployment` |

Sprint 1 (until 2026-11-02), GitLab issues: #42, #44, #102, #104 done; #41 in review (!27); shared: #38, #39, #85 done, #40 (!29) and #103 (!30) approved, waiting for the merge. #2 Corporate Identity moved to Sprint 3. Next: Sprint 2 IDN-US-1, -2, -6 (#45, #46, #50); plan in `ROADMAP.md`, chapter "Milestones".

## Open questions waiting for others

| Question | Waiting for (handle) | Since |
| --- | --- | --- |
| !27 (#41, SCF-US-4): Vertabelo export, Prisma RC deviation, `.env.example` — then re-review and approval | trutscf1 | 2026-11-02 |
| !22 (R2 Phase 4 gate): confirm Q4, Q12, Q22, Q31, fix OBS-AC-1.4 vs OBS-F-4 — then re-review | trutscf1 | 2026-11-02 |
| !29 (#40): agreement to the export `./web` in `packages/contracts/package.json`; then merge !29 before !30 (both approved by `tschudea07`) | schauby1 | 2026-11-02 |
