---
doc: concept
format: engineering-human/2
title: "Public content: landing page, help center, changelog, legal pages"
audience: [product, developer, reviewer, agent]
id-prefix: "PUB"
serves: "G-1.S3"
---
# Public content: landing page, help center, changelog, legal pages Concept

The specification of roadmap feature R11: the pages anyone reads without an account, and the way content editors maintain them. It is written for the feature's owner (trutscf1), its reviewers, and the agents that will implement it. Part H is the plain-language view; Part S is binding.

# Part H — For Human Readers

This part adds no rule. It summarizes Part S and cites its IDs; where the two disagree, Part S wins (P-HUM-3).

## H1. In one sentence

Visitors and members read the landing page, the help center, the changelog, and the legal pages without logging in, and content editors maintain them without touching code. This serves success signal `G-1.S3` (scope of the project application), because the application promises exactly these pages, maintained through a content management system.

## H2. Who benefits and how

- **Visitor (`R-4`)**: sees what the product offers, can read help, changelog, and the three legal pages, in German or English, and finds the way to registration and login.
- **Member (`R-1`)**: reaches the help article that fits the place in the app they came from, and sees what each release changed.
- **Content editor (`R-5`)**: changes any public page in the admin panel; the change is public within a minute.
- **Operator (`R-2`)**: gets legal pages that exist from the first start, as templates to fill in, and sees on the status page, with the reason named, when nobody has claimed the admin panel yet.

## H3. How it works, step by step

1. The operator starts the system. Example content for every page is created in German and English ([PUB-AC-1.5] seed content). The legal pages hold templates with placeholders and say so in their first sentence ([PUB-AC-4.6] legal templates).
2. The status page shows the content unit as `degraded` and names the reason `administrator-account` until the first person registers as CMS administrator in the admin panel ([PUB-AC-1.7] unclaimed administrator). After that, only an administrator creates further editor accounts.
3. A visitor opens the address of the installation and lands on the landing page in German or English, chosen by their browser ([PUB-AC-5.2] first visit). A signed-in member lands on the dashboard instead ([PUB-AC-2.6] signed-in member).
4. From every page, the footer leads to imprint, terms, and privacy policy ([PUB-AC-4.1] footer links); a language switch opens the same page in the other language ([PUB-AC-5.1] language in the address).
5. In the help center, articles are grouped by category and can be searched ([PUB-AC-3.1] help articles). A help link inside the app opens the article assigned to that place ([PUB-AC-3.3] contextual help).
6. An editor changes an entry and publishes it. Within 60 seconds the public page shows the change ([PUB-AC-1.4] cached delivery).
7. If the content unit is down, every page keeps showing what it showed last, including its images ([PUB-AC-1.6] CMS unavailable, [PUB-F-32] images through `web`). Legal pages are shown even if content was never loaded, from a text built into the product ([PUB-AC-4.5] built-in legal text).

## H4. What it deliberately does not do

- It does not translate the app itself; only the public pages are in two languages (§12).
- It does not copy `CHANGELOG.md` into the changelog page; editors write one entry per release by hand (§13, Q2).
- It does not let editors sign in with their member account; editor accounts are separate (§13, Q5).
- It does not track visitors and loads nothing from the internet ([PUB-NF-2] no internet requests, [PUB-NF-3] no tracking).
- It sells nothing: the terms page is a legal text, not a price list (`G-1.N3`).

## H5. How it is built, in plain words

The content lives in the `cms` unit as content entries: landing-page sections, help categories and articles, changelog entries, three legal pages, and images with their source and licence (§8). The `web` unit reads published entries, keeps the last version of every page with its images, and renders the public pages. The feature touches thirteen existing parts of the system (§14); five of them need a change in another document (§15): a fresh installation may start as `degraded`, the status page names failed checks, the Identity concept supplies the captcha notice, each release gets a step for the changelog entry, and the theme switcher of the design system is shown only to signed-in members, so that a visitor never gets a cookie. The code is split into two units and one shared package (§16). In the `cms` unit, five modules keep the content and its rules (`content-model`, `editor-accounts`, `content-interface`, `content-seed`, `cms-health`). In the `web` unit, five modules read, route, render, and frame the pages (`content-client`, `address-routing`, `rich-text`, `page-resolution`, `page-frame`), and the settings of the `web` unit are extended by those of this feature (`web-config`). `address-routing` only decides `/` and the addresses that start with a two-letter language, so the health report, the status page, and the API keep their own routes. The `web` unit belongs to the Web track of `schwaigc`; `trutscf1` builds the modules of this feature there, and `schwaigc` reviews every change. `content-client` asks the `cms` unit again whenever the last attempt is at least `CONTENT_REFRESH_SECONDS` old (at most 60 seconds), and it keeps the last good version of every group and all images, which is why the pages survive a stopped `cms` unit. Two things keep state: each language version of an entry is a draft or published (a German legal page can never go back to draft), and an installation is unclaimed until the first administrator registers ([PUB-F-6] refresh interval, [PUB-F-8] last version, [PUB-F-24] fixed legal pages, [PUB-F-10] first administrator). The work is cut into seven slices of about 3 hours each; the first three build the `cms` unit and the delivery by `web`, the other four add one story each.

## H6. How we know it works

Every one of the 27 acceptance criteria of the five stories has its own acceptance test (`PUB-T-1` to `PUB-T-27`), written as a scenario with concrete values: for example, the change an editor publishes at 10:00:00 is visible at 10:01:00 ([PUB-T-4]), a stopped content unit still lets visitors read every page they read before ([PUB-T-6]), and the German imprint cannot be unpublished ([PUB-T-18]). Eight end-to-end scenarios (`PUB-T-28` to `PUB-T-35`) run the journeys through both units: a fresh installation up to the first edit, an outage and recovery, German-only content, an unavailable login unit, the life cycle of an editor account, a check of every public page for cookies, outside requests, and accessibility, an invalid configuration, and images. 125 unit tests check the modules one by one with the values of the worked examples (§10). No test calls the internet or a language model, and no test waits for a minute: the clock is set by the test. One property cannot be tested at all, the memory-hard storage of passwords; the test checks what can be seen (§17, *Test Coverage Matrix & Untested Justifications*).

## H7. Key decisions

| Question | Decision | Reason |
| --- | --- | --- |
| Q2 Changelog source | Editors write changelog entries by hand | The project application promises a changelog maintained in the CMS |
| Q3 CMS unavailable | Last version of every page, plus a built-in text for legal pages | Legal pages must always be reachable (school rule) |
| Q4, Q7, Q9 Languages | German and English as an own story (Should); German is default and fallback | English must not delay the German legal pages |
| Q5 Editor access | Admin panel through the proxy, with separate editor accounts | Editors work from any browser; no dependency on Identity (R3) |
| Q6 Legal texts | Templates with placeholders | Every operator is responsible for their own installation |
| Q8, Q10 First administrator | The first visitor of the admin panel registers; the status page warns until then | Decided by the owner; the warning makes the open time visible |
| Q28 Unpublished legal page | The German version of a legal page cannot be unpublished | Otherwise an editor could make a legal page disappear |
| Q17 Fresh stack is degraded | A fresh installation may show `cms` as `degraded` until an administrator registers | Keeps the warning of Q10 without a second way to create an administrator |
| Q18 Reason on the status page | The status page names the checks that failed | `degraded` alone does not tell the operator what to do |
| Q19 Changelog at a release | Writing the changelog entry is a release step; the seed keeps one entry | Follows Q2: entries are written by hand |
| A55 Who builds the `web` part | `trutscf1` builds the `web` modules of this feature; `schwaigc` reviews every change to `apps/web` | Decided by `schwaigc` as owner of the `web` track (review of !18) |
| A57 Theme on public pages | The theme switcher is shown only to signed-in members; visitors see the default theme | No cookie without a session ([PUB-NF-3]); decided by `schwaigc` as owner of R4 |

# Part S — Specification (normative)

## 0. Synthesis Context

### Development Path

Path A (frontloaded). Phase 1 (grill) and Phase 3 (artifact interactions) were completed on 2026-10-06. From Phase 2, the legal questions Q12–Q14 are still open with the school management (§13); they concern the content of the team's own installation, not the behavior specified here. The Phase 4 gate was passed with the approval of `schwaigc`; §16 (Phase 5) and §17 (Phase 6) were written on 2026-10-20 with the assumptions A37 to A54 of the question log, which the owner reviews. The review of !18 by `schwaigc` (2026-10-20, changes requested) was worked in on 2026-10-27 with the assumptions A55 to A61 of round 13 of the question log.

### Synthesis Dependencies

- [scaffolding.md](scaffolding.md) — the `cms` and `web` units, the reverse proxy, the health report, the status page, the content management capability [SCF-C-5].
- [scaffolding.track-web.md](scaffolding.track-web.md) — the configuration `WebConfig` and the start check of `web` (M1, M7), its layout (M8), and the routes `/health`, `/status`, and `/api/*` (M2, M5, M6) that lie outside the public address space.
- [design-system.md](design-system.md) — design tokens and themes of the public pages (story DSA-US-1).
- [identity.md](identity.md) — the member session ([PUB-F-12], [PUB-F-33]) and the bot protection with its notice text ([PUB-F-23]).

### Synthesis Scope

The `cms` and `web` parts of this feature, the content contracts, and the setup guide step can be synthesized from this document, the work items, `STACK.md`, and the dependencies above: the modules and slices are in §16, the tests in §17. Not specified here, and stubbed in the tests: the session check and the bot protection notice (Identity concept), the address of the dashboard, the registration page, and the login page (configuration values with placeholder defaults, §8).

### Owner

trutscf1, per [ROADMAP.md](../ROADMAP.md).

## 1. Purpose & Goal Trace

**Feature goal:** Visitors and members read landing page, help center, changelog, and legal pages without login, and editors maintain them without code.

**Serves:** `G-1.S3` in [GOAL.md](../GOAL.md), as stated in the *Serves* column of [ROADMAP.md](../ROADMAP.md): the project application lists a public landing page, a help center, and a changelog maintained through a headless content management system; the legal pages are a school rule (`docs/anforderungen_software_projekte.md`, section 13). No non-goal is touched: the terms page sells nothing (`G-1.N3`).

## 2. Ubiquitous Language & Context

Defined in [CONTEXT.md](../CONTEXT.md) and used here exactly: **unit**, **health report**, **dependency check**, **public page**, **legal page**, **content entry**, **content language**, **editor account**, **CMS administrator**, **help context**, **legal template**, **built-in legal text**.

Used only in this document:

- **Admin panel**: the part of the `cms` unit in which content editors sign in and maintain content entries.
- **Content interface**: the part of the `cms` unit from which the `web` unit reads published content entries.
- **Publish**: to change a content entry from draft to published in one content language.
- **Content store**: the database of the `cms` unit that holds the content entries and the editor accounts ([PUB-F-1]).
- **Content group**: one of four sets of published content entries that the `web` unit loads and holds together: `landing` (sections and their images), `help` (categories and articles), `changelog`, `legal` (§16).
- **Held content**: the last successfully loaded version of a content group and its image files in the `web` unit; the "last version" of [PUB-F-8].
- **Fixed text**: a text of the public pages that belongs to the web client and not to a content entry (§8).

## 3. User Stories & Acceptance Criteria

The user stories and their acceptance criteria are the work items in [work-items/public-content/](../work-items/public-content/feature.md); they are not repeated here (P-DOC-6).

## 4. Functional Requirements

| ID | Title | Requirement | Derives from |
| --- | --- | --- | --- |
| PUB-F-1 | Own content store | The `cms` unit MUST keep all content entries and editor accounts in a database of its own, which no other unit reads or writes. | PUB-AC-1.1 (CMS container) |
| PUB-F-2 | Content types | The `cms` unit MUST offer exactly the content types of §8: landing section, help category, help article, changelog entry, legal page, image. | PUB-AC-1.2 (Content types) |
| PUB-F-3 | Two roles | The `cms` unit MUST have exactly two roles. An editor MUST be able to create, edit, publish, and unpublish every content entry, within the limits of [PUB-F-24] (fixed legal pages). A CMS administrator MUST be able to do the same and to create and delete editor accounts. An editor MUST NOT be able to create or delete editor accounts. | PUB-AC-1.3 (Editor roles) |
| PUB-F-4 | No anonymous access | The admin panel MUST be reachable under the proxy path prefix of `cms` and MUST show a person without an editor session only the login form. The content interface MUST answer only requests that carry the access token of the `web` unit and MUST refuse all others with [PUB-E-2] (unauthorized content request). | PUB-AC-1.3 (Editor roles) |
| PUB-F-5 | Draft and published | A content entry MUST be either draft or published, separately per content language. Public pages MUST show only published versions. | PUB-AC-1.4 (Cached delivery) |
| PUB-F-6 | Refresh interval | The `web` unit MUST show a published, changed, or unpublished content entry on its public page at most `CONTENT_REFRESH_SECONDS` seconds after the editor's action (configuration value, default 60). | PUB-AC-1.4 (Cached delivery), PUB-AC-4.4 (Maintained in the CMS) |
| PUB-F-7 | Seed on first start | When the `cms` unit starts and holds no content entry, it MUST create the seed content of §8 in German and English, all published. When it holds at least one content entry, it MUST NOT create, change, or delete any. | PUB-AC-1.5 (Seed content) |
| PUB-F-8 | Last version | When the content interface does not answer, the `web` unit MUST show every public page in the version it loaded last, as described in [PUB-E-1] (CMS unreachable). | PUB-AC-1.6 (CMS unavailable) |
| PUB-F-9 | Administrator check | The health report of `cms` MUST contain the non-essential dependency check `administrator-account`. It MUST be `down` while no CMS administrator exists and `ok` otherwise. | PUB-AC-1.7 (Unclaimed administrator) |
| PUB-F-10 | First administrator | While no CMS administrator exists, the admin panel MUST show a registration form; the first person who submits it becomes CMS administrator. Once one exists, the admin panel MUST NOT offer registration. | PUB-AC-1.7 (Unclaimed administrator) |
| PUB-F-11 | Landing page | The `web` unit MUST show the landing page at `/de` and `/en` to a person without a session. It MUST consist of the published landing sections in the order the editor set. | PUB-AC-2.1 (Public and from the CMS) |
| PUB-F-12 | Signed-in member | When a person with a valid member session opens `/`, `/de`, or `/en`, the `web` unit MUST redirect them to the dashboard. | PUB-AC-2.6 (Signed-in member) |
| PUB-F-13 | Source and licence | The `cms` unit MUST refuse to save an image without a source and a licence with [PUB-E-4] (image without licence). It does not judge the licence itself: using only licence-free images is the duty of the content editor. Every image of the seed content MUST be licence-free. Icons that are part of the web client MUST be listed with source and licence in the licence notes of the README ([SCF-F-28] of [scaffolding.md](scaffolding.md)). | PUB-AC-2.3 (Licence-free media) |
| PUB-F-14 | Call to action | A landing section of kind `call-to-action` MUST show one link to the registration page and one to the login page. The seed content MUST contain one such section. | PUB-AC-2.4 (Call to action) |
| PUB-F-15 | Meta tags | Every public page MUST carry a title, a description, and the Open Graph properties title, description, type, and address. Title and description come from the content entry; if a description is empty, the description of the first landing section of kind `hero` is used. | PUB-AC-2.5 (Meta tags) |
| PUB-F-16 | Help by category | The start page of the help center MUST list every help category that has at least one published article, in the editor's order, each with the titles of its published articles, ordered alphabetically by title in the content language shown, ignoring upper and lower case. A help article counts as published only if its German version is published ([PUB-F-29]). Each title MUST link to the article's page. | PUB-AC-3.1 (Help articles) |
| PUB-F-17 | Help search | The help center MUST offer a search field. A search term of at least 2 characters MUST return every published help article of the current content language whose title or text contains the term, ignoring upper and lower case, titles matching first. | PUB-AC-3.1 (Help articles) |
| PUB-F-18 | Changelog order | The changelog page MUST show every published changelog entry with version, release date, title, and text, ordered by release date, newest first; entries with the same date are ordered by version, highest first. | PUB-AC-3.2 (Changelog page) |
| PUB-F-19 | Contextual help | The address `/<language>/help/context/<help context>` MUST redirect to the published help article assigned to that help context. If none is assigned, it MUST redirect to the start page of the help center ([PUB-E-6], unknown help context). A help context MUST be assigned to at most one help article. | PUB-AC-3.3 (Contextual help) |
| PUB-F-20 | Help and changelog public | The help center, every help article, and the changelog page MUST be shown to a person without a session. | PUB-AC-3.4 (Public) |
| PUB-F-21 | Footer links | Every page of the `web` unit, including login and registration, MUST show a footer with links to imprint, terms, and privacy policy. The three legal pages MUST be shown to a person without a session. | PUB-AC-4.1 (Footer links) |
| PUB-F-22 | Privacy content | The legal template of the privacy policy MUST contain one paragraph per kind of personal data the product stores (member accounts, editor accounts, uploaded files, audit log with IP addresses, IP addresses kept for the login rate limit) and one per service outside the installation that can be switched on (bot protection, each external login provider, e-mail delivery), each naming the data and its purpose. | PUB-AC-4.2 (Privacy content) |
| PUB-F-23 | Captcha notice | On every page that runs bot protection with a hidden badge, the `web` unit MUST show the notice text that the provider of the bot protection prescribes. When bot protection is switched off by configuration, it MUST NOT show the notice. The text is specified with the bot protection in the Identity concept (R3). | PUB-AC-4.3 (Captcha notice) |
| PUB-F-24 | Fixed legal pages | Exactly three legal pages MUST exist, with the kinds `imprint`, `terms`, and `privacy`. An editor MUST be able to edit them and MUST NOT be able to create a fourth or delete one. The German version of a legal page MUST stay published: the `cms` unit MUST refuse an attempt of either role to unpublish it with [PUB-E-7] (legal page must stay published). The English version MAY be unpublished ([PUB-F-29], missing translation). | PUB-AC-4.1 (Footer links), PUB-AC-4.4 (Maintained in the CMS) |
| PUB-F-25 | Built-in legal text | When the `web` unit has never loaded a legal page from the content interface, it MUST show the built-in legal text of that page in the requested content language. | PUB-AC-4.5 (Built-in legal text) |
| PUB-F-26 | Legal templates | The seed content and the built-in legal text of each legal page MUST be the same legal template. It MUST mark every value the operator has to supply as `[[name of the value]]` and MUST start with the template notice of §8. | PUB-AC-4.6 (Legal templates) |
| PUB-F-27 | Language in the address | The address of every public page MUST start with the content language, `/de` or `/en`, and the page MUST be shown in that language. | PUB-AC-5.1 (Language in the address) |
| PUB-F-28 | First visit | When a person without a session opens `/`, the `web` unit MUST redirect to `/en` if the first language the browser prefers among German and English is English, and to `/de` in every other case. | PUB-AC-5.2 (First visit) |
| PUB-F-29 | Missing translation | When a content entry has no published English version, its page under `/en` MUST show the published German version together with the note of [PUB-U-4] (translation note). When a help article has no published German version, its page MUST behave as [PUB-E-5] (page not found) in both languages. A landing section or a changelog entry without a published German version MUST be left out of its page in both languages. A legal page always has a published German version ([PUB-F-24], fixed legal pages). | PUB-AC-5.3 (Missing translation) |
| PUB-F-30 | Separate language versions | The admin panel MUST let an editor edit and publish the German and the English version of a content entry separately; publishing one MUST NOT change the other. | PUB-AC-5.4 (Maintained per language) |
| PUB-F-31 | Content store check | The health report of `cms` MUST contain the essential dependency check `content-store`. It MUST be `ok` when the content store answers within `HEALTH_CHECK_TIMEOUT_MS` ([SCF-NF-3] of [scaffolding.md](scaffolding.md)) and `down` otherwise. | PUB-AC-1.1 (CMS container) |
| PUB-F-32 | Images through `web` | Every image of a public page MUST be delivered by the `web` unit from the installation's own origin, and the `web` unit MUST keep it together with the last loaded version of its page ([PUB-F-8]). The address of an image is `/media/<id of the image>` (§8); a request for an image the `web` unit does not hold MUST be answered with "not found" and no page. The `cms` unit MUST hand out an image file only to a request that carries the access token of the `web` unit or an editor session, and MUST refuse all others with [PUB-E-2] (unauthorized content request). | PUB-AC-1.3 (Editor roles), PUB-AC-1.6 (CMS unavailable) |
| PUB-F-33 | Unknown session | When the `web` unit cannot find out whether a person has a valid member session — the `identity` unit does not exist yet, does not answer within the time the Identity concept sets for the session check (until it sets one: `SESSION_CHECK_TIMEOUT_MS`, §8), or answers with an error — it MUST treat the person as a person without a session. | PUB-AC-2.6 (Signed-in member) |
| PUB-F-34 | Registration step in the setup guide | The setup guide (the quick start in `README.md`) MUST contain, as a numbered step of its own directly after the start command, the instruction to open the admin panel and register the CMS administrator, and MUST say that until then anyone who reaches the admin panel can do so. | PUB-AC-1.7 (Unclaimed administrator) |
| PUB-F-35 | Image limits | The `cms` unit MUST accept only image files of the types `image/png`, `image/jpeg`, and `image/webp`, determined from the content of the file and not from its name, and only up to 2 097 152 bytes (2 MiB). It MUST refuse every other file with [PUB-E-8] (image not allowed). | PUB-AC-2.3 (Licence-free media) |
| PUB-F-36 | Rich text format | A rich text field MUST hold text in the rich text markup of §8. The `web` unit MUST show it as the structure the markup defines and MUST show everything else, including raw markup elements and links with another scheme than `http`, `https`, or `mailto`, as plain text. | PUB-AC-1.2 (Content types) |
| PUB-F-37 | Editor data rules | The `cms` unit MUST accept an editor account only with a name of 1 to 100 characters, an e-mail address that no other account uses, and a password of 12 to 128 characters, and MUST refuse anything else with [PUB-E-10] (invalid editor data). Only accounts of the role `editor` are created and deleted in the admin panel; the account of the CMS administrator MUST NOT be deleted there. | PUB-AC-1.3 (Editor roles) |

