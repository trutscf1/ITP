---
doc: qa-log
format: engineering-human/2
title: "Question log — Public content: landing page, help center, changelog, legal pages"
audience: [developer, reviewer, agent]
concept: "public-content.md"
---
# Question log — Public content: landing page, help center, changelog, legal pages

The verbatim record of every question round of the concept [public-content.md](public-content.md), for anyone who wants to know why a decision was made and who answered what (P-GRILL-2). Answers are quoted exactly and never rewritten; the distilled decisions live in the concept's §13 or in an ADR.

Question numbers continue from the highest `Q<n>` already in this file. Assumptions are numbered `A<n>` and become a question of the next round if rejected.

## Round 1 — 2026-10-06 — grill (trutscf1)

Assumptions stated with the round, none rejected:

- **A1**: The feature goal in §1 stands as written.
- **A2**: `PUB-AC-2.2` is tightened from "no critical violation" to "0 violations", because `G-1.S2` demands 0 and a criterion may not be weaker than the goal.
- **A3**: `/` shows the landing page to visitors; a signed-in member who opens `/` goes to the dashboard.
- **A4**: Help search is a plain search over title and text of the help articles, independent of the full-text search of R10.
- **A5**: Contextual help: each help article carries a stable context key set by the editor, and the app links by that key. If no article has the key, the link opens the help center start page.
- **A6**: A published change appears on the public page within 60 seconds; the interval is a configuration value (P-DES-6).
- **A7**: The captcha notice is fixed text in the web client, shown only where bot protection is switched on and its badge is hidden. The switch itself belongs to Identity (R3).
- **A8**: Editor accounts are personal data, so the requirements for them are derived with `privacy-by-design` before the concept is written.

❓ **Q1** - **Deviations**: Do the standing decisions listed above and the assumptions A1–A8 apply to this feature unchanged? Options: Apply unchanged / Reject an assumption / Deviate from a decision

➡️ Apply unchanged

> **Answer:** Apply unchanged (Recommended)

❓ **Q2** - **Changelog source**: The repo already has CHANGELOG.md (Keep a Changelog, curated in the release MR), and PUB-AC-1.2 adds changelog entries in the CMS. Where does the public changelog page get its content? Options: CMS entries by hand / Import into the CMS / Render CHANGELOG.md

➡️ CMS entries by hand

> **Answer:** CMS entries by hand (Recommended)

❓ **Q3** - **CMS unavailable**: What do the public pages show when the cms unit is down or was never filled, given that the legal pages must always be reachable (school rule)? Options: Last version + legal fallback / Last version only / Built-in fallback for all

➡️ Last version + legal fallback

> **Answer:** Last version + legal fallback (Recommended)

❓ **Q4** - **Content language**: In which language(s) are the public pages written and maintained? Options: German only / English only / German and English

➡️ German only

> **Answer:** German and English

❓ **Q5** - **Editor access**: PUB-AC-1.3 says the admin panel is 'not reachable publicly', while the R1 concept routes the cms unit through the reverse proxy under /cms. How do content editors reach the admin panel? Options: Via proxy, CMS login / Internal network only / Via proxy, platform login

➡️ Via proxy, CMS login

> **Answer:** Via proxy, CMS login (Recommended)

❓ **Q6** - **Legal texts**: The platform is self-hosted, so every operator is the responsible party of their own installation. Which legal texts does the product ship? Options: Templates with placeholders / The team's own texts / Empty pages

➡️ Templates with placeholders

> **Answer:** Templates with placeholders (Recommended)

## Round 2 — 2026-10-06 — grill (trutscf1)

Note to A8: the `privacy-by-design` skill is not installed in this session; the requirements for editor accounts are derived by the agent and the legal points are recorded as open questions for the school management.

Assumptions stated with the round, none rejected:

- **A9**: The language is part of the page address (`/de/…`, `/en/…`). A first visit without a language picks by browser language; every public page has a language switch.
- **A10**: The built-in legal fallback texts (Q3) exist in both languages.
- **A11**: A legal template (Q6) starts with a visible sentence that it is an unfilled template. It disappears when the editor replaces the text; the system does not detect placeholders by itself.
- **A12**: Two roles in the CMS: administrator (manages editor accounts) and editor (creates, edits, and publishes all content). No review step between them.
- **A13**: An editor account holds only name, e-mail address, and password hash. Public pages never show who wrote an entry. An administrator deletes an account, and its content stays.
- **A14**: Public pages set no tracking, no analytics, and load nothing from the internet (fonts and images come from the own server), so they also work in the offline start.
- **A15**: A help article belongs to exactly one category.
- **A16**: "Chronological order" on the changelog page means newest release first; an entry has version, date, title, and text.
- **A17**: The landing page is an ordered list of sections of fixed kinds (hero, feature, text with image, call to action); the editor changes content and order.
- **A18**: Every image in the CMS has the required fields *source* and *licence*; that is where `PUB-AC-2.3` is documented.
- **A19**: The seed runs by itself on the first start when the CMS holds no content, and never overwrites existing content.
- **A20**: The legal pages are exactly three (imprint, terms, privacy policy); an editor can edit them but not add or delete one.

