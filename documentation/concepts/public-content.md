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
- **Operator (`R-2`)**: gets legal pages that exist from the first start, as templates to fill in, and sees on the status page when nobody has claimed the admin panel yet.

## H3. How it works, step by step

1. The operator starts the system. Example content for every page is created in German and English ([PUB-AC-1.5] seed content). The legal pages hold templates with placeholders and say so in their first sentence ([PUB-AC-4.6] legal templates).
2. The status page shows the content unit as `degraded` until the first person registers as CMS administrator in the admin panel ([PUB-AC-1.7] unclaimed administrator). After that, only an administrator creates further editor accounts.
3. A visitor opens the address of the installation and lands on the landing page in German or English, chosen by their browser ([PUB-AC-5.2] first visit). A signed-in member lands on the dashboard instead ([PUB-AC-2.6] signed-in member).
4. From every page, the footer leads to imprint, terms, and privacy policy ([PUB-AC-4.1] footer links); a language switch opens the same page in the other language ([PUB-AC-5.1] language in the address).
5. In the help center, articles are grouped by category and can be searched ([PUB-AC-3.1] help articles). A help link inside the app opens the article assigned to that place ([PUB-AC-3.3] contextual help).
6. An editor changes an entry and publishes it. Within 60 seconds the public page shows the change ([PUB-AC-1.4] cached delivery).
7. If the content unit is down, every page keeps showing what it showed last ([PUB-AC-1.6] CMS unavailable). Legal pages are shown even if content was never loaded, from a text built into the product ([PUB-AC-4.5] built-in legal text).

## H4. What it deliberately does not do

- It does not translate the app itself; only the public pages are in two languages (§12).
- It does not copy `CHANGELOG.md` into the changelog page; editors write one entry per release by hand (§13, Q2).
- It does not let editors sign in with their member account; editor accounts are separate (§13, Q5).
- It does not track visitors and loads nothing from the internet ([PUB-NF-2] no internet requests, [PUB-NF-3] no tracking).
- It sells nothing: the terms page is a legal text, not a price list (`G-1.N3`).

## H5. How it is built, in plain words

The content lives in the `cms` unit as content entries: landing-page sections, help categories and articles, changelog entries, three legal pages, and images with their source and licence (§8). The `web` unit reads published entries, keeps the last version of every page, and renders the public pages. The architecture is written in Phase 5.

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

# Part S — Specification (normative)

## 0. Synthesis Context

### Development Path

Path A (frontloaded). Phase 1 (grill) was completed on 2026-10-06; Phases 2–6 are open. Not written yet: §11, §14–§17.

### Synthesis Dependencies

- [scaffolding.md](scaffolding.md) — the `cms` and `web` units, the reverse proxy, the health report, the status page, the content management capability [SCF-C-5].
- [design-system.md](design-system.md) — design tokens and themes of the public pages (story DSA-US-1).

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

## 3. User Stories & Acceptance Criteria

The user stories and their acceptance criteria are the work items in [work-items/public-content/](../work-items/public-content/feature.md); they are not repeated here (P-DOC-6).

## 4. Functional Requirements

