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

The content lives in the `cms` unit as content entries: landing-page sections, help categories and articles, changelog entries, three legal pages, and images with their source and licence (§8). The `web` unit reads published entries, keeps the last version of every page with its images, and renders the public pages. The feature touches ten existing parts of the system (§14); four of them need a change in another document (§15): a fresh installation may start as `degraded`, the status page names failed checks, the Identity concept supplies the captcha notice, and each release gets a step for the changelog entry. The architecture is written in Phase 5.

## H6. How we know it works

n/a — the test concept (§17) is written in Phase 6; until then every acceptance criterion has at least one requirement in §4–§6.

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

# Part S — Specification (normative)

## 0. Synthesis Context

### Development Path

Path A (frontloaded). Phase 1 (grill) and Phase 3 (artifact interactions) were completed on 2026-10-06. From Phase 2, the legal questions Q12–Q14 are still open with the school management (§13); they concern the content of the team's own installation, not the behavior specified here. Next is the Phase 4 review gate. Not written yet: §16, §17.

### Synthesis Dependencies

- [scaffolding.md](scaffolding.md) — the `cms` and `web` units, the reverse proxy, the health report, the status page, the content management capability [SCF-C-5].
- [design-system.md](design-system.md) — design tokens and themes of the public pages (story DSA-US-1).
- [identity.md](identity.md) — the member session ([PUB-F-12], [PUB-F-33]) and the bot protection with its notice text ([PUB-F-23]).

### Synthesis Scope

Nothing can be synthesized from this document yet: architecture (§16) and test concept (§17) are missing.

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
| PUB-F-16 | Help by category | The start page of the help center MUST list every help category that has at least one published article, in the editor's order, each with the titles of its published articles. Each title MUST link to the article's page. | PUB-AC-3.1 (Help articles) |
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
| Heading | a line starting with `## `, `### `, or `#### ` | a heading of level 2, 3, or 4; a line starting with `# ` is a paragraph |
| Bold | `**text**` | bold text |
| Italic | `*text*` | italic text |
| Unordered list | consecutive lines that start with a hyphen and a space | one list, one item per line |
| Ordered list | consecutive lines that start with a number, a full stop, and a space (`1.`, `2.`, and so on) | one numbered list, one item per line |
| Link | `[text](address)` where the address starts with `http://`, `https://`, `mailto:`, or `/` | a link; with any other start the whole sequence is plain text |

**Configuration.** Every value comes from the environment (P-DES-6, [SCF-NF-8]); a missing required value or one outside its range stops the unit as [SCF-E-1] (invalid configuration) of [scaffolding.md](scaffolding.md), naming the variable and the reason and never the value. The names are those of the example configuration ([SCF-F-17]).

| Name | Used by | Type | Default | Valid range | Boundary behavior |
| --- | --- | --- | --- | --- | --- |
| `CONTENT_REFRESH_SECONDS` | `web` | integer | 60 | 1 to 60 | 1 and 60 are accepted; 0 and 61 stop the unit |
| `CONTENT_TIMEOUT_MS` | `web` | integer | 2000 | 100 to 30000 | 100 and 30000 are accepted; 99 and 30001 stop the unit |
| `CONTENT_ACCESS_TOKEN` | `cms`, `web` | string, secret | none; the example configuration holds a dummy value | at least 32 characters, no spaces | 32 characters are accepted, 31 or none stop the unit; the value never appears in a log, a response, or a health report |
| `CMS_INTERNAL_URL` | `web` | string, address | the internal address of `cms` (port in [scaffolding.md](scaffolding.md) §8) | starts with `http://` or `https://` | anything else stops the unit |
| `PUBLIC_BASE_URL` | `web` | string, address | the origin of the local stack | starts with `http://` or `https://`, no trailing `/` | anything else stops the unit |
| `SESSION_CHECK_TIMEOUT_MS` | `web` | integer | 500 | 50 to 5000 | 50 and 5000 are accepted; 49 and 5001 stop the unit |
| `DASHBOARD_PATH` | `web` | string, path | `/dashboard` | starts with `/`; is not `/de` or `/en` and does not start with `/de/` or `/en/` | anything else stops the unit |
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

**Addresses of the public pages** (`<l>` is `de` or `en`):