❓ **Q7** - **Missing translation**: Which language is the default, and what does a visitor see when a page exists in only one of the two languages? Options: German default, show German / English default, show English / No fallback

➡️ German default, show German

> **Answer:** German default, show German (Recommended)

❓ **Q8** - **First administrator**: With the admin panel reachable through the proxy (Q5), how is the first CMS administrator account created on a fresh installation? Options: From configuration / Operator command / First-visitor form

➡️ From configuration

> **Answer:** First-visitor form

❓ **Q9** - **Two languages in the work items**: Where do the criteria for German and English go, and with which priority? Options: New story, Should / New story, Could / Criteria in existing stories

➡️ New story, Should

> **Answer:** New story, Should (Recommended)

## Round 3 — 2026-10-06 — grill (trutscf1)

❓ **Q10** - **Unclaimed admin panel**: How does the product deal with the time between the first start and the registration of the first administrator? Options: Warn until claimed / Setup guide only / Back to configuration

➡️ Warn until claimed

> **Answer:** Warn until claimed (Recommended)

## Round 4 — 2026-10-06 — grill (trutscf1)

Shown with the question: the table of work-item changes (reworded `PUB-AC-1.3`, `1.4`, `1.5`, `2.2`, `2.3`, `3.2`, `3.3`, `4.3`; new `PUB-AC-1.6`, `1.7`, `2.6`, `4.5`, `4.6`; new story `PUB-US-5`). Note: the optional adversarial check (`doubt-driven-development`) was not offered, because that skill is not installed in this session.

❓ **Q11** - **Shared understanding**: Do the answers Q1–Q10, the assumptions A1–A20, and the work-item changes in the table above describe the feature as you want it, so that I write the work items and the concept now? Options: Yes, write it / Change something first / Stop here

➡️ Yes, write it

> **Answer:** Yes, write it (Recommended)

## Round 5 — 2026-10-06 — grill (trutscf1)

❓ **Q15** - **Commit**: Phase 1 is written on concept/public-content and both checks pass (doc-check 0 errors, markdown lint 0 issues). How should the 11 changed files go into the repository? Options: Commit and push / Commit, push, and open MR / Commit locally only / Do not commit

➡️ Commit and push

> **Answer:** Commit and push (Recommended)

## Round 6 — 2026-10-06 — artifact interactions (trutscf1)

Notes: the standing decisions apply as confirmed in Q1. The skills `privacy-by-design` and `doubt-driven-development` are not installed in this session.

Assumptions stated with the round, none rejected:

- **A21**: Q12–Q14 concern only the team's own installation, so they do not block Phase 3 or the Phase 4 gate.
- **A22**: The health report of `cms` gets a second, essential dependency check `content-store`, because `cms` now has its own database (`PUB-F-1`).
- **A23**: Images on public pages are delivered by the `web` unit and kept with the last loaded version. Otherwise `PUB-F-4` (no anonymous access) would block them and `PUB-F-8` (last version) would not cover them.
- **A24**: If `web` cannot determine whether a member session is valid (Identity down or not built yet), the person counts as having no session and sees the landing page.
- **A25**: The footer sits in the shared layout of `web`, so pages of other features get it without own work. Whether legal pages are readable offline belongs to the offline-mode concept.
- **A26**: The privacy template in `PUB-F-22` also covers the IP address in the audit log and login rate limiting, and e-mail delivery. A feature that stores a new kind of personal data adds its paragraph in the same MR.
- **A27**: Changes that other concepts need (Identity: captcha notice text; scaffolding: see Q17) are recorded in §14/§15 of the concept and put into the owner's inbox; their concepts are not edited here. `scaffolding.md` is legacy, so its change lands with its pending migration.
- **A28**: The public `/cms/health` reveals that no administrator exists yet. Accepted, since the registration form at `/cms` shows the same.