## 5. User Interaction Requirements

| ID | Title | Requirement | Derives from |
| --- | --- | --- | --- |
| PUB-U-1 | Mobile first | Every public page MUST be readable at a width of 320 pixels without horizontal scrolling and MUST use the full width up to 1280 pixels. | PUB-AC-2.2 (Responsive and accessible) |
| PUB-U-2 | Language switch | Every public page MUST show a language switch that names both content languages as text ("Deutsch", "English") and opens the same page in the other language. | PUB-AC-5.1 (Language in the address) |
| PUB-U-3 | Empty search | When a help search finds nothing, the help center MUST show "Keine Hilfeartikel gefunden." under `/de` and "No help articles found." under `/en`. A term shorter than 2 characters MUST start no search. | PUB-AC-3.1 (Help articles) |
| PUB-U-4 | Translation note | A page that shows German text under `/en` MUST show the note "This page is not available in English." above the text, and the text MUST be marked as German for screen readers. | PUB-AC-5.3 (Missing translation) |
| PUB-U-5 | Captcha notice placement | The captcha notice MUST be visible without scrolling past the form it protects, as text, not as an image. | PUB-AC-4.3 (Captcha notice) |

## 6. Non-Functional Requirements

| ID | Title | Requirement | Derives from |
| --- | --- | --- | --- |
| PUB-NF-1 | Accessibility | The automated accessibility check MUST report 0 violations on every public page, in both content languages. | PUB-AC-2.2 (Responsive and accessible), G-1.S2 |
| PUB-NF-2 | No internet requests | A public page MUST NOT load anything from a host other than the installation's own origin: fonts, images, and scripts are served by the installation. | G-1.S1 |
| PUB-NF-3 | No tracking | A public page MUST NOT set a cookie for a person without a session and MUST NOT record which person read which page. | PUB-US-2 (Public landing page) |
| PUB-NF-4 | Minimal editor data | An editor account MUST hold exactly: name, e-mail address, password hash, role. The `cms` unit MUST NOT ask for or store further data about the person. | PUB-US-1 (Set up the headless CMS with Strapi) |
| PUB-NF-5 | Password storage | The password of an editor account MUST be stored only as a hash made with a memory-hard hashing function; the function is named in `STACK.md`. | PUB-US-1 (Set up the headless CMS with Strapi) |
| PUB-NF-6 | No author in public | A public page and the content interface MUST NOT reveal which editor account created or changed a content entry. | PUB-US-1 (Set up the headless CMS with Strapi) |
| PUB-NF-7 | Keeping and deleting editor accounts | An editor account MUST be kept until a CMS administrator deletes it; there is no automatic expiry. Deleting MUST remove name, e-mail address, and password hash in the same action; the content entries of the account stay, without a reference to the person. | PUB-US-1 (Set up the headless CMS with Strapi) |
| PUB-NF-8 | Own data | A content editor MUST be able to see and change the name, e-mail address, and password of their own editor account in the admin panel. | PUB-US-1 (Set up the headless CMS with Strapi) |

## 7. Capability Requirements

Mapped to technology in `documentation/STACK.md`; its capability index lists every row below, and the technology of each is to be chosen by the owner (assumption A46 in the question log). The self-hosted content management system itself is [SCF-C-5] of [scaffolding.md](scaffolding.md); [PUB-C-1] states what this feature needs from it beyond that.

| ID | Title | Requirement | Derives from |
| --- | --- | --- | --- |
| PUB-C-1 | Localized content management | The content management system of [SCF-C-5] MUST offer: content types with fields of the neutral types of §8; one version per content language of an entry, each with its own state draft or published; two roles with an admin panel and editor sessions; the upload of image files; and a read interface that answers only requests carrying a secret token. Acceptance: (a) an entry saved only in German has no English version; (b) publishing the English version leaves the state of the German version unchanged; (c) a read request without the token is refused. | PUB-AC-1.2 (Content types), PUB-AC-1.3 (Editor roles), PUB-AC-5.4 (Maintained per language) |
| PUB-C-2 | Password hashing | One-way hashing of passwords with a memory-hard function, a random salt per password, and a verification operation. Acceptance: hashing the same password twice gives two different hashes; verification accepts the right password and rejects every other; the hash does not contain the password. | PUB-US-1 |
| PUB-C-3 | Safe rich text rendering | Conversion of the rich text markup of §8 into a structured document of blocks and inline parts, without any way to carry markup elements, scripts, or other schemes through. Acceptance: input with a raw markup element yields that text as plain characters; a link with the scheme `javascript` yields plain text; a heading of level 1 yields a plain paragraph. | PUB-AC-1.2 (Content types) |
| PUB-C-4 | Accessibility check of public pages | The automated accessibility checker of [SCF-C-20] MUST be run against every public page of §8 in both content languages. Acceptance: it reports the number of violations per page, and a page with a missing text alternative of an image makes it report at least one. | PUB-AC-2.2 (Responsive and accessible) |

## 8. Data Model

Neutral record types. Every record has a surrogate `id`; references use it (P-DES-5). A field marked *per language* exists once for `de` and once for `en`; each language version has its own `state` and exists only if an editor created it. The named types below are built from the neutral types of the manifest (assumption A42); a length range counts characters.

```text
ContentState   = enum(draft|published)
Language       = enum(de|en)
Text(a..b)     = string of at least a and at most b characters
RichText(a..b) = Text(a..b) in the rich text markup defined below
CalendarDate   = string of the form YYYY-MM-DD that names a real date
EmailAddress   = string of the form local@domain without spaces
HelpContext    = string matching [a-z0-9-]{1,64}

LandingSection {
  id: uuid,
  kind: enum(hero|feature|text-with-image|call-to-action),
  position: integer >= 1,            // unique; order on the landing page
  heading: Text(1..120),             // per language
  body: RichText(0..2000),           // per language
  imageId: optional<uuid>,           // the id of an Image; not allowed for kind call-to-action
  state: ContentState                // per language
}

HelpCategory {
  id: uuid,
  position: integer >= 1,            // unique
  name: Text(1..60)                  // per language; both languages are required
}

HelpArticle {
  id: uuid,
  categoryId: uuid,                  // the id of a HelpCategory; exactly one
  helpContext: optional<HelpContext>,   // unique among help articles
  title: Text(1..120),               // per language
  body: RichText(1..20000),          // per language
  description: Text(0..160),         // per language; meta description
  state: ContentState                // per language
}

ChangelogEntry {
  id: uuid,
  version: string matching <integer>.<integer>.<integer>,   // unique
  releaseDate: CalendarDate,
  title: Text(1..120),               // per language
  body: RichText(1..5000),           // per language
  state: ContentState                // per language
}

LegalPage {
  id: uuid,
  kind: enum(imprint|terms|privacy), // unique; exactly three records exist
  title: Text(1..120),               // per language
  body: RichText(1..50000),          // per language
  state: ContentState                // per language
}

Image {
  id: uuid,
  file: binary,                      // PNG, JPEG, or WebP by content, at most 2 097 152 bytes ([PUB-F-35])
  alternativeText: Text(0..200),     // per language; empty only for decorative images
  source: Text(1..300),              // where the image comes from; required
  licence: Text(1..100)              // name of the licence; required
}

EditorAccount {
  id: uuid,
  name: Text(1..100),
  email: EmailAddress,               // unique
  passwordHash: string,
  role: enum(administrator|editor)
}
```

A help context names a place in the web client, not an article: it is declared in the shared contracts by the feature that places the help link, and a help article points to it. This concept declares none; the features of the web client add theirs.

**Rich text markup.** A rich text field holds lines of text. The following, and nothing else, has a meaning ([PUB-F-36]); every other character sequence, including `<`, `>`, and `![`, is plain text.

| Element | Written as | Result |
| --- | --- | --- |
| Paragraph | text lines; a blank line ends the paragraph | one paragraph |
| Heading | a line that starts with two, three, or four `#` characters and a space | a heading of level 2, 3, or 4; a line that starts with one `#` and a space is a paragraph |
| Bold | `**text**` | bold text |
| Italic | `*text*` | italic text |
| Unordered list | consecutive lines that start with a hyphen and a space | one list, one item per line |
| Ordered list | consecutive lines that start with a number, a full stop, and a space (`1.`, `2.`, and so on) | one numbered list, one item per line |
| Link | `[text](address)` where the address starts with `http://`, `https://`, `mailto:`, or `/` | a link; with any other start the whole sequence is plain text |

**Configuration.** Every value comes from the environment (P-DES-6, [SCF-NF-8]); a missing required value or one outside its range stops the unit as [SCF-E-1] (invalid configuration) of [scaffolding.md](scaffolding.md), naming the variable and the reason and never the value. The names are those of the example configuration ([SCF-F-17]). The `web` values extend the one configuration shape of `web`, `WebConfig` of the track plan Web ([scaffolding.track-web.md](scaffolding.track-web.md), M1; [SCF-F-9]), and are validated with it at the start (M7); the `cms` value extends the configuration shape of `cms` (module `web-config`, §16).

| Name | Used by | Type | Default | Valid range | Boundary behavior |
| --- | --- | --- | --- | --- | --- |
| `CONTENT_REFRESH_SECONDS` | `web` | integer | 60 | 1 to 60 | 1 and 60 are accepted; 0 and 61 stop the unit |
| `CONTENT_TIMEOUT_MS` | `web` | integer | 2000 | 100 to 30000 | 100 and 30000 are accepted; 99 and 30001 stop the unit |
| `CONTENT_ACCESS_TOKEN` | `cms`, `web` | string, secret | none; the example configuration holds a dummy value | at least 32 characters, no spaces | 32 characters are accepted, 31 or none stop the unit; the value never appears in a log, a response, or a health report |
| `CMS_INTERNAL_URL` | `web` | string, address | the internal address of `cms` (port in [scaffolding.md](scaffolding.md) §8) | starts with `http://` or `https://` | anything else stops the unit |
| `PUBLIC_BASE_URL` | `web` | string, address | the origin of the local stack | starts with `http://` or `https://`, no trailing `/` | anything else stops the unit |
| `SESSION_CHECK_TIMEOUT_MS` | `web` | integer | 500 | 50 to 5000 | 50 and 5000 are accepted; 49 and 5001 stop the unit |
| `DASHBOARD_PATH` | `web` | string, path | `/dashboard` | starts with `/` and lies outside the public address space (below): its first segment is not exactly two lower-case letters | anything else stops the unit; `/debug` is accepted, `/de`, `/de/home`, and `/fr/home` stop it |
| `REGISTRATION_PATH` | `web` | string, path | `/register` | as `DASHBOARD_PATH` | as `DASHBOARD_PATH` |
| `LOGIN_PATH` | `web` | string, path | `/login` | as `DASHBOARD_PATH` | as `DASHBOARD_PATH` |

The paths and the session check time are placeholders until the Identity and web client concepts set theirs (assumption A43). `HEALTH_CHECK_TIMEOUT_MS` is that of [SCF-NF-3].

**Template notice** (first sentence of every legal template):

- German: "Diese Seite ist eine Vorlage. Der Betreiber dieser Installation hat sie noch nicht ausgefüllt."
- English: "This page is a template. The operator of this installation has not filled it in yet."

**Seed content** (all published in both content languages): one landing section of each kind; two help categories with two articles each; one changelog entry for version `0.1.0`; the three legal pages with their legal templates; every image used, with source and licence.

**Fixed texts of the public pages.** Texts that belong to the web client and not to a content entry. The note of [PUB-U-4], the empty search of [PUB-U-3], and the unavailable page of [PUB-E-3] are fixed in their requirements.

| Place | German | English |
| --- | --- | --- |
| Footer link to the imprint | Impressum | Imprint |
| Footer link to the terms | AGB | Terms |
| Footer link to the privacy policy | Datenschutz | Privacy policy |
| Language switch | Deutsch / English | Deutsch / English |
| Label of the help search field | Hilfe durchsuchen | Search help |
| Title of the help center start page | Hilfe | Help |
| Title of the changelog page | Änderungsprotokoll | Changelog |
| Page not found ([PUB-E-5]), title and text | Seite nicht gefunden | Page not found |
| Call to action, link to registration | Registrieren | Register |
| Call to action, link to login | Anmelden | Log in |

**Legal template outline.** The legal templates are one set of text files, held once in the shared contracts and read by the `cms` unit (seed) and the `web` unit (built-in legal text), so that [PUB-F-26] holds. Each template starts with the template notice, then has these headings in this order; the wording under them is written by the author of the templates and is not legal advice (open question Q14). Every value the operator has to supply is written `[[name of the value]]`.

| Kind | Headings (German / English) | Placeholders |
| --- | --- | --- |
| `imprint` | Betreiber / Operator; Kontakt / Contact | `[[name of the operator]]`, `[[street and number]]`, `[[postcode and city]]`, `[[e-mail address]]`, `[[telephone number]]` |
| `terms` | Geltungsbereich / Scope; Nutzung / Use; Konten / Accounts; Haftung / Liability; Änderungen / Changes; Anwendbares Recht / Applicable law | `[[name of the operator]]`, `[[date of the terms]]`, `[[country of the applicable law]]` |
| `privacy` | Verantwortlicher / Controller; Mitgliedskonten / Member accounts; Konten der Redakteure / Editor accounts; Hochgeladene Dateien / Uploaded files; Protokoll / Audit log; IP-Adressen bei der Anmelde-Begrenzung / IP addresses for the login rate limit; Bot-Schutz / Bot protection; Externe Anmeldung / External login providers; E-Mail-Versand / E-mail delivery; Ihre Rechte / Your rights | `[[name of the operator]]`, `[[e-mail address of the data protection contact]]`, `[[retention period of the audit log]]` |

Under each heading of the privacy template from "Mitgliedskonten" to "E-Mail-Versand", the first sentence names the data concerned and the second names the purpose ([PUB-F-22]). The last three services are named even when switched off, with the sentence that they apply only when switched on.

**Addresses of the public pages** (`<l>` is `de` or `en`):

