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

## Round 3 — 2026-10-06 — team

Assumptions stated with the round, none rejected:

- **A6**: Handles are the GitLab usernames `trutscf1`, `schauby1`, `schwaigc`, `tschudea07`; PM approver and profile maintainer is `trutscf1`.
- **A7**: MR !1 is still open, so the new branches build on it; the team switch and the story files become two separate MRs into `dev`.

❓ **Q9** - **Umfang der Story-Dateien**: Wie sollen die 48 User Stories ins Repo, obwohl 13 Features noch kein Konzept haben? Options: Alle 48 mit Konzept-Entwürfen / Nur die R1-Stories jetzt / Alle 48 ohne Konzepte

➡️ Alle 48 mit Konzept-Entwürfen

> **Answer:** Alle 48 mit Konzept-Entwürfen (Recommended)

❓ **Q10** - **Sprache und Form**: In welcher Form sollen Story und Akzeptanzkriterien in den Dateien stehen? Options: Englisch, Given/When/Then / Deutsch, Given/When/Then / Deutsch, wörtlich

➡️ Englisch, Given/When/Then

> **Answer:** Englisch, Given/When/Then (Recommended)

❓ **Q11** - **GitLab-Issues**: Sollen die 48 Issues auf GitLab an die Story-Dateien angeglichen werden? Options: Später, nach dem Review / Jetzt angleichen / Nur Nummern eintragen

➡️ Später, nach dem Review

> **Answer:** Jetzt angleichen

## Round 4 — 2026-10-06 — delivery

❓ **Q12** - **Rollen in GOAL.md**: Fünf Stories nennen Rollen, die GOAL.md nicht kennt (Entwickler, Content-Redakteur, Besucher). Wie löse ich das? Options: Zwei Rollen ergänzen / Nur umformulieren / So lassen

➡️ Zwei Rollen ergänzen

> **Answer:** Zwei Rollen ergänzen (Recommended)

❓ **Q13** - **Weitere Punkte**: Welche der übrigen offenen Punkte soll ich zusätzlich selbst erledigen? Sie greifen in die Arbeit der Besitzer ein oder sind inhaltliche Entscheidungen. Options (multi-select): Slices schneiden / README schreiben / #1–#3 einordnen / Nichts davon

➡️ no recommendation

> **Answer:** Slices schneiden, README schreiben, #1–#3 einordnen

## Round 5 — 2026-10-06 — delivery

❓ **Q14** - **GitLab-Einstellungen**: Welche der bisher verweigerten Änderungen soll ich jetzt mit deinem Token vornehmen? Options (multi-select): main: Push für niemanden / dev schützen / Merge-Einstellungen / Epics versuchen

➡️ no recommendation

> **Answer:** main: Push für niemanden, dev schützen

## Round 6 — 2026-10-06 — delivery (implement #38, #85)

Assumptions stated with the round, none rejected:

- **A6**: The acceptance tests of #38 use the Node.js test runner (`node --test`) with TypeScript type stripping, because `STACK.md` has no test runner yet (SCF-C-13 is open) and TypeScript is mandatory (`docs/anforderungen_software_projekte.md`).
- **A7**: The units `identity`, `storage`, `worker`, `cms` and the packages `contracts`, `ui`, `config` are minimal TypeScript packages in this issue; their behavior comes with later issues. Strict typing (SCF-AC-1.2) and the quick start (SCF-AC-1.5) are slice 2, issue #102.

❓ **Q15** - **Verzeichnislayout**: Wie soll das Monorepo für SCF-AC-1.1 aufgebaut werden (die vorhandene Next.js-App liegt heute in next/)? Options: apps/ + packages/ / next/ behalten / Layout offen lassen

➡️ apps/ + packages/

> **Answer:** apps/ + packages/ (Recommended)

❓ **Q16** - **STACK.md**: Der Abschnitt 1 (Platform) gehört laut TEAM.md trutscf1 und ist noch _open_. Wie gehe ich damit um, da #38 Workspace, Task-Runner und Ordnerlayout festlegt? Options: In diesem Branch füllen / Nur im MR vorschlagen / Erst Fabian fragen

➡️ In diesem Branch füllen

> **Answer:** In diesem Branch füllen (Recommended)

❓ **Q17** - **Reihenfolge**: Mit welchem Issue soll ich beginnen? Beide bekommen einen eigenen feature-Branch von frisch gepulltem dev. Options: #38, dann #85 / #85, dann #38 / Parallel

➡️ #38, dann #85

> **Answer:** #38, dann #85 (Recommended)

## Round 7 — 2026-10-06 — delivery (revise !4, !5)

Fabian's reviews of !4 and !5 (not approved) are worked through under `/engineering-human revise`. The questions concern !5; they are logged here because this file ships with !4.

❓ **Q18** - **!5 SCF-AC-7.4**: Der Vertabelo-ER-Diagrammteil gehört zu SCF-US-4. Wie lösen wir Fabians Punkt, dass #85 sonst nicht erledigt ist? Options: Zweiter Slice / Kriterium ändern / So lassen

