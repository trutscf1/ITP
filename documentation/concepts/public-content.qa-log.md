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

## Open questions for the school management

Legal questions the agent does not decide (grill flow, personal data). They are not answered in this log; the owner takes them to the data-protection contact of the school and records the answers here.

❓ **Q12** - **Operator of the team's installation**: Who is named as operator in the imprint and as responsible party in the privacy policy of the team's own installation — the school or the project team?

> **Answer:** open

❓ **Q13** - **Lawful basis for editor accounts**: On which lawful basis does an operator store the name and e-mail address of content editors, and does the team's installation need a consent or an agreement for it?

> **Answer:** open

❓ **Q14** - **Review of the legal templates**: Do the shipped template texts for imprint, terms, and privacy policy need a review by the school before the final submission?

> **Answer:** open