| Page | Address |
| --- | --- |
| Landing page | `/<l>` |
| Help center start | `/<l>/help` |
| Help search | `/<l>/help?q=<search term>` |
| Help article | `/<l>/help/<id of the help article>` |
| Help by context | `/<l>/help/context/<help context>` |
| Changelog | `/<l>/changelog` |
| Legal page | `/<l>/legal/<kind>` |
| Image (no page, no language) | `/media/<id of the image>` |

**Public address space.** The pages above, except the image, form the public address space: the path `/` and every path whose first segment is exactly two lower-case letters `a` to `z` (`/de`, `/en/help`, `/fr`). Only this space is decided by `address-routing` (§16), and only inside it does [PUB-E-5] (page not found) apply. The reverse proxy sends every path under `/` to `web` ([scaffolding.md](scaffolding.md) §8); every path outside the space belongs to the route of another module of `web` and never reaches `address-routing`: `/media/<id>` (`page-frame`), `/health`, `/status`, `/api/docs`, and every other path under `/api` ([scaffolding.track-web.md](scaffolding.track-web.md), M2, M5, M6), and later `DASHBOARD_PATH`, `REGISTRATION_PATH`, and `LOGIN_PATH`. A path outside the space that no route answers gets the not-found page of the `web` unit, drawn by `page-frame` as a page without a content language (§16).

## 9. Error Conditions

| ID | Title | Trigger | Required behavior | Fallback | Derives from |
| --- | --- | --- | --- | --- | --- |
| PUB-E-1 | CMS unreachable | The content interface does not answer within `CONTENT_TIMEOUT_MS` (configuration value, default 2000) or answers with an error. | The `web` unit shows the last loaded version of the page and tries again at the next refresh interval. | A legal page never loaded: built-in legal text ([PUB-F-25]). Any other page never loaded: [PUB-E-3]. | PUB-AC-1.6 (CMS unavailable) |
| PUB-E-2 | Unauthorized content request | A request to the content interface carries no access token or a wrong one. | The `cms` unit answers "not authorized" and returns no content. | None. | PUB-AC-1.3 (Editor roles) |
| PUB-E-3 | Content unavailable | A public page other than a legal page was never loaded and the content interface does not answer. | The `web` unit answers "service unavailable" with a page saying "Inhalt derzeit nicht verfügbar." or "Content is currently unavailable.", including the footer of [PUB-F-21]. | None. | PUB-AC-1.6 (CMS unavailable) |
| PUB-E-4 | Image without licence | An editor saves an image with an empty source or an empty licence. | The `cms` unit refuses to save and names the empty field. | None. | PUB-AC-2.3 (Licence-free media) |
| PUB-E-5 | Page not found | An address in the public address space (§8) names a language other than `de` or `en`, a path below `/de` or `/en` that §8 does not list, an unknown legal kind, or a help article that does not exist or has no published German version. | The `web` unit answers "not found" with a page in the language of the address, German if that language is unknown, including the footer of [PUB-F-21]. | None. | PUB-AC-5.1 (Language in the address) |
| PUB-E-6 | Unknown help context | No published help article is assigned to the help context in the address. | The `web` unit redirects to the start page of the help center in the same language. | None. | PUB-AC-3.3 (Contextual help) |
| PUB-E-7 | Legal page must stay published | An editor or a CMS administrator tries to unpublish the German version of a legal page. | The `cms` unit refuses, leaves the page published, and says that a legal page must stay published in German. | None. | PUB-AC-4.1 (Footer links) |
| PUB-E-8 | Image not allowed | An editor saves an image file whose content is not PNG, JPEG, or WebP, or that is larger than 2 097 152 bytes. | The `cms` unit refuses to save and says which of the two limits was broken. | None. | PUB-AC-2.3 (Licence-free media) |
| PUB-E-9 | Registration closed | Someone submits the registration form of the admin panel while a CMS administrator exists, including the second of two submissions that arrive at the same time. | The `cms` unit refuses, creates no account, and says that registration is closed. | None. | PUB-AC-1.7 (Unclaimed administrator) |
| PUB-E-10 | Invalid editor data | An editor account is saved with a name, e-mail address, or password that breaks [PUB-F-37], or with an e-mail address another account uses. | The `cms` unit refuses to save and names the field. | None. | PUB-AC-1.3 (Editor roles) |
| PUB-E-11 | Invalid content value | A content entry is saved with a value that breaks §8: a length outside its range, a wrong format, a `position`, `version`, or `helpContext` that another entry of the same type already uses, an image on a section of kind `call-to-action`, a missing category, or a help category without both names. | The `cms` unit refuses to save, keeps the stored entry unchanged, and names the field. | None. | PUB-AC-1.2 (Content types), PUB-AC-3.3 (Contextual help) |
| PUB-E-12 | Action not permitted | A person without an editor session asks for anything but the login form, signs in with data that does not match an account, or a signed-in person asks for an action beyond the role: an editor creates or deletes an editor account, anyone deletes the CMS administrator account or a legal page or creates a fourth legal page, or an editor changes the account of someone else. | The `cms` unit refuses and changes nothing; a failed sign-in gets the one message "E-mail address or password is wrong." whichever part is wrong. | None. | PUB-AC-1.3 (Editor roles), PUB-AC-4.1 (Footer links) |

## 10. Worked Examples

**Example 1 — first visit ([PUB-F-28], [PUB-F-12]).**

| Person | Preferred languages of the browser | Opens | Result |
| --- | --- | --- | --- |
| no session | `de-AT, en` | `/` | redirect to `/de` |
| no session | `en-US, de` | `/` | redirect to `/en` |
| no session | `fr, en, de` | `/` | redirect to `/en` |
| no session | `fr, it` | `/` | redirect to `/de` |
| no session | none sent | `/` | redirect to `/de` |
| member session | `en-US` | `/` | redirect to the dashboard |
| member session | any | `/en` | redirect to the dashboard |
| session cookie sent, `identity` does not answer ([PUB-F-33]) | `de-AT` | `/` | redirect to `/de` |

**Example 2 — refresh interval ([PUB-F-6]), with `CONTENT_REFRESH_SECONDS` = 60.** The privacy policy shows text A. At 10:00:00 an editor publishes text B. A visitor at 10:00:20 may see A or B; a visitor at 10:01:00 or later sees B.

**Example 3 — missing translation ([PUB-F-29]).**

| German version | English version | `/de/help/<id>` | `/en/help/<id>` |
| --- | --- | --- | --- |
| published | published | German text | English text |
| published | draft | German text | German text with the note of [PUB-U-4] |
| published | none | German text | German text with the note of [PUB-U-4] |
| draft | published | [PUB-E-5] | [PUB-E-5] |

A landing section or a changelog entry in the state of the last row is left out of the landing page or the changelog page in both languages. A legal page cannot reach that state ([PUB-F-24]).

**Example 4 — content unit down ([PUB-F-8], [PUB-F-25], [PUB-E-3]).**

| Page | Loaded before? | Shown while `cms` is down |
| --- | --- | --- |
| `/de/changelog` | yes, at 09:00 | version of 09:00 |
| `/de/changelog` | never | [PUB-E-3] "Inhalt derzeit nicht verfügbar." |
| `/en/legal/imprint` | yes, at 09:00 | version of 09:00 |
| `/en/legal/imprint` | never | built-in legal text in English |
| image of a landing section on `/de` ([PUB-F-32]) | yes, at 09:00 | image of 09:00, delivered by `web` |

**Example 5 — help search ([PUB-F-17], [PUB-U-3]).** Published German articles: "Dateien hochladen" (text mentions "Ordner") and "Ordner teilen". Under `/de/help`, the term `ordner` returns "Ordner teilen" first (title match), then "Dateien hochladen" (text match). The term `o` starts no search. The term `xyz` shows "Keine Hilfeartikel gefunden."

**Example 6 — administrator check ([PUB-F-9], [PUB-F-10], [PUB-F-31]).** Fresh installation: the health report of `cms` holds the check `content-store` with `essential: true`, `status: ok` and the check `administrator-account` with `essential: false`, `status: down`, so the report's status is `degraded` ([SCF-F-6] of [scaffolding.md](scaffolding.md)). The status page shows the row `cms`, `degraded`, `administrator-account` (§15). A person submits the registration form with name "Ada Admin" and e-mail `ada@example.org`: the editor account is created with role `administrator`, the check becomes `ok`, the status `ok`, and the admin panel shows only the login form from then on.

**Example 7 — legal page stays published ([PUB-F-24], [PUB-E-7]).** The imprint is published in German and English. An editor unpublishes the English version: `/en/legal/imprint` shows the German text with the note of [PUB-U-4]. The editor then tries to unpublish the German version: the `cms` unit refuses with [PUB-E-7], and `/de/legal/imprint` keeps showing the imprint. A CMS administrator who tries the same gets the same refusal.

**Example 8 — rich text ([PUB-F-36]).**

| Input (one line or block) | Result on the public page |
| --- | --- |
| `## Ordner teilen` | a heading of level 2 with the text "Ordner teilen" |
| `# Titel` | a paragraph with the text "# Titel" |
| `Ein **wichtiger** Hinweis` | a paragraph: "Ein ", bold "wichtiger", " Hinweis" |
| `<b>x</b>` | a paragraph with the characters `<b>x</b>`; no bold text |
| `[Start](/de/help)` | a link with the text "Start" to `/de/help` |
| `[Hilfe](javascript:alert(1))` | a paragraph with the characters `[Hilfe](javascript:alert(1))`; no link |
| `![Bild](/media/1)` | a paragraph with the characters `![Bild](/media/1)`; no image |
| `- a` and `- b` on two lines | one list with the items "a" and "b" |

**Example 9 — changelog order ([PUB-F-18]).** Published entries: `0.9.0` of 2026-11-02, `0.1.0` of 2026-10-05, `0.10.0` of 2026-11-02, `0.2.0` of 2026-10-26. The page shows them in this order: `0.10.0`, `0.9.0` (same date, the higher version first, compared number by number: 10 is higher than 9), `0.2.0`, `0.1.0`.

**Example 10 — images ([PUB-F-35], [PUB-F-13], [PUB-E-4], [PUB-E-8]).**

| File | Source | Licence | Result |
| --- | --- | --- | --- |
| PNG, 1 048 576 bytes | "own work" | "CC0-1.0" | saved |
| WebP, 2 097 152 bytes | "own work" | "CC0-1.0" | saved (the limit itself is allowed) |
| JPEG, 2 097 153 bytes | "own work" | "CC0-1.0" | refused with [PUB-E-8], size |
| SVG | "own work" | "CC0-1.0" | refused with [PUB-E-8], type |
| named `logo.png`, content is a PDF | "own work" | "CC0-1.0" | refused with [PUB-E-8], type |
| PNG, 1 024 bytes | empty | "CC0-1.0" | refused with [PUB-E-4], names the field source |

**Example 11 — configuration (§8).** `web` started with `CONTENT_REFRESH_SECONDS=61`, a `CONTENT_ACCESS_TOKEN` of 31 characters, and `CONTENT_TIMEOUT_MS` not set:

```text
Invalid configuration for unit "web":
  CONTENT_REFRESH_SECONDS: expected an integer from 1 to 60
  CONTENT_ACCESS_TOKEN: expected at least 32 characters
```

The exit code is non-zero, no request is accepted, and neither value is printed. `CONTENT_TIMEOUT_MS` falls back to 2000 and is not reported. With `CONTENT_REFRESH_SECONDS=60` and a token of 32 characters, nothing is printed and the unit starts.

**Example 12 — addresses and help contexts ([PUB-F-27], [PUB-F-19], [PUB-E-5], [PUB-E-6]).** Help article `a1` is published in German and English and assigned to the help context `upload-files`; article `a2` has only a draft in German and is assigned to `old-place`.

| Request | Result |
| --- | --- |
| `/fr` | "not found" (404), German page "Seite nicht gefunden" with footer |
| `/en/legal/cookies` | "not found" (404), English page "Page not found" with footer |
| `/de/help/a2` | "not found" (404), German page |
| `/en/help/context/upload-files` | redirect to `/en/help/a1` |
| `/de/help/context/old-place` | redirect to `/de/help` (the article has no published German version) |
| `/en/help/context/unknown-place` | redirect to `/en/help` |
| `/en/help/context/Upload Files` | redirect to `/en/help` (not a valid help context) |
| `/media/<id of an image web holds>` | the image file, status 200 |
| `/media/<unknown id>` | "not found" (404) without a page |
| `/status`, `/health`, `/api/docs` | outside the public address space: answered by the routes of the track Web, never by the not-found page of [PUB-E-5] |

**Example 13 — meta tags ([PUB-F-15]).** `PUBLIC_BASE_URL` is `https://stash.example`; the first hero section has the German body "stash speichert **Ihre** Dateien auf Ihrem eigenen Server."

| Page | Title | Description | `og:type` | `og:url` |
| --- | --- | --- | --- | --- |
| `/de/help/a1`, description "Wie Sie Dateien hochladen." | the article title | "Wie Sie Dateien hochladen." | `article` | `https://stash.example/de/help/a1` |
| `/de/help/a3`, empty description | the article title | "stash speichert Ihre Dateien auf Ihrem eigenen Server." (plain text of the hero body) | `article` | `https://stash.example/de/help/a3` |
| `/de/changelog`, no hero section exists | "Änderungsprotokoll" | "Änderungsprotokoll" (the title) | `website` | `https://stash.example/de/changelog` |
| `/de`, hero body of 200 characters | the heading of the first hero section | its first 160 characters | `website` | `https://stash.example/de` |

## 11. Integration Points

Where this feature meets other parts of the system. The interferences behind each point are in §14.

| Point | Between | What crosses it | Specified in |
| --- | --- | --- | --- |
| Content interface | `web` → `cms` | Published content entries and image files, requested with the access token of the `web` unit | [PUB-F-4], [PUB-F-5], [PUB-F-32], [PUB-E-1], [PUB-E-2] |
| Admin panel | browser of a content editor → reverse proxy → `cms` | Login, content entries, editor accounts, under the proxy path prefix of `cms` | [PUB-F-3], [PUB-F-4], [PUB-F-10]; routing in [scaffolding.md](scaffolding.md) §7 |
| Health report of `cms` | `cms` → status page of `web` | The dependency checks `content-store` and `administrator-account` | [PUB-F-9], [PUB-F-31]; contract in [scaffolding.md](scaffolding.md) §7 |
| Member session | `web` → `identity` | The question whether a request carries a valid member session | [PUB-F-12], [PUB-F-33]; answer specified in [identity.md](identity.md) |
| Bot protection notice | `identity` concept → `web` | The notice text and whether the badge is hidden | [PUB-F-23], [PUB-U-5] |
| Help contexts | features of the web client → shared contracts → `web` | The declared help contexts a help link may name | [PUB-F-19], §8 |
| Design tokens | design system → public pages | Colors, type, spacing, and the four themes | [PUB-U-1], [PUB-NF-1]; [design-system.md](design-system.md) |

## 12. Out of Scope

- The language of the app itself (dashboard, file browser, forms): only public pages have two content languages.
- More than two content languages.
- Signing in to the admin panel with a member account (single sign-on).
- A review step between writing and publishing.
- Generating changelog entries from `CHANGELOG.md` or from commits.
- Comments, ratings, or contact forms on public pages.
- The bot protection itself and the wording of its notice (Identity, R3); this feature only places the notice.
- The correctness of the legal texts of an installation: the operator replaces the legal templates.

## 13. Resolved Questions & ADRs

Verbatim rounds: [public-content.qa-log.md](public-content.qa-log.md). No ADR was needed: no decision changes `GOAL.md` or deviates from a `P-…` ID.

| Q | Title | Decision | Rationale |
| --- | --- | --- | --- |
| Q1 | Deviations | Standing decisions and assumptions A1–A8 apply unchanged | — |
| Q2 | Changelog source | Changelog entries are written by hand in the `cms` unit, one per release; `CHANGELOG.md` stays the developer record | Matches the project application |
| Q3 | CMS unavailable | Last loaded version for every page; built-in legal text for legal pages never loaded | Legal pages must always be reachable |
| Q4 | Content language | German and English | Owner's decision |
| Q5 | Editor access | Admin panel through the proxy with separate editor accounts; the content interface answers only the `web` unit | Editors work from any browser; no dependency on Identity (R3) |
| Q6 | Legal texts | Legal templates with placeholders and a template notice | Every operator is the responsible party of their installation |
| Q7 | Missing translation | German is default and fallback; German text with a note under `/en` | The legal texts are binding in German |
| Q8 | First administrator | The first person who submits the registration form of the admin panel becomes CMS administrator | Owner's decision; the recommendation was creation from configuration |
| Q9 | Two languages in the work items | Own story [PUB-US-5] (public pages in German and English), priority Should | The other stories stay deliverable in German alone |
| Q10 | Unclaimed admin panel | Non-essential dependency check `administrator-account` in the health report of `cms`; the setup guide tells the operator to register right after the first start, as a step of its own ([PUB-F-34]) | Makes the risk of Q8 visible on the status page |
| Q11 | Shared understanding | Confirmed; work items and concept written | — |
| Q16 | School answers | Q12–Q14 are still open; Phase 3 continues without them | They concern the team's own installation, not the product's behavior |
| Q17 | Fresh stack is degraded | [SCF-NF-1] is narrowed: after the start no unit is `down`, and `cms` may be `degraded` only because of `administrator-account` (§15) | Keeps Q8 and Q10 without a second way to create an administrator |
| Q18 | Reason on the status page | The row of a unit that is not `ok` names its checks that are `down` (§15) | `degraded` alone does not tell the operator what to do |
| Q19 | Changelog at a release | The release steps get a step for writing the changelog entry; the seed content keeps the one entry for `0.1.0` (§15) | Follows Q2; a growing seed would be a second source next to the hand-written entries |
| Q20 | Shared understanding | Confirmed; Phase 3 written | — |
| Q28 | Unpublished legal page | The German version of a legal page cannot be unpublished ([PUB-F-24], [PUB-E-7]) | Legal pages must always be reachable (Q3); found in the review of the Phase 4 gate |

Process questions that changed no behavior (Q15, Q21 to Q27, Q29) are only in the question log. The assumptions A37 to A54 of Phases 5 and 6 (configuration ranges, image limits, rich text markup, editor data rules, capabilities, slices) are in round 12 of the question log; the owner reviews them, and a rejected one becomes a numbered question.

