---
doc: inbox
format: gam-ai-knowledge/1
title: Inbox
audience: [developer, agent]
handle: "schwaigc"
---
# Inbox — schwaigc

New tasks and ideas for this developer land here first, before anyone plans them (P-ROAD-3); work nobody has claimed yet goes to the issue tracker instead. Processing an entry means: move it to the log in [ROADMAP-DETAILS.md](../../ROADMAP-DETAILS.md) and, if it is a planned feature, add it to [ROADMAP.md](../../ROADMAP.md). Then delete it here.

## Open

- [2026-11-24] Noticed in #168 (IDN-US-1 slice 2), not changed there: `next build` of `web` stops once with `SecurityFatalError` (Next.js 16.4.2 reported as affected by an advisory; a second run builds) — check the advisory and plan the upgrade with the security stack of `docs/security_next_js.md`; `STACK.md` has no §10 *Technology skills*, so `gam-frontend` had no bound skill for `build` and `review` (add it with `/gam-engineering frontend`); `pickLanguage` of `web` and `chooseLanguage` of `identity` are the same rule twice (IDN-F-38) — a candidate for `@stash/contracts/identity`; the screenshots per theme of P-DES-9 and a browser run of `/register` with the bot check on wait for the end-to-end job of WEB-US-4.

- [2026-11-17] Ask the school management (data-protection contact) the two legal questions L1 (appearance values as health data, Art. 9 GDPR) and L2 (consent for device storage) of `concepts/design-system.md` §13; the profile slices #112, #161, and DSA-US-4 slice 3 wait for L1 (Q399).
- [2026-11-17] R4 follow-ups from the concept grilling (#116, `concepts/design-system.md` §14/§15): move DSA-AC-3.3 (ARIA of file browser, dialog, upload progress) into the R6 stories of `web-client.md` and link the Appearance menu from WEB-US-3; rescope #163 (no longer a slice of DSA-US-3) at `tickets`; update `tests/screen-reader-protocol.md` (theme switcher/popover → Appearance menu, old §16 assumption numbers).
- [2026-11-10] Noticed in slice 1 of DSA-US-3 (#72), not changed there: the root layout has a fixed `lang="en"`; the links of the placeholder page open a new tab with `target="_blank"` without saying so; `tests/design-system.test.ts` still defines its own `root` instead of `tests/helpers/paths.ts`; `@layer base` of the focus rule was checked at stylesheet level only, not in Storybook.

- [2026-11-10] Noticed in slice 1 of DSA-US-2 (#71), not changed there: the theme switcher's `border-border` reaches about 1.5:1 on white, below the 3:1 for component boundaries (WCAG 1.4.11); Storybook has no toolbar item for the accessibility modes; the create-next-app placeholder still has the title "Create Next App" and fixed-pixel logos; a designer should look at the colour-blind status palettes (tuned by simulation, A8).

- [2026-10-27] From `trutscf1`, concept *Observability baseline* (R2, `concepts/observability.md` §15 and §16, MR of #114): `web` includes `TelemetryConfig` in its configuration contract, calls `startTelemetry` and writes the start log entry before it accepts requests (OBS-F-1, OBS-F-25) — slice 4 of OBS-US-1, an issue for you after `tickets`. Requests to `/health` stay out of telemetry (OBS-F-12).
- [2026-10-06] Review the drafts that concern your features: the roles and success signals in `GOAL.md`, the *Serves* column in `ROADMAP.md`, and the concept drafts and work items of your features.
- [2026-10-07] From `trutscf1`: !4 is merged. Record your implementation time for #38 with `/spend` (Definition of Done 14; none was recorded at the merge), add the points deferred from the review to #102, and rebase !5 on `dev`.
- [2026-10-20] Track plan Web, M6: after !14 is merged, change `/api/docs` to the description generated on request from the contracts (as in !16), drop `OPENAPI_FILE` (A3), the fixture, and W-15 (Q69); M9 replaces the stop-gap `docker/web.Dockerfile` of !17 (Q70).