❓ **Q16** - **School answers**: Have the answers of the school management to Q12–Q14 (operator in the legal pages, lawful basis for editor accounts, review of the templates) arrived? Options: Not yet, continue / Yes, I have them / Not asked yet, continue

➡️ Not yet, continue

> **Answer:** Not yet, continue (Recommended)

❓ **Q17** - **Fresh stack is degraded**: [SCF-NF-1] demands that every unit reaches `ok` after the start, but with [PUB-F-9] (administrator check) a fresh `cms` is `degraded` until someone registers. Which rule gives way? Options: Narrow SCF-NF-1 / Test administrator from configuration / Drop the health check

➡️ Narrow SCF-NF-1

> **Answer:** Narrow SCF-NF-1 (Recommended)

❓ **Q18** - **Reason on the status page**: The status page shows only the unit name and `ok`/`degraded`/`down` ([SCF-F-8]). How does the operator learn that `cms` is degraded because no administrator registered? Options: Show the failed checks / Setup guide only / Notice in the admin panel only

➡️ Show the failed checks

> **Answer:** Show the failed checks (Recommended)

❓ **Q19** - **Changelog at a release**: Changelog entries are written by hand (Q2) and the seed holds only version 0.1.0 ([PUB-F-7]). What happens to the public changelog when the team releases a new version? Options: Release step, seed fixed / Seed grows per release / No rule

➡️ Release step, seed fixed

> **Answer:** Release step, seed fixed (Recommended)

## Round 7 — 2026-10-06 — artifact interactions (trutscf1)

Shown with the question: the list of changes (reworded `PUB-AC-1.7`; new `PUB-F-31`, `PUB-F-32`, `PUB-F-33`; extended `PUB-F-22`; new §11, §14, §15 with the required changes to `scaffolding.md`, `identity.md`, and `WORKFLOW.md`).

❓ **Q20** - **Shared understanding**: Do the answers Q16–Q19, the assumptions A21–A28, and the changes listed above describe Phase 3 as you want it, so that I write them into the concept and the work items now? Options: Yes, write it / Change something first / Stop here

➡️ Yes, write it

> **Answer:** Yes, write it (Recommended)

## Round 8 — 2026-10-06 — artifact interactions (trutscf1)

❓ **Q21** - **Commit**: Phase 3 is written on concept/public-content (8 files; doc-check 0 errors, markdown lint 0 issues). The Phase 4 gate needs a merge request that another member approves. How should the changes go into the repository? The foreign change in documentation/qa-log.md (rounds of a review session running in the same folder) stays uncommitted in every option. Options: Commit, push, open MR / Commit and push / Commit locally only / Do not commit

➡️ Commit, push, open MR

> **Answer:** Commit, push, open MR (Recommended)

Shown with the next question: title and description of the merge request `concept/public-content` → `dev` for the Phase 4 review gate.

❓ **Q22** - **Merge request**: GITLAB_TOKEN is not set, so I cannot publish the merge request shown above. How should it be opened? Options: I set the token / I open it myself / Later / Change the text first

➡️ I set the token

> **Answer:** erstelle mit meinem personal access token

Result: the token was still not set in the process, user, or machine environment after the answer, so no merge request was opened in this session.

## Round 9 — 2026-10-06 — review gate (trutscf1)

Notes: the standing decisions apply as confirmed in Q1. Both checks were run fresh (doc-check 0 errors, markdown lint 0 issues).

Assumptions stated with the round, none rejected:

- **A29**: The entry point is the Phase 4 gate, not Phase 5, because the manifest forbids architecture work before the sign-off.
- **A30**: The foreign change in `documentation/qa-log.md` (round 7 of a review session) stays uncommitted on this branch.

❓ **Q23** - **Phase 4 gate**: The merge request concept/public-content → dev is not open and GITLAB_TOKEN is still not set (process and user environment). Phase 5 (architecture) may not start before another member approves it. How do we get through the gate? Options: I set the token / I open it myself / MR is already open / Already approved

➡️ I set the token

> **Answer:** I set the token (Recommended)

Shown with the next question: title and description of the merge request `concept/public-content` → `dev` for the Phase 4 review gate.

❓ **Q24** - **Merge request**: Shall I publish the merge request shown above (concept/public-content → dev) as soon as GITLAB_TOKEN is set in your Windows user environment? Options: Token is set, publish / Change the text first / I open it myself / Later

➡️ Token is set, publish

> **Answer:** here: [token removed from the log]

❓ **Q25** - **Reviewer**: Which member should be set as reviewer of the merge request? The PM approver is you, and you are the author, so another member has to sign off (P-MR-2). Options: schwaigc / tschudea07 / schauby1 / No reviewer set