The review of !18 by `schwaigc` added two decisions of other owners, recorded in [../qa-log.md](../qa-log.md): Q64 (`schwaigc`, owner of the `web` track: `trutscf1` builds the `web` modules of this feature, `schwaigc` reviews them; §16) and Q65 (`schwaigc`, owner of R4: the theme switcher only for signed-in members; §14, §15). Round 13 of the question log takes them over as A55 and A57 and adds A56 and A58 to A61 (public address space, configuration as an extension of `WebConfig`, pages without a content language, the corrected scaffold row, the product name `stash`).

Accepted risk of Q8: between the first start and the first registration, anyone who reaches the admin panel can become CMS administrator. [PUB-F-9] (administrator check) shows this state; it does not prevent it.

**Open questions for the school management** (legal; not decided by the team or an agent):

| Q | Title | Question |
| --- | --- | --- |
| Q12 | Operator of the team's installation | Who is named as operator in the imprint and as responsible party in the privacy policy of the team's own installation — the school or the project team? |
| Q13 | Lawful basis for editor accounts | On which lawful basis does an operator store name and e-mail address of content editors, and does the team's installation need a consent or an agreement for it? |
| Q14 | Review of the legal templates | Do the shipped legal templates need a review by the school before the final submission? |

## 14. Artifact Interactions & Interferences

The existing parts of the system this feature touches, checked on 2026-10-06 (Phase 3). Each interference is closed by the requirement or the change named in its row.

| Artifact | Interaction | Interference | Resolved by |
| --- | --- | --- | --- |
| Health report of `cms` ([scaffolding.md](scaffolding.md) §7) | `cms` reports the checks `content-store` and `administrator-account`. | A fresh installation reports `degraded`, but [SCF-NF-1] demands `ok` on all units after the start. The public health report shows that no CMS administrator exists; the registration form of the admin panel shows the same, so nothing new is revealed. | [PUB-F-9], [PUB-F-31]; [SCF-NF-1] narrowed (§15, Q17) |
| Status page of `web` ([SCF-F-8]) | The operator reads the state of `cms` there ([PUB-AC-1.7]). | The page shows only `degraded`, not the reason. | [SCF-F-8] and [SCF-U-1] extended (§15, Q18) |
| Reverse proxy ([SCF-F-4]) | The admin panel is served under the prefix of `cms`; the public pages under `/de` and `/en` belong to `web`. | No address of a public page (§8) starts with the prefix of another unit. Image files requested from `cms` directly would be refused by [PUB-F-4]. | [PUB-F-32] |
| Routes of `web` outside the public pages (`/health`, `/status`, `/api/docs`, `/api/*` of [scaffolding.track-web.md](scaffolding.track-web.md); later the dashboard, login, and registration) | The proxy sends every path under `/` to `web`, so these routes and the public pages share one unit. | A rule that answers "any other path" with the public not-found page would swallow these routes. | `address-routing` decides only the public address space of §8 (`claims`, rule 0); `DASHBOARD_PATH`, `REGISTRATION_PATH`, and `LOGIN_PATH` must lie outside it (§8); [PUB-E-5] applies only inside it; [PUB-T-158] |
| Page frame of `web` | The footer with the legal links appears on every page, also on pages other features build (login, dashboard, share links, status page). | A feature that builds its own page frame would lose the footer. Pages such as `/status`, `/health`, and later the dashboard have no `/de` or `/en` in their address, so the frame cannot take the language from it. The track plan Web already has a layout (M8: local font, title, `lang`). Whether legal pages can be read offline is not decided here. | [PUB-F-21]; the footer is part of the one page frame of `web` (architecture, §16), which builds on M8 of [scaffolding.track-web.md](scaffolding.track-web.md); a page without a content language sets its page language itself, gets the footer in that language and no language switch (`page-frame` rules 2 to 4, [PUB-T-160]). Offline reading belongs to [offline-mode.md](offline-mode.md). |
| Theme memory of the design system ([DSA-F-2] of [design-system.md](design-system.md), R4) | `page-frame` draws every page with the design tokens and themes; R4 remembers a chosen theme in the cookie `stash-theme`. | A theme switcher shown to a person without a session would set that cookie, against [PUB-NF-3] (no cookie without a session). | The theme switcher is shown only to signed-in members (decision of `schwaigc` as owner of R4, Q65 of [../qa-log.md](../qa-log.md)); a person without a session sees the default theme and gets no cookie: `page-frame` rule 10, [PUB-T-146], [PUB-T-159]; change to `design-system.md` (§15) |
| Member session ([identity.md](identity.md)) | `web` asks whether a visitor is a signed-in member ([PUB-F-12]). | Identity is built later and can be down; the landing page must still open. A person without a session gets no cookie ([PUB-NF-3]), so the language is carried by the address, never by a cookie. | [PUB-F-33], [PUB-F-27] |
| Bot protection ([IDN-F-5], captcha) | `web` places the notice the provider prescribes ([PUB-F-23]). | The Identity concept does not hold the notice text or a setting for the hidden badge yet. | Change to `identity.md` (§15) |
| Personal data of other features | The privacy template names every kind of personal data and every outside service ([PUB-F-22]). | The list goes stale when a feature stores a new kind of personal data, for example the IP address in the audit log ([TPM-AC-4.2]). | [PUB-F-22] extended; a feature that adds a kind of personal data adds its paragraph to the legal template in the same MR |
| Configuration of `web` (`WebConfig`, M1 and M7 of [scaffolding.track-web.md](scaffolding.track-web.md)) | §8 adds nine `web` values: refresh, timeouts, access token, addresses, and paths. | [SCF-F-9] allows one configuration shape per unit; a second shape in `content-contracts` would be validated in a second place, after the start check of M7. | The nine values extend `WebConfig` in the contracts folder `web` (module `web-config`, §16) and are validated by `loadWebConfig` at the start; the token of `cms` extends the shape of `cms` |
| Shared contracts ([SCF-F-9]) | Help contexts are declared there by the feature that places a help link (§8). | None: this feature declares no help context, and an undeclared one leads to the help center ([PUB-E-6]). | — |
| `CHANGELOG.md` and the release steps (`WORKFLOW.md`, "Releases") | The public changelog is written by hand (Q2), next to the generated developer changelog ([SCF-F-16]). | Nothing reminds the team to write the public entry at a release. | Release step (§15, Q19) |
| Scaffold on `dev` (`apps/web`, `docker-compose.yml`) | The application in `apps/web` shows the placeholder page of the template at `/`; the local stack has a relational and a document database and no `cms` service. | The placeholder occupies the address of the landing page and links to hosts on the internet ([PUB-NF-2]). The content store must not share its data with another unit ([PUB-F-1]). | The template placeholder is replaced earlier, by M8 of [scaffolding.track-web.md](scaffolding.track-web.md) (SCF-US-8 slice 1), with a plain page without links to the internet; [PUB-US-2] (public landing page) then replaces that page with the redirect of `/` ([PUB-F-28]). The `cms` service and its content store are added with [PUB-US-1] (set up the headless CMS) |

## 15. Schema Extensions

**Contracts.** None. The health report contract of [scaffolding.md](scaffolding.md) §7 stays unchanged: the name of a dependency check is free text, so `content-store` and `administrator-account` need no new field. The content types of §8 are new and extend nothing.

**Required changes to other documents.** This concept does not edit documents of other owners (P-TEAM-4); each change is in the inbox of the handle named.