➡️ Zweiter Slice

> **Answer:** Zweiter Slice (Recommended)

❓ **Q19** - **Startbilder**: Fabian will keine Dritt-Logos im öffentlichen Repo. next.svg und vercel.svg stecken in der Starter-Seite page.tsx, file/globe/window.svg sind ungenutzt. Was soll passieren? Options: Ungenutzte löschen / Starter-Seite ersetzen / Nur dokumentieren

➡️ Ungenutzte löschen

> **Answer:** Ungenutzte löschen (Recommended)

❓ **Q20** - **MongoDB/SSPL**: Fabian will dafür ein Issue statt eines README-Hinweises. Soll ich es anlegen? Options: Issue anlegen / Nicht anlegen

➡️ Issue anlegen

> **Answer:** Issue anlegen (Recommended)

❓ **Q21** - **Antworten**: Soll ich jetzt die Antworten auf Fabians Kommentare in !4 und !5 posten und die neuen !4-Commits pushen? Options: Pushen und posten / Nur pushen / Noch nichts

➡️ Pushen und posten

> **Answer:** Pushen und posten (Recommended)

## Round 8 — 2026-10-13 — delivery (implement #68)

Asked under `/engineering-human implement 68` (DSA-US-1, slice 1). The concept `concepts/design-system.md` is still a draft, so these answers close the documentation gaps the slice needs. Stated assumptions: A1 the package is `@stash/ui` (the criterion named `@nimbus/ui`); A2 slice 1 ships the theme switcher as its Radix component; A3 the acceptance tests run with `node --test`, browser end-to-end tests stay with WEB-US-4; A4 without `GITLAB_TOKEN` the work stays local until push and MR are confirmed.

❓ **Q22** - **Themes**: Welche vier Themes soll DSA-AC-1.2 liefern (neben Hell und Dunkel)? Hoher Kontrast gehört zu DSA-US-2 und zählt hier nicht. Options: Hell, Dunkel, Sepia, Nacht / Hell, Dunkel, System, Sepia / Hell, Dunkel, Ozean, Wald

➡️ Hell, Dunkel, Sepia, Nacht

> **Answer:** Hell, Dunkel, Sepia, Nacht (Recommended)

❓ **Q23** - **Speichern**: DSA-AC-1.2 verlangt 'im Profil gespeichert', aber ein Benutzerprofil gibt es erst mit Identity (R3). Wie liefert Slice 1 das? Options: Cookie jetzt, Profil später / localStorage jetzt, Profil später / Auf Identity warten

➡️ Cookie jetzt, Profil später

> **Answer:** Cookie jetzt, Profil später (Recommended)

❓ **Q24** - **Commits**: Du willst viele einzelne Commits. Wie fein? Options: Ein Commit pro Schritt / Ein Commit pro AC

➡️ Ein Commit pro Schritt

> **Answer:** Ein Commit pro Schritt (Recommended)

❓ **Q25** - **Seams**: An welchen Schnittstellen teste ich #68 (node --test, Tests tragen die AC-ID)? (1) `tokens.css` in `@stash/ui`: jedes der vier Themes definiert denselben Token-Satz wie die Basis (AC-1.1/1.2); (2) `theme.ts` in `@stash/ui`: Theme-Namen, Cookie lesen/schreiben, `applyTheme` setzt `data-theme` am Wurzelelement (AC-1.2); (3) Struktur: `@stash/ui` hängt von Radix und Tailwind 4 ab, der ThemeSwitcher nutzt Radix, web lädt die Tokens (AC-1.3). Browser-Klicktest bleibt bei WEB-US-4. Options: Alle drei Seams / Nur (1) und (2) / Zusätzlich Render-Test

➡️ Alle drei Seams

> **Answer:** Alle drei Seams (Recommended)

❓ **Q26** - **Stufe R4**: Sobald R4 auf 'in progress' steht, verlangt doc-check in §17 des Konzepts einen Test für jedes der 16 Akzeptanzkriterien von DSA-US-1 bis -3 (sonst Fehler, die CI wird rot). Gebaut und getestet sind nur AC-1.1 bis 1.3; der Rest des Konzepts ist ungegrillt. Wie lösen wir das? Options: §17 jetzt schreiben / Stufe 'concept' lassen

➡️ §17 jetzt schreiben

> **Answer:** §17 jetzt schreiben (Recommended)

❓ **Q27** - **Push & MR**: Branch feature/68-design-tokens-and-themes (22 Commits, alles grün) pushen und das MR nach dev öffnen? Ohne GITLAB_TOKEN nur per git-Push-Option; Label und Beschreibung folgen per API. Options: Pushen + MR per Push-Option / Erst Token setzen / Nur pushen / Noch nichts

➡️ Pushen + MR per Push-Option

> **Answer:** Pushen + MR per Push-Option (Recommended)