| Page | Address |
| --- | --- |
| Landing page | `/<l>` |
| Help center start | `/<l>/help` |
| Help article | `/<l>/help/<id of the help article>` |
| Help by context | `/<l>/help/context/<help context>` |
| Changelog | `/<l>/changelog` |
| Legal page | `/<l>/legal/<kind>` |
| Image (no page, no language) | `/media/<id of the image>` |

## 9. Error Conditions

| ID | Title | Trigger | Required behavior | Fallback | Derives from |
| --- | --- | --- | --- | --- | --- |
| PUB-E-1 | CMS unreachable | The content interface does not answer within `CONTENT_TIMEOUT_MS` (configuration value, default 2000) or answers with an error. | The `web` unit shows the last loaded version of the page and tries again at the next refresh interval. | A legal page never loaded: built-in legal text ([PUB-F-25]). Any other page never loaded: [PUB-E-3]. | PUB-AC-1.6 (CMS unavailable) |
| PUB-E-2 | Unauthorized content request | A request to the content interface carries no access token or a wrong one. | The `cms` unit answers "not authorized" and returns no content. | None. | PUB-AC-1.3 (Editor roles) |
| PUB-E-3 | Content unavailable | A public page other than a legal page was never loaded and the content interface does not answer. | The `web` unit answers "service unavailable" with a page saying "Inhalt derzeit nicht verfügbar." or "Content is currently unavailable.", including the footer of [PUB-F-21]. | None. | PUB-AC-1.6 (CMS unavailable) |
| PUB-E-4 | Image without licence | An editor saves an image with an empty source or an empty licence. | The `cms` unit refuses to save and names the empty field. | None. | PUB-AC-2.3 (Licence-free media) |
| PUB-E-5 | Page not found | An address names a language other than `de` or `en`, an unknown legal kind, or a help article that does not exist or has no published German version. | The `web` unit answers "not found" with a page in the language of the address, German if that language is unknown, including the footer of [PUB-F-21]. | None. | PUB-AC-5.1 (Language in the address) |
| PUB-E-6 | Unknown help context | No published help article is assigned to the help context in the address. | The `web` unit redirects to the start page of the help center in the same language. | None. | PUB-AC-3.3 (Contextual help) |
| PUB-E-7 | Legal page must stay published | An editor or a CMS administrator tries to unpublish the German version of a legal page. | The `cms` unit refuses, leaves the page published, and says that a legal page must stay published in German. | None. | PUB-AC-4.1 (Footer links) |
| PUB-E-8 | Image not allowed | An editor saves an image file whose content is not PNG, JPEG, or WebP, or that is larger than 2 097 152 bytes. | The `cms` unit refuses to save and says which of the two limits was broken. | None. | PUB-AC-2.3 (Licence-free media) |
| PUB-E-9 | Registration closed | Someone submits the registration form of the admin panel while a CMS administrator exists, including the second of two submissions that arrive at the same time. | The `cms` unit refuses, creates no account, and says that registration is closed. | None. | PUB-AC-1.7 (Unclaimed administrator) |
| PUB-E-10 | Invalid editor data | An editor account is saved with a name, e-mail address, or password that breaks [PUB-F-37], or with an e-mail address another account uses. | The `cms` unit refuses to save and names the field. | None. | PUB-AC-1.3 (Editor roles) |

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

**Example 13 — meta tags ([PUB-F-15]).** `PUBLIC_BASE_URL` is `https://nimbus.example`; the first hero section has the German body "Nimbus speichert **Ihre** Dateien auf Ihrem eigenen Server."

| Page | Title | Description | `og:type` | `og:url` |
| --- | --- | --- | --- | --- |
| `/de/help/a1`, description "Wie Sie Dateien hochladen." | the article title | "Wie Sie Dateien hochladen." | `article` | `https://nimbus.example/de/help/a1` |
| `/de/help/a3`, empty description | the article title | "Nimbus speichert Ihre Dateien auf Ihrem eigenen Server." (plain text of the hero body) | `article` | `https://nimbus.example/de/help/a3` |
| `/de/changelog`, no hero section exists | "Änderungsprotokoll" | "Änderungsprotokoll" (the title) | `website` | `https://nimbus.example/de/changelog` |
| `/de`, hero body of 200 characters | the heading of the first hero section | its first 160 characters | `website` | `https://nimbus.example/de` |

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