| Document | Change | Reason | Carried out by |
| --- | --- | --- | --- |
| [scaffolding.md](scaffolding.md), [SCF-NF-1] | New wording: the local stack MUST start without internet access with no unit `down`; a unit MAY be `degraded` only because of a non-essential check, and on a fresh installation that is exactly `administrator-account` of `cms`. | Q17 | `trutscf1`, with the migration of `scaffolding.md` (legacy format, P-DOC-5) |
| [scaffolding.md](scaffolding.md), [SCF-F-8] and [SCF-U-1] | The row of a unit whose status is not `ok` MUST also show, as text, the names of its dependency checks that are `down`. | Q18, [PUB-AC-1.7] | `trutscf1` in the concept (same migration); `schwaigc` in the status page (#16) |
| [design-system.md](design-system.md), [DSA-F-2] | The theme switcher is shown only to signed-in members; a person without a session sees the default theme, and no theme cookie is set for them. | [PUB-NF-3], Q65 of [../qa-log.md](../qa-log.md) | `schwaigc`, owner of R4, when he next changes `design-system.md` |
| [identity.md](identity.md) | Specify the notice text the provider of the bot protection prescribes, in German and English, and the configuration value that hides the badge. | [PUB-F-23] | `tschudea07` |
| `WORKFLOW.md`, "Releases" | New step: a content editor writes and publishes the changelog entry of the release in the team's installation. | Q19 | `trutscf1`, in the MR that delivers [PUB-US-3] (help center and changelog) |

## 16. Architecture & Vertical Slices

The feature lives in two units, `cms` and `web`, plus the shared contracts. The unit split and routing are fixed by [scaffolding.md](scaffolding.md) §16 and its ADR; this chapter adds the modules inside them. A module is named by its job; `STACK.md` decides how a module becomes files and packages (P-DES-3). Every module hides much behavior behind a small interface (P-DES-1): the `web` side has one operation to read content, one to decide an address, one to build a page, and one to wrap it.

**Who builds and reviews.** `trutscf1` builds every module of this chapter as owner of R11. The `cms` modules, `content-contracts`, and the contracts folder `cms` lie in his own track (Platform & cms, [scaffolding.md](scaffolding.md) §16). The five `web` modules (`content-client`, `address-routing`, `rich-text`, `page-resolution`, `page-frame`) and `web-config` lie in `apps/web` and the contracts folder `web`, the owned paths of the track Web of `schwaigc` ([scaffolding.track-web.md](scaffolding.track-web.md)). For these paths the owner of the track decided that `trutscf1` builds them and `schwaigc` reviews (Q64 of [../qa-log.md](../qa-log.md)), in place of the issue request of the track rule (`WORKFLOW.md`, "Team"): every MR of this feature that changes `apps/web` or the contracts folder `web` gets the review of `schwaigc`. The slice table below names builder and reviewer per slice.

### Module Overview & Tree

```text
apps/cms                    unit cms
├── content-model           content types, language versions, states, validation, legal page rules, images
├── editor-accounts         roles, accounts, first administrator, sign-in, password storage
├── content-interface       the read interface for the web unit: token check, published versions only, image files
├── content-seed            example content on the first start
└── cms-health              health report with the checks content-store and administrator-account
apps/web                    unit web (track Web of schwaigc; built by trutscf1, reviewed by schwaigc)
├── content-client          reads the content interface, keeps the last version of every group and its images
├── address-routing         language of the address, first visit, signed-in redirect, unknown addresses
├── rich-text               rich text markup to a safe structure
├── page-resolution         content group + route + language to a page, a redirect, or an error page
└── page-frame              footer, language switch, meta tags, notices, layout, no tracking
packages/contracts          shared by both units
├── content-contracts       contracts folder cms: shapes of the content interface, legal templates, fixed texts
└── web-config              contracts folder web: the web values of §8 as an extension of WebConfig
README.md                   setup-guide: the registration step of the quick start
```

### Vertical Slices Breakdown

The slices and their issues stand in the story files (P-DOC-6); this table says which modules each slice builds or extends. Each slice is demoable on its own and fits into 4 h (`WORKFLOW.md`, "Issues and weight"); weights are the proposal of assumption A48.

| Story | Slice | Weight | Modules built or extended | Built by / reviewed by | Demo |
| --- | --- | --- | --- | --- | --- |
| PUB-US-1 | 1 — CMS runs with its content types | 3 | `content-contracts` (shapes, legal templates), `content-model`, `content-seed`, `cms-health` (check `content-store`) | `trutscf1` / another team member | the start command of the local stack: the `cms` container reports `ok` and holds the seed content |
| PUB-US-1 | 2 — Editor roles and first administrator | 2 | `editor-accounts`, `content-interface`, `cms-health` (check `administrator-account`), `setup-guide` | `trutscf1` / another team member | the status data of `cms` is `degraded` with `administrator-account` until the first registration; content requests without the token are refused |
| PUB-US-1 | 3 — Delivery by `web` | 3 | `web-config`, `content-client`, `address-routing`, `rich-text`, `page-resolution` (legal pages, unavailable page), `page-frame` (frame, meta tags, no tracking), fixed texts | `trutscf1` / `schwaigc` (changes `apps/web` and the contracts folder `web`) | a legal page at `/de/legal/privacy` shows the published text, changes after 60 s, and survives a stopped `cms` with its images |
| PUB-US-2 | 1 — whole story | 3 | `page-resolution` (landing page), `address-routing` (signed-in redirect), `page-frame` (layout, accessibility check) | `trutscf1` / `schwaigc` (changes `apps/web`) | `/de` shows the landing page; a signed-in member lands on the dashboard |
| PUB-US-3 | 1 — whole story | 3 | `page-resolution` (help center, search, contextual help, changelog) | `trutscf1` / `schwaigc` (changes `apps/web`) | the help center with search, an article, a help context link, and the changelog |
| PUB-US-4 | 1 — whole story | 3 | `page-frame` (footer, notice slot), `content-contracts` (completed legal templates), `page-resolution` (built-in legal text) | `trutscf1` / `schwaigc` (changes `apps/web`) | the three legal pages from the footer, also with a never-reached `cms` |
| PUB-US-5 | 1 — whole story | 3 | `address-routing` (first visit), `page-frame` (language switch, translation note), `page-resolution` (missing translation), `content-model` (language versions checked) | `trutscf1` / `schwaigc` (changes `apps/web`) | `/` leads to `/en` for an English browser; an article without English shows German with the note |

Order: US-1 slice 1, then 2, then 3; US-2 to US-5 each depend only on US-1 (slice 3 supplies the web foundation they extend).

### Module Specifications

All records use the neutral types and the named types of §8. `Language` and `ContentState` are those of §8. A module's *Traces to* line lists the requirements it implements; *Requires* lists the capabilities (§7) and the other modules it calls.

**Shared records (`content-contracts`).** Everything that crosses the content interface; a version map holds only the languages whose version is `published`.

```text
ContentGroup = enum(landing|help|changelog|legal)
RouteKind    = enum(landing|help-start|help-article|help-context|changelog|legal)
LegalKind    = enum(imprint|terms|privacy)

LandingText   { heading: string, body: string }
HelpText      { title: string, body: string, description: string }
ChangelogText { title: string, body: string }
LegalText     { title: string, body: string }

PublishedLandingSection { id: uuid, kind: enum(hero|feature|text-with-image|call-to-action),
                          position: integer, imageId: optional<uuid>, text: map<Language, LandingText> }
PublishedImage          { id: uuid, mediaType: string, alternativeText: map<Language, string> }
PublishedHelpCategory   { id: uuid, position: integer, name: map<Language, string> }
PublishedHelpArticle    { id: uuid, categoryId: uuid, helpContext: optional<string>, text: map<Language, HelpText> }
PublishedChangelogEntry { id: uuid, version: string, releaseDate: string, text: map<Language, ChangelogText> }
PublishedLegalPage      { id: uuid, kind: LegalKind, text: map<Language, LegalText> }

ContentGroupData {
  group: ContentGroup,
  landingSections: list<PublishedLandingSection>,   // group landing, else empty
  images: list<PublishedImage>,                     // group landing, else empty
  helpCategories: list<PublishedHelpCategory>,      // group help, else empty
  helpArticles: list<PublishedHelpArticle>,         // group help, else empty
  changelogEntries: list<PublishedChangelogEntry>,  // group changelog, else empty
  legalPages: list<PublishedLegalPage>              // group legal, else empty
}

ImageFile { mediaType: string, bytes: binary }

legalTemplate(kind: LegalKind, language: Language) -> string   // template notice first, outline of §8
fixedText(key: string, language: Language) -> string           // the fixed texts of §8
```

Traces to: [PUB-F-22], [PUB-F-26], [PUB-F-25]. Requires: the shared contracts package of [SCF-F-9]; it lives in the contracts folder `cms`, because `cms` provides the content interface (one folder per unit, owned by the unit's owner, [scaffolding.md](scaffolding.md) §16).

**`web-config`** (contracts folder `web`)

```text
WebConfig += {                         // extends WebConfig of M1 of the track plan Web; one shape per unit (SCF-F-9)
  CONTENT_REFRESH_SECONDS, CONTENT_TIMEOUT_MS, CONTENT_ACCESS_TOKEN, CMS_INTERNAL_URL, PUBLIC_BASE_URL,
  SESSION_CHECK_TIMEOUT_MS, DASHBOARD_PATH, REGISTRATION_PATH, LOGIN_PATH   // types, defaults, ranges: §8
}

rules:
  1. loadWebConfig (M1) validates these values together with those of the track plan, in one place; the start
     command (M7) prints every problem and exits before Next.js starts (SCF-E-1, §10 example 11).
  2. A problem names the variable and the reason, never the value; a secret is never printed (CONTENT_ACCESS_TOKEN).
  3. cms reads CONTENT_ACCESS_TOKEN through the configuration shape of cms (contracts folder cms) with the same
     range; no second configuration shape of web exists.
```

Traces to: [PUB-F-4], [PUB-F-6], [PUB-F-12], [PUB-F-33], [PUB-E-1]. Requires: `WebConfig`, `loadWebConfig` (M1), and the start command (M7) of [scaffolding.track-web.md](scaffolding.track-web.md).

**`content-model`** (unit `cms`)

```text
save(actor: Actor, type: ContentType, entry: map<string,string>, language: Language) -> Entry
publish(actor: Actor, type: ContentType, id: uuid, language: Language) -> Entry
unpublish(actor: Actor, type: ContentType, id: uuid, language: Language) -> Entry   // may fail with PUB-E-7
delete(actor: Actor, type: ContentType, id: uuid) -> nothing
saveImage(actor: Actor, file: binary, source: string, licence: string,
          alternativeText: map<Language,string>) -> Image
  errors: PUB-E-4, PUB-E-7, PUB-E-8, PUB-E-11, PUB-E-12

rules:
  1. The only content types are those of §8 and they live in the cms unit's own content store.
  2. Before any change, ask editor-accounts.canDo(actor.role, action); on false raise PUB-E-12.
  3. save validates every field against §8 and raises PUB-E-11 with the first broken field;
     a stored entry is never changed by a refused save.
  4. A language version saved for the first time has state draft. publish and unpublish change
     the state of the named language only (PUB-F-30).
  5. LegalPage: exactly three records exist, one per kind. create of a fourth and delete of any raise
     PUB-E-12. unpublish of language de raises PUB-E-7 for both roles; language en may be unpublished.
  6. saveImage checks in this order: media type from the file content (png, jpeg, webp) and size
     (at most 2097152 bytes) -> PUB-E-8; source non-empty, then licence non-empty -> PUB-E-4.
  7. No stored record names or references the actor (PUB-NF-6).
```

Traces to: [PUB-F-1], [PUB-F-2], [PUB-F-5], [PUB-F-13], [PUB-F-24], [PUB-F-30], [PUB-F-35], [PUB-NF-6], [PUB-E-4], [PUB-E-7], [PUB-E-8], [PUB-E-11]. Requires: [PUB-C-1]; `editor-accounts`.

**`editor-accounts`** (unit `cms`)

```text
hasAdministrator() -> boolean
registerFirstAdministrator(name: string, email: string, password: string) -> EditorAccount
createEditor(actor: Actor, name: string, email: string, password: string) -> EditorAccount
deleteEditor(actor: Actor, id: uuid) -> nothing
changeOwn(actor: Actor, name: optional<string>, email: optional<string>, password: optional<string>) -> EditorAccount
signIn(email: string, password: string) -> Session
canDo(role: enum(administrator|editor), action: enum(content.write|content.publish|account.create|account.delete)) -> boolean
  errors: PUB-E-9, PUB-E-10, PUB-E-12

rules:
  1. registerFirstAdministrator runs as one atomic step: if hasAdministrator() is true it raises PUB-E-9;
     of two simultaneous calls exactly one succeeds. The account gets role administrator.
  2. Data rules of PUB-F-37 (name, e-mail address unique, password 12 to 128 characters) raise PUB-E-10 naming the field.
  3. The password is stored only as the hash of PUB-C-2 (PUB-NF-5). An account holds id, name, email,
     passwordHash, role and nothing else (PUB-NF-4).
  4. canDo: role editor -> content.write and content.publish true, account.create and account.delete false;
     role administrator -> all four true.
  5. createEditor creates role editor only. deleteEditor deletes accounts of role editor only and removes
     name, e-mail address, and hash in the same step; content entries are untouched (PUB-NF-7).
     Deleting the administrator account raises PUB-E-12.
  6. changeOwn changes the actor's own account only; another account raises PUB-E-12 (PUB-NF-8).
  7. signIn failure, whatever part is wrong, raises PUB-E-12 with the one message of §9.
  8. The admin panel shows a person without session only the login form, or the registration form while
     hasAdministrator() is false (PUB-F-4, PUB-F-10).
```

Traces to: [PUB-F-3], [PUB-F-4], [PUB-F-10], [PUB-F-37], [PUB-NF-4], [PUB-NF-5], [PUB-NF-7], [PUB-NF-8], [PUB-E-9], [PUB-E-10], [PUB-E-12]. Requires: [PUB-C-1], [PUB-C-2].

**`content-interface`** (unit `cms`)

```text
getGroup(token: optional<string>, group: ContentGroup) -> ContentGroupData
getImageFile(token: optional<string>, session: optional<Session>, id: uuid) -> ImageFile
  errors: PUB-E-2

rules:
  1. A missing token, or one different from CONTENT_ACCESS_TOKEN, raises PUB-E-2 and returns nothing.
     getImageFile also accepts an editor session.
  2. getGroup returns, per entry, only language versions whose state is published; an entry without any
     published version is left out; images are those of the returned landing sections.
  3. No result holds an editor account, an author, or the source or licence of an image (PUB-NF-6).
  4. The interface is reachable on the internal address of cms and, like the admin panel, under the proxy
     prefix; the token check applies to both.
```

Traces to: [PUB-F-4], [PUB-F-5], [PUB-F-32], [PUB-NF-6], [PUB-E-2]. Requires: [PUB-C-1]; `content-model`.

**`content-seed`** (unit `cms`)

```text
seedIfEmpty() -> nothing

rules:
  1. Called at every start of cms after the content store answers.
  2. If the number of content entries of all types is 0: create the seed content of §8 in German and
     English, all published; legal pages from legalTemplate(kind, language); the seed images are simple
     generated graphics with source "created for this project" and licence "CC0-1.0".
  3. If it is at least 1: create, change, and delete nothing (PUB-F-7).
  4. The step is all-or-nothing; if it fails, the unit exits with a non-zero code and keeps no entry.
```

Traces to: [PUB-F-7], [PUB-F-13], [PUB-F-14], [PUB-F-26]. Requires: `content-model`, `content-contracts`.

**`cms-health`** (unit `cms`)

```text
health() -> HealthReport      // HealthReport and DependencyCheck of scaffolding.md §8

rules:
  1. unit = cms; check content-store (essential): ok if a read of the content store answers within
     HEALTH_CHECK_TIMEOUT_MS, else down.
  2. check administrator-account (essential: false): ok if editor-accounts.hasAdministrator() is true;
     down otherwise, and also down while content-store is down.
  3. status by SCF-F-6: ok, degraded (only the non-essential check is down), or down.
  4. No host, port, credential, or version of a dependency appears (SCF-NF-4).
```

Traces to: [PUB-F-9], [PUB-F-31]. Requires: `editor-accounts`; [SCF-F-5], [SCF-F-6].

**`content-client`** (unit `web`)

```text
get(group: ContentGroup) -> LoadResult     // LoadResult { data: optional<ContentGroupData>, loadedAt: optional<timestamp> }
image(id: uuid) -> optional<ImageFile>
held(group: ContentGroup) -> optional<ContentGroupData>   // what is held now; never starts an attempt
  errors: PUB-E-1 (never raised to the caller; the caller sees held or absent data)

state per group: data, loadedAt, lastAttemptAt, attemptInFlight
rules:
  1. get(group) starts an attempt when the group was never attempted, or now - lastAttemptAt >= CONTENT_REFRESH_SECONDS,
     and none is in flight. A caller that arrives while an attempt is in flight waits for it and uses its result.
  2. An attempt requests getGroup with CONTENT_ACCESS_TOKEN at CMS_INTERNAL_URL within CONTENT_TIMEOUT_MS. For
     the group landing it then requests every image file it does not hold, each within the same timeout.
  3. On success: replace data and loadedAt; hold the new image files and drop those the data no longer refers to.
     On any failure, or a timeout, of the group or one image: PUB-E-1; keep all held data and images.
  4. lastAttemptAt is set to the time the attempt started, success or not.
  5. If nothing is held after an attempt, get returns data absent; the caller decides (page-resolution).
  6. image(id) returns only a held file; it never asks the content interface. held(group) returns the held data.
```

Traces to: [PUB-F-6], [PUB-F-8], [PUB-F-32], [PUB-E-1], [PUB-E-3]. Requires: `content-contracts`; the clock seam (§16, design for testability).

**`address-routing`** (unit `web`)

```text
claims(path: string) -> boolean
  true for "/" and for every path whose first segment is exactly two lower-case letters a to z; false otherwise

decide(request: RequestInfo) -> RouteDecision       // called only for a path that claims accepts
  RequestInfo   { path: string, acceptLanguage: optional<string>, hasSessionCookie: boolean, cookies: string }
  RouteDecision { kind: enum(redirect|render|notFound), status: integer, redirectTo: optional<string>,
                  language: Language, routeKind: optional<RouteKind>, articleId: optional<string>,
                  context: optional<string>, legalKind: optional<LegalKind>, query: optional<string> }
  errors: PUB-E-5

SessionState = enum(valid|none|unknown)    // answered by the session check of the Identity concept

rules (first match wins; a single trailing slash is ignored):
  0. Only the public address space of §8 is decided here. The request handler of web calls decide only when
     claims(path) is true; every other path (/media/<id>, /health, /status, /api/..., DASHBOARD_PATH,
     REGISTRATION_PATH, LOGIN_PATH) belongs to the route of another module and never reaches this module.
  1. path "/": state = sessionState(request). valid -> redirect DASHBOARD_PATH. Otherwise redirect to /en if
     preferredLanguage(acceptLanguage) is en, else /de.
  2. path /de or /en: state valid -> redirect DASHBOARD_PATH; otherwise render routeKind landing.
  3. /<l>/help (query q optional) -> help-start; /<l>/help/context/<c> -> help-context with context c;
     /<l>/help/<id> -> help-article with articleId id; /<l>/changelog -> changelog;
     /<l>/legal/<kind> with kind in imprint, terms, privacy -> legal. l is de or en.
  4. Any other claimed path (another two-letter language such as /fr, a path below /de or /en that rule 3 does
     not list, an unknown legal kind): notFound, status 404, language de if the first path part is not de or en
     (PUB-E-5).
  5. sessionState: no session cookie -> none without a call. Otherwise ask the session check; no answer within
     SESSION_CHECK_TIMEOUT_MS, an error, or a missing Identity unit -> unknown, treated as none (PUB-F-33).
  6. preferredLanguage: split acceptLanguage at commas; each entry has a tag and a quality (default 1; entries with
     quality 0 are ignored); order by quality, highest first, ties in written order; the first entry whose primary
     subtag, ignoring case, is "de" or "en" decides; none -> de.
```

Traces to: [PUB-F-12], [PUB-F-27], [PUB-F-28], [PUB-F-33], [PUB-E-5]. Requires: the session check of [identity.md](identity.md) (seam).

**`rich-text`** (unit `web`)

```text
render(source: string) -> list<RichBlock>
  RichBlock  { kind: enum(paragraph|heading|unordered-list|ordered-list), level: optional<integer>,
               inlines: list<RichInline>, items: list<list<RichInline>> }   // inlines for paragraph and heading, items for lists
  RichInline { kind: enum(text|bold|italic|link), text: string, address: optional<string> }

rules:
  1. Split the source into lines; blank lines end a paragraph or list. Line starts decide the block (§8 table);
     a line start that is not in the table is a paragraph line.
  2. Inside a line, scan left to right: **x** is bold, *x* is italic, [x](a) is a link when a starts with
     http://, https://, mailto:, or "/" and x and a are non-empty and a holds no space; anything unmatched is text.
     Bold, italic, and link text do not nest.
  3. The result carries no raw markup element and no address with another scheme (PUB-C-3).
```

Traces to: [PUB-F-36]. Requires: [PUB-C-3].

**`page-resolution`** (unit `web`)

```text
resolve(decision: RouteDecision, content: content-client) -> PageResult
  PageResult { status: integer, language: Language, redirectTo: optional<string>, page: optional<PageModel> }
  PageModel  { routeKind: RouteKind, title: string, description: string, ogType: enum(website|article),
               blocks: list<PageBlock>, translationNote: boolean }
  PageBlock  { kind: enum(section|category|article|changelog-entry|legal|search-results|message),
               heading: optional<string>, body: list<RichBlock>, imageId: optional<uuid>, imageAlt: optional<string>,
               links: list<PageLink>, contentLanguage: Language }
  PageLink   { text: string, address: string }
  errors: PUB-E-3, PUB-E-5, PUB-E-6

rules:
  1. pick(textMap, language): if language is en and en is present -> en; else if de is present -> de; else none.
     A result of de under an en request sets translationNote and marks that block contentLanguage de.
  2. visible(entry): the entry has a de version. Landing sections and changelog entries that are not visible are left
     out in both languages; a help article that is not visible, or unknown, is PUB-E-5 and does not count as
     published for lists, search, or help contexts. Legal pages are always visible (PUB-F-24).
  3. A route needs one group: landing -> landing; help-* -> help; changelog -> changelog; legal -> legal.
     get(group) returns no data and the route is not legal: status 503, message block with the fixed text of PUB-E-3.
  4. landing: sections ordered by position, each with its heading and body (rich-text.render), its image, and for kind
     call-to-action two links: REGISTRATION_PATH and LOGIN_PATH with the fixed texts of §8.
  5. help-start: categories in position order that hold at least one visible article, each with its visible articles
     ordered by title in the shown language, ignoring case. With query q: q trimmed; fewer than 2 characters -> normal
     start page; else search results: articles with a version in the shown language whose title or plain text of the
     body contains q, ignoring case; title matches first, then text-only matches, each group ordered by title; no
     match -> the empty-search text of PUB-U-3.
  6. help-article: visible -> the picked version; else PUB-E-5 (status 404). help-context: c matching [a-z0-9-]{1,64}
     and a visible article with that helpContext -> redirect /<l>/help/<id>; otherwise redirect /<l>/help (PUB-E-6).
  7. changelog: visible entries ordered by releaseDate descending, then version descending compared number by number.
  8. legal: group loaded -> the picked version (translation note when de is shown under en). Group never loaded
     -> legalTemplate(kind, language) as the page text, status 200 (PUB-F-25).
  9. Page meta: title and description per §10 example 13 (title of the entry; description of the entry, else the plain
     text of the body of the first hero section cut after 160 characters, else the title). ogType article for a help
     article, else website. The hero text is taken from content.held(landing); if the landing group is not held, the fallback is the title.
```

Traces to: [PUB-F-11], [PUB-F-14], [PUB-F-15], [PUB-F-16], [PUB-F-17], [PUB-F-18], [PUB-F-19], [PUB-F-20], [PUB-F-24], [PUB-F-25], [PUB-F-29], [PUB-U-3], [PUB-E-3], [PUB-E-5], [PUB-E-6]. Requires: `content-client`, `rich-text`, `content-contracts`.

**`page-frame`** (unit `web`)

```text
frame(result: PageResult, route: optional<RouteDecision>, notice: optional<string>, session: SessionState) -> HtmlResponse
route: optional<RouteDecision> // present for a page of the public address space (§8); absent for a page of another feature
notice: optional<string>      // the notice text from the Identity concept; present only when bot protection is on and its badge hidden
session: SessionState         // valid only when the page is drawn for a signed-in member (address-routing, SessionState)

rules:
  1. Every page, including not found, unavailable, login, registration, share-link, and status pages built by other
     features, is drawn by this one frame: header with the language switch, main content, footer (PUB-F-21). It
     builds on the layout of M8 of the track plan Web (local font, title) and replaces its placeholder frame.
  2. Footer: links to /<l>/legal/imprint, /terms, /privacy with the fixed texts of §8, where l is the page
     language (rule 4), also on a page without a content language.
  3. Language switch (PUB-U-2), only when route is present: "Deutsch" and "English" as text; it links to the same
     route in the other language, for an error page to /<other>. A page without a content language in its address
     (route absent: /status, the dashboard, login, registration, the not-found page outside the public address
     space) has no version in the other language and gets no language switch.
  4. Page language = result.language. For a page of the public address space it is the language of the address.
     For a page without a content language it is the language the building feature sets in its PageResult (the
     status page sets en, M5 of the track plan Web); the not-found page outside the public address space is de,
     the default and fallback language (Q7). The document language is the page language; German passages under
     /en carry lang de. Head: title, description, og:title, og:description, og:type, og:url = PUBLIC_BASE_URL +
     the path of the page (PUB-F-15).
  5. translationNote true: the text "This page is not available in English." above the content (PUB-U-4).
  6. notice present: show it as text directly below the form it protects; absent: nothing (PUB-F-23, PUB-U-5).
  7. Exactly one level-1 heading; one column up to 320 pixels, content width up to 1280 pixels (PUB-U-1, PUB-NF-1).
  8. The frame sets no cookie, and the page holds no analytics; every resource address is on the own origin;
     images are /media/<id> (PUB-NF-2, PUB-NF-3, PUB-F-32).
  9. GET /media/<id>: content-client.image(id) -> the file with its media type, else "not found" without a page.
 10. Theme (decision of the owner of R4, Q65 of ../qa-log.md): session valid -> the header holds the theme switcher
     of the design system and the page shows the member's theme (DSA-F-2). Any other state -> no theme switcher,
     the default theme, and no cookie (PUB-NF-3). The public pages of this feature are drawn with the state none:
     address-routing checks the session only at /, /de, and /en, and redirects a valid one (PUB-F-12).
```

Traces to: [PUB-F-15], [PUB-F-21], [PUB-F-23], [PUB-F-32], [PUB-U-1], [PUB-U-2], [PUB-U-4], [PUB-U-5], [PUB-NF-1], [PUB-NF-2], [PUB-NF-3]. Requires: [PUB-C-4]; design tokens, themes, and the theme switcher of [design-system.md](design-system.md); `content-client` (images).

**`setup-guide`** (`README.md`): the quick start of [SCF-F-19] holds, directly after the start command, the numbered step "Open `<origin>/cms` and register the CMS administrator", and the sentence that until then anyone who reaches the admin panel can do so. Traces to: [PUB-F-34].

### Pipeline Flow

Request paths (solid), the refresh of held content (dotted), and the editor's path.

```mermaid
flowchart LR
    visitor([Visitor browser])
    editor([Editor browser])
    proxy{{Reverse proxy<br/>one origin}}

    subgraph webunit["unit web"]
        routing["address-routing"]
        resolution["page-resolution"]
        richtext["rich-text"]
        frame["page-frame"]
        client["content-client<br/>held groups and images"]
    end

    subgraph cmsunit["unit cms"]
        panel["admin panel:<br/>content-model, editor-accounts"]
        iface["content-interface"]
        health["cms-health"]
        seed["content-seed"]
        store[(content store)]
    end

    identity["unit identity<br/>session check"]
    contracts["content-contracts<br/>shapes, templates, texts"]

    visitor --> proxy
    editor --> proxy
    others["other routes of web<br/>/health, /status, /api"]
    proxy -- "/ and /xx/… (public address space)" --> routing
    proxy -- "/media" --> frame
    proxy -- "every other path" --> others
    proxy -- "/cms" --> panel
    routing -. "session state" .-> identity
    routing --> resolution
    resolution --> richtext
    resolution --> client
    resolution --> frame
    client -. "every refresh interval,<br/>with access token" .-> iface
    iface --> store
    panel --> store
    seed --> store
    health --> store
    contracts -. "templates" .-> seed
    contracts -. "built-in legal text" .-> resolution
```

Handling of one page request in `web`, in order:

1. The proxy passes the request to `web`. A path `/media/<id>` is answered by `page-frame` rule 9 and ends there. Every other path outside the public address space (§8; `address-routing.claims` is false) goes to the route of its module, for example `/health`, `/status`, and `/api/*` of the track Web, and never reaches the steps below.
2. `address-routing.decide` classifies the path; for `/`, `/de`, `/en` it asks the session check only if a session cookie is present.
3. A `redirect` or `notFound` decision is answered at once (a not-found page is drawn by `page-frame`).
4. For `render`, `page-resolution.resolve` asks `content-client.get(group)`, which refreshes the group first if the last attempt is at least `CONTENT_REFRESH_SECONDS` old.
5. `page-resolution` renders rich text through `rich-text`, picks language versions, and returns a `PageResult` (page, redirect, 404, or 503).
6. `page-frame.frame` wraps the page with the session state `none` (default theme, no theme switcher) and sends it without a cookie.

### Inter-Module Interfaces

| Interface | Provided by | Used by | Inputs and outputs | Error conditions |
| --- | --- | --- | --- | --- |
| Content interface | `content-interface` (`cms`) | `content-client` | `getGroup(token, group)` → ContentGroupData; `getImageFile(token, session, id)` → ImageFile | [PUB-E-2] |
| Content client | `content-client` (`web`) | `page-resolution`, `page-frame` | `get(group)` → LoadResult; `image(id)` → optional ImageFile; `held(group)` → optional ContentGroupData | [PUB-E-1] (inside), [PUB-E-3] (caller) |
| Address decision | `address-routing` | request handler of `web` | `claims(path)` → boolean; RequestInfo of a claimed path → RouteDecision | [PUB-E-5], only inside the public address space |
| Session check | Identity concept ([identity.md](identity.md)) | `address-routing` | cookies → SessionState (`valid`, `none`, `unknown`) | none; no answer counts as `unknown` ([PUB-F-33]) |
| Page resolution | `page-resolution` | request handler | RouteDecision + `content-client` → PageResult | [PUB-E-3], [PUB-E-5], [PUB-E-6] |
| Rich text | `rich-text` | `page-resolution` | string → list of RichBlock | none |
| Page frame | `page-frame` | request handler, other features' pages | PageResult + optional RouteDecision + optional notice + SessionState → HtmlResponse | none |
| Bot protection notice | Identity concept | `page-frame` | language → optional string | none |
| Content operations | `content-model` | admin panel | `save`, `publish`, `unpublish`, `delete`, `saveImage` | [PUB-E-4], [PUB-E-7], [PUB-E-8], [PUB-E-11], [PUB-E-12] |
| Account operations | `editor-accounts` | admin panel, `content-model` | `registerFirstAdministrator`, `createEditor`, `deleteEditor`, `changeOwn`, `signIn`, `canDo`, `hasAdministrator` | [PUB-E-9], [PUB-E-10], [PUB-E-12] |
| Health endpoint | `cms-health` | status page, proxy, container health check | `GET /health` → HealthReport | [SCF-E-2] |
| Seed | `content-seed` | start of `cms` | `seedIfEmpty()` | none |
| Web configuration | `web-config` (through `loadWebConfig`, M1 of the track plan Web) | start command of `web` (M7), every `web` module | environment → `WebConfig` or a list of ConfigProblem | [SCF-E-1] |
| Contracts | `content-contracts` | `cms` units and `web` | records, `legalTemplate`, `fixedText` | none |

### State Machine Diagram

Three things keep state: the language version of a content entry, the claim of the administrator account, and the held content of `web`.

```mermaid
stateDiagram-v2
    [*] --> draft: first save of a language version
    draft --> published: publish
    published --> draft: unpublish
    published --> published: save (new text, same state)
    note right of published
      Guard on unpublish: refused with PUB-E-7 when the entry
      is a legal page and the language is German.
      Each language of an entry has its own state.
    end note
```

```mermaid
stateDiagram-v2
    [*] --> unclaimed: fresh installation
    unclaimed --> claimed: registerFirstAdministrator succeeds
    unclaimed --> unclaimed: second simultaneous submission loses (PUB-E-9)
    claimed --> claimed: registration refused (PUB-E-9)
    note right of unclaimed
      administrator-account is down, cms is degraded,
      the admin panel offers the registration form.
    end note
    note right of claimed
      administrator-account is ok. There is no way back
      in this feature: the account cannot be deleted.
    end note
```

```mermaid
stateDiagram-v2
    [*] --> empty: web starts (per content group)
    empty --> held: attempt succeeds
    empty --> empty: attempt fails (PUB-E-1)
    held --> held: refresh succeeds (new data replaces old)
    held --> held: refresh fails (old data kept, PUB-E-1)
    note right of empty
      Legal pages: built-in legal text.
      Other pages: PUB-E-3, status 503.
    end note
    note right of held
      An attempt starts when the last attempt is at least
      CONTENT_REFRESH_SECONDS old.
    end note
```

### Design for Testability

The seams at which tests run (P-DES-2); everything behind a seam is exercised through it, and each seam can be replaced by a stub with fixed answers:

- **Content interface** (HTTP, token): the `web` tests replace it by a stub that answers per ContentGroupData, delays, or stays silent; the `cms` tests call the real one with the real content store (a database of the test run).
- **Content and account operations**: the admin panel is the product named by [PUB-C-1]; tests call the operations of `content-model` and `editor-accounts` as the panel does, with an `Actor` of either role.
- **Clock**: `content-client` reads the time from an injected clock, so the 60 s rule is tested without waiting.
- **Session check** and **bot protection notice**: replaced by stubs that answer `valid`, `none`, `unknown`, a delay, or a notice text.
- **Health endpoint**: HTTP request to `/health` of `cms`, with the content store stopped or slowed for the negative cases.
- **Page requests to `web`**: HTTP requests to the unit with all stubs above; assertions read status, redirect target, headers (cookies), and the document (text, headings, links, meta tags, resource addresses).
- **Repository files**: the README quick start, the licence notes, the example configuration, the seed data, and the legal templates are read as data.
- **Configuration**: a unit is started with environment values as in §10 example 11 and its output and exit code are read.
- **Accessibility checker** and **viewport**: the accessibility checker ([PUB-C-4]) and a browser at 320 and 1280 pixels run against the started `web` unit with the stubs.

### Requirement Traceability Matrix

`G-1.S3` → story → acceptance criteria → requirements → modules → tests. All stories serve `G-1.S3`; the requirements `PUB-NF-1` to `PUB-NF-3` also derive from `G-1.S2`, `G-1.S1`, and the story `PUB-US-2`. The tests column lists the acceptance and integration tests of §17; the unit tests of each module are in the second table.

| Story | Acceptance criteria | Requirements | Modules | Tests |
| --- | --- | --- | --- | --- |
| PUB-US-1 | PUB-AC-1.1 to PUB-AC-1.7 | PUB-F-1 to PUB-F-10, PUB-F-31, PUB-F-32, PUB-F-34, PUB-F-37; PUB-NF-4 to PUB-NF-8; PUB-E-1, PUB-E-2, PUB-E-7, PUB-E-9 to PUB-E-12; PUB-C-1, PUB-C-2 | `content-model`, `editor-accounts`, `content-interface`, `content-seed`, `cms-health`, `content-client`, `content-contracts`, `web-config`, `setup-guide` | PUB-T-1 to PUB-T-7, PUB-T-28, PUB-T-29, PUB-T-32, PUB-T-34, PUB-T-35 |
| PUB-US-2 | PUB-AC-2.1 to PUB-AC-2.6 | PUB-F-11 to PUB-F-15, PUB-F-33, PUB-F-35, PUB-F-36; PUB-U-1; PUB-NF-1 to PUB-NF-3; PUB-E-4, PUB-E-8; PUB-C-3, PUB-C-4 | `page-resolution`, `address-routing`, `page-frame`, `rich-text`, `content-model` | PUB-T-8 to PUB-T-13, PUB-T-31, PUB-T-33 |
| PUB-US-3 | PUB-AC-3.1 to PUB-AC-3.4 | PUB-F-16 to PUB-F-20; PUB-U-3; PUB-E-6 | `page-resolution`, `content-model` | PUB-T-14 to PUB-T-17, PUB-T-33 |
| PUB-US-4 | PUB-AC-4.1 to PUB-AC-4.6 | PUB-F-21 to PUB-F-26; PUB-U-5; PUB-E-3 | `page-frame`, `page-resolution`, `content-contracts`, `content-seed` | PUB-T-18 to PUB-T-23, PUB-T-29 |
| PUB-US-5 | PUB-AC-5.1 to PUB-AC-5.4 | PUB-F-27 to PUB-F-30; PUB-U-2, PUB-U-4; PUB-E-5 | `address-routing`, `page-frame`, `page-resolution`, `content-model` | PUB-T-24 to PUB-T-27, PUB-T-30 |

| Module | Unit tests |
| --- | --- |
| `content-model` | PUB-T-36 to PUB-T-50 |
| `editor-accounts` | PUB-T-51 to PUB-T-64 |
| `content-interface` | PUB-T-65 to PUB-T-69 |
| `content-seed` | PUB-T-70 to PUB-T-73 |
| `cms-health` | PUB-T-74 to PUB-T-77 |
| `content-client` | PUB-T-78 to PUB-T-88 |
| `address-routing` | PUB-T-89 to PUB-T-104, PUB-T-158 |
| `rich-text` | PUB-T-105 to PUB-T-112 |
| `page-resolution` | PUB-T-113 to PUB-T-137 |
| `page-frame` | PUB-T-138 to PUB-T-150, PUB-T-159, PUB-T-160 |
| `web-config` | PUB-T-151 to PUB-T-154 |
| `content-contracts` | PUB-T-155 to PUB-T-157 |
| `setup-guide` | PUB-T-7 (acceptance test, README read as data) |

Every module traces to at least one requirement (the *Traces to* lines above), every requirement of §4 to §6 and §9 is named by at least one module, and every module has tests in §17. The per-requirement view is the *Covers* columns of §17.

## 17. Test Concept & TDD Contract

Tests are tables of given, when, then with concrete values (P-DES-2); `STACK.md` section 6 names the runner and how a row becomes a test. A test in code carries its ID, and an acceptance test also carries its acceptance criterion ID in its name. The red-green loop runs one slice at a time (§16, *Vertical Slices Breakdown*): the acceptance tests of the slice's criteria first, then the unit tests of the modules it builds.

### Unit Tests & Test Case Tables

Per module, in the order of §16; values come from the worked examples of §10. The ranges per module are in the second table of the traceability matrix.

| ID | Module | Input | Expected | Covers |
| --- | --- | --- | --- | --- |
| PUB-T-36 | `content-model` | A landing section saved with a heading of 120 characters, and one with 121 characters | The first is saved; the second is refused with PUB-E-11 naming `heading`, and the stored section is unchanged | PUB-F-2, PUB-E-11 |
| PUB-T-37 | `content-model` | A section of kind `call-to-action` saved with an `imageId` | Refused with PUB-E-11 naming `imageId` | PUB-F-2, PUB-E-11 |
| PUB-T-38 | `content-model` | A help category saved with a German name only | Refused with PUB-E-11 naming `name` (both names are required) | PUB-F-2, PUB-E-11 |
| PUB-T-39 | `content-model` | A changelog entry saved with version `0.1.0` while another entry has `0.1.0` | Refused with PUB-E-11 naming `version` | PUB-F-18, PUB-E-11 |
| PUB-T-40 | `content-model` | A help article saved with help context `upload-files` while another article has it, and one saved with `Upload Files` | Both refused with PUB-E-11 naming `helpContext` | PUB-F-19, PUB-E-11 |
| PUB-T-41 | `content-model` | A German version saved for a new changelog entry | The version has state `draft`; no English version exists | PUB-F-5, PUB-F-30 |
| PUB-T-42 | `content-model` | An entry with German `draft` and English `draft`; the editor publishes English | English is `published`, German stays `draft` (publishing one does not change the other) | PUB-F-5, PUB-F-30 |
| PUB-T-43 | `content-model` | An editor unpublishes the English version of the imprint, then the German version (§10, example 7) | English becomes `draft`; the German unpublish is refused with PUB-E-7 and German stays `published` | PUB-F-24, PUB-E-7 |
| PUB-T-44 | `content-model` | A CMS administrator unpublishes the German version of the imprint | Refused with PUB-E-7 | PUB-F-3, PUB-F-24, PUB-E-7 |
| PUB-T-45 | `content-model` | An administrator deletes a legal page; an editor creates a fourth legal page | Both refused with PUB-E-12; the three legal pages remain | PUB-F-24, PUB-E-12 |
| PUB-T-46 | `content-model` | An editor creates, edits, publishes, and unpublishes a help article | Every action is allowed | PUB-F-3 |
| PUB-T-47 | `content-model` | An image: PNG of 1 048 576 bytes; WebP of 2 097 152 bytes (§10, example 10) | Both saved | PUB-F-35, PUB-F-13 |
| PUB-T-48 | `content-model` | An image: JPEG of 2 097 153 bytes; an SVG file; a file named `logo.png` whose content is a PDF | All three refused with PUB-E-8, the first for size, the other two for type | PUB-F-35, PUB-E-8 |
| PUB-T-49 | `content-model` | An image: PNG of 1 024 bytes with an empty source; the same with an empty licence | Both refused with PUB-E-4 naming `source` and `licence` | PUB-F-13, PUB-E-4 |
| PUB-T-50 | `content-model` | The field names of every stored entry type | They are exactly those of §8; none names or references an editor account | PUB-NF-6, PUB-F-1 |
| PUB-T-51 | `editor-accounts` | `hasAdministrator()` on an empty store, then `registerFirstAdministrator("Ada Admin", "ada@example.org", a password of 12 characters)` (§10, example 6) | false; then an account with role `administrator`; `hasAdministrator()` is true | PUB-F-10, PUB-F-9 |
| PUB-T-52 | `editor-accounts` | A second registration after the first | Refused with PUB-E-9; no account is created; the panel offers no registration form | PUB-F-10, PUB-E-9 |
| PUB-T-53 | `editor-accounts` | Two registrations that arrive at the same time on an empty store | Exactly one account is created; the other is refused with PUB-E-9 | PUB-F-10, PUB-E-9 |
| PUB-T-54 | `editor-accounts` | Passwords of 11, 12, 128, and 129 characters | 11 and 129 are refused with PUB-E-10 naming `password`; 12 and 128 are accepted | PUB-F-37, PUB-E-10 |
| PUB-T-55 | `editor-accounts` | A name of 0 characters, of 100, and of 101 characters | 0 and 101 are refused with PUB-E-10 naming `name`; 100 is accepted | PUB-F-37, PUB-E-10 |
| PUB-T-56 | `editor-accounts` | An account saved with an e-mail address that another account uses | Refused with PUB-E-10 naming `email` | PUB-F-37, PUB-E-10 |
| PUB-T-57 | `editor-accounts` | Two accounts created with the same password | Each stores the fields `id`, `name`, `email`, `passwordHash`, `role` and nothing else; the two hashes differ; neither hash contains the password | PUB-NF-4, PUB-NF-5 |
| PUB-T-58 | `editor-accounts` | An editor calls `createEditor`; an administrator calls it | The editor is refused with PUB-E-12; the administrator gets an account with role `editor` | PUB-F-3, PUB-E-12 |
| PUB-T-59 | `editor-accounts` | An administrator deletes an editor account that wrote entries | Name, e-mail address, and hash are gone; the entries are unchanged and refer to no person | PUB-NF-7, PUB-F-3 |
| PUB-T-60 | `editor-accounts` | An administrator deletes the administrator account | Refused with PUB-E-12; the account remains | PUB-F-37, PUB-E-12 |
| PUB-T-61 | `editor-accounts` | An editor changes the name, e-mail address, and password of their own account; an editor changes another account | The first is saved and the role is unchanged; the second is refused with PUB-E-12 | PUB-NF-8, PUB-E-12 |
| PUB-T-62 | `editor-accounts` | `canDo` for the roles `editor` and `administrator` and the actions `content.write`, `content.publish`, `account.create`, `account.delete` | The editor may do the first two only; the administrator may do all four | PUB-F-3 |
| PUB-T-63 | `editor-accounts` | A sign-in with a wrong password and one with an unknown e-mail address | Both refused with the message "E-mail address or password is wrong." (PUB-E-12) | PUB-F-4, PUB-E-12 |
| PUB-T-64 | `editor-accounts` | A request for the admin panel without a session | Only the login form is returned; a request for content or accounts is refused with PUB-E-12 | PUB-F-4, PUB-E-12 |
| PUB-T-65 | `content-interface` | `getGroup(legal)` without a token, and with a wrong token | Both refused with PUB-E-2; no content is returned | PUB-F-4, PUB-E-2 |
| PUB-T-66 | `content-interface` | `getGroup(legal)` with the token; the privacy policy is published in German and draft in English | The privacy policy holds the German version only | PUB-F-5 |
| PUB-T-67 | `content-interface` | `getGroup(changelog)` with an entry whose German and English versions are drafts | The entry is not in the result | PUB-F-5 |
| PUB-T-68 | `content-interface` | Any result of `getGroup` | It holds no editor account, no author, and no source or licence of an image | PUB-NF-6 |
| PUB-T-69 | `content-interface` | `getImageFile` without token and session; with the token; with an editor session | Refused with PUB-E-2; the file; the file | PUB-F-32, PUB-E-2 |
| PUB-T-70 | `content-seed` | `seedIfEmpty()` on an empty store | One landing section of each of the 4 kinds, 2 help categories with 2 articles each, 1 changelog entry `0.1.0`, 3 legal pages, all versions in German and English `published` | PUB-F-7 |
| PUB-T-71 | `content-seed` | `seedIfEmpty()` on a store with one help category | No entry is created, changed, or deleted | PUB-F-7 |
| PUB-T-72 | `content-seed` | The seed images | Each has a non-empty source, the licence `CC0-1.0`, and is PNG, JPEG, or WebP of at most 2 097 152 bytes | PUB-F-13, PUB-F-35 |
| PUB-T-73 | `content-seed` | The seed section of kind `call-to-action`, and the three seed legal pages | One such section exists; each legal page equals the legal template of its kind and starts with the template notice of its language | PUB-F-14, PUB-F-26 |
| PUB-T-74 | `cms-health` | `health()` on a fresh installation (§10, example 6) | `content-store` essential `ok`, `administrator-account` non-essential `down`, status `degraded` | PUB-F-9, PUB-F-31 |
| PUB-T-75 | `cms-health` | `health()` after the registration of the administrator | Both checks `ok`, status `ok` | PUB-F-9 |
| PUB-T-76 | `cms-health` | `health()` with a content store that does not answer within `HEALTH_CHECK_TIMEOUT_MS` | `content-store` `down`, `administrator-account` `down`, status `down` | PUB-F-31 |
| PUB-T-77 | `cms-health` | Any health report | It holds no host, port, credential, or version of a dependency | PUB-F-31, PUB-F-9 |
| PUB-T-78 | `content-client` | `get(landing)` on a fresh client, content interface answers | The data is returned and held, with the time of the attempt | PUB-F-6 |
| PUB-T-79 | `content-client` | Refresh interval 60 s; `get` 59 s after the last attempt | No request to the content interface; the held data is returned | PUB-F-6 |
| PUB-T-80 | `content-client` | Refresh interval 60 s; the editor publishes text B at 10:00:00 over held text A; `get` at 10:01:00 | A request is made and B is returned (§10, example 2) | PUB-F-6 |
| PUB-T-81 | `content-client` | The same; `get` at 10:00:20 (attempt at 10:00:00 or earlier) | A or B is returned, either is correct (§10, example 2) | PUB-F-6 |
| PUB-T-82 | `content-client` | The content interface answers after 2500 ms with `CONTENT_TIMEOUT_MS` = 2000 while data is held | The held data is returned, the failure is PUB-E-1, and the next request is made only after 60 s from this attempt | PUB-F-8, PUB-E-1 |
| PUB-T-83 | `content-client` | The content interface is down and nothing was ever loaded | `get` returns no data (the caller applies PUB-E-3 or the built-in legal text) | PUB-F-8, PUB-E-1, PUB-E-3 |
| PUB-T-84 | `content-client` | Ten `get` calls arrive while one refresh is running | One request goes to the content interface, and all ten receive its result | PUB-F-6 |
| PUB-T-85 | `content-client` | `get(landing)` loads the group with two images; then the content interface goes down | `image(id)` returns both files (§10, example 4, last row) | PUB-F-32, PUB-F-8 |
| PUB-T-86 | `content-client` | A refresh where the group arrives but the second image file fails | The refresh counts as failed: old data and old images stay, PUB-E-1 applies | PUB-F-8, PUB-E-1 |
| PUB-T-87 | `content-client` | A refresh whose data no longer refers to an image | The image file is no longer held; `image(id)` returns nothing | PUB-F-32 |
| PUB-T-88 | `content-client` | Every request to the content interface | It carries `CONTENT_ACCESS_TOKEN` | PUB-F-4 |
| PUB-T-89 | `address-routing` | No session, `Accept-Language` `de-AT, en`, path `/` (§10, example 1) | Redirect to `/de` | PUB-F-28 |
| PUB-T-90 | `address-routing` | No session, `en-US, de`, path `/` | Redirect to `/en` | PUB-F-28 |
| PUB-T-91 | `address-routing` | No session, `fr, en, de`, path `/` | Redirect to `/en` | PUB-F-28 |
| PUB-T-92 | `address-routing` | No session, `fr, it`, path `/` | Redirect to `/de` | PUB-F-28 |
| PUB-T-93 | `address-routing` | No session, no `Accept-Language`, path `/` | Redirect to `/de` | PUB-F-28 |
| PUB-T-94 | `address-routing` | Valid member session, `en-US`, path `/` | Redirect to `DASHBOARD_PATH` | PUB-F-12 |
| PUB-T-95 | `address-routing` | Valid member session, any language, path `/en` | Redirect to `DASHBOARD_PATH` | PUB-F-12 |
| PUB-T-96 | `address-routing` | A session cookie is sent, the session check does not answer, `de-AT`, path `/` | Redirect to `/de` | PUB-F-33, PUB-F-28 |
| PUB-T-97 | `address-routing` | The session check answers after 600 ms with `SESSION_CHECK_TIMEOUT_MS` = 500; and answers with an error | Both count as "unknown" and the person is treated as without a session | PUB-F-33 |
| PUB-T-98 | `address-routing` | A request without a session cookie | The session check is not called; the state is `none` | PUB-F-12 |
| PUB-T-99 | `address-routing` | `Accept-Language` `en;q=0.5, de;q=0.9`; and `de;q=0, en` | `/de`; `/en` | PUB-F-28 |
| PUB-T-100 | `address-routing` | `Accept-Language` `EN-us` | `/en` (case is ignored) | PUB-F-28 |
| PUB-T-101 | `address-routing` | Path `/fr` | Not found, in German (PUB-E-5) | PUB-F-27, PUB-E-5 |
| PUB-T-102 | `address-routing` | Path `/en/legal/cookies` | Not found, in English (PUB-E-5) | PUB-F-27, PUB-E-5 |
| PUB-T-103 | `address-routing` | Path `/de/` with a trailing slash | Route landing page, language `de` | PUB-F-27 |
| PUB-T-104 | `address-routing` | Paths `/en/help`, `/de/changelog`, `/de/legal/terms`, `/en/help/context/upload-files` | Routes help start, changelog, legal `terms`, help context `upload-files`, each with the language of the address | PUB-F-27 |
| PUB-T-158 | `address-routing` | `claims` for `/status`, `/health`, `/api/docs`, `/api/unknown`, `/dashboard`, `/media/<id>`, `/DE`; and for `/`, `/de/help`, `/fr` | False for the first seven: `address-routing` decides none of them, so none gets the not-found page of PUB-E-5; true for the last three | PUB-F-27, PUB-E-5 |
| PUB-T-105 | `rich-text` | `## Ordner teilen` and `# Titel` (§10, example 8) | A heading of level 2; a paragraph "# Titel" | PUB-F-36, PUB-C-3 |
| PUB-T-106 | `rich-text` | `Ein **wichtiger** Hinweis` | A paragraph with bold "wichtiger" | PUB-F-36 |
| PUB-T-107 | `rich-text` | `<b>x</b>` | A paragraph with the characters `<b>x</b>` and no bold text | PUB-F-36, PUB-C-3 |
| PUB-T-108 | `rich-text` | `[Start](/de/help)` | A link "Start" to `/de/help` | PUB-F-36 |
| PUB-T-109 | `rich-text` | `[Hilfe](javascript:alert(1))` | A paragraph with those characters and no link | PUB-F-36, PUB-C-3 |
| PUB-T-110 | `rich-text` | `![Bild](/media/1)` | A paragraph with those characters and no image | PUB-F-36, PUB-C-3 |
| PUB-T-111 | `rich-text` | The lines `- a` and `- b`; the lines `1. a` and `2. b` | An unordered list of 2 items; an ordered list of 2 items | PUB-F-36 |
| PUB-T-112 | `rich-text` | `**offen` (no closing marks) and `##### zu tief` | Paragraphs with those characters | PUB-F-36 |
| PUB-T-113 | `page-resolution` | The landing group holds sections at positions 2 and 1 | The page shows position 1, then position 2 | PUB-F-11 |
| PUB-T-114 | `page-resolution` | A section with only a German version, route `/en` (§10, example 3) | Shown with German text, and the page has the translation note | PUB-F-29, PUB-U-4 |
| PUB-T-115 | `page-resolution` | A section with German `draft` and English `published` | Left out under `/de` and under `/en` | PUB-F-29 |
| PUB-T-116 | `page-resolution` | The seed `call-to-action` section, `REGISTRATION_PATH` `/register`, `LOGIN_PATH` `/login` | The section shows one link to `/register` and one to `/login`, labelled "Registrieren" and "Anmelden" under `/de` | PUB-F-14 |
| PUB-T-117 | `page-resolution` | Categories at positions 2 and 1, a category without a published article, articles "Ordner teilen" and "Dateien hochladen" in one category | The empty category is not listed; categories in position order; the articles in the order "Dateien hochladen", "Ordner teilen" | PUB-F-16 |
| PUB-T-118 | `page-resolution` | An article with a draft German version and a published English version, listed under `/en` | It is not listed (it counts as unpublished without German) | PUB-F-16, PUB-F-29 |
| PUB-T-119 | `page-resolution` | Search `ordner` (§10, example 5) | "Ordner teilen" first (title), then "Dateien hochladen" (text) | PUB-F-17 |
| PUB-T-120 | `page-resolution` | Search `ORDNER` | The same result as `ordner` | PUB-F-17 |
| PUB-T-121 | `page-resolution` | Search `o` | No search is made; the normal start page is returned | PUB-F-17, PUB-U-3 |
| PUB-T-122 | `page-resolution` | Search `xyz` under `/de`, and under `/en` | "Keine Hilfeartikel gefunden."; "No help articles found." | PUB-U-3 |
| PUB-T-123 | `page-resolution` | Search under `/en` where an article exists only in German | That article is not found (only versions in the language shown are searched) | PUB-F-17 |
| PUB-T-124 | `page-resolution` | Article published in German and English (§10, example 3, row 1) | `/de` shows German text, `/en` shows English text, no note | PUB-F-29, PUB-U-4 |
| PUB-T-125 | `page-resolution` | Article with German published and English `draft`, and one with English `none` | `/en` shows the German text with the note, `/de` the German text | PUB-F-29, PUB-U-4 |
| PUB-T-126 | `page-resolution` | Article with German `draft` and English published | "Not found" (PUB-E-5) under `/de` and `/en` | PUB-F-29, PUB-E-5 |
| PUB-T-127 | `page-resolution` | An article address with an id that is not a known article | "Not found" (PUB-E-5) with status 404 | PUB-E-5 |
| PUB-T-128 | `page-resolution` | Context `upload-files` assigned to published article `a1` (§10, example 12) | Redirect to `/en/help/a1` under `/en` | PUB-F-19 |
| PUB-T-129 | `page-resolution` | Context `old-place` (assigned to an article without published German version), `unknown-place`, and `Upload Files` | Each redirects to `/<l>/help` (PUB-E-6) | PUB-F-19, PUB-E-6 |
| PUB-T-130 | `page-resolution` | Changelog entries as in §10, example 9 | Order `0.10.0`, `0.9.0`, `0.2.0`, `0.1.0`; each with version, date, title, text | PUB-F-18 |
| PUB-T-131 | `page-resolution` | A changelog entry without a published German version | Left out under `/de` and `/en` | PUB-F-18, PUB-F-29 |
| PUB-T-132 | `page-resolution` | The legal group is loaded; the privacy text B is published | `/de/legal/privacy` shows text B | PUB-F-21, PUB-F-24 |
| PUB-T-133 | `page-resolution` | The legal group was never loaded and the content interface is down, `/en/legal/imprint` (§10, example 4) | The built-in English legal text, status 200 | PUB-F-25 |
| PUB-T-134 | `page-resolution` | The imprint has English `draft` (§10, example 7), `/en/legal/imprint` | The German text with the translation note | PUB-F-24, PUB-F-29, PUB-U-4 |
| PUB-T-135 | `page-resolution` | The changelog group was never loaded and the content interface is down | Status 503 with "Inhalt derzeit nicht verfügbar." under `/de` and "Content is currently unavailable." under `/en` (PUB-E-3) | PUB-E-3 |
| PUB-T-136 | `page-resolution` | Page meta of the four rows of §10, example 13 | Titles, descriptions, `og:type`, and addresses as in the example | PUB-F-15 |
| PUB-T-137 | `page-resolution` | A page route while the landing group is not held | The description falls back to the page title; the page is not unavailable because of it | PUB-F-15 |
| PUB-T-138 | `page-frame` | Any page under `/de`, and under `/en` | A footer with links to `/<l>/legal/imprint`, `/<l>/legal/terms`, `/<l>/legal/privacy`, labelled as in §8 | PUB-F-21 |
| PUB-T-139 | `page-frame` | The not-found page and the unavailable page | Both have the footer | PUB-F-21, PUB-E-3, PUB-E-5 |
| PUB-T-140 | `page-frame` | The login page and the registration page, drawn by a stand-in page built with the frame | Both have the footer | PUB-F-21 |
| PUB-T-141 | `page-frame` | `/de/help/a1` and `/en/changelog` | The switch links to `/en/help/a1` and `/de/changelog`, labelled "Deutsch" and "English" | PUB-U-2, PUB-F-27 |
| PUB-T-142 | `page-frame` | The not-found page under `/fr` and under `/en/legal/cookies` | The switch links to `/en` and `/de` | PUB-U-2 |
| PUB-T-143 | `page-frame` | A result with the translation note and a German passage under `/en` | The text "This page is not available in English." is above the content, and the German passage is marked as German | PUB-U-4 |
| PUB-T-144 | `page-frame` | A form page, bot protection on with a hidden badge, notice "Geschützt durch den Bot-Schutz" | The notice is text, directly below the form, visible without scrolling past the form | PUB-F-23, PUB-U-5 |
| PUB-T-145 | `page-frame` | The same page with bot protection off, and with the badge visible | No notice is shown | PUB-F-23 |
| PUB-T-146 | `page-frame` | A response for a person without a session, with the session state `none` and with `unknown` | It sets no cookie, holds no analytics code, and holds no theme switcher; the page shows the default theme | PUB-NF-3 |
| PUB-T-147 | `page-frame` | Every address in `src`, `href` of resources, and style references of any page | Each starts with `/` or with `PUBLIC_BASE_URL`; none points to another host | PUB-NF-2 |
| PUB-T-148 | `page-frame` | Any page | Exactly one heading of level 1; the document language equals the page language | PUB-NF-1 |
| PUB-T-149 | `page-frame` | The landing page at a width of 320 pixels, and of 1280 pixels | No horizontal scrolling at 320; the content uses the width up to 1280 | PUB-U-1 |
| PUB-T-150 | `page-frame` | Images of a page | Each image address is `/media/<id>` on the own origin, with its alternative text in the language shown | PUB-F-32, PUB-NF-1 |
| PUB-T-159 | `page-frame` | A stand-in page of another feature drawn with the session state `valid`, and the same page with `none` | With `valid` the header holds the theme switcher; with `none` it holds none; the frame sets no cookie in either case | PUB-NF-3 |
| PUB-T-160 | `page-frame` | A stand-in status page at `/status` with page language `en` and no route, and the not-found page of the path `/unknown` | The status page has document language `en`, the footer links `/en/legal/imprint`, `/en/legal/terms`, `/en/legal/privacy` labelled "Imprint", "Terms", "Privacy policy", and no language switch; the not-found page has document language `de`, the German footer, and no language switch | PUB-F-21, PUB-U-2 |
| PUB-T-151 | `web-config` | The configuration of §10, example 11 | The output of the example, a non-zero exit code, and neither value printed; `CONTENT_TIMEOUT_MS` falls back to 2000 | PUB-F-6 |
| PUB-T-152 | `web-config` | `CONTENT_REFRESH_SECONDS` 1, 60, 0, 61 | 1 and 60 are accepted; 0 and 61 stop the unit | PUB-F-6 |
| PUB-T-153 | `web-config` | `CONTENT_TIMEOUT_MS` 100, 30000, 99, 30001; `SESSION_CHECK_TIMEOUT_MS` 50, 5000, 49, 5001 | The first two of each are accepted; the last two of each stop the unit | PUB-E-1, PUB-F-33 |
| PUB-T-154 | `web-config` | `CONTENT_ACCESS_TOKEN` of 32 characters, of 31 characters, and not set; `DASHBOARD_PATH` `/debug`, `/de/home`, `/fr/home`, `dashboard` | 32 and `/debug` accepted; the other five stop the unit | PUB-F-4, PUB-F-12 |
| PUB-T-155 | `content-contracts` | The legal templates of the three kinds in both languages | Each starts with the template notice, has the headings of the outline of §8 in order, and holds at least one `[[...]]` placeholder | PUB-F-26 |
| PUB-T-156 | `content-contracts` | The privacy template | It has a paragraph under each of the 8 headings from "Mitgliedskonten" to "E-Mail-Versand", naming data and purpose | PUB-F-22 |
| PUB-T-157 | `content-contracts` | Every fixed text of §8 | It exists in German and in English and is not empty | PUB-F-21, PUB-U-2 |

### Acceptance Tests

One test per acceptance criterion; `PUB-T-1` to `PUB-T-27` follow the order of the criteria in the story files.

| ID | Title | Covers | Given | When | Then |
| --- | --- | --- | --- | --- | --- |
| PUB-T-1 | CMS runs on its own store | PUB-AC-1.1 (CMS container), PUB-F-1, PUB-F-31 | the resolved stack definition and the example configuration | the local stack starts and `/cms/health` is requested through the proxy | the service `cms` is its own container with a content store that no other unit's configuration names, and the report holds `content-store` with `essential: true` and `status: ok` |
| PUB-T-2 | Exactly six content types | PUB-AC-1.2 (Content types), PUB-F-2, PUB-E-11 | the content operations with an editor, and valid values for every type of §8 | one entry of each type is saved, and then a seventh type is asked for | the six saves succeed; the available types are exactly landing section, help category, help article, changelog entry, legal page, image; a value outside §8 is refused with PUB-E-11 |
| PUB-T-3 | Editor roles and closed interface | PUB-AC-1.3 (Editor roles), PUB-F-3, PUB-F-4, PUB-F-32, PUB-F-37, PUB-E-2, PUB-E-12 | an installation with one administrator, one editor, and one image | a person without session opens the admin panel; `getGroup(legal)` is requested with no token and with a wrong token; the image file is requested without token; the editor creates an account; the administrator creates and deletes an editor account | the panel shows only the login form; the three content requests are refused with PUB-E-2 and return no content; the editor is refused with PUB-E-12; the administrator succeeds |
| PUB-T-4 | Change is public within 60 s | PUB-AC-1.4 (Cached delivery), PUB-F-5, PUB-F-6 | `CONTENT_REFRESH_SECONDS` = 60, the privacy page shows text A, and an editor publishes text B at 10:00:00 (injected clock) | a visitor opens `/de/legal/privacy` at 10:00:20 and again at 10:01:00 | the first visit shows A or B; the second shows B (§10, example 2) |
| PUB-T-5 | Seed content once | PUB-AC-1.5 (Seed content), PUB-F-7, PUB-F-13, PUB-F-14, PUB-F-26 | an empty content store | `cms` starts, an editor changes one heading, and `cms` starts again | after the first start: 4 landing sections (one per kind), 2 categories with 2 articles each, changelog entry `0.1.0`, 3 legal pages, all published in German and English, every image with source and licence; after the second start: the changed heading is unchanged and no entry was added or deleted |
| PUB-T-6 | Pages survive a stopped CMS | PUB-AC-1.6 (CMS unavailable), PUB-F-8, PUB-F-32, PUB-E-1 | the landing page and `/de/legal/privacy` loaded at 09:00 with two images, then `cms` stopped | a visitor opens both pages and requests the images at 10:00 | both pages show their versions of 09:00, and the images are delivered by `web` (§10, example 4, rows 1, 3, 5) |
| PUB-T-7 | Unclaimed administrator is visible | PUB-AC-1.7 (Unclaimed administrator), PUB-F-9, PUB-F-10, PUB-F-31, PUB-F-34, PUB-E-9 | a fresh installation and the README | the health report and the status page are read, a person registers as "Ada Admin" with `ada@example.org`, and the report is read again | before: the report is `degraded` with `administrator-account` `down` and `content-store` `ok`, the status page row shows `cms`, `degraded`, `administrator-account`; after: `ok` and the row `ok`, and a second registration is refused with PUB-E-9; the quick start of the README has the registration step as a numbered step directly after the start command, with the sentence that anyone who reaches the admin panel can register until then |
| PUB-T-8 | Landing page is public and from the CMS | PUB-AC-2.1 (Public and from the CMS), PUB-F-11, PUB-F-6 | three published landing sections, a visitor without session | the visitor opens `/de`, an editor changes the heading of section 1, and 60 s later the visitor opens `/de` again | the first answer is 200 without login and shows the three sections in position order with the CMS text; the second shows the changed heading |
| PUB-T-9 | Landing page is responsive and accessible | PUB-AC-2.2 (Responsive and accessible), PUB-U-1, PUB-NF-1, PUB-C-4 | the seeded landing page | it is opened at 320 pixels and at 1280 pixels, in `/de` and `/en`, and checked with the accessibility checker | no horizontal scrolling at 320, content uses the width up to 1280, and the checker reports 0 violations in both languages |
| PUB-T-10 | Media are licence-free and documented | PUB-AC-2.3 (Licence-free media), PUB-F-13, PUB-F-35, PUB-E-4, PUB-E-8 | the seeded landing page, the README licence notes, an editor | the images and icons of the page are listed, and the editor saves an image with an empty licence and an SVG file | every image has a source and the licence `CC0-1.0` in the CMS; every icon is listed with source and licence in the licence notes; the empty licence is refused with PUB-E-4 naming `licence`; the SVG is refused with PUB-E-8 |
| PUB-T-11 | Call to action leads to registration and login | PUB-AC-2.4 (Call to action), PUB-F-14 | the seed landing page, `REGISTRATION_PATH` `/register`, `LOGIN_PATH` `/login` | a visitor opens `/de` and `/en` | the call-to-action section links "Registrieren" to `/register` and "Anmelden" to `/login`; in English "Register" and "Log in" |
| PUB-T-12 | Meta tags are set | PUB-AC-2.5 (Meta tags), PUB-F-15 | the four pages of §10, example 13, `PUBLIC_BASE_URL` `https://stash.example` | a crawler stub reads each page | title, description, `og:title`, `og:description`, `og:type`, and `og:url` are those of the example |
| PUB-T-13 | Signed-in member sees the dashboard | PUB-AC-2.6 (Signed-in member), PUB-F-12, PUB-F-33 | the session check answers `valid` for one person and does not answer for another | the first person opens `/` and `/en`, the second sends a session cookie and opens `/` with `de-AT` | the first is redirected to `DASHBOARD_PATH` both times; the second to `/de` (§10, example 1, rows 6 to 8) |
| PUB-T-14 | Help articles by category and search | PUB-AC-3.1 (Help articles), PUB-F-16, PUB-F-17, PUB-U-3 | the articles "Dateien hochladen" and "Ordner teilen" (§10, example 5) in two categories | a visitor opens `/de/help` and searches `ordner`, `o`, and `xyz` | the start page lists the categories with article titles as links; `ordner` returns "Ordner teilen" first, then "Dateien hochladen"; `o` starts no search; `xyz` shows "Keine Hilfeartikel gefunden." |
| PUB-T-15 | Changelog newest first | PUB-AC-3.2 (Changelog page), PUB-F-18 | the four entries of §10, example 9 | a visitor opens `/de/changelog` | the order is `0.10.0`, `0.9.0`, `0.2.0`, `0.1.0`, each with version, date, title, and text |
| PUB-T-16 | Help links lead to the right article | PUB-AC-3.3 (Contextual help), PUB-F-19, PUB-E-6, PUB-E-11 | the articles `a1` and `a2` of §10, example 12 | a visitor follows the five help-context addresses of the example, and an editor assigns `upload-files` to a second article | the redirects are those of the example; the second assignment is refused with PUB-E-11 |
| PUB-T-17 | Help and changelog need no account | PUB-AC-3.4 (Public), PUB-F-20 | a person without session | they open the help start page, a help article, and the changelog | all three answer 200 and none redirects to a login |
| PUB-T-18 | Legal pages from every footer | PUB-AC-4.1 (Footer links), PUB-F-21, PUB-F-24, PUB-E-7 | a person without session; the imprint published in German and English (§10, example 7) | they open the landing page, a help page, the changelog, the not-found page, the unavailable page, and the stand-in login and registration page, and follow the three footer links; an editor unpublishes the English and then the German imprint | every page has the three footer links and each legal page answers 200; the English unpublish works and `/en/legal/imprint` shows German with the note; the German unpublish is refused with PUB-E-7 for the editor and for the administrator |
| PUB-T-19 | Privacy policy names all data and services | PUB-AC-4.2 (Privacy content), PUB-F-22 | a fresh installation | a reader opens `/de/legal/privacy` and `/en/legal/privacy` | the page has the headings of the outline of §8 in order, and under each of the 8 headings from "Mitgliedskonten" to "E-Mail-Versand" a paragraph that names the data and the purpose |
| PUB-T-20 | Captcha notice only where it applies | PUB-AC-4.3 (Captcha notice), PUB-F-23, PUB-U-5 | a form page drawn with the page frame, and the notice stub in three states: bot protection on with hidden badge, off, and on with visible badge | a person opens the page in each state | in the first state the notice is text directly below the form; in the other two no notice is shown |
| PUB-T-21 | Legal page maintained in the CMS | PUB-AC-4.4 (Maintained in the CMS), PUB-F-24, PUB-F-6, PUB-E-12 | the imprint, and an editor | the editor changes the German text and publishes at 10:00:00, a visitor opens `/de/legal/imprint` at 10:01:00, and the editor creates a fourth legal page | the visitor sees the new text; the creation is refused with PUB-E-12 |
| PUB-T-22 | Built-in legal text | PUB-AC-4.5 (Built-in legal text), PUB-F-25, PUB-E-1, PUB-E-3 | a fresh installation whose `cms` was never reachable | a person opens `/de/legal/imprint`, `/en/legal/terms`, `/en/legal/privacy`, and `/de/changelog` | the three legal pages answer 200 with the built-in legal text of their language; the changelog answers 503 with "Inhalt derzeit nicht verfügbar." |
| PUB-T-23 | Legal templates are marked | PUB-AC-4.6 (Legal templates), PUB-F-26 | the seed content, no legal page changed | a person opens each legal page in both languages | the first sentence is the template notice of the language, the text holds at least one `[[...]]` placeholder, and the text equals the built-in legal text |
| PUB-T-24 | Language follows the address | PUB-AC-5.1 (Language in the address), PUB-F-27, PUB-U-2, PUB-E-5 | the landing page in German and English | a visitor opens `/de`, uses the language switch, then opens `/fr` | `/de` is German and the switch, labelled "English", leads to `/en`, which is English with the switch "Deutsch" leading back to `/de`; `/fr` answers 404 with the German page "Seite nicht gefunden" and the footer |
| PUB-T-25 | First visit picks the language | PUB-AC-5.2 (First visit), PUB-F-28 | the five browser settings of §10, example 1, rows 1 to 5 | a visitor without session opens `/` | the redirects are those of the example: `/de`, `/en`, `/en`, `/de`, `/de` |
| PUB-T-26 | Missing English shows German with a note | PUB-AC-5.3 (Missing translation), PUB-F-29, PUB-U-4, PUB-E-5 | the four states of §10, example 3 | a visitor opens `/de/help/<id>` and `/en/help/<id>` for each state | the results are those of the example; the note "This page is not available in English." stands above German text under `/en`, and the German text is marked as German |
| PUB-T-27 | English edited without touching German | PUB-AC-5.4 (Maintained per language), PUB-F-30, PUB-F-5 | a help article published in German and English | the editor changes the English text and publishes it, and 60 s pass | `/en/help/<id>` shows the change; `/de/help/<id>` shows the old German text and the German state is still `published` |

### Integration Tests

End-to-end scenarios on the started `cms` and `web` units with a real content store and the stubs of §16 (session check, bot protection notice, clock).

| ID | Title | Covers | Given | When | Then |
| --- | --- | --- | --- | --- | --- |
| PUB-T-28 | Fresh installation to first edit | PUB-AC-1.1, PUB-AC-1.4, PUB-AC-1.5, PUB-AC-1.7, PUB-F-6, PUB-F-7, PUB-F-10 | an empty database and an empty cache | the stack starts, the status page is read, Ada registers, she creates the editor "Eli Editor", and Eli changes and publishes the English text of one help article | the pages show the seed content in both languages; the status page shows `cms` `degraded` until the registration and `ok` after; the change is public within 60 s |
| PUB-T-29 | Outage and recovery | PUB-AC-1.6, PUB-AC-4.5, PUB-F-8, PUB-F-25, PUB-F-32, PUB-E-1, PUB-E-3 | a `web` unit that loaded the landing page and the privacy policy, and another `web` unit that loaded nothing, `cms` stopped for both | visitors open the loaded pages and images, then the never-loaded changelog and privacy policy, and then `cms` is started again | loaded pages and images are served from held content; the never-loaded changelog is 503, the never-loaded privacy policy is the built-in legal text; within `CONTENT_REFRESH_SECONDS` after the restart the pages show the content of `cms` |
| PUB-T-30 | German-only content and legal rules | PUB-AC-5.3, PUB-AC-4.1, PUB-F-24, PUB-F-29, PUB-U-4, PUB-E-5, PUB-E-7 | a help article with German only, one with German draft and English published, and the legal pages | a visitor opens both articles in both languages, and editors try to unpublish German legal pages | the first is German with the note under `/en`, the second is 404 in both languages; every German unpublish of a legal page is refused with PUB-E-7 |
| PUB-T-31 | Identity unavailable | PUB-AC-2.6, PUB-F-12, PUB-F-33 | no `identity` unit started, a session cookie sent | a person opens `/`, `/de`, and `/en` | all three work as for a person without session: `/` redirects by browser language, `/de` and `/en` show the landing page, within `SESSION_CHECK_TIMEOUT_MS` plus the page time |
| PUB-T-32 | Editor life cycle and personal data | PUB-AC-1.3, PUB-NF-4, PUB-NF-5, PUB-NF-6, PUB-NF-7, PUB-NF-8, PUB-F-37, PUB-E-10, PUB-E-12 | an administrator and an editor who published two entries | the editor changes their own name, e-mail address, and password, tries to change another account, the administrator deletes the editor, and every public page and content response is read | the own change is saved; the other is refused with PUB-E-12; after the deletion the account has no name, e-mail address, or hash left, the two entries remain; no public page and no response of the content interface names an editor |
| PUB-T-33 | All public pages are clean | PUB-AC-2.2, PUB-NF-1, PUB-NF-2, PUB-NF-3, PUB-NF-6, PUB-U-1 | the seeded installation | every public page of §8 in both languages is requested without session, drawn in a browser at 320 pixels, checked with the accessibility checker, and its requests are recorded | no response sets a cookie; no request goes to another host than the own origin; no horizontal scrolling; 0 accessibility violations per page |
| PUB-T-34 | Invalid configuration | PUB-F-4, PUB-F-6 | `web` started with `CONTENT_REFRESH_SECONDS` 61 and a token of 31 characters, then with valid values | the unit starts | the first start prints the output of §10, example 11 and exits non-zero; the second accepts requests |
| PUB-T-35 | Images only through `web` | PUB-F-32, PUB-F-13, PUB-NF-2 | the seeded landing page | a visitor requests `/media/<id>` for each image of the page, and `cms` is asked for the same file directly without token | `web` answers with the file and its media type; `cms` refuses with PUB-E-2; an unknown id answers 404 without a page |

### Synthetic Test Data Strategy

All test data is synthetic; no real person, address, or text from a real installation is used (`G-1.N3` and the public repository).

- **Templates and variations.** One baseline per content type is the seed content of §8. A test varies one field of the baseline (a heading of 120 and 121 characters, a state, a missing language version, a position, a version number, a help context) and names the varied field. Entry texts are plain synthetic strings such as "Beispieltext 1" and "Sample text 1"; the strings that decide a result (search terms, the privacy text A and B, rich text lines) are those of §10.
- **Golden data files.** The tables of §10 are kept as stack-neutral data files next to the tests, one file per example: the first-visit table (example 1), the missing-translation table (example 3), the changelog entries and their order (example 9), the rich text lines and their structures (example 8), the help-context table (example 12), the meta table (example 13), and the configuration output (example 11). A test reads its file; the file is not duplicated inside test code. Expected structures of pages are stored as the list of blocks (kind, text, language), not as markup.
- **Binary files.** Images are generated in memory: a minimal valid PNG, JPEG, or WebP, padded to the exact byte count of the case (1 024; 1 048 576; 2 097 152; 2 097 153 bytes); the SVG and the PDF named `logo.png` are generated the same way. The seed images are generated graphics released under `CC0-1.0`.
- **Stubs with scripted answers.** The content interface stub answers a given `ContentGroupData`, a delay, or nothing; the session check stub answers `valid`, `none`, `unknown`, or a delay; the bot protection stub answers a notice text or none; the clock is set by the test.
- **Accounts.** Test accounts use the domain `example.org` ("Ada Admin", "Eli Editor") and passwords generated per test; no password is committed.

### CI Test Constraints

Mirrors [scaffolding.md](scaffolding.md) §17. No test calls a service on the internet or a language model; the tests read no clock but the injected one, so no test waits for 60 seconds. The unit tests of `web` and the module tests of `cms` that use no database run in the `test` job of the pipeline without network. Tests that need the started `cms` unit with its content store ([PUB-T-1], [PUB-T-3], [PUB-T-5], [PUB-T-7], [PUB-T-28], [PUB-T-29], [PUB-T-32], [PUB-T-35]) run where a container runtime is available; until the pipeline offers one they are run locally and their result is stated in the merge request. The accessibility checker and the viewport tests ([PUB-T-9], [PUB-T-33]) use the browser runner of [SCF-C-13]. The status-page half of [PUB-T-7] runs as soon as the status page shows the names of failed checks ([SCF-F-8] as changed in §15); until then only the health report half runs. The whole suite of the slice runs in less than 5 minutes.

### Test Coverage Matrix & Untested Justifications

Every acceptance criterion has its acceptance test, and the integration tests add end-to-end coverage:

| Story | Acceptance criterion | Acceptance test | Integration tests |
| --- | --- | --- | --- |
| PUB-US-1 | PUB-AC-1.1 to PUB-AC-1.7 | PUB-T-1 to PUB-T-7 | PUB-T-28, PUB-T-29, PUB-T-32, PUB-T-34, PUB-T-35 |
| PUB-US-2 | PUB-AC-2.1 to PUB-AC-2.6 | PUB-T-8 to PUB-T-13 | PUB-T-31, PUB-T-33 |
| PUB-US-3 | PUB-AC-3.1 to PUB-AC-3.4 | PUB-T-14 to PUB-T-17 | PUB-T-33 |
| PUB-US-4 | PUB-AC-4.1 to PUB-AC-4.6 | PUB-T-18 to PUB-T-23 | PUB-T-29, PUB-T-30 |
| PUB-US-5 | PUB-AC-5.1 to PUB-AC-5.4 | PUB-T-24 to PUB-T-27 | PUB-T-30 |

Every requirement of §4 to §6 and §9 is named in the *Covers* column of at least one test above (the check script reports a requirement that is not). Worked examples 1 to 13 each appear as a test: example 1 in [PUB-T-13] and [PUB-T-25]; 2 in [PUB-T-4]; 3 in [PUB-T-26]; 4 in [PUB-T-6]; 5 in [PUB-T-14]; 6 in [PUB-T-7]; 7 in [PUB-T-18]; 8 in the unit tests of `rich-text`; 9 in [PUB-T-15]; 10 in [PUB-T-10] and the unit tests of `content-model`; 11 in [PUB-T-34]; 12 in [PUB-T-16]; 13 in [PUB-T-12]. The capabilities of §7 are not tested by themselves; they are covered through the requirements that use them, except the checks written into their acceptance sentences, which the unit tests of `editor-accounts`, `rich-text`, and `page-frame` carry out.

| ID | Reason |
| --- | --- |
| PUB-NF-5 | The memory-hard property of the hashing function cannot be observed in a unit test; the tests check what can be observed (two hashes of one password differ, the hash does not contain the password), and the function itself is named and justified in `STACK.md` |