| ID | Title | Requirement | Derives from |
| --- | --- | --- | --- |
| PUB-F-1 | Own content store | The `cms` unit MUST keep all content entries and editor accounts in a database of its own, which no other unit reads or writes. | PUB-AC-1.1 (CMS container) |
| PUB-F-2 | Content types | The `cms` unit MUST offer exactly the content types of §8: landing section, help category, help article, changelog entry, legal page, image. | PUB-AC-1.2 (Content types) |
| PUB-F-3 | Two roles | The `cms` unit MUST have exactly two roles. An editor MUST be able to create, edit, publish, and unpublish every content entry. A CMS administrator MUST be able to do the same and to create and delete editor accounts. An editor MUST NOT be able to create or delete editor accounts. | PUB-AC-1.3 (Editor roles) |
| PUB-F-4 | No anonymous access | The admin panel MUST be reachable under the proxy path prefix of `cms` and MUST show a person without an editor session only the login form. The content interface MUST answer only requests that carry the access token of the `web` unit and MUST refuse all others with [PUB-E-2] (unauthorized content request). | PUB-AC-1.3 (Editor roles) |
| PUB-F-5 | Draft and published | A content entry MUST be either draft or published, separately per content language. Public pages MUST show only published versions. | PUB-AC-1.4 (Cached delivery) |
| PUB-F-6 | Refresh interval | The `web` unit MUST show a published, changed, or unpublished content entry on its public page at most `CONTENT_REFRESH_SECONDS` seconds after the editor's action (configuration value, default 60). | PUB-AC-1.4 (Cached delivery), PUB-AC-4.4 (Maintained in the CMS) |
| PUB-F-7 | Seed on first start | When the `cms` unit starts and holds no content entry, it MUST create the seed content of §8 in German and English, all published. When it holds at least one content entry, it MUST NOT create, change, or delete any. | PUB-AC-1.5 (Seed content) |
| PUB-F-8 | Last version | When the content interface does not answer, the `web` unit MUST show every public page in the version it loaded last, as described in [PUB-E-1] (CMS unreachable). | PUB-AC-1.6 (CMS unavailable) |
| PUB-F-9 | Administrator check | The health report of `cms` MUST contain the non-essential dependency check `administrator-account`. It MUST be `down` while no CMS administrator exists and `ok` otherwise. | PUB-AC-1.7 (Unclaimed administrator) |
| PUB-F-10 | First administrator | While no CMS administrator exists, the admin panel MUST show a registration form; the first person who submits it becomes CMS administrator. Once one exists, the admin panel MUST NOT offer registration. | PUB-AC-1.7 (Unclaimed administrator) |
| PUB-F-11 | Landing page | The `web` unit MUST show the landing page at `/de` and `/en` to a person without a session. It MUST consist of the published landing sections in the order the editor set. | PUB-AC-2.1 (Public and from the CMS) |
| PUB-F-12 | Signed-in member | When a person with a valid member session opens `/`, `/de`, or `/en`, the `web` unit MUST redirect them to the dashboard. | PUB-AC-2.6 (Signed-in member) |
| PUB-F-13 | Source and licence | The `cms` unit MUST refuse to save an image without a source and a licence with [PUB-E-4] (image without licence). Icons that are part of the web client MUST be listed with source and licence in the repository. | PUB-AC-2.3 (Licence-free media) |
| PUB-F-14 | Call to action | A landing section of kind `call-to-action` MUST show one link to the registration page and one to the login page. The seed content MUST contain one such section. | PUB-AC-2.4 (Call to action) |
| PUB-F-15 | Meta tags | Every public page MUST carry a title, a description, and the Open Graph properties title, description, type, and address. Title and description come from the content entry; if a description is empty, the description of the first landing section of kind `hero` is used. | PUB-AC-2.5 (Meta tags) |
| PUB-F-16 | Help by category | The start page of the help center MUST list every help category that has at least one published article, in the editor's order, each with the titles of its published articles. Each title MUST link to the article's page. | PUB-AC-3.1 (Help articles) |
| PUB-F-17 | Help search | The help center MUST offer a search field. A search term of at least 2 characters MUST return every published help article of the current content language whose title or text contains the term, ignoring upper and lower case, titles matching first. | PUB-AC-3.1 (Help articles) |
| PUB-F-18 | Changelog order | The changelog page MUST show every published changelog entry with version, release date, title, and text, ordered by release date, newest first; entries with the same date are ordered by version, highest first. | PUB-AC-3.2 (Changelog page) |
| PUB-F-19 | Contextual help | The address `/<language>/help/context/<help context>` MUST redirect to the published help article assigned to that help context. If none is assigned, it MUST redirect to the start page of the help center ([PUB-E-6], unknown help context). A help context MUST be assigned to at most one help article. | PUB-AC-3.3 (Contextual help) |
| PUB-F-20 | Help and changelog public | The help center, every help article, and the changelog page MUST be shown to a person without a session. | PUB-AC-3.4 (Public) |
| PUB-F-21 | Footer links | Every page of the `web` unit, including login and registration, MUST show a footer with links to imprint, terms, and privacy policy. The three legal pages MUST be shown to a person without a session. | PUB-AC-4.1 (Footer links) |
| PUB-F-22 | Privacy content | The legal template of the privacy policy MUST contain one paragraph per kind of personal data the product stores (member accounts, editor accounts, uploaded files, audit log) and one per service on the internet that can be switched on (bot protection, each external login provider), each naming the data and its purpose. | PUB-AC-4.2 (Privacy content) |
| PUB-F-23 | Captcha notice | On every page that runs bot protection with a hidden badge, the `web` unit MUST show the notice text that the provider of the bot protection prescribes. When bot protection is switched off by configuration, it MUST NOT show the notice. The text is specified with the bot protection in the Identity concept (R3). | PUB-AC-4.3 (Captcha notice) |
| PUB-F-24 | Fixed legal pages | Exactly three legal pages MUST exist, with the kinds `imprint`, `terms`, and `privacy`. An editor MUST be able to edit them and MUST NOT be able to create a fourth or delete one. | PUB-AC-4.4 (Maintained in the CMS) |
| PUB-F-25 | Built-in legal text | When the `web` unit has never loaded a legal page from the content interface, it MUST show the built-in legal text of that page in the requested content language. | PUB-AC-4.5 (Built-in legal text) |
| PUB-F-26 | Legal templates | The seed content and the built-in legal text of each legal page MUST be the same legal template. It MUST mark every value the operator has to supply as `[[name of the value]]` and MUST start with the template notice of §8. | PUB-AC-4.6 (Legal templates) |
| PUB-F-27 | Language in the address | The address of every public page MUST start with the content language, `/de` or `/en`, and the page MUST be shown in that language. | PUB-AC-5.1 (Language in the address) |
| PUB-F-28 | First visit | When a person without a session opens `/`, the `web` unit MUST redirect to `/en` if the first language the browser prefers among German and English is English, and to `/de` in every other case. | PUB-AC-5.2 (First visit) |
| PUB-F-29 | Missing translation | When a content entry has no published English version, its page under `/en` MUST show the published German version together with the note of [PUB-U-4] (translation note). When it has no published German version, its page MUST behave as [PUB-E-5] (page not found) in both languages. | PUB-AC-5.3 (Missing translation) |
| PUB-F-30 | Separate language versions | The admin panel MUST let an editor edit and publish the German and the English version of a content entry separately; publishing one MUST NOT change the other. | PUB-AC-5.4 (Maintained per language) |

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

