# Frontend

Loaded by `/gam-engineering frontend` (skill `gam-setup`). It brings a project's user interface onto P-DES-7…9 in one run: the technology skills, a design and accessibility audit of the existing interface, and the color themes and font sizes. `frontend` is a reserved argument, not a feature name.

The run changes no app code. It writes `STACK.md` and hands every gap to one feature that `gam-concept` grills; the code changes follow as concept → issue → MR (P-GIT-5, P-WS-6).

## Step 1 — Detect

Read `STACK.md` §1, §4, and §10 and the code. If the project has no user interface, say so, write `none` to a missing §10, and stop.

## Step 2 — Technology skills (P-DES-7)

Also used by step 9 of [setup](setup.md). Skip it when §10 is filled and the developer did not ask to change it.

1. If §1 names a web frontend, propose the template's web-frontend preset as one `Q<n>` with `multiSelect`, every row of the preset marked as recommended; offer the React row only if §1 names React or Next.js, the shadcn row only if §1 or §2 names shadcn/ui, and the motion row only if the code or a concept has animations, transitions, or overlays (modals, drawers, toasts). Otherwise write `none` and ask nothing.
2. Check that every chosen skill is installed (it is in the session's skill list). For a missing one, say so and keep the row; `implement` and `review` name it in the MR until it is installed.
3. Offer the template's library table (P-DES-11) in the same `Q<n>`, each row marked as recommended where its condition holds; a library the project already uses stays and is written as is. Write the chosen rows to §10. A project that already uses a second skill for the same framework rules (e.g. `react-expert` next to `react-best-practices`) keeps only one; ask which as part of the same `Q<n>`.

## Step 3 — Gap list (read-only)

Skip this step when the project has no interface code yet; grill step 6 of [gam-concept](../../gam-concept/SKILL.md#grill) then derives P-DES-9 into the first concept with a screen. Otherwise collect one list, each entry with its screen or file:

- **Color themes and font sizes (P-DES-9):** missing themes or font sizes, labels that name the user (e.g. "Farbenblind" instead of *Alternativfarben*), no system preference without a stored choice, the choice not kept per device and signed-in user, fixed color values outside the token definitions.
- **Design and accessibility:** call the Skill tool with each skill §10 binds to `review`, on the interface code. With a running-app skill in §10, start the app and take a screenshot of each main screen in every theme the app offers; judge legibility and contrast on them.
- **Hand-built parts (P-DES-11):** controls, charts, tables, or data fetching built by hand where §10 binds a library (e.g. a checkbox acting as a switch, a bordered box acting as a segmented control).
- **Requirements already present:** the `U` and `NF` requirements an existing concept holds for these points; a gap that one of them already covers names its ID instead of becoming a new entry.

## Step 4 — Inventory and one confirmation

Report the §10 rows and the gap list as one table *area — finding — screen or file — proposed action*. Confirm it as one `Q<n>` with the options **Grill all** (recommended: one feature *Frontend design* with the whole list as starting notes), **Themes only** (the feature *Color themes* with the P-DES-9 entries; the rest goes to the inbox), **Inbox** (the whole list as one entry in `next.md`), and **No** (only §10 is written).

## Step 5 — Apply (one change)

On the branch `chore/frontend` from the integration branch (P-GIT-2, P-GIT-9): §10, the inbox entry if one was chosen, and the log entry in `ROADMAP-DETAILS.md` (P-ROAD-4). Run `node gam-ai-knowledge/tools/doc-check.mjs` and the markdown lint, then merge through [`/gam-engineering merge`](../../gam-delivery/references/merge.md) under the project's merge policy. Without git, in place (P-GIT-7).

## Step 6 — Grill

On **Grill all** or **Themes only**, call the Skill tool with `gam-concept` and the chosen feature, passing the gap list as its starting notes. From there the normal flow runs: concept, `tickets`, `implement` with the skills of §10, and the running-app proof of P-DES-8.
