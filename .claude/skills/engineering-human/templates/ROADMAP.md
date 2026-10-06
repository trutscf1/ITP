---
doc: roadmap
format: engineering-human/2
title: Roadmap
audience: [product, developer, reviewer, agent]
---
# Roadmap

The ordered list of features this project plans to build, for everyone who wants to know what comes next and why (P-ROAD-1). The order follows dependencies, not dates. Every entry is an intention that still goes through the concept process before anyone implements it. Only the lifecycle stage of each feature is tracked here; where work currently stands is in [ROADMAP-DETAILS.md](ROADMAP-DETAILS.md).

## Overview

| Version | Feature | Serves | Status | Depends on | Feasibility | Owner |
| --- | --- | --- | --- | --- | --- | --- |
| 0.1 | [feature name in plain words] | [part of `G-1` or `G-1.S<n>` (title)] | [idea / concept / ready / in progress / in dev / released] | [feature names or —] | [high / medium / low] | [handle — team mode only; delete the column in solo mode] |

*Serves* names the part of the project goal in [GOAL.md](GOAL.md) this feature advances. A feature that serves no part of the goal does not belong here (P-GOAL-2).

*Status* is one of these stages (P-ROAD-1) and is updated at every phase boundary, merge, and release (P-ROAD-4):

| Stage | Meaning |
| --- | --- |
| idea | Listed, no concept document yet |
| concept | Concept document in Phases 1–6 |
| ready | Concept approved, issues cut, nothing merged yet |
| in progress | At least one issue being implemented or merged, not all |
| in dev | All stories merged into `dev`, not yet released |
| released | Part of a release tag on `main` |

## Feature notes

### [Feature name]

- **What it gives users:** [one or two plain sentences]
- **Why this position:** [the dependency or reason that places it here]
- **Feasibility:** [what is known, what is risky, what needs a prototype]
- **Concept document:** [concepts/[feature].md](concepts/[feature].md) once it exists
