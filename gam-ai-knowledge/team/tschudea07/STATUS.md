---
doc: status
format: gam-ai-knowledge/1
title: Status of one developer
audience: [developer, agent]
handle: "tschudea07"
---
# Status — tschudea07

Session positions of one developer (P-TEAM-3). Precise enough that a fresh session — this developer's or a new owner's — can continue without chat history. The team-wide entry point is `gam-ai-knowledge/ROADMAP-DETAILS.md`; it links here and never copies these positions.

## Current positions

| Feature | Concept document | Phase | Branch | MR | Next step |
| --- | --- | --- | --- | --- | --- |
| Migration to the gam-engineering skills (no roadmap feature) | [ADR-0008](../../adr/0008-adopt-the-gam-engineering-skills.md) | done, in `dev` | — | !52 | Rename the GitLab label `type::feature` to `type::epic`, decide the pipeline merge (`/gam-engineering pipeline`) and the frontend offer (`/gam-engineering frontend`) |
| Scaffolding & shared contracts (R1), track Identity & CI | [concepts/scaffolding.track-identity-ci.md](../../concepts/scaffolding.track-identity-ci.md) | 7, delivery | — | — | SCF-US-5 (#42, #104) and SCF-US-6 (#44) merged into `dev`: the pipeline runs all checks and scans, commit messages are checked, a SemVer tag publishes the GitLab Release; the CI part of the track is done. Next: the `identity` unit with the Identity concept (R3). The container scan also builds and scans the images the stack builds (#149, merged); new findings of 2026-11-10 are fixed or excepted (#160, merged). The exceptions in `.trivyignore` and `.trivyignore.d/` expire on 2026-11-23: by then #103 replaces the images, #157 (`trutscf1`) fixes the `web` image and the Prisma CLI findings of `db-migrate`, or the entries are renewed with a reason |
| Identity: accounts, external login, MFA (R3) | [concepts/identity.md](../../concepts/identity.md) | 7, delivery: IDN-US-1 in progress (slice 1 in !62 under review: race fix, address signs, DoD 17 deviation; slice 2 #168 for `schwaigc`); IDN-US-2 in progress (slice 1 in !64, stacked on !62: login with locks counted before the password check, logout, session check with renewal, `TRUSTED_PROXY`; slice 2 #169 for `schwaigc`); IDN-US-6 in progress (slice 1 in !66, stacked on !64: reset request and new password that ends every session; slice 2 #170 for `schwaigc`); 1 for IDN-US-3, -4, -5, -7, -8. ROADMAP stage `in progress`; the draft stories have planned test rows IDN-T-29 to T-45 (Q350) | — | MRs of #46 and #50 (stacked on !62) | Merge !62, then the MR of #46, then the MR of #50, each retargeted to `dev`; then `implement` #167 (deferred review points of #45); `/gam-engineering tickets identity` (slices 2 for `schwaigc`). Before Sprint 3: grill IDN-US-3, -4, -5, -7, -8. Ask the teacher whether "better-auth ≥1.76" means 1.7.6 (ADR-0009) |
| Teams, roles, inherited permissions, quotas, audit log (R7) | [concepts/teams-permissions.md](../../concepts/teams-permissions.md) | 1, grill (draft) | — | — | Review the draft and its work items, then grill it with `/gam-engineering teams-permissions` |
| Share links with password and expiry (R8) | [concepts/share-links.md](../../concepts/share-links.md) | 1, grill (draft) | — | — | Review the draft and its work items, then grill it with `/gam-engineering share-links` |
| Deployment: automatic deploy on push to `main`, TLS (R14) | [concepts/deployment.md](../../concepts/deployment.md) | 1, grill (draft) | — | — | Review the draft and its work items, then grill it with `/gam-engineering deployment` |

Sprint 1 (until 2026-11-02), GitLab issues: #42, #44, #102, #104 done; #41 in review (!27); shared: #38, #39, #85 done, #40 (!29) and #103 (!30) approved, waiting for the merge. #2 Corporate Identity moved to Sprint 3. Next: Sprint 2 IDN-US-1, -2, -6 (#45, #46, #50); plan in `ROADMAP.md`, chapter "Milestones".

## Open questions waiting for others

| Question | Waiting for (handle) | Since |
| --- | --- | --- |
| !27 (#41, SCF-US-4): Vertabelo export, Prisma RC deviation, `.env.example` — then re-review and approval | trutscf1 | 2026-11-02 |
| !22 (R2 Phase 4 gate): confirm Q4, Q12, Q22, Q31, fix OBS-AC-1.4 vs OBS-F-4 — then re-review | trutscf1 | 2026-11-02 |
| !29 (#40): agreement to the export `./web` in `packages/contracts/package.json`; then merge !29 before !30 (both approved by `tschudea07`) | schauby1 | 2026-11-02 |