n/a — Phase 1 found no capability beyond the self-hosted content management system [SCF-C-5] of [scaffolding.md](scaffolding.md); the capabilities for content languages and the accessibility check are named in Phase 5 together with the architecture.

## 8. Data Model

Neutral record types. Every record has a surrogate `id`; references use it (P-DES-5). A field marked *per language* exists once for `de` and once for `en`; each language version has its own `state`.

```text
ContentState = enum(draft|published)
Language     = enum(de|en)

LandingSection {
  id: identifier,
  kind: enum(hero|feature|text-with-image|call-to-action),
  position: integer >= 1,            // unique; order on the landing page
  heading: text(1..120),             // per language
  body: rich text(0..2000),          // per language
  image: reference<Image>?,          // not allowed for kind call-to-action
  state: ContentState                // per language
}

HelpCategory {
  id: identifier,
  position: integer >= 1,            // unique
  name: text(1..60)                  // per language
}

HelpArticle {
  id: identifier,
  category: reference<HelpCategory>, // exactly one
  helpContext: HelpContext?,         // unique among help articles
  title: text(1..120),               // per language
  body: rich text(1..20000),         // per language
  description: text(0..160),         // per language; meta description
  state: ContentState                // per language
}

ChangelogEntry {
  id: identifier,
  version: text matching MAJOR.MINOR.PATCH,   // unique
  releaseDate: date,
  title: text(1..120),               // per language
  body: rich text(1..5000),          // per language
  state: ContentState                // per language
}

LegalPage {
  id: identifier,
  kind: enum(imprint|terms|privacy), // unique; exactly three records exist
  title: text(1..120),               // per language
  body: rich text(1..50000),         // per language
  state: ContentState                // per language
}

Image {
  id: identifier,
  file: binary,
  alternativeText: text(0..200),     // per language; empty only for decorative images
  source: text(1..300),              // where the image comes from; required
  licence: text(1..100)              // name of the licence; required
}

EditorAccount {
  id: identifier,
  name: text(1..100),
  email: e-mail address,             // unique
  passwordHash: text,
  role: enum(administrator|editor)
}

HelpContext = text matching [a-z0-9-]{1,64}
```

A help context names a place in the web client, not an article: it is declared in the shared contracts by the feature that places the help link, and a help article points to it. This concept declares none; the features of the web client add theirs.

**Template notice** (first sentence of every legal template):

- German: "Diese Seite ist eine Vorlage. Der Betreiber dieser Installation hat sie noch nicht ausgefüllt."
- English: "This page is a template. The operator of this installation has not filled it in yet."

**Seed content** (all published in both content languages): one landing section of each kind; two help categories with two articles each; one changelog entry for version `0.1.0`; the three legal pages with their legal templates; every image used, with source and licence.

**Addresses of the public pages** (`<l>` is `de` or `en`):

| Page | Address |
| --- | --- |
| Landing page | `/<l>` |
| Help center start | `/<l>/help` |
| Help article | `/<l>/help/<id of the help article>` |
| Help by context | `/<l>/help/context/<help context>` |
| Changelog | `/<l>/changelog` |
| Legal page | `/<l>/legal/<kind>` |

## 9. Error Conditions

