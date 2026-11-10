---
doc: goal
format: gam-ai-knowledge/1
title: Project goal
audience: [product, developer, reviewer, agent]
---
# Project Goal

What this project is for, in one sentence, for everyone who decides what gets built — product owners, developers, reviewers, and agents. It is the root of every document in `gam-ai-knowledge/`: everything else is derived from this page and must not contradict it (P-GOAL-1…3). Changing anything here is a deliberate decision: record an ADR, then re-check every roadmap feature, feature goal, and user story that depends on the changed part.

## Source

Project application: [link to the approved *Projektantrag* with its SMART goals, or "none"]. If it exists, `G-1` and the success signals below must be consistent with it (P-GOAL-1).

## G-1 — Goal

> [One sentence, at most 200 characters: who gets what outcome, and why it matters.]

Example of the form: *"Teachers create a graded quiz from their own slides in under 10 minutes, so that practice material keeps pace with the lessons."*

## Target users

| ID | User group (role) | What they need from the product |
| --- | --- | --- |
| R-1 | [role, e.g. teacher] | [need in one sentence] |

The role names in user stories (`As a …`) are taken from this table.

## Success signals

Measurable signs that G-1 is reached — at most three, each with a number.

| ID | Signal | Target |
| --- | --- | --- |
| G-1.S1 | [what is measured] | [value, unit, time frame] |

## Non-goals

What this project deliberately does not do. A feature, story, or requirement that conflicts with a non-goal is rejected, or the non-goal is changed first via ADR.

| ID | Non-goal | Why |
| --- | --- | --- |
| G-1.N1 | [excluded outcome] | [one sentence] |
