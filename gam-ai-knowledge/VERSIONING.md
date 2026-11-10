---
doc: versioning
format: gam-ai-knowledge/1
title: Versioning
audience: [product, developer, agent]
---
# Versioning

How this project numbers its releases and what a version number promises to users, for anyone deciding whether an update is safe to install. The general rules come from the engineering profile (P-VER-1…3); this file records only what is specific to this project.

## In plain words

Version numbers have the form `MAJOR.MINOR.PATCH`, e.g. `0.3.1`. A higher PATCH only fixes bugs. A higher MINOR adds features. While MAJOR is `0`, any MINOR release may still change how things work; from `1.0.0` on, only a new MAJOR may break existing use.

## Project-specific rules

| Topic | Rule for this project |
| --- | --- |
| Current phase | 0.x (pre-release) |
| Data before 1.0 | Kept across migrations; the data is not declared disposable (P-VER-2) |
| Public contracts that count for compatibility | The HTTP request and response shapes and the job payload shapes in the contracts package, including the generated OpenAPI description (P-VER-3) |
| Release cadence | One release per sprint, `v0.<sprint>.0`; fixes between sprints raise PATCH (`WORKFLOW.md`, "Sprints and time budget") |

## Release history

The list of releases and their notes lives only in the GitLab Releases on the version tags (P-VER-1) — it is not copied here. `CHANGELOG.md` in the repo root is the curated changelog the school requires (`WORKFLOW.md`, "Changelog").
