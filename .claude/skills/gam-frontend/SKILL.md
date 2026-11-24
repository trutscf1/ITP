---
name: gam-frontend
description: Orchestrates the frontend skills of the gam- process skills — per situation it calls the one owning skill the project binds in STACK.md §10, in a fixed order. Situations — plan (shape a screen), build (code a screen or component), motion (animations, transitions, gestures), review (critique, audit, worst-case data, running app), vary (try UI variants), library (pick a library), mobile (feel native on a phone). Use when /gam-engineering routes `ui [situation]` here, when `implement` builds a story or plan that changes an interface (build, then motion, then review), when `review` checks an MR that changes an interface (review), or when the developer asks for one of these situations by hand. Mandatory for every interface change, also a direct request outside the commands, unless env.GAM_ENGINEERING_FRONTEND is off or the developer names another skill for that part (P-DES-13) — load it before any other UI, design, or motion skill.
---

# gam-frontend

The frontend work of [gam-engineering](../gam-engineering/SKILL.md): which skill owns each situation of building an interface, in which order they run, and which skills run only by hand. It decides *which* skill runs; the work itself is done by the skill it calls. Setting up the skills, the interface audit, and the color themes stay in [`/gam-engineering frontend`](../gam-setup/references/frontend.md) (skill `gam-setup`): setting up is not working (Q433).

Before the first step, apply the shared rules of the core once per session — skip what already ran when the core or another gam- skill routed here — [Before anything else](../gam-engineering/SKILL.md#before-anything-else), [Asking the developer](../gam-engineering/SKILL.md#asking-the-developer), and [The contract](../gam-engineering/SKILL.md#the-contract). The model line and the delegation of [Models](../gam-engineering/references/models.md) apply when this skill runs as its own command; called from `implement` or `review`, it runs inside that command and prints no start line of its own.

| Invocation | What happens |
| --- | --- |
| `ui` | Name the situation from the request and the diff, state it as an assumption `A<n>`, then run it |
| `ui <situation>` | Run that situation: `plan`, `build`, `motion`, `review`, `vary`, `library`, or `mobile` |

## The binding rule

Read `STACK.md` §10 of the project first (P-DES-7). Call only skills whose row there names `gam-frontend (<situation>)` in *Loaded by* for the situation at hand.

- A situation with no bound skill stays empty: report it in one line and propose the matching row of the preset in [gam-ai-knowledge: templates/STACK.md](../gam-ai-knowledge/templates/STACK.md#10-technology-skills), to be added with `/gam-engineering frontend`.
- A bound skill that is not installed (missing from the session's skill list) is named — in the MR when `implement` or `review` called — and never replaced by another one.
- A project without a user interface (§10 `none`) has nothing to run; say so and stop.

## Mandatory use

Every piece of interface work in a project runs through this skill (P-DES-13, Q477–Q480): from `implement` and `review`, from a plan of the quick flow, and on a direct request outside the `/gam-engineering` commands. Two exceptions:

- **Switched off** — `env.GAM_ENGINEERING_FRONTEND` is `off` in the committed `.claude/settings.json` (a missing key is `on`; set with `/gam-engineering settings frontend <on | off>`). No command calls this skill then; it still runs by hand.
- **Developer override** — the developer names another skill or way for one part. Call that one instead for that part in this session only, name the override in the MR or plan, and write nothing to §10 or the settings; the next part runs through this skill again.

While the rule is on, no other interface skill (design, UI, UX, motion, component generator) is started directly: it runs only as a bound skill of a situation below or by the override.

## Situations

Call the Skill tool with the owner; call an *Also* skill only when its condition holds and §10 binds it. Details, conditions, and what each call hands over: [references/situations.md](references/situations.md).

`plan`, `build`, `review`, and `vary` also apply the twelve UX laws (Miller, Hick, Jakob, Fitts, Tesler, Aesthetic-Usability, Gestalt, Progressive Disclosure, Pareto, Von Restorff, Peak-End, Serial Position) of [references/ux-laws.md](references/ux-laws.md) (P-DES-14): the checklist belongs to this skill, so it holds whichever skill §10 binds, and in `review` each violation is a finding named after its law.

| Situation | Owner | Also, when it applies |
| --- | --- | --- |
| `plan` | `gam-v-impeccable` (`shape`) | — |
| `build` | `gam-v-impeccable` (with `DESIGN.md`, P-DES-12) | `shadcn`, `react-best-practices`, `tanstack-query-expert` where §1 or §2 name their technology |
| `motion` | `gam-v-animate` | `gam-v-choreograph` (several elements move together), `gam-v-gestures` and `gam-v-apple-design` (drag, swipe, sheets), `gam-v-animation-performance` (dropped frames) |
| `review` | `gam-v-impeccable` (`critique`, `audit`) | `gam-v-review-animations` (motion code in the diff), `gam-v-break-ui` (screens that show data), `webapp-testing` (the running app, P-DES-8) |
| `vary` | `gam-v-ui-prototype` | `gam-v-impeccable` (`live`) instead, when the developer asks for it |
| `library` | the P-DES-11 library table in §10 | `gam-v-pick-ui-library` only for a need without a row there |
| `mobile` | `gam-v-mobile-native` | — |

## Order

- **From `implement`** — every story or plan that changes an interface: `build`, then `motion` when the change adds or changes animations, transitions, overlays, or gestures, then `review` before *Finish* (Q434). `plan` runs first when no screen design exists yet for a new screen.
- **From `review`** — an MR that changes an interface: `review` only.
- **Outside the commands** — a direct request or a plan of the quick flow that changes an interface: the order of `implement` (P-DES-13).
- **By hand** — any situation on its own, through `/gam-engineering ui <situation>`.

## Report

After each situation, return one line per skill to the calling command (or print it when run by hand): situation, skill, and its result — the files it changed, or its findings, or *not bound* / *not installed*. The calling command judges the findings, fixes them in its branch or names them in the MR; this skill publishes, commits, and merges nothing.

## By hand only

These skills are never called by `implement`, `review`, or a situation above; they run only when the developer types them (Q435):

- `gam-v-improve-animations`, `gam-v-remove-animations`, `gam-v-find-animation-opportunities` — sweeps over existing motion.
- Look-up only: `gam-v-animation-vocabulary` (names for motion effects) and `gam-v-emil-design-eng` (the philosophy behind the motion skills).

Building and design review belong to `gam-v-impeccable`, which replaces `frontend-design` and `web-design-guidelines`; its detector also runs after every edit of an interface file through the frontend hook, when `env.GAM_ENGINEERING_FRONTEND_HOOK` is `on` ([frontend hook](../gam-setup/references/frontend.md#frontend-hook)); motion belongs to `gam-v-animate`, which replaces the `animate` command of `gam-v-impeccable`.