| ID | Title | Trigger | Required behavior | Fallback | Derives from |
| --- | --- | --- | --- | --- | --- |
| PUB-E-1 | CMS unreachable | The content interface does not answer within `CONTENT_TIMEOUT_MS` (configuration value, default 2000) or answers with an error. | The `web` unit shows the last loaded version of the page and tries again at the next refresh interval. | A legal page never loaded: built-in legal text ([PUB-F-25]). Any other page never loaded: [PUB-E-3]. | PUB-AC-1.6 (CMS unavailable) |
| PUB-E-2 | Unauthorized content request | A request to the content interface carries no access token or a wrong one. | The `cms` unit answers "not authorized" and returns no content. | None. | PUB-AC-1.3 (Editor roles) |
| PUB-E-3 | Content unavailable | A public page other than a legal page was never loaded and the content interface does not answer. | The `web` unit answers "service unavailable" with a page saying "Inhalt derzeit nicht verfügbar." or "Content is currently unavailable.", including the footer of [PUB-F-21]. | None. | PUB-AC-1.6 (CMS unavailable) |
| PUB-E-4 | Image without licence | An editor saves an image with an empty source or an empty licence. | The `cms` unit refuses to save and names the empty field. | None. | PUB-AC-2.3 (Licence-free media) |
| PUB-E-5 | Page not found | An address names a language other than `de` or `en`, an unknown legal kind, or a help article that does not exist or has no published German version. | The `web` unit answers "not found" with a page in the language of the address, German if that language is unknown, including the footer of [PUB-F-21]. | None. | PUB-AC-5.1 (Language in the address) |
| PUB-E-6 | Unknown help context | No published help article is assigned to the help context in the address. | The `web` unit redirects to the start page of the help center in the same language. | None. | PUB-AC-3.3 (Contextual help) |

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

**Example 2 — refresh interval ([PUB-F-6]), with `CONTENT_REFRESH_SECONDS` = 60.** The privacy policy shows text A. At 10:00:00 an editor publishes text B. A visitor at 10:00:20 may see A or B; a visitor at 10:01:00 or later sees B.

**Example 3 — missing translation ([PUB-F-29]).**

| German version | English version | `/de/help/<id>` | `/en/help/<id>` |
| --- | --- | --- | --- |
| published | published | German text | English text |
| published | draft | German text | German text with the note of [PUB-U-4] |
| published | none | German text | German text with the note of [PUB-U-4] |
| draft | published | [PUB-E-5] | [PUB-E-5] |

**Example 4 — content unit down ([PUB-F-8], [PUB-F-25], [PUB-E-3]).**

| Page | Loaded before? | Shown while `cms` is down |
| --- | --- | --- |
| `/de/changelog` | yes, at 09:00 | version of 09:00 |
| `/de/changelog` | never | [PUB-E-3] "Inhalt derzeit nicht verfügbar." |
| `/en/legal/imprint` | yes, at 09:00 | version of 09:00 |
| `/en/legal/imprint` | never | built-in legal text in English |

**Example 5 — help search ([PUB-F-17], [PUB-U-3]).** Published German articles: "Dateien hochladen" (text mentions "Ordner") and "Ordner teilen". Under `/de/help`, the term `ordner` returns "Ordner teilen" first (title match), then "Dateien hochladen" (text match). The term `o` starts no search. The term `xyz` shows "Keine Hilfeartikel gefunden."

**Example 6 — administrator check ([PUB-F-9], [PUB-F-10]).** Fresh installation: the health report of `cms` holds the check `administrator-account` with `essential: false`, `status: down`, so the report's status is `degraded` ([SCF-F-6] of [scaffolding.md](scaffolding.md)). A person submits the registration form with name "Ada Admin" and e-mail `ada@example.org`: the editor account is created with role `administrator`, the check becomes `ok`, the status `ok`, and the admin panel shows only the login form from then on.

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
| Q10 | Unclaimed admin panel | Non-essential dependency check `administrator-account` in the health report of `cms`; the setup guide tells the operator to register right after the first start | Makes the risk of Q8 visible on the status page |
| Q11 | Shared understanding | Confirmed; work items and concept written | — |

Accepted risk of Q8: between the first start and the first registration, anyone who reaches the admin panel can become CMS administrator. [PUB-F-9] (administrator check) shows this state; it does not prevent it.

**Open questions for the school management** (legal; not decided by the team or an agent):

| Q | Title | Question |
| --- | --- | --- |
| Q12 | Operator of the team's installation | Who is named as operator in the imprint and as responsible party in the privacy policy of the team's own installation — the school or the project team? |
| Q13 | Lawful basis for editor accounts | On which lawful basis does an operator store name and e-mail address of content editors, and does the team's installation need a consent or an agreement for it? |
| Q14 | Review of the legal templates | Do the shipped legal templates need a review by the school before the final submission? |
