# Situations

Loaded by [gam-frontend](../SKILL.md) for each situation it runs. Every step below applies [the binding rule](../SKILL.md#the-binding-rule): a skill runs only when `STACK.md` §10 binds it to `gam-frontend (<situation>)`. Each owner is called with the Skill tool and gets the screen or files, the story or plan, and `DESIGN.md` where it exists (P-DES-12); what it returns is judged by the calling command, never merged unseen.

## plan

Shape a new screen before code exists. Call `gam-v-impeccable` with its `shape` command and the story or plan sentence. The [UX laws](ux-laws.md) go with the call as constraints (P-DES-14), and the design names the primary action, the frequent tasks, and how the content is grouped and ordered. The result is a screen design in `DESIGN.md` terms; a decision it raises that the documents do not answer is a documentation defect and goes to the concept document or plan first (manifest Phase 7).

## build

Code a screen or component. Call `gam-v-impeccable` with `DESIGN.md` (P-DES-12); then, in this order and only where §1 or §2 names the technology and §10 binds the skill:

1. `shadcn` — components from shadcn/ui; a control a P-DES-11 library row covers is taken from that library, never built by hand.
2. `react-best-practices` — React or Next.js code.
3. `tanstack-query-expert` — fetching and caching server data.

Before the screen goes to `review`, the agent goes through the *Check* lines of the [UX laws](ux-laws.md) once for every changed screen and fixes what it finds (P-DES-14).

The tests of the change follow the `gam-v-tdd` loop of the calling command; this situation adds no test rule.

## motion

Animations, transitions, overlays (modals, drawers, toasts), and gestures. Call `gam-v-animate` first. Then, each only when its condition holds:

| Condition | Skill |
| --- | --- |
| Several elements enter, leave, or move together | `gam-v-choreograph` |
| Drag, swipe, or a sheet the finger moves | `gam-v-gestures`, then `gam-v-apple-design` for the feel |
| An animation drops frames or animates layout properties | `gam-v-animation-performance` |

The `animate` command of `gam-v-impeccable` is not used here (Q435).

## review

Check a changed interface, from `implement` before *Finish* or from `review` on an MR. Call, in this order:

1. `gam-v-impeccable` with `critique`, then `audit`, on the changed screens.
2. The [UX laws](ux-laws.md) (P-DES-14): the session goes through the *Check* lines for every changed screen; each violation is a finding that starts with the law's name, and a deliberate exception needs the law and the reason in the MR.
3. `gam-v-review-animations` when the diff adds or changes motion code.
4. `gam-v-break-ui` when a changed screen shows data (lists, names, counts).
5. `webapp-testing` — start the app and drive each acceptance criterion or *Done when* item the interface shows (P-DES-8); a screenshot of each changed screen in every theme (P-DES-9) and an empty error console are the evidence for the MR.

A finding is reported to the calling command, which fixes it in the same branch or names it in the MR; this situation changes no code itself.

## vary

Try genuinely different versions of a UI piece. Call `gam-v-ui-prototype` with the piece, the constraints from `DESIGN.md`, and the [UX laws](ux-laws.md) (a variant that breaks one on purpose says which); with the developer's explicit request, `gam-v-impeccable` `live` instead. Variants are throwaway code: the chosen one is rebuilt through `build` under a story or plan, never merged from the prototype.

## library

Choose a library for a need. Read the P-DES-11 library table in §10: a need with a row takes that library, added as the row says. Only for a need without a row, call `gam-v-pick-ui-library`; its choice is proposed as a new row of §10 and asked as one `Q<n>` before anything is installed.

## mobile

Make a web app feel native on a phone, when §1 or a concept says it targets phones. Call `gam-v-mobile-native` on the changed screens; its fixes are code changes of the calling command.