Process questions that changed no behavior (Q15, Q21 to Q27, Q29) are only in the question log. The assumptions A37 to A51 of Phases 5 and 6 (configuration ranges, image limits, rich text markup, editor data rules, capabilities, slices) are in round 12 of the question log; the owner reviews them, and a rejected one becomes a numbered question.

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
| Page frame of `web` | The footer with the legal links appears on every page, also on pages other features build (login, dashboard, share links, status page). | A feature that builds its own page frame would lose the footer. Whether legal pages can be read offline is not decided here. | [PUB-F-21]; the footer is part of the one page frame of `web` (architecture, §16). Offline reading belongs to [offline-mode.md](offline-mode.md). |
| Member session ([identity.md](identity.md)) | `web` asks whether a visitor is a signed-in member ([PUB-F-12]). | Identity is built later and can be down; the landing page must still open. A person without a session gets no cookie ([PUB-NF-3]), so the language is carried by the address, never by a cookie. | [PUB-F-33], [PUB-F-27] |
| Bot protection ([IDN-F-5], captcha) | `web` places the notice the provider prescribes ([PUB-F-23]). | The Identity concept does not hold the notice text or a setting for the hidden badge yet. | Change to `identity.md` (§15) |
| Personal data of other features | The privacy template names every kind of personal data and every outside service ([PUB-F-22]). | The list goes stale when a feature stores a new kind of personal data, for example the IP address in the audit log ([TPM-AC-4.2]). | [PUB-F-22] extended; a feature that adds a kind of personal data adds its paragraph to the legal template in the same MR |
| Shared contracts ([SCF-F-9]) | Help contexts are declared there by the feature that places a help link (§8). | None: this feature declares no help context, and an undeclared one leads to the help center ([PUB-E-6]). | — |
| `CHANGELOG.md` and the release steps (`WORKFLOW.md`, "Releases") | The public changelog is written by hand (Q2), next to the generated developer changelog ([SCF-F-16]). | Nothing reminds the team to write the public entry at a release. | Release step (§15, Q19) |
| Scaffold on `dev` (`next/`, `docker-compose.yml`) | The application shows a placeholder page at `/`; the local stack has one relational database and no `cms` service. | The placeholder occupies the address of the landing page and links to hosts on the internet ([PUB-NF-2]). The content store must not share its data with another unit ([PUB-F-1]). | The placeholder is replaced with [PUB-US-2] (public landing page); the `cms` service and its content store are added with [PUB-US-1] (set up the headless CMS) |

## 15. Schema Extensions

**Contracts.** None. The health report contract of [scaffolding.md](scaffolding.md) §7 stays unchanged: the name of a dependency check is free text, so `content-store` and `administrator-account` need no new field. The content types of §8 are new and extend nothing.

**Required changes to other documents.** This concept does not edit documents of other owners (P-TEAM-4); each change is in the inbox of the handle named.

| Document | Change | Reason | Carried out by |
| --- | --- | --- | --- |
| [scaffolding.md](scaffolding.md), [SCF-NF-1] | New wording: the local stack MUST start without internet access with no unit `down`; a unit MAY be `degraded` only because of a non-essential check, and on a fresh installation that is exactly `administrator-account` of `cms`. | Q17 | `trutscf1`, with the migration of `scaffolding.md` (legacy format, P-DOC-5) |
| [scaffolding.md](scaffolding.md), [SCF-F-8] and [SCF-U-1] | The row of a unit whose status is not `ok` MUST also show, as text, the names of its dependency checks that are `down`. | Q18, [PUB-AC-1.7] | `trutscf1` in the concept (same migration); `schwaigc` in the status page (#16) |
| [identity.md](identity.md) | Specify the notice text the provider of the bot protection prescribes, in German and English, and the configuration value that hides the badge. | [PUB-F-23] | `tschudea07` |
| `WORKFLOW.md`, "Releases" | New step: a content editor writes and publishes the changelog entry of the release in the team's installation. | Q19 | `trutscf1`, in the MR that delivers [PUB-US-3] (help center and changelog) |
