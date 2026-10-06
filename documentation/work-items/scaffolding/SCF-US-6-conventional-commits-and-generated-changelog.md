---
doc: story
format: engineering-human/2
title: "SCF-US-6 Conventional Commits and generated changelog"
audience: [product, developer, reviewer, agent]
id-prefix: "SCF"
---
# SCF-US-6 Conventional Commits and generated changelog

One user story of [Scaffolding & shared contracts](feature.md) and the acceptance criteria that decide when it is done. This file is the single source for both; the story issue copies them verbatim (P-DOC-6, P-TRK-2). The story was written by the team as tracker issue US-07 and brought into this form on 2026-10-06; its owner reviews the wording.

## User story

| ID | Title | As a | I want | so that | Priority |
| --- | --- | --- | --- | --- | --- |
| SCF-US-6 | Conventional Commits and generated changelog | team member | uniform commit messages and an automatically generated changelog | releases are documented in a way everyone can follow | Should |

## Acceptance criteria

| ID | Title | Given | When | Then |
| --- | --- | --- | --- | --- |
| SCF-AC-6.1 | Commit check | A developer's local clone | They create a commit | Commitlint checks the message against Conventional Commits in a git hook |
| SCF-AC-6.2 | Changelog from commits | The commits since the last release | The release merge request is prepared | A changelog draft for the new version is generated from them |
| SCF-AC-6.3 | Release tags | A release | It is published | Its tag follows SemVer (for example `v1.0.0`) and a GitLab Release with the changelog exists |

## Slices

The vertical slices that deliver this story. One slice is delivered by the story issue itself; every further slice is a child issue of it.

| Slice | Delivers | Blocked by | Issue |
| --- | --- | --- | --- |
| 1 — whole story | SCF-AC-6.1, SCF-AC-6.2, SCF-AC-6.3 | — | #44 |

- **Story issue:** #44
- **Weight:** 2
- **Depends on:** SCF-US-5 (CI pipeline with quality and security checks, #42)