➡️ schwaigc

> **Answer:** schwaigc (Recommended)

Result: the token was pasted into the answer instead of being set in the environment. The agent may not put a token into a command (`docs/agents/issue-tracker.md`, "Access"), so no merge request was opened in this session. The text of Q24 and the reviewer of Q25 stand for the next attempt.

Follow-up in the same session: on the owner's instruction the token was saved as the user environment variable `GITLAB_TOKEN`, and the merge request was opened as !6 with the text of Q24 and `schwaigc` as reviewer.

## Round 10 — 2026-10-13 — review gate, red pipeline (trutscf1)

Notes: !6 is open without an approval or a comment of `schwaigc`. Its pipeline failed in the status check, because the position row in `team/trutscf1/STATUS.md` still named the work branch.

Assumptions stated with the round, none rejected:

- **A31**: The entry point is the Phase 4 gate of *Public content* (R11), because its position row is the only one with an open merge request.

❓ **Q26** - **Push the status fix**: The pipeline of !6 is red because STATUS.md still named the work branch. I changed the position row and the status index to the state after the merge (Phase 5, architecture) and added a log entry; doc-check and markdown lint are clean locally. Commit this on concept/public-content and push it to !6? Options: Commit and push / Commit only / Leave uncommitted

➡️ Commit and push

> **Answer:** Commit and push (Recommended)

❓ **Q27** - **Waiting for the review**: !6 has been open since 2026-10-06 with no approval and no comment from schwaigc, so it cannot be merged yet (P-MR-2). What should happen meanwhile? Options: Remind the reviewer / Stop here / Grill another draft

➡️ Stop here

> **Answer:** Stop here

## Round 11 — 2026-10-13 — review gate, revise !6 (trutscf1)

Notes: `schwaigc` reviewed !6 on 2026-10-13 and requested changes in one thread: point 1 (a legal page can be unpublished and then answers "page not found") blocks the approval, points 2–4 are suggestions. Each point was checked against the concept and holds.

Assumptions stated with the round, none rejected (shown in the chat as A29–A33; renumbered here, because A29–A31 are taken):

- **A32**: The skill `receiving-code-review` is not installed in this session; the agent applies its procedure itself (verify each point against the concept, then fix it or answer with the reason).
- **A33**: `PUB-F-29` (missing translation) and `PUB-E-5` (page not found) agree like this: a help article without a published German version answers "page not found"; a landing section or a changelog entry without one is left out of its page.
- **A34**: Review point 2: new requirement `PUB-F-34` — the setup guide contains "register the CMS administrator" as a numbered step right after the start command, derived from `PUB-AC-1.7`.
- **A35**: Review point 3: `PUB-F-13` (source and licence) says that the `cms` unit does not judge the licence, that choosing licence-free images is the editor's duty, and that the seed images are licence-free. `PUB-AC-2.3` stays unchanged.
- **A36**: Review point 4: `docs/projektantrag.md` is restored to the version on `dev`; the change was whitespace only.

❓ **Q28** - **Unpublished legal page**: An editor can unpublish a legal page today ([PUB-F-3]), and it then answers "page not found" ([PUB-F-29]), against the rule that legal pages are always reachable (Q3). Which rule closes the gap? Options: Cannot be unpublished / Fall back to built-in text / Both

➡️ Cannot be unpublished

> **Answer:** Cannot be unpublished (Recommended)

Shown with the next question: the two fix commits (the concept changes with requirement ID `PUB-F-24`; the restored `docs/projektantrag.md`) and the drafted reply to the review thread, point by point.

❓ **Q29** - **Publish the revision**: Shall I commit the two commits shown above, push them to concept/public-content, and post the reply shown above in the review thread of schwaigc on !6? Options: Commit, push, reply / Commit and push only / Change something first / Commit locally only

➡️ Commit, push, reply

> **Answer:** Commit, push, reply (Recommended)

## Round 12 — 2026-10-20 — Phases 5 and 6, review findings of the agent review of !6 (agent, on request of trutscf1)

Notes: no question was asked in this round. The owner asked the agent to apply the recommended default for the open points of the agent review (findings 3, 5, 6, 7) and to leave the school questions Q12 to Q14 open. Every assumption below is reviewed by `trutscf1`; a rejected one becomes a `Q<n>` of the next round. Question numbers continue from Q29, so the next free one is Q30 (process questions Q15, Q21 to Q27, and Q29 are not listed in §13 of the concept).

