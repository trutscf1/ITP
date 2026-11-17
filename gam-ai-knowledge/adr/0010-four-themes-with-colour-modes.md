---
doc: adr
format: gam-ai-knowledge/1
title: "Four themes with separate colour modes instead of the six themes of the profile"
audience: [product, developer, reviewer, agent]
status: proposed
date: "2026-11-17"
deciders: ["schwaigc"]
overrides: [P-DES-9]
supersedes: []
---
# ADR-0010 — Four themes with separate colour modes instead of the six themes of the profile

The number 0010 is provisional until the merge into `dev` (team mode, P-TEAM-5).

## In plain words

stash offers four themes (light, dark, sepia, night) and, separately, one colour mode (standard, high contrast, alternative colours red-green, alternative colours blue-yellow), a font size, and reduced motion. The engineering profile asks for six themes; this project does not follow it, because the project proposal names four themes and the modes as separate things.

## Context

The engineering profile rule P-DES-9 asks every app with a user interface for six colour themes (light, dark, high contrast, dark high contrast, colorblind-friendly, dark colorblind-friendly) and three font sizes. The project proposal ([docs/projektantrag.md](../../docs/projektantrag.md)) says otherwise: line 59 names "Design-Tokens mit vier UI-Systemen" (design tokens with four UI systems) and line 31 names "Hochkontrast, Farbenblind-Modi, reduzierte Animationen" (high contrast, colour-blind modes, reduced animation) as accessibility modes. Assumption: "vier UI-Systeme" is read as the four themes light, dark, sepia, and night; the proposal names none of them, and the grilling chose these four (Q378). Four themes plus modes is the proposal's model; it also keeps a high-contrast or alternative-colour palette independent of the brightness the member prefers. By the precedence rule of `CLAUDE.md`, `docs/` wins over a decision of `PROFILE.md`. The grilling of the concept [design-system.md](../concepts/design-system.md) (Q378, Q379, Q380, Q381) fixed the model; the story `DSA-US-1` (four themes, done) stays unchanged.

## Decision

- The themes are exactly four: light, dark, sepia, and night. High contrast, alternative colours, and reduced motion are modes, not themes.
- The colour mode is one choice with four values (standard, high contrast, alternative colours red-green, alternative colours blue-yellow); exactly one is active. Each non-standard mode exists as a light and a dark palette that follows the brightness of the theme: light and sepia use the light one, dark and night the dark one (six extra palettes).
- From P-DES-9 this project keeps: three font sizes (small, normal, large); without a stored choice the app follows the system's colour scheme, contrast, and motion preferences; interface labels describe the display, never the user ("Alternative colours", not "colour-blind"); components use only semantic colour tokens.
- Second deviation, from the third bullet of P-DES-9 ("a choice is kept on the device and, for a signed-in user, in the user's profile"): nothing is kept on the device for a visitor, and device values exist only while a session exists; a page drawn without a session ignores and deletes them (assumption A15 of the concept, §13). The reason is that preferences can point to a disability and a device may be shared.

## Consequences

- The test matrix is 4 themes × 4 colour modes = 16 combinations for the contrast, colour-distance, and automated accessibility checks of every page (`G-1.S2`).
- `DSA-US-1` keeps its behaviour: its four themes and its acceptance criteria stay valid. Its wording changed (the technology names in `DSA-AC-1.1`, `DSA-AC-1.3`, `DSA-AC-1.5`, the device rule in `DSA-AC-1.2` and `DSA-AC-1.6`, and the *so that*); its slice 3 (#112, theme in the profile) is still open and waits for the legal question L1. The colour modes are new work in `DSA-US-2`.
- The running-app proof of P-DES-8 screenshots each changed screen in the four themes in the standard colour mode, and in a mode when the change concerns it; this is narrower than the profile's six themes.
- The final presentation reports the deviation from P-DES-9 next to the other deviations (`WORKFLOW.md`, "Deviations from the project proposal"); the proposal itself is followed, so no deviation from it arises here.
- If the team later wants a high-contrast palette per theme, it supersedes this ADR; the concept lists it as out of scope (§12).

## Considered options

- **The six themes of P-DES-9.** One list to choose from, but it multiplies each colour need by the brightness choice, and it contradicts line 59 of the proposal. Rejected.
- **A separate high-contrast palette per theme.** Each of the four themes would get its own high-contrast palette (eight instead of two). Rejected: more palettes to measure for no stated need; a light and a dark palette keep the member's brightness (Q379).
