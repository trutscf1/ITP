---
doc: qa-log
format: engineering-human/2
title: "Question log — project"
audience: [developer, reviewer, agent]
---
# Question log — project

The verbatim record of every question round, for anyone who wants to know why a decision was made and who answered what (P-GRILL-2). Answers are quoted exactly and never rewritten; the distilled decisions live in the concept's §13 or in an ADR.

Question numbers continue from the highest `Q<n>` already in this file. Assumptions are numbered `A<n>` and become a question of the next round if rejected.

## Round 1 — 2026-10-06 — migrate

Assumptions stated with the inventory, none rejected:

- **A1**: "überarbeite dieses projekt auf diesen skill" means the migration from `engineering-profile` (`/engineering-human migrate`).
- **A2**: `dev` is created locally from `main`; the work happens on `concept/migrate-engineering-human`; nothing is pushed without a separate confirmation.
- **A3**: The school requirements in `docs/` keep precedence; the deviation "branches are kept after merge" and time tracking stay.
- **A4**: The predecessor's manifest template is no longer installed, so the project copy is compared with the new template by hand.
- **A5**: The switch to team mode is a second step of its own after this migration.

❓ **Q1** - **Fester erster Schritt**: Soll im Projekt stehen, dass jede Planungs-, Konzept- und Liefer-Session mit /engineering-human beginnt? Options: In CLAUDE.md / In CLAUDE.local.md / Nein

➡️ In CLAUDE.md

> **Answer:** In CLAUDE.md (Recommended)

❓ **Q2** - **Bestandsaufnahme**: Soll ich die Migration wie in der Tabelle vorgeschlagen durchführen? Options: Wie vorgeschlagen / Nur Dokumente / Abbrechen

➡️ Wie vorgeschlagen

> **Answer:** Wie vorgeschlagen (Recommended)

❓ **Q3** - **Projektziel G-1**: Welcher Wortlaut (höchstens 200 Zeichen) soll das Projektziel sein? Options: Datenhoheit ("Schools, clubs, and small companies store, organize, search, share, and use their files offline on their own server, so that their data stays under their control.") / Mit Barrierefreiheit / Auf Deutsch

➡️ Datenhoheit

> **Answer:** Datenhoheit (Recommended)

❓ **Q4** - **Modus**: Läuft das Projekt im Solo- oder im Team-Modus? Options: Team / Solo

➡️ Team

> **Answer:** Team (Recommended)

❓ **Q5** - **Merge-Einstellungen**: Welche Werte kommen in .claude/settings.json (Merge-Regel / Anzahl Freigaben / Release-Merge)? Options: ask / 1 / ask · approved / 1 / ask · approved / 2 / ask

➡️ ask / 1 / ask

> **Answer:** ask / 1 / ask (Recommended)

❓ **Q6** - **.gitlab-Ordner**: Wie gehe ich mit den vorhandenen Vorlagen und Label-Regeln in .gitlab/ um, die von denen des Skills abweichen? Options: Bestehende behalten / Durch Skill-Vorlagen ersetzen / Beides nebeneinander

➡️ Bestehende behalten

> **Answer:** Durch Skill-Vorlagen ersetzen

## Round 2 — 2026-10-06 — migrate

❓ **Q7** - **Abschluss der Migration**: Die Migration liegt uncommittet auf concept/migrate-engineering-human, beide Prüfungen laufen. Wie soll sie ins Repo? Options: Commit, Push und MR / Nur lokal committen / Nichts committen

➡️ Commit, Push und MR

> **Answer:** Commit, Push und MR (Recommended)

❓ **Q8** - **GitLab-Labels**: Soll ich die Labels auf GitLab jetzt an WORKFLOW.md angleichen? Das ändert die Labels an allen 48 User Stories. Options: Jetzt angleichen / Später

➡️ Jetzt angleichen

> **Answer:** Jetzt angleichen (Recommended)
