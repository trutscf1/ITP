---
doc: concept
format: engineering-human/2
title: "Public content: landing page, help center, changelog, legal pages"
audience: [product, developer, reviewer, agent]
id-prefix: "PUB"
serves: "G-1.S3"
---
# Public content: landing page, help center, changelog, legal pages Concept

The specification of roadmap feature R11, for its owner, its reviewers, and the agents that will implement it. **This is a first draft made on 2026-10-06 from the team's tracker issues, before any grilling:** it holds the feature goal, the link to the user stories, and one requirement per acceptance criterion. Its owner (trutscf1) sharpens it with `/engineering-human public-content`.

## 0. Synthesis Context

Path A (frontloaded). Phase 1 (grill) has not started; nothing in this document is approved.

Open before Phase 4: the requirements below repeat their acceptance criterion one to one and still name technology, which belongs in `STACK.md` (P-DES-4); user interaction, non-functional, and capability requirements, the data model, error conditions, worked examples, architecture, and the test concept (§5–§17) are not written yet.

## 1. Purpose & Goal Trace

**Feature goal:** Visitors and members read landing page, help center, changelog, and legal pages without login, and editors maintain them without code.

**Serves:** `G-1.S3` in [GOAL.md](../GOAL.md), as stated in the *Serves* column of [ROADMAP.md](../ROADMAP.md).

## 3. User Stories & Acceptance Criteria

The user stories and their acceptance criteria are the work items in [work-items/public-content/](../work-items/public-content/feature.md); they are not repeated here (P-DOC-6).

## 4. Functional Requirements

Draft, derived one to one from the acceptance criteria.

| ID | Title | Requirement | Derives from |
| --- | --- | --- | --- |
| PUB-F-1 | CMS container | Given the running stack, when it starts, the system MUST ensure that Strapi runs as a container with its own PostgreSQL database. | PUB-AC-1.1 (CMS container) |
| PUB-F-2 | Content types | Given a content editor in Strapi, when they create content, the system MUST ensure that the content types landing-page sections, help articles with categories, changelog entries, and legal pages exist. | PUB-AC-1.2 (Content types) |
| PUB-F-3 | Editor roles | Given Strapi, when it runs, the system MUST ensure that editor roles exist and the admin panel is not reachable publicly. | PUB-AC-1.3 (Editor roles) |
| PUB-F-4 | Cached delivery | Given a public page, when the frontend loads its content, the system MUST ensure that it comes from the Strapi API with caching (ISR). | PUB-AC-1.4 (Cached delivery) |
| PUB-F-5 | Seed content | Given a fresh local environment, when the seed runs, the system MUST ensure that example content exists for local development. | PUB-AC-1.5 (Seed content) |
| PUB-F-6 | Public and from the CMS | Given a visitor without an account, when they open the landing page, the system MUST ensure that the page is reachable without login and its content comes from Strapi. | PUB-AC-2.1 (Public and from the CMS) |
| PUB-F-7 | Responsive and accessible | Given the landing page, when it is opened on a small screen and checked with axe, the system MUST ensure that it is responsive, mobile first, and has no critical violation. | PUB-AC-2.2 (Responsive and accessible) |
| PUB-F-8 | Licence-free media | Given the landing page, when it shows images and icons, the system MUST ensure that all are licence-free and their sources are documented. | PUB-AC-2.3 (Licence-free media) |
| PUB-F-9 | Call to action | Given a visitor on the landing page, when they look for the next step, the system MUST ensure that a call to action leads to registration and login. | PUB-AC-2.4 (Call to action) |
| PUB-F-10 | Meta tags | Given the landing page, when a crawler reads it, the system MUST ensure that meta and Open Graph tags are set. | PUB-AC-2.5 (Meta tags) |
| PUB-F-11 | Help articles | Given the help center, when a member opens it, the system MUST ensure that the help articles are grouped by category and can be searched. | PUB-AC-3.1 (Help articles) |
| PUB-F-12 | Changelog page | Given the changelog page, when a member opens it, the system MUST ensure that the releases are shown in chronological order. | PUB-AC-3.2 (Changelog page) |
| PUB-F-13 | Contextual help | Given a member inside the app, when they follow a help link, the system MUST ensure that it leads to the article that fits the place they came from. | PUB-AC-3.3 (Contextual help) |
| PUB-F-14 | Public | Given a person without an account, when they open the help center or the changelog, the system MUST ensure that both are reachable. | PUB-AC-3.4 (Public) |
| PUB-F-15 | Footer links | Given a person without an account, when they use the footer, the system MUST ensure that imprint, terms, and privacy policy are reachable. | PUB-AC-4.1 (Footer links) |
| PUB-F-16 | Privacy content | Given the privacy policy, when a reader opens it, the system MUST ensure that it names all processed data and all services in use (for example captcha, OAuth providers). | PUB-AC-4.2 (Privacy content) |
| PUB-F-17 | Captcha notice | Given a page whose captcha badge is hidden, when a person opens it, the system MUST ensure that the prescribed notice text is visible. | PUB-AC-4.3 (Captcha notice) |
| PUB-F-18 | Maintained in the CMS | Given a content editor, when they change a legal page in the CMS, the system MUST ensure that the change appears on the public page. | PUB-AC-4.4 (Maintained in the CMS) |
