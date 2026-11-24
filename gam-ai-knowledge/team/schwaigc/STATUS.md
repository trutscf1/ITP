---
doc: status
format: gam-ai-knowledge/1
title: Status of one developer
audience: [developer, agent]
handle: "schwaigc"
---
# Status — schwaigc

Session positions of one developer (P-TEAM-3). Precise enough that a fresh session — this developer's or a new owner's — can continue without chat history. The team-wide entry point is `gam-ai-knowledge/ROADMAP-DETAILS.md`; it links here and never copies these positions.

## Current positions

| Feature | Concept document | Phase | Branch | MR | Next step |
| --- | --- | --- | --- | --- | --- |
| Scaffolding & shared contracts (R1), track Web | [concepts/scaffolding.track-web.md](../../concepts/scaffolding.track-web.md) | 7, implement (slices 1 and 2 of SCF-US-1, track plan, and M1 and M6 of SCF-US-3 (#40, `/api/docs`) in `dev`) | — | — | Slice 1 of SCF-US-8 for `web` (M2, M7, M8, M9) once its issues are cut, together with the open requests of the plan |
| Design system & accessibility modes (R4) | [concepts/design-system.md](../../concepts/design-system.md) | 4 done: concept approved, !65 merged and #116 closed on 2026-11-24 (grilled 2026-11-17, Q377–Q401; code of DSA-US-1 slices 1–2, DSA-US-2 slice 1 (#71), DSA-US-3 slice 1 (#72) in `dev` predates it, §14 lists the rework) | — | — | Ask the school management L1/L2; then `/gam-engineering tickets design-system` |
| Identity (R3), slice 2 pages in `web` | [concepts/identity.md](../../concepts/identity.md) | 7, implement (#168 IDN-US-1 slice 2 merged: `/register`, `/login?confirmed=1`, `/link-invalid`; Q407–Q410, A19–A21; IDN-US-1 done with !62) | — | — | #169 (login page, logout button, route guard), then #170 |
| Storage core (R5), taken over from `schauby1` for #56 and #117 on 2026-11-24 (Q415; `schauby1` stays owner of R5) | [concepts/storage-core.md](../../concepts/storage-core.md) | 4 done: !78 merged on 2026-11-24 with the approval of `trutscf1` (grilled 2026-11-24, Q414–Q460, `concepts/storage-core.qa-log.md`; adversarial check of §1 and Part H; the agent review of !78 left 19 Required findings, see the MR) | — | !78 (#117) | `schauby1` confirms the concept as owner of R5 and decides on the findings of the agent review of !78; ask the school management L1; then `/gam-engineering tickets storage-core` (re-estimate weights, A26), then `/gam-engineering implement 56` |
| Web client: dashboard, file browser, preview (R6) | [concepts/web-client.md](../../concepts/web-client.md) | 1, grill (draft) | — | — | Review the draft and its work items, then grill it with `/gam-engineering web-client` |

Sprint 1 (until 2026-11-02), GitLab issues: #68, #102, #106, #40, and #103 done (!7 and !9 merged on 2026-10-28, !29 and !30 on 2026-11-02, #85 with !5 on 2026-10-27; shared: #38, #39); #2 Corporate Identity moves to Sprint 3. Next: Sprint 2 concept R4 (#116), then DSA-US-2 and DSA-US-3 (#71, #72); follow-up #150 in the backlog.

## Open questions waiting for others

| Question | Waiting for (handle) | Since |
| --- | --- | --- |
| !29 (merged): agreement to the export `./web` in `packages/contracts/package.json` (`scaffolding.md` §16, rule 1) | schauby1 | 2026-10-29 |
