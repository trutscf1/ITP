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
| Design system & accessibility modes (R4) | [concepts/design-system.md](../../concepts/design-system.md) | 7, implement (slices 1 and 2 of DSA-US-1 in `dev`; rest of the concept still a draft) | — | — | Slice 3 (DSA-AC-1.6, theme in the profile) is #112 and waits for IDN-US-2 (#46). Grill the rest of the draft with `/engineering-human design-system` before DSA-US-2 |
| Web client: dashboard, file browser, preview (R6) | [concepts/web-client.md](../../concepts/web-client.md) | 1, grill (draft) | — | — | Review the draft and its work items, then grill it with `/engineering-human web-client` |

Sprint 1 (until 2026-11-02), GitLab issues: #68, #102, #106, #40, and #103 done (!7 and !9 merged on 2026-10-28, !29 and !30 on 2026-11-02, #85 with !5 on 2026-10-27; shared: #38, #39); #2 Corporate Identity moves to Sprint 3. Next: Sprint 2 concept R4 (#116), then DSA-US-2 and DSA-US-3 (#71, #72); follow-up #150 in the backlog.

## Open questions waiting for others

| Question | Waiting for (handle) | Since |
| --- | --- | --- |
| !29 (merged): agreement to the export `./web` in `packages/contracts/package.json` (`scaffolding.md` §16, rule 1) | schauby1 | 2026-10-29 |