Assumptions stated with the round, none rejected yet:

- **A37**: `CONTENT_REFRESH_SECONDS` is an integer from 1 to 60, default 60, because `PUB-AC-1.4` promises that a change is public within 60 seconds and a larger value would break it.
- **A38**: `CONTENT_TIMEOUT_MS` is an integer from 100 to 30000, default 2000, the same default as the health timeouts of the scaffolding concept.
- **A39**: The access token of the `web` unit is the secret `CONTENT_ACCESS_TOKEN`, a string of at least 32 characters without a default, equal in `cms` and `web`; a missing or short value stops the unit like any invalid configuration (`SCF-E-1`).
- **A40**: Allowed image types are PNG, JPEG, and WebP, recognized by their content, up to 2 097 152 bytes (2 MiB); SVG is excluded because it can carry scripts. New `PUB-F-35` and `PUB-E-8`.
- **A41**: The rich text format is a small fixed markup (paragraphs, headings of level 2 to 4, bold, italic, two list kinds, links to `http`, `https`, `mailto`, or an own address); everything else is shown as plain text. New `PUB-F-36`.
- **A42**: The record types of §8 use the neutral types of the manifest: `identifier` is `uuid`, `text(a..b)` is a `string` of a to b characters, `date` is a `string` of the form `YYYY-MM-DD`, and `rich text` is a `string` in the markup of A41; they are declared once as named types.
- **A43**: Six further configuration values get their defaults until the Identity and web client concepts define them: `CMS_INTERNAL_URL`, `PUBLIC_BASE_URL`, `SESSION_CHECK_TIMEOUT_MS` (500, range 50 to 5000), `DASHBOARD_PATH`, `REGISTRATION_PATH`, `LOGIN_PATH`.
- **A44**: Editor data rules: name 1 to 100 characters, e-mail address unique, password 12 to 128 characters; the panel creates and deletes only accounts of the role `editor`, and the administrator account cannot be deleted there (recovery is an operator task outside this concept). New `PUB-F-37`, `PUB-E-9`, `PUB-E-10`.
- **A45**: The description of a page without its own description is the plain text of the body of the first `hero` section, cut after 160 characters; if there is none, the page title. The start pages of help center and changelog have the fixed titles of §8.
- **A46**: The capabilities `PUB-C-1` to `PUB-C-4` of §7 are the ones the review named (content management with languages, password hashing, safe rich text, accessibility check); `STACK.md` gets capability-index rows only and the text "to be chosen by the owner".
- **A47**: Work-item titles and issue #78 stay as they are, although "Strapi" is in the title of `PUB-US-1` and in `PUB-AC-1.1`; the finding is reported to the owner, who decides on a rename.
- **A48**: Slices: `PUB-US-1` is cut into three slices (the cms unit, editor accounts, delivery by `web`); the other stories keep their one slice. Weights are re-estimated and proposed, the tracker is not changed by this round.
- **A49**: The translation note is shown once at the top of a page that shows any German text under `/en`; each German passage is marked as German.
- **A50**: `web` refreshes a content group when a request arrives and the last attempt is at least `CONTENT_REFRESH_SECONDS` old; one attempt per group runs at a time; a refresh succeeds only if all image files of the group were fetched too.
- **A51**: The stage of the feature in `ROADMAP.md` stays `concept` until the issues are cut (`ready` means issues cut) and the reviewer accepted §16 and §17.
- **A52**: Articles inside a help category are ordered alphabetically by title, because the data model has no position for articles; `PUB-F-16` says so.
- **A53**: The legal templates follow the heading outline in §8 (headings and placeholders only); the wording below the headings is written by the author of the templates and is not legal advice (open question Q14).
- **A54**: Two named error conditions were added so that no failure is left to guesswork: `PUB-E-11` (invalid content value) and `PUB-E-12` (action not permitted, including the failed sign-in).

## Open questions for the school management

Legal questions the agent does not decide (grill flow, personal data). They are not answered in this log; the owner takes them to the data-protection contact of the school and records the answers here.

❓ **Q12** - **Operator of the team's installation**: Who is named as operator in the imprint and as responsible party in the privacy policy of the team's own installation — the school or the project team?

> **Answer:** open

❓ **Q13** - **Lawful basis for editor accounts**: On which lawful basis does an operator store the name and e-mail address of content editors, and does the team's installation need a consent or an agreement for it?

> **Answer:** open

❓ **Q14** - **Review of the legal templates**: Do the shipped template texts for imprint, terms, and privacy policy need a review by the school before the final submission?

> **Answer:** open
