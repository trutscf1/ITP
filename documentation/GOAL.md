---
doc: goal
format: engineering-human/2
title: Project goal
audience: [product, developer, reviewer, agent]
---
# Project Goal

What this project is for, in one sentence, for everyone who decides what gets built — product owners, developers, reviewers, and agents. It is the root of every document in `documentation/`: everything else is derived from this page and must not contradict it (P-GOAL-1…3). Changing anything here is a deliberate decision: record an ADR, then re-check every roadmap feature, feature goal, and user story that depends on the changed part.

## Source

Project application: [docs/projektantrag.md](../docs/projektantrag.md), the agreed project proposal. `G-1` and the success signals below must be consistent with it (P-GOAL-1); the final presentation reports every deviation from it.

## G-1 — Goal

> Schools, clubs, and small companies store, organize, search, share, and use their files offline on their own server, so that their data stays under their control.

## Target users

| ID | User group (role) | What they need from the product |
| --- | --- | --- |
| R-1 | Member | A person in a school, club, or small company who uploads, organizes, finds, shares, and uses files offline, also with a screen reader, keyboard only, or high contrast. |
| R-2 | Operator | The person who runs the platform on the organisation's own infrastructure and needs to start it with one command and see errors and bottlenecks at once. |
| R-3 | Link recipient | A person without an account who opens a share link and needs to reach exactly the shared file or folder. |
| R-4 | Visitor | A person without an account who reads the public pages — landing page, help center, changelog, legal pages — to learn what the product offers and who operates it. |
| R-5 | Content editor | The person who maintains the public pages through the content management system, without changing code. |

The role names in user stories (`As a …`) are taken from this table.

## Success signals

Measurable signs that G-1 is reached — at most three, each with a number.

| ID | Signal | Target |
| --- | --- | --- |
| G-1.S1 | Self-hosting: the complete system starts on one own server | 1 command, 0 required services on the internet, shown at the final submission on 2027-04-06 |
| G-1.S2 | Accessibility: automated accessibility checks on every page of the web client | 0 violations in the pipeline of every release |
| G-1.S3 | Scope: the functional goals of the project application work in the final presentation | 6 of 6 functional goals demonstrated on 2027-04-06 |

## Non-goals

What this project deliberately does not do. A feature, story, or requirement that conflicts with a non-goal is rejected, or the non-goal is changed first via ADR.

| ID | Non-goal | Why |
| --- | --- | --- |
| G-1.N1 | Native desktop or mobile sync clients | Offline use is offered only through the installable web app. |
| G-1.N2 | Real-time co-editing of office documents | An online office is a product of its own and outside the project time. |
| G-1.N3 | Payment, billing, or pricing plans | The platform is self-hosted by its users; nothing is sold. |
| G-1.N4 | Production operation for external users with an availability guarantee | It is a school project without an operations team. |
| G-1.N5 | Own implementations of cryptographic algorithms | Established libraries are safer than self-written cryptography. |

End-to-end encryption and Kubernetes operation are optional extensions of the project application, not non-goals; they stand at the end of [ROADMAP.md](ROADMAP.md).
