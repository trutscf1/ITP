# UX laws

Loaded by [gam-frontend](../SKILL.md) in the situations `plan`, `build`, `review`, and `vary` (P-DES-14). The bound design skills cover only some of these laws, and only some of them by name, so this checklist belongs to `gam-frontend` itself and applies whichever skill §10 binds. Names and wording follow *Laws of UX* (Jon Yablonski, lawsofux.com).

## How to apply

- **`plan`** — hand the list to `gam-v-impeccable` `shape` as constraints; the screen design names its primary action, its frequent tasks, and how it groups and orders its content.
- **`build`** — before the screen goes to `review`, the agent goes through the *Check* lines below once for every changed screen and fixes what it finds.
- **`review`** — after `critique` and `audit`, go through the *Check* lines for every changed screen. Each violation is a finding that starts with the law's name (`Hick's Law: the settings dialog offers 14 equal options`) and is handled like any other `review` finding.
- **`vary`** — every variant gets the list as constraints; a variant may break one law on purpose to test it, and says which.

The laws are heuristics, not limits. A deliberate exception is allowed when the MR or plan names the law and the reason; a silent one is a finding.

## Laws

### Miller's Law

Working memory holds only a few chunks at once (about 4, Cowan 2001; Miller's 7 ± 2 is the upper bound).

- **Check:** content the user must hold or compare is chunked into groups of at most about 4–5; long numbers and codes are split (`AT61 1904 3002 3457 3201`); nothing the user needs on step 3 is only visible on step 1.
- **Typical finding:** a flat list of 12 settings with no groups; a code shown once and asked for later.

### Hick's Law

The time to decide grows with the number and complexity of choices.

- **Check:** every decision point offers few options, with the recommended or most common one marked; long lists are grouped, searchable, or split into steps; rare options sit behind a "More" (see Progressive Disclosure).
- **Typical finding:** a menu or dialog of many equal-looking options; two buttons of equal weight for a choice that has a clear default.

### Jakob's Law

Users spend most of their time on other sites and expect yours to work the same way.

- **Check:** standard patterns and positions are kept (logo top left links home, search and account top right, primary navigation where the platform puts it, links look like links, a checkbox behaves like a checkbox); a control from the P-DES-11 library is not restyled into something unrecognisable; a new pattern is introduced only with a reason.
- **Typical finding:** a custom control that looks like a toggle but behaves like a button; a save action in an unusual place.

### Fitts's Law

The time to reach a target depends on its distance and size.

- **Check:** primary and frequent actions are large and near where the pointer or thumb already is; touch targets are at least 44 × 44 CSS px (at least 24 × 24 with spacing, WCAG 2.5.8); destructive actions are not placed directly beside frequent ones; the whole row or card is clickable when it stands for one target.
- **Typical finding:** a small icon-only primary action in a far corner; "Delete" next to "Save" at equal size.

### Tesler's Law

Every system has a complexity that cannot be removed, only moved — to the system or to the user.

- **Check:** the interface absorbs what it can: sensible defaults, values derived from what is known (date, class, user), auto-completion, input formats accepted leniently and normalised; the user is asked only for what the system cannot know.
- **Typical finding:** a form asking for data the app already has; a strict input format the app could parse itself.

### Aesthetic-Usability Effect

Users perceive an attractive design as easier to use and forgive it small problems.

- **Check:** the screen is visually finished (spacing, alignment, type scale, tokens from `DESIGN.md`, P-DES-12) — and the review does not let a polished look hide a usability finding of the other laws or the running-app proof (P-DES-8).
- **Typical finding:** inconsistent spacing and alignment on an otherwise working screen; a review that passes a confusing flow because it looks good.

### Gestalt laws

People see structure: things that are close, look alike, or form a shape belong together.

- **Check — proximity:** related items are closer to each other than to unrelated ones; a label sits nearer its field than the next field.
- **Check — similarity:** elements that do the same look the same, and elements that do different things look different (a link never looks like plain text, a disabled control never looks like an active one).
- **Check — closure and common region:** groups are shown by spacing or a shared background before extra borders are added; a row cut off at the edge signals that the area scrolls.
- **Typical finding:** equal gaps everywhere so nothing groups; two buttons of different function in the same style.

### Progressive Disclosure

Show what most users need now; reveal the rest on demand.

- **Check:** the default view holds the frequent task only; advanced settings, details, and rare options are one clear step away (expand, "More", a details page), never hidden without a visible way to reach them.
- **Typical finding:** every option visible on first load; an option users need hidden behind an unlabelled icon.

### Pareto principle

About 80 % of use comes from about 20 % of the features.

- **Check:** the frequent tasks — taken from the user stories and their priority in the concept document — get the prime positions, the largest targets, and the fewest steps; rare features do not crowd them.
- **Typical finding:** the most-used action two levels deep while rarely used ones fill the toolbar.

### Von Restorff Effect

Of several similar items, the one that differs is noticed and remembered.

- **Check:** each view has one visually distinct primary action; emphasis is rare, so it still stands out; important states (error, unsaved changes) differ by more than color alone — icon, text, or shape as well (P-DES-9).
- **Typical finding:** three highlighted buttons on one screen; an error marked only in red.

### Peak-End Rule

People judge an experience mostly by its most intense moment and its end.

- **Check:** the peak moments — errors, waiting, a high-stakes action — are designed: a clear message, a way forward, no lost input; the end of a flow shows a clear result (confirmation, what happens next) instead of just closing.
- **Typical finding:** an error that clears the form; a submit that ends on an empty page.

### Serial Position Effect

The first and last items of a series are remembered best.

- **Check:** the most important items of navigation, lists, and menus are placed first and last; the least important go in the middle; the order is stable between visits.
- **Typical finding:** the key navigation entry in the middle of a long bar; a list whose order changes on every load.
